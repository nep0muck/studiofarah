"""Uploader checks; run with python3 -m unittest discover -s tests -v."""

from contextlib import redirect_stderr, redirect_stdout
import ftplib
import importlib.util
import io
import os
from pathlib import Path
import posixpath
import ssl
import sys
import tempfile
import unittest
from unittest.mock import Mock, patch


SCRIPT = Path(__file__).resolve().parents[1] / 'scripts' / 'deploy-ftps.py'
SPEC = importlib.util.spec_from_file_location('deploy_ftps', SCRIPT)
deploy_ftps = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = deploy_ftps
SPEC.loader.exec_module(deploy_ftps)


class MemoryFTP:
    """Small FTP server model: uploads, rename replacement, and existing files."""

    def __init__(self, *, context, timeout, encoding):
        self.context = context
        self.timeout = timeout
        self.encoding = encoding
        self.directories = {'/'}
        self.files = {'/site/keep-old.css': b'existing asset'}
        self.current = '/'
        self.protected = False
        self.closed = False
        self.publications = []
        self.deletions = []

    def connect(self, host, port, timeout):
        self.connection = (host, port, timeout)

    def login(self, username, password):
        self.logged_in = True

    def prot_p(self):
        self.protected = True

    def set_pasv(self, passive):
        self.passive = passive

    def pwd(self):
        return self.current

    def target(self, name):
        return posixpath.normpath(posixpath.join(self.current, name))

    def cwd(self, name):
        target = self.target(name)
        if target not in self.directories:
            raise ftplib.error_perm('550 No such directory')
        self.current = target

    def mkd(self, name):
        self.directories.add(self.target(name))

    def storbinary(self, command, stream, blocksize):
        if not self.protected:
            raise AssertionError('Unprotected upload attempted')
        self.files[self.target(command.removeprefix('STOR '))] = stream.read()

    def rename(self, original, target):
        original, target = self.target(original), self.target(target)
        self.files[target] = self.files.pop(original)
        self.publications.append(target)

    def delete(self, filename):
        target = self.target(filename)
        self.deletions.append(target)
        if target not in self.files:
            raise ftplib.error_perm('550 No such file')
        del self.files[target]

    def quit(self):
        pass

    def close(self):
        self.closed = True


class DeploymentTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name) / 'dist'
        self.root.mkdir()
        (self.root / 'index.html').write_text('<h1>Current site</h1>')
        (self.root / 'assets').mkdir()
        (self.root / 'assets/site.css').write_text('body { color: pink; }')
        (self.root / 'impressum').mkdir()
        (self.root / 'impressum/index.html').write_text('<h1>Impressum</h1>')
        self.env = {
            'HETZNER_FTP_HOST': 'hosting.example.org',
            'HETZNER_FTP_USERNAME': 'web-user',
            'HETZNER_FTP_PASSWORD': 'secret-value-never-log',
            'HETZNER_REMOTE_DIR': '/site',
        }

    def configuration(self):
        return deploy_ftps.read_configuration(self.env)

    def test_configuration_requires_explicit_target_and_credentials(self):
        for key in self.env:
            with self.subTest(missing=key):
                invalid = self.env.copy()
                del invalid[key]
                with self.assertRaises(deploy_ftps.DeploymentError):
                    deploy_ftps.read_configuration(invalid)
        self.assertEqual(self.configuration().port, 21)
        self.assertNotIn(self.env['HETZNER_FTP_PASSWORD'], repr(self.configuration()))

    def test_configuration_rejects_urls_traversal_and_command_injection(self):
        invalid_values = {
            'HETZNER_FTP_HOST': ['ftp://example.org', 'example.org:21', 'user@example.org', 'example.org\r\nDELE x'],
            'HETZNER_FTP_USERNAME': ['user\nPASS injected', 'user; command'],
            'HETZNER_FTP_PASSWORD': ['password\r\nDELE x'],
            'HETZNER_REMOTE_DIR': ['../site', '/site/../other', '.', '/site//other', 'site; DELE x', 'site\nDELE x', 'site/$(id)'],
            'HETZNER_FTP_PORT': ['0', '65536', '21\n', '21;id', '٢١'],
        }
        for key, values in invalid_values.items():
            for value in values:
                with self.subTest(key=key, value=value):
                    invalid = self.env | {key: value}
                    with self.assertRaises(deploy_ftps.DeploymentError):
                        deploy_ftps.read_configuration(invalid)

    def test_dry_run_needs_no_credentials_and_never_connects(self):
        network = Mock(side_effect=AssertionError('Network must not be used'))
        output = io.StringIO()
        with redirect_stdout(output):
            result = deploy_ftps.main(['--source', str(self.root), '--dry-run'], environ={}, ftp_factory=network)
        self.assertEqual(result, 0)
        network.assert_not_called()
        self.assertIn('assets/site.css', output.getvalue())
        self.assertIn('no network connection made', output.getvalue())

    def test_missing_or_empty_index_is_rejected_before_network(self):
        for value in [None, '']:
            with self.subTest(index=value):
                index = self.root / 'index.html'
                if value is None:
                    index.unlink()
                else:
                    index.write_text(value)
                network = Mock()
                with redirect_stderr(io.StringIO()):
                    result = deploy_ftps.main(['--source', str(self.root)], environ=self.env, ftp_factory=network)
                self.assertEqual(result, 1)
                network.assert_not_called()

    def test_symlink_files_directories_and_root_are_rejected(self):
        outside = Path(self.temp.name) / 'outside'
        outside.mkdir()
        (outside / 'secret').write_text('not deployable')
        for target in [outside, outside / 'secret']:
            link = self.root / 'linked'
            link.symlink_to(target)
            with self.assertRaises(deploy_ftps.DeploymentError):
                deploy_ftps.inspect_source(self.root)
            link.unlink()
        alias = Path(self.temp.name) / 'alias'
        alias.symlink_to(self.root, target_is_directory=True)
        with self.assertRaises(deploy_ftps.DeploymentError):
            deploy_ftps.inspect_source(alias)

    def test_source_control_characters_and_nonregular_files_are_rejected(self):
        invalid = self.root / 'bad\nname.css'
        invalid.write_text('bad')
        with self.assertRaises(deploy_ftps.DeploymentError):
            deploy_ftps.inspect_source(self.root)
        invalid.unlink()
        os.mkfifo(self.root / 'pipe')
        with self.assertRaises(deploy_ftps.DeploymentError):
            deploy_ftps.inspect_source(self.root)

    def test_unreadable_directory_does_not_produce_partial_inventory(self):
        def inaccessible(*args, **kwargs):
            kwargs['onerror'](PermissionError('private source path'))
            return iter(())
        with patch.object(deploy_ftps.os, 'walk', side_effect=inaccessible):
            with self.assertRaises(deploy_ftps.DeploymentError):
                deploy_ftps.inspect_source(self.root)

    def test_verified_tls_upload_preserves_old_files_and_publishes_html_last(self):
        server = None
        def factory(**kwargs):
            nonlocal server
            server = MemoryFTP(**kwargs)
            return server
        deploy_ftps.deploy(deploy_ftps.inspect_source(self.root), self.configuration(), factory)
        self.assertTrue(server.context.check_hostname)
        self.assertEqual(server.context.verify_mode, ssl.CERT_REQUIRED)
        self.assertTrue(server.protected)
        self.assertTrue(server.passive)
        self.assertTrue(server.closed)
        self.assertEqual(server.publications, ['/site/assets/site.css', '/site/impressum/index.html', '/site/index.html'])
        self.assertEqual(server.files['/site/keep-old.css'], b'existing asset')
        self.assertEqual(server.files['/site/index.html'], (self.root / 'index.html').read_bytes())
        self.assertEqual(server.deletions, [])
        self.assertFalse(any('.deploy-' in filename for filename in server.files))

    def test_replaced_source_file_cannot_upload_data_through_symlink(self):
        tree = deploy_ftps.inspect_source(self.root)
        victim = self.root / 'assets/site.css'
        victim.unlink()
        outside = Path(self.temp.name) / 'private'
        outside.write_text('private')
        victim.symlink_to(outside)
        server = MemoryFTP(context=ssl.create_default_context(), timeout=30, encoding='utf-8')
        with self.assertRaises(deploy_ftps.DeploymentError):
            deploy_ftps.deploy(tree, self.configuration(), lambda **kwargs: server)
        self.assertNotIn(b'private', server.files.values())
        self.assertTrue(server.closed)

    def test_rename_failure_does_not_delete_existing_site_or_leak_credentials(self):
        class RefusesRename(MemoryFTP):
            def rename(self, original, target):
                raise ftplib.error_perm('550 secret-value-never-log')
        server = RefusesRename(context=ssl.create_default_context(), timeout=30, encoding='utf-8')
        error = io.StringIO()
        with redirect_stderr(error):
            result = deploy_ftps.main(['--source', str(self.root)], environ=self.env, ftp_factory=lambda **kwargs: server)
        self.assertEqual(result, 1)
        self.assertNotIn(self.env['HETZNER_FTP_PASSWORD'], error.getvalue())
        self.assertIn('FTP 550', error.getvalue())
        self.assertEqual(server.files, {'/site/keep-old.css': b'existing asset'})
        self.assertTrue(all('/.deploy-' in path for path in server.deletions))

    def test_data_connections_require_tls_and_reuse_verified_control_session(self):
        client = deploy_ftps.SessionReuseFTP_TLS(context=ssl.create_default_context())
        self.addCleanup(client.close)
        with self.assertRaises(deploy_ftps.DeploymentError):
            client.ntransfercmd('STOR file')
        client._prot_p = True
        client.host = 'hosting.example.org'
        control = Mock(spec=ssl.SSLSocket)
        control.session = object()
        client.sock = control
        context = Mock()
        client.context = context
        raw = Mock()
        with patch.object(ftplib.FTP, 'ntransfercmd', return_value=(raw, 5)):
            result = client.ntransfercmd('STOR file')
        self.assertEqual(result, (context.wrap_socket.return_value, 5))
        context.wrap_socket.assert_called_once_with(raw, server_hostname=client.host, session=control.session)


if __name__ == '__main__':
    unittest.main()

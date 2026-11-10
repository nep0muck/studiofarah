#!/usr/bin/env python3
"""Upload one validated static build over verified, explicit FTPS."""

from __future__ import annotations

import argparse
import contextlib
from dataclasses import dataclass, field
import ftplib
import ipaddress
import os
from pathlib import Path, PurePosixPath
import re
import ssl
import stat
import sys
from typing import Mapping
import uuid


class DeploymentError(Exception):
    """A public error message that contains no credentials or server replies."""


@dataclass(frozen=True)
class SourceFile:
    relative: PurePosixPath
    size: int
    modified_ns: int
    inode: int


@dataclass(frozen=True)
class SourceTree:
    root: Path
    files: tuple[SourceFile, ...]


@dataclass(frozen=True)
class Configuration:
    host: str
    username: str
    password: str = field(repr=False)
    directory: str
    port: int = 21
    ca_file: str | None = None


def _control_characters(value: str) -> bool:
    return any(ord(character) < 32 or ord(character) == 127 for character in value)


def read_configuration(environ: Mapping[str, str]) -> Configuration:
    # GitHub's multiline variable editor can add a copied trailing line break.
    # Normalize formatting around the directory, never inside it or in passwords.
    environ = dict(environ)
    if 'HETZNER_REMOTE_DIR' in environ:
        environ['HETZNER_REMOTE_DIR'] = environ['HETZNER_REMOTE_DIR'].strip(' \t\r\n')
    required = (
        'HETZNER_FTP_HOST', 'HETZNER_FTP_USERNAME',
        'HETZNER_FTP_PASSWORD', 'HETZNER_REMOTE_DIR',
    )
    for name in required:
        if not environ.get(name):
            raise DeploymentError(f'Missing required setting: {name}.')
        if _control_characters(environ[name]):
            raise DeploymentError(f'Control characters are not allowed in {name}.')

    host = environ['HETZNER_FTP_HOST']
    try:
        ipaddress.ip_address(host)
    except ValueError:
        label = r'[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?'
        if len(host) > 253 or not re.fullmatch(rf'{label}(?:\.{label})*', host):
            raise DeploymentError('HETZNER_FTP_HOST must contain only a hostname or IP address.') from None

    username = environ['HETZNER_FTP_USERNAME']
    if not re.fullmatch(r'[A-Za-z0-9._@+-]{1,255}', username):
        raise DeploymentError('HETZNER_FTP_USERNAME contains unsupported characters.')

    port_text = environ.get('HETZNER_FTP_PORT', '21')
    if not re.fullmatch(r'[0-9]{1,5}', port_text) or not 1 <= int(port_text) <= 65535:
        raise DeploymentError('HETZNER_FTP_PORT must be an integer between 1 and 65535.')

    directory = environ['HETZNER_REMOTE_DIR']
    if directory != directory.strip() or not re.fullmatch(r'[A-Za-z0-9._ /-]+', directory):
        raise DeploymentError('HETZNER_REMOTE_DIR contains unsupported characters.')
    if directory != '/':
        parts = directory.lstrip('/').rstrip('/').split('/')
        if any(part in ('', '.', '..') or part != part.strip() for part in parts):
            raise DeploymentError('HETZNER_REMOTE_DIR must not contain traversal or ambiguous components.')
    directory = directory.rstrip('/') or '/'

    ca_file = environ.get('HETZNER_FTP_CA_FILE') or None
    if ca_file and (_control_characters(ca_file) or not Path(ca_file).is_file()):
        raise DeploymentError('HETZNER_FTP_CA_FILE must name a readable CA certificate file.')
    return Configuration(host, username, environ['HETZNER_FTP_PASSWORD'], directory,
                         int(port_text), ca_file)


def inspect_source(source: str | Path) -> SourceTree:
    path = Path(source)
    if '..' in path.parts or _control_characters(str(path)):
        raise DeploymentError('The source path must not contain traversal or control characters.')
    absolute = path.absolute()
    if any(part.is_symlink() for part in (absolute, *absolute.parents)):
        raise DeploymentError('Source paths must not contain symbolic links.')
    if not absolute.is_dir():
        raise DeploymentError('The source must be an existing build directory.')
    files = []
    def walk_failed(error):
        raise error
    try:
        for directory, directories, names in os.walk(absolute, followlinks=False, onerror=walk_failed):
            for name in directories + names:
                if _control_characters(name) or '\\' in name:
                    raise DeploymentError('Source filenames contain unsupported characters.')
                child = Path(directory, name)
                info = child.lstat()
                if stat.S_ISLNK(info.st_mode):
                    raise DeploymentError('The source build must not contain symbolic links.')
                if stat.S_ISREG(info.st_mode):
                    relative = PurePosixPath(child.relative_to(absolute).as_posix())
                    files.append(SourceFile(relative, info.st_size, info.st_mtime_ns, info.st_ino))
                elif not stat.S_ISDIR(info.st_mode):
                    raise DeploymentError('The source build must contain only regular files and directories.')
    except OSError:
        raise DeploymentError('The source build could not be inspected completely.') from None
    index = next((entry for entry in files if entry.relative.as_posix() == 'index.html'), None)
    if index is None or index.size == 0:
        raise DeploymentError('The source build must contain a nonempty index.html.')
    # Publish references only after assets; publish the homepage after other pages.
    files.sort(key=lambda entry: (
        entry.relative.suffix.lower() in ('.html', '.htm'),
        entry.relative.as_posix() == 'index.html', entry.relative.as_posix(),
    ))
    return SourceTree(absolute, tuple(files))


class SessionReuseFTP_TLS(ftplib.FTP_TLS):
    """Reuse the verified control connection's TLS session for protected data."""

    def ntransfercmd(self, cmd, rest=None):
        if not self._prot_p or not isinstance(self.sock, ssl.SSLSocket):
            raise DeploymentError('An encrypted FTPS data connection is required.')
        connection, size = ftplib.FTP.ntransfercmd(self, cmd, rest)
        try:
            connection = self.context.wrap_socket(
                connection, server_hostname=self.host, session=self.sock.session,
            )
        except Exception:
            connection.close()
            raise
        return connection, size


def _enter_directory(client, directory: str) -> None:
    if directory.startswith('/'):
        client.cwd('/')
    for part in PurePosixPath(directory).parts:
        if part == '/':
            continue
        try:
            client.cwd(part)
        except ftplib.error_perm as error:
            if not str(error).startswith('550'):
                raise
            client.mkd(part)
            client.cwd(part)


@contextlib.contextmanager
def _open_source_file(tree: SourceTree, entry: SourceFile):
    """Use no-follow directory descriptors to reject replaced files or parents."""
    descriptors = []
    try:
        directory_flags = os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW
        descriptors.append(os.open(tree.root, directory_flags))
        for part in entry.relative.parts[:-1]:
            descriptors.append(os.open(part, directory_flags, dir_fd=descriptors[-1]))
        descriptor = os.open(entry.relative.name, os.O_RDONLY | os.O_NOFOLLOW,
                             dir_fd=descriptors[-1])
        with os.fdopen(descriptor, 'rb') as stream:
            info = os.fstat(stream.fileno())
            if (not stat.S_ISREG(info.st_mode) or info.st_size != entry.size
                    or info.st_mtime_ns != entry.modified_ns or info.st_ino != entry.inode):
                raise DeploymentError('The source changed during deployment; upload stopped.')
            yield stream
            after = os.fstat(stream.fileno())
            if after.st_size != entry.size or after.st_mtime_ns != entry.modified_ns:
                raise DeploymentError('The source changed during deployment; upload stopped.')
    except OSError:
        raise DeploymentError('A source file changed or became unreadable; upload stopped.') from None
    finally:
        for descriptor in reversed(descriptors):
            os.close(descriptor)


def deploy(tree: SourceTree, configuration: Configuration,
           ftp_factory=SessionReuseFTP_TLS) -> None:
    client = None
    operation = 'initialize TLS'
    try:
        context = ssl.create_default_context()
        if configuration.ca_file:
            context.load_verify_locations(cafile=configuration.ca_file)
        client = ftp_factory(context=context, timeout=30, encoding='utf-8')
        operation = 'connect to server'
        client.connect(configuration.host, configuration.port, timeout=30)
        operation = 'TLS authentication'
        client.login(configuration.username, configuration.password)
        operation = 'protect the data connection'
        client.prot_p()
        client.set_pasv(True)
        operation = 'enter the target directory'
        _enter_directory(client, configuration.directory)
        root = client.pwd()
        for entry in tree.files:
            operation = 'enter a deployment subdirectory'
            client.cwd(root)
            _enter_directory(client, entry.relative.parent.as_posix())
            temporary = f'.deploy-{uuid.uuid4().hex}.tmp'
            try:
                with _open_source_file(tree, entry) as stream:
                    operation = f'upload {entry.relative.as_posix()}'
                    client.storbinary(f'STOR {temporary}', stream, blocksize=65536)
                operation = f'rename {entry.relative.as_posix()}'
                client.rename(temporary, entry.relative.name)
            except Exception:
                # This name belongs to this upload, never to an existing site file.
                with contextlib.suppress(*ftplib.all_errors):
                    client.delete(temporary)
                raise
        with contextlib.suppress(*ftplib.all_errors):
            client.quit()
    except ssl.SSLCertVerificationError:
        raise DeploymentError('FTPS certificate verification failed; upload stopped.') from None
    except ftplib.error_perm as error:
        code = str(error)[:3]
        suffix = f' (FTP {code})' if re.fullmatch(r'[0-9]{3}', code) else ''
        raise DeploymentError(f'The FTPS server refused to {operation}{suffix}; upload stopped.') from None
    except ftplib.all_errors:
        raise DeploymentError(f'The FTPS connection failed during {operation}; check the connection and TLS configuration.') from None
    finally:
        if client is not None:
            client.close()


def main(argv=None, environ=None, ftp_factory=SessionReuseFTP_TLS) -> int:
    effective_environ = os.environ if environ is None else environ
    def report(message):
        print(message, file=sys.stderr)
        if effective_environ.get('GITHUB_ACTIONS') == 'true':
            escaped = message.replace('%', '%25').replace('\r', '%0D').replace('\n', '%0A')
            print(f'::error title=Hetzner FTPS upload::{escaped}', file=sys.stderr)
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', default='dist', help='Static build directory (default: dist)')
    parser.add_argument('--dry-run', action='store_true', help='Validate and list files without any network access')
    args = parser.parse_args(argv)
    try:
        tree = inspect_source(args.source)
        total = sum(entry.size for entry in tree.files)
        if args.dry_run:
            for entry in tree.files:
                print(f'{entry.size:>10}  {entry.relative.as_posix()}')
            print(f'Dry run: {len(tree.files)} files, {total} bytes; no network connection made.')
            return 0
        configuration = read_configuration(effective_environ)
        deploy(tree, configuration, ftp_factory=ftp_factory)
        print(f'Uploaded {len(tree.files)} files ({total} bytes) over verified FTPS.')
        return 0
    except DeploymentError as error:
        report(f'Deployment failed: {error}')
        return 1
    except Exception:
        # Never echo a library exception: server messages may include credentials.
        report('Deployment failed because of an unexpected local error.')
        return 1


if __name__ == '__main__':
    raise SystemExit(main())

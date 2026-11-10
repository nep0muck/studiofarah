# GitHub → Hetzner Webhosting

Diese Astro-Webseite wird statisch gebaut. Hetzner liefert nur Dateien aus `dist/` aus; dort sind weder Node.js noch Datenbank oder ein eigener Rootserver erforderlich. PDFs und QR-Codes werden während des GitHub-Builds erzeugt.

Der Upload verwendet **explizites FTPS mit geprüftem TLS-Zertifikat und verschlüsselten Datenverbindungen**. Er benötigt keinen SSH-/Shellzugang. Vor Aktivierung im gebuchten Webhostingpaket den FTPS-Zugang, die Domainzuordnung, den Dokumentenordner und HTTPS prüfen. Aktuelle Tarifdetails konnten während der Einrichtung wegen der Netzwerkfreigabe nicht von Hetzner abgerufen werden.

## Einmalige Einrichtung

1. Bei Hetzner die Domain einem eigenen leeren Webseitenverzeichnis zuordnen. Ein separates FTP-Login auf dieses Kundenverzeichnis beschränken. Den vorhandenen Webauftritt vor einer Ablösung sichern. DNS und HTTPS werden in der Hosting-/Domainverwaltung eingerichtet; dieser Workflow ändert sie nicht.
2. Im GitHub-Repository `nep0muck/studiofarah` unter **Settings → Secrets and variables → Actions** die folgenden Werte hinterlegen. Zugangsdaten niemals im Chat, in Git-Dateien oder in Workflow-Logs eingeben.

### Repository variables

| Name | Inhalt |
| --- | --- |
| `HETZNER_FTP_HOST` | Der von Hetzner angegebene FTP-Servername, ohne `ftp://`, Port oder Pfad. Er muss zum TLS-Zertifikat passen. |
| `HETZNER_REMOTE_DIR` | Der bestätigte Zielordner, wie er für dieses FTP-Login sichtbar ist. Kein pauschaler Vorgabepfad wird angenommen. |
| `HETZNER_DEPLOY_ENABLED` | Für die erste Aktivierung `true` setzen. Ein anderer Wert pausiert Uploads; Builds laufen weiter. |

### Repository secrets

| Name | Inhalt |
| --- | --- |
| `HETZNER_FTP_USERNAME` | Das FTP-Login für diese Webseite. |
| `HETZNER_FTP_PASSWORD` | Das zugehörige Passwort. |

Der Standardport ist 21 für explizites FTPS. **SFTP ist ein anderes Protokoll und wird von diesem Uploadskript nicht verwendet.** Der gültige Zielpfad hängt vom FTP-Login und dessen Verzeichnisbeschränkung ab. `/` ist nur dann richtig, wenn der bestätigte FTP-Stammordner bereits das Dokumentenverzeichnis der Domain ist.

3. GitHub Actions für das Repository aktivieren, falls noch deaktiviert. Nach dem Setzen der Werte unter **Actions → Build and deploy to Hetzner → Run workflow** den Branch `main` starten. Anschließend den erfolgreichen Upload und die öffentliche Domain einschließlich PDF-Download prüfen. Eine erfolgreiche lokale Prüfung ersetzt diese erste echte Hetzner-Verbindung nicht.

## Laufender Ablauf

1. Website oder Preise ändern, lokal mit `npm run build` prüfen.
2. Änderungen committen und nach `main` pushen. Für fertige, über den Assistenten beauftragte Änderungen ist dies als Standard in `AGENTS.md` dokumentiert. Bei einem ausdrücklichen Entwurfs-/Prüfauftrag wird nicht veröffentlicht.
3. GitHub führt `npm ci`, PDF-/QR-Erzeugung, Astro-Build und Deployment-Prüfungen aus. Nur bei Erfolg und aktivierter Konfiguration folgt der Upload.

Pull Requests laden nichts auf den Webserver. Uploads laufen nacheinander; ein laufender Upload wird nicht durch einen neuen Push unterbrochen. Neue Assets werden vor HTML übertragen. Jede Datei wird zunächst unter einem temporären Namen hochgeladen und dann umbenannt. Der Ablauf ist kein atomarer Austausch der gesamten Website.

Nur die Build-Dateien werden übertragen. Bereits vorhandene Dateien werden bei gleichen Namen ersetzt; fremde Dateien und alte Assets werden nicht pauschal gelöscht. Deshalb das Ziel ausschließlich für diese Webseite verwenden. Eine ältere Version lässt sich über einen Git-Revert und erneuten erfolgreichen Build veröffentlichen.

## Lokale Prüfungen

```bash
npm ci
npm run build
python3 -m unittest discover -s tests -v
python3 scripts/deploy-ftps.py --source dist --dry-run
```

Der Dry Run prüft nur den lokalen Build und überträgt nichts. Die eigentliche Verbindung benötigt die oben genannten Umgebungsvariablen. Zertifikats- oder Loginfehler führen zum Abbruch; es gibt keinen unverschlüsselten Fallback. Die optionale Variable `HETZNER_FTP_CA_FILE` erlaubt eine zusätzliche vertrauenswürdige CA-Datei für lokale Integrationstests oder eine eigene CA; in GitHub wird normalerweise der System-Zertifikatsspeicher genutzt.

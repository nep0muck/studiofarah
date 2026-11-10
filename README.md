# Studio Farah – Webseitenentwurf

Statische Singlepage-Webseite mit Astro und Tailwind CSS. Alle Angebote, die Vorstellung des Studios, Preise und Kontakt stehen auf der Startseite. Impressum und Datenschutz sind separate Seiten.

## Setup

```bash
npm ci
npm run dev
```

Node.js ab 22.12 verwenden; für GitHub Actions ist die getestete Version 24.22.1 festgelegt. `npm ci` stellt über `postinstall` automatisch die zur Lockdatei passende Vite-Version für Astro und Tailwind her. Manuelle Änderungen unter `node_modules` sind nicht erforderlich.

## Struktur

```txt
src/
  components/
    layout/
      Navigation.astro
      Footer.astro
    sections/
      Hero.astro
      Treatments.astro
      About.astro
      PriceList.astro
      Contact.astro
  data/
    site.ts                 # Texte, Kontakt, Behandlungen und Preise
  layouts/
    BaseLayout.astro
  pages/
    index.astro
    impressum.astro
    datenschutz.astro
  styles/
    global.css              # Farben, Schriften und gemeinsame Klassen
public/
  logo-studio-farah.png
  robots.txt
```

## Inhalte und Gestaltung anpassen

Die zentralen Daten für Name, Kontaktdaten, Navigation, Behandlungen und Preise liegen in:

```txt
src/data/site.ts
```

Farben und gemeinsame Gestaltung werden in `src/styles/global.css` gepflegt. Es werden Systemschriften verwendet; externe Schriften oder zusätzliche JavaScript-Frameworks sind nicht erforderlich. Die einzige Interaktion ist das kleine mobile Navigationsmenü.

## Preisliste, PDF und QR-Code

Die Webseite und die PDF-Preisliste nutzen dieselben `priceSections` aus `src/data/site.ts`. Bei Preisänderungen dort auch `priceListInfo.updatedAt` aktualisieren. `npm run dev` und `npm run build` erzeugen die Downloads automatisch neu; sie müssen nicht zusätzlich von Hand bearbeitet werden. Nur die Downloads neu erstellen:

```bash
npm run generate:prices
```

`scripts/generate-price-assets.mjs` erzeugt lokal mit `pdf-lib` und `qrcode`:

- `public/downloads/studio-farah-preisliste.pdf`: A4-Preisliste mit Datum, Kontakt und QR-Code.
- `public/downloads/studio-farah-flyer.pdf`: A6-Flyer-Entwurf mit Telefonnummer und QR-Code, ohne feste Preise.
- `public/downloads/studio-farah-qr-code.svg` und `.png`: QR-Code zum Einsetzen in eigene Druckvorlagen.

Die Dateien sind generiert und deshalb nicht versioniert; der Build kopiert sie nach `dist/downloads/`. Für den Build werden auch die Entwicklungsabhängigkeiten benötigt. Der Generator verwendet Nodes TypeScript-Unterstützung mit `--experimental-strip-types` (Node ab 22.12).

Der QR-Code führt direkt zu `https://studiofarah.de/#preise`. Dieser Link soll stabil bleiben. Er lädt keinen externen QR- oder Trackingdienst; die neue Preisliste ist auf der Domain erst nach Veröffentlichung der Webseite verfügbar. Gedruckte oder zuvor heruntergeladene Preislisten behalten ihre alten Preise. Der Flyer enthält bewusst keine Preise und lässt sich bei Preisänderungen weiterverwenden. Er ist ein Gestaltungsentwurf ohne druckereispezifische Beschnitt- oder Farbprofilvorgaben.

Das Logo in `public/logo-studio-farah.png` ist eine mit Bildgenerierung nachgezeichnete Fassung der vom Nutzer gezeigten Vorlage, keine unveränderte Originaldatei. Es wird über `src/components/ui/StudioLogo.astro` im Kopf- und Fußbereich sowie als Favicon und in den strukturierten Daten eingebunden. Die ursprüngliche stilisierte Form bleibt dunkel, die Wortmarke pink. Die Nachbildung vor Veröffentlichung mit der Kundin abgleichen oder die Originaldatei an derselben Stelle einsetzen. Kontaktdaten, Öffnungszeiten und Preise bestätigen sowie die Platzhalter in Impressum und Datenschutz vervollständigen.

Der Entwurf verwendet ausschließlich zwei vorhandene Aufnahmen der Studioräume ohne anwesende Personen. Die Bildauswahl steht zentral unter `studioImages` in `src/data/site.ts`; sie wird auch für die Linkvorschau und die strukturierten Daten verwendet. Die bisherigen Personenbilder werden nicht eingebunden. Originaldateien bleiben im Projekt erhalten.

## Build

```bash
npm run build
npm run preview
```

## Veröffentlichung auf Hetzner

Der Workflow `.github/workflows/deploy.yml` baut und prüft Änderungen auf GitHub. Nach einmaliger Einrichtung veröffentlicht jeder Push nach `main` die erzeugten Dateien einschließlich PDFs und QR-Codes per FTPS. Pull Requests bauen und testen ausschließlich. Zugangsdaten werden als GitHub-Secrets gepflegt und gehören nicht in den Quellcode.

Einrichtung und benötigte Einstellungen: [docs/deployment.md](docs/deployment.md).

# Studio Farah – Astro/Tailwind Grundgerüst

Statische Singlepage-Webseite mit Astro und Tailwind CSS.

## Setup

```bash
npm install
npm run dev
```

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
      PriceList.astro
      Contact.astro
  data/
    site.ts
  layouts/
    BaseLayout.astro
  pages/
    index.astro
    impressum.astro
    datenschutz.astro
  styles/
    global.css
public/
  favicon.svg
  robots.txt
```

## Inhalte anpassen

Die zentralen Platzhalter für Name, Kontaktdaten, Navigation, WhatsApp und Behandlungen liegen in:

```txt
src/data/site.ts
```

## Build

```bash
npm run build
npm run preview
```

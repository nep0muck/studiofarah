import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { PDFDocument, PDFName, PDFString, StandardFonts, rgb } from 'pdf-lib';
import QRCode from 'qrcode';
import { site, priceSections, priceListInfo } from '../src/data/site.ts';

const color = {
  pink: rgb(173 / 255, 40 / 255, 91 / 255),
  ink: rgb(52 / 255, 41 / 255, 47 / 255),
  muted: rgb(107 / 255, 88 / 255, 98 / 255),
  line: rgb(234 / 255, 221 / 255, 227 / 255),
};
const phone = site.phoneDisplay.replace(/^\+49 /, '0');
const website = new URL(site.url).hostname;
const [year, month, day] = priceListInfo.updatedAt.split('-');
const priceDate = `${day}.${month}.${year}`;
const qr = QRCode.create(priceListInfo.url, { errorCorrectionLevel: 'M' });
const logoBytes = await readFile(new URL('../public/logo-studio-farah.png', import.meta.url));

function wrap(text, font, size, width) {
  const lines = [];
  let line = '';
  for (const word of text.trim().split(/\s+/)) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && font.widthOfTextAtSize(candidate, size) > width) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function text(page, value, x, top, font, size, options = {}) {
  page.drawText(value, { x, y: top - size, font, size, color: color.ink, ...options });
}

function paragraph(page, value, x, top, width, font, size = 12, leading = 16, options = {}) {
  const lines = wrap(value, font, size, width);
  lines.forEach((line, i) => text(page, line, x, top - i * leading, font, size, options));
  return lines.length * leading;
}

function drawQr(page, x, y, size) {
  // The four-module white quiet zone is part of the printed symbol.
  const margin = 4;
  const count = qr.modules.size;
  const cell = size / (count + margin * 2);
  page.drawRectangle({ x, y, width: size, height: size, color: rgb(1, 1, 1) });
  for (let row = 0; row < count; row++) {
    for (let column = 0; column < count; column++) {
      if (qr.modules.get(row, column)) {
        page.drawRectangle({
          x: x + (column + margin) * cell,
          y: y + (count + margin - row - 1) * cell,
          width: cell,
          height: cell,
          color: rgb(0, 0, 0),
        });
      }
    }
  }
}

function addLink(page, x, y, width, height, url) {
  const annotation = page.doc.context.obj({
    Type: 'Annot', Subtype: 'Link', Rect: [x, y, x + width, y + height],
    Border: [0, 0, 0], A: { Type: 'Action', S: 'URI', URI: PDFString.of(url) },
  });
  page.node.addAnnot(page.doc.context.register(annotation));
}

async function document(title) {
  const pdf = await PDFDocument.create();
  pdf.setTitle(title);
  pdf.setAuthor(site.name);
  pdf.setSubject('Kosmetik und Fußpflege in Bremen-Findorff');
  pdf.setCreator(site.name);
  pdf.setProducer(site.name);
  // Stable metadata makes unchanged source data produce unchanged assets.
  const date = new Date(`${priceListInfo.updatedAt}T12:00:00Z`);
  pdf.setCreationDate(date);
  pdf.setModificationDate(date);
  pdf.catalog.set(PDFName.of('Lang'), PDFString.of('de-DE'));
  return {
    pdf,
    regular: await pdf.embedFont(StandardFonts.Helvetica),
    bold: await pdf.embedFont(StandardFonts.HelveticaBold),
    serif: await pdf.embedFont(StandardFonts.TimesRoman),
    logo: await pdf.embedPng(logoBytes),
  };
}

async function priceListPdf() {
  const { pdf, regular, bold, serif, logo } = await document(`${site.name} – Behandlungen & Preise`);
  const width = 595.28;
  const height = 841.89;
  const margin = 34;
  const gap = 30;
  const columnWidth = (width - margin * 2 - gap) / 2;
  const contentTop = 715;
  const contentBottom = 145;
  const titleSize = 12;
  const bodySize = 12;
  const leading = 15.5;
  let page;
  let column = 0;
  let top = contentTop;

  function newPage() {
    page = pdf.addPage([width, height]);
    const number = pdf.getPageCount();
    page.drawImage(logo, { x: margin, y: 775, width: 39, height: 39 * logo.height / logo.width });
    text(page, site.name, 87, 810, serif, 26, { color: color.pink });
    text(page, 'Behandlungen & Preise', margin, 764, serif, 21);
    const dateLabel = `Preisstand: ${priceDate}`;
    text(page, dateLabel, width - margin - regular.widthOfTextAtSize(dateLabel, 11), 802, regular, 11, { color: color.muted });
    page.drawLine({ start: { x: margin, y: 736 }, end: { x: width - margin, y: 736 }, thickness: 0.8, color: color.line });
    page.drawLine({ start: { x: margin, y: 126 }, end: { x: width - margin, y: 126 }, thickness: 0.8, color: color.line });
    text(page, `Termin telefonisch: ${phone}`, margin, 109, bold, 12);
    text(page, site.address.join(' · '), margin, 88, regular, 11);
    text(page, 'Alle Preise in Euro.', margin, 66, regular, 11, { color: color.muted });
    text(page, `Seite ${number}`, margin, 44, regular, 10, { color: color.muted });
    text(page, 'Aktuelle Preise online', 342, 105, regular, 11, { color: color.muted });
    text(page, website, 342, 85, bold, 12, { color: color.pink });
    addLink(page, 342, 66, 134, 40, priceListInfo.url);
    drawQr(page, width - margin - 76, 34, 76);
    addLink(page, width - margin - 76, 34, 76, 76, priceListInfo.url);
    column = 0;
    top = contentTop;
  }

  function nextColumn() {
    if (column === 0) {
      column = 1;
      top = contentTop;
    } else {
      newPage();
    }
  }

  const x = () => margin + column * (columnWidth + gap);
  const headingHeight = (section) => wrap(section.title, serif, 16, columnWidth).length * 19 + 13;
  function itemHeight(item) {
    const priceWidth = bold.widthOfTextAtSize(item.price, titleSize);
    const titleLines = wrap(item.title, bold, titleSize, columnWidth - priceWidth - 10).length;
    const descriptionLines = item.description ? wrap(item.description, regular, bodySize, columnWidth).length : 0;
    return titleLines * leading + (descriptionLines ? 5 + descriptionLines * leading : 0) + 12;
  }
  function heading(section) {
    top -= paragraph(page, section.title, x(), top, columnWidth, serif, 16, 19, { color: color.pink });
    top -= 13;
  }

  newPage();
  for (let index = 0; index < priceSections.length; index++) {
    const section = priceSections[index];
    // Give the detailed facial treatments their own column on the first page.
    if (index === 1) nextColumn();
    const sectionHeight = headingHeight(section) + section.items.reduce((sum, item) => sum + itemHeight(item), 0);
    if (top - sectionHeight < contentBottom && sectionHeight <= contentTop - contentBottom) nextColumn();
    if (top - headingHeight(section) - itemHeight(section.items[0]) < contentBottom) nextColumn();
    heading(section);
    for (const item of section.items) {
      if (top - itemHeight(item) < contentBottom) {
        nextColumn();
        heading(section);
      }
      const priceWidth = bold.widthOfTextAtSize(item.price, titleSize);
      const titleHeight = paragraph(page, item.title, x(), top, columnWidth - priceWidth - 10, bold, titleSize, leading);
      text(page, item.price, x() + columnWidth - priceWidth, top, bold, titleSize, { color: color.pink });
      top -= titleHeight;
      if (item.description) {
        top -= 5;
        top -= paragraph(page, item.description, x(), top, columnWidth, regular, bodySize, leading, { color: color.muted });
      }
      top -= 12;
    }
    top -= 12;
  }
  return { bytes: await pdf.save(), pages: pdf.getPageCount() };
}

async function flyerPdf() {
  const { pdf, regular, bold, serif, logo } = await document(`${site.name} – Flyer-Entwurf`);
  const width = 297.64;
  const height = 419.53;
  const margin = 24;
  const page = pdf.addPage([width, height]);
  page.drawImage(logo, { x: margin, y: 361, width: 33, height: 33 * logo.height / logo.width });
  text(page, site.name, 69, 396, serif, 25, { color: color.pink });
  text(page, site.subtitle, 69, 367, regular, 10.5, { color: color.muted });
  page.drawLine({ start: { x: margin, y: 342 }, end: { x: width - margin, y: 342 }, thickness: 0.8, color: color.line });
  text(page, 'Kosmetik & Fußpflege', margin, 325, serif, 20);
  text(page, 'in Bremen-Findorff', margin, 298, regular, 13, { color: color.pink });
  paragraph(page, 'Persönliche Pflege und Zeit für Sie.', margin, 271, width - margin * 2, regular, 12, 16);
  const services = priceSections.slice(0, 3).map((section) => section.title).join(' · ');
  paragraph(page, services, margin, 247, width - margin * 2, regular, 12, 16, { color: color.muted });
  text(page, 'Termin telefonisch vereinbaren', margin, 201, regular, 12);
  text(page, phone, margin, 181, bold, 20, { color: color.pink });
  site.address.forEach((line, index) => text(page, line, margin, 149 - index * 16, regular, 12));
  drawQr(page, margin, 25, 84);
  paragraph(page, 'Aktuelle Behandlungen und Preise', 123, 107, width - margin - 123, regular, 12, 16);
  text(page, website, 123, 63, bold, 12, { color: color.pink });
  addLink(page, margin, 25, 84, 84, priceListInfo.url);
  addLink(page, 123, 45, width - margin - 123, 63, priceListInfo.url);
  return pdf.save();
}

async function output(webPath, bytes) {
  if (!webPath.startsWith('/downloads/') || webPath.includes('..')) throw new Error(`Invalid download path: ${webPath}`);
  const file = new URL(`../public${webPath}`, import.meta.url);
  await mkdir(new URL('./', file), { recursive: true });
  await writeFile(file, bytes);
  return fileURLToPath(file);
}

const qrOptions = { errorCorrectionLevel: 'M', margin: 4, color: { dark: '#000000', light: '#ffffff' } };
const prices = await priceListPdf();
await output(priceListInfo.pdfPath, prices.bytes);
await output(priceListInfo.flyerPath, await flyerPdf());
await output(priceListInfo.qrSvgPath, await QRCode.toString(priceListInfo.url, { ...qrOptions, type: 'svg', width: 1024 }));
await output(priceListInfo.qrPngPath, await QRCode.toBuffer(priceListInfo.url, { ...qrOptions, type: 'png', width: 1024 }));
console.log(`Generated ${priceSections.reduce((count, section) => count + section.items.length, 0)} prices on ${prices.pages} A4 page(s), an A6 flyer, and QR assets for ${priceListInfo.url}`);

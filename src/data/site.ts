export const site = {
  name: 'Studio Farah',
  subtitle: 'Kosmetik & Wohlbefinden',
  description: 'Studio Farah in Bremen-Findorff: Kosmetik, Gesichtsbehandlungen, Fußpflege, Maniküre und Wellness in ruhiger, persönlicher Atmosphäre.',
  url: 'https://studiofarah.de',
  email: 'kontakt@studiofarah.de',
  phoneDisplay: '+49 421 17270701',
  address: ['Worpsweder Straße 85', '28215 Bremen'],
  openingHours: ['Mo - Fr: 09:00 - 18:00', 'Sa: nach Vereinbarung'],
};

export const navItems = [
  { label: 'Behandlungen', href: '#behandlungen' },
  { label: 'Über mich', href: '#ueber-mich' },
  { label: 'Preise', href: '#preise' },
  { label: 'Kontakt', href: '#kontakt' },
];

// Update this date together with prices; downloads are rebuilt from these data.
export const priceListInfo = {
  updatedAt: '2026-11-10',
  url: new URL('/#preise', site.url).href,
  pdfPath: '/downloads/studio-farah-preisliste.pdf',
  flyerPath: '/downloads/studio-farah-flyer.pdf',
  qrSvgPath: '/downloads/studio-farah-qr-code.svg',
  qrPngPath: '/downloads/studio-farah-qr-code.png',
} as const;

// Original studio photographs; no staged treatment or customer photographs.
export const studioImages = {
  treatmentRoom: {
    src: '/images/about/studio-behandlungsraum.jpg',
    alt: 'Der Behandlungsraum im Studio Farah mit Pflege- und Behandlungsstühlen',
    width: 3264,
    height: 1952,
  },
  reception: {
    src: '/images/about/kosmetik-produkte.jpg',
    alt: 'Der Empfang im Studio Farah mit Produktvitrine und Zertifikaten',
    width: 3264,
    height: 1952,
  },
} as const;

export const seo = {
  siteUrl: 'https://studiofarah.de',
  siteName: 'Studio Farah',
  defaultTitle: 'Studio Farah | Kosmetikstudio in Bremen-Findorff',
  defaultDescription:
    'Studio Farah in Bremen-Findorff: Kosmetik, Gesichtsbehandlungen, Fußpflege, Maniküre und Wellness in ruhiger, persönlicher Atmosphäre.',
  defaultImage: studioImages.treatmentRoom.src,
  locale: 'de_DE',
} as const;

export const localBusiness = {
  type: 'BeautySalon',
  name: 'Studio Farah',
  description:
    'Kosmetikstudio in Bremen-Findorff für Gesichtsbehandlungen, Fußpflege, Maniküre, Wachsenthaarung und kleine Wellness-Auszeiten.',
  url: seo.siteUrl,
  image: studioImages.treatmentRoom.src,
  logo: '/logo-studio-farah.png',
  telephone: '+49 421 17270701',
  email: 'kontakt@studiofarah.de',
  priceRange: '€€',
  address: {
    streetAddress: 'Worpsweder Straße 85',
    postalCode: '28215',
    addressLocality: 'Bremen',
    addressRegion: 'Bremen',
    addressCountry: 'DE',
  },
  openingHoursSpecification: [
    {
      dayOfWeek: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
      ],
      opens: '09:00',
      closes: '18:00',
    },
  ],
  additionalOpeningHours: 'Samstag nach Vereinbarung',
  mapUrl:
    'https://www.google.com/maps/search/?api=1&query=Studio%20Farah%2C%20Worpsweder%20Stra%C3%9Fe%2085%2C%2028215%20Bremen',
  sameAs: [],
} as const;

export const treatmentsIntro = {
  eyebrow: 'Behandlungen',
  title: 'Pflege und Wohlbefinden in guten Händen',
  text: 'Ob pflegende Gesichtsbehandlung, Maniküre, Fußpflege oder kleine Wellness-Auszeit – im Studio Farah finden Sie wohltuende Anwendungen, die individuell auf Sie abgestimmt werden.',
} as const;

export const treatments = [
  {
    title: 'Gesichtsbehandlungen',
    description:
      'Individuelle Pflege für Ihre Haut – von der klassischen Kosmetikbehandlung bis zur wohltuenden Anti-Age-Anwendung.',
    href: '#gesichtsbehandlungen',
  },
  {
    title: 'Maniküre & Nägel',
    description:
      'Gepflegte Hände und schöne Nägel – sorgfältig behandelt und auf Wunsch mit entspannender Spa-Pflege.',
    href: '#manikuere-naegel',
  },
  {
    title: 'Fußpflege',
    description:
      'Wohltuende Pflege für Ihre Füße – damit Sie sich rundum gepflegt und wohl fühlen.',
    href: '#fusspflege',
  },
  {
    title: 'Wachsenthaarung',
    description:
      'Für ein glattes und gepflegtes Hautgefühl – sanft, gründlich und auf Zuckerbasis.',
    href: '#enthaarung',
  },
  {
    title: 'Extras',
    description:
      'Augenbrauenkorrektur sowie das Färben von Augenbrauen und Wimpern runden das Angebot ab.',
    href: '#extras',
  },
] as const;

export const priceSections = [
  {
    title: 'Gesichtsbehandlungen',
    id: 'gesichtsbehandlungen',
    description:
      'Das Ziel einer klassischen Kosmetikbehandlung ist es, mit gezielten Anwendungen und geeigneten Pflegeprodukten das Erscheinungsbild Ihrer Haut zu verbessern. Der individuelle Ablauf richtet sich nach Ihrem Hauttyp und Ihren persönlichen Wünschen.',
    items: [
      {
        title: 'Kosmetikbehandlung',
        description:
          'Abreinigung, Peeling, Bedampfung, Zupfen, Ausreinigung, Ampulle, Handpackung, Massage, Maske und Abschlusspflege.',
        price: '59 €',
      },
      {
        title: 'Anti-Age-Behandlung',
        description: 'Anti-Aging-Behandlung mit hochwertigen Produkten.',
        price: '85 €',
      },
      {
        title: 'Frische Kick',
        description:
          'Abreinigung, Peeling, Bedampfung, Zupfen, Handpackung, Maske und Tagespflege.',
        price: '50 €',
      },
      {
        title: 'Grundreinigung',
        description:
          'Abreinigung, Peeling, Bedampfung, Zupfen, Ausreinigung, Handpackung, Maske und Abschlusspflege.',
        price: '65 €',
      },
      {
        title: 'Grundreinigung Junior',
        description: 'Ausreinigungsbehandlung für Jugendliche bis 18 Jahre.',
        price: '43 €',
      },
    ],
  },
  {
    title: 'Maniküre und Nägel',
    id: 'manikuere-naegel',
    description:
      'Die Intensivbehandlung verwöhnt, pflegt und beruhigt Ihre Hände mit Aroma-Paraffinwachs. Die Wärme geht tief in die Haut, tut den Gelenken gut, spendet Feuchtigkeit und sorgt für ein angenehm entspanntes Hautgefühl.',
    items: [
      {
        title: 'Klassische Maniküre',
        description: '',
        price: '22 €',
      },
      {
        title: 'Nägel lackieren',
        description: '',
        price: '8 €',
      },
      {
        title: 'Spa für die Hände',
        description:
          'Hand- und Armbehandlung, Peeling, Maske, Paraffinbad, Massage und Maniküre.',
        price: '55 €',
      },
    ],
  },
  {
    title: 'Fußpflege',
    id: 'fusspflege',
    description:
      'Unsere Füße leisten jeden Tag große Arbeit und tragen uns durchs Leben. Grund genug, ihnen die richtige Pflege zukommen zu lassen und sie zu verwöhnen. Ihre Füße sind bei mir in guten Händen.',
    items: [
      {
        title: 'Klassische Fußpflege',
        description: 'Fußpflege mit Fußbad.',
        price: 'ab 32 €',
      },
      {
        title: 'Spa für die Füße',
        description:
          'Klassische Fußpflege, Peeling, Fußmaske und Massage.',
        price: '45 €',
      },
    ],
  },
  {
    title: 'Wachsenthaarung auf Zuckerbasis',
    id: 'enthaarung',
    description:
      'Eine glatte und geschmeidige Haut gehört für viele Menschen zum gepflegten Erscheinungsbild. Die Haarentfernung mit Wachs zählt zu den bewährten Methoden und sorgt für ein glattes Hautgefühl ohne Stoppeln.',
    items: [
      {
        title: 'Unterschenkel',
        description: '',
        price: '30 €',
      },
      {
        title: 'Beine',
        description: '',
        price: '55 €',
      },
      {
        title: 'Oberlippe und Kinn',
        description: '',
        price: '12 €',
      },
    ],
  },
  {
    title: 'Extras',
    id: 'extras',
    description: '',
    items: [
      {
        title: 'Augenbrauenkorrektur',
        description: '',
        price: '8 €',
      },
      {
        title: 'Augenbrauen färben',
        description: '',
        price: '8 €',
      },
      {
        title: 'Wimpern färben',
        description: '',
        price: '12 €',
      },
    ],
  },
] as const;


export const about = {
  eyebrow: 'Über mich',
  title: 'Hallo, mein Name ist Farah Vakili.',
  intro:
    'Schön, dass Sie da sind. In meinem Studio in Findorff möchte ich Ihnen einen Ort bieten, an dem Sie zur Ruhe kommen, sich wohlfühlen und persönlich betreut werden.',
  paragraphs: [
    'Ich wurde in Shiraz im Iran geboren und lebe seit 1986 in meiner Wahlheimat Deutschland.',
    'Meine Ausbildung zur Fachkosmetikerin habe ich durch zahlreiche Fortbildungen ergänzt. So kann ich Behandlungen anbieten, die nicht nur pflegen, sondern individuell auf Ihre Wünsche und Ihr Wohlbefinden abgestimmt sind.',
  ],
  qualificationsIntro: 'Zu meinen Fortbildungen gehören unter anderem:',
  qualifications: ['Visagistik', 'Fußpflege', 'Shiatsu-Massage'],
  certification: 'Zertifiziert nach Dr. R. A. Eckstein.',
  closing:
    'Über ein persönliches Kennenlernen würde ich mich sehr freuen.',
  signature: 'Ihre Farah Vakili',
} as const;

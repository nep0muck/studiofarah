export const site = {
  name: 'Studio Farah',
  description: 'Kosmetikstudio für Behandlungen, Beratung und Wohlfühlmomente.',
  url: 'https://studiofarah.de',
  email: 'kontakt@studiofarah.de',
  phoneDisplay: '+49 421 17270701',
  whatsappNumber: '491701234567',
  whatsappMessage: 'Hallo Studio Farah, ich möchte gerne einen Termin anfragen.',
  address: ['Worpsweder Straße 85', '28215 Bremen'],
  openingHours: ['Mo–Fr: 09:00–18:00', 'Sa: nach Vereinbarung'],
};

export const navItems = [
  { label: 'Start', href: '#start' },
  { label: 'Über mich', href: '#ueber-mich' },
  { label: 'Behandlungen', href: '#behandlungen' },
  { label: 'Preise', href: '#preise' },
  { label: 'Kontakt', href: '#kontakt' },
];

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
    href: '#preise',
  },
  {
    title: 'Maniküre & Nägel',
    description:
      'Gepflegte Hände und schöne Nägel – sorgfältig behandelt und auf Wunsch mit entspannender Spa-Pflege.',
    href: '#preise',
  },
  {
    title: 'Fußpflege',
    description:
      'Wohltuende Pflege für Ihre Füße – damit Sie sich rundum gepflegt und wohl fühlen.',
    href: '#preise',
  },
  {
    title: 'Wachsenthaarung',
    description:
      'Für ein glattes und gepflegtes Hautgefühl – sanft, gründlich und auf Zuckerbasis.',
    href: '#preise',
  },
  {
    title: 'Extras',
    description:
      'Kleine Schönheitsbehandlungen wie Augenbrauenkorrektur, Wimpern färben oder Make-up runden das Angebot ab.',
    href: '#preise',
  },
] as const;

export const priceSections = [
  {
    title: 'Gesichtsbehandlungen',
    description:
      'Das Ziel einer klassischen Kosmetikbehandlung ist es, mit gezielten Anwendungen und geeigneten Pflegeprodukten das Erscheinungsbild Ihrer Haut zu verbessern. Der individuelle Ablauf richtet sich nach Ihrem Hauttyp und Ihren persönlichen Wünschen.',
    items: [
      {
        title: 'Kosmetikbehandlung',
        description:
          'Vorgespräch, Abreinigung, Hautanalyse, Peeling, Bedampfung, Ausreinigung, Maske und Abschlusspflege.',
        price: '59 €',
      },
      {
        title: 'Anti-Age Behandlung',
        description: 'Anti-Aging-Behandlung mit hochwertigen Produkten.',
        price: '85 €',
      },
      {
        title: 'Frische Kick',
        description:
          'Abreinigung, Peeling, Bedampfung, Wirkstoffampulle, Massage und Abschlusspflege.',
        price: '50 €',
      },
      {
        title: 'Grundreinigung',
        description:
          'Abreinigung, Peeling, Bedampfung, Ausreinigung, Reinigungsmaske und Abschlusspflege.',
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
    description:
      'Unsere Füße leisten jeden Tag große Arbeit und tragen uns durchs Leben. Grund genug, ihnen die richtige Pflege zukommen zu lassen und sie zu verwöhnen. Ihre Füße sind bei mir in guten Händen.',
    items: [
      {
        title: 'Klassische Fußpflege mit Fußbad',
        description: '',
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
    description:
      'Eine glatte und geschmeidige Haut gehört für viele Menschen zum gepflegten Erscheinungsbild. Die Haarentfernung mit Wachs zählt zu den bewährten Methoden und sorgt für ein glattes Hautgefühl ohne Stoppeln.',
    items: [
      {
        title: 'Oberlippe und Kinn',
        description: '',
        price: '12 €',
      },
      {
        title: 'Beine komplett',
        description: '',
        price: '55 €',
      },
      {
        title: 'Unterschenkel',
        description: '',
        price: '30 €',
      },
    ],
  },
  {
    title: 'Extras',
    description: '',
    items: [
      {
        title: 'Augenbrauenkorrektur',
        description: '',
        price: 'ab 8 €',
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
      {
        title: 'Tages-Make-up',
        description: '',
        price: '38 €',
      },
      {
        title: 'Abend-Make-up',
        description: '',
        price: '48 €',
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
  images: [
    {
      src: '/images/about/farah-vakili.jpg',
      label: 'Farah Vakili',
      alt: 'Farah Vakili im Kosmetikstudio',
    },
    {
      src: '/images/about/studio-behandlungsraum.jpg',
      label: 'Studio',
      alt: 'Behandlungsraum im Kosmetikstudio Studio Farah',
    },
    {
      src: '/images/about/kosmetik-produkte.jpg',
      label: 'Pflegeprodukte',
      alt: 'Kosmetikprodukte in angenehmer Studioatmosphäre',
    },
  ],
} as const;
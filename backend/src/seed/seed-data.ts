import type { RichContent } from '@wildtrip/shared';

// Base URL for seeded images
const BASE_URL =
  process.env.PUBLIC_R2_PUBLIC_URL || 'https://dev.cdn.wildtrip.cl';

export interface SeedImageData {
  id: string;
  url: string;
  filename: string;
  galleryId?: number;
}

// Available images in R2 storage
export const seedImages: SeedImageData[] = [
  {
    id: 'neom-STV2s3FYw7Y',
    filename: 'neom-STV2s3FYw7Y-unsplash.webp',
    url: `${BASE_URL}/neom-STV2s3FYw7Y-unsplash.webp`,
  },
  {
    id: 'nils-nedel-ONpGBpns3cs',
    filename: 'nils-nedel-ONpGBpns3cs-unsplash.webp',
    url: `${BASE_URL}/nils-nedel-ONpGBpns3cs-unsplash.webp`,
  },
  {
    id: 'philipp-kammerer-6Mxb_mZ_Q8E',
    filename: 'philipp-kammerer-6Mxb_mZ_Q8E-unsplash.webp',
    url: `${BASE_URL}/philipp-kammerer-6Mxb_mZ_Q8E-unsplash.webp`,
  },
  {
    id: 'pietro-de-grandi-T7K4aEPoGGk',
    filename: 'pietro-de-grandi-T7K4aEPoGGk-unsplash.webp',
    url: `${BASE_URL}/pietro-de-grandi-T7K4aEPoGGk-unsplash.webp`,
  },
  {
    id: 'rebe-adelaida-zunQwMy5B6M',
    filename: 'rebe-adelaida-zunQwMy5B6M-unsplash.webp',
    url: `${BASE_URL}/rebe-adelaida-zunQwMy5B6M-unsplash.webp`,
  },
  {
    id: 'redd-francisco-rjfOdiB7k-E',
    filename: 'redd-francisco-rjfOdiB7k-E-unsplash.webp',
    url: `${BASE_URL}/redd-francisco-rjfOdiB7k-E-unsplash.webp`,
  },
  {
    id: 'sean-oulashin-KMn4VEeEPR8',
    filename: 'sean-oulashin-KMn4VEeEPR8-unsplash.webp',
    url: `${BASE_URL}/sean-oulashin-KMn4VEeEPR8-unsplash.webp`,
  },
  {
    id: 'sebastian-leon-prado-MgODFmLOaEY',
    filename: 'sebastian-leon-prado-MgODFmLOaEY-unsplash.webp',
    url: `${BASE_URL}/sebastian-leon-prado-MgODFmLOaEY-unsplash.webp`,
  },
];

export function getRandomImage(): string {
  return seedImages[Math.floor(Math.random() * seedImages.length)].url;
}

export function getRandomImages(count: number): string[] {
  const shuffled = [...seedImages].sort(() => 0.5 - Math.random());
  return shuffled
    .slice(0, Math.min(count, seedImages.length))
    .map((img) => img.url);
}

export function getRandomImageData(): SeedImageData {
  return seedImages[Math.floor(Math.random() * seedImages.length)];
}

export function getRandomImageDataArray(count: number): SeedImageData[] {
  const shuffled = [...seedImages].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, seedImages.length));
}

export function createRichContent(blocks: any[]): RichContent {
  return { blocks };
}

// Chilean species data
export const speciesData = [
  {
    scientificName: 'Vultur gryphus',
    commonName: 'Cóndor Andino',
    kingdom: 'Animalia',
    phylum: 'Chordata',
    class: 'Aves',
    order: 'Cathartiformes',
    family: 'Cathartidae',
    mainGroup: 'bird',
    specificCategory: 'Ave rapaz',
    conservationStatus: 'vulnerable',
    habitat: 'Cordillera de los Andes, desde Venezuela hasta Tierra del Fuego',
    description:
      'El cóndor andino es el ave voladora más grande del mundo, con una envergadura que puede superar los 3 metros. Es un símbolo nacional de Chile y otros países andinos.',
    detailedDescription: createRichContent([
      {
        id: 'block-1',
        type: 'heading',
        level: 2,
        content: 'Características físicas',
      },
      {
        id: 'block-2',
        type: 'paragraph',
        content:
          'El cóndor andino destaca por su gran tamaño, con un peso de hasta 15 kg en machos. Su plumaje es negro con un distintivo collar blanco. Los machos presentan una cresta carnosa sobre la cabeza.',
      },
      {
        id: 'block-3',
        type: 'heading',
        level: 2,
        content: 'Comportamiento',
      },
      {
        id: 'block-4',
        type: 'paragraph',
        content:
          'Son aves carroñeras que pueden volar cientos de kilómetros en busca de alimento. Utilizan las corrientes térmicas para planear sin esfuerzo.',
      },
    ]),
    endemicToChile: false,
    isNative: true,
  },
  {
    scientificName: 'Puma concolor',
    commonName: 'Puma',
    kingdom: 'Animalia',
    phylum: 'Chordata',
    class: 'Mammalia',
    order: 'Carnivora',
    family: 'Felidae',
    mainGroup: 'mammal',
    specificCategory: 'Felino',
    conservationStatus: 'least_concern',
    habitat:
      'Desde el nivel del mar hasta los 5,800 metros de altitud, en diversos ecosistemas',
    description:
      'El puma es el segundo felino más grande de América y uno de los depredadores más importantes de Chile.',
    detailedDescription: createRichContent([
      {
        id: 'block-5',
        type: 'paragraph',
        content:
          'El puma es un felino solitario y territorial que habita en casi todos los ecosistemas de Chile, desde el desierto hasta los bosques patagónicos.',
      },
    ]),
    endemicToChile: false,
    isNative: true,
  },
  {
    scientificName: 'Hippocamelus bisulcus',
    commonName: 'Huemul',
    kingdom: 'Animalia',
    phylum: 'Chordata',
    class: 'Mammalia',
    order: 'Artiodactyla',
    family: 'Cervidae',
    mainGroup: 'mammal',
    specificCategory: 'Cérvido',
    conservationStatus: 'endangered',
    habitat: 'Bosques andinos de la Patagonia chilena y argentina',
    description:
      'El huemul es un ciervo nativo de los Andes australes y es uno de los símbolos del escudo nacional de Chile.',
    detailedDescription: createRichContent([
      {
        id: 'block-6',
        type: 'paragraph',
        content:
          'El huemul es un ciervo robusto y compacto, adaptado a terrenos escarpados. Los machos poseen astas bifurcadas. Es una especie en peligro de extinción con poblaciones fragmentadas.',
      },
    ]),
    endemicToChile: false,
    isNative: true,
  },
];

// Protected areas data
export const protectedAreasData = [
  {
    name: 'Parque Nacional Torres del Paine',
    type: 'national_park',
    location: {
      type: 'Point',
      coordinates: [-73.4068, -50.9423],
    },
    area: 242242,
    creationYear: 1959,
    description:
      'Torres del Paine es uno de los parques más emblemáticos de Chile, reconocido mundialmente por sus espectaculares formaciones graníticas, glaciares, lagos turquesa y rica biodiversidad patagónica.',
    ecosystems: [
      'Estepa patagónica',
      'Bosque magallánico',
      'Matorral preandino',
      'Desierto andino',
    ],
    visitorInformation: {
      schedule:
        'Octubre a abril: 6:00 - 22:00, Mayo a septiembre: 8:00 - 18:00',
      contact: 'CONAF Magallanes: +56 61 223 8581',
      entranceFee: 'Adultos: $21.000, Niños: $5.200',
      facilities: [
        'Camping',
        'Refugios',
        'Centro de visitantes',
        'Senderos señalizados',
      ],
    },
    region: 'magallanes',
    richContent: createRichContent([
      {
        id: 'block-7',
        type: 'heading',
        level: 2,
        content: 'Geografía y paisaje',
      },
      {
        id: 'block-8',
        type: 'paragraph',
        content:
          'El parque destaca por el macizo del Paine, con sus icónicas torres de granito que se elevan hasta 2.800 metros. Los Cuernos del Paine, formados por capas de roca sedimentaria y granito, crean un contraste visual único. Numerosos glaciares alimentan lagos de aguas turquesa como el Pehoé y el Nordenskjöld.',
      },
      {
        id: 'block-9',
        type: 'heading',
        level: 2,
        content: 'Rutas de trekking',
      },
      {
        id: 'block-10',
        type: 'paragraph',
        content:
          'El circuito "W" de 4-5 días y el circuito "O" de 8-10 días son las rutas más populares. Otros senderos incluyen la base de las Torres, el Valle del Francés y el Mirador Grey. Todos requieren registro previo y respeto por las normas del parque.',
      },
    ]),
  },
  {
    name: 'Parque Nacional Lauca',
    type: 'national_park',
    location: {
      type: 'Point',
      coordinates: [-69.2667, -18.2333],
    },
    area: 137883,
    creationYear: 1970,
    description:
      'Ubicado en el altiplano chileno a más de 4.000 metros de altitud, el Parque Nacional Lauca es parte de la Reserva de la Biosfera Lauca y destaca por sus volcanes, lagunas altiplánicas y fauna adaptada a la altura.',
    ecosystems: ['Altiplano', 'Bofedales', 'Tolar', 'Pajonal'],
    visitorInformation: {
      schedule: 'Todo el año: 8:00 - 18:00',
      contact: 'CONAF Arica: +56 58 258 5570',
      entranceFee: 'Adultos: $3.000, Niños: $1.500',
      facilities: ['Centro CONAF', 'Miradores', 'Senderos', 'Áreas de picnic'],
    },
    region: 'arica_parinacota',
    richContent: createRichContent([
      {
        id: 'block-11',
        type: 'heading',
        level: 2,
        content: 'Paisaje volcánico',
      },
      {
        id: 'block-12',
        type: 'paragraph',
        content:
          'Los volcanes Parinacota (6.342 m) y Pomerape (6.282 m), conocidos como Payachatas, dominan el paisaje. El lago Chungará, uno de los más altos del mundo a 4.520 metros, refleja estos colosos volcánicos creando vistas espectaculares.',
      },
      {
        id: 'block-13',
        type: 'heading',
        level: 2,
        content: 'Cultura aymara',
      },
      {
        id: 'block-14',
        type: 'paragraph',
        content:
          'El parque incluye poblados aymaras como Parinacota, con su iglesia colonial del siglo XVII. Las comunidades mantienen prácticas ancestrales de pastoreo de camélidos y ceremonias tradicionales. El respeto por la Pachamama es fundamental en la cosmovisión local.',
      },
    ]),
  },
  {
    name: 'Parque Nacional Rapa Nui',
    type: 'national_park',
    location: {
      type: 'Point',
      coordinates: [-109.3497, -27.1127],
    },
    area: 7130,
    creationYear: 1935,
    description:
      'Patrimonio de la Humanidad UNESCO, el Parque Nacional Rapa Nui protege el legado arqueológico de la cultura Rapa Nui, incluyendo cerca de 1.000 moai y sitios ceremoniales únicos en el mundo.',
    ecosystems: [
      'Pradera oceánica',
      'Vegetación litoral',
      'Bosque tropical relicto',
    ],
    visitorInformation: {
      schedule: 'Todo el año: 9:00 - 17:00',
      contact: 'CONAF Isla de Pascua: +56 32 210 0570',
      entranceFee: 'Adultos: $80.000, Niños: $40.000',
      facilities: [
        'Centro de interpretación',
        'Guías locales',
        'Senderos arqueológicos',
      ],
    },
    region: 'valparaiso',
    richContent: createRichContent([
      {
        id: 'block-15',
        type: 'heading',
        level: 2,
        content: 'Patrimonio arqueológico',
      },
      {
        id: 'block-16',
        type: 'paragraph',
        content:
          'Los moai, estatuas monolíticas talladas en toba volcánica, son el símbolo de Rapa Nui. Existen 887 moai catalogados, desde 2 hasta 21 metros de altura. Los ahu (plataformas ceremoniales) como Tongariki, con 15 moai, muestran la sofisticación de esta civilización polinésica.',
      },
    ]),
  },
];

// News data
export const newsData = [
  {
    title:
      'Avistamiento récord de cóndores andinos en el Parque Nacional Torres del Paine',
    summary:
      'Investigadores registraron la congregación más grande de cóndores andinos en la historia del parque, con más de 40 individuos observados simultáneamente.',
    content: createRichContent([
      {
        id: 'news-1',
        type: 'paragraph',
        content:
          'En un evento sin precedentes, el equipo de monitoreo del Parque Nacional Torres del Paine documentó la congregación de más de 40 cóndores andinos en el sector de las Torres.',
      },
      {
        id: 'news-2',
        type: 'paragraph',
        content:
          'Este avistamiento histórico sugiere una recuperación significativa de la población de cóndores en la región de Magallanes, donde la especie había experimentado un declive preocupante en las últimas décadas.',
      },
    ]),
    author: 'Equipo de Conservación Wildtrip',
    tags: ['conservación', 'fauna', 'torres-del-paine', 'cóndor-andino'],
  },
  {
    title: 'Nuevo programa de conservación del huemul en la Patagonia',
    summary:
      'CONAF lanza ambicioso proyecto para proteger y recuperar las poblaciones de huemul en cinco parques nacionales de la Patagonia chilena.',
    content: createRichContent([
      {
        id: 'news-3',
        type: 'paragraph',
        content:
          'La Corporación Nacional Forestal (CONAF) anunció el inicio de un programa integral de conservación del huemul, que abarcará cinco parques nacionales en las regiones de Aysén y Magallanes.',
      },
      {
        id: 'news-4',
        type: 'paragraph',
        content:
          'El proyecto incluye monitoreo satelital, corredores biológicos y trabajo con comunidades locales para reducir las amenazas que enfrenta esta especie emblemática.',
      },
    ]),
    author: 'Departamento de Prensa CONAF',
    tags: ['conservación', 'huemul', 'patagonia', 'fauna-endémica'],
  },
  {
    title: 'Descubren nueva especie de anfibio en el Parque Nacional Lauca',
    summary:
      'Científicos chilenos identifican una nueva especie de rana adaptada a las extremas condiciones del altiplano, a más de 4.500 metros de altitud.',
    content: createRichContent([
      {
        id: 'news-5',
        type: 'paragraph',
        content:
          'Un equipo de herpetólogos de la Universidad de Chile ha confirmado el descubrimiento de una nueva especie de anfibio en las inmediaciones del lago Chungará, en el Parque Nacional Lauca.',
      },
      {
        id: 'news-6',
        type: 'paragraph',
        content:
          'La nueva especie, temporalmente denominada "Telmatobius sp. nov.", representa un hallazgo significativo para la biodiversidad del altiplano chileno y demuestra la importancia de continuar los estudios en estos ecosistemas extremos.',
      },
    ]),
    author: 'Universidad de Chile',
    tags: [
      'investigación',
      'nueva-especie',
      'anfibios',
      'parque-nacional-lauca',
    ],
  },
];

import { v4 as uuidv4 } from 'uuid'

import type { ContentBlock, News, NewSpecies, ProtectedArea, RichContent } from '../schema'

// Seed data for development - Using actual images uploaded to R2
// This should match your PUBLIC_R2_PUBLIC_URL environment variable
const BASE_URL = import.meta.env.PUBLIC_R2_PUBLIC_URL

export interface SeedImageData {
  id: string
  url: string
  filename: string
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
]

// Simplified list of image URLs for quick access
export const imageUrls = seedImages.map((img) => img.url)

export function getRandomImage(): string {
  return imageUrls[Math.floor(Math.random() * imageUrls.length)]
}

export function getRandomImages(count: number): string[] {
  const shuffled = [...imageUrls].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, Math.min(count, imageUrls.length))
}

export function getRandomImageData(): SeedImageData {
  return seedImages[Math.floor(Math.random() * seedImages.length)]
}

export function getRandomImageDataArray(count: number): SeedImageData[] {
  const shuffled = [...seedImages].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, Math.min(count, seedImages.length))
}

function createRichContent(blocks: ContentBlock[]): RichContent {
  return { blocks }
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
    conservationStatus: 'vulnerable' as const,
    habitat: 'Cordillera de los Andes, desde Venezuela hasta Tierra del Fuego',
    distribution: {
      type: 'Polygon',
      coordinates: [
        [
          [-70, -50],
          [-70, -18],
          [-68, -18],
          [-68, -50],
          [-70, -50],
        ],
      ],
    },
    description:
      'El cóndor andino es el ave voladora más grande del mundo, símbolo nacional de Chile. Con una envergadura que puede superar los 3 metros, este majestuoso carroñero juega un papel fundamental en el ecosistema andino.',
    distinctiveFeatures: 'Envergadura de hasta 3.3 metros, plumaje negro con collar blanco, cresta carnosa en machos',
    richContent: createRichContent([
      {
        id: uuidv4(),
        type: 'heading',
        level: 2,
        content: 'Características físicas',
      },
      {
        id: uuidv4(),
        type: 'paragraph',
        content:
          'El cóndor andino destaca por su gran tamaño, con los machos alcanzando hasta 15 kg de peso. Su plumaje es principalmente negro con un distintivo collar blanco y plumas blancas en las alas. Los machos se distinguen por su cresta carnosa rojiza.',
      },
      {
        id: uuidv4(),
        type: 'heading',
        level: 2,
        content: 'Comportamiento y reproducción',
      },
      {
        id: uuidv4(),
        type: 'paragraph',
        content:
          'Son aves monógamas que anidan en acantilados rocosos. La hembra pone un solo huevo cada dos años, y ambos padres cuidan del polluelo durante más de un año. Su vuelo aprovecha las corrientes térmicas, pudiendo recorrer cientos de kilómetros sin aletear.',
      },
    ]),
  },
  {
    scientificName: 'Hippocamelus bisulcus',
    commonName: 'Huemul del Sur',
    kingdom: 'Animalia',
    phylum: 'Chordata',
    class: 'Mammalia',
    order: 'Artiodactyla',
    family: 'Cervidae',
    mainGroup: 'mammal',
    specificCategory: 'Mamífero rumiante',
    conservationStatus: 'endangered' as const,
    habitat: 'Bosques andino-patagónicos de Chile y Argentina',
    distribution: {
      type: 'Polygon',
      coordinates: [
        [
          [-75, -55],
          [-75, -35],
          [-70, -35],
          [-70, -55],
          [-75, -55],
        ],
      ],
    },
    description:
      'El huemul es un ciervo endémico de los Andes patagónicos y uno de los símbolos patrios de Chile, presente en el escudo nacional. Es un animal tímido y esquivo que habita en bosques y zonas montañosas.',
    distinctiveFeatures: 'Cérvido robusto, pelaje denso café grisáceo, astas bifurcadas en machos',
    richContent: createRichContent([
      {
        id: uuidv4(),
        type: 'heading',
        level: 2,
        content: 'Morfología',
      },
      {
        id: uuidv4(),
        type: 'paragraph',
        content:
          'El huemul es un cérvido de tamaño mediano, con un pelaje grueso de color café grisáceo en verano y más oscuro en invierno. Los machos poseen astas bifurcadas que renuevan anualmente. Miden entre 140-175 cm de largo y pesan entre 40-100 kg.',
      },
      {
        id: uuidv4(),
        type: 'heading',
        level: 2,
        content: 'Estado de conservación',
      },
      {
        id: uuidv4(),
        type: 'paragraph',
        content:
          'Con menos de 2,000 individuos en estado salvaje, el huemul enfrenta múltiples amenazas: pérdida de hábitat, enfermedades transmitidas por ganado, ataques de perros y fragmentación poblacional. Es una especie prioritaria para la conservación en Chile.',
      },
    ]),
  },
  {
    scientificName: 'Araucaria araucana',
    commonName: 'Pehuén',
    kingdom: 'Plantae',
    phylum: 'Tracheophyta',
    class: 'Pinopsida',
    order: 'Pinales',
    family: 'Araucariaceae',
    mainGroup: 'plant',
    specificCategory: 'Árbol conífero',
    conservationStatus: 'endangered' as const,
    habitat: 'Cordillera de los Andes y Cordillera de la Costa, entre las regiones del Biobío y Los Ríos',
    distribution: {
      type: 'Polygon',
      coordinates: [
        [
          [-73, -40],
          [-73, -37],
          [-71, -37],
          [-71, -40],
          [-73, -40],
        ],
      ],
    },
    description:
      'La araucaria o pehuén es una conífera milenaria sagrada para el pueblo mapuche-pehuenche. Sus semillas (piñones) han sido alimento fundamental para las comunidades indígenas durante siglos.',
    distinctiveFeatures: 'Árbol longevo hasta 50m de altura, copa aparasolada, hojas escamosas persistentes',
    richContent: createRichContent([
      {
        id: uuidv4(),
        type: 'heading',
        level: 2,
        content: 'Características botánicas',
      },
      {
        id: uuidv4(),
        type: 'paragraph',
        content:
          'Árbol de crecimiento extremadamente lento que puede alcanzar 50 metros de altura. Su forma es inconfundible: tronco recto y copa aparasolada con ramas en verticilos. La corteza es gruesa y rugosa, adaptada para resistir incendios.',
      },
      {
        id: uuidv4(),
        type: 'heading',
        level: 2,
        content: 'Valor cultural',
      },
      {
        id: uuidv4(),
        type: 'paragraph',
        content:
          'Para el pueblo mapuche-pehuenche, la araucaria es un árbol sagrado. Los piñones han sido su principal fuente de carbohidratos, consumidos frescos, tostados o molidos como harina. La recolección del piñón es una actividad cultural que fortalece los lazos comunitarios.',
      },
    ]),
  },
  {
    scientificName: 'Puma concolor 1',
    commonName: 'Puma 1',
    kingdom: 'Animalia',
    phylum: 'Chordata',
    class: 'Mammalia',
    order: 'Carnivora',
    family: 'Felidae',
    mainGroup: 'mammal',
    specificCategory: 'Felino',
    conservationStatus: 'least_concern' as const,
    habitat: 'Desde el desierto de Atacama hasta la Patagonia, en diversos ecosistemas',
    distribution: {
      type: 'Polygon',
      coordinates: [
        [
          [-75, -55],
          [-75, -18],
          [-67, -18],
          [-67, -55],
          [-75, -55],
        ],
      ],
    },
    description:
      'El puma es el mayor felino de Chile y el segundo más grande de América. Adaptable y sigiloso, es un depredador tope fundamental para el equilibrio de los ecosistemas chilenos.',
    distinctiveFeatures: 'Felino grande y ágil, pelaje uniforme leonado, cola larga con punta negra',
    richContent: createRichContent([
      {
        id: uuidv4(),
        type: 'heading',
        level: 2,
        content: 'Adaptaciones y comportamiento',
      },
      {
        id: uuidv4(),
        type: 'paragraph',
        content:
          'El puma es un cazador solitario y territorial con extraordinarias capacidades físicas. Puede saltar hasta 5 metros de altura y correr a 80 km/h. Su visión nocturna y oído agudo lo convierten en un depredador eficiente que caza principalmente al amanecer y atardecer.',
      },
      {
        id: uuidv4(),
        type: 'heading',
        level: 2,
        content: 'Rol ecológico',
      },
      {
        id: uuidv4(),
        type: 'paragraph',
        content:
          'Como depredador tope, el puma regula las poblaciones de herbívoros, manteniendo el equilibrio del ecosistema. Su presencia indica la salud del ambiente. En la Patagonia, es crucial para controlar las poblaciones de guanacos y especies introducidas.',
      },
    ]),
  },
  {
    scientificName: 'Spheniscus humboldti',
    commonName: 'Pingüino de Humboldt',
    kingdom: 'Animalia',
    phylum: 'Chordata',
    class: 'Aves',
    order: 'Sphenisciformes',
    family: 'Spheniscidae',
    mainGroup: 'bird',
    specificCategory: 'Ave marina',
    conservationStatus: 'vulnerable' as const,
    habitat: 'Costa del Pacífico, desde Perú hasta el centro-sur de Chile',
    distribution: {
      type: 'LineString',
      coordinates: [
        [-70, -18],
        [-70, -37],
      ],
    },
    description:
      'El pingüino de Humboldt es una especie endémica de la corriente de Humboldt. Estas aves marinas no voladoras son excelentes nadadores y forman colonias en islas y costas rocosas.',
    distinctiveFeatures: 'Ave marina no voladora, plumaje blanco y negro, banda negra en pecho',
    richContent: createRichContent([
      {
        id: uuidv4(),
        type: 'heading',
        level: 2,
        content: 'Adaptaciones marinas',
      },
      {
        id: uuidv4(),
        type: 'paragraph',
        content:
          'Sus alas modificadas en aletas les permiten nadar a velocidades de hasta 30 km/h. El plumaje denso e impermeable, con 100 plumas por cm², los aísla del agua fría. Pueden bucear hasta 70 metros de profundidad en busca de alimento.',
      },
      {
        id: uuidv4(),
        type: 'heading',
        level: 2,
        content: 'Vida en colonia',
      },
      {
        id: uuidv4(),
        type: 'paragraph',
        content:
          'Forman colonias reproductivas en islas como Chañaral, Choros y Damas. Anidan en cuevas excavadas en guano o grietas rocosas. Son monógamos durante la temporada reproductiva y ambos padres cuidan los huevos y polluelos.',
      },
    ]),
  },
] as NewSpecies[]

// Chilean protected areas data
export const protectedAreasData = [
  {
    name: 'Parque Nacional Torres del Paine 1',
    type: 'national_park' as const,
    area: 242242,
    creationYear: 1959,
    description:
      'Torres del Paine es uno de los parques más emblemáticos de Chile, reconocido mundialmente por sus espectaculares formaciones graníticas, glaciares, lagos turquesa y rica biodiversidad patagónica.',
    ecosystems: ['Estepa patagónica', 'Bosque magallánico', 'Matorral preandino', 'Desierto andino'],
    region: 'magallanes',
    location: {
      type: 'Point',
      coordinates: [-73.4068, -50.9423],
    },
    visitorInformation: {
      schedule: 'Octubre a abril: 6:00 - 22:00, Mayo a septiembre: 8:00 - 18:00',
      contact: 'CONAF Magallanes: +56 61 223 8581',
      entranceFee: 'Adultos: $21.000, Niños: $5.200',
      facilities: ['Camping', 'Refugios', 'Centro de visitantes', 'Senderos señalizados'],
    },
    richContent: createRichContent([
      {
        id: uuidv4(),
        type: 'heading',
        level: 2,
        content: 'Geografía y paisaje',
      },
      {
        id: uuidv4(),
        type: 'paragraph',
        content:
          'El parque destaca por el macizo del Paine, con sus icónicas torres de granito que se elevan hasta 2.800 metros. Los Cuernos del Paine, formados por capas de roca sedimentaria y granito, crean un contraste visual único. Numerosos glaciares alimentan lagos de aguas turquesa como el Pehoé y el Nordenskjöld.',
      },
      {
        id: uuidv4(),
        type: 'heading',
        level: 2,
        content: 'Rutas de trekking',
      },
      {
        id: uuidv4(),
        type: 'paragraph',
        content:
          'El circuito "W" de 4-5 días y el circuito "O" de 8-10 días son las rutas más populares. Otros senderos incluyen la base de las Torres, el Valle del Francés y el Mirador Grey. Todos requieren registro previo y respeto por las normas del parque.',
      },
    ]),
  },
  {
    name: 'Parque Nacional Lauca',
    type: 'national_park' as const,
    area: 137883,
    creationYear: 1970,
    description:
      'Ubicado en el altiplano chileno a más de 4.000 metros de altitud, el Parque Nacional Lauca es parte de la Reserva de la Biosfera Lauca y destaca por sus volcanes, lagunas altiplánicas y fauna adaptada a la altura.',
    ecosystems: ['Altiplano', 'Bofedales', 'Tolar', 'Pajonal'],
    region: 'arica_parinacota',
    location: {
      type: 'Point',
      coordinates: [-69.2667, -18.2333],
    },
    visitorInformation: {
      schedule: 'Todo el año: 8:00 - 18:00',
      contact: 'CONAF Arica: +56 58 258 5570',
      entranceFee: 'Adultos: $3.000, Niños: $1.500',
      facilities: ['Centro CONAF', 'Miradores', 'Senderos', 'Áreas de picnic'],
    },
    richContent: createRichContent([
      {
        id: uuidv4(),
        type: 'heading',
        level: 2,
        content: 'Paisaje volcánico',
      },
      {
        id: uuidv4(),
        type: 'paragraph',
        content:
          'Los volcanes Parinacota (6.342 m) y Pomerape (6.282 m), conocidos como Payachatas, dominan el paisaje. El lago Chungará, uno de los más altos del mundo a 4.520 metros, refleja estos colosos volcánicos creando vistas espectaculares.',
      },
      {
        id: uuidv4(),
        type: 'heading',
        level: 2,
        content: 'Cultura aymara',
      },
      {
        id: uuidv4(),
        type: 'paragraph',
        content:
          'El parque incluye poblados aymaras como Parinacota, con su iglesia colonial del siglo XVII. Las comunidades mantienen prácticas ancestrales de pastoreo de camélidos y ceremonias tradicionales. El respeto por la Pachamama es fundamental en la cosmovisión local.',
      },
    ]),
  },
  {
    name: 'Parque Nacional Rapa Nui 1',
    type: 'national_park' as const,
    area: 7130,
    creationYear: 1935,
    description:
      'Patrimonio de la Humanidad UNESCO, el Parque Nacional Rapa Nui protege el legado arqueológico de la cultura Rapa Nui, incluyendo cerca de 1.000 moai y sitios ceremoniales únicos en el mundo.',
    ecosystems: ['Pradera oceánica', 'Vegetación litoral', 'Bosque tropical relicto'],
    region: 'valparaiso',
    location: {
      type: 'Point',
      coordinates: [-109.3497, -27.1127],
    },
    visitorInformation: {
      schedule: 'Todo el año: 9:00 - 17:00',
      contact: 'CONAF Isla de Pascua: +56 32 210 0570',
      entranceFee: 'Adultos: $80.000, Niños: $40.000',
      facilities: ['Centro de interpretación', 'Guías locales', 'Senderos arqueológicos'],
    },
    richContent: createRichContent([
      {
        id: uuidv4(),
        type: 'heading',
        level: 2,
        content: 'Patrimonio arqueológico',
      },
      {
        id: uuidv4(),
        type: 'paragraph',
        content:
          'Los moai, estatuas monolíticas talladas en toba volcánica, son el símbolo de Rapa Nui. Existen 887 moai catalogados, desde 2 hasta 21 metros de altura. Los ahu (plataformas ceremoniales) como Tongariki, con 15 moai, muestran la sofisticación de esta civilización polinésica.',
      },
    ]),
  },
] as ProtectedArea[]

// News data
export const newsData = [
  {
    title: 'Nacen tres crías de huemul en Parque Nacional Cerro Castillo',
    category: 'conservation' as const,
    author: 'María González',
    summary:
      'Guardaparques registran el nacimiento de tres crías de huemul en el Parque Nacional Cerro Castillo, una esperanzadora noticia para esta especie en peligro de extinción.',
    content: createRichContent([
      {
        id: uuidv4(),
        type: 'paragraph',
        content:
          'En un hecho que llena de esperanza a la comunidad conservacionista, guardaparques del Parque Nacional Cerro Castillo confirmaron el nacimiento de tres crías de huemul durante la temporada reproductiva 2024. Los avistamientos se realizaron mediante cámaras trampa instaladas en sectores remotos del parque.',
      },
      {
        id: uuidv4(),
        type: 'heading',
        level: 2,
        content: 'Monitoreo exitoso',
      },
      {
        id: uuidv4(),
        type: 'paragraph',
        content:
          'El equipo de guardaparques, liderado por el jefe de conservación Roberto Sanhueza, ha implementado un sistema de monitoreo no invasivo que permite seguir a la población de huemules sin perturbar su hábitat.',
      },
      {
        id: uuidv4(),
        type: 'blockquote',
        content:
          'Estos nacimientos representan un rayo de esperanza para el huemul. Cada cría que sobrevive es un paso más hacia la recuperación de esta especie emblemática de nuestra fauna patagónica.',
      },
    ]),
    tags: ['huemul', 'conservación', 'Cerro Castillo', 'reproducción'],
  },
  {
    title: 'Descubren nueva especie de orquídea en bosques de la Región de Los Ríos',
    category: 'research' as const,
    author: 'Dr. Carlos Mendoza',
    summary:
      'Investigadores de la Universidad Austral identifican una nueva especie de orquídea endémica en la Cordillera de la Costa, destacando la importancia de proteger estos ecosistemas.',
    content: createRichContent([
      {
        id: uuidv4(),
        type: 'paragraph',
        content:
          'Un equipo de botánicos de la Universidad Austral de Chile ha descubierto una nueva especie de orquídea en los bosques templados de la Cordillera de la Costa en la Región de Los Ríos. La especie, nombrada Chloraea valdiviana en honor a la provincia donde fue encontrada, representa un hallazgo significativo para la biodiversidad chilena.',
      },
      {
        id: uuidv4(),
        type: 'heading',
        level: 2,
        content: 'Características únicas',
      },
      {
        id: uuidv4(),
        type: 'paragraph',
        content:
          'La Chloraea valdiviana se distingue por sus flores de color verde pálido con vetas púrpuras y un labelo con patrones únicos. Crece exclusivamente en bosques antiguos de olivillo costero, en simbiosis con hongos micorrízicos específicos del suelo.',
      },
    ]),
    tags: ['orquídea', 'nueva especie', 'Los Ríos', 'biodiversidad'],
  },
] as News[]

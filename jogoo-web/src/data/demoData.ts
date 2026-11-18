// Ported 1:1 from lib/data/demo_data.dart.

import {
  bi,
  same,
  dt,
  type Bi,
  type AppNotification,
  type ChatMessage,
  type Equipment,
  type FarmDocument,
  type FarmInput,
  type FarmProfile,
  type Guide,
  type Invoice,
  type LogEntry,
  type Order,
  type Person,
  type ServiceRequest,
  type SparePart,
  type WateringPlot,
} from './models';

/** Seasonal banner shown on Home (a Dart record in the Flutter app). */
export interface SeasonAlert {
  title: Bi;
  body: Bi;
}

const jogooPhone = '+237653291311';
const jogooPhoneDisplay = '+237 6 53 29 13 11';
const whatsAppNumber = '237653291311';

const dripPhoto = 'images/drip_line.jpg';
const fieldPhoto = 'images/field.jpg';

const profile: FarmProfile = {
  clientName: 'Royking Niba',
  firstName: 'Royking',
  clientSince: dt(2026, 3),
  location: 'Obala, Centre',
  areaHa: 3,
  crops: [
    bi('Tomato', 'Tomate'),
    bi('Chilli pepper', 'Piment'),
    bi('Cucumber', 'Concombre'),
  ],
};

const sergeMbida: Person = {
  name: 'Serge Mbida',
  role: bi('Pump technician', 'Technicien pompe'),
  phone: '+237677000101',
};

const paulAteba: Person = {
  name: 'Paul Ateba',
  role: bi('Driver', 'Chauffeur'),
  phone: '+237677000202',
};

const equipment: Equipment[] = [
  {
    id: 'drip-kit',
    name: bi('Drip kit, 2 ha', 'Kit goutte-à-goutte, 2 ha'),
    shortName: bi('Drip kit', 'Goutte-à-goutte'),
    serial: 'DK2-0312',
    health: 'dueSoon',
    healthNote: bi('Filter due in 12 days', 'Filtre à changer dans 12 jours'),
    installedOn: dt(2026, 3, 12),
    warrantyMonths: 24,
    warrantyMonthsLeft: 17,
    icon: 'water_drop_outlined',
    tone: 'lime',
    photo: fieldPhoto,
    lastService: dt(2026, 7, 2),
    nextVisit: dt(2026, 10, 9),
    maintenance: [
      {
        title: bi('Lines flushed', 'Lignes rincées'),
        state: 'done',
        date: dt(2026, 7, 2),
      },
      {
        title: bi('System check-up', 'Contrôle du système'),
        state: 'current',
        date: dt(2026, 10, 9),
        note: bi('with your pump visit', 'avec la visite pompe'),
      },
      {
        title: bi('New filter cartridge', 'Nouvelle cartouche filtre'),
        state: 'due',
        date: dt(2026, 10, 18),
        price: 18500,
        partCode: 'DF-120',
      },
    ],
  },
  {
    id: 'solar-pump',
    name: bi('Solar pump, 3 kW', 'Pompe solaire, 3 kW'),
    shortName: bi('Solar pump', 'Pompe solaire'),
    serial: 'SP3-0412',
    health: 'open',
    healthNote: bi('Visit Fri 9 Oct', 'Visite ven. 9 oct.'),
    installedOn: dt(2026, 3, 12),
    warrantyMonths: 24,
    warrantyMonthsLeft: 17,
    icon: 'wb_sunny_outlined',
    tone: 'pink',
    lastService: dt(2026, 7, 2),
    nextVisit: dt(2026, 10, 9, 10),
    maintenance: [
      {
        title: bi('Panels cleaned', 'Panneaux nettoyés'),
        state: 'done',
        date: dt(2026, 7, 2),
      },
      {
        title: bi('Pump pressure check', 'Contrôle de pression'),
        state: 'current',
        date: dt(2026, 10, 9),
        note: bi('request SR-1042', 'demande SR-1042'),
      },
    ],
  },
  {
    id: 'greenhouse',
    name: bi('Greenhouse 8×30 m', 'Serre 8×30 m'),
    shortName: bi('Greenhouse', 'Serre'),
    serial: 'GH8-0520',
    health: 'good',
    healthNote: bi('Tomatoes · all good', 'Tomates · tout va bien'),
    installedOn: dt(2026, 9, 2),
    warrantyMonths: 36,
    warrantyMonthsLeft: 33,
    icon: 'foundation_outlined',
    tone: 'lime',
    lastService: dt(2026, 9, 29),
    maintenance: [
      {
        title: bi('Door repaired', 'Porte réparée'),
        state: 'done',
        date: dt(2026, 9, 29),
      },
      {
        title: bi('Film tension check', 'Contrôle de la bâche'),
        state: 'pending',
        date: dt(2027, 1, 15),
      },
    ],
  },
];

const spareParts: SparePart[] = [
  {
    code: 'DF-120',
    name: bi('Disc filter cartridge', 'Cartouche filtre à disques'),
    price: 18500,
    equipmentId: 'drip-kit',
    icon: 'radio_button_checked',
    tone: 'orange',
    dueOn: dt(2026, 10, 18),
  },
  {
    code: 'DL-16',
    name: bi('Dripline 16 mm, 100 m', 'Gaine 16 mm, 100 m'),
    price: 27000,
    equipmentId: 'drip-kit',
    icon: 'water_drop_outlined',
    tone: 'cyan',
  },
  {
    code: 'GV-32',
    name: bi('Gate valve 32 mm', 'Vanne 32 mm'),
    price: 9500,
    equipmentId: 'drip-kit',
    icon: 'control_point',
    tone: 'blue',
  },
  {
    code: 'PG-06',
    name: bi('Pressure gauge 0 to 6 bar', 'Manomètre 0 à 6 bar'),
    price: 6000,
    equipmentId: 'drip-kit',
    icon: 'speed',
    tone: 'lime',
  },
  {
    code: 'SP-IMP',
    name: bi('Pump impeller', 'Turbine de pompe'),
    price: 42000,
    equipmentId: 'solar-pump',
    icon: 'cyclone',
    tone: 'pink',
  },
  {
    code: 'SP-CBL',
    name: bi('Solar cable 6 mm², 10 m', 'Câble solaire 6 mm², 10 m'),
    price: 15000,
    equipmentId: 'solar-pump',
    icon: 'cable',
    tone: 'orange',
  },
  {
    code: 'GH-FLM',
    name: bi('Greenhouse film repair tape', 'Ruban de réparation de bâche'),
    price: 7500,
    equipmentId: 'greenhouse',
    icon: 'healing_outlined',
    tone: 'lime',
  },
  {
    code: 'GH-NET',
    name: bi('Insect-proof net 8×30 m', 'Filet insect-proof 8×30 m'),
    price: 58000,
    equipmentId: 'greenhouse',
    icon: 'grid_on',
    tone: 'blue',
  },
];

const usualInput: FarmInput = {
  id: 'npk-25',
  name: bi('NPK 20-20-20, 25 kg', 'NPK 20-20-20, 25 kg'),
  note: bi('Water-soluble fertiliser', 'Engrais hydrosoluble'),
  icon: 'spa_outlined',
  tone: 'lime',
  lastBought: dt(2026, 9, 2),
};

/** Bags of NPK recommended per hectare per season. */
const npkBagsPerHa = 4 / 3;
const npkBagPrice = 32000;

const otherInputs: FarmInput[] = [
  {
    id: 'calcium-nitrate',
    name: bi('Calcium nitrate, 25 kg', 'Nitrate de calcium, 25 kg'),
    note: bi('Last bought {date}', 'Dernier achat le {date}'),
    icon: 'science_outlined',
    tone: 'cyan',
    lastBought: dt(2026, 8, 14),
  },
  {
    id: 'seed-inoculant',
    name: bi('Seed inoculant, 1 kg', 'Inoculant de semences, 1 kg'),
    note: bi('For next sowing', 'Pour le prochain semis'),
    icon: 'grain',
    tone: 'orange',
  },
  {
    id: 'crop-protection',
    name: bi('Crop protection pack', 'Pack protection des cultures'),
    note: bi('Advised for the rainy season', 'Conseillé en saison des pluies'),
    icon: 'shield_outlined',
    tone: 'pink',
  },
];

const serviceRequests: ServiceRequest[] = [
  {
    id: 'SR-1042',
    equipmentId: 'solar-pump',
    title: bi('Pump pressure', 'Pression de la pompe'),
    createdAt: dt(2026, 10, 6, 8, 12),
    technician: sergeMbida,
    visitAt: dt(2026, 10, 9, 10),
    steps: [
      { kind: 'received', at: dt(2026, 10, 6, 8, 12), done: true },
      {
        kind: 'diagnosed',
        title: bi('Likely a clogged filter', 'Filtre probablement colmaté'),
        at: dt(2026, 10, 6, 9, 30),
        done: true,
      },
      { kind: 'booked' },
      { kind: 'fixed' },
    ],
    mediaPaths: [],
    notes: [],
  },
  {
    id: 'SR-1031',
    equipmentId: 'greenhouse',
    title: bi('Greenhouse door', 'Porte de la serre'),
    createdAt: dt(2026, 9, 25, 14),
    technician: sergeMbida,
    visitAt: dt(2026, 9, 29, 9),
    resolvedOn: dt(2026, 9, 29),
    steps: [
      { kind: 'received', at: dt(2026, 9, 25, 14), done: true },
      {
        kind: 'diagnosed',
        title: bi('Hinge bent by wind', 'Charnière tordue par le vent'),
        at: dt(2026, 9, 26, 9),
        done: true,
      },
      { kind: 'booked', at: dt(2026, 9, 26, 10), done: true },
      { kind: 'fixed', at: dt(2026, 9, 29, 11), done: true },
    ],
    mediaPaths: [],
    notes: [],
  },
];

const orders: Order[] = [
  {
    id: 'JG-0418',
    item: bi('Insect-proof net 8×30 m', 'Filet insect-proof 8×30 m'),
    total: 58000,
    orderedOn: dt(2026, 10, 6, 10, 12),
    arrivalWindow: bi('Thu 8 Oct, afternoon', 'Jeu. 8 oct., après-midi'),
    dropOff: 'Obala',
    collectionCode: '4827',
    driver: paulAteba,
    steps: [
      {
        title: bi('Order confirmed', 'Commande confirmée'),
        at: dt(2026, 10, 6, 10, 12),
        done: true,
      },
      {
        title: bi('Packed at Yaoundé hub', 'Préparée au dépôt de Yaoundé'),
        at: dt(2026, 10, 7, 15, 40),
        done: true,
      },
      {
        title: bi('On the road', 'En route'),
        note: bi('driver Paul Ateba', 'chauffeur Paul Ateba'),
        at: dt(2026, 10, 8, 7, 30),
      },
      { title: bi('Ready to collect', 'Prête au retrait') },
    ],
  },
  {
    id: 'JG-0377',
    item: bi('NPK 20-20-20, 25 kg × 4', 'NPK 20-20-20, 25 kg × 4'),
    total: 128000,
    orderedOn: dt(2026, 9, 2, 9),
    delivered: true,
    steps: [
      {
        title: bi('Order confirmed', 'Commande confirmée'),
        at: dt(2026, 9, 2, 9),
        done: true,
      },
      {
        title: bi('Collected', 'Retirée'),
        at: dt(2026, 9, 4, 16),
        done: true,
      },
    ],
  },
];

const invoices: Invoice[] = [
  {
    id: 'F-2026-0418',
    title: bi('Insect-proof net', 'Filet insect-proof'),
    amount: 58000,
    issuedOn: dt(2026, 10, 6),
    paid: false,
  },
  {
    id: 'F-2026-0377',
    title: bi('NPK 20-20-20 × 4', 'NPK 20-20-20 × 4'),
    amount: 128000,
    issuedOn: dt(2026, 9, 2),
    paid: true,
  },
  {
    id: 'F-2026-0112',
    title: bi('Drip kit and solar pump', 'Goutte-à-goutte et pompe solaire'),
    amount: 2450000,
    issuedOn: dt(2026, 3, 12),
    paid: true,
  },
];

const seasonAlert: SeasonAlert = {
  title: bi('Rainy season alert', 'Alerte saison des pluies'),
  body: bi('Watch tomatoes for late blight', 'Surveillez le mildiou des tomates'),
};

const guides: Guide[] = [
  {
    id: 'flush-lines',
    title: bi('Flush your drip lines', 'Rincer vos lignes goutte-à-goutte'),
    kind: 'video',
    minutes: 4,
    icon: 'play_arrow_rounded',
    tone: 'blue',
    photo: dripPhoto,
    savedOffline: true,
    body: bi(
      'Open the end caps of each lateral, run the system for 3 minutes until ' +
        'the water runs clear, then close the caps. Do it once a month and ' +
        'after every fertigation.',
      'Ouvrez les bouchons en bout de chaque latéral, faites tourner le ' +
        "système 3 minutes jusqu'à ce que l'eau soit claire, puis refermez. " +
        'À faire chaque mois et après chaque fertigation.',
    ),
  },
  {
    id: 'clean-filter',
    title: bi('Clean the pump filter', 'Nettoyer le filtre de la pompe'),
    kind: 'video',
    minutes: 3,
    icon: 'play_arrow_rounded',
    tone: 'blue',
    photo: fieldPhoto,
    savedOffline: true,
    body: bi(
      'Switch the pump off, open the filter housing, rinse the discs in clean ' +
        'water and check the seal before closing. A clean filter keeps the ' +
        'pressure up.',
      'Arrêtez la pompe, ouvrez le boîtier du filtre, rincez les disques à ' +
        "l'eau propre et vérifiez le joint avant de refermer. Un filtre " +
        'propre garde la pression.',
    ),
  },
  {
    id: 'dry-season',
    title: bi('Dry season watering', 'Arrosage en saison sèche'),
    kind: 'video',
    minutes: 6,
    icon: 'play_arrow_rounded',
    tone: 'blue',
    photo: fieldPhoto,
    savedOffline: true,
    body: bi(
      'Water early in the morning, check the soil at root depth before each ' +
        'cycle and lengthen cycles rather than adding more of them.',
      "Arrosez tôt le matin, vérifiez l'humidité au niveau des racines avant " +
        "chaque cycle et allongez les cycles plutôt que d'en ajouter.",
    ),
  },
  {
    id: 'late-blight',
    title: bi('Tomato late blight', 'Mildiou de la tomate'),
    kind: 'article',
    minutes: 6,
    icon: 'coronavirus_outlined',
    tone: 'pink',
    savedOffline: true,
    body: bi(
      'Late blight shows as brown patches on leaves, often after rain. Remove ' +
        'affected leaves, water only in the morning, keep the foliage dry ' +
        'and ask JOGOO about a protection treatment before it spreads.',
      'Le mildiou apparaît en taches brunes sur les feuilles, souvent après ' +
        'la pluie. Retirez les feuilles touchées, arrosez seulement le ' +
        'matin, gardez le feuillage sec et demandez à JOGOO un traitement ' +
        'avant que la maladie ne se propage.',
    ),
  },
  {
    id: 'chilli-sheet',
    title: bi('Crop sheet: chilli pepper', 'Fiche culture : piment'),
    kind: 'cropSheet',
    minutes: 8,
    icon: 'description_outlined',
    tone: 'lime',
    savedOffline: true,
    body: bi(
      'Chilli pepper likes steady moisture: water every 2 days for about ' +
        '40 minutes on drip, feed with a potassium-rich mix at flowering ' +
        'and harvest every week once fruits colour.',
      "Le piment aime une humidité régulière : arrosez tous les 2 jours " +
        'environ 40 minutes au goutte-à-goutte, apportez un mélange riche ' +
        'en potassium à la floraison et récoltez chaque semaine dès que ' +
        'les fruits colorent.',
    ),
  },
];

const documents: FarmDocument[] = [
  {
    id: 'dk-layout',
    equipmentId: 'drip-kit',
    title: bi('As-built layout plan', "Plan d'implantation"),
    type: 'plan',
    sizeMb: 2.4,
    savedOffline: true,
  },
  {
    id: 'dk-wiring',
    equipmentId: 'drip-kit',
    title: bi('Pump wiring diagram', 'Schéma électrique de la pompe'),
    type: 'electrical',
    sizeMb: 1.1,
    savedOffline: true,
  },
  {
    id: 'dk-warranty',
    equipmentId: 'drip-kit',
    title: bi('Warranty contract', 'Contrat de garantie'),
    type: 'warranty',
    sizeMb: 0.3,
    savedOffline: true,
  },
  {
    id: 'dk-spec',
    equipmentId: 'drip-kit',
    title: bi('System design specification', 'Cahier des charges du système'),
    type: 'specification',
    sizeMb: 3.8,
    savedOffline: false,
  },
  {
    id: 'gh-plan',
    equipmentId: 'greenhouse',
    title: bi('Greenhouse layout plan', 'Plan de la serre'),
    type: 'plan',
    sizeMb: 1.6,
    savedOffline: true,
  },
  {
    id: 'gh-warranty',
    equipmentId: 'greenhouse',
    title: bi('Warranty contract', 'Contrat de garantie'),
    type: 'warranty',
    sizeMb: 0.3,
    savedOffline: true,
  },
  {
    id: 'gh-manual',
    equipmentId: 'greenhouse',
    title: bi('Greenhouse assembly guide', 'Guide de montage de la serre'),
    type: 'manual',
    sizeMb: 4.2,
    savedOffline: false,
  },
  {
    id: 'dk-manual',
    equipmentId: 'drip-kit',
    title: bi('Drip kit user manual', 'Manuel du kit goutte-à-goutte'),
    type: 'manual',
    sizeMb: 2.9,
    savedOffline: true,
  },
];

const logEntries: LogEntry[] = [
  {
    id: 'log-3',
    equipmentId: 'drip-kit',
    type: 'fertigation',
    title: bi(
      'Fertigation: NPK 20-20-20, 2 kg in 200 L',
      'Fertigation : NPK 20-20-20, 2 kg dans 200 L',
    ),
    date: dt(2026, 10, 6),
    loggedBy: 'Royking Niba',
    synced: false,
    checklist: [],
  },
  {
    id: 'log-2',
    equipmentId: 'drip-kit',
    type: 'partReplaced',
    title: bi('Valve replaced, plot B, 32 mm', 'Vanne remplacée, parcelle B, 32 mm'),
    date: dt(2026, 10, 2),
    loggedBy: 'Serge Mbida, JOGOO',
    synced: true,
    checklist: [],
  },
  {
    id: 'log-1',
    equipmentId: 'drip-kit',
    type: 'service',
    title: bi('Lines flushed, filter cleaned', 'Lignes rincées, filtre nettoyé'),
    date: dt(2026, 7, 2),
    loggedBy: 'Serge Mbida, JOGOO',
    synced: true,
    checklist: [],
  },
];

const notifications: AppNotification[] = [
  {
    title: bi('Your order is on the road', 'Votre commande est en route'),
    detail: bi('JG-0418', 'JG-0418'),
    at: dt(2026, 10, 6, 7, 30),
    icon: 'local_shipping_outlined',
    tone: 'cyan',
    unread: true,
  },
  {
    title: bi('Rain this afternoon', 'Pluie cet après-midi'),
    detail: bi(
      'Skip the afternoon drip cycle',
      "Sautez le cycle d'arrosage de l'après-midi",
    ),
    at: dt(2026, 10, 6, 6),
    icon: 'thunderstorm_outlined',
    tone: 'blue',
    unread: true,
  },
  {
    title: bi('Filter cartridge due in 12 days', 'Cartouche filtre dans 12 jours'),
    detail: bi('Drip kit, 2 ha', 'Kit goutte-à-goutte, 2 ha'),
    at: dt(2026, 10, 6, 5),
    icon: 'radio_button_checked',
    tone: 'orange',
  },
  {
    title: bi('Visit confirmed for Fri 9 Oct', 'Visite confirmée le ven. 9 oct.'),
    detail: bi('Solar pump', 'Pompe solaire'),
    at: dt(2026, 10, 5, 16),
    icon: 'event_available_outlined',
    tone: 'lime',
  },
  {
    title: bi('The agronomists replied', 'Les agronomes ont répondu'),
    detail: bi('Watering plan updated', "Plan d'arrosage mis à jour"),
    at: dt(2026, 10, 5, 11),
    icon: 'chat_bubble_outline',
    tone: 'pink',
  },
];

const wateringPlanUpdated = dt(2026, 10, 6);

const wateringPlan: WateringPlot[] = [
  {
    badge: 'A',
    name: bi('Plot A · tomatoes', 'Parcelle A · tomates'),
    schedule: bi('Mornings only, 30 min', 'Le matin uniquement, 30 min'),
    tone: 'pink',
  },
  {
    badge: 'B',
    name: bi('Plot B · chilli pepper', 'Parcelle B · piment'),
    schedule: bi('Every 2 days, 40 min', 'Tous les 2 jours, 40 min'),
    tone: 'orange',
  },
  {
    badge: 'S',
    name: bi('Greenhouse · tomatoes', 'Serre · tomates'),
    schedule: bi('Daily, 20 min', 'Tous les jours, 20 min'),
    tone: 'lime',
  },
];

const agronomistChat: ChatMessage[] = [
  {
    author: 'agronomist',
    sender: bi('JOGOO engineering team', 'Équipe technique JOGOO'),
    text: bi(
      'Your tomatoes are flowering. Switch to a potassium-rich fertigation ' +
        'mix from next week.',
      'Vos tomates sont en fleur. Passez à un mélange de fertigation riche ' +
        'en potassium dès la semaine prochaine.',
    ),
  },
  {
    author: 'client',
    text: same('Thanks. Can you send the mix for 200 L?'),
  },
];

const miaChat: ChatMessage[] = [
  {
    author: 'mia',
    text: bi(
      'Good morning Royking. How can I help today?',
      "Bonjour Royking. Comment puis-je vous aider aujourd'hui ?",
    ),
  },
  {
    author: 'client',
    text: same('My tomato leaves have brown patches since the rains.'),
  },
  { author: 'client', text: same(''), photo: fieldPhoto },
  {
    author: 'mia',
    text: bi(
      'This may be early late blight. Remove the affected leaves and water ' +
        'only in the morning.',
      "Il peut s'agir d'un début de mildiou. Retirez les feuilles touchées " +
        'et arrosez uniquement le matin.',
    ),
    guideId: 'late-blight',
  },
];

/**
 * Demo content for the design persona (Royking Niba, Obala). It stands in
 * for the Supabase/PowerSync data until the backend data model is agreed.
 */
export const DemoData = {
  jogooPhone,
  jogooPhoneDisplay,
  whatsAppNumber,
  dripPhoto,
  fieldPhoto,
  profile,
  sergeMbida,
  paulAteba,
  equipment,
  spareParts,
  usualInput,
  /** Bags of NPK recommended per hectare per season. */
  npkBagsPerHa,
  npkBagPrice,
  otherInputs,
  serviceRequests,
  orders,
  invoices,
  seasonAlert,
  guides,
  documents,
  logEntries,
  notifications,
  wateringPlanUpdated,
  wateringPlan,
  agronomistChat,
  miaChat,
};

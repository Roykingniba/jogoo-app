// JOGOO product catalogue, from "Grand catalogue Jogoo Matériel" (March 2026,
// Irrigation section). One entry per product family; the full code list per
// size stays in the PDF catalogue. Prices are not published: every product is
// "price on request" and the button sends a quote request to JOGOO sales.
import type { IconName } from '../components/Icon';
import { bi, type Bi, type Product, type ProductCategory } from './models';

export type CatalogueCategory = ProductCategory;

export interface CategoryInfo {
  id: CatalogueCategory;
  name: Bi;
  /** No products yet: the shop shows an "ask JOGOO" card instead. */
  comingSoon?: boolean;
  icon?: IconName;
  blurb?: Bi;
}

export const CATEGORIES: CategoryInfo[] = [
  { id: 'dripline', name: bi('Drip lines', 'Gaines goutte à goutte') },
  { id: 'sprinklers', name: bi('Sprinklers', 'Aspersion') },
  { id: 'drippers', name: bi('Drippers', 'Goutteurs') },
  { id: 'dripFittings', name: bi('Drip fittings', 'Raccords goutte à goutte') },
  { id: 'micro', name: bi('Micro-irrigation', 'Micro-irrigation') },
  { id: 'pipes', name: bi('PE & layflat pipes', 'Tuyaux PE et Layflat') },
  { id: 'valves', name: bi('Valves', 'Vannes') },
  { id: 'layflatFittings', name: bi('Layflat fittings', 'Raccords Layflat') },
  { id: 'filtration', name: bi('Filtration & fertigation', 'Filtration et fertigation') },
  { id: 'largeIrrigation', name: bi('Centre pivots', 'Grande irrigation') },
  { id: 'pumping', name: bi('Pumping', 'Pompage') },
  { id: 'automation', name: bi('Automation', 'Automatisation') },
  {
    id: 'fertilisers', name: bi('Fertilisers', 'Engrais'), comingSoon: true, icon: 'science_outlined',
    blurb: bi(
      'Seed inoculants, foliar and base NPK, organo-mineral and micro-nutrient fertilisers, amino-acid biostimulants and soil conditioners.',
      'Inoculation de semences, engrais foliaires et de fond NPK, organominéraux, enrichis aux microéléments, biostimulants aux acides aminés et régulateurs de sol.'),
  },
  {
    id: 'protection', name: bi('Crop protection', 'Protections agricoles'), comingSoon: true, icon: 'shield_outlined',
    blurb: bi(
      'Pond liners, greenhouses (structure and film), windbreak nets and ground-cover film.',
      'Revêtement de bassin, serres agricoles (structure et film), filets brise-vent et film de protection du sol.'),
  },
  {
    id: 'drones', name: bi('Agricultural drones', 'Drones agricoles'), comingSoon: true, icon: 'cyclone',
    blurb: bi('Spraying drones for fertiliser and crop-protection treatments.', "Drones d'épandage pour les traitements et la fertilisation."),
  },
];

type Spec = [Bi, string];
const s = (en: string, fr: string, value: string): Spec => [bi(en, fr), value];

const img = (id: string) => `images/catalog/${id}.jpg`;

interface Entry {
  id: string;
  category: CatalogueCategory;
  name: Bi;
  tagline: Bi;
  description: Bi;
  uses?: Bi[];
  features?: Bi[];
  specs?: Spec[];
  /** Page of the PDF catalogue, so sales can find the codes quickly. */
  page: number;
  photo?: string;
}

const crops = {
  row: bi('Row crops', 'Cultures en ligne'),
  field: bi('Field crops', 'Grandes cultures'),
  veg: bi('Vegetables', 'Maraîchage'),
  greenhouse: bi('Greenhouses', 'Serres'),
  landscape: bi('Landscaping', 'Espaces verts'),
  orchards: bi('Orchards', 'Vergers'),
  vineyards: bi('Vineyards', 'Vignes'),
  olives: bi('Olive trees', 'Oliviers'),
  slopes: bi('Sloping land', 'Terrains en pente'),
  fruit: bi('Fruit crops', 'Arboriculture fruitière'),
};

const dripCommon = [
  bi('Injected dripper, very low CV (< 3 %)', 'Goutteur injecté, CV très faible (< 3 %)'),
  bi('Large filtration area against clogging', 'Grande surface de filtration contre le colmatage'),
  bi('Wide turbulent-flow labyrinth', 'Large labyrinthe à flux turbulent'),
  bi('High UV resistance', 'Haute résistance aux UV'),
  bi('Resists farm chemicals and fertilisers', 'Résiste aux produits chimiques et engrais'),
];

const ENTRIES: Entry[] = [
  // ------------------------------------------------------------- drip lines
  {
    id: 'supernova', category: 'dripline', page: 9, photo: img('supernova'),
    name: bi('Supernova™ thin-wall drip line', 'Gaine goutte à goutte Supernova™'),
    tagline: bi('Cost-effective flat dripper', 'Goutteur plat économique'),
    description: bi('Thin-wall drip line with a small flat integral dripper: the economical choice for seasonal crops.',
      'Gaine à paroi mince avec petit goutteur plat intégré : le choix économique pour les cultures saisonnières.'),
    uses: [crops.row, crops.field, crops.veg, crops.landscape],
    features: dripCommon,
    specs: [
      s('Diameter', 'Diamètre', '16 / 22 / 25 mm'),
      s('Wall thickness', 'Épaisseur de paroi', '0.15–0.40 mm (6–16 mil)'),
      s('Flow at 1 bar', 'Débit à 1 bar', '0.8 – 3.2 l/h'),
      s('Dripper spacing', 'Espacement', '15–120 cm'),
      s('Filtration needed', 'Filtration requise', '125 µm / 120 mesh'),
      s('Standard', 'Norme', 'ISO 9261'),
    ],
  },
  {
    id: 'parallax', category: 'dripline', page: 15, photo: img('parallax'),
    name: bi('Parallax™ drip tape', 'Gaine Parallax™ (drip tape)'),
    tagline: bi('Close spacing at no extra cost', 'Espacement serré sans surcoût'),
    description: bi('Drip tape with a continuous emitter and slit outlet that opens under pressure and closes when the system stops. On the surface or buried.',
      "Gaine avec émetteur continu et fente qui s'ouvre sous pression et se ferme à l'arrêt. En surface ou enterrée."),
    uses: [crops.row, crops.field, crops.veg, crops.greenhouse, crops.landscape],
    features: [
      bi('Closer emitter spacing raises yields', "Espacement serré des émetteurs : meilleurs rendements"),
      bi('Many inlet filters against clogging', "Nombreux filtres d'entrée contre le colmatage"),
      ...dripCommon.slice(2),
    ],
    specs: [
      s('Diameter', 'Diamètre', '16 / 22 / 25 mm'),
      s('Wall thickness', 'Épaisseur de paroi', '0.15–0.40 mm (6–16 mil)'),
      s('Flow at 0.7 bar', 'Débit à 0,7 bar', '0.6 – 1.5 l/h'),
      s('Flow at 1 bar', 'Débit à 1 bar', '0.7 – 1.8 l/h'),
      s('Emitter spacing', 'Espacement', '10–60 cm'),
      s('Filtration needed', 'Filtration requise', '125 µm / 120 mesh'),
    ],
  },
  {
    id: 'hypernova', category: 'dripline', page: 21, photo: img('hypernova'),
    name: bi('Hypernova™ thin-wall drip line', 'Gaine goutte à goutte Hypernova™'),
    tagline: bi('Flat dripper, high clog resistance', 'Goutteur plat très anti-colmatage'),
    description: bi('Thin-wall drip line with a larger flat dripper and inlet filters for water that is not perfectly clean.',
      "Gaine à paroi mince avec goutteur plat et grands filtres d'entrée, pour une eau pas toujours parfaitement propre."),
    uses: [crops.row, crops.field, crops.veg, crops.greenhouse, crops.landscape],
    features: dripCommon,
    specs: [
      s('Diameter', 'Diamètre', '16 / 22 / 25 mm'),
      s('Wall thickness', 'Épaisseur de paroi', '0.15–0.60 mm (6–24 mil)'),
      s('Flow at 1 bar', 'Débit à 1 bar', '1.2 / 1.6 / 2.0 / 3.2 l/h'),
      s('Dripper spacing', 'Espacement', '15–120 cm'),
      s('Filtration needed', 'Filtration requise', '125 µm / 120 mesh'),
    ],
  },
  {
    id: 'macronova', category: 'dripline', page: 26, photo: img('macronova'),
    name: bi('Macronova™ medium/heavy-wall drip line', 'Gaine goutte à goutte Macronova™'),
    tagline: bi('Multi-season line for trees and vines', 'Gaine pluriannuelle pour arbres et vignes'),
    description: bi('Medium to heavy-wall drip line built to last several seasons in orchards, vineyards and greenhouses.',
      'Gaine à paroi moyenne à épaisse conçue pour durer plusieurs saisons en vergers, vignes et serres.'),
    uses: [crops.fruit, crops.vineyards, crops.olives, crops.greenhouse, crops.row],
    features: dripCommon,
    specs: [
      s('Diameter', 'Diamètre', '16 / 20 mm'),
      s('Wall thickness', 'Épaisseur de paroi', '0.70–1.10 mm (28–44 mil)'),
      s('Flow at 1 bar', 'Débit à 1 bar', '1.2 / 1.6 / 2.0 / 3.2 l/h'),
      s('Dripper spacing', 'Espacement', '20–120 cm'),
      s('Filtration needed', 'Filtration requise', '125 µm / 120 mesh'),
    ],
  },
  {
    id: 'dynomin', category: 'dripline', page: 30, photo: img('dynomin'),
    name: bi('Dynomin™ heavy-wall drip line', 'Gaine goutte à goutte Dynomin™'),
    tagline: bi('Cylindrical dripper with 4 outlets', 'Goutteur cylindrique à 4 sorties'),
    description: bi('Heavy-wall drip line with a cylindrical dripper and four outlets per dripper. Black or brown.',
      'Gaine à paroi épaisse avec goutteur cylindrique et quatre sorties par goutteur. Noire ou marron.'),
    uses: [crops.landscape, crops.vineyards, crops.greenhouse, crops.row, crops.orchards],
    features: [bi('Four outlets per dripper', 'Quatre sorties par goutteur'), bi('Filters on both sides', 'Filtres des deux côtés'), ...dripCommon.slice(2)],
    specs: [
      s('Diameter', 'Diamètre', '16 / 20 mm'),
      s('Wall thickness', 'Épaisseur de paroi', '0.80–1.20 mm (32–48 mil)'),
      s('Flow at 1 bar', 'Débit à 1 bar', '1.0 / 2.0 / 4.0 l/h'),
      s('Dripper spacing', 'Espacement', '20–120 cm'),
      s('Colours', 'Couleurs', 'Black / Brown – Noir / Marron'),
    ],
  },
  {
    id: 'mercure-pc', category: 'dripline', page: 36, photo: img('mercure-pc'),
    name: bi('Mercure PC™ pressure-compensated drip line', 'Gaine autorégulante Mercure PC™'),
    tagline: bi('Even flow on slopes and long runs', 'Débit égal en pente et sur grandes longueurs'),
    description: bi('Pressure-compensating drip line with a silicone diaphragm and anti-siphon, ideal on slopes and for sub-surface drip.',
      'Gaine autorégulante à membrane silicone et anti-siphon, idéale en pente et en goutte à goutte enterré.'),
    uses: [crops.slopes, crops.orchards, crops.field, crops.olives, crops.greenhouse, crops.vineyards, crops.veg],
    features: [
      bi('Anti-siphon: ideal buried', 'Anti-siphon : idéal enterré'),
      bi('Self-cleaning silicone diaphragm', 'Membrane silicone autonettoyante'),
      bi('Filter behind the diaphragm', 'Filtration derrière la membrane'),
      bi('High UV resistance', 'Haute résistance aux UV'),
    ],
    specs: [
      s('Diameter', 'Diamètre', '16 / 20 / 22 / 25 mm'),
      s('Wall thickness', 'Épaisseur de paroi', '0.40–1.10 mm (16–44 mil)'),
      s('Flow', 'Débit', '1.0 / 1.6 / 2.0 l/h'),
      s('Compensating range', 'Plage de régulation', '0.5–3.5 bar'),
      s('Dripper spacing', 'Espacement', '20–200 cm'),
    ],
  },
  {
    id: 'dynomac-pc', category: 'dripline', page: 41, photo: img('dynomac-pc'),
    name: bi('Dynomac PC™ pressure-compensated drip line', 'Gaine autorégulante Dynomac PC™'),
    tagline: bi('Heavy-wall PC line for trees and nuts', 'Gaine autorégulante épaisse pour arbres'),
    description: bi('Heavy-wall pressure-compensating line with a 4-outlet dripper and anti-siphon. For orchards, vineyards and nut trees. Black or brown.',
      'Gaine autorégulante épaisse, goutteur à 4 sorties et anti-siphon. Pour vergers, vignes et fruits à coque. Noire ou marron.'),
    uses: [crops.slopes, crops.orchards, crops.olives, crops.vineyards, bi('Almonds, walnuts, pistachios', 'Amandiers, noyers, pistachiers')],
    features: [
      bi('Anti-siphon: ideal buried', 'Anti-siphon : idéal enterré'),
      bi('Four outlets per dripper', 'Quatre sorties par goutteur'),
      bi('Self-cleaning silicone diaphragm', 'Membrane silicone autonettoyante'),
    ],
    specs: [
      s('Diameter', 'Diamètre', '16 / 20 mm'),
      s('Wall thickness', 'Épaisseur de paroi', '0.80–1.20 mm (32–48 mil)'),
      s('Flow at 1 bar', 'Débit à 1 bar', '1.0 / 2.0 / 4.0 l/h'),
      s('Dripper spacing', 'Espacement', '20–120 cm'),
    ],
  },

  // ------------------------------------------------------------- sprinklers
  {
    id: 'impact-sprinkler-half', category: 'sprinklers', page: 48, photo: img('impact-sprinkler-half'),
    name: bi('½" impact sprinkler', 'Asperseur à impact ½"'),
    tagline: bi('24 m wetted diameter', "24 m de diamètre d'arrosage"),
    description: bi('360° under-canopy impact sprinkler for vegetables, potatoes, carrots, lawns and frost protection.',
      'Asperseur à impact 360° sous frondaison pour légumes, pommes de terre, carottes, gazons et antigel.'),
    uses: [crops.field, crops.veg, bi('Lawns and fodder', 'Gazons et fourrages'), bi('Frost protection', 'Antigel')],
    features: [bi('Good coverage at 14 × 14 m', 'Bonne répartition en 14 × 14 m'), bi('UV, chemical and corrosion resistant', 'Résiste aux UV, produits chimiques et à la corrosion')],
    specs: [
      s('Jet angle', 'Angle du jet', '11°'),
      s('Max. wetted diameter', "Diamètre d'arrosage max.", '24 m'),
      s('Nozzles', 'Buses', '1.8 / 2.5 / 3.0 / 3.2 mm'),
    ],
  },
  {
    id: 'impact-sprinkler-3q', category: 'sprinklers', page: 50, photo: img('impact-sprinkler-3q'),
    name: bi('¾" impact sprinkler', 'Asperseur à impact ¾"'),
    tagline: bi('30 m wetted diameter', "30 m de diamètre d'arrosage"),
    description: bi('360° impact sprinkler for open-field irrigation with wide spacing.',
      'Asperseur à impact 360° pour les pleins champs avec grand espacement.'),
    uses: [crops.field],
    features: [bi('Good coverage at 24 × 24 m', 'Bonne répartition en 24 × 24 m'), bi('UV, chemical and corrosion resistant', 'Résiste aux UV, produits chimiques et à la corrosion')],
    specs: [
      s('Jet angle', 'Angle du jet', '17°'),
      s('Max. wetted diameter', "Diamètre d'arrosage max.", '30 m'),
      s('Nozzles', 'Buses', '2.3 / 3.8 / 4.5 / 5.0 mm'),
    ],
  },
  {
    id: 'sprinkler-risers', category: 'sprinklers', page: 93, photo: img('sprinkler-risers'),
    name: bi('Sprinkler risers & accessories', "Cannes et accessoires d'aspersion"),
    tagline: bi('Risers, valves, couplings, bases', 'Cannes, vannes, raccords, semelles'),
    description: bi('Everything to stand a sprinkler on the line: riser shut-off valve, 1" PE and PVC risers (25–200 cm), threaded couplings, reducers and bases.',
      "Tout pour monter un asperseur : vanne pour canne, cannes PE et PVC 1\" (25 à 200 cm), jonctions filetées, manchons réduits et semelles."),
    specs: [s('Thread', 'Filetage', '1" (½" and ¾" heads – têtes ½" et ¾")'), s('Riser lengths', 'Longueurs de canne', '25 – 200 cm')],
  },

  // ------------------------------------------------------------- drippers
  {
    id: 'katic-pc', category: 'drippers', page: 53, photo: img('katic-pc'),
    name: bi('Katic PC online dripper', 'Goutteur en ligne Katic PC'),
    tagline: bi('Pressure-compensated, 2.3 – 8.4 l/h', 'Autorégulant, 2,3 à 8,4 l/h'),
    description: bi('Pressure-compensating dripper you plug into the pipe; it can be removed at any time.',
      'Goutteur autorégulant à piquer sur le tuyau, démontable à tout moment.'),
    uses: [crops.orchards, crops.olives, crops.greenhouse, crops.slopes],
    features: [bi('Self-cleaning', 'Autonettoyant'), bi('Wide filtration area', 'Large surface de filtration'), bi('UV and chemical resistant', 'Résiste aux UV et produits chimiques')],
    specs: [
      s('Flow', 'Débit', '2.30 (black / noir) · 3.75 (red / rouge) · 8.40 l/h (green / vert)'),
      s('Working pressure', 'Pression de travail', '0.5 – 3.0 bar'),
      s('Standard', 'Norme', 'ISO 9261'),
    ],
  },
  {
    id: 'adjustable-dripper', category: 'drippers', page: 56, photo: img('adjustable-dripper'),
    name: bi('Adjustable online dripper', 'Goutteur en ligne réglable'),
    tagline: bi('0–70 or 0–100 l/h', '0 à 70 ou 0 à 100 l/h'),
    description: bi('Plug-in dripper with a cap you turn to set the flow, for trees and greenhouse pots.',
      'Goutteur à piquer avec bouchon réglable pour ajuster le débit, pour arbres et pots en serre.'),
    uses: [crops.orchards, crops.olives, crops.greenhouse, crops.slopes],
    specs: [s('Flow', 'Débit', '0 – 70 l/h · 0 – 100 l/h'), s('Pack', 'Conditionnement', '100 / bag – sac')],
  },

  // ------------------------------------------------------------- drip fittings
  {
    id: 'start-connectors', category: 'dripFittings', page: 58, photo: img('start-connectors'),
    name: bi('Start connectors', 'Départs'),
    tagline: bi('From the main pipe to the drip line', 'Du porte-rampe à la gaine'),
    description: bi('Connect drip tape or drip line to the PE or layflat sub-main: grommet, barbed, threaded, lock-type and layflat starters with ring or nut.',
      'Relient la gaine plate ou rigide au porte-rampe PE ou Layflat : départs grommet, cannelés, filetés, locktype et Layflat, à bague ou à écrou.'),
    specs: [s('Sizes', 'Tailles', '13 – 25 mm · ½" – ¾"')],
  },
  {
    id: 'mini-valves', category: 'dripFittings', page: 62, photo: img('mini-valves'),
    name: bi('Mini valves', 'Vannettes'),
    tagline: bi('Open or close each drip line', 'Ouvrir ou fermer chaque rampe'),
    description: bi('Start and junction mini valves for drip tape and drip line: grommet, barbed, threaded, compression, lock-type, layflat and 2-way tee versions.',
      'Vannettes de départ et de jonction pour gaine plate et rigide : grommet, cannelées, filetées, à compression, locktype, Layflat et en té 2 voies.'),
    specs: [s('Sizes', 'Tailles', '8 – 25 mm · ½" – ¾"')],
  },
  {
    id: 'drip-couplings', category: 'dripFittings', page: 68, photo: img('drip-couplings'),
    name: bi('Couplings, elbows and tees', 'Raccords, jonctions, coudes et tés'),
    tagline: bi('Join, bend and split drip lines', 'Joindre, couder et dériver les rampes'),
    description: bi('Straight couplings, reducers, elbows and tees for drip tape and drip line, with ring, nut, barbed, threaded or lock-type ends.',
      'Jonctions droites, réductions, coudes et tés pour gaine plate et rigide, à bague, à écrou, cannelés, filetés ou locktype.'),
    specs: [s('Sizes', 'Tailles', '16 – 25 mm · ½" – ¾"')],
  },
  {
    id: 'end-caps', category: 'dripFittings', page: 71, photo: img('end-caps'),
    name: bi('End caps and plugs', 'Bouchons de fin de ligne'),
    tagline: bi('Close the end of each line', "Fermer l'extrémité des rampes"),
    description: bi('End-of-line caps (ring, nut, barbed, figure-8, lock-type), start-hole plugs, threaded plugs and dripper plugging clips.',
      'Bouchons de fin de ligne (bague, écrou, cannelé, huit, locktype), bouchons de départ, bouchons filetés et clips de bouchage de goutteur.'),
    specs: [s('Sizes', 'Tailles', '16 – 25 mm · ½" – 1"')],
  },
  {
    id: 'grommets', category: 'dripFittings', page: 73, photo: img('grommets'),
    name: bi('Rubber grommets', 'Joints caoutchouc'),
    tagline: bi('Seal starters in the PE pipe', 'Étanchéité des départs sur tuyau PE'),
    description: bi('Grooved, straight and conical rubber grommets for start connectors.',
      'Joints rainurés, droits et coniques en caoutchouc pour les départs.'),
    specs: [s('Sizes', 'Tailles', '14 – 25 mm')],
  },
  {
    id: 'manifolds', category: 'dripFittings', page: 74, photo: img('manifolds'),
    name: bi('Manifolds', 'Distributeurs'),
    tagline: bi('2, 4 or 6 drip lines from one outlet', '2, 4 ou 6 rampes depuis une sortie'),
    description: bi('Threaded, grommet and barbed manifolds splitting one outlet into 2, 4 or 6 drip lines.',
      'Distributeurs taraudés, filetés, grommet et cannelés répartissant une sortie en 2, 4 ou 6 rampes.'),
    specs: [s('Sizes', 'Tailles', '16 – 22 mm · ½" – 1"')],
  },
  {
    id: 'drip-tools', category: 'dripFittings', page: 76, photo: img('drip-tools'),
    name: bi('Drip accessories and tools', 'Accessoires et outils goutte à goutte'),
    tagline: bi('Punches, drills, clamps, stakes', 'Poinçons, forets, colliers, crampons'),
    description: bi('Mini sand filters, hooks and ground stakes, clamping clips, nuts, insertion tools, punches, hole saws, stainless clamps for layflat and Teflon tape.',
      "Filtres à sable, crochets et crampons de sol, clips de serrage, écrous, outils d'insertion, poinçons, forets, colliers inox pour Layflat et téflon."),
  },

  // ------------------------------------------------------------- micro-irrigation
  {
    id: 'misters-sprayers', category: 'micro', page: 79, photo: img('misters-sprayers'),
    name: bi('Misters and sprayers', 'Brumisateurs et pulvérisateurs'),
    tagline: bi('Nurseries, greenhouses, cooling', 'Pépinières, serres, rafraîchissement'),
    description: bi('Single, 2-way and 4-way misters (9–36 l/h at 2 bar), angle spray nozzles and hanging sprays (120 l/h at 1 bar).',
      'Brumisateurs simples, 2 et 4 voies (9 à 36 l/h à 2 bar), buses de spray angulaires et sprays pendulaires (120 l/h à 1 bar).'),
    uses: [crops.greenhouse, bi('Nurseries', 'Pépinières')],
  },
  {
    id: 'micro-connectors', category: 'micro', page: 80, photo: img('micro-connectors'),
    name: bi('Micro-irrigation connectors', 'Connecteurs micro-irrigation'),
    tagline: bi('7 mm and 12 mm micro-tube system', 'Système micro-tube 7 mm et 12 mm'),
    description: bi('Micro-tubing (7 mm × 100 m, 12 mm), barbed connectors, tees, check valves, weights, stakes, sprinkler connectors and nozzles.',
      'Micro-tube (7 mm × 100 m, 12 mm), têtes de vipère, jonctions, tés, clapets, contrepoids, piquets, connecteurs et buses pour asperseurs.'),
  },

  // ------------------------------------------------------------- pipes
  {
    id: 'pe-pipes', category: 'pipes', page: 94, photo: img('pe-pipes'),
    name: bi('PE pipes (HDPE / LDPE)', 'Tuyaux polyéthylène (PEHD / PEBD)'),
    tagline: bi('16 – 125 mm, PN 4 to PN 16', '16 à 125 mm, PN 4 à PN 16'),
    description: bi('Polyethylene pipe for irrigation mains, drinking water and fire systems. Flexible, unbreakable and UV resistant.',
      "Tuyau polyéthylène pour réseaux d'irrigation, eau potable et incendie. Souple, incassable et résistant aux UV."),
    features: [bi('High impact and crack resistance', 'Haute résistance aux chocs et aux fissures'), bi('Smooth inner surface', 'Surface interne lisse')],
    specs: [
      s('HDPE PE 100', 'PEHD PE 100', 'PN 6 / 8 / 10 / 16 · Ø 20 – 125 mm'),
      s('LDPE PE 40', 'PEBD PE 40', 'PN 4 / 6 · Ø 16 – 63 mm'),
      s('Coil length', 'Longueur de bobine', '50 – 400 m'),
    ],
  },
  {
    id: 'layflat-hose', category: 'pipes', page: 96, photo: img('layflat-hose'),
    name: bi('Layflat hose (Sunnyhose)', 'Tuyau Layflat (Sunnyhose)'),
    tagline: bi('1½" to 8", up to 10.5 bar', '1½" à 8", jusqu’à 10,5 bar'),
    description: bi('Flexible layflat hose to supply or drain water and to feed drip and sprinkler systems. Easy to move and store. 100 m coils.',
      "Tuyau souple Layflat pour l'approvisionnement ou l'évacuation d'eau et l'alimentation des réseaux goutte à goutte et aspersion. Bobines de 100 m."),
    specs: [
      s('Sizes', 'Dimensions', '40 – 200 mm (1½" – 8")'),
      s('Sunnyhose', 'Sunnyhose', '3 – 5 bar'),
      s('Hi-Sunnyhose', 'Hi-Sunnyhose', '4 – 10.5 bar'),
    ],
  },
  {
    id: 'myb-pipes', category: 'pipes', page: 84, photo: img('myb-pipes'),
    name: bi('MYB quick-coupling pipes', 'Tubes MYB à crochets (couverture intégrale)'),
    tagline: bi('Portable sprinkler mains, 50 – 125 mm', 'Réseau mobile d’aspersion, 50 à 125 mm'),
    description: bi('PE100 pipes with hook couplings for portable solid-set sprinkler systems. Light, unbreakable, quick to lay and pick up.',
      "Tubes PE100 à raccords à crochets pour la couverture intégrale en aspersion. Légers, incassables, rapides à poser et à retirer."),
    specs: [s('Diameter', 'Diamètre', '50 – 125 mm'), s('Length', 'Longueur', '5 / 5.85 / 6 m'), s('Pressure', 'Pression', '6 bar')],
  },
  {
    id: 'myb-fittings', category: 'pipes', page: 86, photo: img('myb-fittings'),
    name: bi('Quick-coupling fittings', 'Raccords pour couverture intégrale'),
    tagline: bi('Crosses, tees, elbows, reducers', 'Croix, tés, coudes, réductions'),
    description: bi('Fittings for hook-coupling sprinkler pipes: crosses, tees, reducers, elbows, pump connections, transitions, ball valves, end caps, heads and seals.',
      'Raccords pour tubes à crochets : croix, tés, réductions, coudes, connexions motopompe, transitions, vannes boisseau, bouchons, têtes et joints.'),
    specs: [s('Sizes', 'Dimensions', '50 – 160 mm')],
  },

  // ------------------------------------------------------------- valves
  {
    id: 'pvc-ball-valves', category: 'valves', page: 99, photo: img('pvc-ball-valves'),
    name: bi('PVC ball valves', 'Vannes monobloc en PVC'),
    tagline: bi('½" to 4", threaded or glued', '½" à 4", taraudées ou à coller'),
    description: bi('Monoblock and single-union PVC ball valves, threaded both sides or solvent-weld.',
      'Vannes PVC monobloc et à simple union, taraudées des deux côtés ou à coller.'),
    specs: [s('Sizes', 'Dimensions', '½" – 4"')],
  },
  {
    id: 'double-union-valves', category: 'valves', page: 100, photo: img('double-union-valves'),
    name: bi('PVC double-union valves', 'Vannes PVC double union'),
    tagline: bi('2" to 4", also for buried mains', '2" à 4", aussi pour réseau enterré'),
    description: bi('Double-union PVC ball valves, threaded or solvent-weld, with a riser-key version for buried networks.',
      "Vannes PVC double union, taraudées ou à coller, avec version à canne d'élévation pour réseau enterré."),
    specs: [s('Sizes', 'Dimensions', '2" – 4"')],
  },
  {
    id: 'air-valves', category: 'valves', page: 101, photo: img('air-valves'),
    name: bi('Air and vacuum valves', 'Ventouses et soupapes'),
    tagline: bi('Protect pipes from air and water hammer', 'Protègent le réseau de l’air et des coups de bélier'),
    description: bi('Automatic air release valves and double-acting kinetic air/vacuum valves.',
      'Soupapes à air automatiques et ventouses cinétiques double effet (casse-vide).'),
    specs: [s('Sizes', 'Dimensions', '½" – 2"')],
  },

  // ------------------------------------------------------------- layflat fittings
  {
    id: 'layflat-blue', category: 'layflatFittings', page: 103, photo: img('layflat-blue'),
    name: bi('Layflat fittings – blue series', 'Raccords Layflat – série bleue'),
    tagline: bi('Up to 10 bar', 'Jusqu’à 10 bar'),
    description: bi('Couplings, reducers, threaded adapters and end plugs for layflat hose.',
      'Jonctions, jonctions réduites, adaptateurs filetés et bouchons pour tuyau Layflat.'),
    specs: [s('Sizes', 'Dimensions', '2" – 6"'), s('Max. pressure', 'Pression max.', '10 bar')],
  },
  {
    id: 'layflat-black', category: 'layflatFittings', page: 105, photo: img('layflat-black'),
    name: bi('Layflat fittings – black series', 'Raccords Layflat – série noire'),
    tagline: bi('Up to 6 bar', 'Jusqu’à 6 bar'),
    description: bi('Couplings, reducers, threaded adapters and end plugs for layflat hose.',
      'Jonctions, jonctions réduites, adaptateurs filetés et bouchons pour tuyau Layflat.'),
    specs: [s('Sizes', 'Dimensions', '2" – 6"'), s('Max. pressure', 'Pression max.', '6 bar')],
  },

  // ------------------------------------------------------------- filtration
  {
    id: 'mini-disc-filter', category: 'filtration', page: 108, photo: img('mini-disc-filter'),
    name: bi('Mini plastic disc filter', 'Mini filtre à disque en plastique'),
    tagline: bi('¾" to 2", 5 – 25 m³/h', '¾" à 2", 5 à 25 m³/h'),
    description: bi('Compact disc filter for small drip plots.', 'Filtre à disque compact pour petites parcelles en goutte à goutte.'),
    specs: [s('Connection', 'Raccordement', '¾" – 2"'), s('Flow', 'Débit', '5 – 25 m³/h'), s('Max. pressure', 'Pression max.', '8 bar'), s('Filtration', 'Filtration', '130 µm')],
  },
  {
    id: 'disc-filter', category: 'filtration', page: 109, photo: img('disc-filter'),
    name: bi('Plastic disc filter', 'Filtre à disque en plastique'),
    tagline: bi('2" to 3", 20 – 50 m³/h', '2" à 3", 20 à 50 m³/h'),
    description: bi('Reinforced-polyamide disc filter, plastic or chrome clamp.', 'Filtre à disque en polyamide renforcé, collier plastique ou chromé.'),
    specs: [s('Connection', 'Raccordement', '2" – 3" BSP (NPT on request)'), s('Flow', 'Débit', '20 – 50 m³/h'), s('Filtration', 'Filtration', '130 / 100 / 50 / 20 µm'), s('Max. pressure', 'Pression max.', '8 bar')],
  },
  {
    id: 'double-disc-filter', category: 'filtration', page: 110, photo: img('double-disc-filter'),
    name: bi('Double disc filter', 'Double filtre à disque'),
    tagline: bi('3" to 4", 50 – 80 m³/h', '3" à 4", 50 à 80 m³/h'),
    description: bi('Two disc elements on one body for larger flows.', 'Deux éléments à disques sur un même corps pour les grands débits.'),
    specs: [s('Connection', 'Raccordement', '3" – 4" BSP'), s('Flow', 'Débit', '50 – 80 m³/h'), s('Filtration', 'Filtration', '130 / 100 / 50 / 20 µm'), s('Max. pressure', 'Pression max.', '8 bar')],
  },
  {
    id: 'self-cleaning-disc-filter', category: 'filtration', page: 111, photo: img('self-cleaning-disc-filter'),
    name: bi('Self-cleaning disc filter', 'Filtre à disque autonettoyant'),
    tagline: bi('Automatic backwash, single or double', 'Contre-lavage automatique, simple ou double'),
    description: bi('Disc filter with automatic backwash on time and/or pressure difference, electronic controller (AC/DC).',
      'Filtre à disque à contre-lavage automatique sur temps et/ou différentiel de pression, contrôleur électronique (AC/DC).'),
    specs: [s('Connection', 'Raccordement', '3" BSP'), s('Flow', 'Débit', '50 – 60 m³/h'), s('Pressure', 'Pression', '2 – 8 bar')],
  },
  {
    id: 'self-cleaning-screen-filter', category: 'filtration', page: 114, photo: img('self-cleaning-screen-filter'),
    name: bi('Self-cleaning double screen filter', 'Double filtre à tamis autonettoyant'),
    tagline: bi('3" to 4", 50 – 80 m³/h', '3" à 4", 50 à 80 m³/h'),
    description: bi('Double filter with polyamide and stainless-steel screens and automatic backwash.',
      'Double filtre à tamis polyamide et inox 304 avec contre-lavage automatique.'),
    specs: [s('Connection', 'Raccordement', '3" – 4" BSP'), s('Flow', 'Débit', '50 – 80 m³/h'), s('Filtration', 'Filtration', '200 / 130 / 100 µm'), s('Pressure', 'Pression', '2 – 8 bar')],
  },
  {
    id: 'metal-disc-filter', category: 'filtration', page: 112, photo: img('metal-disc-filter'),
    name: bi('Metal disc filters', 'Filtres à disque en métal'),
    tagline: bi('2" to 4", up to 90 m³/h', '2" à 4", jusqu’à 90 m³/h'),
    description: bi('Steel-body disc filters, single or double, with or without a stand.',
      'Filtres à disque à corps acier, simples ou doubles, avec ou sans support.'),
    specs: [s('Connection', 'Raccordement', '2" – 4"'), s('Flow', 'Débit', '25 – 90 m³/h'), s('Max. pressure', 'Pression max.', '8 bar'), s('Filtration', 'Filtration', '130 µm')],
  },
  {
    id: 'sand-filters', category: 'filtration', page: 115, photo: img('sand-filters'),
    name: bi('Sand media filters', 'Filtres à sable'),
    tagline: bi('Single to quadruple, up to 140 m³/h', 'Simple à quadruple, jusqu’à 140 m³/h'),
    description: bi('Steel sand filters with backwash, for river, pond or dam water rich in organic matter.',
      "Filtres à sable en acier avec contre-lavage, pour l'eau de rivière, de mare ou de barrage chargée en matière organique."),
    specs: [s('Connection', 'Raccordement', '2" – 6"'), s('Flow', 'Débit', '20 – 140 m³/h'), s('Max. pressure', 'Pression max.', '8 bar')],
  },
  {
    id: 'hydrocyclone', category: 'filtration', page: 116, photo: img('hydrocyclone'),
    name: bi('Metal hydrocyclone', 'Hydrocyclone en métal'),
    tagline: bi('Removes sand from borehole water', 'Sépare le sable de l’eau de forage'),
    description: bi('Sand separator placed before the main filter, for borehole and well water.',
      "Séparateur de sable placé avant le filtre principal, pour l'eau de forage et de puits."),
    specs: [s('Connection', 'Raccordement', '2" – 6"'), s('Flow', 'Débit', '25 – 140 m³/h'), s('Max. pressure', 'Pression max.', '8 bar')],
  },
  {
    id: 'fertilizer-tanks', category: 'filtration', page: 116, photo: img('fertilizer-tanks'),
    name: bi('Fertiliser tanks', 'Tanks de fertilisation'),
    tagline: bi('50 to 300 litres', '50 à 300 litres'),
    description: bi('Vertical and horizontal steel tanks to inject fertiliser into the irrigation water, with adapters 2" to 4".',
      "Tanks verticaux et horizontaux en acier pour injecter l'engrais dans l'eau d'irrigation, avec adaptateurs 2\" à 4\"."),
    specs: [s('Volume', 'Volume', '50 / 70 / 100 / 150 / 200 / 300 l'), s('Max. pressure', 'Pression max.', '8 bar')],
  },
  {
    id: 'venturi-injector', category: 'filtration', page: 117, photo: img('venturi-injector'),
    name: bi('Venturi injector kit', 'Kit Venturi'),
    tagline: bi('¾" to 2" fertigation', 'Fertigation ¾" à 2"'),
    description: bi('Venturi injector with suction hose to draw fertiliser solution into the line, no electricity needed.',
      "Injecteur Venturi avec tuyau d'aspiration pour aspirer la solution d'engrais dans le réseau, sans électricité."),
    specs: [s('Connection', 'Raccordement', '¾" / 1" / 1½" / 2"'), s('Suction', 'Aspiration', 'up to – jusqu’à 1 200 l/h')],
  },

  // ------------------------------------------------------------- large irrigation, pumping, automation
  {
    id: 'centre-pivot', category: 'largeIrrigation', page: 118, photo: img('centre-pivot'),
    name: bi('Centre pivot', 'Pivot central'),
    tagline: bi('Up to 95 % of the field irrigated', 'Jusqu’à 95 % de la surface irriguée'),
    description: bi('Galvanised-steel centre pivots with robust gearboxes, weather-proof control panels and precision nozzles, made in Turkey. Designed, delivered and installed by JOGOO.',
      'Pivots en acier galvanisé avec boîtes de vitesses robustes, panneaux de contrôle résistants et buses de précision, fabriqués en Turquie. Étudiés, livrés et installés par JOGOO.'),
    uses: [bi('Maize and other thirsty field crops', 'Maïs et grandes cultures gourmandes en eau')],
    features: [
      bi('Sizing study and custom design', 'Étude préalable et dimensionnement sur mesure'),
      bi('Delivery and installation', 'Livraison et installation'),
      bi('After-sales service across Africa', 'Service après-vente sur toute l’Afrique'),
      bi('Solid warranties', 'Garanties solides'),
    ],
  },
  {
    id: 'pumping-system', category: 'pumping', page: 122, photo: img('pumping-system'),
    name: bi('Pumping systems', 'Systèmes de pompage'),
    tagline: bi('Sized for your water source', 'Dimensionnés pour votre source d’eau'),
    description: bi('Surface, borehole and solar pumping sized by JOGOO engineers for your source and network. Ask for a study.',
      'Pompage de surface, de forage et solaire dimensionné par les ingénieurs JOGOO selon votre source et votre réseau. Demandez une étude.'),
  },
  {
    id: 'automation', category: 'automation', page: 123, photo: img('automation'),
    name: bi('Irrigation automation', "Automatisation de l'irrigation"),
    tagline: bi('Controllers and valves on a schedule', 'Programmateurs et vannes pilotées'),
    description: bi('Controllers, solenoid valves and sensors so your irrigation runs on schedule. Designed with you by JOGOO.',
      "Programmateurs, électrovannes et capteurs pour une irrigation programmée. Étudié avec vous par JOGOO."),
  },
];

/** Shop products: every catalogue entry, price on request. */
export const CATALOGUE: (Product & { details: Entry })[] = ENTRIES.map((e) => ({
  id: e.id,
  name: e.name,
  category: e.category,
  price: 0,
  photo: e.photo ?? img(e.id),
  fitNote: e.tagline,
  addOns: [],
  details: e,
}));

export type CatalogueEntry = Entry;
export const categoryById = (id: CatalogueCategory) => CATEGORIES.find((c) => c.id === id)!;

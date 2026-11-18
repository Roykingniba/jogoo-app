// Choices offered when a client describes their farm. Known choices are saved
// by id (e.g. "tomato") so they show in the reader's language; anything the
// client types themselves is saved and shown as typed.
import type { IconName } from '../components/Icon';
import type { FarmEquipment } from './backend';
import { bi, same, type Bi, type Equipment, type Lang, type Tone } from './models';

export interface Choice {
  id: string;
  label: Bi;
}

export const CROPS: Choice[] = [
  { id: 'tomato', label: bi('Tomato', 'Tomate') },
  { id: 'maize', label: bi('Maize', 'Maïs') },
  { id: 'chilli', label: bi('Chilli pepper', 'Piment') },
  { id: 'sweet-pepper', label: bi('Sweet pepper', 'Poivron') },
  { id: 'cucumber', label: bi('Cucumber', 'Concombre') },
  { id: 'watermelon', label: bi('Watermelon', 'Pastèque') },
  { id: 'onion', label: bi('Onion', 'Oignon') },
  { id: 'cabbage', label: bi('Cabbage', 'Chou') },
  { id: 'okra', label: bi('Okra', 'Gombo') },
  { id: 'potato', label: bi('Potato', 'Pomme de terre') },
  { id: 'cassava', label: bi('Cassava', 'Manioc') },
  { id: 'plantain', label: bi('Plantain / banana', 'Plantain / banane') },
  { id: 'beans', label: bi('Beans', 'Haricots') },
  { id: 'groundnut', label: bi('Groundnut', 'Arachide') },
  { id: 'cocoa', label: bi('Cocoa', 'Cacao') },
  { id: 'coffee', label: bi('Coffee', 'Café') },
];

export const WATER_SOURCES: Choice[] = [
  { id: 'borehole', label: bi('Borehole', 'Forage') },
  { id: 'well', label: bi('Well', 'Puits') },
  { id: 'river', label: bi('River or stream', 'Rivière ou ruisseau') },
  { id: 'lake', label: bi('Lake or dam', 'Lac ou barrage') },
  { id: 'rainwater', label: bi('Rainwater tank', "Citerne d'eau de pluie") },
  { id: 'mains', label: bi('Mains water', 'Eau du réseau') },
];

export const IRRIGATION: Choice[] = [
  { id: 'none', label: bi('None (rain-fed)', 'Aucune (pluie)') },
  { id: 'manual', label: bi('By hand (watering can, hose)', 'À la main (arrosoir, tuyau)') },
  { id: 'drip', label: bi('Drip', 'Goutte-à-goutte') },
  { id: 'sprinkler', label: bi('Sprinklers', 'Aspersion') },
  { id: 'pivot', label: bi('Centre pivot', 'Pivot central') },
  { id: 'furrow', label: bi('Furrow / flood', 'Gravitaire / submersion') },
];

interface Kind extends Choice { icon: IconName; tone: Tone }
export const EQUIPMENT_KINDS: Kind[] = [
  { id: 'pump', label: bi('Pump', 'Pompe'), icon: 'speed', tone: 'blue' },
  { id: 'solar', label: bi('Solar panels', 'Panneaux solaires'), icon: 'wb_sunny_outlined', tone: 'orange' },
  { id: 'drip', label: bi('Drip kit', 'Kit goutte-à-goutte'), icon: 'water_drop_outlined', tone: 'cyan' },
  { id: 'sprinkler', label: bi('Sprinklers', 'Asperseurs'), icon: 'water_drop_outlined', tone: 'lime' },
  { id: 'pivot', label: bi('Centre pivot', 'Pivot central'), icon: 'grid_on', tone: 'pink' },
  { id: 'tank', label: bi('Water tank', "Réservoir d'eau"), icon: 'foundation_outlined', tone: 'blue' },
  { id: 'filter', label: bi('Filter', 'Filtre'), icon: 'shield_outlined', tone: 'cyan' },
  { id: 'other', label: bi('Other', 'Autre'), icon: 'build_outlined', tone: 'lime' },
];

/** The label of a saved choice in the reader's language (typed text as-is). */
export function choiceLabel(list: Choice[], value: string, lang: Lang): string {
  const c = list.find((x) => x.id === value);
  return c ? c.label[lang] : value;
}
export const choiceBi = (list: Choice[], value: string): Bi => list.find((x) => x.id === value)?.label ?? same(value);

/** Turns a row the client saved into the Equipment the screens show. */
export function toEquipment(e: FarmEquipment): Equipment {
  const kind = EQUIPMENT_KINDS.find((k) => k.id === e.kind) ?? EQUIPMENT_KINDS[EQUIPMENT_KINDS.length - 1];
  const installed = e.installedOn ? parseDay(e.installedOn) : undefined;
  return {
    id: e.id ?? '',
    name: same(e.name),
    shortName: same(e.name),
    serial: e.serial ?? '',
    kind: e.kind ?? undefined,
    notes: e.notes ?? undefined,
    installedOn: installed,
    icon: kind.icon,
    tone: kind.tone,
    maintenance: [],
  };
}

/** "2026-03-01" → local date (no time-zone shift). */
export function parseDay(s: string): Date | undefined {
  const [y, m, d] = s.slice(0, 10).split('-').map(Number);
  return y && m && d ? new Date(y, m - 1, d) : undefined;
}
export function dayString(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** Stands in for "no particular equipment" (a visit or problem about the whole farm). */
export const WHOLE_FARM_ID = 'farm';
export const wholeFarmEquipment = (): Equipment => ({
  id: WHOLE_FARM_ID,
  name: bi('Whole farm', "Toute l'exploitation"),
  shortName: bi('Whole farm', "Toute l'exploitation"),
  serial: '',
  icon: 'spa_outlined',
  tone: 'lime',
  maintenance: [],
});

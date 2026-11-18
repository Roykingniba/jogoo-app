// Screen 18: log a fertigation or a repair in seconds.
// Entries only live in this screen's memory for now: they are not sent to JOGOO.
// Ported from lib/screens/new_log_entry_screen.dart.
import { useState, type ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { BottomActionBar, Button, ChoicePill, Divided, JCard, Page, PillRow, ScreenHeader, Stack, useBack } from '../components/ui';
import { showToast } from '../components/overlays';
import { NotFound } from '../components/farm/farmParts';
import { same, type LogEntryType } from '../data/models';
import { useEquipmentById, useEquipmentList, useStore } from '../data/store';
import { useI18n, type T } from '../i18n/i18n';
import { fullDate } from '../utils/format';
import '../styles/farm.css';

const checklistFor = (t: T, type: LogEntryType): string[] => {
  switch (type) {
    case 'fertigation': return [t('checkFilterBeforeInjection'), t('checkTankRinsed'), t('checkLinesFlushed')];
    case 'service': return [t('checkFilterCleaned'), t('checkPressure'), t('checkLeaks')];
    case 'partReplaced': return [t('checkOldPartKept'), t('checkSystemTested')];
  }
};

const pad = (n: number) => String(n).padStart(2, '0');
const toInput = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromInput = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return y && m && d ? new Date(y, m - 1, d) : null;
};

export default function NewLogEntryScreen() {
  const { equipmentId = '' } = useParams();
  if (!useEquipmentById(equipmentId)) return <NotFound />;
  return <NewEntryForm initialEquipmentId={equipmentId} />;
}

function NewEntryForm({ initialEquipmentId }: { initialEquipmentId: string }) {
  const { t, b, lang } = useI18n();
  const back = useBack();
  const profile = useStore((s) => s.profile);
  const equipmentList = useEquipmentList();
  const addLogEntry = useStore((s) => s.addLogEntry);

  const [type, setType] = useState<LogEntryType>('fertigation');
  const [date, setDate] = useState(() => new Date());
  const [equipmentId, setEquipmentId] = useState(initialEquipmentId);
  const [product, setProduct] = useState('');
  const [quantity, setQuantity] = useState('');
  const [water, setWater] = useState('');
  const [work, setWork] = useState('');
  const [checked, setChecked] = useState<Set<number>>(() => new Set());

  const checklist = checklistFor(t, type);
  const today = new Date();
  const yearAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 365);

  const missing = (field: string) => showToast(t('fillIn', { field }), undefined, 'error');

  const save = () => {
    let title: string;
    switch (type) {
      case 'fertigation':
        if (product.trim() === '') return missing(t('product'));
        if (quantity.trim() === '') return missing(t('quantity'));
        if (water.trim() === '') return missing(t('waterVolume'));
        title = t('fertigationEntry', { product: product.trim(), quantity: quantity.trim(), water: water.trim() });
        break;
      case 'service':
        if (work.trim() === '') return missing(t('workDone'));
        title = work.trim();
        break;
      case 'partReplaced':
        if (work.trim() === '') return missing(t('part'));
        title = t('partReplacedEntry', { part: work.trim() });
        break;
    }
    addLogEntry({
      id: `local-${Date.now()}`,
      equipmentId,
      type,
      title: same(title),
      date,
      loggedBy: profile.clientName,
      synced: false,
      checklist: [...checked].sort((a, b2) => a - b2).map((i) => checklist[i]),
    });
    showToast(t('entrySavedTitle'), t('syncLater'));
    back();
  };

  const types: [LogEntryType, string][] = [
    ['service', t('entryService')],
    ['partReplaced', t('entryPartReplaced')],
    ['fertigation', t('entryFertigation')],
  ];

  return (
    <Page narrow>
      <ScreenHeader title={t('newEntry')} close />
      <form id="farm-new-entry" onSubmit={(e) => { e.preventDefault(); save(); }}>
        <Stack>
          <div className="farm-tabs">
            <PillRow>
              {types.map(([key, label]) => (
                <ChoicePill key={key} label={label} selected={type === key}
                  onClick={() => { setType(key); setChecked(new Set()); }} />
              ))}
            </PillRow>
          </div>

          <JCard style={{ padding: '4px 20px' }}>
            <Divided>
              <FieldRow label={t('date')} htmlFor="farm-date">
                <span className="farm-date">
                  {fullDate(lang, date)}
                  <input id="farm-date" type="date" value={toInput(date)} min={toInput(yearAgo)} max={toInput(today)}
                    onClick={(e) => { try { e.currentTarget.showPicker(); } catch { /* not supported */ } }}
                    onChange={(e) => { const d = fromInput(e.target.value); if (d) setDate(d); }} />
                </span>
              </FieldRow>
              <FieldRow label={t('equipment')} htmlFor="farm-eq">
                <select id="farm-eq" className="farm-inline" value={equipmentId} onChange={(e) => setEquipmentId(e.target.value)}>
                  {equipmentList.map((item) => <option key={item.id} value={item.id}>{b(item.name)}</option>)}
                </select>
              </FieldRow>
              {type === 'fertigation' ? (
                <>
                  <FieldRow label={t('product')} htmlFor="farm-product">
                    <input id="farm-product" className="farm-inline" value={product} placeholder="NPK 20-20-20" onChange={(e) => setProduct(e.target.value)} />
                  </FieldRow>
                  <FieldRow label={t('quantity')} htmlFor="farm-qty">
                    <input id="farm-qty" className="farm-inline" value={quantity} placeholder="2 kg" onChange={(e) => setQuantity(e.target.value)} />
                  </FieldRow>
                  <FieldRow label={t('waterVolume')} htmlFor="farm-water">
                    <input id="farm-water" className="farm-inline" value={water} placeholder="200 L" onChange={(e) => setWater(e.target.value)} />
                  </FieldRow>
                </>
              ) : (
                <FieldRow label={type === 'service' ? t('workDone') : t('part')} htmlFor="farm-work">
                  <input id="farm-work" className="farm-inline" value={work} onChange={(e) => setWork(e.target.value)}
                    placeholder={type === 'service' ? t('workDoneHint') : t('partHint')} />
                </FieldRow>
              )}
            </Divided>
          </JCard>

          <JCard>
            <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
              <legend className="t-title-m" style={{ padding: 0, marginBottom: 4 }}>{t('checklist')}</legend>
              {checklist.map((item, i) => (
                <label key={`${type}-${i}`} className="farm-check" style={{ color: checked.has(i) ? 'var(--ink)' : 'var(--muted)' }}>
                  <input type="checkbox" checked={checked.has(i)} onChange={(e) => setChecked((prev) => {
                    const next = new Set(prev);
                    if (e.target.checked) next.add(i); else next.delete(i);
                    return next;
                  })} />
                  {item}
                </label>
              ))}
            </fieldset>
          </JCard>
        </Stack>
      </form>
      <BottomActionBar footer={t('syncLater')}>
        <Button onClick={save}>{t('saveOnPhone')}</Button>
      </BottomActionBar>
    </Page>
  );
}

function FieldRow({ label, htmlFor, children }: { label: string; htmlFor: string; children: ReactNode }) {
  return (
    <div className="farm-field">
      <label htmlFor={htmlFor}>{label}</label>
      {children}
    </div>
  );
}

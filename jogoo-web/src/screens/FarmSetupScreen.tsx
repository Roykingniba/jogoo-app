// Create the client's farm, or edit it later: name, place, size, crops, water,
// irrigation, and any extra details they want to add. Saved to their account.
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, ChoicePill, CircleButton, JCard, Page, PillRow, ScreenHeader, Stack } from '../components/ui';
import { showToast } from '../components/overlays';
import { errorKey } from '../components/account/errors';
import type { Farm, FarmExtra } from '../data/backend';
import { CROPS, IRRIGATION, WATER_SOURCES, choiceLabel, type Choice } from '../data/farm';
import { useStore } from '../data/store';
import { useI18n } from '../i18n/i18n';
import { decimalTrim } from '../utils/format';
import { paths } from '../routes';
import '../styles/farm.css';

export default function FarmSetupScreen() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const existing = useStore((s) => s.farm);
  const saveFarm = useStore((s) => s.saveFarm);
  const editing = existing != null;

  const [name, setName] = useState(existing?.name ?? '');
  const [location, setLocation] = useState(existing?.location ?? '');
  const [area, setArea] = useState(existing?.areaHa != null ? decimalTrim(lang, Number(existing.areaHa)) : '');
  const [crops, setCrops] = useState<string[]>(existing?.crops ?? []);
  const [water, setWater] = useState<string[]>(existing?.waterSources ?? []);
  const [irrigation, setIrrigation] = useState<string | null>(existing?.irrigation ?? null);
  const [extra, setExtra] = useState<FarmExtra[]>(existing?.extra?.length ? existing.extra : []);
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (name.trim() === '') { setError(t('farmNameRequired')); document.getElementById('farm-name')?.focus(); return; }
    const raw = area.trim().replace(',', '.');
    const hectares = raw === '' ? null : Number(raw);
    if (hectares != null && !(Number.isFinite(hectares) && hectares > 0)) {
      setError(t('farmAreaInvalid'));
      document.getElementById('farm-area')?.focus();
      return;
    }
    const farm: Farm = {
      name: name.trim(),
      location: location.trim() || null,
      areaHa: hectares,
      crops,
      waterSources: water,
      irrigation,
      extra: extra.map((x) => ({ label: x.label.trim(), value: x.value.trim() })).filter((x) => x.label || x.value),
      notes: notes.trim() || null,
    };
    setBusy(true);
    setError(null);
    try {
      await saveFarm(farm);
      showToast(editing ? t('farmUpdated') : t('farmCreated'), farm.name);
      if (editing) navigate(-1);
      else navigate(paths.farm, { replace: true });
    } catch (err) {
      setError(t(errorKey(err)));
      setBusy(false);
    }
  };

  return (
    <Page narrow>
      <ScreenHeader title={editing ? t('editFarm') : t('createFarm')} subtitle={editing ? undefined : t('createFarmSubtitle')} />
      <form onSubmit={submit} noValidate>
        <Stack>
          <JCard>
            <h2 className="t-title-m farm-form-h">{t('farmBasics')}</h2>
            <div className="stack" style={{ ['--gap' as string]: '14px' }}>
              <div className="field">
                <label htmlFor="farm-name">{t('farmName')} *</label>
                <input id="farm-name" className="input" value={name} maxLength={120} autoFocus={!editing}
                  placeholder={t('farmNameHint')} onChange={(e) => { setName(e.target.value); setError(null); }} />
              </div>
              <div className="grid g2" style={{ gap: 14 }}>
                <div className="field">
                  <label htmlFor="farm-location">{t('location')}</label>
                  <input id="farm-location" className="input" value={location} maxLength={160}
                    placeholder={t('farmLocationHint')} autoComplete="address-level2" onChange={(e) => setLocation(e.target.value)} />
                </div>
                <div className="field">
                  <label htmlFor="farm-area">{t('farmSize')}</label>
                  <div className="profile-field-suffix">
                    <input id="farm-area" className="input" inputMode="decimal" value={area} placeholder="2.5"
                      onChange={(e) => setArea(e.target.value)} />
                    <span className="sfx" aria-hidden="true">ha</span>
                  </div>
                </div>
              </div>
            </div>
          </JCard>

          <JCard>
            <h2 className="t-title-m farm-form-h" id="crops-h">{t('cropsGrown')}</h2>
            <p className="t-body-m farm-form-help">{t('cropsHelp')}</p>
            <MultiChoice labelledBy="crops-h" options={CROPS} value={crops} onChange={setCrops}
              addLabel={t('addOtherCrop')} addHint={t('otherCropHint')} />
          </JCard>

          <JCard>
            <h2 className="t-title-m farm-form-h" id="water-h">{t('waterSource')}</h2>
            <MultiChoice labelledBy="water-h" options={WATER_SOURCES} value={water} onChange={setWater}
              addLabel={t('addOtherSource')} addHint={t('otherSourceHint')} />
            <h2 className="t-title-m farm-form-h" id="irr-h" style={{ marginTop: 20 }}>{t('currentIrrigation')}</h2>
            <div role="radiogroup" aria-labelledby="irr-h">
              <PillRow wrap>
                {IRRIGATION.map((o) => (
                  <ChoicePill key={o.id} label={o.label[lang]} selected={irrigation === o.id}
                    onClick={() => setIrrigation(irrigation === o.id ? null : o.id)} />
                ))}
              </PillRow>
            </div>
          </JCard>

          <JCard>
            <h2 className="t-title-m farm-form-h">{t('extraDetails')}</h2>
            <p className="t-body-m farm-form-help">{t('extraDetailsHelp')}</p>
            <div className="stack" style={{ ['--gap' as string]: '10px' }}>
              {extra.map((x, i) => (
                <div className="farm-extra-row" key={i}>
                  <input className="input" aria-label={t('detailLabel')} placeholder={t('detailLabelHint')} value={x.label}
                    maxLength={60} onChange={(e) => setExtra((all) => all.map((y, j) => (j === i ? { ...y, label: e.target.value } : y)))} />
                  <input className="input" aria-label={t('detailValue')} placeholder={t('detailValueHint')} value={x.value}
                    maxLength={500} onChange={(e) => setExtra((all) => all.map((y, j) => (j === i ? { ...y, value: e.target.value } : y)))} />
                  <CircleButton icon="delete_outline" label={t('remove')} size={44} outlined color="var(--muted)"
                    onClick={() => setExtra((all) => all.filter((_, j) => j !== i))} />
                </div>
              ))}
              {extra.length < 30 && (
                <div>
                  <Button variant="outlined" small icon="add" onClick={() => setExtra((all) => [...all, { label: '', value: '' }])}>
                    {t('addDetail')}
                  </Button>
                </div>
              )}
            </div>
            <div className="field" style={{ marginTop: 18 }}>
              <label htmlFor="farm-notes">{t('notes')}</label>
              <textarea id="farm-notes" className="textarea" rows={3} value={notes} maxLength={2000}
                placeholder={t('farmNotesHint')} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </JCard>

          {error && <p className="t-body-m" role="alert" style={{ color: 'var(--magenta)', margin: 0 }}>{error}</p>}
          <div className="row" style={{ justifyContent: 'flex-end', gap: 8 }}>
            {editing && <Button variant="text" onClick={() => navigate(-1)} disabled={busy}>{t('cancel')}</Button>}
            <Button type="submit" disabled={busy}>{busy ? t('saving') : editing ? t('save') : t('createFarm')}</Button>
          </div>
        </Stack>
      </form>
    </Page>
  );
}

/** Chips for the usual choices, plus whatever the client types in. */
function MultiChoice({ options, value, onChange, addLabel, addHint, labelledBy }: {
  options: Choice[]; value: string[]; onChange: (v: string[]) => void; addLabel: string; addHint: string; labelledBy: string;
}) {
  const { lang } = useI18n();
  const [other, setOther] = useState('');
  const toggle = (id: string) => onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  const custom = value.filter((v) => !options.some((o) => o.id === v));
  const add = () => {
    const text = other.trim().slice(0, 40);
    if (text === '') return;
    const known = options.find((o) => o.label.en.toLowerCase() === text.toLowerCase() || o.label.fr.toLowerCase() === text.toLowerCase());
    const id = known?.id ?? text;
    if (!value.some((v) => v.toLowerCase() === id.toLowerCase())) onChange([...value, id]);
    setOther('');
  };
  return (
    <div role="group" aria-labelledby={labelledBy}>
      <PillRow wrap>
        {options.map((o) => <ChoicePill key={o.id} label={o.label[lang]} selected={value.includes(o.id)} onClick={() => toggle(o.id)} />)}
        {custom.map((c) => <ChoicePill key={c} label={`${choiceLabel(options, c, lang)} ✕`} selected onClick={() => toggle(c)} />)}
      </PillRow>
      <div className="farm-add-other">
        <input className="input" value={other} placeholder={addHint} aria-label={addLabel} maxLength={40}
          onChange={(e) => setOther(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }} />
        <Button variant="outlined" small icon="add" onClick={add} disabled={other.trim() === ''}>{addLabel}</Button>
      </div>
    </div>
  );
}

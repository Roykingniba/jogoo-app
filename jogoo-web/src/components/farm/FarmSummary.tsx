// The client's farm at a glance (Home, My farm, Profile), and the card that
// invites a new client to create it.
import { useNavigate } from 'react-router-dom';
import { Button, JCard, SectionTitle, StatusPill, TintIcon } from '../ui';
import type { Farm } from '../../data/backend';
import { CROPS, IRRIGATION, WATER_SOURCES, choiceLabel } from '../../data/farm';
import type { Tone } from '../../data/models';
import { useI18n } from '../../i18n/i18n';
import { decimalTrim } from '../../utils/format';
import { paths } from '../../routes';
import '../../styles/farm.css';

const tones: Tone[] = ['lime', 'orange', 'pink', 'blue', 'cyan'];

export function FarmSummary({ farm, full = true, className }: { farm: Farm; full?: boolean; className?: string }) {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const facts: [string, string][] = [];
  if (farm.location) facts.push([t('location'), farm.location]);
  if (farm.areaHa != null) facts.push([t('area'), t('hectares', { value: decimalTrim(lang, Number(farm.areaHa)) })]);
  if (farm.waterSources.length) facts.push([t('waterSource'), farm.waterSources.map((w) => choiceLabel(WATER_SOURCES, w, lang)).join(', ')]);
  if (farm.irrigation) facts.push([t('currentIrrigation'), choiceLabel(IRRIGATION, farm.irrigation, lang)]);
  if (full) for (const x of farm.extra) facts.push([x.label || t('detail'), x.value || '—']);

  return (
    <JCard className={className}>
      <SectionTitle trailing={<Button variant="outlined" small onClick={() => navigate(paths.farmSetup)}>{t('edit')}</Button>}>
        {farm.name}
      </SectionTitle>
      {facts.length > 0 && (
        <dl className="farm-facts">
          {facts.map(([k, v], i) => (
            <div key={i} style={{ minWidth: 0 }}>
              <dt className="k">{k}</dt>
              <dd className="v" style={{ margin: 0 }}>{v}</dd>
            </div>
          ))}
        </dl>
      )}
      {farm.crops.length > 0 && (
        <div className="farm-chips" aria-label={t('cropsGrown')}>
          {farm.crops.map((c, i) => <StatusPill key={c} label={choiceLabel(CROPS, c, lang)} tone={tones[i % tones.length]} />)}
        </div>
      )}
      {full && farm.notes && <p className="t-body-m farm-notes">{farm.notes}</p>}
      {facts.length === 0 && farm.crops.length === 0 && (
        <p className="t-body-m" style={{ margin: '10px 0 0' }}>{t('farmAddMoreDetails')}</p>
      )}
    </JCard>
  );
}

/** Shown until the client has created their farm. */
export function CreateFarmCard({ className }: { className?: string }) {
  const { t } = useI18n();
  const navigate = useNavigate();
  return (
    <JCard className={className}>
      <div className="farm-empty">
        <TintIcon icon="spa_outlined" tone="lime" size={64} />
        <h2 className="t-title-l">{t('createFarmTitle')}</h2>
        <p className="t-body-l">{t('createFarmBody')}</p>
        <Button icon="add" onClick={() => navigate(paths.farmSetup)}>{t('createFarm')}</Button>
      </div>
    </JCard>
  );
}

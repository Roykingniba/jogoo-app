// Screen 12: fertiliser and inputs reordered in one tap.
// Ported from lib/screens/reorder_inputs_screen.dart.
import { useState } from 'react';
import {
  Button, CircleButton, Divided, JCard, ListRow, Page, ScreenHeader, StatusPill, Switch, TintIcon,
} from '../components/ui';
import { showToast } from '../components/overlays';
import { ContactJogooSheet } from '../components/service/ContactJogoo';
import { useI18n } from '../i18n/i18n';
import { bi, type FarmInput } from '../data/models';
import { otherInputs, recommendedBags, usualInput, useStore } from '../data/store';
import { dayMonth, decimalTrim } from '../utils/format';
import '../styles/shop.css';

export default function ReorderInputsScreen() {
  const { t, b, lang } = useI18n();
  const profile = useStore((s) => s.profile);
  const requestFromSales = useStore((s) => s.requestFromSales);
  const seasonReminder = useStore((s) => s.seasonReminder);
  const setSeasonReminder = useStore((s) => s.setSeasonReminder);
  const [bags, setBags] = useState(() => recommendedBags(profile));
  const [added, setAdded] = useState<Set<string>>(() => new Set());
  // 'usual' = the usual order; otherwise the id of another input to ask about.
  const [asking, setAsking] = useState<string | null>(null);
  const askingOther = otherInputs.find((o) => o.id === asking);
  const input = usualInput;
  const area = decimalTrim(lang, profile.areaHa);

  const reorder = () => {
    requestFromSales(bi(`Reorder: ${input.name.en} × ${bags}`, `Réassort : ${input.name.fr} × ${bags}`));
    showToast(t('reorderSavedTitle'), `${t('bags', { count: bags })} · ${b(input.name)}`);
  };

  const addOther = (other: FarmInput) => {
    requestFromSales(bi(`Input request: ${other.name.en}`, `Demande d'intrant : ${other.name.fr}`));
    setAdded((s) => new Set(s).add(other.id));
    showToast(t('requestSavedTitle'), t('requestSavedBody', { item: b(other.name) }));
  };

  const usualNote = [b(input.note), ...(input.lastBought ? [t('lastBought', { date: dayMonth(lang, input.lastBought) })] : [])].join(' · ');

  return (
    <Page narrow>
      <ScreenHeader title={t('reorderTitle')} subtitle={profile.areaHa > 0 ? t('sizedFor', { area }) : undefined} />
      <div className="split even">
        <JCard style={{ paddingTop: 20, paddingBottom: 22 }}>
          <div className="reorder-main">
            {input.lastBought && <StatusPill label={t('yourUsualOrder')} tone="lime" />}
            <div style={{ margin: '16px 0' }}><TintIcon icon={input.icon} tone={input.tone} size={112} /></div>
            <h2 className="t-title-l navy">{b(input.name)}</h2>
            <p className="t-body-m" style={{ marginTop: 4 }}>{usualNote}</p>
            <div className="reorder-step">
              <CircleButton icon="remove" label={t('fewerBags')} color="var(--navy)" outlined size={52}
                disabled={bags <= 1} onClick={() => setBags((n) => Math.max(1, n - 1))} />
              <span className="val t-headline" aria-live="polite">{t('bags', { count: bags })}</span>
              <CircleButton icon="add" label={t('moreBags')} color="var(--navy)" outlined size={52}
                disabled={bags >= 99} onClick={() => setBags((n) => Math.min(99, n + 1))} />
            </div>
            {profile.areaHa > 0 && <p className="reorder-rec">{t('recommendedFor', { area })}</p>}
            <Button block variant="wa" icon="chat_bubble_outline" onClick={() => setAsking('usual')}>{t('reorderOneTap')}</Button>
          </div>
        </JCard>
        <div className="stack sticky-side">
          <JCard style={{ paddingTop: 4, paddingBottom: 4 }}>
            <Divided>
              {otherInputs.map((o) => (
                <ListRow key={o.id}
                  leading={<TintIcon icon={o.icon} tone={o.tone} size={52} />}
                  title={b(o.name)}
                  subtitle={o.lastBought ? b(o.note).replace('{date}', dayMonth(lang, o.lastBought)) : b(o.note)}
                  trailing={added.has(o.id)
                    ? <StatusPill label={t('added')} tone="lime" />
                    : <Button variant="outlined" small onClick={() => setAsking(o.id)}>{t('add')}</Button>} />
              ))}
            </Divided>
          </JCard>
          <JCard padding="small">
            <label className="row" style={{ cursor: 'pointer', minHeight: 40 }}>
              <span className="t-title-s grow">{t('remindBeforeSeason')}</span>
              <Switch checked={seasonReminder} onChange={setSeasonReminder} label={t('remindBeforeSeason')} />
            </label>
          </JCard>
        </div>
      </div>
      <ContactJogooSheet open={asking != null} onClose={() => setAsking(null)}
        title={askingOther ? b(askingOther.name) : t('reorderTitle')}
        message={askingOther
          ? t('waPriceRequest', { item: b(askingOther.name) })
          : t('waReorder', { quantity: t('bags', { count: bags }), item: b(input.name) })}
        onContact={() => (askingOther ? addOther(askingOther) : reorder())} />
    </Page>
  );
}

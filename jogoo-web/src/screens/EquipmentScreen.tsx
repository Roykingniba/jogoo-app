// Screen 03: the life of one installation, from install date to next service.
// Ported from lib/screens/equipment_screen.dart.
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  BottomActionBar, Button, CircleButton, Divided, JCard, ListRow, Page, PhotoCircle, ScreenHeader,
  SectionTitle, StatusPill, Timeline, TintIcon, type TimelineItem,
} from '../components/ui';
import { Icon } from '../components/Icon';
import { Sheet, showToast } from '../components/overlays';
import { NotFound } from '../components/farm/farmParts';
import { bi, type Equipment, type MaintenanceStep } from '../data/models';
import { openRequestFor, partByCode, useEquipmentById, useStore } from '../data/store';
import { EQUIPMENT_KINDS, choiceLabel } from '../data/farm';
import { EquipmentSheet } from '../components/farm/EquipmentSheet';
import { useI18n } from '../i18n/i18n';
import { dayMonth, formatAmount, fullDate, shortDate } from '../utils/format';
import { paths } from '../routes';
import '../styles/farm.css';

export default function EquipmentScreen() {
  const { id = '' } = useParams();
  const item = useEquipmentById(id);
  if (!item) return <NotFound />;
  return <EquipmentDetail item={item} />;
}

function EquipmentDetail({ item }: { item: Equipment }) {
  const { t, b, lang } = useI18n();
  const navigate = useNavigate();
  const requests = useStore((s) => s.serviceRequests);
  const addToCart = useStore((s) => s.addToCart);
  const requestFromSales = useStore((s) => s.requestFromSales);
  const [booking, setBooking] = useState(false);
  const [editing, setEditing] = useState(false);
  const raw = useStore((s) => s.rawEquipment.find((e) => e.id === item.id));
  const openRequest = openRequestFor(requests, item.id);
  const kindLabel = item.kind ? choiceLabel(EQUIPMENT_KINDS, item.kind, lang) : undefined;
  const installed = item.installedOn ? t('installedOn', { date: fullDate(lang, item.installedOn) }) : undefined;

  const orderPart = (code: string) => {
    const part = partByCode(code);
    if (!part) return;
    addToCart({ id: part.code, title: part.name, unitPrice: part.price, quantity: 1 });
    showToast(t('addedToCart'), b(part.name));
  };

  const timelineItem = (step: MaintenanceStep): TimelineItem => {
    const date = shortDate(lang, step.date);
    switch (step.state) {
      case 'done':
        return { title: b(step.title), subtitle: t('doneOn', { date: dayMonth(lang, step.date) }), state: 'done' };
      case 'current':
        return { title: b(step.title), subtitle: step.note ? `${date}, ${b(step.note)}` : date, state: 'current' };
      case 'due': {
        const due = t('dueOn', { date: dayMonth(lang, step.date) });
        return {
          title: b(step.title),
          subtitle: step.price == null ? due : `${due} · ${formatAmount(step.price)} F`,
          subtitleColor: 'var(--brown)',
          state: 'due',
          trailing: step.partCode
            ? <Button small onClick={() => orderPart(step.partCode!)}>{t('order')}</Button>
            : undefined,
        };
      }
      case 'pending':
        return { title: b(step.title), subtitle: date, state: 'pending' };
    }
  };

  const copyDetails = async () => {
    const text = [b(item.name), item.serial, installed].filter(Boolean).join(' · ');
    try { await navigator.clipboard.writeText(text); } catch { /* clipboard blocked: still confirm, as text is shown */ }
    showToast(t('detailsCopied'), text);
  };

  const confirmBooking = () => {
    setBooking(false);
    requestFromSales(bi(`Service visit: ${item.name.en}`, `Visite d'entretien : ${item.name.fr}`));
    showToast(t('visitRequestedTitle'), t('visitRequestedBody'));
  };

  const keyDates = (
    <div className="farm-keydates">
      <KeyDate value={item.warrantyMonthsLeft != null ? t('monthsShort', { count: item.warrantyMonthsLeft }) : '—'} label={t('warrantyLeft')} />
      <KeyDate value={item.lastService ? dayMonth(lang, item.lastService) : '—'} label={t('lastService')} />
      <KeyDate value={item.nextVisit ? dayMonth(lang, item.nextVisit) : '—'} label={t('nextVisit')} />
    </div>
  );

  const links = (
    <JCard style={{ padding: '4px 20px' }}>
      <Divided>
        {raw && (
          <ListRow leading={<TintIcon icon="settings" tone="cyan" size={44} />} title={t('editEquipment')}
            trailing={<Icon name="chevron_right" />} onClick={() => setEditing(true)} />
        )}
        <ListRow leading={<TintIcon icon="edit_note" tone="lime" size={44} />} title={t('maintenanceLog')}
          trailing={<Icon name="chevron_right" />} onClick={() => navigate(paths.maintenanceLog(item.id))} />
        <ListRow leading={<TintIcon icon="folder_outlined" tone="blue" size={44} />} title={t('myDocuments')}
          trailing={<Icon name="chevron_right" />} onClick={() => navigate(paths.documents)} />
      </Divided>
    </JCard>
  );

  const reportBtn = (block?: boolean) => (
    <Button variant="outlined" className="farm-btn-magenta" block={block} onClick={() => navigate(paths.reportProblem(item.id))}>
      {t('reportProblem')}
    </Button>
  );
  const bookBtn = (block?: boolean) => <Button block={block} onClick={() => setBooking(true)}>{t('bookService')}</Button>;

  return (
    <Page className="farm-eq-page">
      <ScreenHeader title={t('equipmentTitle')} centerTitle
        trailing={<CircleButton icon="share_outlined" label={t('share')} onClick={copyDetails} />} />

      <div className="split">
        <div className="stack">
          <div className="farm-hero">
            {item.photo
              ? <PhotoCircle src={item.photo} size={128} ring={6} alt={b(item.name)} />
              : <TintIcon icon={item.icon} tone={item.tone} size={128} />}
            <div className="grow">
              <h2 className="t-headline">{b(item.name)}</h2>
              {(installed || item.serial) && (
                <p className="t-body-m" style={{ marginTop: 4 }}>{[item.serial, installed].filter(Boolean).join(' · ')}</p>
              )}
              <div className="row" style={{ marginTop: 8, gap: 6, flexWrap: 'wrap' }}>
                {kindLabel && <StatusPill label={kindLabel} tone={item.tone} />}
                {openRequest
                  ? <StatusPill label={t('requestOpen')} tone="pink" />
                  : item.health === 'good' ? <StatusPill label={t('workingWell')} tone="lime" /> : null}
              </div>
            </div>
          </div>
          <div className="farm-below-desktop">{keyDates}</div>
          {item.notes && (
            <JCard>
              <SectionTitle>{t('notes')}</SectionTitle>
              <p className="t-body-l farm-notes">{item.notes}</p>
            </JCard>
          )}
          {item.maintenance.length > 0 && (
            <JCard>
              <SectionTitle>{t('maintenance')}</SectionTitle>
              <div style={{ marginTop: 16 }}>
                <Timeline items={item.maintenance.map(timelineItem)} />
              </div>
            </JCard>
          )}
          <div className="farm-below-desktop">{links}</div>
        </div>

        <aside className="stack sticky-side farm-desktop-only">
          {keyDates}
          {links}
          <JCard>
            <div className="farm-actions">
              {bookBtn(true)}
              {reportBtn(true)}
            </div>
          </JCard>
        </aside>
      </div>

      <Sheet open={booking} onClose={() => setBooking(false)} title={t('bookService')}>
        <p className="t-body-l">{t('bookServiceBody', { equipment: b(item.name) })}</p>
        <div className="row" style={{ justifyContent: 'flex-end', marginTop: 20 }}>
          <Button variant="text" onClick={() => setBooking(false)}>{t('cancel')}</Button>
          <Button onClick={confirmBooking}>{t('bookService')}</Button>
        </div>
      </Sheet>

      <EquipmentSheet open={editing} onClose={() => setEditing(false)} initial={raw}
        onRemoved={() => navigate(paths.farm, { replace: true })} />

      <BottomActionBar>
        {reportBtn()}
        {bookBtn()}
      </BottomActionBar>
    </Page>
  );
}

function KeyDate({ value, label }: { value: string; label: string }) {
  return (
    <JCard className="farm-keydate">
      <div className="farm-keydate-v v">{value}</div>
      <div className="l">{label}</div>
    </JCard>
  );
}

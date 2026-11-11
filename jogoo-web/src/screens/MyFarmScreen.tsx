// Screen 02: all installations, orders and invoices after purchase.
// Ported from lib/screens/my_farm_screen.dart.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button, ChoicePill, CircleButton, Divided, JCard, ListRow, Page, PageTitle, PhotoCircle, PillRow,
  SectionTitle, Stack, StatusPill, TintIcon,
} from '../components/ui';
import { Icon } from '../components/Icon';
import { Sheet, showToast } from '../components/overlays';
import { HealthPill } from '../components/farm/farmParts';
import { bi, type Equipment } from '../data/models';
import { equipmentList, invoices, orders, useStore } from '../data/store';
import { useI18n } from '../i18n/i18n';
import { formatAmount, fullDate } from '../utils/format';
import { paths } from '../routes';
import '../styles/farm.css';

type FarmTab = 'equipment' | 'orders' | 'invoices';

export default function MyFarmScreen() {
  const { t } = useI18n();
  const profile = useStore((s) => s.profile);
  const [tab, setTab] = useState<FarmTab>('equipment');
  const [adding, setAdding] = useState(false);
  const town = profile.location.split(',')[0];

  const tabs: [FarmTab, string][] = [
    ['equipment', t('tabEquipment')],
    ['orders', t('tabOrders')],
    ['invoices', t('tabInvoices')],
  ];

  return (
    <Page>
      <PageTitle
        title={t('navMyFarm')}
        subtitle={t('installationsAt', { count: equipmentList.length, place: town })}
        trailing={<CircleButton icon="add" label={t('addEquipment')} color="#fff" background="var(--navy)" size={60} onClick={() => setAdding(true)} />}
      />
      <div className="farm-tabs">
        <PillRow>
          {tabs.map(([key, label]) => (
            <ChoicePill key={key} label={label} selected={tab === key} onClick={() => setTab(key)} />
          ))}
        </PillRow>
      </div>
      <div style={{ marginTop: 16 }}>
        {tab === 'equipment' && <EquipmentTab />}
        {tab === 'orders' && <OrdersTab />}
        {tab === 'invoices' && <InvoicesTab />}
      </div>
      <AddEquipmentSheet open={adding} onClose={() => setAdding(false)} />
    </Page>
  );
}

function AddEquipmentSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useI18n();
  const requestFromSales = useStore((s) => s.requestFromSales);
  const [text, setText] = useState('');
  const close = () => { setText(''); onClose(); };
  const submit = () => {
    const value = text.trim();
    close();
    if (value === '') return;
    requestFromSales(bi(`New equipment: ${value}`, `Nouvel équipement : ${value}`));
    showToast(t('addEquipmentSavedTitle'), t('addEquipmentSavedBody'));
  };
  return (
    <Sheet open={open} onClose={close} title={t('addEquipment')}>
      <form onSubmit={(e) => { e.preventDefault(); submit(); }}>
        <Stack gap={12}>
          <p className="t-body-l">{t('addEquipmentBody')}</p>
          <label className="field">
            <span className="sr-only">{t('addEquipment')}</span>
            <input className="input" autoFocus value={text} placeholder={t('addEquipmentHint')} onChange={(e) => setText(e.target.value)} />
          </label>
          <div className="row" style={{ justifyContent: 'flex-end', marginTop: 4 }}>
            <Button variant="text" onClick={close}>{t('cancel')}</Button>
            <Button type="submit">{t('send')}</Button>
          </div>
        </Stack>
      </form>
    </Sheet>
  );
}

function EquipmentVisual({ item, size }: { item: Equipment; size: number }) {
  return item.photo ? <PhotoCircle src={item.photo} size={size} /> : <TintIcon icon={item.icon} tone={item.tone} size={size} />;
}

const barColors = ['var(--olive)', 'var(--navy)', 'var(--magenta)'];

function EquipmentTab() {
  const { t, b } = useI18n();
  const navigate = useNavigate();
  const first = equipmentList[0];

  return (
    <Stack>
      {/* Phone: one list card, as in the app. */}
      <JCard className="farm-phone-only" style={{ padding: '8px 20px' }}>
        <Divided>
          {equipmentList.map((item) => (
            <ListRow key={item.id} leading={<EquipmentVisual item={item} size={60} />}
              title={b(item.name)} subtitle={b(item.healthNote)} trailing={<HealthPill health={item.health} />}
              onClick={() => navigate(paths.equipment(item.id))} />
          ))}
        </Divided>
      </JCard>
      {/* Tablet and desktop: a grid of equipment cards. */}
      <div className="grid g3 farm-wide-only">
        {equipmentList.map((item) => (
          <JCard key={item.id} onClick={() => navigate(paths.equipment(item.id))} ariaLabel={b(item.name)}>
            <div className="farm-eq-card">
              <div className="farm-eq-top">
                <EquipmentVisual item={item} size={72} />
                <div className="grow">
                  <h2 className="t-title-m">{b(item.name)}</h2>
                  <p className="t-body-m" style={{ marginTop: 4 }}>{b(item.healthNote)}</p>
                </div>
              </div>
              <div className="farm-eq-foot">
                <HealthPill health={item.health} />
                <Icon name="chevron_right" />
              </div>
            </div>
          </JCard>
        ))}
      </div>

      <div className="grid g2" style={{ alignItems: 'start' }}>
        <JCard>
          <SectionTitle>{t('warrantyLeft')}</SectionTitle>
          {equipmentList.map((item, i) => (
            <WarrantyBar key={item.id} equipment={item} color={barColors[i % barColors.length]} />
          ))}
        </JCard>
        <JCard style={{ padding: '4px 20px' }}>
          <Divided>
            <ListRow leading={<TintIcon icon="folder_outlined" tone="blue" size={48} />}
              title={t('myDocuments')} subtitle={t('documentsSubtitle')} trailing={<Icon name="chevron_right" />}
              onClick={() => navigate(paths.documents)} />
            {first && (
              <ListRow leading={<TintIcon icon="edit_note" tone="lime" size={48} />}
                title={t('maintenanceLog')} subtitle={b(first.name)} trailing={<Icon name="chevron_right" />}
                onClick={() => navigate(paths.maintenanceLog(first.id))} />
            )}
          </Divided>
        </JCard>
      </div>
    </Stack>
  );
}

function WarrantyBar({ equipment, color }: { equipment: Equipment; color: string }) {
  const { t, b } = useI18n();
  const share = Math.min(1, Math.max(0, equipment.warrantyMonthsLeft / equipment.warrantyMonths));
  const label = t('monthsOf', { left: equipment.warrantyMonthsLeft, total: equipment.warrantyMonths });
  return (
    <div style={{ marginTop: 14 }}>
      <div className="row">
        <span className="t-title-s grow">{b(equipment.shortName)}</span>
        <span className="t-body-m" style={{ color: 'var(--ink)' }}>{label}</span>
      </div>
      <div className="farm-bar" role="progressbar" aria-label={`${b(equipment.shortName)}: ${label}`}
        aria-valuemin={0} aria-valuemax={equipment.warrantyMonths} aria-valuenow={equipment.warrantyMonthsLeft}>
        <span style={{ width: `${share * 100}%`, background: color }} />
      </div>
    </div>
  );
}

function OrdersTab() {
  const { t, b, lang, fr } = useI18n();
  const navigate = useNavigate();
  const status = (delivered?: boolean) => delivered
    ? <StatusPill label={t('orderDelivered')} tone="lime" />
    : <StatusPill label={t('orderOnTheRoad')} tone="cyan" />;
  const icon = (delivered?: boolean) => (
    <TintIcon icon={delivered ? 'inventory_2_outlined' : 'local_shipping_outlined'} tone={delivered ? 'lime' : 'cyan'} size={52} />
  );
  return (
    <>
      <JCard className="farm-phone-only" style={{ padding: '8px 20px' }}>
        <Divided>
          {orders.map((order) => (
            <ListRow key={order.id} leading={icon(order.delivered)} title={b(order.item)}
              subtitle={`${order.id} · ${fullDate(lang, order.orderedOn)} · ${formatAmount(order.total)} F`}
              trailing={status(order.delivered)}
              onClick={order.delivered ? undefined : () => navigate(paths.delivery(order.id))} />
          ))}
        </Divided>
      </JCard>
      <JCard className="farm-wide-only">
        <table className="farm-table">
          <thead>
            <tr>
              <th>{t('tabOrders')}</th>
              <th>N°</th>
              <th>{t('date')}</th>
              <th className="num">Total</th>
              <th><span className="sr-only">{fr ? 'Statut' : 'Status'}</span></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const open = order.delivered ? undefined : () => navigate(paths.delivery(order.id));
              return (
                <tr key={order.id} className={open ? 'tap' : undefined} onClick={open}>
                  <td>
                    <div className="farm-cell-title">
                      {icon(order.delivered)}
                      {open
                        ? <button type="button" className="farm-link" onClick={(e) => { e.stopPropagation(); open(); }}>{b(order.item)}</button>
                        : <span className="bold">{b(order.item)}</span>}
                    </div>
                  </td>
                  <td className="nowrap muted">{order.id}</td>
                  <td className="nowrap muted">{fullDate(lang, order.orderedOn)}</td>
                  <td className="num bold">{formatAmount(order.total)} F</td>
                  <td className="num">
                    <span className="row" style={{ justifyContent: 'flex-end', gap: 6 }}>
                      {status(order.delivered)}
                      {open && <Icon name="chevron_right" color="var(--muted)" />}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </JCard>
    </>
  );
}

function InvoicesTab() {
  const { t, b, lang, fr } = useI18n();
  const status = (paid: boolean) => paid
    ? <StatusPill label={t('invoicePaid')} tone="lime" />
    : <StatusPill label={t('invoiceDue')} tone="orange" />;
  return (
    <>
      <JCard className="farm-phone-only" style={{ padding: '8px 20px' }}>
        <Divided>
          {invoices.map((inv) => (
            <ListRow key={inv.id} leading={<TintIcon icon="receipt_long_outlined" tone="blue" size={52} />}
              title={b(inv.title)} subtitle={`${inv.id} · ${fullDate(lang, inv.issuedOn)}`}
              trailing={
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  <span className="t-title-s" style={{ whiteSpace: 'nowrap' }}>{formatAmount(inv.amount)} F</span>
                  {status(inv.paid)}
                </div>
              } />
          ))}
        </Divided>
      </JCard>
      <JCard className="farm-wide-only">
        <table className="farm-table">
          <thead>
            <tr>
              <th>{t('tabInvoices')}</th>
              <th>N°</th>
              <th>{t('date')}</th>
              <th className="num">Total</th>
              <th><span className="sr-only">{fr ? 'Statut' : 'Status'}</span></th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id}>
                <td>
                  <div className="farm-cell-title">
                    <TintIcon icon="receipt_long_outlined" tone="blue" size={52} />
                    <span className="bold">{b(inv.title)}</span>
                  </div>
                </td>
                <td className="nowrap muted">{inv.id}</td>
                <td className="nowrap muted">{fullDate(lang, inv.issuedOn)}</td>
                <td className="num bold">{formatAmount(inv.amount)} F</td>
                <td className="num">{status(inv.paid)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </JCard>
    </>
  );
}

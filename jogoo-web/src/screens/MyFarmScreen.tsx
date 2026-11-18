// Screen 02: the client's farm, their equipment, and orders and invoices after purchase.
// Ported from lib/screens/my_farm_screen.dart.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button, ChoicePill, CircleButton, Divided, JCard, ListRow, Page, PageTitle, PhotoCircle, PillRow,
  SectionTitle, Stack, StatusPill, TintIcon,
} from '../components/ui';
import { Icon } from '../components/Icon';
import { HealthPill } from '../components/farm/farmParts';
import { CreateFarmCard, FarmSummary } from '../components/farm/FarmSummary';
import { EquipmentSheet } from '../components/farm/EquipmentSheet';
import type { Equipment } from '../data/models';
import { invoices, orders, useStore } from '../data/store';
import { EQUIPMENT_KINDS, choiceLabel } from '../data/farm';
import { useI18n } from '../i18n/i18n';
import { formatAmount, fullDate } from '../utils/format';
import { paths } from '../routes';
import '../styles/farm.css';

type FarmTab = 'equipment' | 'orders' | 'invoices';

export default function MyFarmScreen() {
  const { t } = useI18n();
  const farm = useStore((s) => s.farm);
  const status = useStore((s) => s.farmStatus);
  const equipment = useStore((s) => s.equipment);
  const [tab, setTab] = useState<FarmTab>('equipment');
  const [adding, setAdding] = useState(false);

  if (!farm) {
    return (
      <Page>
        <PageTitle title={t('navMyFarm')} />
        {status === 'loading' || status === 'idle'
          ? <JCard><p className="t-body-l" role="status" style={{ margin: 0 }}>{t('loadingFarm')}</p></JCard>
          : status === 'error'
            ? <JCard><p className="t-body-l" style={{ margin: 0 }}>{t('farmLoadFailed')}</p></JCard>
            : <CreateFarmCard />}
      </Page>
    );
  }

  const tabs: [FarmTab, string][] = [
    ['equipment', t('tabEquipment')],
    ['orders', t('tabOrders')],
    ['invoices', t('tabInvoices')],
  ];

  return (
    <Page>
      <PageTitle
        title={t('navMyFarm')}
        subtitle={t('equipmentCount', { count: equipment.length })}
        trailing={<CircleButton icon="add" label={t('addEquipment')} color="#fff" background="var(--navy)" size={60} onClick={() => setAdding(true)} />}
      />
      <FarmSummary farm={farm} />
      <div className="farm-tabs" style={{ marginTop: 16 }}>
        <PillRow>
          {tabs.map(([key, label]) => (
            <ChoicePill key={key} label={label} selected={tab === key} onClick={() => setTab(key)} />
          ))}
        </PillRow>
      </div>
      <div style={{ marginTop: 16 }}>
        {tab === 'equipment' && <EquipmentTab onAdd={() => setAdding(true)} />}
        {tab === 'orders' && <OrdersTab />}
        {tab === 'invoices' && <InvoicesTab />}
      </div>
      <EquipmentSheet open={adding} onClose={() => setAdding(false)} />
    </Page>
  );
}

function equipmentSubtitle(item: Equipment, lang: 'en' | 'fr', b: (v: Equipment['name']) => string) {
  if (item.healthNote) return b(item.healthNote);
  return [item.kind ? choiceLabel(EQUIPMENT_KINDS, item.kind, lang) : '', item.serial].filter(Boolean).join(' · ') || undefined;
}

function EquipmentVisual({ item, size }: { item: Equipment; size: number }) {
  return item.photo ? <PhotoCircle src={item.photo} size={size} /> : <TintIcon icon={item.icon} tone={item.tone} size={size} />;
}

const barColors = ['var(--olive)', 'var(--navy)', 'var(--magenta)'];

function EquipmentTab({ onAdd }: { onAdd: () => void }) {
  const { t, b, lang } = useI18n();
  const navigate = useNavigate();
  const equipmentList = useStore((s) => s.equipment);
  const withWarranty = equipmentList.filter((e) => e.warrantyMonths != null);
  const first = equipmentList[0];

  if (equipmentList.length === 0) {
    return (
      <JCard>
        <div className="farm-empty">
          <TintIcon icon="build_outlined" tone="blue" size={56} />
          <h2 className="t-title-m">{t('noEquipmentTitle')}</h2>
          <p className="t-body-m">{t('noEquipmentYet')}</p>
          <Button icon="add" onClick={onAdd}>{t('addEquipment')}</Button>
        </div>
      </JCard>
    );
  }

  return (
    <Stack>
      {/* Phone: one list card, as in the app. */}
      <JCard className="farm-phone-only" style={{ padding: '8px 20px' }}>
        <Divided>
          {equipmentList.map((item) => (
            <ListRow key={item.id} leading={<EquipmentVisual item={item} size={60} />}
              title={b(item.name)} subtitle={equipmentSubtitle(item, lang, b)} trailing={<HealthPill health={item.health} />}
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
                  <p className="t-body-m" style={{ marginTop: 4 }}>{equipmentSubtitle(item, lang, b)}</p>
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
        {withWarranty.length > 0 && (
          <JCard>
            <SectionTitle>{t('warrantyLeft')}</SectionTitle>
            {withWarranty.map((item, i) => (
              <WarrantyBar key={item.id} equipment={item} color={barColors[i % barColors.length]} />
            ))}
          </JCard>
        )}
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
  const left = equipment.warrantyMonthsLeft ?? 0;
  const total = equipment.warrantyMonths ?? 1;
  const share = Math.min(1, Math.max(0, left / total));
  const label = t('monthsOf', { left, total });
  return (
    <div style={{ marginTop: 14 }}>
      <div className="row">
        <span className="t-title-s grow">{b(equipment.shortName)}</span>
        <span className="t-body-m" style={{ color: 'var(--ink)' }}>{label}</span>
      </div>
      <div className="farm-bar" role="progressbar" aria-label={`${b(equipment.shortName)}: ${label}`}
        aria-valuemin={0} aria-valuemax={total} aria-valuenow={left}>
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
  if (orders.length === 0) return <JCard><p className="t-body-l" style={{ margin: 0 }}>{t('noOrdersYet')}</p></JCard>;
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
  if (invoices.length === 0) return <JCard><p className="t-body-l" style={{ margin: 0 }}>{t('noInvoicesYet')}</p></JCard>;
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

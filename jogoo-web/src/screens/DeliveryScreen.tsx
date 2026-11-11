// Screen 13: from the hub to the farm gate.
// Ported from lib/screens/delivery_screen.dart.
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  BottomActionBar, BrandCard, Button, CircleButton, ExampleBanner, JCard, Page, ScreenHeader, Timeline, type TimelineItem,
} from '../components/ui';
import { Sheet, showToast } from '../components/overlays';
import { ContactJogooSheet } from '../components/service/ContactJogoo';
import { useI18n } from '../i18n/i18n';
import { bi, type Order } from '../data/models';
import { orderById, useStore } from '../data/store';
import { dayMonthTime } from '../utils/format';
import { callNumber } from '../utils/actions';
import '../styles/shop.css';

export default function DeliveryScreen() {
  const { orderId = '' } = useParams();
  const order = orderById(orderId);
  const { t, fr } = useI18n();
  if (!order) {
    return (
      <Page narrow>
        <ScreenHeader title={t('orderTitle', { id: orderId })} />
        <JCard><p className="t-body-l">{fr ? 'Cette commande est introuvable.' : 'This order could not be found.'}</p></JCard>
      </Page>
    );
  }
  return <DeliveryView order={order} />;
}

function DeliveryView({ order }: { order: Order }) {
  const { t, b, lang } = useI18n();
  const requestFromSales = useStore((s) => s.requestFromSales);
  const current = order.steps.findIndex((s) => !s.done);
  const [changing, setChanging] = useState(false);

  const items: TimelineItem[] = order.steps.map((step, i) => ({
    title: b(step.title),
    subtitle: [...(step.at ? [dayMonthTime(lang, step.at)] : []), ...(step.note ? [b(step.note)] : [])].join(' · '),
    state: step.done ? 'done' : i === current ? 'current' : 'pending',
    icon: i === current ? 'local_shipping_outlined' : undefined,
  }));

  const changeDropOff = () => {
    requestFromSales(bi(`Change drop-off for ${order.id}`, `Changer le retrait de ${order.id}`));
    showToast(t('dropOffChangeTitle'), t('dropOffChangeBody'));
  };

  return (
    <Page narrow>
      <ScreenHeader title={t('orderTitle', { id: order.id })} subtitle={b(order.item)} />
      <ExampleBanner />
      <div className="split even">
        <BrandCard blobSize={190}>
          <p className="dl-kicker">{t('arriving')}</p>
          <p className="dl-window">{order.arrivalWindow ? b(order.arrivalWindow) : '—'}</p>
          {order.dropOff && <p className="dl-drop">{t('dropOffPoint', { place: order.dropOff })}</p>}
          {order.collectionCode && <CollectionCode code={order.collectionCode} />}
        </BrandCard>
        <JCard><Timeline items={items} /></JCard>
      </div>
      <BottomActionBar>
        <Button variant="outlined" onClick={() => setChanging(true)}>{t('changeDropOff')}</Button>
        <Button disabled={!order.driver} onClick={() => order.driver && callNumber(order.driver.phone)}>{t('callDriver')}</Button>
      </BottomActionBar>
      <ContactJogooSheet open={changing} onClose={() => setChanging(false)} title={t('changeDropOff')}
        body={order.dropOff ? t('dropOffPoint', { place: order.dropOff }) : undefined}
        message={t('waDropOff', { id: order.id })} onContact={changeDropOff} />
    </Page>
  );
}

function CollectionCode({ code }: { code: string }) {
  const { t } = useI18n();
  const [big, setBig] = useState(false);
  return (
    <div className="dl-code">
      <div className="grow">
        <div className="lbl">{t('collectionCode')}</div>
        <div className="val" aria-label={code}>{code.split('').join(' ')}</div>
      </div>
      <CircleButton icon="qr_code_2" label={t('showCode')} color="var(--navy)" size={56} onClick={() => setBig(true)} />
      {/* Big, high-contrast code for showing to the driver in bright sun. */}
      <Sheet open={big} onClose={() => setBig(false)} title={t('collectionCode')}>
        <div className="dl-big">{code}</div>
        <Button block variant="outlined" onClick={() => setBig(false)}>{t('close')}</Button>
      </Sheet>
    </div>
  );
}

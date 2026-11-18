// Screen 08: after-sales support hub. Ported from lib/screens/service_screen.dart.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button, Divided, InitialsAvatar, JCard, ListRow, Page, PageTitle, RoundShortcut, SectionTitle, StatusPill, TintIcon,
} from '../components/ui';
import { Icon } from '../components/Icon';
import { BookVisitSheet, RatingSheet, WarrantySheet } from '../components/service/ServiceSheets';
import { useI18n } from '../i18n/i18n';
import { activeVisits, openRequestCount, useStore } from '../data/store';
import { VisitRow } from '../components/service/VisitParts';
import { useEffect } from 'react';
import { DemoData } from '../data/demoData';
import { isOpen, type ServiceRequest } from '../data/models';
import { callJogoo, openWhatsApp } from '../utils/actions';
import { dayMonth, initials, shortDate } from '../utils/format';
import { paths } from '../routes';
import '../styles/service.css';

export default function ServiceScreen() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const requests = useStore((s) => s.serviceRequests);
  const open = openRequestCount(requests);
  const [sheet, setSheet] = useState<'visit' | 'warranty' | null>(null);
  const close = () => setSheet(null);
  const visits = useStore((s) => s.visits);
  const loadVisits = useStore((s) => s.loadVisits);
  useEffect(() => { void loadVisits(); }, [loadVisits]);
  const upcoming = activeVisits(visits);
  const past = visits.filter((v) => v.status === 'done' || v.status === 'cancelled').slice(0, 3);

  return (
    <Page>
      <PageTitle title={t('navService')} subtitle={t('serviceHours')} />
      <div className="service-hub">
        <JCard padding="small" className="a-short">
          <div className="shortcuts">
            <RoundShortcut label={t('actionReport')} icon="error_outline" tone="pink" onClick={() => navigate(paths.reportProblem())} />
            <RoundShortcut label={t('actionBookVisit')} icon="calendar_month_outlined" tone="blue" onClick={() => setSheet('visit')} />
            <RoundShortcut label={t('actionWarranty')} icon="verified_user_outlined" tone="cyan" onClick={() => setSheet('warranty')} />
            <RoundShortcut label="WhatsApp" icon="chat_bubble_outline" tone="lime" onClick={() => openWhatsApp()} />
          </div>
        </JCard>

        <div className="a-req stack">
        <JCard className="service-visits">
          <SectionTitle trailing={upcoming.length ? <StatusPill label={t('upcomingCount', { count: upcoming.length })} tone="cyan" /> : undefined}>
            {t('myVisits')}
          </SectionTitle>
          <div style={{ marginTop: 8 }}>
            {upcoming.length === 0 && past.length === 0
              ? <p className="t-body-m empty-note">{t('visitsEmpty')}</p>
              : <Divided>{[...upcoming, ...past].map((v) => <VisitRow key={v.id} visit={v} />)}</Divided>}
          </div>
        </JCard>
        <JCard>
          <SectionTitle trailing={open === 0 ? undefined : <StatusPill label={t('openCount', { count: open })} tone="pink" />}>
            {t('myRequests')}
          </SectionTitle>
          <div style={{ marginTop: 8 }}>
            <Divided>
              {requests.length === 0 && <p className="t-body-m" style={{ margin: '4px 0 8px' }}>{t('noRequestsYet')}</p>}
              {requests.map((r) => <RequestRow key={r.id} request={r} />)}
            </Divided>
          </div>
        </JCard>
        </div>

        <JCard padding="small" className="a-agro" onClick={() => navigate(paths.agronomist)} ariaLabel={t('agronomistsTitle')}>
          <ListRow leading={<TintIcon icon="spa_outlined" tone="lime" size={52} />} title={t('agronomistsTitle')}
            subtitle={t('repliesWeekdays')} trailing={<Icon name="chevron_right" color="var(--muted)" />} />
        </JCard>

        <JCard padding="small" className="a-call" onClick={callJogoo} ariaLabel={t('callJogooCameroon')}>
          <ListRow leading={<span className="service-call-disc"><Icon name="call_outlined" /></span>}
            title={t('callJogooCameroon')} subtitle={DemoData.jogooPhoneDisplay} />
        </JCard>
      </div>

      <BookVisitSheet open={sheet === 'visit'} onClose={close} />
      <WarrantySheet open={sheet === 'warranty'} onClose={close} />
    </Page>
  );
}

function RequestRow({ request }: { request: ServiceRequest }) {
  const { t, b, lang } = useI18n();
  const navigate = useNavigate();
  const rateRequest = useStore((s) => s.rateRequest);
  const [rating, setRating] = useState(false);
  const openRequest = () => navigate(paths.serviceRequest(request.id));

  if (isOpen(request)) {
    return (
      <div className="service-req-row">
        <button type="button" className="service-req-main" onClick={openRequest}>
          <InitialsAvatar initials={request.technician ? initials(request.technician.name) : request.id.substring(3)} size={56} />
          <span className="txt">
            <span className="t-title-s" style={{ display: 'block' }}>{b(request.title)}</span>
            <span className="t-body-m" style={{ display: 'block', marginTop: 2 }}>
              {request.visitAt ? t('visitOn', { date: shortDate(lang, request.visitAt) }) : t('visitToBeScheduled')}
            </span>
          </span>
        </button>
        <span className="trail"><Button small onClick={openRequest}>{t('open')}</Button></span>
      </div>
    );
  }

  return (
    <div className="service-req-row">
      <button type="button" className="service-req-main" onClick={openRequest}>
        <span className="service-check"><Icon name="check" /></span>
        <span className="txt">
          <span className="t-title-s" style={{ display: 'block' }}>{b(request.title)}</span>
          <span className="t-body-m" style={{ display: 'block', marginTop: 2 }}>
            {t('resolvedOn', { date: dayMonth(lang, request.resolvedOn!) })}
          </span>
        </span>
      </button>
      <span className="trail">
        {request.rating != null
          ? <StatusPill label={`★ ${request.rating}`} tone="lime" />
          : <Button small variant="outlined" onClick={() => setRating(true)}>{t('rate')}</Button>}
      </span>
      <RatingSheet open={rating} onClose={() => setRating(false)} onRate={(stars) => rateRequest(request.id, stars)} />
    </div>
  );
}

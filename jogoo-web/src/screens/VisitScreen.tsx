// Follow a JOGOO visit: who is coming (name, photo, phone), where he stays,
// his itinerary step by step, and what the visit is about. Staff update it in
// the staff app; this page refreshes by itself while it is open.
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Button, CircleButton, JCard, Page, ScreenHeader, SectionTitle, Timeline, TintIcon, type TimelineItem,
} from '../components/ui';
import { Icon } from '../components/Icon';
import { NotFound } from '../components/farm/farmParts';
import {
  TechnicianPhoto, VisitStatusPill, currentStep, visitTitle, visitWhen,
} from '../components/service/VisitParts';
import type { Visit } from '../data/backend';
import { useStore } from '../data/store';
import { useI18n } from '../i18n/i18n';
import { callNumber } from '../utils/actions';
import { isNative, openExternalNative } from '../utils/native';
import { dateTime, fullDate, shortDate, timeOfDay } from '../utils/format';
import '../styles/service.css';

const REFRESH_MS = 60_000;

export default function VisitScreen() {
  const { id = '' } = useParams();
  const visits = useStore((s) => s.visits);
  const status = useStore((s) => s.visitsStatus);
  const loadVisits = useStore((s) => s.loadVisits);

  useEffect(() => {
    void loadVisits();
    const timer = window.setInterval(() => { if (!document.hidden) void loadVisits(); }, REFRESH_MS);
    return () => window.clearInterval(timer);
  }, [loadVisits]);

  const visit = visits.find((v) => v.id === id);
  if (!visit) {
    if (status === 'loading' || status === 'idle') return <Page narrow><ScreenHeader title="…" /></Page>;
    return <NotFound />;
  }
  return <VisitView visit={visit} />;
}

function whatsApp(phone: string) {
  const url = `https://wa.me/${phone.replace(/[^0-9]/g, '')}`;
  if (isNative()) void openExternalNative(url).catch(() => {});
  else window.open(url, '_blank', 'noopener');
}

function VisitView({ visit }: { visit: Visit }) {
  const { t, lang } = useI18n();
  const loadVisits = useStore((s) => s.loadVisits);
  const tech = visit.technician;
  const step = currentStep(visit);
  const cancelled = visit.status === 'cancelled';

  const itinerary: TimelineItem[] = visit.steps.map((s) => {
    const when = s.doneAt
      ? t('stepDoneAt', { time: dateTime(lang, new Date(s.doneAt)) })
      : s.plannedAt ? dateTime(lang, new Date(s.plannedAt)) : undefined;
    return {
      title: s.title,
      subtitle: [s.place, when, s.note].filter(Boolean).join(' · ') || undefined,
      state: s.doneAt ? 'done' : !cancelled && s === step ? 'current' : 'pending',
      icon: visit.status === 'on_the_way' && s === step ? 'local_shipping_outlined' : undefined,
    };
  });

  const hotel = visit.hotel;
  const stay = hotel && (hotel.checkIn || hotel.checkOut)
    ? [hotel.checkIn && `${t('checkIn')} ${shortDate(lang, new Date(`${hotel.checkIn}T12:00:00`))}`,
       hotel.checkOut && `${t('checkOut')} ${shortDate(lang, new Date(`${hotel.checkOut}T12:00:00`))}`].filter(Boolean).join(' · ')
    : null;

  const details: [string, string][] = [
    [t('visitWhen'), visitWhen(lang, visit)],
    ...(visit.siteAddress ? [[t('siteAddress'), visit.siteAddress] as [string, string]] : []),
    ...(visit.purpose ? [[t('visitPurpose'), visit.purpose] as [string, string]] : []),
    ...(visit.transport ? [[t('visitTransport'), visit.transport] as [string, string]] : []),
  ];

  const techCard = (
    <JCard>
      <SectionTitle>{t('yourTechnician')}</SectionTitle>
      <div className="visit-tech">
        <TechnicianPhoto tech={tech} size={88} />
        <div className="grow">
          <div className="t-title-m">{tech?.name ?? t('technicianTbc')}</div>
          {tech?.role && <div className="t-body-m">{tech.role}</div>}
          {tech?.phone && <div className="t-body-m" style={{ marginTop: 2 }}>{tech.phone}</div>}
        </div>
      </div>
      {tech?.phone && (
        <div className="row wrap" style={{ marginTop: 14, gap: 8 }}>
          <Button small icon="call_outlined" onClick={() => callNumber(tech.phone!)}>{t('call')}</Button>
          <Button small variant="wa" icon="chat_bubble_outline" onClick={() => whatsApp(tech.phone!)}>WhatsApp</Button>
        </div>
      )}
    </JCard>
  );

  const hotelCard = hotel && (
    <JCard>
      <SectionTitle>{t('whereHeStays')}</SectionTitle>
      <div className="row" style={{ gap: 14, marginTop: 12, alignItems: 'flex-start' }}>
        <TintIcon icon="hotel" tone="orange" size={52} />
        <div className="grow">
          {hotel.name && <div className="t-title-s">{hotel.name}</div>}
          {hotel.address && <div className="t-body-m">{hotel.address}</div>}
          {stay && <div className="t-body-m" style={{ marginTop: 4 }}>{stay}</div>}
        </div>
        {hotel.phone && <CircleButton icon="call_outlined" label={`${t('call')} ${hotel.name ?? ''}`} size={44} outlined color="var(--navy)"
          onClick={() => callNumber(hotel.phone!)} />}
      </div>
    </JCard>
  );

  return (
    <Page className="visit-page">
      <ScreenHeader title={visitTitle(t, visit)} subtitle={visitWhen(lang, visit)}
        trailing={<CircleButton icon="refresh" label={t('refresh')} onClick={() => void loadVisits()} />} />

      <div className="split">
        <div className="stack">
          <JCard className="visit-hero">
            <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
              <VisitStatusPill status={visit.status} />
              <span className="t-body-s muted">{t('updatedAt', { time: dateTime(lang, new Date(visit.updatedAt)) })}</span>
            </div>
            {!cancelled && step && (
              <p className="t-title-m" style={{ margin: '12px 0 0' }}>
                {visit.status === 'on_the_way' || visit.status === 'on_site' ? t('nowStep', { step: step.title }) : t('nextStepIs', { step: step.title })}
              </p>
            )}
            {cancelled && <p className="t-body-l" style={{ margin: '12px 0 0' }}>{t('visitCancelledBody')}</p>}
          </JCard>

          <div className="visit-narrow-only">{techCard}</div>

          <JCard>
            <SectionTitle>{t('itinerary')}</SectionTitle>
            <div style={{ marginTop: 14 }}>
              {itinerary.length ? <Timeline items={itinerary} /> : <p className="t-body-m" style={{ margin: 0 }}>{t('itineraryTbc')}</p>}
            </div>
          </JCard>

          <div className="visit-narrow-only">{hotelCard}</div>

          <JCard>
            <SectionTitle>{t('visitDetails')}</SectionTitle>
            <dl className="visit-facts">
              {details.map(([k, v], i) => <div key={i}><dt>{k}</dt><dd>{v}</dd></div>)}
            </dl>
            {visit.toPrepare && (
              <div className="visit-prepare">
                <Icon name="edit_note" />
                <div>
                  <div className="t-title-s">{t('toPrepare')}</div>
                  <p className="t-body-m" style={{ margin: '2px 0 0', whiteSpace: 'pre-wrap' }}>{visit.toPrepare}</p>
                </div>
              </div>
            )}
          </JCard>
        </div>

        <aside className="stack sticky-side visit-wide-only">
          {techCard}
          {hotelCard}
        </aside>
      </div>
      <p className="t-body-s muted center" style={{ marginTop: 16 }}>
        {t('visitPlannedOn', { date: fullDate(lang, new Date(visit.startsAt)), time: timeOfDay(new Date(visit.startsAt)) })}
      </p>
    </Page>
  );
}

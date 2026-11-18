// Pieces for JOGOO visits, shared by the Service tab, Home, the visit page and the staff app.
import { useNavigate } from 'react-router-dom';
import { Button, InitialsAvatar, JCard, ListRow, SectionTitle, StatusPill } from '../ui';
import type { Technician, Visit, VisitKind, VisitStatus } from '../../data/backend';
import type { Lang, Tone } from '../../data/models';
import { useI18n, type MsgKey, type T } from '../../i18n/i18n';
import { initials, shortDate, timeOfDay } from '../../utils/format';
import { paths } from '../../routes';
import '../../styles/service.css';

export const visitKindKey = (k: VisitKind) => `visitKind_${k}` as MsgKey;
export const visitStatusKey = (s: VisitStatus) => `visitStatus_${s}` as MsgKey;
const statusTone: Record<VisitStatus, Tone> = {
  planned: 'blue', confirmed: 'cyan', on_the_way: 'orange', on_site: 'lime', done: 'lime', cancelled: 'pink',
};

export function VisitStatusPill({ status }: { status: VisitStatus }) {
  const { t } = useI18n();
  return <StatusPill label={t(visitStatusKey(status))} tone={statusTone[status]}
    icon={status === 'on_the_way' ? 'local_shipping_outlined' : undefined} />;
}

/** "Tue 25 Nov, 09:00 – 16:00" (or with both dates when it spans days). */
export function visitWhen(lang: Lang, v: Pick<Visit, 'startsAt' | 'endsAt'>) {
  const a = new Date(v.startsAt);
  const start = `${shortDate(lang, a)}, ${timeOfDay(a)}`;
  if (!v.endsAt) return start;
  const b = new Date(v.endsAt);
  return a.toDateString() === b.toDateString()
    ? `${start} – ${timeOfDay(b)}`
    : `${start} → ${shortDate(lang, b)}, ${timeOfDay(b)}`;
}

/** The technician's photo, or his initials when there is none. */
export function TechnicianPhoto({ tech, size = 56 }: { tech: Technician | null | undefined; size?: number }) {
  if (tech?.photoUrl) {
    return (
      <span className="photo-circle visit-tech-photo" style={{ width: size, height: size }}>
        <img src={tech.photoUrl} alt="" width={size} height={size} loading="lazy" decoding="async" />
      </span>
    );
  }
  return <InitialsAvatar initials={tech ? initials(tech.name) : 'J'} size={size} color={tech ? 'var(--navy)' : 'var(--muted)'} />;
}

/** The step the technician is on: the first one not done yet. */
export function currentStep(v: Visit) {
  return v.steps.find((s) => !s.doneAt);
}

export function visitTitle(t: T, v: Visit) {
  return t(visitKindKey(v.kind));
}

/** One visit as a row in a list (Service tab, Home). */
export function VisitRow({ visit }: { visit: Visit }) {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const open = () => navigate(paths.visit(visit.id));
  const step = currentStep(visit);
  return (
    <ListRow
      onClick={open}
      leading={<TechnicianPhoto tech={visit.technician} size={56} />}
      title={visitTitle(t, visit)}
      subtitle={[visitWhen(lang, visit), visit.technician?.name ?? t('technicianTbc'),
        visit.status === 'on_the_way' && step ? step.title : null].filter(Boolean).join(' · ')}
      trailing={<VisitStatusPill status={visit.status} />}
    />
  );
}

/** The next visit, with a button to follow it (Home). */
export function NextVisitCard({ visit, className }: { visit: Visit; className?: string }) {
  const { t } = useI18n();
  const navigate = useNavigate();
  return (
    <JCard className={className}>
      <SectionTitle trailing={<Button small onClick={() => navigate(paths.visit(visit.id))}>{t('trackVisit')}</Button>}>
        {t('nextVisit')}
      </SectionTitle>
      <div style={{ marginTop: 8 }}><VisitRow visit={visit} /></div>
    </JCard>
  );
}

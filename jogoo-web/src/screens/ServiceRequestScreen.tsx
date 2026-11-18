// Screen 09: follow one request from report to fix.
// Ported from lib/screens/service_request_screen.dart.
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  BottomActionBar, BrandCard, Button, CircleButton, InitialsAvatar, JCard, Page, ScreenHeader, SectionTitle, Timeline,
  type TimelineItem,
} from '../components/ui';
import { Sheet, showToast } from '../components/overlays';
import { RatingSheet, Stars } from '../components/service/ServiceSheets';
import { useI18n, type T } from '../i18n/i18n';
import { requestById, useEquipmentList, useStore } from '../data/store';
import { isOpen, underWarranty, type Equipment, type Lang, type RequestStep, type ServiceRequest } from '../data/models';
import { callNumber } from '../utils/actions';
import { wholeFarmEquipment } from '../data/farm';
import { dateTime, dayMonthTime, fullDate, initials } from '../utils/format';
import '../styles/service.css';

export default function ServiceRequestScreen() {
  const { id = '' } = useParams();
  const { t, b, lang } = useI18n();
  const requests = useStore((s) => s.serviceRequests);
  const rateRequest = useStore((s) => s.rateRequest);
  const [sheet, setSheet] = useState<'details' | 'reschedule' | 'rate' | null>(null);
  const close = () => setSheet(null);

  const equipmentList = useEquipmentList();
  const request = requestById(requests, id);
  const equipment = request ? equipmentList.find((e) => e.id === request.equipmentId) ?? wholeFarmEquipment() : undefined;
  if (!request || !equipment) {
    return (
      <Page narrow>
        <ScreenHeader title={t('requestTitle', { id })} />
        <JCard><p className="t-title-m" style={{ margin: 0 }}>{t('notFoundTitle')}</p><p className="t-body-m">{t('notFoundBody')}</p></JCard>
      </Page>
    );
  }

  // The first step that is not done is the one in progress.
  const current = request.steps.findIndex((s) => !s.done);
  const open = isOpen(request);
  const tech = request.technician;

  return (
    <Page>
      <ScreenHeader title={t('requestTitle', { id: request.id })} subtitle={b(equipment.name)} />
      <div className="split service-detail">
        <div className="stack">
          <JCard>
            <SectionTitle>{t('progress')}</SectionTitle>
            <div style={{ marginTop: 16 }}>
              <Timeline items={request.steps.map((step, i) => timelineItem(t, b, lang, equipment, step, i === current))} />
            </div>
          </JCard>
          {(request.description != null || request.notes.length > 0) && (
            <JCard className="service-notes">
              <SectionTitle>{t('yourNotes')}</SectionTitle>
              <div className="t-body-l" style={{ marginTop: 8 }}>
                {request.description != null && <p>{request.description}</p>}
                {request.notes.map((note, i) => <p key={i}>• {note}</p>)}
              </div>
            </JCard>
          )}
        </div>

        <aside className="stack sticky-side service-aside">
          <BrandCard blobSize={190}>
            <p className="service-visit-label">{t('technicianVisit')}</p>
            <p className="service-visit-date">{request.visitAt ? dateTime(lang, request.visitAt) : t('visitToBeScheduled')}</p>
            <div className="row" style={{ gap: 14 }}>
              <InitialsAvatar initials={tech ? initials(tech.name) : 'J'} color="var(--magenta)" borderColor="#fff" />
              <div className="grow">
                <div className="service-tech-name">{tech?.name ?? t('technicianToAssign')}</div>
                {tech && <div className="service-tech-role">{b(tech.role)}</div>}
              </div>
              {tech && (
                <CircleButton icon="call_outlined" label={t('callTechnician')} color="var(--navy)" onClick={() => callNumber(tech.phone)} />
              )}
            </div>
          </BrandCard>
          {!open && (
            <JCard padding="small">
              <div className="row between wrap">
                <span className="t-title-s">{t('rateTitle')}</span>
                {request.rating != null
                  ? <Stars value={request.rating} label={t('starsLabel', { count: request.rating })} />
                  : <Button small variant="outlined" onClick={() => setSheet('rate')}>{t('rate')}</Button>}
              </div>
            </JCard>
          )}
        </aside>
      </div>

      {open && (
        <BottomActionBar>
          <Button variant="outlined" onClick={() => setSheet('reschedule')}>{t('reschedule')}</Button>
          <Button onClick={() => setSheet('details')}>{t('addDetails')}</Button>
        </BottomActionBar>
      )}

      {sheet === 'details' && <AddDetailsSheet request={request} onClose={close} />}
      {sheet === 'reschedule' && <RescheduleSheet request={request} onClose={close} />}
      <RatingSheet open={sheet === 'rate'} onClose={close} onRate={(stars) => rateRequest(request.id, stars)} />
    </Page>
  );
}

function timelineItem(
  t: T, b: (v: RequestStep['title']) => string, lang: Lang, equipment: Equipment, step: RequestStep, isCurrent: boolean,
): TimelineItem {
  const std = { received: t('stepReceived'), diagnosed: t('stepDiagnosed'), booked: t('stepBooked'), fixed: t('stepFixed') };
  const title = step.title ? b(step.title) : std[step.kind];
  let subtitle: string | undefined = step.note ? b(step.note) : step.at ? dayMonthTime(lang, step.at) : undefined;
  if (step.kind === 'booked' && !step.at) {
    subtitle = equipment.warrantyMonths == null ? undefined : underWarranty(equipment) ? t('coveredByWarranty') : t('notCovered');
  }
  return { title, subtitle, state: step.done ? 'done' : isCurrent ? 'current' : 'pending' };
}

function AddDetailsSheet({ request, onClose }: { request: ServiceRequest; onClose: () => void }) {
  const { t } = useI18n();
  const addRequestNote = useStore((s) => s.addRequestNote);
  const [note, setNote] = useState('');
  const save = () => {
    const text = note.trim();
    onClose();
    if (text === '') return;
    addRequestNote(request.id, text);
    showToast(t('noteAdded'));
  };
  return (
    <Sheet open onClose={onClose} title={t('addDetails')}>
      <label className="field">
        <span className="sr-only">{t('addDetails')}</span>
        <textarea className="textarea" rows={4} autoFocus placeholder={t('detailsHint')} value={note}
          onChange={(e) => setNote(e.target.value)} />
      </label>
      <div className="row" style={{ justifyContent: 'flex-end', marginTop: 16 }}>
        <Button variant="text" onClick={onClose}>{t('cancel')}</Button>
        <Button onClick={save}>{t('save')}</Button>
      </div>
    </Sheet>
  );
}

const isoDay = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

function RescheduleSheet({ request, onClose }: { request: ServiceRequest; onClose: () => void }) {
  const { t, lang } = useI18n();
  const addRequestNote = useStore((s) => s.addRequestNote);
  const now = new Date();
  const last = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 60);
  const initial = request.visitAt && request.visitAt > now ? request.visitAt : now;
  const [value, setValue] = useState(isoDay(initial));
  const valid = value >= isoDay(now) && value <= isoDay(last);

  const confirm = () => {
    if (!valid) return;
    const [y, m, d] = value.split('-').map(Number);
    onClose();
    addRequestNote(request.id, t('rescheduleNote', { date: fullDate(lang, new Date(y, m - 1, d)) }));
    showToast(t('rescheduleSentTitle'), t('rescheduleSentBody'));
  };
  return (
    <Sheet open onClose={onClose} title={t('pickNewDate')}>
      <label className="field">
        <span className="sr-only">{t('pickNewDate')}</span>
        <input className="input" type="date" lang={lang} min={isoDay(now)} max={isoDay(last)} value={value}
          onChange={(e) => setValue(e.target.value)} />
      </label>
      <div className="row" style={{ justifyContent: 'flex-end', marginTop: 16 }}>
        <Button variant="text" onClick={onClose}>{t('cancel')}</Button>
        <Button onClick={confirm} disabled={!valid}>{t('save')}</Button>
      </div>
    </Sheet>
  );
}

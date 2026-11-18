// Staff: plan and follow visits (technician, hotel, itinerary), and keep the
// list of technicians with their photos. Clients see the same visit in their
// Service tab.
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Button, CircleButton, InitialsAvatar, JCard, ListRow, Page, PageTitle, StatusPill } from '../components/ui';
import { Sheet, showToast } from '../components/overlays';
import { errorKey } from '../components/account/errors';
import { TechnicianPhoto, VisitStatusPill, visitKindKey, visitStatusKey, visitWhen } from '../components/service/VisitParts';
import {
  VISIT_KINDS, VISIT_STATUSES, type Technician, type Visit, type VisitStep,
} from '../data/backend';
import { adminApi } from './adminApi';
import { useI18n, type MsgKey, type T } from '../i18n/i18n';
import { initials } from '../utils/format';

// ------------------------------------------------------------------ helpers

/** ISO → value for <input type="datetime-local"> (local time). */
const toLocalInput = (iso: string | null | undefined) => {
  if (!iso) return '';
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};
const fromLocalInput = (v: string) => (v ? new Date(v).toISOString() : null);

function Field({ label, children, wide }: { label: string; children: ReactNode; wide?: boolean }) {
  return (
    <label className={wide ? 'field staff-wide' : 'field'}>
      <span className="lbl">{label}</span>
      {children}
    </label>
  );
}

// ------------------------------------------------------------------ overview

export function VisitsOverview() {
  const { t, lang } = useI18n();
  const [visits, setVisits] = useState<Visit[] | null>(null);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<Visit | null>(null);

  const load = useCallback(async () => {
    setError('');
    try { setVisits(await adminApi.listVisits()); } catch (e) { setError(t(errorKey(e))); }
  }, [t]);
  useEffect(() => { void load(); }, [load]);

  return (
    <Page>
      <PageTitle title={t('staffVisitsTitle')} subtitle={t('staffVisitsSubtitle')}
        trailing={<Button variant="outlined" small icon="refresh" onClick={load}>{t('refresh')}</Button>} />
      {error && <JCard><p className="t-body-l">{error}</p></JCard>}
      {visits && (
        <JCard padding="none">
          {visits.length === 0 ? <p className="empty">{t('staffNoVisits')}</p> : (
            <table className="acct-table">
              <thead>
                <tr><th>{t('visitWhen')}</th><th>{t('adminColClient')}</th><th className="hide-s">{t('staffTechnician')}</th><th>{t('staffStatus')}</th></tr>
              </thead>
              <tbody>
                {visits.map((v) => (
                  <tr key={v.id} tabIndex={0} onClick={() => setEditing(v)} onKeyDown={(e) => { if (e.key === 'Enter') setEditing(v); }}>
                    <td><div className="t-title-s">{t(visitKindKey(v.kind))}</div><div className="t-body-s">{visitWhen(lang, v)}</div></td>
                    <td><div className="t-title-s">{v.clientName}</div><div className="t-body-s">{v.siteAddress ?? v.clientPhone ?? ''}</div></td>
                    <td className="hide-s">{v.technician?.name ?? '—'}</td>
                    <td><VisitStatusPill status={v.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </JCard>
      )}
      {editing && (
        <VisitEditor clientId={editing.clientId} clientName={editing.clientName} visit={editing}
          onClose={() => setEditing(null)} onSaved={() => void load()} />
      )}
    </Page>
  );
}

/** A client's visits inside the client sheet, with "Plan a visit". */
export function ClientVisits({ clientId, clientName }: { clientId: string; clientName: string }) {
  const { t } = useI18n();
  const [visits, setVisits] = useState<Visit[] | null>(null);
  const [editing, setEditing] = useState<Visit | 'new' | null>(null);
  const load = useCallback(() => { adminApi.listVisits(clientId).then(setVisits).catch(() => setVisits([])); }, [clientId]);
  useEffect(() => { load(); }, [load]);
  return (
    <div className="acct-farm">
      <div className="row" style={{ justifyContent: 'space-between', gap: 8 }}>
        <h3 className="t-title-m">{t('myVisits')}</h3>
        <Button small icon="add" onClick={() => setEditing('new')}>{t('staffPlanVisit')}</Button>
      </div>
      {visits && visits.length === 0 && <p className="t-body-m" style={{ margin: 0 }}>{t('staffNoVisitsClient')}</p>}
      {visits?.map((v) => <StaffVisitRow key={v.id} visit={v} onOpen={() => setEditing(v)} />)}
      {editing && (
        <VisitEditor clientId={clientId} clientName={clientName} visit={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)} onSaved={load} />
      )}
    </div>
  );
}

function StaffVisitRow({ visit, onOpen }: { visit: Visit; onOpen: () => void }) {
  const { t, lang } = useI18n();
  return (
    <ListRow onClick={onOpen} leading={<TechnicianPhoto tech={visit.technician} size={44} />}
      title={t(visitKindKey(visit.kind))}
      subtitle={[visitWhen(lang, visit), visit.technician?.name].filter(Boolean).join(' · ')}
      trailing={<VisitStatusPill status={visit.status} />} />
  );
}

// ------------------------------------------------------------------ editor

const TYPICAL: MsgKey[] = ['stepLeaveOffice', 'stepArriveTown', 'stepHotel', 'stepOnSite', 'stepLeaveSite', 'stepBack'];
const typicalSteps = (t: T): VisitStep[] =>
  TYPICAL.map((k) => ({ title: t(k), place: null, plannedAt: null, doneAt: null, note: null }));

function VisitEditor({ clientId, clientName, visit, onClose, onSaved }: {
  clientId: string; clientName?: string; visit: Visit | null; onClose: () => void; onSaved: () => void;
}) {
  const { t } = useI18n();
  const [techs, setTechs] = useState<Technician[]>([]);
  const [v, setV] = useState(() => ({
    kind: visit?.kind ?? 'site_visit',
    status: visit?.status ?? 'planned',
    technicianId: visit?.technician?.id ?? '',
    startsAt: toLocalInput(visit?.startsAt),
    endsAt: toLocalInput(visit?.endsAt),
    siteAddress: visit?.siteAddress ?? '',
    purpose: visit?.purpose ?? '',
    hotelName: visit?.hotel?.name ?? '',
    hotelAddress: visit?.hotel?.address ?? '',
    hotelPhone: visit?.hotel?.phone ?? '',
    checkIn: visit?.hotel?.checkIn ?? '',
    checkOut: visit?.hotel?.checkOut ?? '',
    transport: visit?.transport ?? '',
    toPrepare: visit?.toPrepare ?? '',
  }));
  const [steps, setSteps] = useState<VisitStep[]>(visit?.steps ?? []);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = (k: keyof typeof v) => (e: { target: { value: string } }) => setV((x) => ({ ...x, [k]: e.target.value }));

  useEffect(() => { adminApi.listTechnicians().then(setTechs).catch(() => {}); }, []);

  const setStep = (i: number, patch: Partial<VisitStep>) => setSteps((all) => all.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  const move = (i: number, d: -1 | 1) => setSteps((all) => {
    const j = i + d;
    if (j < 0 || j >= all.length) return all;
    const next = [...all]; [next[i], next[j]] = [next[j], next[i]]; return next;
  });

  const save = async () => {
    if (!v.startsAt) { setError(t('staffStartRequired')); return; }
    setBusy(true);
    setError('');
    try {
      await adminApi.saveVisit({
        id: visit?.id,
        clientId,
        kind: v.kind,
        status: v.status,
        technicianId: v.technicianId || null,
        startsAt: fromLocalInput(v.startsAt)!,
        endsAt: fromLocalInput(v.endsAt),
        siteAddress: v.siteAddress,
        purpose: v.purpose,
        hotel: { name: v.hotelName, address: v.hotelAddress, phone: v.hotelPhone, checkIn: v.checkIn || null, checkOut: v.checkOut || null },
        transport: v.transport,
        toPrepare: v.toPrepare,
        steps: steps.filter((s) => s.title.trim() !== ''),
      });
      showToast(t('staffVisitSaved'), clientName);
      onSaved();
      onClose();
    } catch (e) {
      setError(t(errorKey(e)));
      setBusy(false);
    }
  };

  const activeTechs = techs.filter((x) => x.active !== false || x.id === v.technicianId);

  return (
    <Sheet open onClose={onClose} wide title={`${visit ? t('staffEditVisit') : t('staffPlanVisit')}${clientName ? ` · ${clientName}` : ''}`}>
      <div className="staff-form">
        <Field label={t('staffKind')}>
          <select className="select" value={v.kind} onChange={set('kind')}>
            {VISIT_KINDS.map((k) => <option key={k} value={k}>{t(visitKindKey(k))}</option>)}
          </select>
        </Field>
        <Field label={t('staffStatus')}>
          <select className="select" value={v.status} onChange={set('status')}>
            {VISIT_STATUSES.map((s) => <option key={s} value={s}>{t(visitStatusKey(s))}</option>)}
          </select>
        </Field>
        <Field label={t('staffStart')}><input className="input" type="datetime-local" value={v.startsAt} onChange={set('startsAt')} /></Field>
        <Field label={t('staffEnd')}><input className="input" type="datetime-local" value={v.endsAt} onChange={set('endsAt')} /></Field>
        <Field label={t('staffTechnician')} wide>
          <select className="select" value={v.technicianId} onChange={set('technicianId')}>
            <option value="">{t('technicianTbc')}</option>
            {activeTechs.map((x) => <option key={x.id} value={x.id}>{x.name}{x.role ? ` – ${x.role}` : ''}</option>)}
          </select>
        </Field>
        <Field label={t('siteAddress')} wide><input className="input" value={v.siteAddress} maxLength={200} onChange={set('siteAddress')} /></Field>
        <Field label={t('visitPurpose')} wide><textarea className="textarea" rows={2} value={v.purpose} maxLength={2000} onChange={set('purpose')} /></Field>

        <h3 className="t-title-m staff-wide staff-form-h">{t('whereHeStays')}</h3>
        <Field label={t('staffHotelName')}><input className="input" value={v.hotelName} maxLength={120} onChange={set('hotelName')} /></Field>
        <Field label={t('staffHotelPhone')}><input className="input" type="tel" value={v.hotelPhone} maxLength={32} onChange={set('hotelPhone')} /></Field>
        <Field label={t('staffHotelAddress')} wide><input className="input" value={v.hotelAddress} maxLength={200} onChange={set('hotelAddress')} /></Field>
        <Field label={t('checkIn')}><input className="input" type="date" value={v.checkIn} onChange={set('checkIn')} /></Field>
        <Field label={t('checkOut')}><input className="input" type="date" value={v.checkOut} onChange={set('checkOut')} /></Field>
        <Field label={t('visitTransport')} wide><input className="input" value={v.transport} maxLength={200} placeholder={t('staffTransportHint')} onChange={set('transport')} /></Field>
        <Field label={t('toPrepare')} wide><textarea className="textarea" rows={2} value={v.toPrepare} maxLength={2000} onChange={set('toPrepare')} /></Field>

        <div className="staff-wide row" style={{ justifyContent: 'space-between', gap: 8, marginTop: 8 }}>
          <h3 className="t-title-m staff-form-h" style={{ margin: 0 }}>{t('itinerary')}</h3>
          {steps.length === 0 && <Button small variant="outlined" onClick={() => setSteps(typicalSteps(t))}>{t('staffTypicalSteps')}</Button>}
        </div>
        <div className="staff-wide stack" style={{ ['--gap' as string]: '8px' }}>
          {steps.map((s, i) => (
            <div className="staff-step" key={s.id ?? `n${i}`}>
              <label className="staff-step-done" title={t('staffStepDone')}>
                <input type="checkbox" checked={!!s.doneAt} aria-label={t('staffStepDone')}
                  onChange={(e) => setStep(i, { doneAt: e.target.checked ? (s.doneAt ?? new Date().toISOString()) : null })} />
              </label>
              <input className="input" aria-label={t('staffStepTitle')} placeholder={t('staffStepTitle')} value={s.title} maxLength={120}
                onChange={(e) => setStep(i, { title: e.target.value })} />
              <input className="input" aria-label={t('staffStepPlace')} placeholder={t('staffStepPlace')} value={s.place ?? ''} maxLength={160}
                onChange={(e) => setStep(i, { place: e.target.value })} />
              <input className="input" type="datetime-local" aria-label={t('staffStepTime')} value={toLocalInput(s.plannedAt)}
                onChange={(e) => setStep(i, { plannedAt: fromLocalInput(e.target.value) })} />
              <div className="staff-step-btns">
                <CircleButton icon="expand_less" label={t('staffMoveUp')} size={36} outlined onClick={() => move(i, -1)} disabled={i === 0} />
                <CircleButton icon="delete_outline" label={t('remove')} size={36} outlined color="var(--magenta)"
                  onClick={() => setSteps((all) => all.filter((_, j) => j !== i))} />
              </div>
            </div>
          ))}
          <div><Button small variant="outlined" icon="add" onClick={() => setSteps((all) => [...all, { title: '', place: null, plannedAt: null, doneAt: null, note: null }])}>
            {t('staffAddStep')}
          </Button></div>
        </div>

        {error && <p className="acct-error staff-wide" role="alert">{error}</p>}
        <div className="staff-wide row" style={{ justifyContent: 'flex-end', gap: 8 }}>
          <Button variant="text" onClick={onClose} disabled={busy}>{t('cancel')}</Button>
          <Button onClick={() => void save()} disabled={busy}>{busy ? t('saving') : t('save')}</Button>
        </div>
      </div>
    </Sheet>
  );
}

// ------------------------------------------------------------------ technicians

export function TechniciansScreen() {
  const { t } = useI18n();
  const [list, setList] = useState<Technician[] | null>(null);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<Technician | 'new' | null>(null);
  const load = useCallback(async () => {
    try { setList(await adminApi.listTechnicians()); } catch (e) { setError(t(errorKey(e))); }
  }, [t]);
  useEffect(() => { void load(); }, [load]);

  return (
    <Page>
      <PageTitle title={t('staffTechniciansTitle')} subtitle={t('staffTechniciansSubtitle')}
        trailing={<Button icon="add" onClick={() => setEditing('new')}>{t('staffAddTechnician')}</Button>} />
      {error && <JCard><p className="t-body-l">{error}</p></JCard>}
      {list && (
        <div className="grid g3">
          {list.length === 0 && <JCard><p className="t-body-l" style={{ margin: 0 }}>{t('staffNoTechnicians')}</p></JCard>}
          {list.map((x) => (
            <JCard key={x.id} onClick={() => setEditing(x)} ariaLabel={x.name}>
              <div className="row" style={{ gap: 14 }}>
                <TechnicianPhoto tech={x} size={64} />
                <div className="grow">
                  <div className="t-title-s">{x.name}</div>
                  <div className="t-body-s">{[x.role, x.phone].filter(Boolean).join(' · ')}</div>
                  {x.active === false && <StatusPill label={t('staffInactive')} tone="pink" />}
                </div>
              </div>
            </JCard>
          ))}
        </div>
      )}
      {editing && <TechnicianSheet tech={editing === 'new' ? null : editing} onClose={() => setEditing(null)} onSaved={setList} />}
    </Page>
  );
}

function TechnicianSheet({ tech, onClose, onSaved }: { tech: Technician | null; onClose: () => void; onSaved: (l: Technician[]) => void }) {
  const { t } = useI18n();
  const [name, setName] = useState(tech?.name ?? '');
  const [role, setRole] = useState(tech?.role ?? '');
  const [phone, setPhone] = useState(tech?.phone ?? '');
  const [active, setActive] = useState(tech?.active !== false);
  const [photoPath, setPhotoPath] = useState(tech?.photoPath ?? null);
  const [preview, setPreview] = useState(tech?.photoUrl ?? null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const pickPhoto = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const path = await adminApi.uploadTechnicianPhoto(file);
      setPhotoPath(path);
      setPreview(URL.createObjectURL(file));
    } catch (e) {
      setError(t(errorKey(e)));
    }
    setBusy(false);
  };

  const save = async () => {
    if (!name.trim()) { setError(t('equipmentNameRequired')); return; }
    setBusy(true);
    try {
      onSaved(await adminApi.saveTechnician({ id: tech?.id, name: name.trim(), role, phone, photoPath, active }));
      showToast(t('staffTechnicianSaved'), name.trim());
      onClose();
    } catch (e) {
      setError(t(errorKey(e)));
      setBusy(false);
    }
  };

  return (
    <Sheet open onClose={onClose} title={tech ? t('staffEditTechnician') : t('staffAddTechnician')}>
      <div className="stack" style={{ ['--gap' as string]: '14px' }}>
        <div className="row" style={{ gap: 16 }}>
          {preview
            ? <span className="photo-circle visit-tech-photo" style={{ width: 88, height: 88 }}><img src={preview} alt="" /></span>
            : <InitialsAvatar initials={name ? initials(name) : '?'} size={88} />}
          <label className="btn outlined small" style={{ cursor: 'pointer' }}>
            <span>{preview ? t('staffChangePhoto') : t('staffAddPhoto')}</span>
            <input type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => void pickPhoto(e.target.files?.[0])} />
          </label>
          {preview && <Button small variant="text" onClick={() => { setPhotoPath(null); setPreview(null); }}>{t('remove')}</Button>}
        </div>
        <Field label={`${t('fullName')} *`}><input className="input" value={name} maxLength={120} onChange={(e) => setName(e.target.value)} /></Field>
        <Field label={t('staffRole')}><input className="input" value={role} maxLength={80} placeholder={t('staffRoleHint')} onChange={(e) => setRole(e.target.value)} /></Field>
        <Field label={t('phoneOptional')}><input className="input" type="tel" value={phone} maxLength={32} onChange={(e) => setPhone(e.target.value)} /></Field>
        <label className="row" style={{ gap: 8 }}>
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
          <span className="t-body-m">{t('staffActive')}</span>
        </label>
        {error && <p className="acct-error" role="alert">{error}</p>}
        <div className="row" style={{ justifyContent: 'flex-end', gap: 8 }}>
          <Button variant="text" onClick={onClose} disabled={busy}>{t('cancel')}</Button>
          <Button onClick={() => void save()} disabled={busy}>{busy ? t('saving') : t('save')}</Button>
        </div>
      </div>
    </Sheet>
  );
}

// JOGOO staff page: every client who signed up, their current stage, and a
// form to move them to the next stage with a note the client will see.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, ChoicePill, InitialsAvatar, JCard, Page, PageTitle, PillRow, SearchBox, StatusPill, Timeline, type TimelineItem } from '../components/ui';
import { Sheet, showToast } from '../components/overlays';
import { errorKey } from '../components/account/errors';
import { stageKey, stageTone } from '../components/account/stages';
import { backend, STAGES, type AdminClient, type ClientList, type Journey, type Profile, type Stage } from '../data/backend';
import { useAuth, isAdmin, isSuperAdmin } from '../data/auth';
import { useI18n } from '../i18n/i18n';
import { dayMonth, dayMonthTime, decimalTrim, fullDate, initials } from '../utils/format';
import '../styles/account.css';

export default function AdminScreen() {
  const { t } = useI18n();
  const me = useAuth((s) => s.profile);
  if (!isAdmin(me)) {
    return <Page><PageTitle title={t('adminTitle')} /><JCard><p className="t-body-l">{t('adminOnly')}</p></JCard></Page>;
  }
  return <AdminClients />;
}

function AdminClients() {
  const { t, lang } = useI18n();
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [stage, setStage] = useState<Stage | ''>('');
  const [staffView, setStaffView] = useState(false);
  const superAdmin = isSuperAdmin(useAuth((s) => s.profile));
  const [list, setList] = useState<ClientList | null>(null);
  const [error, setError] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(search.trim()), 300);
    return () => window.clearTimeout(id);
  }, [search]);

  // On a slow connection answers can arrive out of order: only the answer to
  // the latest request (search, filter or page) is shown.
  const requestId = useRef(0);
  const load = useCallback(async () => {
    const mine = ++requestId.current;
    setError('');
    try {
      const next = await backend.admin.listClients({ search: debounced, stage: staffView ? '' : stage, page: 1, staff: staffView });
      if (mine === requestId.current) setList(next);
    } catch (e) {
      if (mine === requestId.current) setError(t(errorKey(e)));
    }
  }, [debounced, stage, staffView, t]);
  useEffect(() => { void load(); }, [load]);

  const loadMore = async () => {
    if (!list) return;
    const mine = ++requestId.current;
    setLoadingMore(true);
    try {
      const next = await backend.admin.listClients({ search: debounced, stage: staffView ? '' : stage, page: list.page + 1, staff: staffView });
      if (mine === requestId.current) setList({ ...next, clients: [...list.clients, ...next.clients] });
    } catch (e) {
      if (mine === requestId.current) showToast(t(errorKey(e)), undefined, 'error');
    }
    setLoadingMore(false);
  };

  const totalClients = useMemo(
    () => (list ? Object.values(list.stageCounts).reduce((a, b) => a + b, 0) : 0),
    [list],
  );

  return (
    <Page>
      <PageTitle title={t('adminTitle')} subtitle={list ? t('adminSubtitle', { count: totalClients }) : undefined}
        trailing={<Button variant="outlined" small icon="refresh" onClick={() => void load()}>{t('refresh')}</Button>} />
      <div className="stack">
        <SearchBox hint={t('adminSearch')} value={search} onChange={setSearch} />
        <PillRow wrap>
          <ChoicePill label={`${t('adminAll')} · ${totalClients}`} selected={!staffView && stage === ''} onClick={() => { setStaffView(false); setStage(''); }} />
          {STAGES.map((s) => (
            <ChoicePill key={s} label={`${t(stageKey(s))} · ${list?.stageCounts[s] ?? 0}`} selected={!staffView && stage === s} onClick={() => { setStaffView(false); setStage(s); }} />
          ))}
          {superAdmin && (
            <ChoicePill label={`${t('staffTab')} · ${list?.staffCount ?? 0}`} selected={staffView} selectedColor="var(--magenta)"
              onClick={() => { setStaffView(true); setStage(''); }} />
          )}
        </PillRow>

        {error && <JCard><p className="t-body-l">{error}</p></JCard>}

        {list && (
          <JCard padding="none">
            {list.clients.length === 0 ? (
              <p className="empty">{t('adminNoClients')}</p>
            ) : (
              <table className="acct-table">
                <thead>
                  <tr>
                    <th>{t('adminColClient')}</th>
                    <th className="hide-s">{t('adminColContact')}</th>
                    <th>{t('adminColStage')}</th>
                    <th className="hide-s">{t('adminColUpdated')}</th>
                  </tr>
                </thead>
                <tbody>
                  {list.clients.map((c) => (
                    <tr key={c.id} onClick={() => setOpenId(c.id)}>
                      <td>
                        <div className="row" style={{ gap: 12 }}>
                          <InitialsAvatar initials={initials(c.fullName)} size={40} />
                          <div className="grow">
                            {/* The real control for keyboards and screen readers; the whole row is clickable too. */}
                            <button type="button" className="acct-row-btn t-title-s" onClick={(e) => { e.stopPropagation(); setOpenId(c.id); }}>
                              {c.fullName}
                            </button>
                            <div className="t-body-s">{c.location || '—'}{c.farmSizeHa != null ? ` · ${decimalTrim(lang, c.farmSizeHa)} ha` : ''}</div>
                            <div className="t-body-s show-s">{c.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="hide-s">
                        <div className="t-body-m" style={{ color: 'var(--ink)' }}>{c.email}</div>
                        <div className="t-body-s">{c.phone || '—'}</div>
                      </td>
                      <td>
                        {c.role === 'client'
                          ? <StatusPill label={t(stageKey(c.stage))} tone={stageTone(c.stage)} />
                          : <StatusPill label={c.role === 'super_admin' ? t('superAdmin') : t('roleAdmin')} tone="pink" />}
                      </td>
                      <td className="hide-s t-body-m">{c.stageAt ? dayMonth(lang, new Date(c.stageAt)) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </JCard>
        )}
        {list && list.clients.length < list.total && (
          <div className="center"><Button variant="outlined" onClick={loadMore} disabled={loadingMore}>{t('adminLoadMore')}</Button></div>
        )}
      </div>

      {openId && (
        <ClientSheet id={openId} summary={list?.clients.find((c) => c.id === openId)} canManageRoles={superAdmin}
          onClose={() => setOpenId(null)} onSaved={load} />
      )}
    </Page>
  );
}

function ClientSheet({ id, summary, onClose, onSaved, canManageRoles }: { id: string; summary?: AdminClient; onClose: () => void; onSaved: () => void; canManageRoles: boolean }) {
  const { t, lang } = useI18n();
  const [data, setData] = useState<{ profile: Profile; journey: Journey } | null>(null);
  const [stage, setStage] = useState<Stage>(summary?.stage ?? 'contacted');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  // Second tap needed for actions the client sees or that open everyone's data.
  const [confirming, setConfirming] = useState<null | 'stage' | 'client' | 'admin'>(null);

  useEffect(() => {
    let alive = true;
    backend.admin.getClient(id).then((d) => {
      if (!alive) return;
      setData(d);
      const i = STAGES.indexOf(d.journey.current);
      setStage(STAGES[Math.min(i + 1, STAGES.length - 1)]);
    }).catch((e) => alive && setError(t(errorKey(e))));
    return () => { alive = false; };
  }, [id, t]);

  const save = async () => {
    setConfirming(null);
    setBusy(true);
    setError('');
    try {
      const journey = await backend.admin.addEvent(id, stage, note.trim());
      setData((d) => (d ? { ...d, journey } : d));
      setNote('');
      showToast(t('adminSaved'), t(stageKey(stage)));
      onSaved();
    } catch (e) {
      setError(t(errorKey(e)));
    }
    setBusy(false);
  };

  const p = data?.profile ?? summary;
  const changeRole = async (role: 'client' | 'admin') => {
    setConfirming(null);
    setBusy(true);
    setError('');
    try {
      const profile = await backend.admin.setRole(id, role);
      setData((d) => (d ? { ...d, profile } : d));
      showToast(t('roleUpdated'), role === 'admin' ? t('roleAdmin') : t('roleClient'));
      onSaved();
    } catch (e) {
      setError(t(errorKey(e)));
    }
    setBusy(false);
  };
  const history: TimelineItem[] = (data?.journey.events ?? []).slice().reverse().map((e, i) => ({
    title: t(stageKey(e.stage)),
    subtitle: [dayMonthTime(lang, new Date(e.at)), e.by ? t('adminBy', { name: e.by }) : null, e.note ? `“${e.note}”` : null]
      .filter(Boolean).join(' · '),
    state: i === 0 ? 'current' : 'done',
  }));
  const waNumber = p?.phone ? whatsAppNumber(p.phone) : null;

  return (
    <Sheet open onClose={onClose} title={p?.fullName ?? '…'} wide>
      {p && (
        <div className="stack">
          <p className="t-body-m" style={{ marginTop: -6 }}>{t('adminJoined', { date: fullDate(lang, new Date(p.createdAt)) })}</p>
          <div className="acct-facts">
            <div><span className="t-body-s">{t('email')}</span><a href={`mailto:${p.email}`}>{p.email}</a></div>
            <div><span className="t-body-s">{t('phoneOptional')}</span>{p.phone ? <a href={`tel:${p.phone}`}>{p.phone}</a> : <span>—</span>}</div>
            <div><span className="t-body-s">{t('locationOptional')}</span><span>{p.location || '—'}</span></div>
            <div><span className="t-body-s">{t('area')}</span><span>{p.farmSizeHa != null ? `${decimalTrim(lang, p.farmSizeHa)} ha` : '—'}</span></div>
            <div><span className="t-body-s">{t('adminColUpdated')}</span><span>{summary?.stageAt ? fullDate(lang, new Date(summary.stageAt)) : '—'}</span></div>
            <div><span className="t-body-s">{t('languageTitle')}</span><span>{p.lang === 'fr' ? 'Français' : 'English'}</span></div>
          </div>
          {waNumber && (
            <div className="row wrap">
              <Button small icon="call_outlined" href={`tel:${p.phone}`}>{t('call')}</Button>
              <Button small variant="wa" icon="chat_bubble_outline" href={`https://wa.me/${waNumber}`}>{t('adminOpenWhatsApp')}</Button>
            </div>
          )}

          {canManageRoles && p.role !== 'super_admin' && (
            <div className="acct-role">
              <div className="grow">
                <div className="t-body-s">{t('roleLabel')}</div>
                <div className="t-title-s">{p.role === 'admin' ? t('roleAdmin') : t('roleClient')}</div>
                <div className="t-body-s">{t('staffHelp')}</div>
              </div>
              {p.role === 'admin'
                ? <Button small variant="outlined" disabled={busy || !data} onClick={() => setConfirming('client')}>{t('removeStaff')}</Button>
                : <Button small variant="lime" disabled={busy || !data} onClick={() => setConfirming('admin')}>{t('makeStaff')}</Button>}
            </div>
          )}
          {(confirming === 'admin' || confirming === 'client') && (
            <ConfirmBar text={t(confirming === 'admin' ? 'makeStaffConfirm' : 'removeStaffConfirm', { name: p.fullName })}
              onConfirm={() => void changeRole(confirming)} onCancel={() => setConfirming(null)} />
          )}

          {p.role === 'client' && <div className="acct-stage-form">
            <div className="field">
              <label htmlFor="adm-stage">{t('adminSetStage')}</label>
              <select id="adm-stage" className="select" disabled={!data} value={stage} onChange={(e) => setStage(e.target.value as Stage)}>
                {STAGES.map((s, i) => <option key={s} value={s}>{i + 1}. {t(stageKey(s))}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="adm-note">{t('adminNote')}</label>
              <textarea id="adm-note" className="textarea" disabled={!data} maxLength={1000} value={note} onChange={(e) => setNote(e.target.value)}
                placeholder={t('adminNoteHint')} style={{ minHeight: 80 }} />
            </div>
            {error && <p className="acct-error" role="alert">{error}</p>}
            {confirming === 'stage' ? (
              <ConfirmBar text={t('stageConfirm', { name: p.fullName, stage: t(stageKey(stage)) })}
                onConfirm={() => void save()} onCancel={() => setConfirming(null)} />
            ) : (
              <div className="row" style={{ justifyContent: 'flex-end' }}>
                <Button onClick={() => setConfirming('stage')} disabled={busy || !data}>{t('adminSave')}</Button>
              </div>
            )}
          </div>}

          {p.role === 'client' && <h3 className="t-title-m">{t('adminHistory')}</h3>}
          {p.role === 'client' && (data ? <Timeline items={history} /> : <div className="acct-skeleton" />)}
        </div>
      )}
      {!p && error && <p className="acct-error">{error}</p>}
    </Sheet>
  );
}

function ConfirmBar({ text, onConfirm, onCancel }: { text: string; onConfirm: () => void; onCancel: () => void }) {
  const { t } = useI18n();
  return (
    <div className="acct-confirm" role="alertdialog" aria-label={text}>
      <p className="t-body-m" style={{ color: 'var(--ink)', fontWeight: 600 }}>{text}</p>
      <div className="row wrap" style={{ justifyContent: 'flex-end', gap: 8 }}>
        <Button small variant="text" onClick={onCancel}>{t('cancel')}</Button>
        <Button small onClick={onConfirm}>{t('confirm')}</Button>
      </div>
    </div>
  );
}

/**
 * wa.me needs the full international number without "+". Clients often type
 * local Cameroon numbers ("677 00 01 01"), so add 237 to 9-digit numbers.
 */
function whatsAppNumber(phone: string): string | null {
  let d = phone.replace(/[^0-9+]/g, '');
  if (d.startsWith('+')) d = d.slice(1);
  else if (d.startsWith('00')) d = d.slice(2);
  else if (/^[26]\d{8}$/.test(d)) d = '237' + d;
  d = d.replace(/\D/g, '');
  return d.length >= 10 && d.length <= 15 ? d : null;
}

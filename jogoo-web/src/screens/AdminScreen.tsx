// JOGOO staff page: every client who signed up, their current stage, and a
// form to move them to the next stage with a note the client will see.
import { useCallback, useEffect, useMemo, useState } from 'react';
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

  const load = useCallback(async () => {
    setError('');
    try {
      setList(await backend.admin.listClients({ search: debounced, stage: staffView ? '' : stage, page: 1, staff: staffView }));
    } catch (e) {
      setError(t(errorKey(e)));
    }
  }, [debounced, stage, staffView, t]);
  useEffect(() => { void load(); }, [load]);

  const loadMore = async () => {
    if (!list) return;
    setLoadingMore(true);
    try {
      const next = await backend.admin.listClients({ search: debounced, stage: staffView ? '' : stage, page: list.page + 1, staff: staffView });
      setList({ ...next, clients: [...list.clients, ...next.clients] });
    } catch (e) {
      showToast(t(errorKey(e)));
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
        trailing={<Button variant="outlined" small icon="refresh" onClick={load}>{lang === 'fr' ? 'Actualiser' : 'Refresh'}</Button>} />
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
                    <tr key={c.id} tabIndex={0} onClick={() => setOpenId(c.id)}
                      onKeyDown={(e) => { if (e.key === 'Enter') setOpenId(c.id); }}>
                      <td>
                        <div className="row" style={{ gap: 12 }}>
                          <InitialsAvatar initials={initials(c.fullName)} size={40} />
                          <div className="grow">
                            <div className="t-title-s">{c.fullName}</div>
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
  const waNumber = p?.phone?.replace(/[^0-9]/g, '');

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
          {waNumber && waNumber.length >= 8 && (
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
                ? <Button small variant="outlined" disabled={busy || !data} onClick={() => changeRole('client')}>{t('removeStaff')}</Button>
                : <Button small variant="lime" disabled={busy || !data} onClick={() => changeRole('admin')}>{t('makeStaff')}</Button>}
            </div>
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
            <div className="row" style={{ justifyContent: 'flex-end' }}>
              <Button onClick={save} disabled={busy || !data}>{t('adminSave')}</Button>
            </div>
          </div>}

          {p.role === 'client' && <h3 className="t-title-m">{t('adminHistory')}</h3>}
          {p.role === 'client' && (data ? <Timeline items={history} /> : <div className="acct-skeleton" />)}
        </div>
      )}
      {!p && error && <p className="acct-error">{error}</p>}
    </Sheet>
  );
}

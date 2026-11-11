// "Status" tab: where the client's JOGOO project stands, from sign-up to
// installation. JOGOO staff move clients between stages on the admin page.
import { useCallback, useEffect, useRef, useState } from 'react';
import { BrandCard, Button, JCard, Page, PageTitle, SectionTitle, StatusPill, Timeline, TintIcon, type TimelineItem } from '../components/ui';
import { errorKey } from '../components/account/errors';
import { backend, STAGES, type Journey } from '../data/backend';
import { useI18n } from '../i18n/i18n';
import { lastEventByStage, stageDescKey, stageKey } from '../components/account/stages';
import { fullDate } from '../utils/format';
import { callJogoo, openWhatsApp } from '../utils/actions';
import '../styles/account.css';

export default function StatusScreen() {
  const { t, lang } = useI18n();
  const [journey, setJourney] = useState<Journey | null>(null);
  const [error, setError] = useState('');
  const [loadedAt, setLoadedAt] = useState<Date | null>(null);
  const inFlight = useRef(false);
  const lastLoad = useRef(0);

  const load = useCallback(async (force = true) => {
    // Coming back to the app fires both visibilitychange and focus: one fetch is enough.
    if (inFlight.current || (!force && Date.now() - lastLoad.current < 10000)) return;
    inFlight.current = true;
    lastLoad.current = Date.now();
    setError('');
    try {
      setJourney(await backend.myJourney());
      setLoadedAt(new Date());
    } catch (e) {
      setError(t(errorKey(e)));
    } finally {
      inFlight.current = false;
    }
  }, [t]);

  useEffect(() => { void load(); }, [load]);
  // Pick up stage changes made by JOGOO while the app was in the background.
  useEffect(() => {
    const onVisible = () => { if (document.visibilityState === 'visible') void load(false); };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);
    return () => { document.removeEventListener('visibilitychange', onVisible); window.removeEventListener('focus', onVisible); };
  }, [load]);

  if (!journey) {
    return (
      <Page>
        <PageTitle title={t('statusTitle')} subtitle={t('statusSubtitle')} />
        {error ? (
          <JCard>
            <p className="t-body-l">{error}</p>
            <div style={{ marginTop: 12 }}><Button variant="outlined" icon="refresh" onClick={() => void load()}>{t('tryAgain')}</Button></div>
          </JCard>
        ) : <JCard><div className="acct-skeleton" aria-busy="true" /></JCard>}
      </Page>
    );
  }

  const idx = Math.max(0, STAGES.indexOf(journey.current));
  const events = lastEventByStage(journey.events);
  const currentEvent = events.get(journey.current);
  const latestNote = [...journey.events].reverse().find((e) => e.note);

  const items: TimelineItem[] = STAGES.map((s, i) => {
    const ev = i <= idx ? events.get(s) : undefined;
    const state: TimelineItem['state'] = i < idx ? 'done' : i === idx ? (s === 'installed' ? 'done' : 'current') : 'pending';
    return {
      title: t(stageKey(s)),
      subtitle: i === idx ? t(stageDescKey(s)) + (ev ? ` · ${fullDate(lang, new Date(ev.at))}` : '') : ev ? fullDate(lang, new Date(ev.at)) : undefined,
      subtitleColor: i === idx ? 'var(--navy)' : undefined,
      state,
      icon: i === idx ? 'check' : undefined,
    };
  });

  return (
    <Page>
      <PageTitle title={t('statusTitle')} subtitle={t('statusSubtitle')} />
      {error && loadedAt && (
        <p className="acct-error" role="status" style={{ marginBottom: 16, alignItems: 'center' }}>
          <span className="grow">{t('refreshFailed', { time: loadedAt.toLocaleTimeString(lang === 'fr' ? 'fr-FR' : 'en-GB', { hour: '2-digit', minute: '2-digit' }) })}</span>
          <Button variant="text" small icon="refresh" onClick={() => void load()}>{t('tryAgain')}</Button>
        </p>
      )}
      <div className="split">
        <div className="stack">
          <BrandCard>
            <StatusPill label={t('statusStep', { step: idx + 1, total: STAGES.length })} tone="lime" />
            <h2 className="t-headline" style={{ marginTop: 14, fontSize: 28 }}>{t(stageKey(journey.current))}</h2>
            <p className="t-body-l" style={{ color: '#dfe8f1', marginTop: 6, maxWidth: 520 }}>{t(stageDescKey(journey.current))}</p>
            <div className="acct-progress" aria-hidden="true">
              {STAGES.map((s, i) => <span key={s} className={i <= idx ? 'on' : ''} />)}
            </div>
            {currentEvent && (
              <p className="t-body-s" style={{ marginTop: 10 }}>{t('statusUpdated', { date: fullDate(lang, new Date(currentEvent.at)) })}</p>
            )}
          </BrandCard>

          <JCard>
            <SectionTitle>{t('statusSubtitle')}</SectionTitle>
            <div style={{ marginTop: 18 }}><Timeline items={items} stateLabels={{ done: t('stepDone'), current: t('stepCurrent'), pending: t('stepTodo') }} /></div>
          </JCard>
        </div>

        <div className="stack sticky-side">
          {latestNote && (
            <JCard>
              <div className="row top">
                <TintIcon icon="chat_bubble_outline" tone="lime" size={48} />
                <div className="grow">
                  <div className="t-title-s">{t('statusNoteFrom')}</div>
                  <p className="t-body-l" style={{ marginTop: 4, whiteSpace: 'pre-wrap' }}>{latestNote.note}</p>
                  <p className="t-body-s" style={{ marginTop: 6 }}>
                    {t(stageKey(latestNote.stage))} · {fullDate(lang, new Date(latestNote.at))}
                  </p>
                </div>
              </div>
            </JCard>
          )}
          <JCard>
            <div className="row top">
              <TintIcon icon="call_outlined" tone="blue" size={48} />
              <div className="grow">
                <div className="t-title-s">{t('statusQuestions')}</div>
                <p className="t-body-m">{t('statusQuestionsBody')}</p>
              </div>
            </div>
            <div className="row" style={{ marginTop: 14 }}>
              <Button icon="call_outlined" onClick={callJogoo}>{t('call')}</Button>
              <Button variant="wa" icon="chat_bubble_outline" onClick={() => openWhatsApp()}>WhatsApp</Button>
            </div>
          </JCard>
        </div>
      </div>
    </Page>
  );
}

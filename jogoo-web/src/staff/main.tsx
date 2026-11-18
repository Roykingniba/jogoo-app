// JOGOO Staff: a separate web app (its own build, not part of the client app
// or the APK) where staff track every client's project.
import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../styles/global.css';
import '../styles/account.css';
import './staff.css';
import staffEn from './staff_en.json';
import staffFr from './staff_fr.json';
import { registerMessages, useI18n } from '../i18n/i18n';
import { useStore } from '../data/store';
import { useAuth } from '../data/auth';
import { Logo } from '../components/Logo';
import { ToastHost } from '../components/overlays';
import { Button } from '../components/ui';
import { CodeForm, ErrorBox, ForgotForm, SignInForm } from '../screens/AuthScreen';
import { isStaff, isSuperAdmin } from './adminApi';
import ClientsScreen from './ClientsScreen';
import { TechniciansScreen, VisitsOverview } from './VisitsScreen';

registerMessages('en', staffEn);
registerMessages('fr', staffFr);

function LangToggle() {
  const { lang, t } = useI18n();
  const setLang = useStore((s) => s.setLang);
  return (
    <div className="acct-lang" role="group" aria-label={t('languageTitle')}>
      {(['en', 'fr'] as const).map((l) => (
        <button key={l} type="button" aria-pressed={lang === l} onClick={() => setLang(l)}>{l.toUpperCase()}</button>
      ))}
    </div>
  );
}

function SignIn() {
  const { t } = useI18n();
  const pending = useAuth((s) => s.pending);
  const [forgot, setForgot] = useState(false);
  return (
    <div className="staff-signin">
      <div className="staff-top"><Logo height={48} /><LangToggle /></div>
      <div className="card acct-card">
        <p className="t-title-m" style={{ marginBottom: 12 }}>{t('staffAppTitle')}</p>
        {pending ? <CodeForm onDone={() => setForgot(false)} />
          : forgot ? <ForgotForm onBack={() => setForgot(false)} />
            : <><p className="t-body-m" style={{ marginBottom: 12 }}>{t('staffSignInIntro')}</p><SignInForm onForgot={() => setForgot(true)} /></>}
      </div>
    </div>
  );
}

type Tab = 'clients' | 'visits' | 'technicians';

function StaffApp() {
  const { t, lang } = useI18n();
  const [tab, setTab] = useState<Tab>(() => {
    const h = window.location.hash.replace('#', '');
    return h === 'visits' || h === 'technicians' ? h : 'clients';
  });
  const go = (next: Tab) => { setTab(next); window.location.hash = next === 'clients' ? '' : next; };
  const status = useAuth((s) => s.status);
  const profile = useAuth((s) => s.profile);
  const signOut = useAuth((s) => s.signOut);
  useEffect(() => { void useAuth.getState().init(); }, []);
  useEffect(() => { document.documentElement.lang = lang; document.title = t('staffAppTitle'); }, [lang, t]);

  if (status === 'loading') return <div className="staff-signin" aria-busy="true"><Logo height={56} style={{ alignSelf: 'center' }} /></div>;
  if (status === 'signedOut') return <SignIn />;
  if (!isStaff(profile)) {
    return (
      <div className="staff-signin">
        <div className="staff-top"><Logo height={48} /><LangToggle /></div>
        <div className="card acct-card stack">
          <ErrorBox msg={t('notStaff')} />
          <Button onClick={() => void signOut()}>{t('signOut')}</Button>
        </div>
      </div>
    );
  }
  return (
    <div className="staff-app">
      <header className="staff-header">
        <Logo height={40} />
        <span className="staff-badge">{t('staffAppTitle')}</span>
        <nav className="staff-nav" aria-label={t('staffAppTitle')}>
          {(['clients', 'visits', 'technicians'] as Tab[]).map((k) => (
            <button key={k} type="button" aria-current={tab === k ? 'page' : undefined} onClick={() => go(k)}>
              {k === 'clients' ? t('adminNav') : k === 'visits' ? t('staffVisitsNav') : t('staffTechniciansNav')}
            </button>
          ))}
        </nav>
        <span className="grow" />
        <span className="staff-who t-body-m">{profile!.fullName} · {isSuperAdmin(profile) ? t('superAdmin') : t('staffBadge')}</span>
        <LangToggle />
        <Button variant="text" small icon="logout" onClick={() => void signOut()}>{t('signOut')}</Button>
      </header>
      {tab === 'clients' && <ClientsScreen />}
      {tab === 'visits' && <VisitsOverview />}
      {tab === 'technicians' && <TechniciansScreen />}
      <ToastHost />
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<StrictMode><StaffApp /></StrictMode>);

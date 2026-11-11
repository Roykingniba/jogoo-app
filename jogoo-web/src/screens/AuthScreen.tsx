// Sign in / create a JOGOO client account (email + password).
// Shown instead of the app until the person is signed in.
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Button, ChoicePill, PhotoCircle } from '../components/ui';
import { Logo } from '../components/Logo';
import { Icon } from '../components/Icon';
import { PasswordInput } from '../components/account/PasswordInput';
import { errorKey } from '../components/account/errors';
import { useAuth } from '../data/auth';
import { useStore } from '../data/store';
import { useI18n } from '../i18n/i18n';
import { BackendError } from '../data/backend';
import { showToast } from '../components/overlays';
import '../styles/account.css';

type Mode = 'signIn' | 'signUp' | 'forgot';

export default function AuthScreen() {
  const { t, lang } = useI18n();
  const setLang = useStore((s) => s.setLang);
  const [mode, setMode] = useState<Mode>(() => (window.location.hash.includes('signup') ? 'signUp' : 'signIn'));
  const pending = useAuth((s) => s.pending);
  const notice = useAuth((s) => s.notice);
  const offline = useAuth((s) => s.offline);

  return (
    <div className="acct-page">
      <aside className="acct-brand">
        <Logo variant="white" height={88} className="acct-logo" />
        <div className="acct-brand-copy">
          <h1 className="t-display">{t('authWelcome')}</h1>
          <p className="t-body-l">{t('authTagline')}</p>
        </div>
        <div className="acct-photos" aria-hidden="true">
          <PhotoCircle src="images/field.jpg" size={120} ring={5} ringColor="var(--lime-soft)" />
          <PhotoCircle src="images/drip_line.jpg" size={88} ring={5} ringColor="#fff" />
          <PhotoCircle src="images/sprinkler.jpg" size={72} ring={5} ringColor="var(--orange)" />
        </div>
      </aside>

      <main className="acct-main">
        <div className="acct-top">
          <Logo height={48} className="acct-logo-dark" />
          <div className="acct-lang" role="group" aria-label={t('languageTitle')}>
            {(['en', 'fr'] as const).map((l) => (
              <button key={l} type="button" aria-pressed={lang === l} onClick={() => setLang(l)}>{l.toUpperCase()}</button>
            ))}
          </div>
        </div>

        <h1 className="sr-only">{t('authWelcome')}</h1>
        <div className="acct-card card">
          {offline && <p className="acct-notice" role="status"><Icon name="cloud_off_outlined" size={20} /><span>{t('errOffline')}</span></p>}
          {notice && !pending && (
            <p className="acct-notice" role="status">
              <Icon name="error_outline" size={20} />
              <span>{t(notice === 'sessionExpired' ? 'errSessionExpired' : 'accountDeletedNotice')}</span>
            </p>
          )}
          {pending ? (
            <CodeForm onDone={() => setMode('signIn')} />
          ) : mode === 'forgot' ? (
            <ForgotForm onBack={() => setMode('signIn')} />
          ) : (
            <>
              <div className="pill-wrap acct-modes" role="group" aria-label={t('account')}>
                <ChoicePill label={t('signIn')} selected={mode === 'signIn'} onClick={() => setMode('signIn')} />
                <ChoicePill label={t('signUp')} selected={mode === 'signUp'} onClick={() => setMode('signUp')} />
              </div>
              {mode === 'signIn'
                ? <SignInForm onSwitch={() => setMode('signUp')} onForgot={() => setMode('forgot')} />
                : <SignUpForm onSwitch={() => setMode('signIn')} />}
            </>
          )}
        </div>
        {!pending && mode !== 'forgot' && <p className="t-body-s acct-help">{t('twoStepNote')}</p>}
      </main>
    </div>
  );
}

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

/** Error shown at the top of a form; scrolled into view so it's seen on a phone after tapping the button. */
function ErrorBox({ msg }: { msg: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { ref.current?.scrollIntoView({ block: 'center', behavior: 'smooth' }); }, [msg]);
  return (
    <div className="acct-error" role="alert" ref={ref}>
      <Icon name="error_outline" size={20} />
      <span>{msg}</span>
    </div>
  );
}

function SignInForm({ onSwitch, onForgot }: { onSwitch: () => void; onForgot: () => void }) {
  const { t } = useI18n();
  const signIn = useAuth((s) => s.signIn);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) { setError(t('errMissing')); return; }
    if (!isEmail(email)) { setError(t('errInvalidEmail')); return; }
    setBusy(true);
    setError('');
    try {
      await signIn(email, password);
    } catch (err) {
      setError(t(errorKey(err)));
      setBusy(false);
    }
  };

  return (
    <form className="stack" onSubmit={submit} noValidate>
      <h2 className="t-headline">{t('signIn')}</h2>
      {error && <ErrorBox msg={error} />}
      <div className="field">
        <label htmlFor="si-email">{t('email')}</label>
        <input id="si-email" className="input" type="email" inputMode="email" autoComplete="email" required
          value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="si-pass">{t('password')}</label>
        <PasswordInput id="si-pass" value={password} onChange={setPassword} autoComplete="current-password" />
        <button type="button" className="acct-link acct-forgot" onClick={onForgot}>{t('forgotPasswordLink')}</button>
      </div>
      <Button type="submit" block disabled={busy}>{busy ? t('signingIn') : t('signIn')}</Button>
      <p className="t-body-m center">
        {t('noAccount')}{' '}
        <button type="button" className="acct-link" onClick={onSwitch}>{t('signUp')}</button>
      </p>
    </form>
  );
}

function SignUpForm({ onSwitch }: { onSwitch: () => void }) {
  const { t, lang } = useI18n();
  const signUp = useAuth((s) => s.signUp);
  const [f, setF] = useState({ fullName: '', email: '', password: '', phone: '', location: '', farm: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = (k: keyof typeof f) => (v: string) => setF((x) => ({ ...x, [k]: v }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!f.fullName.trim() || !f.email.trim() || !f.password) { setError(t('errRequiredFields')); return; }
    if (!isEmail(f.email)) { setError(t('errInvalidEmail')); return; }
    if (f.password.length < 8) { setError(t('errWeakPassword')); return; }
    if (new TextEncoder().encode(f.password).length > 72) { setError(t('errPasswordTooLong')); return; }
    // Accept "2,5", "2.5 ha" or "2 hectares".
    const farmText = f.farm.trim().replace(/\s*(ha|hectares?)\.?$/i, '').replace(',', '.');
    const farm = farmText === '' ? null : Number(farmText);
    if (farm !== null && (!Number.isFinite(farm) || farm < 0 || farm > 100000)) { setError(t('errFarmSize')); return; }
    setBusy(true);
    try {
      await signUp({
        fullName: f.fullName.trim(), email: f.email, password: f.password,
        phone: f.phone.trim() || undefined, location: f.location.trim() || undefined, farmSizeHa: farm, lang,
      });
    } catch (err) {
      setError(t(errorKey(err)));
      setBusy(false);
    }
  };

  const opt = <span className="acct-opt"> ({t('optional')})</span>;
  return (
    <form className="stack" onSubmit={submit} noValidate>
      <h2 className="t-headline">{t('signUp')}</h2>
      {error && <ErrorBox msg={error} />}
      <div className="field">
        <label htmlFor="su-name">{t('fullName')}</label>
        <input id="su-name" className="input" autoComplete="name" required maxLength={120}
          value={f.fullName} onChange={(e) => set('fullName')(e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="su-email">{t('email')}</label>
        <input id="su-email" className="input" type="email" inputMode="email" autoComplete="email" required maxLength={254}
          value={f.email} onChange={(e) => set('email')(e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="su-pass">{t('password')}</label>
        <PasswordInput id="su-pass" value={f.password} onChange={set('password')} autoComplete="new-password" minLength={8} />
        <span className="t-body-s">{t('passwordHint')}</span>
      </div>
      <div className="acct-two">
        <div className="field">
          <label htmlFor="su-phone">{t('phoneOptional')}{opt}</label>
          <input id="su-phone" className="input" type="tel" inputMode="tel" autoComplete="tel" maxLength={32} placeholder="+237"
            value={f.phone} onChange={(e) => set('phone')(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="su-loc">{t('locationOptional')}{opt}</label>
          <input id="su-loc" className="input" autoComplete="address-level2" maxLength={120}
            value={f.location} onChange={(e) => set('location')(e.target.value)} />
        </div>
      </div>
      <div className="field">
        <label htmlFor="su-farm">{t('farmSizeOptional')}{opt}</label>
        <input id="su-farm" className="input" inputMode="decimal" maxLength={16}
          value={f.farm} onChange={(e) => set('farm')(e.target.value)} />
      </div>
      <p className="t-body-s">
        {t('signUpConsent')}{' '}
        <a href={`${import.meta.env.BASE_URL}privacy.html`} target="_blank" rel="noopener" style={{ color: 'var(--navy)', fontWeight: 700 }}>{t('privacyLink')}</a>
      </p>
      <Button type="submit" block disabled={busy}>{busy ? t('creatingAccount') : t('signUp')}</Button>
      <p className="t-body-m center">
        {t('haveAccount')}{' '}
        <button type="button" className="acct-link" onClick={onSwitch}>{t('signIn')}</button>
      </p>
    </form>
  );
}

/** Masks to digits only, max 6. */
const digits = (v: string) => v.replace(/\D/g, '').slice(0, 6);

/** Second step: the 6-digit email code (sign-up confirmation, sign-in, or password reset). */
function CodeForm({ onDone }: { onDone: () => void }) {
  const { t } = useI18n();
  const pending = useAuth((s) => s.pending)!;
  const { verifyCode, resendCode, confirmPasswordReset, cancelPending } = useAuth.getState();
  const reset = pending.next === 'reset_code';
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [busy, setBusy] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [wait, setWait] = useState(60);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => { input.current?.focus(); }, []);
  useEffect(() => {
    if (wait <= 0) return;
    const id = window.setTimeout(() => setWait((w) => w - 1), 1000);
    return () => window.clearTimeout(id);
  }, [wait]);

  const submit = async (e?: FormEvent) => {
    e?.preventDefault();
    if (code.length !== 6 || busy) return;
    if (reset && password.length < 8) { setError(t('errWeakPassword')); return; }
    if (reset && new TextEncoder().encode(password).length > 72) { setError(t('errPasswordTooLong')); return; }
    setBusy(true);
    setError('');
    try {
      if (reset) await confirmPasswordReset(code, password, remember);
      else await verifyCode(code, remember);
    } catch (err) {
      let msg = t(errorKey(err));
      if (err instanceof BackendError && err.code === 'invalid_code' && err.attemptsLeft) {
        msg += ' ' + t('attemptsLeft', { count: err.attemptsLeft });
      }
      setError(msg);
      setCode('');
      setBusy(false);
      // An expired code can only be replaced: allow a new one right away.
      if (err instanceof BackendError && err.code === 'code_expired') setWait(0);
      input.current?.focus();
    }
  };

  // Submit as soon as 6 digits are in (typed, pasted or autofilled), except
  // on the reset form, which also needs the new password.
  useEffect(() => {
    if (code.length === 6 && !reset) void submit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const resend = async () => {
    if (resending) return;
    setError('');
    setResending(true);
    try {
      await resendCode();
      setWait(60);
      showToast(t('codeResent'), pending.email);
    } catch (err) {
      setError(t(errorKey(err)));
      if (err instanceof BackendError && err.code === 'wait_before_resend') setWait(60);
    } finally {
      setResending(false);
    }
  };

  const title = pending.next === 'verify_email' ? t('codeTitleVerify') : reset ? t('codeTitleReset') : t('codeTitleLogin');
  return (
    <form className="stack" onSubmit={submit}>
      <div className="acct-code-icon"><Icon name="mail" size={26} /></div>
      <h2 className="t-headline">{title}</h2>
      <p className="t-body-m">{reset ? t('codeSentReset', { email: pending.email }) : t('codeSent', { email: pending.email })}</p>
      {error && <ErrorBox msg={error} />}
      {/* Before the code field: the code submits itself on the 6th digit. */}
      <label className="check-row">
        <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
        <span className="t-body-m" style={{ color: 'var(--ink)' }}>{t('rememberDevice')}</span>
      </label>
      <div className="field">
        <label htmlFor="code">{t('codeLabel')}</label>
        <input id="code" ref={input} className="input acct-code" value={code} onChange={(e) => setCode(digits(e.target.value))}
          inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required placeholder="••••••" />
        <span className="t-body-s">{t('codeCheckSpam')}</span>
      </div>
      {reset && (
        <div className="field">
          <label htmlFor="reset-pass">{t('newPassword')}</label>
          <PasswordInput id="reset-pass" value={password} onChange={setPassword} autoComplete="new-password" minLength={8} />
          <span className="t-body-s">{t('passwordHint')}</span>
        </div>
      )}
      <Button type="submit" block disabled={busy || code.length !== 6}>
        {busy ? t('verifying') : reset ? t('savePassword') : t('verify')}
      </Button>
      <div className="row between wrap">
        <button type="button" className="acct-link" disabled={wait > 0 || resending} onClick={resend}>
          {resending ? t('sendingCode') : wait > 0 ? t('resendIn', { seconds: wait }) : t('resendCode')}
        </button>
        <button type="button" className="acct-link" onClick={() => { cancelPending(); onDone(); }}>
          {reset ? t('backToSignIn') : t('useAnotherAccount')}
        </button>
      </div>
    </form>
  );
}

function ForgotForm({ onBack }: { onBack: () => void }) {
  const { t } = useI18n();
  const request = useAuth((s) => s.requestPasswordReset);
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isEmail(email)) { setError(t('errInvalidEmail')); return; }
    setBusy(true);
    setError('');
    try {
      await request(email);
    } catch (err) {
      setError(t(errorKey(err)));
      setBusy(false);
    }
  };
  return (
    <form className="stack" onSubmit={submit} noValidate>
      <h2 className="t-headline">{t('resetTitle')}</h2>
      <p className="t-body-m">{t('resetIntro')}</p>
      {error && <ErrorBox msg={error} />}
      <div className="field">
        <label htmlFor="fp-email">{t('email')}</label>
        <input id="fp-email" className="input" type="email" inputMode="email" autoComplete="email" required
          value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <Button type="submit" block disabled={busy}>{busy ? t('sendingCode') : t('sendCode')}</Button>
      <button type="button" className="acct-link" style={{ alignSelf: 'center' }} onClick={onBack}>{t('backToSignIn')}</button>
    </form>
  );
}

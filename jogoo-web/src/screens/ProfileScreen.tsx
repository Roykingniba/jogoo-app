// Screen 10: who the client is and what they want this season.
// Ported from lib/screens/profile_screen.dart.
import { useState } from 'react';
import {
  Button, ChoicePill, CircleButton, InitialsAvatar, JCard, Page, SectionTitle, StatusPill, useBack,
} from '../components/ui';
import { Sheet, showToast } from '../components/overlays';
import { useNavigate } from 'react-router-dom';
import { PasswordInput } from '../components/account/PasswordInput';
import { errorKey } from '../components/account/errors';
import { askSignOut } from '../components/account/SignOut';
import { ConfirmSheet } from '../components/account/ConfirmSheet';
import { useAuth, isAdmin } from '../data/auth';
import { backend } from '../data/backend';
import { paths } from '../routes';
import { useI18n, type MsgKey } from '../i18n/i18n';
import { useStore } from '../data/store';
import type { Lang, SeasonGoal, Tone } from '../data/models';
import { decimalTrim, initials, monthYear } from '../utils/format';
import '../styles/home.css';
import '../styles/account.css';

const cropTones: Tone[] = ['pink', 'orange', 'lime', 'blue'];
const goalLabels: [SeasonGoal, MsgKey][] = [
  ['higherYields', 'goalHigherYields'],
  ['moreLandWatered', 'goalMoreLand'],
  ['saveWater', 'goalSaveWater'],
  ['lessLabour', 'goalLessLabour'],
];

export default function ProfileScreen() {
  const { t, b, lang } = useI18n();
  const back = useBack();
  const profile = useStore((s) => s.profile);
  const goals = useStore((s) => s.goals);
  const toggleGoal = useStore((s) => s.toggleGoal);
  const [editing, setEditing] = useState(false);

  return (
    <Page narrow>
      <div className="profile-hero">
        <div className="profile-band" />
        <div className="profile-top">
          <CircleButton icon="chevron_left" label={t('back')} color="#fff" background="rgba(255,255,255,.2)" size={48} onClick={back} />
          <LanguageToggle />
        </div>
        <div className="profile-avatar">
          <InitialsAvatar initials={initials(profile.clientName)} size={128} color="var(--magenta)" borderColor="var(--bg)" />
        </div>
      </div>
      <h1 className="t-headline profile-name">{profile.clientName}</h1>
      <p className="t-body-m profile-since">{t('clientSince', { date: monthYear(lang, profile.clientSince) })}</p>

      <div className="split even" style={{ marginTop: 20 }}>
        <JCard>
          <SectionTitle trailing={<Button variant="outlined" small onClick={() => setEditing(true)}>{t('edit')}</Button>}>
            {t('navMyFarm')}
          </SectionTitle>
          <div className="profile-facts" style={{ marginTop: 14 }}>
            <Fact label={t('location')} value={profile.location} />
            <Fact label={t('area')} value={t('hectares', { value: decimalTrim(lang, profile.areaHa) })} />
          </div>
          <div className="pill-wrap" style={{ gap: 8, marginTop: 14 }}>
            {profile.crops.map((crop, i) => (
              <StatusPill key={i} label={b(crop)} tone={cropTones[i % cropTones.length]} />
            ))}
          </div>
        </JCard>

        <JCard>
          <SectionTitle>{t('thisSeasonIWant')}</SectionTitle>
          <p className="t-body-m" style={{ marginTop: 4 }}>{t('goalsHelp')}</p>
          <div className="pill-wrap" style={{ marginTop: 14 }}>
            {goalLabels.map(([goal, key]) => (
              <ChoicePill key={goal} label={t(key)} selected={goals.includes(goal)} onClick={() => toggleGoal(goal)} />
            ))}
          </div>
        </JCard>
      </div>

      <AccountCard />

      {editing && <EditFarmSheet onClose={() => setEditing(false)} />}
    </Page>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ minWidth: 0 }}>
      <div className="t-body-m">{label}</div>
      <div className="t-title-s">{value}</div>
    </div>
  );
}

/** EN | FR segmented toggle on the navy band. */
function LanguageToggle() {
  const { lang, t } = useI18n();
  const setLang = useStore((s) => s.setLang);
  const option = (code: Lang) => (
    <button type="button" aria-pressed={lang === code} onClick={() => setLang(code)}>
      {code.toUpperCase()}
    </button>
  );
  return (
    <div className="profile-lang" role="group" aria-label={t('languageTitle')}>
      {option('en')}
      {option('fr')}
    </div>
  );
}

/** Dialog to change the farm location and area (Flutter AlertDialog). */
function EditFarmSheet({ onClose }: { onClose: () => void }) {
  const { t, lang } = useI18n();
  const profile = useStore((s) => s.profile);
  const updateFarm = useStore((s) => s.updateFarm);
  const [location, setLocation] = useState(profile.location);
  const [area, setArea] = useState(decimalTrim(lang, profile.areaHa));
  const [error, setError] = useState('');

  const save = () => {
    const raw = area.trim().replace(/\s*(ha|hectares?)\.?$/i, '').replace(',', '.');
    const hectares = raw === '' ? NaN : Number(raw);
    if (location.trim() === '') { setError(t('errMissing')); return; }
    if (!Number.isFinite(hectares) || hectares < 0 || hectares > 100000) { setError(t('errFarmSize')); return; }
    updateFarm(location.trim(), hectares);
    // Keep the account on the server in step; say so if that didn't work.
    useAuth.getState().updateProfile({ location: location.trim(), farmSizeHa: hectares })
      .catch(() => showToast(t('farmSaveLocalOnly'), undefined, 'error'));
    onClose();
  };

  return (
    <Sheet open onClose={onClose} title={t('editFarmTitle')}>
      <form className="stack" onSubmit={(e) => { e.preventDefault(); save(); }} noValidate>
        {error && <p className="acct-error" role="alert">{error}</p>}
        <div className="field">
          <label htmlFor="profile-location">{t('location')}</label>
          <input id="profile-location" className="input" value={location} onChange={(e) => setLocation(e.target.value)} autoComplete="address-level2" />
        </div>
        <div className="field">
          <label htmlFor="profile-area">{t('area')}</label>
          <div className="profile-field-suffix">
            <input id="profile-area" className="input" inputMode="decimal" value={area} onChange={(e) => setArea(e.target.value)} />
            <span className="sfx" aria-hidden="true">ha</span>
          </div>
        </div>
        <div className="row" style={{ justifyContent: 'flex-end', marginTop: 8 }}>
          <Button variant="text" onClick={onClose}>{t('cancel')}</Button>
          <Button type="submit">{t('save')}</Button>
        </div>
      </form>
    </Sheet>
  );
}

/** Signed-in account: contact details, password, sign out, staff page. */
function AccountCard() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const account = useAuth((s) => s.profile);
  const [sheet, setSheet] = useState<'details' | 'password' | 'delete' | null>(null);
  if (!account) return null;
  return (
    <JCard className="acct-account" style={{ marginTop: 16 }}>
      <SectionTitle trailing={<Button variant="outlined" small onClick={() => setSheet('details')}>{t('edit')}</Button>}>
        {t('account')}
      </SectionTitle>
      <div className="profile-facts" style={{ marginTop: 14 }}>
        <Fact label={t('email')} value={account.email} />
        <Fact label={t('phoneOptional')} value={account.phone || '—'} />
      </div>
      <div className="row wrap" style={{ marginTop: 16 }}>
        {isAdmin(account) && <Button icon="clients" onClick={() => navigate(paths.admin)}>{t('adminTitle')}</Button>}
        <Button variant="outlined" icon="key" onClick={() => setSheet('password')}>{t('changePassword')}</Button>
        <Button variant="text" icon="logout" onClick={askSignOut}>{t('signOut')}</Button>
      </div>
      <div className="row wrap" style={{ marginTop: 8, justifyContent: 'space-between' }}>
        <a className="btn text" href={`${import.meta.env.BASE_URL}privacy.html`} target="_blank" rel="noopener">{t('privacyLink')}</a>
        <Button variant="text" icon="delete_outline" className="acct-danger" onClick={() => setSheet('delete')}>{t('deleteAccount')}</Button>
      </div>
      {sheet === 'details' && <AccountDetailsSheet onClose={() => setSheet(null)} />}
      {sheet === 'password' && <PasswordSheet onClose={() => setSheet(null)} />}
      {sheet === 'delete' && <DeleteAccountSheet onClose={() => setSheet(null)} />}
    </JCard>
  );
}

function AccountDetailsSheet({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const account = useAuth((s) => s.profile)!;
  const [name, setName] = useState(account.fullName);
  const [phone, setPhone] = useState(account.phone ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const save = async () => {
    setBusy(true);
    setError('');
    try {
      await useAuth.getState().updateProfile({ fullName: name.trim(), phone: phone.trim() || null });
      showToast(t('profileSaved'));
      onClose();
    } catch (e) {
      setError(t(errorKey(e)));
      setBusy(false);
    }
  };
  return (
    <Sheet open onClose={onClose} title={t('account')}>
      <form className="stack" onSubmit={(e) => { e.preventDefault(); void save(); }}>
        {error && <p className="acct-error" role="alert">{error}</p>}
        <div className="field">
          <label htmlFor="acct-name">{t('fullName')}</label>
          <input id="acct-name" className="input" required maxLength={120} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="acct-phone">{t('phoneOptional')}</label>
          <input id="acct-phone" className="input" type="tel" maxLength={32} autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="row" style={{ justifyContent: 'flex-end' }}>
          <Button variant="text" onClick={onClose}>{t('cancel')}</Button>
          <Button type="submit" disabled={busy}>{t('save')}</Button>
        </div>
      </form>
    </Sheet>
  );
}

function PasswordSheet({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const save = async () => {
    if (next.length < 8) { setError(t('errWeakPassword')); return; }
    if (new TextEncoder().encode(next).length > 72) { setError(t('errPasswordTooLong')); return; }
    setBusy(true);
    setError('');
    try {
      await backend.changePassword(current, next);
      showToast(t('passwordChanged'), t('passwordChangedBody'));
      onClose();
    } catch (e) {
      setError(t(errorKey(e)));
      setBusy(false);
    }
  };
  return (
    <Sheet open onClose={onClose} title={t('changePassword')}>
      <form className="stack" onSubmit={(e) => { e.preventDefault(); void save(); }}>
        {error && <p className="acct-error" role="alert">{error}</p>}
        <div className="field">
          <label htmlFor="pw-cur">{t('currentPassword')}</label>
          <PasswordInput id="pw-cur" value={current} onChange={setCurrent} autoComplete="current-password" />
        </div>
        <div className="field">
          <label htmlFor="pw-new">{t('newPassword')}</label>
          <PasswordInput id="pw-new" value={next} onChange={setNext} autoComplete="new-password" minLength={8} />
          <span className="t-body-s">{t('passwordHint')}</span>
        </div>
        <div className="row" style={{ justifyContent: 'flex-end' }}>
          <Button variant="text" onClick={onClose}>{t('cancel')}</Button>
          <Button type="submit" disabled={busy}>{t('save')}</Button>
        </div>
      </form>
    </Sheet>
  );
}

/** Permanently deletes the account (required by app stores, and the client's right). */
function DeleteAccountSheet({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const confirm = async () => {
    if (!password) { setError(t('errMissing')); return; }
    setBusy(true);
    setError('');
    try {
      await useAuth.getState().deleteAccount(password);
    } catch (e) {
      setError(t(errorKey(e)));
      setBusy(false);
    }
  };
  return (
    <ConfirmSheet open title={t('deleteAccount')} confirmLabel={busy ? t('deleting') : t('deleteAccountConfirm')}
      busy={busy} danger onClose={onClose} onConfirm={() => void confirm()}>
      <p className="t-body-l">{t('deleteAccountBody')}</p>
      {error && <p className="acct-error" role="alert">{error}</p>}
      <div className="field">
        <label htmlFor="del-pass">{t('password')}</label>
        <PasswordInput id="del-pass" value={password} onChange={setPassword} autoComplete="current-password" />
      </div>
    </ConfirmSheet>
  );
}

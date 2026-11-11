// Responsive app frame.
//  - Phones (<720px): content + bottom navigation, like the Flutter app.
//  - Tablets (720-1079px): icon rail on the left.
//  - Desktops (>=1080px): full sidebar with logo, tabs, quick links and language.
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Icon, type IconName } from '../components/Icon';
import { Logo } from '../components/Logo';
import { ToastHost } from '../components/overlays';
import { useI18n, type MsgKey } from '../i18n/i18n';
import { useStore, unreadCount } from '../data/store';
import { paths, tabForPath, type AppTab } from '../routes';
import { InstallBanner, InstallNavItem } from './install';
import { useAuth, isAdmin } from '../data/auth';
import { askSignOut, SignOutConfirm } from '../components/account/SignOut';
import { useUpdate } from './update';

const baseTabs: { tab: AppTab; to: string; icon: IconName; label: MsgKey }[] = [
  { tab: 'home', to: paths.home, icon: 'home_outlined', label: 'navHome' },
  { tab: 'farm', to: paths.farm, icon: 'spa_outlined', label: 'navMyFarm' },
  { tab: 'shop', to: paths.shop, icon: 'shopping_bag_outlined', label: 'navShop' },
  { tab: 'learn', to: paths.learn, icon: 'menu_book_outlined', label: 'navLearn' },
  { tab: 'service', to: paths.service, icon: 'build_outlined', label: 'navService' },
];

export function Shell() {
  const { t, lang } = useI18n();
  const { pathname } = useLocation();
  const current = tabForPath(pathname);
  const unread = useStore((s) => unreadCount(s.notifications));
  const setLang = useStore((s) => s.setLang);
  const account = useAuth((s) => s.profile);
  const offline = useAuth((s) => s.offline);
  const update = useUpdate();
  // Clients get a Status tab; JOGOO staff get the client tracking page instead.
  const tabs = [
    ...baseTabs,
    isAdmin(account)
      ? { tab: 'admin' as AppTab, to: paths.admin, icon: 'clients' as IconName, label: 'adminNav' as MsgKey }
      : { tab: 'status' as AppTab, to: paths.status, icon: 'track' as IconName, label: 'navStatus' as MsgKey },
  ];

  const quick: { to: string; icon: IconName; label: string; badge?: number }[] = [
    { to: paths.mia, icon: 'chat_bubble_outline', label: 'Mia' },
    { to: paths.notifications, icon: 'notifications_none', label: t('notificationsTitle'), badge: unread },
    { to: paths.profile, icon: 'person', label: t('profileNav') },
  ];

  return (
    <div className="app">
      <a href="#main" className="skip-link" onClick={(e) => { e.preventDefault(); document.getElementById('main')?.focus(); }}>
        {t('skipToContent')}
      </a>
      <nav className="side-nav" aria-label={t('appTitle')}>
        <NavLink to={paths.home} className="brand" aria-label="JOGOO">
          <Logo className="logo-full" height={52} />
          <Logo className="logo-mark" variant="mark" height={44} />
        </NavLink>
        {tabs.map((x) => (
          <NavLink key={x.tab} to={x.to} className={() => `nav-item${current === x.tab ? ' active' : ''}`}>
            <span className="ind"><Icon name={x.icon} /></span>
            <span>{t(x.label)}</span>
          </NavLink>
        ))}
        <div className="nav-sep" />
        <div className="nav-section">{t('quickAccess')}</div>
        {quick.map((x) => (
          <NavLink key={x.to} to={x.to} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <span className="ind"><Icon name={x.icon} /></span>
            <span>{x.label}</span>
            {!!x.badge && <span className="badge-dot">{x.badge}</span>}
          </NavLink>
        ))}
        <div className="nav-foot">
          {account && (
            <div className="nav-account">
              <span className="avatar" style={{ width: 36, height: 36, background: 'var(--magenta)', fontSize: 13 }} aria-hidden="true">
                {account.fullName.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase()}
              </span>
              <span className="nav-account-txt">
                <span className="t-title-s">{account.fullName}</span>
                <span className="t-body-s">{account.role === 'super_admin' ? t('superAdmin') : isAdmin(account) ? t('staffBadge') : account.email}</span>
              </span>
            </div>
          )}
          <button type="button" className="nav-item" onClick={askSignOut}>
            <span className="ind"><Icon name="logout" /></span>
            <span>{t('signOut')}</span>
          </button>
          <InstallNavItem />
          <div className="lang-switch pill-row" role="group" aria-label={t('languageTitle')}>
            {(['en', 'fr'] as const).map((l) => (
              <button key={l} type="button" className="choice-pill" aria-pressed={lang === l}
                style={{ flex: 1, padding: '8px 12px' }} onClick={() => setLang(l)}>
                {l === 'en' ? 'English' : 'Français'}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main id="main" className="app-main" tabIndex={-1}>
        {offline && <div className="offline-bar" role="status">{t('offlineAccount')}</div>}
        {update.ready && (
          <div className="offline-bar update-bar" role="status">
            <span>{t('updateAvailable')}</span>
            <button type="button" className="btn small filled" onClick={update.apply}>{t('reload')}</button>
          </div>
        )}
        {current === 'home' && <InstallBanner />}
        <Outlet />
      </main>

      <nav className="bottom-nav" aria-label={t('appTitle')}>
        {tabs.map((x) => (
          <NavLink key={x.tab} to={x.to} className={() => (current === x.tab ? 'active' : '')}>
            <span className="ind"><Icon name={current === x.tab ? x.icon.replace('_outlined', '') as IconName : x.icon} /></span>
            <span className="lbl">{t(x.label)}</span>
          </NavLink>
        ))}
      </nav>
      <ToastHost />
      <SignOutConfirm />
    </div>
  );
}

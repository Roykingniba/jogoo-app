// "Install the app" support (PWA). Chrome/Edge/Android fire beforeinstallprompt;
// iOS Safari has no prompt, so we show the Add to Home Screen steps instead.
import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { Icon } from '../components/Icon';
import { Button, JCard, TintIcon } from '../components/ui';
import { Sheet } from '../components/overlays';
import { useI18n } from '../i18n/i18n';

interface BIPEvent extends Event { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }

const DISMISS_KEY = 'jogoo.installDismissed';

const isStandalone = () =>
  window.matchMedia?.('(display-mode: standalone)').matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;
const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

const useInstall = create<{ event: BIPEvent | null; installed: boolean; dismissed: boolean; help: boolean }>(() => {
  let dismissed = false;
  try { dismissed = localStorage.getItem(DISMISS_KEY) === '1'; } catch { /* ignore */ }
  return { event: null, installed: typeof window !== 'undefined' && isStandalone(), dismissed, help: false };
});

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    useInstall.setState({ event: e as BIPEvent });
  });
  window.addEventListener('appinstalled', () => useInstall.setState({ installed: true, event: null }));
}

async function install() {
  const { event } = useInstall.getState();
  if (event) {
    await event.prompt();
    const choice = await event.userChoice.catch(() => ({ outcome: 'dismissed' }));
    if (choice.outcome === 'accepted') useInstall.setState({ installed: true });
    useInstall.setState({ event: null });
  } else {
    useInstall.setState({ help: true });
  }
}

function InstallHelp() {
  const { t } = useI18n();
  const open = useInstall((s) => s.help);
  return (
    <Sheet open={open} onClose={() => useInstall.setState({ help: false })} title={t('installApp')}>
      <p className="t-body-l">{isIos() ? t('installIosBody') : t('installAndroidBody')}</p>
    </Sheet>
  );
}

/** Dismissible card at the top of Home on phones and tablets. */
export function InstallBanner() {
  const { t } = useI18n();
  const { installed, dismissed, event } = useInstall();
  const [mobile, setMobile] = useState(() => window.matchMedia('(max-width: 1079px)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1079px)');
    const on = () => setMobile(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  if (installed || dismissed || !mobile || (!event && !isIos())) return <InstallHelp />;
  const dismiss = () => {
    try { localStorage.setItem(DISMISS_KEY, '1'); } catch { /* ignore */ }
    useInstall.setState({ dismissed: true });
  };
  return (
    <div className="page" style={{ paddingBottom: 0, paddingTop: 'calc(var(--safe-t) + 12px)' }}>
      <JCard padding="small">
        <div className="install-banner">
          <TintIcon icon="smartphone" tone="lime" size={48} />
          <div className="grow">
            <div className="t-title-s">{t('installApp')}</div>
            <div className="t-body-m">{t('installBody')}</div>
          </div>
        </div>
        <div className="row" style={{ justifyContent: 'flex-end', marginTop: 10 }}>
          <Button variant="text" small onClick={dismiss}>{t('notNow')}</Button>
          <Button small onClick={install}>{t('install')}</Button>
        </div>
      </JCard>
      <InstallHelp />
    </div>
  );
}

/** Sidebar entry on tablets and desktops. Hidden once installed. */
export function InstallNavItem() {
  const { t } = useI18n();
  const installed = useInstall((s) => s.installed);
  if (installed) return null;
  return (
    <button type="button" className="nav-item" onClick={install}>
      <span className="ind"><Icon name="install" /></span>
      <span>{t('installApp')}</span>
    </button>
  );
}

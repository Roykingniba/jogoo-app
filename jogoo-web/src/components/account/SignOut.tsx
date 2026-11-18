// Sign-out with a confirmation: signing out on a shared phone is fine, but
// doing it by accident offline locks the person out until they're back online.
import { useState } from 'react';
import { create } from 'zustand';
import { ConfirmSheet } from './ConfirmSheet';
import { useAuth } from '../../data/auth';
import { useI18n } from '../../i18n/i18n';

const useAsk = create<{ open: boolean }>(() => ({ open: false }));
export const askSignOut = () => useAsk.setState({ open: true });

export function SignOutConfirm() {
  const { t } = useI18n();
  const open = useAsk((s) => s.open);
  const offline = useAuth((s) => s.offline);
  const [busy, setBusy] = useState(false);
  const close = () => useAsk.setState({ open: false });
  return (
    <ConfirmSheet open={open} title={t('signOutConfirmTitle')} confirmLabel={t('signOut')} busy={busy} danger
      onClose={close}
      onConfirm={async () => {
        setBusy(true);
        await useAuth.getState().signOut();
        setBusy(false);
        close();
      }}>
      <p className="t-body-l">{t('signOutConfirmBody')}</p>
      {offline && <p className="acct-error" role="alert">{t('signOutOfflineWarn')}</p>}
    </ConfirmSheet>
  );
}

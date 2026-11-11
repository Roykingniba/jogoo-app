// Small "are you sure?" dialog for actions that are hard to undo.
import type { ReactNode } from 'react';
import { Sheet } from '../overlays';
import { Button } from '../ui';
import { useI18n } from '../../i18n/i18n';

export function ConfirmSheet({
  open, title, children, confirmLabel, busy = false, danger = false, onConfirm, onClose,
}: {
  open: boolean; title: string; children: ReactNode; confirmLabel: string;
  busy?: boolean; danger?: boolean; onConfirm: () => void; onClose: () => void;
}) {
  const { t } = useI18n();
  return (
    <Sheet open={open} onClose={busy ? () => {} : onClose} title={title}>
      <div className="stack">
        {children}
        <div className="row wrap" style={{ gap: 12, justifyContent: 'flex-end' }}>
          <Button variant="outlined" onClick={onClose} disabled={busy}>{t('cancel')}</Button>
          <Button onClick={onConfirm} disabled={busy} className={danger ? 'btn-danger' : undefined}>{confirmLabel}</Button>
        </div>
      </div>
    </Sheet>
  );
}

// Honest hand-off to JOGOO. The app cannot send client requests to JOGOO yet,
// so every request ends here: the client sends a prefilled WhatsApp message
// or calls JOGOO, and is told plainly that nothing was sent by the app.
import type { ReactNode } from 'react';
import { Button, Stack } from '../ui';
import { Icon } from '../Icon';
import { Sheet } from '../overlays';
import { useI18n } from '../../i18n/i18n';
import { callJogoo, openWhatsApp } from '../../utils/actions';

/** "The app does not send this to JOGOO yet" notice, for forms and sheets. */
export function NotSentNote({ extra }: { extra?: string }) {
  const { t } = useI18n();
  return (
    <div className="not-sent">
      <Icon name="error_outline" size={20} />
      <div>
        <p className="t-title-s">{t('notSentTitle')}</p>
        <p className="t-body-m">{t('notSentBody')}{extra ? ` ${extra}` : ''}</p>
      </div>
    </div>
  );
}

/** WhatsApp (with the prefilled message) and Call buttons, stacked full width. */
export function ContactJogooButtons({
  message, onContact, canSend = true, whatsAppLabel,
}: {
  message: string;
  onContact?: (channel: 'whatsapp' | 'call') => void;
  canSend?: boolean;
  whatsAppLabel?: string;
}) {
  const { t } = useI18n();
  return (
    <div className="contact-btns">
      <Button variant="wa" block icon="chat_bubble_outline" disabled={!canSend}
        onClick={() => { onContact?.('whatsapp'); openWhatsApp(message); }}>
        {whatsAppLabel ?? t('sendOnWhatsApp')}
      </Button>
      <Button variant="outlined" block icon="call_outlined" onClick={() => { onContact?.('call'); callJogoo(); }}>
        {t('callJogoo')}
      </Button>
    </div>
  );
}

/**
 * Confirm sheet for a client request: what happens (body), the honest notice,
 * a preview of the WhatsApp message, then WhatsApp / Call. children go above
 * the notice (e.g. a text field). onContact runs before WhatsApp or the dialler opens.
 */
export function ContactJogooSheet({
  open, onClose, title, body, message, children, canSend = true, onContact,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  body?: string;
  message: string;
  children?: ReactNode;
  canSend?: boolean;
  onContact?: (channel: 'whatsapp' | 'call') => void;
}) {
  const { t } = useI18n();
  return (
    <Sheet open={open} onClose={onClose} title={title}>
      <Stack gap={14}>
        {body && <p className="t-body-l">{body}</p>}
        {children}
        <NotSentNote />
        {canSend && message.trim() !== '' && (
          <div>
            <p className="t-label" style={{ marginBottom: 6 }}>{t('messagePreview')}</p>
            <p className="wa-preview">{message}</p>
          </div>
        )}
        <ContactJogooButtons message={message} canSend={canSend}
          onContact={(channel) => { onContact?.(channel); onClose(); }} />
      </Stack>
    </Sheet>
  );
}

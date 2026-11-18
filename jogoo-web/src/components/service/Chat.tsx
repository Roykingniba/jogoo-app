// Chat pieces for Mia and the agronomists, ported from lib/widgets/chat_widgets.dart.
import { useEffect, useRef, type FormEvent, type ReactNode } from 'react';
import { CircleButton, PhotoCircle } from '../ui';
import { Icon } from '../Icon';
import { useI18n } from '../../i18n/i18n';
import type { ChatMessage } from '../../data/models';
import '../../styles/service.css';

/** A message in the Mia or agronomist chat. */
export function ChatBubble({ message, footer }: { message: ChatMessage; footer?: ReactNode }) {
  const { b } = useI18n();
  const mine = message.author === 'client';
  const text = b(message.text);
  const photo = message.photo ?? message.photoFile;

  if (photo) {
    return (
      <div className={mine ? 'bubble-row mine' : 'bubble-row'}>
        <PhotoCircle src={photo} size={140} ring={5} alt={text} />
        {text !== '' && <div className="bubble has-photo">{text}</div>}
      </div>
    );
  }

  return (
    <div className={mine ? 'bubble-row mine' : 'bubble-row'}>
      <div className="bubble">
        {message.sender && <div className="sender">{b(message.sender)}</div>}
        <Linkified text={text} />
        {footer && <div className="footer">{footer}</div>}
      </div>
    </div>
  );
}

/** Text with web links made clickable (Mia sends quote PDFs as links). */
function Linkified({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/[^\s<>"']+)/g);
  return (
    <>
      {parts.map((p, i) => {
        if (i % 2 === 0) return p;
        const href = p.replace(/[.,;:!?)]+$/, '');
        const rest = p.slice(href.length);
        return <span key={i}><a href={href} target="_blank" rel="noopener noreferrer">{href}</a>{rest}</span>;
      })}
    </>
  );
}

/** Column of messages; keeps the newest one in view. */
export function ChatList({ children, scrollKey }: { children: ReactNode; scrollKey: unknown }) {
  const first = useRef(true);
  useEffect(() => {
    // The page wrapper scrolls to the top on mount, so wait a frame first.
    const smooth = !first.current;
    first.current = false;
    const id = window.requestAnimationFrame(() => {
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
    });
    return () => window.cancelAnimationFrame(id);
  }, [scrollKey]);
  return <div className="chat service-chat" aria-live="polite">{children}</div>;
}

/** Message field with an optional camera button and the lime send button. */
export function ChatInputBar({
  value, onChange, hint, onSend, onCamera, showCamera = false, disabled = false, above, below,
}: {
  value: string;
  onChange: (v: string) => void;
  hint: string;
  onSend: () => void;
  onCamera?: () => void;
  showCamera?: boolean;
  disabled?: boolean;
  /** Full-width row pinned above the field (e.g. "Book a field visit"). */
  above?: ReactNode;
  /** Full-width row pinned below the field (e.g. the urgent call line). */
  below?: ReactNode;
}) {
  const { t } = useI18n();
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!disabled) onSend();
  };
  return (
    <form className="chat-input service-dock" onSubmit={submit}>
      {above && <div className="full">{above}</div>}
      {showCamera && (
        <CircleButton icon="photo_camera_outlined" label={t('sendPhoto')} color="var(--navy)" onClick={onCamera} disabled={disabled} />
      )}
      <label className="box">
        <span className="sr-only">{hint}</span>
        <input type="text" value={value} placeholder={hint} enterKeyHint="send" autoComplete="off"
          onChange={(e) => onChange(e.target.value)} />
      </label>
      {/* A submit button, so it can't reuse CircleButton. */}
      <button type="submit" className="circle-btn send" aria-label={t('send')} title={t('send')} disabled={disabled}
        style={{ width: 56, height: 56, ['--cb-bg' as string]: 'var(--lime-soft)', ['--cb-fg' as string]: 'var(--ink)' }}>
        <Icon name="send_outlined" size={24} />
      </button>
      {below && <div className="full below">{below}</div>}
    </form>
  );
}

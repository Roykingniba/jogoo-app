// Toast, bottom sheet / dialog and media picker.
import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { create } from 'zustand';
import { Icon, type IconName } from './Icon';
import { asset, CircleButton } from './ui';
import { useI18n } from '../i18n/i18n';

// ---------------------------------------------------------------------------
// Toast: dark floating confirmation with the JOGOO mark.

interface ToastState { toast: { id: number; title: string; body?: string } | null }
const useToastStore = create<ToastState>(() => ({ toast: null }));
let timer: number | undefined;

/** Shows the JOGOO confirmation toast for 4 seconds. Callable from anywhere. */
export function showToast(title: string, body?: string) {
  window.clearTimeout(timer);
  useToastStore.setState({ toast: { id: Date.now(), title, body } });
  timer = window.setTimeout(() => useToastStore.setState({ toast: null }), 4000);
}

export function ToastHost() {
  const toast = useToastStore((s) => s.toast);
  return (
    <div className="toast-host" role="status" aria-live="polite">
      {toast && (
        <div className="toast" key={toast.id}>
          <span className="mark"><img src={asset('images/jogoo_mark.png')} alt="" /></span>
          <div className="grow">
            <div className="ttl">{toast.title}</div>
            {toast.body && <div className="bdy">{toast.body}</div>}
          </div>
          <span className="ok"><Icon name="check" size={16} /></span>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sheet: bottom sheet on phones, centred dialog on tablets and desktops.

export function Sheet({
  open, onClose, title, children, wide = false,
}: { open: boolean; onClose: () => void; title?: string; children: ReactNode; wide?: boolean }) {
  const { t } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  // Keep the latest onClose without re-running the open/close effect, so
  // re-renders while the sheet is open don't steal focus.
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeRef.current(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    // Make the page behind the dialog unreachable for keyboard and screen readers.
    const root = document.getElementById('root');
    const opener = document.activeElement as HTMLElement | null;
    root?.setAttribute('inert', '');
    ref.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
      root?.removeAttribute('inert');
      opener?.focus?.();
    };
  }, [open]);
  if (!open) return null;
  return createPortal(
    <div className="scrim" onClick={onClose}>
      <div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title}
        className={wide ? 'sheet wide' : 'sheet'} onClick={(e) => e.stopPropagation()}>
        <div className="handle" />
        {title && (
          <div className="sheet-head">
            <h2 className="t-title-l grow">{title}</h2>
            <CircleButton icon="close" label={t('close')} onClick={onClose} size={44} background="var(--bg)" />
          </div>
        )}
        {children}
      </div>
    </div>,
    document.body,
  );
}

/** A tappable row inside a sheet (icon + label). */
export function SheetOption({ icon, label, onClick }: { icon: IconName; label: string; onClick: () => void }) {
  return (
    <button type="button" className="list-row" onClick={onClick} style={{ padding: '14px 4px' }}>
      <Icon name={icon} color="var(--navy)" />
      <span className="t-title-s grow">{label}</span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Media picker. Phones open the camera (capture) or the gallery; desktops
// open the file chooser. Returns an object URL, or null if cancelled.

export function pickMediaFile(opts: { video?: boolean; camera?: boolean } = {}): Promise<{ url: string; file: File } | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = opts.video ? 'video/*' : 'image/*';
    if (opts.camera) input.setAttribute('capture', 'environment');
    input.style.display = 'none';
    let done = false;
    input.onchange = () => {
      if (done) return;
      done = true;
      const file = input.files?.[0];
      input.remove();
      resolve(file ? { url: URL.createObjectURL(file), file } : null);
    };
    // Resolve null when the chooser is dismissed. Modern browsers fire
    // 'cancel'; older ones only refocus the window, so wait generously there.
    const cancel = () => { if (!done) { done = true; input.remove(); resolve(null); } };
    input.addEventListener('cancel', cancel);
    window.addEventListener('focus', () => setTimeout(cancel, 4000), { once: true });
    document.body.appendChild(input);
    input.click();
  });
}

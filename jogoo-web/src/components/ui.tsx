// Shared components, ported from lib/widgets/jogoo_widgets.dart.
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, type IconName } from './Icon';
import type { Tone } from '../data/models';
import { useI18n } from '../i18n/i18n';

/** Resolves a bundled asset path ("images/x.jpg") against the deploy base. */
export const asset = (path: string) =>
  /^(blob:|data:|https?:)/.test(path) ? path : `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;

const toneCls = (tone: Tone) => `tone-${tone}`;
const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');

// ---------------------------------------------------------------------------

/** White rounded card used for every content block. Pass onClick to make it tappable. */
export function JCard({
  children, onClick, className, padding = 'normal', style, ariaLabel,
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  padding?: 'normal' | 'small' | 'none';
  style?: CSSProperties;
  ariaLabel?: string;
}) {
  const cls = cx('card', padding === 'small' && 'pad-s', padding === 'none' && 'pad-0', onClick && 'tap', className);
  if (onClick) {
    return (
      <div role="button" tabIndex={0} aria-label={ariaLabel} className={cls} style={style} onClick={onClick}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}>
        {children}
      </div>
    );
  }
  return <section className={cls} style={style}>{children}</section>;
}

/** Navy card with the lime brand circle in the top-right corner. */
export function BrandCard({ children, blobSize = 180, className, style }: { children: ReactNode; blobSize?: number; className?: string; style?: CSSProperties }) {
  return <section className={cx('brand-card', className)} style={{ ['--blob' as string]: `${blobSize}px`, ...style }}>{children}</section>;
}

/** Round tinted icon, the design's main visual marker. */
export function TintIcon({ icon, tone = 'blue', size = 56 }: { icon: IconName; tone?: Tone; size?: number }) {
  return (
    <span className={cx('tint-icon', toneCls(tone))} style={{ width: size, height: size }}>
      <Icon name={icon} size={Math.round(size * 0.42)} />
    </span>
  );
}

/** Round photo from the bundle (images/...) or a picked file (blob: URL). */
export function PhotoCircle({ src, size, ring = 0, ringColor = 'var(--surface)', alt = '' }: { src: string; size: number; ring?: number; ringColor?: string; alt?: string }) {
  return (
    <span className="photo-circle" style={{ width: size + ring * 2, height: size + ring * 2, padding: ring, background: ringColor }}>
      <img src={asset(src)} alt={alt} width={size} height={size} loading="lazy" decoding="async" />
    </span>
  );
}

/** Initials in a coloured circle (technicians, the client). */
export function InitialsAvatar({ initials, size = 56, color = 'var(--navy)', borderColor }: { initials: string; size?: number; color?: string; borderColor?: string }) {
  return (
    <span className="avatar" aria-hidden="true"
      style={{ width: size, height: size, background: color, fontSize: size * 0.34, boxShadow: borderColor ? `0 0 0 3px ${borderColor}` : undefined }}>
      {initials}
    </span>
  );
}

/** Small rounded status label: "Due soon", "Confirmed", "Synced"... */
export function StatusPill({ label, tone = 'lime', icon }: { label: string; tone?: Tone; icon?: IconName }) {
  return <span className={cx('status-pill', toneCls(tone))}>{icon && <Icon name={icon} size={14} />}{label}</span>;
}

/** Selectable pill used for tabs, filters and quick choices. */
export function ChoicePill({ label, selected, onClick, selectedColor }: { label: string; selected: boolean; onClick: () => void; selectedColor?: string }) {
  return (
    <button type="button" className="choice-pill" aria-pressed={selected} onClick={onClick}
      style={selectedColor ? { ['--sel' as string]: selectedColor } : undefined}>
      {label}
    </button>
  );
}

/** Horizontal row of ChoicePills; scrolls on phones, wraps when wrap is set. */
export function PillRow({ children, wrap = false }: { children: ReactNode; wrap?: boolean }) {
  return <div className={wrap ? 'pill-wrap' : 'pill-row'}>{children}</div>;
}

/** Round button used for back, close, share and call. */
export function CircleButton({
  icon, onClick, label, color = 'var(--ink)', background = 'var(--surface)', size = 52, outlined = false, href, disabled,
}: {
  icon: IconName; onClick?: () => void; label: string; color?: string; background?: string; size?: number; outlined?: boolean; href?: string; disabled?: boolean;
}) {
  const style = {
    width: size, height: size,
    ['--cb-bg' as string]: background, ['--cb-fg' as string]: color,
    ['--cb-ring' as string]: outlined ? `inset 0 0 0 1.5px ${color}` : 'none',
  } as CSSProperties;
  const inner = <Icon name={icon} size={Math.round(size * 0.42)} />;
  if (href) return <a className="circle-btn" href={href} aria-label={label} title={label} style={style} target="_blank" rel="noreferrer">{inner}</a>;
  return <button type="button" className="circle-btn" onClick={onClick} aria-label={label} title={label} style={style} disabled={disabled}>{inner}</button>;
}

type BtnVariant = 'filled' | 'outlined' | 'lime' | 'text' | 'wa';

/** Pill button. variant: filled (navy), outlined, lime, text, wa (WhatsApp green). */
export function Button({
  children, onClick, variant = 'filled', icon, block, small, disabled, onDark, type = 'button', href, className,
}: {
  children: ReactNode; onClick?: () => void; variant?: BtnVariant; icon?: IconName; block?: boolean; small?: boolean;
  disabled?: boolean; onDark?: boolean; type?: 'button' | 'submit'; href?: string; className?: string;
}) {
  const cls = cx('btn', variant, block && 'block', small && 'small', onDark && 'on-dark', className);
  const content = <>{icon && <Icon name={icon} size={20} />}<span>{children}</span></>;
  if (href) return <a className={cls} href={href} target="_blank" rel="noreferrer">{content}</a>;
  return <button type={type} className={cls} onClick={onClick} disabled={disabled}>{content}</button>;
}

/** Large navy title at the top of each main tab. */
export function PageTitle({ title, subtitle, trailing }: { title: string; subtitle?: string; trailing?: ReactNode }) {
  return (
    <header className="page-title">
      <div className="grow">
        <h1 className="t-display">{title}</h1>
        {subtitle && <p className="t-body-l muted" style={{ marginTop: 4 }}>{subtitle}</p>}
      </div>
      {trailing}
    </header>
  );
}

/** Header of pushed screens: back button, title, subtitle, optional action. */
export function ScreenHeader({
  title, subtitle, trailing, leading, close = false, centerTitle = false, onBack,
}: {
  title: string; subtitle?: string; trailing?: ReactNode; leading?: ReactNode; close?: boolean; centerTitle?: boolean; onBack?: () => void;
}) {
  const { t } = useI18n();
  const back = useBack();
  return (
    <header className={cx('screen-header', centerTitle && 'centered')}>
      <CircleButton icon={close ? 'close' : 'chevron_left'} label={close ? t('close') : t('back')} onClick={onBack ?? back} />
      {leading}
      <div className="titles">
        <h1 className="t-headline" style={centerTitle ? { fontSize: 18 } : undefined}>{title}</h1>
        {subtitle && <p className="t-body-m">{subtitle}</p>}
      </div>
      {trailing ?? (centerTitle ? <span style={{ width: 52 }} /> : null)}
    </header>
  );
}

/** Goes back in history, or to Home when the page was opened directly. */
export function useBack() {
  const navigate = useNavigate();
  return () => {
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
    if (idx > 0) navigate(-1);
    else navigate('/', { replace: true });
  };
}

/** Bold section heading inside or above cards. */
export function SectionTitle({ children, trailing, as: Tag = 'h2' }: { children: ReactNode; trailing?: ReactNode; as?: 'h2' | 'h3' }) {
  if (!trailing) return <Tag className="t-title-l">{children}</Tag>;
  return <div className="section-title"><Tag className="t-title-l">{children}</Tag>{trailing}</div>;
}

/** One row in a list card: icon, title, subtitle, action. */
export function ListRow({
  title, leading, subtitle, subtitleColor, trailing, onClick, className,
}: {
  title: ReactNode; leading?: ReactNode; subtitle?: ReactNode; subtitleColor?: string; trailing?: ReactNode; onClick?: () => void; className?: string;
}) {
  const body = (
    <>
      {leading}
      <div className="txt">
        <div className="t-title-s">{title}</div>
        {subtitle != null && subtitle !== '' && (
          <div className="t-body-m" style={{ marginTop: 2, color: subtitleColor, fontWeight: subtitleColor ? 600 : undefined }}>{subtitle}</div>
        )}
      </div>
      {trailing}
    </>
  );
  if (onClick) return <button type="button" className={cx('list-row', className)} onClick={onClick}>{body}</button>;
  return <div className={cx('list-row', className)}>{body}</div>;
}

/** Column with dividers between children, as in the design's list cards. */
export function Divided({ children }: { children: ReactNode }) {
  return <div className="divided">{children}</div>;
}

export type TimelineMarker = 'done' | 'current' | 'due' | 'pending';
export interface TimelineItem {
  title: string;
  subtitle?: string;
  subtitleColor?: string;
  state: TimelineMarker;
  trailing?: ReactNode;
  /** Replaces the dot for the current step, e.g. a truck on the road. */
  icon?: IconName;
}

/** Vertical progress list: done (lime check), current (navy dot), due (orange ring), pending (grey ring). */
export function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <ol className="timeline" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
      {items.map((it, i) => (
        <li className="tl-item" key={i}>
          <div className="tl-rail">
            <span className={`tl-mark ${it.state}`}>
              {it.state === 'done' && <Icon name="check" size={18} />}
              {it.state === 'current' && it.icon && <Icon name={it.icon} size={16} />}
            </span>
            {i < items.length - 1 && <span className={cx('tl-line', it.state === 'done' && 'done')} />}
          </div>
          <div className="tl-body">
            <div className="grow">
              <div className="t-title-s" style={{ color: it.state === 'pending' ? 'var(--muted)' : undefined }}>{it.title}</div>
              {it.subtitle && (
                <div className="t-body-m" style={{ color: it.subtitleColor, fontWeight: it.subtitleColor ? 700 : undefined }}>{it.subtitle}</div>
              )}
            </div>
            {it.trailing}
          </div>
        </li>
      ))}
    </ol>
  );
}

/** Bar pinned to the bottom of the page with one or two actions. Place it LAST inside <Page>. */
export function BottomActionBar({ children, footer }: { children: ReactNode; footer?: string }) {
  return (
    <div className="action-bar">
      <div className="btns">{children}</div>
      {footer && <p className="t-body-s foot">{footer}</p>}
    </div>
  );
}

/** Rounded search box. */
export function SearchBox({ hint, value, onChange }: { hint: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="search-box">
      <Icon name="search" />
      <input type="search" placeholder={hint} aria-label={hint} value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

/** Round shortcut with a label underneath (Home, Service hub). */
export function RoundShortcut({ label, onClick, icon, tone = 'blue', image, size = 64 }: { label: string; onClick: () => void; icon?: IconName; tone?: Tone; image?: string; size?: number }) {
  return (
    <button type="button" className="shortcut" onClick={onClick}>
      {image ? (
        <span className={cx('tint-icon', toneCls(tone))} style={{ width: size, height: size, padding: size * 0.16 }}>
          <img src={asset(image)} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </span>
      ) : (
        <TintIcon icon={icon!} tone={tone} size={size} />
      )}
      <span className="lbl">{label}</span>
    </button>
  );
}

/** Rectangular rounded photo thumbnail. */
export function Thumb({ src, size = 72, alt = '', radius }: { src: string; size?: number; alt?: string; radius?: number }) {
  return (
    <span className="thumb" style={{ width: size, height: size, borderRadius: radius }}>
      <img src={asset(src)} alt={alt} loading="lazy" decoding="async" />
    </span>
  );
}

/** On/off switch with an accessible label. */
export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <span className="switch">
      <input type="checkbox" role="switch" aria-label={label} checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="track" /><span className="knob" />
    </span>
  );
}

/**
 * Standard page wrapper. Use for every screen:
 *   <Page>        tab pages (wide, max 1180px)
 *   <Page narrow> forms, chats and detail screens (max 880px)
 */
export function Page({ children, narrow = false, className }: { children: ReactNode; narrow?: boolean; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return <div ref={ref} className={cx('page', narrow && 'narrow', className)}>{children}</div>;
}

/** Vertical stack of cards with the standard 16px gap. */
export function Stack({ children, gap = 16, className, style }: { children: ReactNode; gap?: number; className?: string; style?: CSSProperties }) {
  return <div className={cx('stack', className)} style={{ ['--gap' as string]: `${gap}px`, ...style }}>{children}</div>;
}

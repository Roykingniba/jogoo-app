// Sheets shared by the service screens: media source, book a visit, warranty, rating.
import { useCallback, useRef, useState, type ReactNode } from 'react';
import { Icon } from '../Icon';
import { ListRow, TintIcon } from '../ui';
import { Sheet, SheetOption, pickMediaFile, showToast } from '../overlays';
import { useI18n } from '../../i18n/i18n';
import { ContactJogooSheet } from './ContactJogoo';
import { equipmentList, useStore } from '../../data/store';
import { bi, underWarranty, type Equipment } from '../../data/models';
import '../../styles/service.css';

type Picked = { url: string; file: File } | null;

/**
 * Port of pickMedia(): asks camera or gallery in a sheet, then opens the
 * file chooser. Render `sheet` somewhere in the screen.
 */
export function useMediaPicker(): { pick: (video?: boolean) => Promise<Picked>; sheet: ReactNode } {
  const { t } = useI18n();
  const [video, setVideo] = useState<boolean | null>(null);
  const resolver = useRef<((v: Picked) => void) | null>(null);

  const finish = (v: Picked) => {
    resolver.current?.(v);
    resolver.current = null;
  };
  const close = useCallback(() => { setVideo(null); finish(null); }, []);

  const choose = (camera: boolean) => {
    const isVideo = video ?? false;
    setVideo(null);
    const done = resolver.current;
    resolver.current = null;
    // Must run inside the click handler so the browser allows the file chooser.
    pickMediaFile({ video: isVideo, camera })
      .then((r) => done?.(r))
      .catch(() => { showToast(t('cannotOpenCamera'), undefined, 'error'); done?.(null); });
  };

  const pick = (v = false) =>
    new Promise<Picked>((resolve) => {
      resolver.current?.(null);
      resolver.current = resolve;
      setVideo(v);
    });

  const sheet = (
    <Sheet open={video !== null} onClose={close} title={video ? t('recordVideo') : t('takePhoto')}>
      <SheetOption icon={video ? 'videocam_outlined' : 'photo_camera_outlined'} label={video ? t('recordVideo') : t('takePhoto')}
        onClick={() => choose(true)} />
      <SheetOption icon="photo_library_outlined" label={t('chooseFromGallery')} onClick={() => choose(false)} />
    </Sheet>
  );
  return { pick, sheet };
}

/**
 * Port of bookVisit(): asks which installation needs a visit, then hands the
 * request to JOGOO on WhatsApp or by phone (the app cannot book visits itself).
 */
export function BookVisitSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, b } = useI18n();
  const requestFromSales = useStore((s) => s.requestFromSales);
  const [item, setItem] = useState<Equipment | null>(null);
  const close = () => { setItem(null); onClose(); };
  return (
    <>
      <Sheet open={open && !item} onClose={close} title={t('bookVisitTitle')}>
        <p className="t-body-m" style={{ margin: '0 0 8px' }}>{t('bookVisitBody')}</p>
        {equipmentList.map((it) => (
          <ListRow key={it.id} leading={<TintIcon icon={it.icon} tone={it.tone} size={44} />} title={b(it.name)}
            trailing={<Icon name="chevron_right" color="var(--muted)" />} onClick={() => setItem(it)} />
        ))}
      </Sheet>
      <ContactJogooSheet open={open && !!item} onClose={close} title={t('bookVisitTitle')}
        body={item ? t('bookServiceBody', { equipment: b(item.name) }) : undefined}
        message={item ? t('waServiceVisit', { equipment: b(item.name) }) : ''}
        onContact={() => {
          if (!item) return;
          requestFromSales(bi(`Service visit: ${item.name.en}`, `Visite d'entretien : ${item.name.fr}`));
          showToast(t('visitRequestedTitle'), t('visitRequestedBody'));
        }} />
    </>
  );
}

/** Warranty status of each installation. */
export function WarrantySheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, b } = useI18n();
  return (
    <Sheet open={open} onClose={onClose} title={t('actionWarranty')}>
      {equipmentList.map((item) => {
        const covered = underWarranty(item);
        return (
          <ListRow key={item.id}
            leading={<Icon name={covered ? 'verified_user_outlined' : 'gpp_maybe_outlined'} color={covered ? 'var(--olive)' : 'var(--brown)'} />}
            title={b(item.name)}
            subtitle={covered ? t('monthsOf', { left: item.warrantyMonthsLeft, total: item.warrantyMonths }) : t('warrantyEnded')} />
        );
      })}
      <p className="t-body-m" style={{ margin: '8px 0 0' }}>{t('warrantyNote')}</p>
    </Sheet>
  );
}

/** "How was the repair?" with five stars. */
export function RatingSheet({ open, onClose, onRate }: { open: boolean; onClose: () => void; onRate: (stars: number) => void }) {
  const { t } = useI18n();
  const [hover, setHover] = useState(0);
  return (
    <Sheet open={open} onClose={() => { setHover(0); onClose(); }} title={t('rateTitle')}>
      <div className={hover ? 'service-stars hovering' : 'service-stars'} onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((stars) => (
          <button key={stars} type="button" className={stars <= hover ? 'on' : undefined}
            aria-label={t('starsLabel', { count: stars })} title={t('starsLabel', { count: stars })}
            onMouseEnter={() => setHover(stars)} onFocus={() => setHover(stars)}
            onClick={() => { setHover(0); onRate(stars); onClose(); }}>
            <Icon name="star_rounded" size={36} />
          </button>
        ))}
      </div>
    </Sheet>
  );
}

/** Read-only stars, e.g. on a resolved request. */
export function Stars({ value, label }: { value: number; label: string }) {
  return (
    <span className="service-stars static" role="img" aria-label={label}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={s <= value ? 'on' : undefined}><Icon name="star_rounded" size={22} /></span>
      ))}
    </span>
  );
}

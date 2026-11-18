// Screen 11: find the right part without knowing its name.
// Ported from lib/screens/spare_parts_screen.dart (+ qr_scanner_screen.dart).
// Query: ?equipment=<id> preselects the equipment, ?part=<code> highlights a part.
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  BrandCard, Button, CircleButton, Divided, JCard, ListRow, Page, ScreenHeader, TintIcon,
} from '../components/ui';
import { showToast } from '../components/overlays';
import { QrScannerSheet } from '../components/shop/QrScanner';
import { useI18n } from '../i18n/i18n';
import type { SparePart } from '../data/models';
import { inCart, spareParts, useStore } from '../data/store';
import { dayMonth, formatAmount } from '../utils/format';
import '../styles/shop.css';

/** Accepts a part code or name, or a URL with ?part=/?code= or the code as last path segment. */
function findPart(value: string): SparePart | undefined {
  let code = value;
  try {
    const u = new URL(value);
    const segs = u.pathname.split('/').filter(Boolean);
    code = u.searchParams.get('part') ?? u.searchParams.get('code') ?? (segs.length ? decodeURIComponent(segs[segs.length - 1]) : value);
  } catch { /* not a URL: use as typed */ }
  const c = code.trim().toLowerCase();
  return spareParts.find((p) => p.code.toLowerCase() === c)
    ?? spareParts.find((p) => p.name.en.toLowerCase().includes(c) || p.name.fr.toLowerCase().includes(c));
}

export default function SparePartsScreen() {
  const { t, b } = useI18n();
  const [params] = useSearchParams();
  const [highlight, setHighlight] = useState(params.get('part') ?? undefined);
  const [serial, setSerial] = useState('');
  const [scanOpen, setScanOpen] = useState(false);

  const find = (scanned?: string) => {
    const value = (scanned ?? serial).trim();
    if (value === '') return;
    (document.activeElement as HTMLElement | null)?.blur();
    const match = findPart(value);
    if (!match) {
      showToast(t('partNotFound', { code: value }));
      return;
    }
    setHighlight(match.code);
    setSerial(match.code);
    showToast(t('partFound', { name: b(match.name) }));
  };

  const onSubmit = (e: FormEvent) => { e.preventDefault(); find(); };

  return (
    <Page>
      <ScreenHeader title={t('partsTitle')} subtitle={t('partsSubtitle')} />
      <div className="parts-layout">
        <div className="parts-side">
          <BrandCard blobSize={170}>
            <div className="row" style={{ ['--gap' as string]: '16px' }}>
              <CircleButton icon="qr_code_2" label={t('scanSticker')} color="var(--navy)" size={60} onClick={() => setScanOpen(true)} />
              <div className="grow">
                <h2 className="parts-scan-ttl">{t('scanSticker')}</h2>
                <p className="parts-scan-sub">{t('orTypePartCode')}</p>
              </div>
            </div>
            <form className="parts-serial" onSubmit={onSubmit} role="search">
              <input value={serial} onChange={(e) => setSerial(e.target.value)} placeholder="DF-120"
                aria-label={t('orTypePartCode')} autoCapitalize="characters" autoComplete="off" spellCheck={false}
                enterKeyHint="search" />
              <Button variant="lime" type="submit">{t('find')}</Button>
            </form>
          </BrandCard>
        </div>

        <div className="stack">
          <JCard style={{ paddingTop: 4, paddingBottom: 4 }}>
            <Divided>
              {spareParts.map((p) => <PartRow key={p.code} part={p} highlighted={p.code === highlight} />)}
            </Divided>
          </JCard>
        </div>
      </div>

      <QrScannerSheet open={scanOpen} onClose={() => setScanOpen(false)}
        onResult={(v) => { setScanOpen(false); find(v); }} />
    </Page>
  );
}

function PartRow({ part, highlighted }: { part: SparePart; highlighted: boolean }) {
  const { t, b, lang } = useI18n();
  const cart = useStore((s) => s.cart);
  const addToCart = useStore((s) => s.addToCart);
  const ref = useRef<HTMLDivElement>(null);
  const added = inCart(cart, part.code);
  const due = part.dueOn;
  const details = [part.code, `${formatAmount(part.price)} F`, ...(due ? [t('dueOn', { date: dayMonth(lang, due) })] : [])].join(' · ');

  useEffect(() => {
    if (highlighted) ref.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [highlighted]);

  return (
    <div ref={ref}>
      <ListRow className={highlighted ? 'parts-row-hl' : undefined}
        leading={<TintIcon icon={part.icon} tone={part.tone} size={52} />}
        title={b(part.name)}
        subtitle={details}
        subtitleColor={due ? 'var(--brown)' : undefined}
        trailing={added
          ? <span className="parts-added"><CircleButton icon="check" label={t('addedToCart')} background="var(--tint-lime)" color="var(--olive)" size={48} disabled /></span>
          : <CircleButton icon="add" label={t('addToCart')} size={48}
              color={due ? 'var(--ink)' : 'var(--navy)'} background={due ? 'var(--lime-soft)' : 'var(--surface)'} outlined={!due}
              onClick={() => {
                addToCart({ id: part.code, title: part.name, unitPrice: part.price, quantity: 1 });
                showToast(t('addedToCart'), b(part.name));
              }} />}
      />
    </div>
  );
}

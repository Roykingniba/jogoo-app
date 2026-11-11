// Screen 04: one unified shop and catalogue, filtered for this farm.
// Ported from lib/screens/shop_screen.dart. On desktops the cart sits in a
// sticky side column; on phones and tablets it opens in a sheet.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  asset, BrandCard, Button, CircleButton, Divided, ExampleBanner, JCard, ListRow, Page, PageTitle, PhotoCircle,
  SearchBox, SectionTitle, TintIcon,
} from '../components/ui';
import { Sheet, showToast } from '../components/overlays';
import { ContactJogooButtons, ContactJogooSheet } from '../components/service/ContactJogoo';
import { Icon, type IconName } from '../components/Icon';
import { useDesktop } from '../components/shop/useMedia';
import { useI18n, type T } from '../i18n/i18n';
import { bi, type Product, type ProductCategory, type Tone } from '../data/models';
import { cartCount, cartTotal, products, useStore } from '../data/store';
import { formatAmount } from '../utils/format';
import { paths } from '../routes';
import '../styles/shop.css';

/** Lower case without accents, so "ecran" finds "écran" and "vanne" finds "Vanne". */
const fold = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const shownCategories: ProductCategory[] = ['filters', 'valves', 'sprinklers', 'pivots'];

function categoryLabel(t: T, c: ProductCategory): string {
  switch (c) {
    case 'filters': return t('catFilters');
    case 'valves': return t('catValves');
    case 'sprinklers': return t('catSprinklers');
    case 'pivots': return t('catPivots');
    case 'kits': return t('catKits');
  }
}

export default function ShopScreen() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const desktop = useDesktop();
  const cart = useStore((s) => s.cart);
  const requestFromSales = useStore((s) => s.requestFromSales);
  const [category, setCategory] = useState<ProductCategory | null>(null); // null = "For you"
  const [query, setQuery] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);

  const q = fold(query.trim());
  let shown: Product[];
  let heading: string;
  if (q !== '') {
    shown = products.filter((p) => fold(p.name.en).includes(q) || fold(p.name.fr).includes(q));
    heading = t('searchResults');
  } else if (category == null) {
    shown = products.filter((p) => p.recommended);
    heading = t('forYourEquipment');
  } else {
    shown = products.filter((p) => p.category === category);
    heading = categoryLabel(t, category);
  }

  const upsell = (
    <BrandCard blobSize={200}>
      <div className="shop-upsell">
        <div className="grow">
          <h2 className="ttl">{t('upsellTitle')}</h2>
          <p className="bdy">{t('upsellBody')}</p>
        </div>
        <Button onDark onClick={() => setQuoteOpen(true)}>{t('getQuote')}</Button>
      </div>
      <ContactJogooSheet open={quoteOpen} onClose={() => setQuoteOpen(false)} title={t('getQuote')}
        body={t('upsellBody')} message={t('waPriceRequest', { item: t('upsellBody') })}
        onContact={() => {
          requestFromSales(bi('Quote: extend drip system to plot C', 'Devis : extension goutte-à-goutte parcelle C'));
          showToast(t('requestSavedTitle'), t('requestSavedBody', { item: t('upsellTitle') }));
        }} />
    </BrandCard>
  );

  const quickLinks = (
    <div className="shop-quick">
      <QuickLink icon="qr_code_2" tone="blue" title={t('partsTitle')} onClick={() => navigate(paths.spareParts())} />
      <QuickLink icon="spa_outlined" tone="lime" title={t('reorderTitle')} onClick={() => navigate(paths.reorder)} />
    </div>
  );

  const catalogue = (
    <>
      <SearchBox hint={t('searchProducts')} value={query} onChange={setQuery} />
      <div className="shop-cats" role="group" aria-label={t('navShop')}>
        <CategoryBubble label={t('catForYou')} selected={category == null} onClick={() => setCategory(null)} />
        {shownCategories.map((c) => (
          <CategoryBubble key={c} label={categoryLabel(t, c)} photo={products.find((p) => p.category === c)?.photo}
            selected={category === c} onClick={() => setCategory(c)} />
        ))}
      </div>
    </>
  );

  const results = (
    <section className="stack" style={{ ['--gap' as string]: '12px', marginTop: 6 }}>
      <SectionTitle>{heading}</SectionTitle>
      {/* Only the count is announced, not the whole grid. */}
      <p className="sr-only" role="status" aria-live="polite">{q !== '' ? t('resultsCount', { count: shown.length }) : ''}</p>
      {shown.length === 0
        ? <JCard><p className="t-body-l">{t('noProducts')}</p></JCard>
        : <div className="shop-grid">{shown.map((p) => <ProductCard key={p.id} product={p} />)}</div>}
    </section>
  );

  return (
    <Page>
      <PageTitle title={t('navShop')} subtitle={t('shopSubtitle')}
        trailing={desktop ? undefined : <CartButton count={cartCount(cart)} onClick={() => setCartOpen(true)} />} />
      <ExampleBanner />
      {desktop ? (
        <div className="shop-layout">
          <div className="stack">
            {catalogue}
            <div className="shop-promo">
              {upsell}
              {quickLinks}
            </div>
            {results}
          </div>
          <aside className="shop-side" aria-label={t('cart')}>
            <JCard>
              <SectionTitle trailing={cart.length > 0 ? <span className="chip">{cartCount(cart)}</span> : undefined}>
                {t('cartTitle')}
              </SectionTitle>
              <div style={{ marginTop: 8 }}><CartContents /></div>
            </JCard>
          </aside>
        </div>
      ) : (
        <div className="shop-layout">
          {catalogue}
          {upsell}
          {quickLinks}
          {results}
        </div>
      )}
      <Sheet open={cartOpen && !desktop} onClose={() => setCartOpen(false)} title={t('cartTitle')}>
        <CartContents onSubmitted={() => setCartOpen(false)} />
      </Sheet>
    </Page>
  );
}

// ---------------------------------------------------------------------------

function CategoryBubble({ label, photo, selected, onClick }: { label: string; photo?: string; selected: boolean; onClick: () => void }) {
  return (
    <button type="button" className="shop-cat" aria-pressed={selected} onClick={onClick}>
      {photo
        ? <span className="pic"><img src={asset(photo)} alt="" loading="lazy" /></span>
        : <span className="pic icon"><Icon name="spa_outlined" size={30} /></span>}
      <span className="lbl">{label}</span>
    </button>
  );
}

function QuickLink({ icon, tone, title, onClick }: { icon: IconName; tone: Tone; title: string; onClick: () => void }) {
  return (
    <JCard padding="small" onClick={onClick}>
      <TintIcon icon={icon} tone={tone} size={44} />
      <span className="t-title-s grow">{title}</span>
    </JCard>
  );
}

function ProductCard({ product }: { product: Product }) {
  const { t, b } = useI18n();
  const navigate = useNavigate();
  const requestFromSales = useStore((s) => s.requestFromSales);
  const [asking, setAsking] = useState(false);
  // No one-tap request: a confirm sheet explains that the app does not send it, then WhatsApp or Call.
  const record = () => {
    requestFromSales(bi(`Price request: ${product.name.en}`, `Demande de prix : ${product.name.fr}`));
    showToast(t('requestSavedTitle'), t('requestSavedBody', { item: b(product.name) }));
  };
  return (
    <JCard className="shop-product">
      <button type="button" className="open" onClick={() => navigate(paths.product(product.id))}>
        <PhotoCircle src={product.photo} size={104} ring={4} ringColor="var(--bg)" alt={b(product.name)} />
        <span className="t-title-s">{b(product.name)}</span>
        {product.fitNote && <span className={product.highlightFit ? 'fit hi' : 'fit'}>{b(product.fitNote)}</span>}
      </button>
      <Button small variant={product.highlightFit ? 'filled' : 'outlined'} onClick={() => setAsking(true)}>{t('request')}</Button>
      <ContactJogooSheet open={asking} onClose={() => setAsking(false)} title={t('requestPriceTitle')}
        body={t('requestPriceBody', { item: b(product.name) })}
        message={t('waPriceRequest', { item: b(product.name) })} onContact={record} />
    </JCard>
  );
}

function CartButton({ count, onClick }: { count: number; onClick: () => void }) {
  const { t } = useI18n();
  return (
    <span className="shop-cart-btn">
      <CircleButton icon="shopping_cart_outlined" label={count > 0 ? `${t('cart')} (${count})` : t('cart')}
        color="var(--navy)" size={56} onClick={onClick} />
      {count > 0 && <span className="shop-badge" aria-hidden="true">{count}</span>}
    </span>
  );
}

/**
 * Cart review. No online ordering yet: the cart becomes a WhatsApp message to
 * JOGOO sales (or the client calls), who confirm price, fitting and delivery.
 */
function CartContents({ onSubmitted }: { onSubmitted?: () => void }) {
  const { t, b } = useI18n();
  const cart = useStore((s) => s.cart);
  const removeFromCart = useStore((s) => s.removeFromCart);
  const submitCart = useStore((s) => s.submitCart);

  if (cart.length === 0) {
    return (
      <div className="shop-cart-empty">
        <TintIcon icon="shopping_cart_outlined" tone="blue" size={56} />
        <p className="t-body-l muted">{t('cartEmpty')}</p>
      </div>
    );
  }
  const lines = cart.map((l) => `• ${b(l.title)} × ${l.quantity}`).join('\n');
  const message = t('waOrder', { lines, total: formatAmount(cartTotal(cart)) });
  return (
    <div>
      <Divided>
        {cart.map((line) => (
          <ListRow key={line.id} title={b(line.title)}
            subtitle={`${line.quantity} × ${formatAmount(line.unitPrice)} FCFA`}
            trailing={<CircleButton icon="delete_outline" label={t('remove')} size={44} background="var(--bg)"
              onClick={() => removeFromCart(line.id)} />} />
        ))}
      </Divided>
      <div className="shop-cart-total">
        <span className="t-body-l">{t('total')}</span>
        <span className="t-title-m">{formatAmount(cartTotal(cart))} FCFA</span>
      </div>
      <p className="t-body-m" style={{ margin: '12px 0' }}>{t('cartNotSent')}</p>
      <ContactJogooButtons message={message} whatsAppLabel={t('sendOrderRequest')}
        onContact={(channel) => {
          // Only a WhatsApp hand-off empties the cart; after a call the client may still want the list.
          if (channel !== 'whatsapp') return;
          submitCart();
          onSubmitted?.();
          showToast(t('orderRequestSavedTitle'), t('orderRequestSavedBody'));
        }} />
      <p className="t-body-s center" style={{ marginTop: 8 }}>{t('paymentLater')}</p>
    </div>
  );
}

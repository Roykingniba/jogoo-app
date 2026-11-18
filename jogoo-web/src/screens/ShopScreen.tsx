// Screen 04: one unified shop and catalogue, filtered for this farm.
// Ported from lib/screens/shop_screen.dart. On desktops the cart sits in a
// sticky side column; on phones and tablets it opens in a sheet.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  asset, BrandCard, Button, CircleButton, Divided, JCard, ListRow, Page, PageTitle, PhotoCircle,
  SearchBox, SectionTitle, TintIcon,
} from '../components/ui';
import { Sheet, showToast } from '../components/overlays';
import { Icon, type IconName } from '../components/Icon';
import { useDesktop } from '../components/shop/useMedia';
import { useI18n } from '../i18n/i18n';
import { CATEGORIES, categoryById, type CategoryInfo } from '../data/catalogue';
import { bi, type Product, type ProductCategory, type Tone } from '../data/models';
import { cartCount, cartTotal, products, useStore } from '../data/store';
import { formatAmount } from '../utils/format';
import { paths } from '../routes';
import '../styles/shop.css';

const matches = (p: Product, q: string) =>
  [p.name.en, p.name.fr, p.fitNote?.en ?? '', p.fitNote?.fr ?? '', categoryById(p.category).name.en, categoryById(p.category).name.fr]
    .some((x) => x.toLowerCase().includes(q));

export default function ShopScreen() {
  const { t, b } = useI18n();
  const navigate = useNavigate();
  const desktop = useDesktop();
  const cart = useStore((s) => s.cart);
  const requestFromSales = useStore((s) => s.requestFromSales);
  const [category, setCategory] = useState<ProductCategory | null>(null); // null = everything
  const [query, setQuery] = useState('');
  const [cartOpen, setCartOpen] = useState(false);

  const q = query.trim().toLowerCase();
  const info = category ? categoryById(category) : null;
  let shown: Product[];
  let heading: string;
  if (q !== '') {
    shown = products.filter((p) => matches(p, q));
    heading = t('searchResults');
  } else if (info) {
    shown = products.filter((p) => p.category === info.id);
    heading = b(info.name);
  } else {
    shown = products;
    heading = t('allProducts');
  }

  const upsell = (
    <BrandCard blobSize={200}>
      <div className="shop-upsell">
        <div className="grow">
          <h2 className="ttl">{t('upsellTitle')}</h2>
          <p className="bdy">{t('upsellBody')}</p>
        </div>
        <Button onDark onClick={() => {
          requestFromSales(bi('Quote: irrigation project', "Devis : projet d'irrigation"));
          showToast(t('requestSavedTitle'), t('requestSavedBody', { item: t('upsellTitle') }));
        }}>
          {t('getQuote')}
        </Button>
      </div>
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
        <CategoryBubble label={t('filterAll')} selected={category == null} onClick={() => setCategory(null)} />
        {CATEGORIES.map((c) => (
          <CategoryBubble key={c.id} label={b(c.name)} photo={products.find((p) => p.category === c.id)?.photo}
            icon={c.icon} selected={category === c.id} onClick={() => setCategory(c.id)} />
        ))}
      </div>
    </>
  );

  const results = (
    <section aria-live="polite" className="stack" style={{ ['--gap' as string]: '12px', marginTop: 6 }}>
      <SectionTitle trailing={shown.length > 0 ? <span className="chip">{shown.length}</span> : undefined}>{heading}</SectionTitle>
      {q === '' && info?.comingSoon
        ? <ComingSoonCard info={info} />
        : shown.length === 0
          ? <JCard><p className="t-body-l">{t('noProducts')}</p></JCard>
          : <div className="shop-grid">{shown.map((p) => <ProductCard key={p.id} product={p} />)}</div>}
      {q === '' && !category && <p className="t-body-s muted">{t('catalogueNote')}</p>}
    </section>
  );

  return (
    <Page>
      <PageTitle title={t('navShop')} subtitle={t('shopSubtitle')}
        trailing={desktop ? undefined : <CartButton count={cartCount(cart)} onClick={() => setCartOpen(true)} />} />
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

function CategoryBubble({ label, photo, icon, selected, onClick }: {
  label: string; photo?: string; icon?: IconName; selected: boolean; onClick: () => void;
}) {
  return (
    <button type="button" className="shop-cat" aria-pressed={selected} onClick={onClick}>
      {photo
        ? <span className="pic"><img src={asset(photo)} alt="" loading="lazy" /></span>
        : <span className="pic icon"><Icon name={icon ?? 'grid_on'} size={30} /></span>}
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

/** A catalogue section whose products are not in the app yet. */
function ComingSoonCard({ info }: { info: CategoryInfo }) {
  const { t, b } = useI18n();
  const requestFromSales = useStore((s) => s.requestFromSales);
  return (
    <JCard>
      <div className="shop-soon">
        <TintIcon icon={info.icon ?? 'grid_on'} tone="lime" size={64} />
        <h3 className="t-title-l">{b(info.name)}</h3>
        {info.blurb && <p className="t-body-l">{b(info.blurb)}</p>}
        <p className="t-body-m muted">{t('catalogueSoon')}</p>
        <Button icon="chat_bubble_outline" onClick={() => {
          requestFromSales(bi(`Information request: ${info.name.en}`, `Demande d'information : ${info.name.fr}`));
          showToast(t('requestSavedTitle'), t('requestSavedBody', { item: b(info.name) }));
        }}>{t('askJogoo')}</Button>
      </div>
    </JCard>
  );
}

function ProductCard({ product }: { product: Product }) {
  const { t, b } = useI18n();
  const navigate = useNavigate();
  const requestFromSales = useStore((s) => s.requestFromSales);
  const request = () => {
    requestFromSales(bi(`Quote: ${product.name.en}`, `Devis : ${product.name.fr}`));
    showToast(t('requestSavedTitle'), t('requestSavedBody', { item: b(product.name) }));
  };
  return (
    <JCard className="shop-product">
      <button type="button" className="open" onClick={() => navigate(paths.product(product.id))}>
        <PhotoCircle src={product.photo} size={104} ring={4} ringColor="var(--bg)" alt={b(product.name)} />
        <span className="t-title-s">{b(product.name)}</span>
        {product.fitNote && <span className={product.highlightFit ? 'fit hi' : 'fit'}>{b(product.fitNote)}</span>}
      </button>
      <Button small variant={product.highlightFit ? 'filled' : 'outlined'} onClick={request}>{t('getQuote')}</Button>
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
 * Cart review. No online payment yet: the order request goes to JOGOO
 * sales, who confirm price, fitting and delivery by phone.
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
  return (
    <div>
      <Divided>
        {cart.map((line) => (
          <ListRow key={line.id} title={b(line.title)}
            subtitle={`${line.quantity} × ${formatAmount(line.unitPrice)} F`}
            trailing={<CircleButton icon="delete_outline" label={t('remove')} size={44} background="var(--bg)"
              onClick={() => removeFromCart(line.id)} />} />
        ))}
      </Divided>
      <div className="shop-cart-total">
        <span className="t-body-l">{t('total')}</span>
        <span className="t-title-m">{formatAmount(cartTotal(cart))} FCFA</span>
      </div>
      <div style={{ marginTop: 16 }}>
        <Button block onClick={() => {
          submitCart();
          onSubmitted?.();
          showToast(t('orderRequestSavedTitle'), t('orderRequestSavedBody'));
        }}>
          {t('sendOrderRequest')}
        </Button>
      </div>
      <p className="t-body-s center" style={{ marginTop: 8 }}>{t('paymentLater')}</p>
    </div>
  );
}

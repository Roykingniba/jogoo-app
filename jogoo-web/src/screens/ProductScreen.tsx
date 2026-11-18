// Screen 05: a product page that sells the add-ons too.
// Ported from lib/screens/product_screen.dart. Desktop: photo on the left,
// add-ons, total and actions in a sticky right column. Phone: bottom bar.
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  BottomActionBar, Button, CircleButton, Divided, JCard, Page, PhotoCircle, ScreenHeader, StatusPill, TintIcon, useBack,
} from '../components/ui';
import { showToast } from '../components/overlays';
import { useDesktop } from '../components/shop/useMedia';
import { useI18n } from '../i18n/i18n';
import { bi, same, type AddOn, type Product } from '../data/models';
import { productById, useStore } from '../data/store';
import { CATALOGUE, categoryById } from '../data/catalogue';
import { dayMonth, formatAmount } from '../utils/format';
import '../styles/shop.css';

export default function ProductScreen() {
  const { id = '' } = useParams();
  const product = productById(id);
  const { t, fr } = useI18n();
  if (!product) {
    return (
      <Page narrow>
        <ScreenHeader title={t('navShop')} />
        <JCard><p className="t-body-l">{fr ? 'Ce produit est introuvable.' : 'This product could not be found.'}</p></JCard>
      </Page>
    );
  }
  return <ProductView key={product.id} product={product} />;
}

function ProductView({ product }: { product: Product }) {
  const { t, b, lang } = useI18n();
  const back = useBack();
  const desktop = useDesktop();
  const addToCart = useStore((s) => s.addToCart);
  const requestFromSales = useStore((s) => s.requestFromSales);
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(product.addOns.filter((a) => a.selectedByDefault).map((a) => a.id)),
  );
  const [saved, setSaved] = useState(false);
  const onQuote = product.price === 0;

  const total = product.price + product.addOns.filter((a) => selected.has(a.id)).reduce((n, a) => n + a.price, 0);

  const addOnTitle = (a: AddOn) => {
    const title = b(a.title);
    return a.fittingDate ? title.replace('{date}', dayMonth(lang, a.fittingDate)) : title;
  };

  const toggle = (id: string, on: boolean) =>
    setSelected((s) => {
      const next = new Set(s);
      if (on) next.add(id); else next.delete(id);
      return next;
    });

  const addAll = () => {
    addToCart({ id: product.id, title: product.name, unitPrice: product.price, quantity: 1 });
    for (const a of product.addOns.filter((x) => selected.has(x.id))) {
      addToCart({ id: `${product.id}/${a.id}`, title: same(addOnTitle(a)), unitPrice: a.price, quantity: 1 });
    }
    showToast(t('addedToCart'), b(product.name));
  };

  const requestQuote = () => {
    requestFromSales(bi(`Quote: ${product.name.en}`, `Devis : ${product.name.fr}`));
    showToast(t('requestSavedTitle'), t('requestSavedBody', { item: b(product.name) }));
  };

  const action = (
    <Button block={desktop} onClick={onQuote ? requestQuote : addAll}>{onQuote ? t('getQuote') : t('addToCart')}</Button>
  );

  const details = CATALOGUE.find((c) => c.id === product.id)?.details;
  const info = details && (
    <>
      <JCard>
        <p className="t-body-l" style={{ margin: 0 }}>{b(details.description)}</p>
        {details.uses && details.uses.length > 0 && (
          <>
            <h2 className="t-title-s prod-h">{t('productUses')}</h2>
            <div className="pill-wrap" style={{ gap: 8 }}>
              {details.uses.map((u, i) => <StatusPill key={i} label={b(u)} tone="lime" />)}
            </div>
          </>
        )}
        {details.features && details.features.length > 0 && (
          <>
            <h2 className="t-title-s prod-h">{t('productFeatures')}</h2>
            <ul className="prod-features">{details.features.map((f, i) => <li key={i}>{b(f)}</li>)}</ul>
          </>
        )}
      </JCard>
      {details.specs && details.specs.length > 0 && (
        <JCard>
          <h2 className="t-title-s" style={{ margin: '0 0 6px' }}>{t('productSpecs')}</h2>
          <dl className="prod-specs">
            {details.specs.map(([k, v], i) => (
              <div key={i}><dt>{b(k)}</dt><dd>{lang === 'fr' ? v.replace(/(\d)\.(\d)/g, '$1,$2') : v}</dd></div>
            ))}
          </dl>
        </JCard>
      )}
      <p className="t-body-s muted" style={{ margin: '0 4px' }}>
        {t('cataloguePage', { category: b(categoryById(details.category).name), page: details.page })}
      </p>
    </>
  );

  const hero = (
    <div className="prod-hero">
      <div className="halo">
        <PhotoCircle src={product.photo} size={desktop ? 260 : 220} ring={6} alt={b(product.name)} />
      </div>
      {product.fitNote && <StatusPill label={b(product.fitNote)} tone={product.highlightFit ? 'lime' : 'blue'} />}
      <h1 className="name">{b(product.name)}</h1>
      <p className="price-l">{onQuote ? t('priceOnQuote') : `${formatAmount(product.price)} FCFA`}</p>
    </div>
  );

  const addOns = product.addOns.length > 0 && (
    <JCard style={{ paddingTop: 4, paddingBottom: 4 }}>
      <Divided>
        {product.addOns.map((a) => (
          <label key={a.id} className="prod-addon">
            <TintIcon icon={a.icon} tone={a.tone} size={52} />
            <span className="grow">
              <span className="t-title-s" style={{ display: 'block' }}>{addOnTitle(a)}</span>
              <span className="t-body-m" style={{ display: 'block' }}>+{formatAmount(a.price)} FCFA</span>
            </span>
            <input type="checkbox" checked={selected.has(a.id)} onChange={(e) => toggle(a.id, e.target.checked)} />
          </label>
        ))}
      </Divided>
    </JCard>
  );

  const header = (
    <div className="screen-header">
      <CircleButton icon="chevron_left" label={t('back')} onClick={back} />
      <span className="grow" />
      <CircleButton icon={saved ? 'favorite' : 'favorite_border'} color="var(--magenta)" label={t('saveForLater')}
        onClick={() => setSaved((v) => !v)} />
    </div>
  );

  if (desktop) {
    return (
      <Page>
        {header}
        <div className="split">
          <div className="stack">
            <JCard>{hero}</JCard>
            {info}
          </div>
          <aside className="sticky-side stack">
            {addOns}
            <JCard>
              {!onQuote && (
                <div className="prod-total-row" style={{ marginBottom: 16 }}>
                  <span className="t-body-l">{t('total')}</span>
                  <span className="t-title-l">{formatAmount(total)} FCFA</span>
                </div>
              )}
              {onQuote && <p className="t-body-m" style={{ margin: '0 0 14px' }}>{t('quoteHelp')}</p>}
              {action}
            </JCard>
          </aside>
        </div>
      </Page>
    );
  }

  return (
    <Page narrow>
      {header}
      <div className="stack">
        {hero}
        {addOns}
        {info}
      </div>
      <BottomActionBar>
        {!onQuote && (
          <div className="prod-total-col">
            <span className="t-body-s">{t('total')}</span>
            <span className="v">{formatAmount(total)} F</span>
          </div>
        )}
        {action}
      </BottomActionBar>
    </Page>
  );
}

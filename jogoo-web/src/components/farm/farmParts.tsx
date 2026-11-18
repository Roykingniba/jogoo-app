// Pieces shared by the My farm screens and the offline library.
import type { EquipmentHealth, FarmDocument, Tone } from '../../data/models';
import { useEquipmentById } from '../../data/store';
import { useI18n } from '../../i18n/i18n';
import { downloadFarmDocument, previewFarmDocument } from '../../utils/pdfActions';
import type { IconName } from '../Icon';
import { CircleButton, JCard, Page, ScreenHeader, StatusPill, TintIcon } from '../ui';
import '../../styles/farm.css';

/** Good / Open / Due soon, shared by My farm and the equipment detail. */
export function HealthPill({ health }: { health?: EquipmentHealth }) {
  const { t } = useI18n();
  switch (health) {
    case undefined: return null;
    case 'good': return <StatusPill label={t('statusGood')} tone="lime" />;
    case 'open': return <StatusPill label={t('statusOpen')} tone="pink" />;
    case 'dueSoon': return <StatusPill label={t('statusDueSoon')} tone="orange" />;
  }
}

const docLook: Record<FarmDocument['type'], [IconName, Tone]> = {
  plan: ['map_outlined', 'blue'],
  electrical: ['bolt_outlined', 'orange'],
  warranty: ['verified_user_outlined', 'cyan'],
  specification: ['description_outlined', 'pink'],
  manual: ['menu_book_outlined', 'cyan'],
};

/** One file with its demo-PDF note: tap to preview, button to download. */
export function DocumentRow({ doc }: { doc: FarmDocument }) {
  const { t, b, lang, fr } = useI18n();
  const [icon, tone] = docLook[doc.type];
  const equipment = useEquipmentById(doc.equipmentId);
  return (
    <div className="list-row farm-docrow">
      <button type="button" className="farm-docrow-main" disabled={!equipment}
        onClick={() => equipment && previewFarmDocument(lang, doc, equipment)}>
        <TintIcon icon={icon} tone={tone} size={52} />
        <span className="txt">
          <span className="t-title-s" style={{ display: 'block' }}>{b(doc.title)}</span>
          <span className="t-body-m" style={{ display: 'block', marginTop: 2 }}>{t('generatedDemoPdf')}</span>
        </span>
      </button>
      <CircleButton icon="download_outlined" label={`${t('download')}${fr ? ' : ' : ': '}${b(doc.title)}`} outlined color="var(--navy)" size={44}
        disabled={!equipment} onClick={() => equipment && downloadFarmDocument(lang, doc, equipment)} />
    </div>
  );
}

/** Shown when a route id does not match any demo record. */
export function NotFound({ narrow = true }: { narrow?: boolean }) {
  const { t } = useI18n();
  return (
    <Page narrow={narrow}>
      <ScreenHeader title={t('notFoundTitle')} />
      <JCard><p className="t-body-l">{t('notFoundBody')}</p></JCard>
    </Page>
  );
}

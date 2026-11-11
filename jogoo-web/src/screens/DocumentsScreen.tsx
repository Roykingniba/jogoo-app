// Screen 16: the as-built project vault, offline.
// Ported from lib/screens/documents_screen.dart.
import { useState } from 'react';
import { ChoicePill, Divided, JCard, ListRow, Page, PillRow, ScreenHeader, Stack, TintIcon } from '../components/ui';
import { Icon } from '../components/Icon';
import { DocumentRow } from '../components/farm/farmParts';
import type { Equipment, FarmDocument } from '../data/models';
import { documents, equipmentList } from '../data/store';
import { useI18n } from '../i18n/i18n';
import '../styles/farm.css';

type Filter = 'all' | 'plans' | 'electrical' | 'warranty';

const matches = (filter: Filter, doc: FarmDocument) => {
  switch (filter) {
    case 'all': return true;
    case 'plans': return doc.type === 'plan';
    case 'electrical': return doc.type === 'electrical';
    case 'warranty': return doc.type === 'warranty';
  }
};

export default function DocumentsScreen() {
  const { t } = useI18n();
  const [filter, setFilter] = useState<Filter>('all');
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(equipmentList[0] ? [equipmentList[0].id] : []));
  // Manuals live in the offline library; this vault is the project file.
  const docs = documents.filter((d) => d.type !== 'manual' && matches(filter, d));

  const toggle = (id: string) => setExpanded((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  const filters: [Filter, string][] = [
    ['all', t('filterAll')],
    ['plans', t('filterPlans')],
    ['electrical', t('filterElectrical')],
    ['warranty', t('filterWarranty')],
  ];

  return (
    <Page>
      <ScreenHeader title={t('myDocuments')} subtitle={t('documentsSubtitle')} />
      <Stack>
        <div className="farm-tabs">
          <PillRow>
            {filters.map(([key, label]) => (
              <ChoicePill key={key} label={label} selected={filter === key} onClick={() => setFilter(key)} />
            ))}
          </PillRow>
        </div>
        {docs.length === 0 ? (
          <JCard><p className="t-body-l">{t('noDocuments')}</p></JCard>
        ) : (
          <div className="grid g2 farm-groups">
            {equipmentList.map((item) => {
              const own = docs.filter((d) => d.equipmentId === item.id);
              if (own.length === 0) return null;
              return (
                <EquipmentDocs key={item.id} equipment={item} docs={own}
                  expanded={expanded.has(item.id)} onToggle={() => toggle(item.id)} />
              );
            })}
          </div>
        )}
      </Stack>
    </Page>
  );
}

function EquipmentDocs({ equipment, docs, expanded, onToggle }: {
  equipment: Equipment; docs: FarmDocument[]; expanded: boolean; onToggle: () => void;
}) {
  const { t, b } = useI18n();
  if (!expanded) {
    return (
      <JCard style={{ padding: '4px 16px' }}>
        <ListRow leading={<TintIcon icon={equipment.icon} tone={equipment.tone} size={52} />}
          title={b(equipment.name)} subtitle={t('documentsCount', { count: docs.length })}
          trailing={<Icon name="chevron_right" />} onClick={onToggle} />
      </JCard>
    );
  }
  return (
    <JCard style={{ padding: '16px 16px 4px' }}>
      <button type="button" className="farm-expand-head" aria-expanded onClick={onToggle}>
        <h2 className="t-title-m grow">{b(equipment.name)}</h2>
        <Icon name="expand_less" />
      </button>
      <Divided>
        {docs.map((doc) => <DocumentRow key={doc.id} doc={doc} />)}
      </Divided>
    </JCard>
  );
}

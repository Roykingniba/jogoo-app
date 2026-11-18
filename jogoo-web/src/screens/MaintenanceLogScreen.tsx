// Screen 17: a shared logbook between client and JOGOO.
// Ported from lib/screens/maintenance_log_screen.dart.
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Divided, JCard, Page, ScreenHeader, Stack, StatusPill } from '../components/ui';
import { Icon } from '../components/Icon';
import DateBadge from '../components/farm/DateBadge';
import { NotFound } from '../components/farm/farmParts';
import type { Equipment, LogEntry, Tone } from '../data/models';
import { logFor, useEquipmentById, useStore } from '../data/store';
import { useI18n } from '../i18n/i18n';
import { shareMaintenanceLog } from '../utils/pdfActions';
import { paths } from '../routes';
import '../styles/farm.css';

export default function MaintenanceLogScreen() {
  const { equipmentId = '' } = useParams();
  const equipment = useEquipmentById(equipmentId);
  if (!equipment) return <NotFound />;
  return <LogView equipment={equipment} />;
}

function LogView({ equipment }: { equipment: Equipment }) {
  const { t, b, lang } = useI18n();
  const navigate = useNavigate();
  const log = useStore((s) => s.log);
  const entries = logFor(log, equipment.id);
  const pending = entries.filter((e) => !e.synced).length;
  const newEntry = () => navigate(paths.newLogEntry(equipment.id));

  return (
    <Page narrow>
      <ScreenHeader title={t('maintenanceLog')} subtitle={b(equipment.name)}
        trailing={<span className="farm-wide-only"><Button icon="add" onClick={newEntry}>{t('newEntry')}</Button></span>} />
      <Stack>
        {pending > 0 && (
          <div className="farm-pending" role="status">
            <span className="dot"><Icon name="error_outline" size={20} /></span>
            <span className="grow">{t('pendingSync', { count: pending })}</span>
          </div>
        )}
        {entries.length === 0 ? (
          <JCard><p className="t-body-l">{t('emptyLog')}</p></JCard>
        ) : (
          <JCard style={{ padding: '4px 16px' }}>
            <Divided>
              {entries.map((entry) => <EntryRow key={entry.id} entry={entry} />)}
            </Divided>
          </JCard>
        )}
        <div>
          <Button variant="outlined" icon="download_outlined" onClick={() => shareMaintenanceLog(lang, equipment, entries)}>
            {t('exportPdf')}
          </Button>
        </div>
      </Stack>
      <div className="farm-fab-space farm-phone-only" />
      <button type="button" className="farm-fab farm-phone-only" aria-label={t('newEntry')} title={t('newEntry')} onClick={newEntry}>
        <Icon name="add" size={36} />
      </button>
    </Page>
  );
}

const toneFor: Record<LogEntry['type'], Tone> = { fertigation: 'pink', partReplaced: 'blue', service: 'lime' };

function EntryRow({ entry }: { entry: LogEntry }) {
  const { t, b } = useI18n();
  return (
    <div className="farm-entry">
      <DateBadge date={entry.date} tone={toneFor[entry.type]} />
      <div className="grow">
        <div className="t-title-s">{b(entry.title)}</div>
        <div className="t-body-m" style={{ marginTop: 2 }}>{t('loggedBy', { name: entry.loggedBy })}</div>
        <div style={{ marginTop: 8 }}>
          {entry.synced
            ? <StatusPill label={t('synced')} tone="lime" />
            : <StatusPill label={t('waitingToSync')} tone="orange" />}
        </div>
      </div>
    </div>
  );
}

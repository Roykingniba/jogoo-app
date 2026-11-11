// Screen 20: manuals and illustrated guides that work without internet.
// Ported from lib/screens/offline_library_screen.dart.
import { useNavigate } from 'react-router-dom';
import { Divided, JCard, ListRow, Page, PhotoCircle, ScreenHeader, Switch, TintIcon } from '../components/ui';
import { Icon } from '../components/Icon';
import { DocumentRow } from '../components/farm/farmParts';
import { documents, guides, useStore } from '../data/store';
import { useI18n } from '../i18n/i18n';
import { paths } from '../routes';
import '../styles/farm.css';

export default function OfflineLibraryScreen() {
  const { t, b } = useI18n();
  const navigate = useNavigate();
  const wifiOnly = useStore((s) => s.wifiOnly);
  const setWifiOnly = useStore((s) => s.setWifiOnly);

  const manuals = documents.filter((d) => d.type === 'manual');
  const videos = guides.filter((g) => g.kind === 'video');
  const savedGuides = guides.filter((g) => g.kind !== 'video' && g.savedOffline).length
    + manuals.filter((m) => m.savedOffline).length;
  const savedVideos = videos.filter((v) => v.savedOffline).length;

  return (
    <Page>
      <ScreenHeader title={t('offlineLibrary')} subtitle={t('librarySubtitle')} />
      <div className="farm-lib">
        <JCard className="farm-lib-sum">
          <div className="row" style={{ gap: 16 }}>
            <TintIcon icon="check" tone="lime" size={64} />
            <div className="grow">
              <div className="t-title-s">
                {t('savedSummary', {
                  guides: t('guidesCount', { count: savedGuides }),
                  videos: t('videosCount', { count: savedVideos }),
                })}
              </div>
              <p className="t-body-m">{t('worksOffline')}</p>
            </div>
          </div>
        </JCard>
        <JCard className="farm-lib-man" style={{ padding: '18px 16px 4px' }}>
          <h2 className="t-title-m">{t('userManuals')}</h2>
          <Divided>
            {manuals.map((m) => <DocumentRow key={m.id} doc={m} />)}
          </Divided>
        </JCard>
        <JCard className="farm-lib-gui" style={{ padding: '18px 16px 4px' }}>
          <h2 className="t-title-m">{t('illustratedGuides')}</h2>
          <Divided>
            {videos.map((video) => (
              <ListRow key={video.id}
                leading={video.photo
                  ? <PhotoCircle src={video.photo} size={52} />
                  : <TintIcon icon={video.icon} tone={video.tone} size={52} />}
                title={b(video.title)}
                subtitle={t('illustratedMinutes', { minutes: video.minutes })}
                trailing={
                  <span className="tint-icon tone-lime" style={{ width: 44, height: 44 }}>
                    <Icon name="check" />
                  </span>
                }
                onClick={() => navigate(paths.guide(video.id))} />
            ))}
          </Divided>
        </JCard>
        <JCard className="farm-lib-wifi" style={{ padding: '6px 20px', display: 'flex', alignItems: 'center' }}>
          <label className="row grow" style={{ gap: 16, padding: '10px 0', cursor: 'pointer' }}>
            <div className="grow">
              <div className="t-title-s">{t('wifiOnly')}</div>
              <p className="t-body-m">{t('wifiOnlyHelp')}</p>
            </div>
            <Switch checked={wifiOnly} onChange={setWifiOnly} label={t('wifiOnly')} />
          </label>
        </JCard>
      </div>
    </Page>
  );
}

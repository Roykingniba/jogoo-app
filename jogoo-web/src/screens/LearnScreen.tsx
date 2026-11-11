// Port of lib/screens/learn_screen.dart (screen 07): knowledge base written by JOGOO agronomists.
import { useId, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Divided, JCard, ListRow, Page, PageTitle, PhotoCircle, SearchBox, TintIcon } from '../components/ui';
import { Icon } from '../components/Icon';
import { DemoData } from '../data/demoData';
import { guides as allGuides } from '../data/store';
import type { Guide } from '../data/models';
import { useI18n } from '../i18n/i18n';
import { paths } from '../routes';
import '../styles/learn.css';

export default function LearnScreen() {
  const { t, b } = useI18n();
  const navigate = useNavigate();
  const [rawQuery, setQuery] = useState('');
  const libId = useId();
  const query = rawQuery.trim().toLowerCase();

  const guides = allGuides.filter(
    (g) => query === '' || g.title.en.toLowerCase().includes(query) || g.title.fr.toLowerCase().includes(query),
  );
  const videos = guides.filter((g) => g.kind === 'video').slice(0, 2);
  const reading = guides.filter((g) => g.kind !== 'video');

  return (
    <Page>
      <PageTitle title={t('navLearn')} subtitle={t('learnSubtitle')} />
      <div className="learn-layout">
        <div className="learn-main">
          <SearchBox hint={t('searchGuides')} value={rawQuery} onChange={setQuery} />
          {query === '' && <div className="learn-phone-only"><SeasonAlert /></div>}
          {videos.length > 0 && (
            <div className="learn-videos">
              {videos.map((v) => <VideoCard key={v.id} guide={v} />)}
            </div>
          )}
          {reading.length > 0 && (
            <JCard className="learn-reading">
              <Divided>
                {reading.map((g) => (
                  <ListRow
                    key={g.id}
                    leading={<TintIcon icon={g.icon} tone={g.tone} size={52} />}
                    title={b(g.title)}
                    subtitle={t('readMinutes', { minutes: g.minutes })}
                    onClick={() => navigate(paths.guide(g.id))}
                  />
                ))}
              </Divided>
            </JCard>
          )}
          {guides.length === 0 && <JCard><p className="t-body-l">{t('noGuides')}</p></JCard>}
        </div>
        <aside className="learn-side">
          {query === '' && <div className="learn-desk-only"><SeasonAlert /></div>}
          <JCard className="learn-offline" onClick={() => navigate(paths.offlineLibrary)}
            labelledBy={libId} describedBy={`${libId}-d`}>
            <ListRow
              leading={<TintIcon icon="download_done" tone="lime" size={52} />}
              title={<span id={libId}>{t('offlineLibrary')}</span>}
              subtitle={<span id={`${libId}-d`}>{t('librarySubtitle')}</span>}
              trailing={<span className="chev"><Icon name="chevron_right" /></span>}
            />
          </JCard>
        </aside>
      </div>
    </Page>
  );
}

function SeasonAlert() {
  const { b } = useI18n();
  const alert = DemoData.seasonAlert;
  return (
    <section className="learn-alert" aria-label={b(alert.title)}>
      <span className="mark"><Icon name="thunderstorm_outlined" /></span>
      <div className="grow">
        <h2 className="t-title-s">{b(alert.title)}</h2>
        <p className="body">{b(alert.body)}</p>
      </div>
    </section>
  );
}

function VideoCard({ guide }: { guide: Guide }) {
  const { t, b } = useI18n();
  const navigate = useNavigate();
  return (
    <JCard className="learn-video" onClick={() => navigate(paths.guide(guide.id))}>
      <span className="photo">
        {guide.photo
          ? <PhotoCircle src={guide.photo} size={104} />
          : <TintIcon icon={guide.icon} tone={guide.tone} size={104} />}
        <span className="play" aria-hidden="true"><Icon name="play_arrow_rounded" size={22} /></span>
      </span>
      <h3 className="t-title-s">{b(guide.title)}</h3>
      <p className="t-body-m">{t('videoMinutes', { minutes: guide.minutes })}</p>
    </JCard>
  );
}

// Port of lib/screens/guide_screen.dart: reader for one guide, crop sheet or video summary.
import { useNavigate, useParams } from 'react-router-dom';
import { Button, CircleButton, JCard, Page, PhotoCircle, ScreenHeader, Stack, StatusPill, TintIcon } from '../components/ui';
import { guideById } from '../data/store';
import { useI18n } from '../i18n/i18n';
import { paths } from '../routes';
import '../styles/learn.css';

export default function GuideScreen() {
  const { id = '' } = useParams();
  const { t, b } = useI18n();
  const navigate = useNavigate();
  const guide = guideById(id);

  if (!guide) {
    return (
      <Page narrow>
        <ScreenHeader title={t('notFoundTitle')} />
        <JCard><p className="t-body-l">{t('notFoundBody')}</p></JCard>
      </Page>
    );
  }

  const isVideo = guide.kind === 'video';
  return (
    <Page narrow>
      <ScreenHeader
        title={b(guide.title)}
        subtitle={isVideo ? t('illustratedMinutes', { minutes: guide.minutes }) : t('readMinutes', { minutes: guide.minutes })}
      />
      <article className="learn-reader">
        <Stack>
          <div className="learn-hero">
            {guide.photo ? (
              <>
                <PhotoCircle src={guide.photo} size={200} ring={6} alt={b(guide.title)} />
                {isVideo && (
                  <CircleButton
                    icon="play_arrow_rounded"
                    label={t('playVideo')}
                    color="#fff"
                    background="var(--navy)"
                    size={64}
                    onClick={() => navigate(paths.walkthrough(guide.id))}
                  />
                )}
              </>
            ) : (
              <TintIcon icon={guide.icon} tone={guide.tone} size={96} />
            )}
          </div>
          <JCard>
            {guide.savedOffline && (
              <div style={{ marginBottom: 12 }}><StatusPill label={t('savedOffline')} tone="lime" /></div>
            )}
            <p className="t-body-l learn-article">{b(guide.body)}</p>
          </JCard>
          <Button variant="outlined" icon="chat_bubble_outline" className="ask" onClick={() => navigate(paths.mia)}>
            {t('askMiaAboutThis')}
          </Button>
        </Stack>
      </article>
    </Page>
  );
}

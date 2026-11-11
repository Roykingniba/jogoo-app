// Port of lib/screens/walkthrough_screen.dart: illustrated, offline step-by-step "video".
// Each sentence of the guide body is one step; playing advances one step every 6 seconds.
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { JCard, Page, ScreenHeader, asset } from '../components/ui';
import { Icon } from '../components/Icon';
import { guideById } from '../data/store';
import { useI18n } from '../i18n/i18n';
import '../styles/learn.css';

const STEP_DURATION_MS = 6000;

export default function WalkthroughScreen() {
  const { id = '' } = useParams();
  const { t, b } = useI18n();
  const guide = guideById(id);

  if (!guide) {
    return (
      <Page narrow>
        <ScreenHeader title={t('notFoundTitle')} />
        <JCard><p className="t-body-l">{t('notFoundBody')}</p></JCard>
      </Page>
    );
  }

  const steps = b(guide.body)
    .split(/(?<=[.!?])\s+/)
    .filter((s) => s.trim() !== '');

  return (
    <Page narrow>
      <ScreenHeader title={b(guide.title)} subtitle={t('illustratedWalkthrough')} />
      {/* Remount per guide so the player starts again at step 1. */}
      <Player key={guide.id} steps={steps} photo={guide.photo} photoAlt={b(guide.title)} />
    </Page>
  );
}

function Player({ steps, photo, photoAlt }: { steps: string[]; photo?: string; photoAlt: string }) {
  const { t } = useI18n();
  const stepCount = Math.max(steps.length, 1);
  const [rawIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  // The language can change while the player is open, and the step count with it.
  const stepIndex = Math.min(rawIndex, stepCount - 1);

  const indexRef = useRef(stepIndex);
  const countRef = useRef(stepCount);
  useEffect(() => {
    indexRef.current = stepIndex;
    countRef.current = stepCount;
  });

  // Timer.periodic(6s): advance one step per tick, stop playing after the last one.
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      if (indexRef.current + 1 >= countRef.current) {
        setPlaying(false);
      } else {
        indexRef.current += 1;
        setStepIndex(indexRef.current);
      }
    }, STEP_DURATION_MS);
    return () => window.clearInterval(timer);
  }, [playing]);

  const moveToStep = (index: number) => {
    setStepIndex(Math.min(Math.max(index, 0), stepCount - 1));
    setPlaying(false);
  };

  const progress = ((stepIndex + 1) / stepCount) * 100;

  return (
    <div className="learn-player">
      <JCard>
        {photo && (
          <div className="learn-frame">
            <img src={asset(photo)} alt={photoAlt} />
          </div>
        )}
        <p className="learn-step-label">{t('walkthroughStep', { current: stepIndex + 1, total: stepCount })}</p>
        <p key={stepIndex} className="t-body-l learn-step-text" aria-live="polite">{steps[stepIndex] ?? ''}</p>
        <div
          className="learn-progress"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={stepCount}
          aria-valuenow={stepIndex + 1}
          aria-label={t('walkthroughStep', { current: stepIndex + 1, total: stepCount })}
        >
          <span style={{ width: `${progress}%` }} />
        </div>
        <p className="t-body-s learn-note">{t('walkthroughOfflineNote')}</p>
      </JCard>
      <div className="learn-controls">
        <button
          type="button"
          className="learn-ctrl"
          aria-label={t('previousStep')}
          title={t('previousStep')}
          disabled={stepIndex === 0}
          onClick={() => moveToStep(stepIndex - 1)}
        >
          <Icon name="skip_previous_rounded" size={36} />
        </button>
        <button
          type="button"
          className="learn-ctrl learn-ctrl-main"
          aria-label={playing ? t('pauseWalkthrough') : t('playVideo')}
          title={playing ? t('pauseWalkthrough') : t('playVideo')}
          onClick={() => setPlaying(!playing)}
        >
          <Icon name={playing ? 'pause_rounded' : 'play_arrow_rounded'} size={32} />
        </button>
        <button
          type="button"
          className="learn-ctrl"
          aria-label={t('nextStep')}
          title={t('nextStep')}
          disabled={stepIndex === stepCount - 1}
          onClick={() => moveToStep(stepIndex + 1)}
        >
          <Icon name="skip_next_rounded" size={36} />
        </button>
      </div>
    </div>
  );
}

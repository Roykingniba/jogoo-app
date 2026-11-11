// Screen 14: a field ticket with photos and video.
// Ported from lib/screens/report_problem_screen.dart.
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  BottomActionBar, Button, ChoicePill, CircleButton, JCard, Page, PhotoCircle, PillRow, ScreenHeader, TintIcon,
} from '../components/ui';
import { Icon } from '../components/Icon';
import { showToast } from '../components/overlays';
import { useMediaPicker } from '../components/service/ServiceSheets';
import { NotSentNote } from '../components/service/ContactJogoo';
import { useI18n } from '../i18n/i18n';
import { equipmentById, equipmentList, useStore } from '../data/store';
import { bi, type Bi } from '../data/models';
import { paths } from '../routes';
import { callJogoo, openWhatsApp } from '../utils/actions';
import '../styles/service.css';

type Problem = 'leak' | 'lowPressure' | 'brokenPart' | 'leafSymptoms';
const problems: Record<Problem, Bi> = {
  leak: bi('Leak', 'Fuite'),
  lowPressure: bi('Low pressure', 'Pression faible'),
  brokenPart: bi('Broken part', 'Pièce cassée'),
  leafSymptoms: bi('Leaf symptoms', 'Symptômes sur feuilles'),
};

interface Media { url: string; video: boolean; name: string }

export default function ReportProblemScreen() {
  const { t, b } = useI18n();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const reportProblem = useStore((s) => s.reportProblem);
  const preselected = params.get('equipment');
  const [equipmentId, setEquipmentId] = useState<string | null>(
    preselected && equipmentById(preselected) ? preselected : null,
  );
  const [problem, setProblem] = useState<Problem | null>(null);
  const [description, setDescription] = useState('');
  const [media, setMedia] = useState<Media[]>([]);
  const picker = useMediaPicker();

  const addMedia = async (video: boolean) => {
    const picked = await picker.pick(video);
    if (picked) setMedia((m) => [...m, { url: picked.url, video, name: picked.file.name }]);
  };

  const send = () => {
    if (!equipmentId || !problem) {
      showToast(t('pickProblemFirst'), undefined, 'error');
      return;
    }
    const equipment = equipmentById(equipmentId);
    const request = reportProblem({
      equipmentId,
      problem: problems[problem],
      description: description.trim(),
      mediaPaths: media.map((m) => m.url),
    });
    // The app cannot deliver the report: keep it on this screen and hand it to WhatsApp.
    const text = [
      t('waProblem', { equipment: equipment ? `${b(equipment.name)} (${equipment.serial})` : equipmentId, problem: b(problems[problem]) }),
      ...(description.trim() !== '' ? [t('waProblemDetails', { details: description.trim() })] : []),
    ].join('\n');
    openWhatsApp(text);
    showToast(t('reportSavedTitle', { id: request.id }), t('reportSavedBody'));
    navigate(paths.serviceRequest(request.id), { replace: true });
  };

  return (
    <Page narrow>
      <ScreenHeader title={t('reportProblem')} subtitle={t('serviceHours')} />
      <div className="stack">
        <JCard>
          <h2 className="t-title-m" style={{ margin: '0 0 12px' }}>{t('whichEquipment')}</h2>
          <PillRow wrap>
            {equipmentList.map((item) => (
              <ChoicePill key={item.id} label={b(item.shortName)} selected={equipmentId === item.id} onClick={() => setEquipmentId(item.id)} />
            ))}
          </PillRow>
          <h2 className="t-title-m" style={{ margin: '20px 0 12px' }}>{t('whatIsWrong')}</h2>
          <PillRow wrap>
            {(Object.keys(problems) as Problem[]).map((p) => (
              <ChoicePill key={p} label={b(problems[p])} selected={problem === p} selectedColor="var(--magenta)" onClick={() => setProblem(p)} />
            ))}
          </PillRow>
        </JCard>

        <div className="service-report-grid">
          <JCard>
            <label className="field">
              <span className="lbl">{t('describeProblem')}</span>
              <textarea className="textarea" rows={4} placeholder={t('describeProblemHint')} value={description}
                autoCapitalize="sentences" onChange={(e) => setDescription(e.target.value)} />
            </label>
          </JCard>

          <JCard>
            <h2 className="t-title-m" style={{ margin: '0 0 12px' }}>{t('photosAndVideos')}</h2>
            <div className="service-media">
              {media.map((m) => (
                <div className="item" key={m.url}>
                  {m.video
                    ? <span title={m.name}><TintIcon icon="play_arrow_rounded" tone="blue" size={76} /></span>
                    : <PhotoCircle src={m.url} size={76} alt={m.name} />}
                  <span className="rm">
                    <CircleButton icon="close" label={t('remove')} size={30} background="var(--ink)" color="#fff"
                      onClick={() => setMedia((all) => all.filter((x) => x !== m))} />
                  </span>
                </div>
              ))}
              <button type="button" className="service-add-media" aria-label={t('takePhoto')} title={t('takePhoto')} onClick={() => void addMedia(false)}>
                <Icon name="photo_camera_outlined" />
              </button>
              <button type="button" className="service-add-media" aria-label={t('recordVideo')} title={t('recordVideo')} onClick={() => void addMedia(true)}>
                <Icon name="videocam_outlined" />
              </button>
            </div>
          </JCard>
        </div>
      </div>

      <div style={{ marginTop: 16 }}><NotSentNote extra={t('photosOnWhatsApp')} /></div>

      <BottomActionBar>
        <Button variant="outlined" icon="call_outlined" onClick={callJogoo}>{t('callJogoo')}</Button>
        <Button variant="wa" icon="chat_bubble_outline" onClick={send}>{t('sendRequest')}</Button>
      </BottomActionBar>
      {picker.sheet}
    </Page>
  );
}

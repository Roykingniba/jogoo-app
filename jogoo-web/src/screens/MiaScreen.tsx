// Screen 06: the website chatbot, now in the app, with photos and handover.
// Ported from lib/screens/mia_screen.dart.
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, CircleButton, Page, ScreenHeader, TintIcon, asset } from '../components/ui';
import { Icon } from '../components/Icon';
import { ChatBubble, ChatInputBar, ChatList } from '../components/service/Chat';
import { useI18n } from '../i18n/i18n';
import { guideById, useStore } from '../data/store';
import { DemoData } from '../data/demoData';
import { same } from '../data/models';
import { callJogoo, openWhatsApp } from '../utils/actions';
import { paths } from '../routes';
import '../styles/service.css';

export default function MiaScreen() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const chat = useStore((s) => s.miaChat);
  const firstName = useStore((s) => s.profile.firstName);
  const busy = useStore((s) => s.miaBusy);
  const sendToMia = useStore((s) => s.sendToMia);
  const [input, setInput] = useState('');
  const [unavailable, setUnavailable] = useState(false);

  const loadMiaHistory = useStore((s) => s.loadMiaHistory);
  useEffect(() => { void loadMiaHistory(); }, [loadMiaHistory]);

  const send = async () => {
    const text = input.trim();
    if (text === '') return;
    setInput('');
    const reached = await sendToMia({ text });
    setUnavailable(!reached);
  };

  return (
    <Page narrow className="service-chat-page">
      <ScreenHeader
        title="Mia"
        subtitle={t('miaSubtitle')}
        leading={<MiaAvatar />}
        trailing={<CircleButton icon="call_outlined" label={t('callJogoo')} color="var(--navy)" onClick={callJogoo} />}
      />

      <ChatList scrollKey={`${chat.length}-${busy}-${unavailable}`}>
        {chat.length === 0 && <ChatBubble message={{ author: 'mia', text: same(t('miaWelcome', { name: firstName })) }} />}
        {chat.map((message, i) => (
          <ChatBubble key={i} message={message}
            footer={message.guideId ? <GuideLink guideId={message.guideId} /> : undefined} />
        ))}
        {busy && (
          <div className="service-typing" role="status">
            <span className="typing" aria-hidden="true"><i /><i /><i /></span>
            <span>{t('miaTyping')}</span>
          </div>
        )}
        {unavailable && !busy && <UnavailableCard />}
        <div className="service-handover">
          <Button variant="outlined" onClick={() => navigate(paths.agronomist)}>{t('bookAgronomist')}</Button>
          <Button variant="outlined" onClick={() => openWhatsApp()}>{t('talkToPerson')}</Button>
        </div>
      </ChatList>

      <ChatInputBar
        value={input}
        onChange={setInput}
        hint={t('messageMia')}
        onSend={() => void send()}
        disabled={busy}
        below={<button type="button" onClick={callJogoo}>{t('urgentCall', { phone: DemoData.jogooPhoneDisplay })}</button>}
      />
    </Page>
  );
}

function MiaAvatar() {
  return (
    <span className="service-mia-avatar" aria-hidden="true">
      <span className="disc"><img src={asset('images/jogoo_mark.png')} alt="" /></span>
      <span className="dot" />
    </span>
  );
}

function GuideLink({ guideId }: { guideId: string }) {
  const { t, b } = useI18n();
  const navigate = useNavigate();
  const guide = guideById(guideId);
  if (!guide) return null;
  return (
    <button type="button" className="service-guide-link" onClick={() => navigate(paths.guide(guideId))}>
      <TintIcon icon="menu_book_outlined" tone="orange" size={40} />
      <span className="t-title-s">{t('readGuide', { title: b(guide.title) })}</span>
    </button>
  );
}

/** Mia could not be reached (offline or server down): hand the farmer to a person instead. */
function UnavailableCard() {
  const { t } = useI18n();
  return (
    <div className="service-fallback" role="alert">
      <span className="ico"><Icon name="call_outlined" /></span>
      <div className="grow">
        <p>{t('miaUnavailable')}</p>
        <div className="acts">
          <Button icon="call_outlined" onClick={callJogoo}>{t('call')}</Button>
          <Button variant="wa" icon="chat_bubble_outline" onClick={() => openWhatsApp()}>WhatsApp</Button>
        </div>
      </div>
    </div>
  );
}

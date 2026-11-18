// Screen 15: advice from the JOGOO engineering team.
// Ported from lib/screens/agronomist_screen.dart.
import { useState } from 'react';
import { Button, Page, ScreenHeader } from '../components/ui';
import { Icon } from '../components/Icon';
import { showToast } from '../components/overlays';
import { ChatBubble, ChatInputBar, ChatList } from '../components/service/Chat';
import { ContactJogooSheet } from '../components/service/ContactJogoo';
import { useI18n } from '../i18n/i18n';
import { useStore } from '../data/store';
import { bi } from '../data/models';
import { openWhatsApp } from '../utils/actions';
import '../styles/service.css';

export default function AgronomistScreen() {
  const { t } = useI18n();
  const chat = useStore((s) => s.agronomistChat);
  const sendToAgronomists = useStore((s) => s.sendToAgronomists);
  const requestFromSales = useStore((s) => s.requestFromSales);
  const [input, setInput] = useState('');
  const [visitOpen, setVisitOpen] = useState(false);

  // The app cannot deliver questions yet: keep the bubble here and open WhatsApp with the text.
  const send = () => {
    const text = input.trim();
    if (text === '') return;
    sendToAgronomists(text);
    setInput('');
    showToast(t('messageSavedTitle'), t('messageSavedBody'));
    openWhatsApp(t('waAgronomist', { question: text }));
  };

  const bookFieldVisit = () => {
    requestFromSales(bi('Agronomist field visit', 'Visite terrain agronome'));
    showToast(t('fieldVisitTitle'), t('fieldVisitBody'));
  };

  return (
    <Page narrow className="service-chat-page">
      <ScreenHeader
        title={t('agronomistsTitle')}
        subtitle={t('repliesWeekdays')}
        leading={<span className="service-agro-avatar" aria-hidden="true"><Icon name="spa_outlined" /></span>}
      />

      <p className="service-wa-note">{t('agronomistNote')}</p>
      <ChatList scrollKey={chat.length}>
        {chat.length === 0 && <p className="t-body-m" style={{ textAlign: 'center', margin: '8px 0' }}>{t('agronomistEmpty')}</p>}
        {chat.map((message, i) => <ChatBubble key={i} message={message} />)}
      </ChatList>

      <ChatInputBar
        value={input}
        onChange={setInput}
        hint={t('askTheAgronomists')}
        onSend={send}
        sendLabel={t('sendOnWhatsApp')}
        above={<Button variant="outlined" block onClick={() => setVisitOpen(true)}>{t('bookFieldVisit')}</Button>}
      />
      <ContactJogooSheet open={visitOpen} onClose={() => setVisitOpen(false)} title={t('bookFieldVisit')}
        message={t('waFieldVisit')} onContact={bookFieldVisit} />
    </Page>
  );
}

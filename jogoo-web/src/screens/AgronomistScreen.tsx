// Screen 15: advice from the JOGOO engineering team.
// Ported from lib/screens/agronomist_screen.dart.
import { useState } from 'react';
import { Button, JCard, ListRow, Page, ScreenHeader, SectionTitle, StatusPill } from '../components/ui';
import { Icon } from '../components/Icon';
import { showToast } from '../components/overlays';
import { ChatBubble, ChatInputBar, ChatList } from '../components/service/Chat';
import { useI18n } from '../i18n/i18n';
import { useStore } from '../data/store';
import { DemoData } from '../data/demoData';
import { bi } from '../data/models';
import { dayMonth } from '../utils/format';
import '../styles/service.css';

export default function AgronomistScreen() {
  const { t, b, lang } = useI18n();
  const chat = useStore((s) => s.agronomistChat);
  const sendToAgronomists = useStore((s) => s.sendToAgronomists);
  const requestFromSales = useStore((s) => s.requestFromSales);
  const [input, setInput] = useState('');

  const send = () => {
    const text = input.trim();
    if (text === '') return;
    sendToAgronomists(text);
    setInput('');
    showToast(t('messageSavedTitle'), t('messageSavedBody'));
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

      <JCard>
        <SectionTitle trailing={<StatusPill label={t('updatedOn', { date: dayMonth(lang, DemoData.wateringPlanUpdated) })} tone="cyan" />}>
          {t('wateringPlanThisWeek')}
        </SectionTitle>
        <div style={{ marginTop: 8 }}>
          {DemoData.wateringPlan.map((plot) => (
            <ListRow key={plot.badge}
              leading={<span className={`tint-icon tone-${plot.tone} t-title-s`} style={{ width: 48, height: 48, color: 'var(--tone-fg)' }}>{plot.badge}</span>}
              title={b(plot.name)} subtitle={b(plot.schedule)} />
          ))}
        </div>
      </JCard>

      <div style={{ height: 16 }} />
      <ChatList scrollKey={chat.length}>
        {chat.map((message, i) => <ChatBubble key={i} message={message} />)}
      </ChatList>

      <ChatInputBar
        value={input}
        onChange={setInput}
        hint={t('askTheAgronomists')}
        onSend={send}
        above={<Button variant="outlined" block onClick={bookFieldVisit}>{t('bookFieldVisit')}</Button>}
      />
    </Page>
  );
}

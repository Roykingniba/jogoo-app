// Screen 19: how and when JOGOO reaches the client.
// Ported from lib/screens/notifications_screen.dart.
import { useEffect } from 'react';
import { Divided, JCard, ListRow, Page, ScreenHeader, Switch, TintIcon } from '../components/ui';
import { useI18n } from '../i18n/i18n';
import { useStore } from '../data/store';
import type { AppNotification, NotificationChannel } from '../data/models';
import { dayMonth, isSameDay, timeOfDay } from '../utils/format';
import '../styles/home.css';

// Like Flutter's dispose(): unread dots stay visible while the list is open and
// clear once the screen has closed. The timer is cancelled when the effect
// re-runs straight away (React StrictMode), so only a real close marks them read.
let pendingMarkRead: number | undefined;

export default function NotificationsScreen() {
  const { t } = useI18n();
  const notifications = useStore((s) => s.notifications);
  const channels = useStore((s) => s.channels);
  const setChannel = useStore((s) => s.setChannel);

  useEffect(() => {
    window.clearTimeout(pendingMarkRead);
    return () => {
      pendingMarkRead = window.setTimeout(() => useStore.getState().markNotificationsRead(), 0);
    };
  }, []);

  const now = new Date();
  const today = notifications.filter((n) => isSameDay(n.at, now));
  const earlier = notifications.filter((n) => !isSameDay(n.at, now));

  const options: [NotificationChannel, string][] = [
    ['push', t('channelPush')],
    ['sms', 'SMS'],
    ['whatsApp', 'WhatsApp'],
  ];

  return (
    <Page>
      <ScreenHeader title={t('notificationsTitle')} subtitle={t('notificationsSubtitle')} />
      <div className="notif-layout">
        <aside className="notif-side">
          <JCard style={{ paddingTop: 16, paddingBottom: 16 }}>
            <div className="notif-channels">
              {options.map(([channel, label]) => (
                <div className="notif-channel" key={channel}>
                  <span className="t-title-s">{label}</span>
                  <Switch checked={channels[channel]} onChange={(on) => setChannel(channel, on)} label={label} />
                </div>
              ))}
            </div>
          </JCard>
        </aside>
        <div className="notif-list stack">
          {notifications.length === 0 && <JCard><p className="t-body-l" style={{ margin: 0 }}>{t('noNotifications')}</p></JCard>}
          {today.length > 0 && <Section title={t('today')} items={today} />}
          {earlier.length > 0 && <Section title={t('earlier')} items={earlier} />}
        </div>
      </div>
    </Page>
  );
}

function Section({ title, items }: { title: string; items: AppNotification[] }) {
  const { t, b, lang, fr } = useI18n();
  const when = (at: Date) => {
    const now = new Date();
    if (isSameDay(at, now)) return timeOfDay(at);
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (isSameDay(at, yesterday)) return t('yesterday');
    return dayMonth(lang, at);
  };
  return (
    <JCard className="notif-section">
      <h2 className="t-title-l">{title}</h2>
      <Divided>
        {items.map((n, i) => (
          <ListRow
            key={i}
            leading={<TintIcon icon={n.icon} tone={n.tone} size={52} />}
            title={b(n.title)}
            subtitle={`${b(n.detail)} · ${when(n.at)}`}
            trailing={n.unread ? (
              <span className="notif-dot" role="img" aria-label={fr ? 'Non lu' : 'Unread'} />
            ) : undefined}
          />
        ))}
      </Divided>
    </JCard>
  );
}

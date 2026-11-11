// Round calendar badge "OCT 6", ported from maintenance_log_screen.dart.
import type { Tone } from '../../data/models';
import { useI18n } from '../../i18n/i18n';
import { fullDate, monthBadge } from '../../utils/format';

export default function DateBadge({ date, tone, size = 60 }: { date: Date; tone: Tone; size?: number }) {
  const { lang } = useI18n();
  return (
    <span className={`tone-${tone}`} title={fullDate(lang, date)}
      style={{
        width: size, height: size, borderRadius: '50%', flexShrink: 0,
        background: 'var(--tone-bg)', color: 'var(--tone-fg)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
      <span style={{ fontSize: 10.5, fontWeight: 700, lineHeight: 1.2 }}>{monthBadge(lang, date)}</span>
      <span style={{ fontFamily: 'var(--display)', fontSize: 20, fontWeight: 700, lineHeight: 1.1 }}>{date.getDate()}</span>
    </span>
  );
}

export { DateBadge };

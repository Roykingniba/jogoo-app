// Screen 01: everything that matters today, in one glance.
// Ported from lib/screens/home_screen.dart. Phones keep the Flutter layout
// (navy header, shortcuts card, next visit, picks); tablets and desktops turn
// it into a dashboard with equipment health, season alert, watering plan and Mia.
import { useNavigate } from 'react-router-dom';
import {
  BrandCard, Button, CircleButton, InitialsAvatar, JCard, ListRow, Page, PhotoCircle,
  RoundShortcut, SectionTitle, StatusPill, TintIcon, Divided, asset,
} from '../components/ui';
import { Icon } from '../components/Icon';
import { useI18n, type T } from '../i18n/i18n';
import {
  useStore, nextVisit, products, equipmentById, equipmentList, unreadCount, guideById,
} from '../data/store';
import { DemoData } from '../data/demoData';
import type { EquipmentHealth } from '../data/models';
import { dayMonth, initials, longDayHeader, shortDate, timeOfDay } from '../utils/format';
import { paths } from '../routes';
import '../styles/home.css';

export default function HomeScreen() {
  const { t, b, lang } = useI18n();
  const navigate = useNavigate();
  const requests = useStore((s) => s.serviceRequests);
  const visit = nextVisit(requests);
  const picks = products.filter((p) => p.recommended);
  const pick = picks[0];
  const visitEquipment = visit ? equipmentById(visit.equipmentId) : undefined;

  return (
    <Page className="home-page">
      <div className="home-top">
        <Header />
        <JCard className="home-shortcuts" style={{ padding: '16px 8px' }}>
          <nav className="shortcuts" aria-label={t('quickAccess')}>
            <RoundShortcut label={t('navMyFarm')} icon="spa_outlined" tone="blue" onClick={() => navigate(paths.farm)} />
            <RoundShortcut label={t('navService')} icon="build_outlined" tone="lime" onClick={() => navigate(paths.service)} />
            <RoundShortcut label={t('navShop')} icon="shopping_bag_outlined" tone="orange" onClick={() => navigate(paths.shop)} />
            <RoundShortcut label={t('askMia')} image="images/jogoo_mark.png" tone="pink" onClick={() => navigate(paths.mia)} />
          </nav>
        </JCard>
      </div>

      <div className="home-dash">
        {visit && visit.visitAt && (
          <JCard className="home-cell">
            <SectionTitle trailing={<StatusPill label={t('confirmed')} tone="cyan" />}>{t('nextVisit')}</SectionTitle>
            <div style={{ height: 14 }} />
            <ListRow
              className="home-row-flush"
              leading={<InitialsAvatar initials={initials(visit.technician?.name ?? 'JOGOO')} />}
              title={t('equipmentCheck', { name: b(visitEquipment?.shortName) })}
              subtitle={[shortDate(lang, visit.visitAt), timeOfDay(visit.visitAt), visit.technician?.name]
                .filter(Boolean).join(' · ')}
              trailing={<Button onClick={() => navigate(paths.serviceRequest(visit.id))}>{t('track')}</Button>}
            />
          </JCard>
        )}

        {pick && (
          <JCard className="home-cell">
            <SectionTitle trailing={<StatusPill label={t('newCount', { count: picks.length })} tone="pink" />}>
              {t('pickedForYourFarm')}
            </SectionTitle>
            <div style={{ height: 14 }} />
            <ListRow
              className="home-row-flush"
              leading={<PhotoCircle src={pick.photo} size={72} alt={b(pick.name)} />}
              title={b(pick.name)}
              subtitle={pick.fitNote ? b(pick.fitNote) : undefined}
              subtitleColor="var(--olive)"
              trailing={<Button variant="outlined" onClick={() => navigate(paths.product(pick.id))}>{t('view')}</Button>}
            />
          </JCard>
        )}

        {/* Dashboard extras (tablet and desktop only). */}
        <JCard className="home-cell home-extra">
          <SectionTitle trailing={<Button variant="text" small onClick={() => navigate(paths.farm)}>{t('navMyFarm')}</Button>}>
            {t('equipmentTitle')}
          </SectionTitle>
          <div style={{ height: 6 }} />
          <Divided>
            {equipmentList.map((e) => (
              <ListRow
                key={e.id}
                onClick={() => navigate(paths.equipment(e.id))}
                leading={e.photo ? <PhotoCircle src={e.photo} size={48} alt="" /> : <TintIcon icon={e.icon} tone={e.tone} size={48} />}
                title={b(e.name)}
                subtitle={b(e.healthNote)}
                trailing={<HealthPill health={e.health} t={t} />}
              />
            ))}
          </Divided>
        </JCard>

        <SeasonAlertCard />

        <BrandCard className="home-cell home-extra home-mia" blobSize={150}>
          <div className="row" style={{ ['--gap' as string]: '14px' }}>
            <span className="home-mia-mark"><img src={asset('images/jogoo_mark.png')} alt="" /></span>
            <div className="grow">
              <h2 className="t-title-l">Mia</h2>
              <p className="t-body-m">{t('miaSubtitle')}</p>
            </div>
          </div>
          <div style={{ marginTop: 18 }}>
            <Button variant="lime" icon="chat_bubble_outline" onClick={() => navigate(paths.mia)}>{t('askMia')}</Button>
          </div>
        </BrandCard>

        <JCard className="home-cell home-extra" onClick={() => navigate(paths.agronomist)} ariaLabel={t('wateringPlanThisWeek')}>
          <SectionTitle trailing={<StatusPill label={t('updatedOn', { date: dayMonth(lang, DemoData.wateringPlanUpdated) })} tone="cyan" />}>
            {t('wateringPlanThisWeek')}
          </SectionTitle>
          <div style={{ height: 6 }} />
          {DemoData.wateringPlan.map((plot) => (
            <div className="list-row" key={plot.badge} style={{ padding: '8px 0' }}>
              <span className={`tint-icon tone-${plot.tone} t-title-s`} style={{ width: 48, height: 48, color: 'var(--tone-fg)' }}>
                {plot.badge}
              </span>
              <div className="txt">
                <div className="t-title-s">{b(plot.name)}</div>
                <div className="t-body-m" style={{ marginTop: 2 }}>{b(plot.schedule)}</div>
              </div>
            </div>
          ))}
        </JCard>
      </div>
    </Page>
  );
}

function HealthPill({ health, t }: { health: EquipmentHealth; t: T }) {
  switch (health) {
    case 'good': return <StatusPill label={t('statusGood')} tone="lime" />;
    case 'open': return <StatusPill label={t('statusOpen')} tone="pink" />;
    case 'dueSoon': return <StatusPill label={t('statusDueSoon')} tone="orange" />;
  }
}

/** Orange seasonal banner (same design as on Learn). Opens the related guide. */
function SeasonAlertCard() {
  const { b } = useI18n();
  const navigate = useNavigate();
  const alert = DemoData.seasonAlert;
  const guide = guideById('late-blight');
  const content = (
    <>
      <span className="home-season-icon"><Icon name="thunderstorm_outlined" /></span>
      <span className="grow">
        <span className="t-title-s" style={{ display: 'block' }}>{b(alert.title)}</span>
        <span style={{ color: 'var(--brown)', display: 'block' }}>{b(alert.body)}</span>
      </span>
      {guide && <Icon name="chevron_right" color="var(--brown)" />}
    </>
  );
  if (!guide) return <section className="home-cell home-extra home-season">{content}</section>;
  return (
    <button type="button" className="home-cell home-extra home-season" onClick={() => navigate(paths.guide(guide.id))}>
      {content}
    </button>
  );
}

function Header() {
  const { t, lang, fr } = useI18n();
  const navigate = useNavigate();
  const firstName = useStore((s) => s.profile.firstName);
  const unread = unreadCount(useStore((s) => s.notifications));
  const setLang = useStore((s) => s.setLang);
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12
    ? t('greetingMorning', { name: firstName })
    : hour < 18 ? t('greetingAfternoon', { name: firstName }) : t('greetingEvening', { name: firstName });

  return (
    <header className="home-header">
      <div className="home-header-top">
        <span className="home-mark"><img src={asset('images/jogoo_mark.png')} alt="JOGOO" /></span>
        <span className="home-wordmark grow" aria-hidden="true">JOGOO</span>
        <button type="button" className="home-lang" title={t('switchLanguage')} aria-label={t('switchLanguage')}
          onClick={() => setLang(fr ? 'en' : 'fr')}>
          {fr ? 'EN' : 'FR'}
        </button>
        <span className="home-bell">
          <CircleButton icon="notifications_none" label={t('notificationsTitle')} color="#fff"
            background="rgba(255,255,255,.2)" onClick={() => navigate(paths.notifications)} />
          {unread > 0 && <span className="home-bell-dot" aria-hidden="true" />}
        </span>
      </div>
      <h1 className="home-h1">
        <button type="button" className="home-greet" title={t('openProfile')} onClick={() => navigate(paths.profile)}>
          <span className="home-date">{longDayHeader(lang, now)}</span>
          <span className="home-hello">{greeting}</span>
          <span className="sr-only">. {t('openProfile')}</span>
        </button>
      </h1>
    </header>
  );
}

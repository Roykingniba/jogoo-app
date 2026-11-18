// Screen 01: everything that matters today, in one glance.
// A new client starts on a blank dashboard that invites them to create their
// farm; once it exists, Home shows the farm, its equipment and what is coming.
import { useNavigate } from 'react-router-dom';
import {
  BrandCard, Button, CircleButton, Divided, InitialsAvatar, JCard, ListRow, Page, PhotoCircle,
  RoundShortcut, SectionTitle, StatusPill, TintIcon, asset,
} from '../components/ui';
import { CreateFarmCard, FarmSummary } from '../components/farm/FarmSummary';
import { EquipmentSheet } from '../components/farm/EquipmentSheet';
import { useI18n } from '../i18n/i18n';
import { useStore, nextVisit, unreadCount, activeVisits } from '../data/store';
import { NextVisitCard } from '../components/service/VisitParts';
import { EQUIPMENT_KINDS, choiceLabel } from '../data/farm';
import { initials, longDayHeader, shortDate, timeOfDay } from '../utils/format';
import { paths } from '../routes';
import { useEffect, useState } from 'react';
import '../styles/home.css';

export default function HomeScreen() {
  const { t, b, lang } = useI18n();
  const navigate = useNavigate();
  const requests = useStore((s) => s.serviceRequests);
  const visits = useStore((s) => s.visits);
  const loadVisits = useStore((s) => s.loadVisits);
  useEffect(() => { void loadVisits(); }, [loadVisits]);
  const nextJogooVisit = activeVisits(visits)[0];
  const farm = useStore((s) => s.farm);
  const status = useStore((s) => s.farmStatus);
  const owner = useStore((s) => s.owner);
  const equipment = useStore((s) => s.equipment);
  const visit = nextVisit(requests);
  const visitEquipment = visit ? equipment.find((e) => e.id === visit.equipmentId) : undefined;
  const [adding, setAdding] = useState(false);

  let main;
  if (!farm && (status === 'loading' || status === 'idle')) {
    main = <JCard className="home-cell"><p className="t-body-l" role="status" style={{ margin: 0 }}>{t('loadingFarm')}</p></JCard>;
  } else if (!farm && status === 'error') {
    main = (
      <JCard className="home-cell">
        <p className="t-body-l" style={{ marginTop: 0 }}>{t('farmLoadFailed')}</p>
        <Button variant="outlined" onClick={() => owner && void useStore.getState().loadFarm(owner)}>{t('tryAgain')}</Button>
      </JCard>
    );
  } else if (!farm) {
    main = <CreateFarmCard className="home-cell" />;
  } else {
    main = (
      <>
        <FarmSummary farm={farm} full={false} className="home-cell" />
        <JCard className="home-cell">
          <SectionTitle trailing={<Button variant="text" small icon="add" onClick={() => setAdding(true)}>{t('add')}</Button>}>
            {t('equipmentTitle')}
          </SectionTitle>
          {equipment.length === 0 ? (
            <div className="farm-empty" style={{ marginTop: 10 }}>
              <p className="t-body-m">{t('noEquipmentYet')}</p>
              <Button variant="outlined" icon="add" onClick={() => setAdding(true)}>{t('addEquipment')}</Button>
            </div>
          ) : (
            <>
              <div style={{ height: 6 }} />
              <Divided>
                {equipment.slice(0, 4).map((e) => (
                  <ListRow
                    key={e.id}
                    onClick={() => navigate(paths.equipment(e.id))}
                    leading={e.photo ? <PhotoCircle src={e.photo} size={48} alt="" /> : <TintIcon icon={e.icon} tone={e.tone} size={48} />}
                    title={b(e.name)}
                    subtitle={[e.kind ? choiceLabel(EQUIPMENT_KINDS, e.kind, lang) : '', e.serial].filter(Boolean).join(' · ') || undefined}
                  />
                ))}
              </Divided>
              {equipment.length > 4 && (
                <Button variant="text" small onClick={() => navigate(paths.farm)}>{t('seeAll', { count: equipment.length })}</Button>
              )}
            </>
          )}
        </JCard>
      </>
    );
  }

  return (
    <Page className="home-page">
      <div className="home-top">
        <Header />
        <JCard className="home-shortcuts" style={{ padding: '16px 8px' }}>
          <nav className="shortcuts" aria-label={t('quickAccess')}>
            <RoundShortcut label={t('navMyFarm')} icon="spa_outlined" tone="blue" onClick={() => navigate(farm ? paths.farm : paths.farmSetup)} />
            <RoundShortcut label={t('navService')} icon="build_outlined" tone="lime" onClick={() => navigate(paths.service)} />
            <RoundShortcut label={t('navShop')} icon="shopping_bag_outlined" tone="orange" onClick={() => navigate(paths.shop)} />
            <RoundShortcut label={t('askMia')} image="images/jogoo_mark.png" tone="pink" onClick={() => navigate(paths.mia)} />
          </nav>
        </JCard>
      </div>

      <div className="home-dash">
        {main}

        {nextJogooVisit && <NextVisitCard visit={nextJogooVisit} className="home-cell" />}

        {!nextJogooVisit && visit && visit.visitAt && (
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
      </div>
      <EquipmentSheet open={adding} onClose={() => setAdding(false)} />
    </Page>
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

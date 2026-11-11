// Router. Hash URLs (#/shop) work on any static host with no server rewrites.
// Every screen is a separate chunk so phones only download what they open.
import { lazy, Suspense, useEffect } from 'react';
import { createHashRouter, RouterProvider, Link, Navigate } from 'react-router-dom';
import { Shell } from './Shell';
import { Page, JCard, Button } from '../components/ui';
import { useI18n } from '../i18n/i18n';
import { useStore } from '../data/store';
import { useAuth } from '../data/auth';
import { Logo } from '../components/Logo';

const s = {
  Home: lazy(() => import('../screens/HomeScreen')),
  MyFarm: lazy(() => import('../screens/MyFarmScreen')),
  Equipment: lazy(() => import('../screens/EquipmentScreen')),
  Shop: lazy(() => import('../screens/ShopScreen')),
  Product: lazy(() => import('../screens/ProductScreen')),
  Mia: lazy(() => import('../screens/MiaScreen')),
  Learn: lazy(() => import('../screens/LearnScreen')),
  Guide: lazy(() => import('../screens/GuideScreen')),
  Walkthrough: lazy(() => import('../screens/WalkthroughScreen')),
  Service: lazy(() => import('../screens/ServiceScreen')),
  ServiceRequest: lazy(() => import('../screens/ServiceRequestScreen')),
  Profile: lazy(() => import('../screens/ProfileScreen')),
  SpareParts: lazy(() => import('../screens/SparePartsScreen')),
  ReorderInputs: lazy(() => import('../screens/ReorderInputsScreen')),
  Delivery: lazy(() => import('../screens/DeliveryScreen')),
  ReportProblem: lazy(() => import('../screens/ReportProblemScreen')),
  Agronomist: lazy(() => import('../screens/AgronomistScreen')),
  Documents: lazy(() => import('../screens/DocumentsScreen')),
  MaintenanceLog: lazy(() => import('../screens/MaintenanceLogScreen')),
  NewLogEntry: lazy(() => import('../screens/NewLogEntryScreen')),
  Notifications: lazy(() => import('../screens/NotificationsScreen')),
  OfflineLibrary: lazy(() => import('../screens/OfflineLibraryScreen')),
  Status: lazy(() => import('../screens/StatusScreen')),
  Admin: lazy(() => import('../screens/AdminScreen')),
};
const AuthScreen = lazy(() => import('../screens/AuthScreen'));

function NotFound() {
  const { t } = useI18n();
  return (
    <Page narrow>
      <div style={{ paddingTop: 48 }}>
        <JCard>
          <h1 className="t-headline">{t('notFoundTitle')}</h1>
          <p className="t-body-m" style={{ margin: '8px 0 16px' }}>{t('notFoundBody')}</p>
          <Link to="/" style={{ textDecoration: 'none' }}><Button>{t('goHome')}</Button></Link>
        </JCard>
      </div>
    </Page>
  );
}

const el = (C: React.ComponentType) => (
  <Suspense fallback={<div className="page" aria-busy="true" />}>
    <C />
  </Suspense>
);

const router = createHashRouter([
  {
    element: <Shell />,
    children: [
      { path: '/', element: el(s.Home) },
      { path: '/farm', element: el(s.MyFarm) },
      { path: '/farm/equipment/:id', element: el(s.Equipment) },
      { path: '/farm/documents', element: el(s.Documents) },
      { path: '/farm/log/:equipmentId', element: el(s.MaintenanceLog) },
      { path: '/farm/log/:equipmentId/new', element: el(s.NewLogEntry) },
      { path: '/farm/orders/:orderId', element: el(s.Delivery) },
      { path: '/shop', element: el(s.Shop) },
      { path: '/shop/product/:id', element: el(s.Product) },
      { path: '/shop/spare-parts', element: el(s.SpareParts) },
      { path: '/shop/reorder', element: el(s.ReorderInputs) },
      { path: '/learn', element: el(s.Learn) },
      { path: '/learn/guide/:id', element: el(s.Guide) },
      { path: '/learn/walkthrough/:id', element: el(s.Walkthrough) },
      { path: '/learn/offline', element: el(s.OfflineLibrary) },
      { path: '/service', element: el(s.Service) },
      { path: '/service/requests/:id', element: el(s.ServiceRequest) },
      { path: '/service/report', element: el(s.ReportProblem) },
      { path: '/service/agronomist', element: el(s.Agronomist) },
      { path: '/mia', element: el(s.Mia) },
      { path: '/profile', element: el(s.Profile) },
      { path: '/notifications', element: el(s.Notifications) },
      { path: '/status', element: el(s.Status) },
      { path: '/admin', element: el(s.Admin) },
      { path: '/signup', element: <Navigate to="/status" replace /> },
      { path: '/signin', element: <Navigate to="/" replace /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

export function App() {
  const lang = useStore((st) => st.lang);
  const { t } = useI18n();
  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = t('appTitle') === 'Jogoo' ? 'Jogoo · JOGOO Agriculture' : t('appTitle');
  }, [lang, t]);
  const status = useAuth((st) => st.status);
  const accountLang = useAuth((st) => st.profile?.lang);
  useEffect(() => { void useAuth.getState().init(); }, []);
  // Remember the chosen language on the account (used for code emails).
  useEffect(() => {
    if (status === 'signedIn' && accountLang && accountLang !== lang) {
      void useAuth.getState().updateProfile({ lang }).catch(() => {});
    }
  }, [lang, status, accountLang]);
  if (status === 'loading') return <Splash />;
  if (status === 'signedOut') return <Suspense fallback={<Splash />}><AuthScreen /></Suspense>;
  return <RouterProvider router={router} />;
}

function Splash() {
  return (
    <div style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center' }} aria-busy="true">
      <Logo height={64} style={{ alignSelf: 'center' }} />
    </div>
  );
}

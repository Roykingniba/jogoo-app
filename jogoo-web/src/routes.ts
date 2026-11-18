// URL map for every screen. Screens navigate with these helpers, e.g.
//   const navigate = useNavigate(); navigate(paths.equipment('drip-kit'))
// The first path segment decides which main tab is highlighted.

export type AppTab = 'home' | 'farm' | 'shop' | 'learn' | 'service' | 'status';

export const paths = {
  // 01-05, 07, 08: main tabs
  home: '/',
  farm: '/farm',
  shop: '/shop',
  learn: '/learn',
  service: '/service',

  // My farm
  /** Create the farm, or edit its details. */
  farmSetup: '/farm/setup',
  equipment: (id: string) => `/farm/equipment/${id}`, // 03
  documents: '/farm/documents', // 16
  maintenanceLog: (equipmentId: string) => `/farm/log/${equipmentId}`, // 17
  newLogEntry: (equipmentId: string) => `/farm/log/${equipmentId}/new`, // 18
  delivery: (orderId: string) => `/farm/orders/${orderId}`, // 13

  // Shop
  product: (id: string) => `/shop/product/${id}`, // 05
  /** 11. Optional ?equipment=<id> preselects equipment, ?part=<code> highlights a part. */
  spareParts: (q?: { equipment?: string; part?: string }) => {
    const s = new URLSearchParams();
    if (q?.equipment) s.set('equipment', q.equipment);
    if (q?.part) s.set('part', q.part);
    const qs = s.toString();
    return `/shop/spare-parts${qs ? `?${qs}` : ''}`;
  },
  reorder: '/shop/reorder', // 12

  // Learn
  guide: (id: string) => `/learn/guide/${id}`, // 07 reader
  walkthrough: (id: string) => `/learn/walkthrough/${id}`,
  offlineLibrary: '/learn/offline', // 20

  // Service
  serviceRequest: (id: string) => `/service/requests/${id}`, // 09
  /** 14. Optional ?equipment=<id> preselects the equipment. */
  reportProblem: (equipmentId?: string) => `/service/report${equipmentId ? `?equipment=${equipmentId}` : ''}`,
  agronomist: '/service/agronomist', // 15
  /** A planned JOGOO visit: technician, hotel, itinerary. */
  visit: (id: string) => `/service/visits/${id}`,

  // Not under a tab
  mia: '/mia', // 06
  profile: '/profile', // 10
  notifications: '/notifications', // 19

  // Accounts (web v1.1)
  status: '/status', // client journey tracking
} as const;

export function tabForPath(pathname: string): AppTab | null {
  const seg = pathname.split('/')[1] ?? '';
  if (seg === '') return 'home';
  if (seg === 'farm' || seg === 'shop' || seg === 'learn' || seg === 'service' || seg === 'status') return seg;
  return null;
}

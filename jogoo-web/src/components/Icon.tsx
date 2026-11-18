// Material icon names used by the Flutter app, mapped to Lucide SVG icons.
// Keep the Material names so screens read like the original design.
import type { LucideIcon } from 'lucide-react';
import {
  Plus, Zap, Wrench, Cable, CalendarDays, Phone, MessageCircle, Check, ChevronLeft,
  ChevronRight, X, CloudOff, CircleDot, Bug, Tornado, Trash2, FileText, Download,
  CircleCheck, NotebookPen, CircleAlert, CalendarCheck, ChevronUp, Heart, Folder,
  Warehouse, ShieldAlert, Wheat, Grid3x3, Bandage, House, Package, Truck, Map,
  BookOpen, Bell, Pause, Camera, Images, Play, QrCode, Disc, Minus, FlaskConical,
  Search, Send, Share2, Shield, ShoppingBag, ShoppingCart, SkipForward, SkipBack,
  Sprout, Gauge, Star, CloudLightning, ShieldCheck, Video, Droplet, Sun, Receipt,
  Languages, LogOut, User, Sparkles, Menu, Settings, Download as InstallIcon, Smartphone,
  ListChecks, Users, Eye, EyeOff, Mail, Lock, KeyRound, RefreshCw, BedDouble, Route, Upload, Pencil,
} from 'lucide-react';

const map = {
  add: Plus,
  bolt_outlined: Zap,
  build: Wrench,
  build_outlined: Wrench,
  cable: Cable,
  calendar_month_outlined: CalendarDays,
  call_outlined: Phone,
  chat_bubble_outline: MessageCircle,
  check: Check,
  chevron_left: ChevronLeft,
  chevron_right: ChevronRight,
  close: X,
  cloud_off_outlined: CloudOff,
  control_point: CircleDot,
  coronavirus_outlined: Bug,
  cyclone: Tornado,
  delete_outline: Trash2,
  description_outlined: FileText,
  download_done: CircleCheck,
  download_outlined: Download,
  edit_note: NotebookPen,
  error_outline: CircleAlert,
  event_available_outlined: CalendarCheck,
  expand_less: ChevronUp,
  favorite: Heart,
  favorite_border: Heart,
  folder_outlined: Folder,
  foundation_outlined: Warehouse,
  gpp_maybe_outlined: ShieldAlert,
  grain: Wheat,
  grid_on: Grid3x3,
  healing_outlined: Bandage,
  home: House,
  home_outlined: House,
  inventory_2_outlined: Package,
  local_shipping_outlined: Truck,
  map_outlined: Map,
  menu_book: BookOpen,
  menu_book_outlined: BookOpen,
  notifications_none: Bell,
  pause_rounded: Pause,
  photo_camera_outlined: Camera,
  photo_library_outlined: Images,
  play_arrow_rounded: Play,
  qr_code_2: QrCode,
  radio_button_checked: Disc,
  receipt_long_outlined: Receipt,
  remove: Minus,
  science_outlined: FlaskConical,
  search: Search,
  send_outlined: Send,
  share_outlined: Share2,
  shield_outlined: Shield,
  shopping_bag: ShoppingBag,
  shopping_bag_outlined: ShoppingBag,
  shopping_cart_outlined: ShoppingCart,
  skip_next_rounded: SkipForward,
  skip_previous_rounded: SkipBack,
  spa: Sprout,
  spa_outlined: Sprout,
  speed: Gauge,
  star_rounded: Star,
  thunderstorm_outlined: CloudLightning,
  verified_user_outlined: ShieldCheck,
  videocam_outlined: Video,
  water_drop_outlined: Droplet,
  wb_sunny_outlined: Sun,
  // Web-only additions
  language: Languages,
  logout: LogOut,
  person: User,
  sparkles: Sparkles,
  menu: Menu,
  settings: Settings,
  install: InstallIcon,
  smartphone: Smartphone,
  track: ListChecks,
  clients: Users,
  eye: Eye,
  eye_off: EyeOff,
  mail: Mail,
  lock: Lock,
  key: KeyRound,
  refresh: RefreshCw,
  hotel: BedDouble,
  route: Route,
  upload: Upload,
  edit: Pencil,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof map;

/** Icons drawn filled (Material's non-outlined variants). */
const filled = new Set<IconName>(['favorite', 'star_rounded', 'play_arrow_rounded', 'pause_rounded']);

export function Icon({
  name,
  size = 22,
  color,
  className,
  strokeWidth = 2,
}: {
  name: IconName;
  size?: number;
  color?: string;
  className?: string;
  strokeWidth?: number;
}) {
  const C = map[name];
  const fill = filled.has(name) ? 'currentColor' : 'none';
  return <C size={size} color={color} className={className} strokeWidth={strokeWidth} fill={fill} aria-hidden="true" />;
}

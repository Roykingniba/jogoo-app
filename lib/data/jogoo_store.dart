import 'package:flutter/widgets.dart';

import '../models/models.dart';
import 'demo_data.dart';
import 'mia_client.dart';

/// App state for the client app. Phase 1 is backed by [DemoData] in memory;
/// the lists here map one-to-one to the Supabase tables PowerSync will sync
/// once the data model is agreed.
class JogooStore extends ChangeNotifier {
  JogooStore({
    required this._mia,
    Locale? locale,
    this._onLocaleChanged,
  }) : localeListenable = ValueNotifier(locale);

  final MiaClient _mia;
  final void Function(Locale)? _onLocaleChanged;

  // Language -----------------------------------------------------------------

  /// Kept apart from the store's other changes so only the app root
  /// rebuilds when the language changes. Null follows the phone.
  final ValueNotifier<Locale?> localeListenable;

  Locale? get locale => localeListenable.value;

  void setLocale(Locale locale) {
    localeListenable.value = locale;
    _onLocaleChanged?.call(locale);
  }

  // Farm and profile ----------------------------------------------------------

  FarmProfile _profile = DemoData.profile;
  FarmProfile get profile => _profile;

  void updateFarm({required String location, required double areaHa}) {
    _profile = _profile.copyWith(location: location, areaHa: areaHa);
    notifyListeners();
  }

  final Set<SeasonGoal> _goals = {
    SeasonGoal.higherYields,
    SeasonGoal.moreLandWatered,
  };
  Set<SeasonGoal> get goals => Set.unmodifiable(_goals);

  void toggleGoal(SeasonGoal goal) {
    if (!_goals.remove(goal)) _goals.add(goal);
    notifyListeners();
  }

  List<Equipment> get equipment => DemoData.equipment;

  Equipment equipmentById(String id) =>
      equipment.firstWhere((e) => e.id == id);

  Equipment? equipmentBySerial(String serial) {
    final wanted = serial.trim().toUpperCase();
    for (final item in equipment) {
      if (item.serial == wanted) return item;
    }
    return null;
  }

  // Shop -----------------------------------------------------------------------

  List<Product> get products => DemoData.products;
  Product productById(String id) => products.firstWhere((p) => p.id == id);

  List<SparePart> partsFor(String equipmentId) => DemoData.spareParts
      .where((p) => p.equipmentId == equipmentId)
      .toList();

  SparePart? partByCode(String code) {
    for (final part in DemoData.spareParts) {
      if (part.code == code) return part;
    }
    return null;
  }

  final List<CartLine> _cart = [];
  List<CartLine> get cart => List.unmodifiable(_cart);
  int get cartCount => _cart.fold(0, (sum, line) => sum + line.quantity);
  int get cartTotal => _cart.fold(0, (sum, line) => sum + line.total);

  bool inCart(String id) => _cart.any((line) => line.id == id);

  void addToCart(CartLine line) {
    final index = _cart.indexWhere((l) => l.id == line.id);
    if (index == -1) {
      _cart.add(line);
    } else {
      final existing = _cart[index];
      _cart[index] = CartLine(
        id: existing.id,
        title: existing.title,
        unitPrice: existing.unitPrice,
        quantity: existing.quantity + line.quantity,
      );
    }
    notifyListeners();
  }

  void removeFromCart(String id) {
    _cart.removeWhere((line) => line.id == id);
    notifyListeners();
  }

  /// Turns the cart into one order request for JOGOO sales to confirm.
  void submitCart() {
    if (_cart.isEmpty) return;
    final summary = _cart
        .map((l) => '${l.title.en} × ${l.quantity}')
        .join(', ');
    final summaryFr = _cart
        .map((l) => '${l.title.fr} × ${l.quantity}')
        .join(', ');
    _salesRequests.add(
      SalesRequest(subject: Bi(summary, summaryFr), at: DateTime.now()),
    );
    _cart.clear();
    notifyListeners();
  }

  // Requests waiting to be passed to JOGOO sales (Zoho CRM via Mia).
  final List<SalesRequest> _salesRequests = [];
  List<SalesRequest> get salesRequests => List.unmodifiable(_salesRequests);

  void requestFromSales(Bi subject) {
    _salesRequests.add(SalesRequest(subject: subject, at: DateTime.now()));
    notifyListeners();
  }

  FarmInput get usualInput => DemoData.usualInput;
  List<FarmInput> get otherInputs => DemoData.otherInputs;

  int recommendedBags() =>
      (_profile.areaHa * DemoData.npkBagsPerHa).round().clamp(1, 99);

  bool _seasonReminder = true;
  bool get seasonReminder => _seasonReminder;
  set seasonReminder(bool value) {
    _seasonReminder = value;
    notifyListeners();
  }

  // Orders and invoices --------------------------------------------------------

  List<Order> get orders => DemoData.orders;
  Order orderById(String id) => orders.firstWhere((o) => o.id == id);
  List<Invoice> get invoices => DemoData.invoices;

  // Service --------------------------------------------------------------------

  final List<ServiceRequest> _requests = [...DemoData.serviceRequests];
  List<ServiceRequest> get serviceRequests => List.unmodifiable(_requests);
  int get openRequestCount => _requests.where((r) => r.isOpen).length;

  ServiceRequest requestById(String id) =>
      _requests.firstWhere((r) => r.id == id);

  ServiceRequest? openRequestFor(String equipmentId) {
    for (final request in _requests) {
      if (request.equipmentId == equipmentId && request.isOpen) return request;
    }
    return null;
  }

  /// The next confirmed technician visit, shown on Home.
  ServiceRequest? get nextVisit {
    final upcoming = _requests
        .where((r) => r.isOpen && r.visitAt != null)
        .toList()
      ..sort((a, b) => a.visitAt!.compareTo(b.visitAt!));
    return upcoming.isEmpty ? null : upcoming.first;
  }

  ServiceRequest reportProblem({
    required String equipmentId,
    required Bi problem,
    required String description,
    required List<String> mediaPaths,
  }) {
    final now = DateTime.now();
    final request = ServiceRequest(
      id: 'SR-${1043 + _requests.length - DemoData.serviceRequests.length}',
      equipmentId: equipmentId,
      title: problem,
      createdAt: now,
      description: description.isEmpty ? null : description,
      mediaPaths: mediaPaths,
      steps: [
        RequestStep(kind: RequestStepKind.received, at: now, done: true),
        const RequestStep(kind: RequestStepKind.diagnosed),
        const RequestStep(kind: RequestStepKind.booked),
        const RequestStep(kind: RequestStepKind.fixed),
      ],
    );
    _requests.insert(0, request);
    notifyListeners();
    return request;
  }

  void rateRequest(String id, int rating) {
    _replaceRequest(id, (r) => r.copyWith(rating: rating));
  }

  void addRequestNote(String id, String note) {
    _replaceRequest(id, (r) => r.copyWith(notes: [...r.notes, note]));
  }

  void _replaceRequest(String id, ServiceRequest Function(ServiceRequest) f) {
    final index = _requests.indexWhere((r) => r.id == id);
    if (index == -1) return;
    _requests[index] = f(_requests[index]);
    notifyListeners();
  }

  // Learn and documents ----------------------------------------------------------

  List<Guide> get guides => DemoData.guides;
  Guide guideById(String id) => guides.firstWhere((g) => g.id == id);
  List<FarmDocument> get documents => DemoData.documents;

  bool _wifiOnly = true;
  bool get wifiOnly => _wifiOnly;
  set wifiOnly(bool value) {
    _wifiOnly = value;
    notifyListeners();
  }

  // Maintenance log ------------------------------------------------------------

  final List<LogEntry> _log = [...DemoData.logEntries];

  List<LogEntry> logFor(String equipmentId) =>
      _log.where((e) => e.equipmentId == equipmentId).toList()
        ..sort((a, b) => b.date.compareTo(a.date));

  int pendingLogCount(String equipmentId) =>
      logFor(equipmentId).where((e) => !e.synced).length;

  void addLogEntry(LogEntry entry) {
    _log.add(entry);
    notifyListeners();
  }

  // Notifications ----------------------------------------------------------------

  final List<AppNotification> _notifications = [...DemoData.notifications];
  List<AppNotification> get notifications => List.unmodifiable(_notifications);
  int get unreadCount => _notifications.where((n) => n.unread).length;

  void markNotificationsRead() {
    if (unreadCount == 0) return;
    for (var i = 0; i < _notifications.length; i++) {
      final n = _notifications[i];
      _notifications[i] = AppNotification(
        title: n.title,
        detail: n.detail,
        at: n.at,
        icon: n.icon,
        tone: n.tone,
      );
    }
    notifyListeners();
  }

  final Map<NotificationChannel, bool> _channels = {
    NotificationChannel.push: true,
    NotificationChannel.sms: true,
    NotificationChannel.whatsApp: false,
  };

  bool channelEnabled(NotificationChannel channel) => _channels[channel]!;

  void setChannel(NotificationChannel channel, bool enabled) {
    _channels[channel] = enabled;
    notifyListeners();
  }

  // Mia and the agronomists ------------------------------------------------------

  final List<ChatMessage> _miaChat = [...DemoData.miaChat];
  List<ChatMessage> get miaChat => List.unmodifiable(_miaChat);

  bool _miaBusy = false;
  bool get miaBusy => _miaBusy;

  /// Sends the client's message to Mia. Returns false when Mia cannot be
  /// reached, so the screen can offer a phone call instead.
  Future<bool> sendToMia({
    required String text,
    String? photoFile,
    required String languageCode,
  }) async {
    _miaChat.add(
      ChatMessage(
        author: ChatAuthor.client,
        text: Bi.same(text),
        photoFile: photoFile,
      ),
    );
    _miaBusy = true;
    notifyListeners();

    final reply = await _mia.reply(
      history: _miaChat,
      languageCode: languageCode,
    );

    _miaBusy = false;
    if (reply != null) {
      _miaChat.add(ChatMessage(author: ChatAuthor.mia, text: Bi.same(reply)));
    }
    notifyListeners();
    return reply != null;
  }

  final List<ChatMessage> _agronomistChat = [...DemoData.agronomistChat];
  List<ChatMessage> get agronomistChat => List.unmodifiable(_agronomistChat);

  void sendToAgronomists(String text) {
    _agronomistChat.add(
      ChatMessage(author: ChatAuthor.client, text: Bi.same(text)),
    );
    notifyListeners();
  }
}

/// Makes the [JogooStore] available to every screen.
class JogooScope extends InheritedNotifier<JogooStore> {
  const JogooScope({super.key, required JogooStore store, required super.child})
    : super(notifier: store);

  /// Reads the store and rebuilds when it changes.
  static JogooStore of(BuildContext context) => context
      .dependOnInheritedWidgetOfExactType<JogooScope>()!
      .notifier!;

  /// Reads the store without listening, for use in callbacks.
  static JogooStore read(BuildContext context) =>
      context.getInheritedWidgetOfExactType<JogooScope>()!.notifier!;
}

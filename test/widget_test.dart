import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:jogoo_app/app/app.dart';
import 'package:jogoo_app/app/theme.dart';
import 'package:jogoo_app/data/demo_data.dart';
import 'package:jogoo_app/data/jogoo_store.dart';
import 'package:jogoo_app/data/mia_client.dart';
import 'package:jogoo_app/generated/l10n/app_localizations.dart';
import 'package:jogoo_app/screens/agronomist_screen.dart';
import 'package:jogoo_app/screens/delivery_screen.dart';
import 'package:jogoo_app/screens/documents_screen.dart';
import 'package:jogoo_app/screens/equipment_screen.dart';
import 'package:jogoo_app/screens/guide_screen.dart';
import 'package:jogoo_app/screens/home_screen.dart';
import 'package:jogoo_app/screens/learn_screen.dart';
import 'package:jogoo_app/screens/maintenance_log_screen.dart';
import 'package:jogoo_app/screens/mia_screen.dart';
import 'package:jogoo_app/screens/my_farm_screen.dart';
import 'package:jogoo_app/screens/new_log_entry_screen.dart';
import 'package:jogoo_app/screens/notifications_screen.dart';
import 'package:jogoo_app/screens/offline_library_screen.dart';
import 'package:jogoo_app/screens/product_screen.dart';
import 'package:jogoo_app/screens/profile_screen.dart';
import 'package:jogoo_app/screens/reorder_inputs_screen.dart';
import 'package:jogoo_app/screens/report_problem_screen.dart';
import 'package:jogoo_app/screens/service_request_screen.dart';
import 'package:jogoo_app/screens/service_screen.dart';
import 'package:jogoo_app/screens/shop_screen.dart';
import 'package:jogoo_app/screens/spare_parts_screen.dart';
import 'package:jogoo_app/utils/pdf_exports.dart';

JogooStore _store({Locale? locale}) =>
    JogooStore(mia: const OfflineMiaClient(), locale: locale);

/// A small, entry-level Android screen: 360 × 640 dp.
void _useSmallPhone(WidgetTester tester) {
  tester.view.physicalSize = const Size(720, 1280);
  tester.view.devicePixelRatio = 2;
  addTearDown(tester.view.reset);
}

/// Every screen in the design, keyed by its showcase number.
final _screens = <String, Widget>{
  '01 Home': const Scaffold(body: HomeScreen()),
  '02 My farm': const Scaffold(body: MyFarmScreen()),
  '03 Equipment': const EquipmentScreen(equipmentId: 'drip-kit'),
  '04 Shop': const Scaffold(body: ShopScreen()),
  '05 Product': const ProductScreen(productId: 'fertigation-kit'),
  '06 Mia': const MiaScreen(),
  '07 Learn': const Scaffold(body: LearnScreen()),
  '08 Service': const Scaffold(body: ServiceScreen()),
  '09 Service request': const ServiceRequestScreen(requestId: 'SR-1042'),
  '10 Profile': const ProfileScreen(),
  '11 Spare parts': const SparePartsScreen(),
  '12 Reorder inputs': const ReorderInputsScreen(),
  '13 Delivery': const DeliveryScreen(orderId: 'JG-0418'),
  '14 Report a problem': const ReportProblemScreen(),
  '15 Agronomists': const AgronomistScreen(),
  '16 Documents': const DocumentsScreen(),
  '17 Maintenance log': const MaintenanceLogScreen(equipmentId: 'drip-kit'),
  '18 New log entry': const NewLogEntryScreen(equipmentId: 'drip-kit'),
  '19 Notifications': const NotificationsScreen(),
  '20 Offline library': const OfflineLibraryScreen(),
};

Widget _host(Widget screen, Locale locale) => JogooScope(
  store: _store(locale: locale),
  child: MaterialApp(
    locale: locale,
    localizationsDelegates: AppLocalizations.localizationsDelegates,
    supportedLocales: AppLocalizations.supportedLocales,
    theme: buildJogooTheme(),
    home: screen,
  ),
);

void main() {
  testWidgets('A video guide opens and advances its offline walkthrough', (
    tester,
  ) async {
    _useSmallPhone(tester);
    await tester.pumpWidget(
      _host(const GuideScreen(guideId: 'flush-lines'), const Locale('en')),
    );
    await tester.pumpAndSettle();

    await tester.tap(find.byTooltip('Play the walkthrough'));
    await tester.pumpAndSettle();
    expect(find.text('Step 1 of 2'), findsOneWidget);

    await tester.tap(find.byTooltip('Next step'));
    await tester.pumpAndSettle();
    expect(find.text('Step 2 of 2'), findsOneWidget);
  });

  test(
    'Demo document and maintenance report PDFs have valid headers',
    () async {
      final equipment = DemoData.equipment.first;
      final document = DemoData.documents.first;
      final documentBytes = await buildFarmDocumentPdf(
        title: document.title.en,
        equipmentName: equipment.name.en,
        serialLabel: 'Serial number: ${equipment.serial}',
        copyLabel: 'DEMONSTRATION COPY',
        demoNotice: 'Demonstration only.',
      );
      final reportBytes = await buildMaintenanceLogPdf(
        locale: 'en',
        equipment: equipment,
        entries: DemoData.logEntries
            .where((entry) => entry.equipmentId == equipment.id)
            .toList(),
        demoNotice: 'Demonstration only.',
        loggedByLabel: 'Logged by',
        waitingLabel: 'Waiting to sync',
        syncedLabel: 'Synced',
        reportTitle: 'JOGOO maintenance log',
      );

      expect(String.fromCharCodes(documentBytes.take(5)), '%PDF-');
      expect(String.fromCharCodes(reportBytes.take(5)), '%PDF-');
    },
  );

  testWidgets('Home greets the client and links to the main areas', (
    tester,
  ) async {
    _useSmallPhone(tester);
    await tester.pumpWidget(
      JogooApp(store: _store(locale: const Locale('en'))),
    );
    await tester.pumpAndSettle();

    expect(find.textContaining('Royking'), findsOneWidget);
    expect(find.text('Next visit'), findsOneWidget);
    expect(find.text('Ask Mia'), findsOneWidget);

    // Bottom navigation switches tabs.
    await tester.tap(find.text('Shop').last);
    await tester.pumpAndSettle();
    expect(find.text('JOGOO range, picked for your farm'), findsOneWidget);
  });

  testWidgets('The language switch turns the whole app French', (tester) async {
    _useSmallPhone(tester);
    final store = _store(locale: const Locale('en'));
    await tester.pumpWidget(JogooApp(store: store));
    await tester.pumpAndSettle();

    await tester.tap(find.text('FR'));
    await tester.pumpAndSettle();

    expect(store.locale, const Locale('fr'));
    expect(find.text('Prochaine visite'), findsOneWidget);
    expect(find.text('Boutique'), findsWidgets);
    expect(find.text('Next visit'), findsNothing);
  });

  testWidgets('A new log entry is added and marked as not sent to JOGOO', (
    tester,
  ) async {
    _useSmallPhone(tester);
    final store = _store(locale: const Locale('en'));
    final before = store.pendingLogCount('drip-kit');

    await tester.pumpWidget(
      JogooScope(
        store: store,
        child: MaterialApp(
          localizationsDelegates: AppLocalizations.localizationsDelegates,
          supportedLocales: AppLocalizations.supportedLocales,
          theme: buildJogooTheme(),
          home: const MaintenanceLogScreen(equipmentId: 'drip-kit'),
        ),
      ),
    );
    await tester.tap(find.byTooltip('New entry'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Add to log'));
    await tester.pumpAndSettle();

    expect(store.pendingLogCount('drip-kit'), before + 1);
    expect(
      find.text('2 entries are only on this screen. They are not sent to JOGOO.'),
      findsOneWidget,
    );
  });

  testWidgets('Reporting a problem offers WhatsApp, then opens the request', (
    tester,
  ) async {
    _useSmallPhone(tester);
    final store = _store(locale: const Locale('en'));
    await tester.pumpWidget(_hostWithStore(store, const ReportProblemScreen()));

    await tester.tap(find.text('Drip kit'));
    await tester.tap(find.text('Leak'));
    await tester.pump();
    await tester.tap(find.text('Send on WhatsApp'));
    await tester.pumpAndSettle();

    // The app says plainly it did not send it, and shows the message.
    expect(find.text('Your WhatsApp message'), findsOneWidget);
    expect(
      find.text('Hello JOGOO, I have a problem with Drip kit, 2 ha: Leak.'),
      findsOneWidget,
    );
    await tester.tapAt(const Offset(10, 10)); // Close the sheet.
    await tester.pumpAndSettle();

    expect(store.openRequestCount, 2);
    expect(find.text('Request SR-1043'), findsOneWidget);
  });

  testWidgets('Choice pills stay compact inside wrapping rows', (tester) async {
    _useSmallPhone(tester);
    await tester.pumpWidget(_host(const ProfileScreen(), const Locale('en')));
    await tester.pumpAndSettle();

    final pill = tester.getSize(
      find
          .ancestor(
            of: find.text('Save water'),
            matching: find.byType(Material),
          )
          .first,
    );
    expect(pill.width, lessThan(200));
  });

  for (final locale in const [Locale('en'), Locale('fr')]) {
    for (final MapEntry(key: name, value: screen) in _screens.entries) {
      testWidgets('$name renders on a small phone (${locale.languageCode})', (
        tester,
      ) async {
        _useSmallPhone(tester);
        await tester.pumpWidget(_host(screen, locale));
        await tester.pumpAndSettle();
        // Layout overflows are reported as exceptions and fail the test.
        expect(tester.takeException(), isNull);
      });
    }
  }

  for (final MapEntry(key: name, value: screen) in _screens.entries) {
    testWidgets('$name fits with large system text (fr, 130%)', (tester) async {
      _useSmallPhone(tester);
      tester.platformDispatcher.textScaleFactorTestValue = 1.3;
      addTearDown(tester.platformDispatcher.clearTextScaleFactorTestValue);
      await tester.pumpWidget(_host(screen, const Locale('fr')));
      await tester.pumpAndSettle();
      expect(tester.takeException(), isNull);
    });
  }
}

Widget _hostWithStore(JogooStore store, Widget screen) => JogooScope(
  store: store,
  child: MaterialApp(
    localizationsDelegates: AppLocalizations.localizationsDelegates,
    supportedLocales: AppLocalizations.supportedLocales,
    theme: buildJogooTheme(),
    home: screen,
  ),
);

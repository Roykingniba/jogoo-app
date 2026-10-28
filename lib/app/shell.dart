import 'package:flutter/material.dart';

import '../generated/l10n/app_localizations.dart';
import '../screens/home_screen.dart';
import '../screens/learn_screen.dart';
import '../screens/my_farm_screen.dart';
import '../screens/service_screen.dart';
import '../screens/shop_screen.dart';

enum AppTab { home, farm, shop, learn, service }

/// Opens a screen above the tabs.
Future<T?> push<T>(BuildContext context, Widget screen) =>
    Navigator.of(context).push<T>(MaterialPageRoute(builder: (_) => screen));

/// Main frame with the five tabs from the design.
class AppShell extends StatefulWidget {
  const AppShell({super.key});

  /// Pushed screens are not below the shell in the widget tree, so the bottom
  /// bar reaches it through this key.
  static final globalKey = GlobalKey<AppShellState>();

  static AppShellState get current => globalKey.currentState!;

  @override
  State<AppShell> createState() => AppShellState();
}

class AppShellState extends State<AppShell> {
  AppTab _tab = AppTab.home;

  /// Shows [tab], closing any screens opened on top of the tabs.
  void select(AppTab tab) {
    Navigator.of(context).popUntil((route) => route.isFirst);
    setState(() => _tab = tab);
  }

  @override
  Widget build(BuildContext context) {
    // Only the visible tab is built, to keep memory low on small phones.
    final body = switch (_tab) {
      AppTab.home => const HomeScreen(),
      AppTab.farm => const MyFarmScreen(),
      AppTab.shop => const ShopScreen(),
      AppTab.learn => const LearnScreen(),
      AppTab.service => const ServiceScreen(),
    };
    return PopScope(
      canPop: _tab == AppTab.home,
      onPopInvokedWithResult: (didPop, _) {
        if (!didPop) setState(() => _tab = AppTab.home);
      },
      child: Scaffold(
        body: SafeArea(bottom: false, child: body),
        bottomNavigationBar: JogooNavBar(current: _tab),
      ),
    );
  }
}

/// Bottom navigation. Screens opened from a tab show it too, with their tab
/// highlighted, as in the design.
class JogooNavBar extends StatelessWidget {
  const JogooNavBar({super.key, this.current});

  /// Null when the screen does not belong to a tab (e.g. Profile).
  final AppTab? current;

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    final destinations = [
      (AppTab.home, Icons.home_outlined, Icons.home, l.navHome),
      (AppTab.farm, Icons.spa_outlined, Icons.spa, l.navMyFarm),
      (AppTab.shop, Icons.shopping_bag_outlined, Icons.shopping_bag, l.navShop),
      (AppTab.learn, Icons.menu_book_outlined, Icons.menu_book, l.navLearn),
      (AppTab.service, Icons.build_outlined, Icons.build, l.navService),
    ];
    final selected = current?.index;
    final bar = NavigationBar(
      selectedIndex: selected ?? 0,
      indicatorColor: selected == null ? Colors.transparent : null,
      labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
      onDestinationSelected: (i) => AppShell.current.select(AppTab.values[i]),
      destinations: [
        for (final (tab, icon, selectedIcon, label) in destinations)
          NavigationDestination(
            icon: Icon(icon),
            selectedIcon: Icon(selected == null ? icon : selectedIcon),
            label: label,
            tooltip: tab == current ? null : label,
          ),
      ],
    );
    if (selected != null) return bar;
    // NavigationBar always marks one destination; show none as selected.
    final theme = NavigationBarTheme.of(context);
    return NavigationBarTheme(
      data: theme.copyWith(
        labelTextStyle: WidgetStatePropertyAll(
          theme.labelTextStyle?.resolve({}),
        ),
        iconTheme: WidgetStatePropertyAll(theme.iconTheme?.resolve({})),
      ),
      child: bar,
    );
  }
}

/// Scaffold for screens opened from a tab that keep the bottom navigation.
class TabChildScaffold extends StatelessWidget {
  const TabChildScaffold({
    super.key,
    required this.tab,
    required this.body,
    this.floatingActionButton,
  });

  final AppTab? tab;
  final Widget body;
  final Widget? floatingActionButton;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(bottom: false, child: body),
      floatingActionButton: floatingActionButton,
      bottomNavigationBar: JogooNavBar(current: tab),
    );
  }
}

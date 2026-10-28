import 'package:flutter/material.dart';

import '../app/shell.dart';
import '../app/theme.dart';
import '../data/jogoo_store.dart';
import '../generated/l10n/app_localizations.dart';
import '../utils/format.dart';
import '../widgets/jogoo_widgets.dart';
import 'mia_screen.dart';
import 'notifications_screen.dart';
import 'product_screen.dart';
import 'profile_screen.dart';
import 'service_request_screen.dart';

/// Screen 01: everything that matters today, in one glance.
class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    final store = JogooScope.of(context);
    final visit = store.nextVisit;
    final picks = store.products.where((p) => p.recommended).toList();

    return ListView(
      padding: EdgeInsets.zero,
      children: [
        Stack(
          children: [
            const Positioned(
              top: 0,
              left: 0,
              right: 0,
              height: 300,
              child: _HeaderBackground(),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const _Header(),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: JCard(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 16,
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          child: RoundShortcut(
                            label: l.navMyFarm,
                            icon: Icons.spa_outlined,
                            tone: Tone.blue,
                            onTap: () => AppShell.current.select(AppTab.farm),
                          ),
                        ),
                        Expanded(
                          child: RoundShortcut(
                            label: l.navService,
                            icon: Icons.build_outlined,
                            tone: Tone.lime,
                            onTap: () =>
                                AppShell.current.select(AppTab.service),
                          ),
                        ),
                        Expanded(
                          child: RoundShortcut(
                            label: l.navShop,
                            icon: Icons.shopping_bag_outlined,
                            tone: Tone.orange,
                            onTap: () => AppShell.current.select(AppTab.shop),
                          ),
                        ),
                        Expanded(
                          child: RoundShortcut(
                            label: l.askMia,
                            image: 'assets/images/jogoo_mark.png',
                            tone: Tone.pink,
                            onTap: () => push(context, const MiaScreen()),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              if (visit != null) ...[
                JCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      SectionTitle(
                        l.nextVisit,
                        trailing: StatusPill(l.confirmed, tone: Tone.cyan),
                      ),
                      const SizedBox(height: 14),
                      ListRow(
                        padding: EdgeInsets.zero,
                        leading: InitialsAvatar(
                          initials(visit.technician?.name ?? 'JOGOO'),
                        ),
                        title: l.equipmentCheck(
                          store.equipmentById(visit.equipmentId)
                              .shortName
                              .of(context),
                        ),
                        subtitle: [
                          shortDate(context, visit.visitAt!),
                          timeOfDay(visit.visitAt!),
                          ?visit.technician?.name,
                        ].join(' · '),
                        trailing: FilledButton(
                          onPressed: () => push(
                            context,
                            ServiceRequestScreen(requestId: visit.id),
                          ),
                          child: Text(l.track),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
              ],
              if (picks.isNotEmpty)
                JCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      SectionTitle(
                        l.pickedForYourFarm,
                        trailing: StatusPill(
                          l.newCount(picks.length),
                          tone: Tone.pink,
                        ),
                      ),
                      const SizedBox(height: 14),
                      ListRow(
                        padding: EdgeInsets.zero,
                        leading: PhotoCircle(asset: picks.first.photo, size: 72),
                        title: picks.first.name.of(context),
                        subtitle: picks.first.fitNote?.of(context),
                        subtitleColor: JColors.olive,
                        trailing: OutlinedButton(
                          onPressed: () => push(
                            context,
                            ProductScreen(productId: picks.first.id),
                          ),
                          child: Text(l.view),
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),
        ),
      ],
    );
  }
}

class _HeaderBackground extends StatelessWidget {
  const _HeaderBackground();

  @override
  Widget build(BuildContext context) {
    return ClipRect(
      child: ColoredBox(
        color: JColors.navy,
        child: Stack(
          children: [
            Positioned(
              right: -90,
              top: -150,
              child: Container(
                width: 300,
                height: 300,
                decoration: const BoxDecoration(
                  color: JColors.lime,
                  shape: BoxShape.circle,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _Header extends StatelessWidget {
  const _Header();

  String _greeting(AppLocalizations l, String name) {
    final hour = DateTime.now().hour;
    if (hour < 12) return l.greetingMorning(name);
    if (hour < 18) return l.greetingAfternoon(name);
    return l.greetingEvening(name);
  }

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    final store = JogooScope.of(context);
    final french = isFrench(context);
    const translucent = Color(0x33FFFFFF);

    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 16, 16, 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 48,
                height: 48,
                padding: const EdgeInsets.all(9),
                decoration: const BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                ),
                child: Image.asset(
                  'assets/images/jogoo_mark.png',
                  cacheWidth: 120,
                  semanticLabel: 'JOGOO',
                ),
              ),
              const SizedBox(width: 12),
              const Expanded(
                child: Text(
                  'JOGOO',
                  style: TextStyle(
                    fontFamily: 'Poppins',
                    fontWeight: FontWeight.w700,
                    fontSize: 22,
                    letterSpacing: 1,
                    color: Colors.white,
                  ),
                ),
              ),
              Tooltip(
                message: l.switchLanguage,
                child: Material(
                  color: translucent,
                  shape: const CircleBorder(),
                  child: InkWell(
                    customBorder: const CircleBorder(),
                    onTap: () => store.setLocale(Locale(french ? 'en' : 'fr')),
                    child: SizedBox(
                      width: 52,
                      height: 52,
                      child: Center(
                        child: Text(
                          french ? 'EN' : 'FR',
                          style: const TextStyle(
                            fontWeight: FontWeight.w700,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Stack(
                children: [
                  CircleButton(
                    icon: Icons.notifications_none,
                    tooltip: l.notificationsTitle,
                    color: Colors.white,
                    background: translucent,
                    onPressed: () =>
                        push(context, const NotificationsScreen()),
                  ),
                  if (store.unreadCount > 0)
                    Positioned(
                      right: 10,
                      top: 10,
                      child: Container(
                        width: 11,
                        height: 11,
                        decoration: BoxDecoration(
                          color: JColors.magenta,
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white, width: 1.5),
                        ),
                      ),
                    ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 28),
          Semantics(
            button: true,
            label: l.openProfile,
            child: InkWell(
              onTap: () => push(context, const ProfileScreen()),
              borderRadius: BorderRadius.circular(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    longDayHeader(context, DateTime.now()),
                    style: const TextStyle(
                      color: Color(0xFFC9DBEC),
                      fontWeight: FontWeight.w700,
                      letterSpacing: 1.2,
                      fontSize: 13,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    _greeting(l, store.profile.firstName),
                    style: const TextStyle(
                      fontFamily: 'Poppins',
                      fontWeight: FontWeight.w700,
                      fontSize: 30,
                      height: 1.15,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

import 'package:flutter/material.dart';

import '../app/shell.dart';
import '../app/theme.dart';
import '../data/jogoo_store.dart';
import '../generated/l10n/app_localizations.dart';
import '../models/models.dart';
import '../utils/format.dart';
import '../widgets/jogoo_widgets.dart';

/// Screen 19: how and when JOGOO reaches the client.
class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  late final JogooStore _store;

  @override
  void initState() {
    super.initState();
    _store = JogooScope.read(context);
  }

  @override
  void dispose() {
    // Unread dots stay visible while the list is open; they clear once the
    // screen has closed and the tree is no longer being torn down.
    Future.microtask(_store.markNotificationsRead);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    final store = JogooScope.of(context);
    final now = DateTime.now();
    final today = store.notifications.where((n) => isSameDay(n.at, now));
    final earlier = store.notifications.where((n) => !isSameDay(n.at, now));

    return TabChildScaffold(
      tab: null,
      body: Column(
        children: [
          ScreenHeader(
            title: l.notificationsTitle,
            subtitle: l.notificationsSubtitle,
          ),
          Expanded(
            child: ScreenList(
              children: [
                JCard(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  child: Row(
                    children: [
                      for (final (channel, label) in [
                        (NotificationChannel.push, l.channelPush),
                        (NotificationChannel.sms, 'SMS'),
                        (NotificationChannel.whatsApp, 'WhatsApp'),
                      ])
                        Expanded(
                          child: Column(
                            children: [
                              Text(
                                label,
                                style: Theme.of(context).textTheme.titleSmall,
                              ),
                              const SizedBox(height: 6),
                              Switch(
                                value: store.channelEnabled(channel),
                                onChanged: (on) =>
                                    store.setChannel(channel, on),
                              ),
                            ],
                          ),
                        ),
                    ],
                  ),
                ),
                if (today.isNotEmpty) _Section(title: l.today, items: today),
                if (earlier.isNotEmpty)
                  _Section(title: l.earlier, items: earlier),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _Section extends StatelessWidget {
  const _Section({required this.title, required this.items});

  final String title;
  final Iterable<AppNotification> items;

  String _when(BuildContext context, DateTime at) {
    final l = AppLocalizations.of(context);
    final now = DateTime.now();
    if (isSameDay(at, now)) return timeOfDay(at);
    if (isSameDay(at, now.subtract(const Duration(days: 1)))) {
      return l.yesterday;
    }
    return dayMonth(context, at);
  }

  @override
  Widget build(BuildContext context) {
    return JCard(
      padding: const EdgeInsets.fromLTRB(16, 18, 16, 4),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(title, style: Theme.of(context).textTheme.titleLarge),
          DividedColumn(
            children: [
              for (final n in items)
                ListRow(
                  leading: TintIcon(n.icon, tone: n.tone, size: 52),
                  title: n.title.of(context),
                  subtitle: '${n.detail.of(context)} · ${_when(context, n.at)}',
                  trailing: n.unread
                      ? Container(
                          width: 12,
                          height: 12,
                          decoration: const BoxDecoration(
                            color: JColors.magenta,
                            shape: BoxShape.circle,
                          ),
                        )
                      : null,
                ),
            ],
          ),
        ],
      ),
    );
  }
}

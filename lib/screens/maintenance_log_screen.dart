import 'package:flutter/material.dart';

import '../app/shell.dart';
import '../app/theme.dart';
import '../data/jogoo_store.dart';
import '../generated/l10n/app_localizations.dart';
import '../models/models.dart';
import '../utils/format.dart';
import '../utils/pdf_exports.dart';
import '../widgets/jogoo_widgets.dart';
import 'new_log_entry_screen.dart';

/// Screen 17: a shared logbook between client and JOGOO.
class MaintenanceLogScreen extends StatelessWidget {
  const MaintenanceLogScreen({super.key, required this.equipmentId});

  final String equipmentId;

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    final store = JogooScope.of(context);
    final equipment = store.equipmentById(equipmentId);
    final entries = store.logFor(equipmentId);
    final pending = store.pendingLogCount(equipmentId);

    return TabChildScaffold(
      tab: AppTab.farm,
      floatingActionButton: FloatingActionButton.large(
        tooltip: l.newEntry,
        backgroundColor: JColors.navy,
        foregroundColor: Colors.white,
        shape: const CircleBorder(),
        onPressed: () =>
            push(context, NewLogEntryScreen(equipmentId: equipmentId)),
        child: const Icon(Icons.add, size: 36),
      ),
      body: Column(
        children: [
          ScreenHeader(
            title: l.maintenanceLog,
            subtitle: equipment.name.of(context),
          ),
          Expanded(
            child: ScreenList(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 120),
              children: [
                if (pending > 0)
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 14,
                      vertical: 12,
                    ),
                    decoration: BoxDecoration(
                      color: JColors.orangeTint,
                      borderRadius: BorderRadius.circular(999),
                    ),
                    child: Row(
                      children: [
                        const CircleAvatar(
                          radius: 20,
                          backgroundColor: JColors.orange,
                          child: Icon(
                            Icons.cloud_off_outlined,
                            color: JColors.ink,
                            size: 20,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            l.pendingSync(pending),
                            style: const TextStyle(
                              color: JColors.brown,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                if (entries.isEmpty)
                  JCard(child: Text(l.emptyLog))
                else
                  JCard(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 4,
                    ),
                    child: DividedColumn(
                      children: [
                        for (final entry in entries) _EntryRow(entry: entry),
                      ],
                    ),
                  ),
                Align(
                  alignment: Alignment.centerLeft,
                  child: OutlinedButton(
                    onPressed: () => shareMaintenanceLog(
                      context,
                      equipment,
                      entries,
                    ),
                    child: Text(l.exportPdf),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _EntryRow extends StatelessWidget {
  const _EntryRow({required this.entry});

  final LogEntry entry;

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    final tone = switch (entry.type) {
      LogEntryType.fertigation => Tone.pink,
      LogEntryType.partReplaced => Tone.blue,
      LogEntryType.service => Tone.lime,
    };
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 14),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          DateBadge(date: entry.date, tone: tone),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  entry.title.of(context),
                  style: Theme.of(context).textTheme.titleSmall,
                ),
                const SizedBox(height: 2),
                Text(
                  l.loggedBy(entry.loggedBy),
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
                const SizedBox(height: 8),
                entry.synced
                    ? StatusPill(l.synced, tone: Tone.lime)
                    : StatusPill(l.waitingToSync, tone: Tone.orange),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// Round calendar badge: "OCT 6".
class DateBadge extends StatelessWidget {
  const DateBadge({super.key, required this.date, required this.tone});

  final DateTime date;
  final Tone tone;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 60,
      height: 60,
      decoration: BoxDecoration(color: tone.background, shape: BoxShape.circle),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            monthBadge(context, date),
            style: TextStyle(
              fontSize: 10.5,
              fontWeight: FontWeight.w700,
              color: tone.foreground,
            ),
          ),
          Text(
            '${date.day}',
            style: TextStyle(
              fontFamily: 'Poppins',
              fontSize: 20,
              height: 1.1,
              fontWeight: FontWeight.w700,
              color: tone.foreground,
            ),
          ),
        ],
      ),
    );
  }
}

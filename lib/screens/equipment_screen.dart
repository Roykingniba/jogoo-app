import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../app/shell.dart';
import '../app/theme.dart';
import '../data/jogoo_store.dart';
import '../generated/l10n/app_localizations.dart';
import '../models/models.dart';
import '../utils/format.dart';
import '../utils/actions.dart';
import '../widgets/jogoo_widgets.dart';
import 'documents_screen.dart';
import 'maintenance_log_screen.dart';
import 'report_problem_screen.dart';

/// Screen 03: the life of one installation, from install date to next service.
class EquipmentScreen extends StatelessWidget {
  const EquipmentScreen({super.key, required this.equipmentId});

  final String equipmentId;

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    final store = JogooScope.of(context);
    final item = store.equipmentById(equipmentId);
    final text = Theme.of(context).textTheme;
    final openRequest = store.openRequestFor(item.id);

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            ScreenHeader(
              title: l.equipmentTitle,
              centerTitle: true,
              trailing: CircleButton(
                icon: Icons.share_outlined,
                tooltip: l.share,
                onPressed: () => _copyDetails(context, item),
              ),
            ),
            Expanded(
              child: ScreenList(
                children: [
                  Row(
                    children: [
                      item.photo != null
                          ? PhotoCircle(asset: item.photo, size: 128, ring: 6)
                          : TintIcon(item.icon, tone: item.tone, size: 128),
                      const SizedBox(width: 18),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              item.name.of(context),
                              style: text.headlineSmall?.copyWith(
                                color: JColors.navy,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              l.installedOn(
                                fullDate(context, item.installedOn),
                              ),
                              style: text.bodyMedium,
                            ),
                            const SizedBox(height: 8),
                            openRequest == null
                                ? StatusPill(l.workingWell, tone: Tone.lime)
                                : StatusPill(l.requestOpen, tone: Tone.pink),
                          ],
                        ),
                      ),
                    ],
                  ),
                  Row(
                    children: [
                      _KeyDate(
                        value: l.monthsShort(item.warrantyMonthsLeft),
                        label: l.warrantyLeft,
                      ),
                      const SizedBox(width: 10),
                      _KeyDate(
                        value: item.lastService == null
                            ? '—'
                            : dayMonth(context, item.lastService!),
                        label: l.lastService,
                      ),
                      const SizedBox(width: 10),
                      _KeyDate(
                        value: item.nextVisit == null
                            ? '—'
                            : dayMonth(context, item.nextVisit!),
                        label: l.nextVisit,
                      ),
                    ],
                  ),
                  if (item.maintenance.isNotEmpty)
                    JCard(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          SectionTitle(l.maintenance),
                          const SizedBox(height: 16),
                          Timeline(
                            items: [
                              for (final step in item.maintenance)
                                _timelineItem(context, store, step),
                            ],
                          ),
                        ],
                      ),
                    ),
                  JCard(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 20,
                      vertical: 4,
                    ),
                    child: DividedColumn(
                      children: [
                        ListRow(
                          leading: const TintIcon(
                            Icons.edit_note,
                            tone: Tone.lime,
                            size: 44,
                          ),
                          title: l.maintenanceLog,
                          trailing: const Icon(Icons.chevron_right),
                          onTap: () => push(
                            context,
                            MaintenanceLogScreen(equipmentId: item.id),
                          ),
                        ),
                        ListRow(
                          leading: const TintIcon(
                            Icons.folder_outlined,
                            tone: Tone.blue,
                            size: 44,
                          ),
                          title: l.myDocuments,
                          trailing: const Icon(Icons.chevron_right),
                          onTap: () => push(context, const DocumentsScreen()),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: BottomActionBar(
        children: [
          OutlinedButton(
            style: OutlinedButton.styleFrom(
              foregroundColor: JColors.magenta,
              side: const BorderSide(color: JColors.magenta, width: 1.5),
            ),
            onPressed: () =>
                push(context, ReportProblemScreen(equipmentId: item.id)),
            child: Text(l.reportProblem, textAlign: TextAlign.center),
          ),
          FilledButton(
            onPressed: () => _bookService(context, item),
            child: Text(l.bookService, textAlign: TextAlign.center),
          ),
        ],
      ),
    );
  }

  TimelineItem _timelineItem(
    BuildContext context,
    JogooStore store,
    MaintenanceStep step,
  ) {
    final l = AppLocalizations.of(context);
    final date = shortDate(context, step.date);
    return switch (step.state) {
      TimelineState.done => TimelineItem(
        title: step.title.of(context),
        subtitle: l.doneOn(dayMonth(context, step.date)),
        state: TimelineMarker.done,
      ),
      TimelineState.current => TimelineItem(
        title: step.title.of(context),
        subtitle: step.note == null ? date : '$date, ${step.note!.of(context)}',
        state: TimelineMarker.current,
      ),
      TimelineState.due => TimelineItem(
        title: step.title.of(context),
        subtitle: step.price == null
            ? l.dueOn(dayMonth(context, step.date))
            : '${l.dueOn(dayMonth(context, step.date))} · '
                  '${formatAmount(step.price!)} F',
        subtitleColor: JColors.brown,
        state: TimelineMarker.due,
        trailing: step.partCode == null
            ? null
            : FilledButton(
                onPressed: () => _orderPart(context, store, step.partCode!),
                child: Text(l.order),
              ),
      ),
      TimelineState.pending => TimelineItem(
        title: step.title.of(context),
        subtitle: date,
        state: TimelineMarker.pending,
      ),
    };
  }

  void _orderPart(BuildContext context, JogooStore store, String code) {
    final l = AppLocalizations.of(context);
    final part = store.partByCode(code);
    if (part == null) return;
    store.addToCart(
      CartLine(id: part.code, title: part.name, unitPrice: part.price),
    );
    showJogooToast(context, l.addedToCart, part.name.of(context));
  }

  Future<void> _bookService(BuildContext context, Equipment item) async {
    final l = AppLocalizations.of(context);
    final store = JogooScope.read(context);
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(l.bookService),
        content: Text(l.bookServiceBody(item.name.of(context))),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: Text(l.cancel),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            child: Text(l.bookService),
          ),
        ],
      ),
    );
    if (confirmed != true || !context.mounted) return;
    store.requestFromSales(
      Bi(
        'Service visit: ${item.name.en}',
        'Visite d\'entretien : ${item.name.fr}',
      ),
    );
    await contactJogooAbout(
      context,
      title: l.visitRequestedTitle,
      body: l.visitRequestedBody,
      message: l.waServiceVisit(item.name.of(context)),
    );
  }

  void _copyDetails(BuildContext context, Equipment item) {
    final l = AppLocalizations.of(context);
    Clipboard.setData(
      ClipboardData(
        text:
            '${item.name.of(context)} · ${item.serial} · '
            '${l.installedOn(fullDate(context, item.installedOn))}',
      ),
    );
    showJogooToast(context, l.detailsCopied);
  }
}

class _KeyDate extends StatelessWidget {
  const _KeyDate({required this.value, required this.label});

  final String value;
  final String label;

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;
    return Expanded(
      child: JCard(
        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
        child: Column(
          children: [
            Text(value, style: text.titleLarge, maxLines: 1),
            const SizedBox(height: 4),
            Text(
              label,
              style: text.bodySmall,
              textAlign: TextAlign.center,
              maxLines: 2,
            ),
          ],
        ),
      ),
    );
  }
}

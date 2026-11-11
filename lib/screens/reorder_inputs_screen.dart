import 'package:flutter/material.dart';

import '../app/shell.dart';
import '../app/theme.dart';
import '../data/jogoo_store.dart';
import '../generated/l10n/app_localizations.dart';
import '../models/models.dart';
import '../utils/format.dart';
import '../utils/actions.dart';
import '../widgets/jogoo_widgets.dart';

/// Screen 12: fertiliser and inputs reordered in one tap.
class ReorderInputsScreen extends StatefulWidget {
  const ReorderInputsScreen({super.key});

  @override
  State<ReorderInputsScreen> createState() => _ReorderInputsScreenState();
}

class _ReorderInputsScreenState extends State<ReorderInputsScreen> {
  late final int _recommended = JogooScope.read(context).recommendedBags();
  late int _bags = _recommended;
  final Set<String> _added = {};

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    final store = JogooScope.of(context);
    final input = store.usualInput;
    final text = Theme.of(context).textTheme;
    final area = decimalTrim(context, store.profile.areaHa);

    return TabChildScaffold(
      tab: AppTab.shop,
      body: Column(
        children: [
          ScreenHeader(title: l.reorderTitle, subtitle: l.sizedFor(area)),
          Expanded(
            child: ScreenList(
              children: [
                JCard(
                  padding: const EdgeInsets.fromLTRB(20, 20, 20, 22),
                  child: Column(
                    children: [
                      StatusPill(l.yourUsualOrder, tone: Tone.lime),
                      const SizedBox(height: 16),
                      TintIcon(input.icon, tone: input.tone, size: 112),
                      const SizedBox(height: 16),
                      Text(
                        input.name.of(context),
                        textAlign: TextAlign.center,
                        style: text.titleLarge?.copyWith(color: JColors.navy),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        [
                          input.note.of(context),
                          if (input.lastBought != null)
                            l.lastBought(dayMonth(context, input.lastBought!)),
                        ].join(' · '),
                        textAlign: TextAlign.center,
                        style: text.bodyMedium,
                      ),
                      const SizedBox(height: 14),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          _StepButton(
                            icon: Icons.remove,
                            tooltip: l.fewerBags,
                            onPressed: _bags > 1
                                ? () => setState(() => _bags--)
                                : null,
                          ),
                          SizedBox(
                            width: 140,
                            child: Text(
                              l.bags(_bags),
                              textAlign: TextAlign.center,
                              style: text.headlineSmall,
                            ),
                          ),
                          _StepButton(
                            icon: Icons.add,
                            tooltip: l.moreBags,
                            onPressed: _bags < 99
                                ? () => setState(() => _bags++)
                                : null,
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Text(
                        l.recommendedFor(area),
                        style: const TextStyle(
                          color: JColors.olive,
                          fontWeight: FontWeight.w700,
                          fontSize: 13.5,
                        ),
                      ),
                      const SizedBox(height: 16),
                      SizedBox(
                        width: double.infinity,
                        child: FilledButton(
                          onPressed: () => _reorder(context, input),
                          child: Text(l.reorderOneTap),
                        ),
                      ),
                    ],
                  ),
                ),
                JCard(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 4,
                  ),
                  child: DividedColumn(
                    children: [
                      for (final other in store.otherInputs)
                        ListRow(
                          leading: TintIcon(
                            other.icon,
                            tone: other.tone,
                            size: 52,
                          ),
                          title: other.name.of(context),
                          subtitle: other.lastBought == null
                              ? other.note.of(context)
                              : other.note
                                    .of(context)
                                    .replaceAll(
                                      '{date}',
                                      dayMonth(context, other.lastBought!),
                                    ),
                          trailing: _added.contains(other.id)
                              ? StatusPill(l.added, tone: Tone.lime)
                              : OutlinedButton(
                                  onPressed: () => _addOther(other),
                                  child: Text(l.add),
                                ),
                        ),
                    ],
                  ),
                ),
                JCard(
                  padding: const EdgeInsets.fromLTRB(20, 6, 12, 6),
                  child: SwitchListTile(
                    contentPadding: EdgeInsets.zero,
                    title: Text(l.remindBeforeSeason, style: text.titleSmall),
                    value: store.seasonReminder,
                    onChanged: (value) => store.seasonReminder = value,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _reorder(BuildContext context, FarmInput input) {
    final l = AppLocalizations.of(context);
    JogooScope.read(context).requestFromSales(
      Bi(
        'Reorder: ${input.name.en} × $_bags',
        'Réassort : ${input.name.fr} × $_bags',
      ),
    );
    contactJogooAbout(
      context,
      title: l.reorderSavedTitle,
      body: '${l.bags(_bags)} · ${input.name.of(context)}',
      message: l.waReorder(l.bags(_bags), input.name.of(context)),
    );
  }

  void _addOther(FarmInput input) {
    final l = AppLocalizations.of(context);
    JogooScope.read(context).requestFromSales(
      Bi(
        'Input request: ${input.name.en}',
        "Demande d'intrant : ${input.name.fr}",
      ),
    );
    setState(() => _added.add(input.id));
    contactJogooAbout(
      context,
      title: l.requestPriceTitle,
      body: l.requestPriceBody(input.name.of(context)),
      message: l.waPriceRequest(input.name.of(context)),
    );
  }
}

class _StepButton extends StatelessWidget {
  const _StepButton({
    required this.icon,
    required this.tooltip,
    required this.onPressed,
  });

  final IconData icon;
  final String tooltip;
  final VoidCallback? onPressed;

  @override
  Widget build(BuildContext context) {
    return Tooltip(
      message: tooltip,
      child: Material(
        shape: const CircleBorder(
          side: BorderSide(color: JColors.navy, width: 1.5),
        ),
        color: JColors.surface,
        child: InkWell(
          customBorder: const CircleBorder(),
          onTap: onPressed,
          child: SizedBox(
            width: 52,
            height: 52,
            child: Icon(
              icon,
              color: onPressed == null ? JColors.line : JColors.navy,
            ),
          ),
        ),
      ),
    );
  }
}

import 'package:flutter/material.dart';

import '../app/theme.dart';
import '../data/jogoo_store.dart';
import '../generated/l10n/app_localizations.dart';
import '../models/models.dart';
import '../utils/format.dart';
import '../widgets/jogoo_widgets.dart';

/// Screen 18: log a fertigation or a repair in seconds, even offline.
class NewLogEntryScreen extends StatefulWidget {
  const NewLogEntryScreen({super.key, required this.equipmentId});

  final String equipmentId;

  @override
  State<NewLogEntryScreen> createState() => _NewLogEntryScreenState();
}

class _NewLogEntryScreenState extends State<NewLogEntryScreen> {
  LogEntryType _type = LogEntryType.fertigation;
  DateTime _date = DateTime.now();
  late String _equipmentId = widget.equipmentId;
  final _product = TextEditingController(text: 'NPK 20-20-20');
  final _quantity = TextEditingController(text: '2 kg');
  final _water = TextEditingController(text: '200 L');
  final _work = TextEditingController();
  final Set<int> _checked = {};

  @override
  void dispose() {
    for (final c in [_product, _quantity, _water, _work]) {
      c.dispose();
    }
    super.dispose();
  }

  List<String> _checklist(AppLocalizations l) => switch (_type) {
    LogEntryType.fertigation => [
      l.checkFilterBeforeInjection,
      l.checkTankRinsed,
      l.checkLinesFlushed,
    ],
    LogEntryType.service => [
      l.checkFilterCleaned,
      l.checkPressure,
      l.checkLeaks,
    ],
    LogEntryType.partReplaced => [l.checkOldPartKept, l.checkSystemTested],
  };

  void _save() {
    final l = AppLocalizations.of(context);
    final store = JogooScope.read(context);
    final String title;
    switch (_type) {
      case LogEntryType.fertigation:
        if (_product.text.trim().isEmpty) {
          return _missing(l.product);
        }
        title = l.fertigationEntry(
          _product.text.trim(),
          _quantity.text.trim(),
          _water.text.trim(),
        );
      case LogEntryType.service:
        if (_work.text.trim().isEmpty) return _missing(l.workDone);
        title = _work.text.trim();
      case LogEntryType.partReplaced:
        if (_work.text.trim().isEmpty) return _missing(l.part);
        title = l.partReplacedEntry(_work.text.trim());
    }
    final checklist = _checklist(l);
    store.addLogEntry(
      LogEntry(
        id: 'local-${DateTime.now().microsecondsSinceEpoch}',
        equipmentId: _equipmentId,
        type: _type,
        title: Bi.same(title),
        date: _date,
        loggedBy: store.profile.clientName,
        synced: false,
        checklist: [for (final i in _checked) checklist[i]],
      ),
    );
    showJogooToast(context, l.entrySavedTitle, l.syncLater);
    Navigator.pop(context);
  }

  void _missing(String field) {
    final l = AppLocalizations.of(context);
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(SnackBar(content: Text(l.fillIn(field))));
  }

  Future<void> _pickDate() async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: _date,
      firstDate: now.subtract(const Duration(days: 365)),
      lastDate: now,
    );
    if (picked != null) setState(() => _date = picked);
  }

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    final store = JogooScope.of(context);
    final text = Theme.of(context).textTheme;
    final checklist = _checklist(l);

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            ScreenHeader(title: l.newEntry, close: true),
            Expanded(
              child: ScreenList(
                children: [
                  PillRow(
                    children: [
                      for (final (type, label) in [
                        (LogEntryType.service, l.entryService),
                        (LogEntryType.partReplaced, l.entryPartReplaced),
                        (LogEntryType.fertigation, l.entryFertigation),
                      ])
                        ChoicePill(
                          label: label,
                          selected: _type == type,
                          onTap: () => setState(() {
                            _type = type;
                            _checked.clear();
                          }),
                        ),
                    ],
                  ),
                  JCard(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 20,
                      vertical: 4,
                    ),
                    child: DividedColumn(
                      children: [
                        _FieldRow(
                          label: l.date,
                          child: InkWell(
                            onTap: _pickDate,
                            child: Text(
                              fullDate(context, _date),
                              textAlign: TextAlign.end,
                              style: text.titleSmall,
                            ),
                          ),
                        ),
                        _FieldRow(
                          label: l.equipment,
                          child: DropdownButtonHideUnderline(
                            child: DropdownButton<String>(
                              value: _equipmentId,
                              isExpanded: true,
                              alignment: AlignmentDirectional.centerEnd,
                              style: text.titleSmall,
                              items: [
                                for (final item in store.equipment)
                                  DropdownMenuItem(
                                    value: item.id,
                                    alignment: AlignmentDirectional.centerEnd,
                                    child: Text(item.name.of(context)),
                                  ),
                              ],
                              onChanged: (id) =>
                                  setState(() => _equipmentId = id!),
                            ),
                          ),
                        ),
                        if (_type == LogEntryType.fertigation) ...[
                          _FieldRow(
                            label: l.product,
                            child: _InlineField(controller: _product),
                          ),
                          _FieldRow(
                            label: l.quantity,
                            child: _InlineField(controller: _quantity),
                          ),
                          _FieldRow(
                            label: l.waterVolume,
                            child: _InlineField(controller: _water),
                          ),
                        ] else
                          _FieldRow(
                            label: _type == LogEntryType.service
                                ? l.workDone
                                : l.part,
                            child: _InlineField(
                              controller: _work,
                              hint: _type == LogEntryType.service
                                  ? l.workDoneHint
                                  : l.partHint,
                            ),
                          ),
                      ],
                    ),
                  ),
                  JCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(l.checklist, style: text.titleMedium),
                        const SizedBox(height: 4),
                        for (final (i, item) in checklist.indexed)
                          CheckboxListTile(
                            contentPadding: EdgeInsets.zero,
                            controlAffinity: ListTileControlAffinity.leading,
                            value: _checked.contains(i),
                            checkboxShape: const CircleBorder(),
                            activeColor: JColors.limeSoft,
                            checkColor: JColors.ink,
                            onChanged: (on) => setState(
                              () => on == true
                                  ? _checked.add(i)
                                  : _checked.remove(i),
                            ),
                            title: Text(
                              item,
                              style: text.titleSmall?.copyWith(
                                color: _checked.contains(i)
                                    ? JColors.ink
                                    : JColors.muted,
                              ),
                            ),
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
        footer: l.syncLater,
        children: [FilledButton(onPressed: _save, child: Text(l.saveOnPhone))],
      ),
    );
  }
}

class _FieldRow extends StatelessWidget {
  const _FieldRow({required this.label, required this.child});

  final String label;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 58,
      child: Row(
        children: [
          Text(label, style: Theme.of(context).textTheme.bodyLarge?.copyWith(
            color: JColors.muted,
          )),
          const SizedBox(width: 16),
          Expanded(child: child),
        ],
      ),
    );
  }
}

class _InlineField extends StatelessWidget {
  const _InlineField({required this.controller, this.hint});

  final TextEditingController controller;
  final String? hint;

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      textAlign: TextAlign.end,
      style: Theme.of(context).textTheme.titleSmall,
      decoration: InputDecoration(hintText: hint, isCollapsed: true),
    );
  }
}

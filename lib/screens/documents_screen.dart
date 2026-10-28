import 'package:flutter/material.dart';

import '../app/shell.dart';
import '../app/theme.dart';
import '../data/jogoo_store.dart';
import '../generated/l10n/app_localizations.dart';
import '../models/models.dart';
import '../utils/pdf_exports.dart';
import '../widgets/jogoo_widgets.dart';

enum _Filter { all, plans, electrical, warranty }

/// Screen 16: the as-built project vault, offline.
class DocumentsScreen extends StatefulWidget {
  const DocumentsScreen({super.key});

  @override
  State<DocumentsScreen> createState() => _DocumentsScreenState();
}

class _DocumentsScreenState extends State<DocumentsScreen> {
  _Filter _filter = _Filter.all;
  late final Set<String> _expanded = {
    JogooScope.read(context).equipment.first.id,
  };

  bool _matches(FarmDocument doc) => switch (_filter) {
    _Filter.all => true,
    _Filter.plans => doc.type == DocumentType.plan,
    _Filter.electrical => doc.type == DocumentType.electrical,
    _Filter.warranty => doc.type == DocumentType.warranty,
  };

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    final store = JogooScope.of(context);
    // Manuals live in the offline library; this vault is the project file.
    final docs = store.documents
        .where((d) => d.type != DocumentType.manual && _matches(d))
        .toList();

    return TabChildScaffold(
      tab: AppTab.farm,
      body: Column(
        children: [
          ScreenHeader(title: l.myDocuments, subtitle: l.documentsSubtitle),
          Expanded(
            child: ScreenList(
              children: [
                PillRow(
                  children: [
                    for (final (filter, label) in [
                      (_Filter.all, l.filterAll),
                      (_Filter.plans, l.filterPlans),
                      (_Filter.electrical, l.filterElectrical),
                      (_Filter.warranty, l.filterWarranty),
                    ])
                      ChoicePill(
                        label: label,
                        selected: _filter == filter,
                        onTap: () => setState(() => _filter = filter),
                      ),
                  ],
                ),
                for (final item in store.equipment)
                  if (docs.any((d) => d.equipmentId == item.id))
                    _EquipmentDocs(
                      equipment: item,
                      docs: docs.where((d) => d.equipmentId == item.id).toList(),
                      expanded: _expanded.contains(item.id),
                      onToggle: () => setState(
                        () => _expanded.contains(item.id)
                            ? _expanded.remove(item.id)
                            : _expanded.add(item.id),
                      ),
                    ),
                if (docs.isEmpty) JCard(child: Text(l.noDocuments)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _EquipmentDocs extends StatelessWidget {
  const _EquipmentDocs({
    required this.equipment,
    required this.docs,
    required this.expanded,
    required this.onToggle,
  });

  final Equipment equipment;
  final List<FarmDocument> docs;
  final bool expanded;
  final VoidCallback onToggle;

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    final text = Theme.of(context).textTheme;
    if (!expanded) {
      return JCard(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
        onTap: onToggle,
        child: ListRow(
          leading: TintIcon(equipment.icon, tone: equipment.tone, size: 52),
          title: equipment.name.of(context),
          subtitle: l.documentsCount(docs.length),
          trailing: const Icon(Icons.chevron_right),
        ),
      );
    }
    return JCard(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 4),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          InkWell(
            onTap: onToggle,
            child: Padding(
              padding: const EdgeInsets.only(bottom: 4),
              child: Row(
                children: [
                  Expanded(
                    child: Text(
                      equipment.name.of(context),
                      style: text.titleMedium,
                    ),
                  ),
                  const Icon(Icons.expand_less),
                ],
              ),
            ),
          ),
          DividedColumn(children: [for (final doc in docs) DocumentRow(doc)]),
        ],
      ),
    );
  }
}

/// One file with its offline state, shared with the offline library.
class DocumentRow extends StatelessWidget {
  const DocumentRow(
    this.doc, {
    super.key,
    this.onDownload,
    this.onOpen,
  });

  final FarmDocument doc;
  final VoidCallback? onDownload;
  final VoidCallback? onOpen;

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    final (icon, tone) = switch (doc.type) {
      DocumentType.plan => (Icons.map_outlined, Tone.blue),
      DocumentType.electrical => (Icons.bolt_outlined, Tone.orange),
      DocumentType.warranty => (Icons.verified_user_outlined, Tone.cyan),
      DocumentType.specification => (Icons.description_outlined, Tone.pink),
      DocumentType.manual => (Icons.menu_book_outlined, Tone.cyan),
    };
    return ListRow(
      leading: TintIcon(icon, tone: tone, size: 52),
      title: doc.title.of(context),
      subtitle: l.generatedDemoPdf,
      trailing: CircleButton(
        icon: Icons.download_outlined,
        tooltip: l.download,
        outlined: true,
        color: JColors.navy,
        size: 44,
        onPressed:
            onDownload ??
            () => downloadFarmDocument(
              context,
              doc,
              JogooScope.read(context).equipmentById(doc.equipmentId),
            ),
      ),
      onTap:
          onOpen ??
          () => previewFarmDocument(
            context,
            doc,
            JogooScope.read(context).equipmentById(doc.equipmentId),
          ),
    );
  }
}

import 'package:flutter/material.dart';

import '../app/shell.dart';
import '../app/theme.dart';
import '../data/jogoo_store.dart';
import '../generated/l10n/app_localizations.dart';
import '../models/models.dart';
import '../utils/format.dart';
import '../widgets/jogoo_widgets.dart';
import 'qr_scanner_screen.dart';

/// Screen 11: find the right part without knowing its name.
class SparePartsScreen extends StatefulWidget {
  const SparePartsScreen({super.key});

  @override
  State<SparePartsScreen> createState() => _SparePartsScreenState();
}

class _SparePartsScreenState extends State<SparePartsScreen> {
  final _serial = TextEditingController();
  late String _equipmentId = JogooScope.read(context).equipment.first.id;

  @override
  void dispose() {
    _serial.dispose();
    super.dispose();
  }

  void _find([String? scannedValue]) {
    final l = AppLocalizations.of(context);
    final store = JogooScope.read(context);
    final serial = (scannedValue ?? _serial.text).trim();
    if (serial.isEmpty) return;
    final match = _findEquipment(store.equipment, serial);
    FocusScope.of(context).unfocus();
    if (match == null) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(l.serialNotFound(serial))));
      return;
    }
    setState(() {
      _equipmentId = match.id;
      _serial.text = match.serial;
    });
    showJogooToast(context, l.serialFound(match.name.of(context)));
  }

  Equipment? _findEquipment(List<Equipment> equipment, String value) {
    final uri = Uri.tryParse(value);
    final code = uri == null
        ? value
        : uri.queryParameters['serial'] ??
              uri.queryParameters['id'] ??
              (uri.pathSegments.isEmpty ? value : uri.pathSegments.last);
    for (final item in equipment) {
      if (item.id.toLowerCase() == code.toLowerCase() ||
          item.serial.toUpperCase() == code.toUpperCase()) {
        return item;
      }
    }
    return null;
  }

  Future<void> _scanSticker() async {
    final value = await push<String>(context, const QrScannerScreen());
    if (!mounted || value == null) return;
    _find(value);
  }

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    final store = JogooScope.of(context);
    final parts = store.partsFor(_equipmentId);

    return TabChildScaffold(
      tab: AppTab.shop,
      body: Column(
        children: [
          ScreenHeader(title: l.partsTitle, subtitle: l.partsSubtitle),
          Expanded(
            child: ScreenList(
              children: [
                BrandCard(
                  blobSize: 170,
                  child: Column(
                    children: [
                      Row(
                        children: [
                          CircleButton(
                            icon: Icons.qr_code_2,
                            tooltip: l.scanSticker,
                            color: JColors.navy,
                            size: 60,
                            onPressed: _scanSticker,
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  l.scanSticker,
                                  style: const TextStyle(
                                    fontFamily: 'Poppins',
                                    fontWeight: FontWeight.w700,
                                    fontSize: 18,
                                    color: Colors.white,
                                    height: 1.2,
                                  ),
                                ),
                                Text(
                                  l.orTypeSerial,
                                  style: const TextStyle(
                                    color: Color(0xFFC9DBEC),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      Container(
                        height: 56,
                        padding: const EdgeInsets.only(left: 20, right: 6),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(999),
                        ),
                        child: Row(
                          children: [
                            Expanded(
                              child: TextField(
                                controller: _serial,
                                textCapitalization:
                                    TextCapitalization.characters,
                                textInputAction: TextInputAction.search,
                                onSubmitted: (_) => _find(),
                                style: const TextStyle(
                                  fontWeight: FontWeight.w600,
                                ),
                                decoration: const InputDecoration(
                                  hintText: 'DK2-0312',
                                  isCollapsed: true,
                                ),
                              ),
                            ),
                            FilledButton(
                              style: FilledButton.styleFrom(
                                backgroundColor: JColors.limeSoft,
                                foregroundColor: JColors.ink,
                                minimumSize: const Size(64, 44),
                              ),
                              onPressed: _find,
                              child: Text(l.find),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                PillRow(
                  children: [
                    for (final item in store.equipment)
                      ChoicePill(
                        label: item.shortName.of(context),
                        selected: item.id == _equipmentId,
                        onTap: () => setState(() => _equipmentId = item.id),
                      ),
                  ],
                ),
                JCard(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 4,
                  ),
                  child: DividedColumn(
                    children: [for (final part in parts) _PartRow(part: part)],
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

class _PartRow extends StatelessWidget {
  const _PartRow({required this.part});

  final SparePart part;

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    final store = JogooScope.of(context);
    final added = store.inCart(part.code);
    final due = part.dueOn;
    final details = [
      part.code,
      '${formatAmount(part.price)} F',
      if (due != null) l.dueOn(dayMonth(context, due)),
    ].join(' · ');

    return ListRow(
      leading: TintIcon(part.icon, tone: part.tone, size: 52),
      title: part.name.of(context),
      subtitle: details,
      subtitleColor: due != null ? JColors.brown : null,
      trailing: added
          ? CircleButton(
              icon: Icons.check,
              tooltip: l.addedToCart,
              background: JColors.limeTint,
              color: JColors.olive,
              size: 48,
              onPressed: null,
            )
          : CircleButton(
              icon: Icons.add,
              tooltip: l.addToCart,
              color: due != null ? JColors.ink : JColors.navy,
              background: due != null ? JColors.limeSoft : JColors.surface,
              size: 48,
              outlined: due == null,
              onPressed: () {
                store.addToCart(
                  CartLine(
                    id: part.code,
                    title: part.name,
                    unitPrice: part.price,
                  ),
                );
                showJogooToast(context, l.addedToCart, part.name.of(context));
              },
            ),
    );
  }
}

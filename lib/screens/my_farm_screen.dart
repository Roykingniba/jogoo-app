import 'package:flutter/material.dart';

import '../app/shell.dart';
import '../app/theme.dart';
import '../data/jogoo_store.dart';
import '../generated/l10n/app_localizations.dart';
import '../models/models.dart';
import '../utils/format.dart';
import '../widgets/jogoo_widgets.dart';
import 'delivery_screen.dart';
import 'documents_screen.dart';
import 'equipment_screen.dart';
import 'maintenance_log_screen.dart';

enum _FarmTab { equipment, orders, invoices }

/// Screen 02: all installations, orders and invoices after purchase.
class MyFarmScreen extends StatefulWidget {
  const MyFarmScreen({super.key});

  @override
  State<MyFarmScreen> createState() => _MyFarmScreenState();
}

class _MyFarmScreenState extends State<MyFarmScreen> {
  _FarmTab _tab = _FarmTab.equipment;

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    final store = JogooScope.of(context);
    final town = store.profile.location.split(',').first;

    return ListView(
      padding: const EdgeInsets.only(bottom: 24),
      children: [
        PageTitle(
          title: l.navMyFarm,
          subtitle: l.installationsAt(store.equipment.length, town),
          trailing: CircleButton(
            icon: Icons.add,
            tooltip: l.addEquipment,
            color: Colors.white,
            background: JColors.navy,
            size: 60,
            onPressed: () => _addEquipment(context),
          ),
        ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: PillRow(
            children: [
              for (final (tab, label) in [
                (_FarmTab.equipment, l.tabEquipment),
                (_FarmTab.orders, l.tabOrders),
                (_FarmTab.invoices, l.tabInvoices),
              ])
                ChoicePill(
                  label: label,
                  selected: _tab == tab,
                  onTap: () => setState(() => _tab = tab),
                ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: switch (_tab) {
            _FarmTab.equipment => const _EquipmentTab(),
            _FarmTab.orders => const _OrdersTab(),
            _FarmTab.invoices => const _InvoicesTab(),
          },
        ),
      ],
    );
  }

  Future<void> _addEquipment(BuildContext context) async {
    final l = AppLocalizations.of(context);
    final store = JogooScope.read(context);
    final controller = TextEditingController();
    final text = await showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(l.addEquipment),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(l.addEquipmentBody),
            const SizedBox(height: 12),
            TextField(
              controller: controller,
              autofocus: true,
              decoration: InputDecoration(
                hintText: l.addEquipmentHint,
                border: const OutlineInputBorder(),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(l.cancel),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, controller.text.trim()),
            child: Text(l.send),
          ),
        ],
      ),
    );
    controller.dispose();
    if (text == null || text.isEmpty || !context.mounted) return;
    store.requestFromSales(Bi('New equipment: $text', 'Nouvel équipement : $text'));
    showJogooToast(context, l.addEquipmentSavedTitle, l.addEquipmentSavedBody);
  }
}

class _EquipmentTab extends StatelessWidget {
  const _EquipmentTab();

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    final store = JogooScope.of(context);
    const barColors = [JColors.olive, JColors.navy, JColors.magenta];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        JCard(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
          child: DividedColumn(
            children: [
              for (final item in store.equipment)
                ListRow(
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  leading: item.photo != null
                      ? PhotoCircle(asset: item.photo, size: 60)
                      : TintIcon(item.icon, tone: item.tone, size: 60),
                  title: item.name.of(context),
                  subtitle: item.healthNote.of(context),
                  trailing: HealthPill(item.health),
                  onTap: () =>
                      push(context, EquipmentScreen(equipmentId: item.id)),
                ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        JCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              SectionTitle(l.warrantyLeft),
              for (var i = 0; i < store.equipment.length; i++) ...[
                const SizedBox(height: 14),
                _WarrantyBar(
                  equipment: store.equipment[i],
                  color: barColors[i % barColors.length],
                ),
              ],
            ],
          ),
        ),
        const SizedBox(height: 16),
        JCard(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 4),
          child: DividedColumn(
            children: [
              ListRow(
                leading: const TintIcon(
                  Icons.folder_outlined,
                  tone: Tone.blue,
                  size: 48,
                ),
                title: l.myDocuments,
                subtitle: l.documentsSubtitle,
                trailing: const Icon(Icons.chevron_right),
                onTap: () => push(context, const DocumentsScreen()),
              ),
              ListRow(
                leading: const TintIcon(
                  Icons.edit_note,
                  tone: Tone.lime,
                  size: 48,
                ),
                title: l.maintenanceLog,
                subtitle: store.equipment.first.name.of(context),
                trailing: const Icon(Icons.chevron_right),
                onTap: () => push(
                  context,
                  MaintenanceLogScreen(equipmentId: store.equipment.first.id),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _WarrantyBar extends StatelessWidget {
  const _WarrantyBar({required this.equipment, required this.color});

  final Equipment equipment;
  final Color color;

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    final text = Theme.of(context).textTheme;
    final share = equipment.warrantyMonthsLeft / equipment.warrantyMonths;
    return Semantics(
      label:
          '${equipment.shortName.of(context)}: '
          '${l.monthsOf(equipment.warrantyMonthsLeft, equipment.warrantyMonths)}',
      child: ExcludeSemantics(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    equipment.shortName.of(context),
                    style: text.titleSmall,
                  ),
                ),
                Text(
                  l.monthsOf(
                    equipment.warrantyMonthsLeft,
                    equipment.warrantyMonths,
                  ),
                  style: text.bodyMedium,
                ),
              ],
            ),
            const SizedBox(height: 8),
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: LinearProgressIndicator(
                value: share.clamp(0, 1),
                minHeight: 12,
                color: color,
                backgroundColor: JColors.chip,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Good / Open / Due soon, shared with the equipment detail screen.
class HealthPill extends StatelessWidget {
  const HealthPill(this.health, {super.key});

  final EquipmentHealth health;

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    return switch (health) {
      EquipmentHealth.good => StatusPill(l.statusGood, tone: Tone.lime),
      EquipmentHealth.open => StatusPill(l.statusOpen, tone: Tone.pink),
      EquipmentHealth.dueSoon => StatusPill(l.statusDueSoon, tone: Tone.orange),
    };
  }
}

class _OrdersTab extends StatelessWidget {
  const _OrdersTab();

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    final store = JogooScope.of(context);
    return JCard(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
      child: DividedColumn(
        children: [
          for (final order in store.orders)
            ListRow(
              padding: const EdgeInsets.symmetric(vertical: 14),
              leading: TintIcon(
                order.delivered
                    ? Icons.inventory_2_outlined
                    : Icons.local_shipping_outlined,
                tone: order.delivered ? Tone.lime : Tone.cyan,
                size: 52,
              ),
              title: order.item.of(context),
              subtitle:
                  '${order.id} · ${fullDate(context, order.orderedOn)} · '
                  '${formatAmount(order.total)} F',
              trailing: order.delivered
                  ? StatusPill(l.orderDelivered, tone: Tone.lime)
                  : StatusPill(l.orderOnTheRoad, tone: Tone.cyan),
              onTap: order.delivered
                  ? null
                  : () => push(context, DeliveryScreen(orderId: order.id)),
            ),
        ],
      ),
    );
  }
}

class _InvoicesTab extends StatelessWidget {
  const _InvoicesTab();

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    final store = JogooScope.of(context);
    return JCard(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
      child: DividedColumn(
        children: [
          for (final invoice in store.invoices)
            ListRow(
              padding: const EdgeInsets.symmetric(vertical: 14),
              leading: const TintIcon(
                Icons.receipt_long_outlined,
                tone: Tone.blue,
                size: 52,
              ),
              title: invoice.title.of(context),
              subtitle:
                  '${invoice.id} · ${fullDate(context, invoice.issuedOn)}',
              trailing: Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    '${formatAmount(invoice.amount)} F',
                    style: Theme.of(context).textTheme.titleSmall,
                  ),
                  const SizedBox(height: 4),
                  invoice.paid
                      ? StatusPill(l.invoicePaid, tone: Tone.lime)
                      : StatusPill(l.invoiceDue, tone: Tone.orange),
                ],
              ),
            ),
        ],
      ),
    );
  }
}

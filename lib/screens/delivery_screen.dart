import 'package:flutter/material.dart';

import '../app/theme.dart';
import '../data/jogoo_store.dart';
import '../generated/l10n/app_localizations.dart';
import '../models/models.dart';
import '../utils/actions.dart';
import '../utils/format.dart';
import '../widgets/jogoo_widgets.dart';

/// Screen 13: from the hub to the farm gate.
class DeliveryScreen extends StatelessWidget {
  const DeliveryScreen({super.key, required this.orderId});

  final String orderId;

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    final order = JogooScope.of(context).orderById(orderId);
    final current = order.steps.indexWhere((s) => !s.done);

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            ScreenHeader(
              title: l.orderTitle(order.id),
              subtitle: order.item.of(context),
            ),
            Expanded(
              child: ScreenList(
                children: [
                  BrandCard(
                    blobSize: 190,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          l.arriving.toUpperCase(),
                          style: const TextStyle(
                            color: Color(0xFFC9DBEC),
                            fontWeight: FontWeight.w700,
                            letterSpacing: 1.2,
                            fontSize: 12.5,
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          order.arrivalWindow?.of(context) ?? '—',
                          style: const TextStyle(
                            fontFamily: 'Poppins',
                            fontWeight: FontWeight.w700,
                            fontSize: 24,
                            color: Colors.white,
                            height: 1.2,
                          ),
                        ),
                        if (order.dropOff != null)
                          Text(
                            l.dropOffPoint(order.dropOff!),
                            style: const TextStyle(color: Color(0xFFC9DBEC)),
                          ),
                        if (order.collectionCode != null) ...[
                          const SizedBox(height: 18),
                          _CollectionCode(code: order.collectionCode!),
                        ],
                      ],
                    ),
                  ),
                  JCard(
                    child: Timeline(
                      items: [
                        for (final (i, step) in order.steps.indexed)
                          TimelineItem(
                            title: step.title.of(context),
                            subtitle: [
                              if (step.at != null)
                                dayMonthTime(context, step.at!),
                              ?step.note?.of(context),
                            ].join(' · '),
                            state: step.done
                                ? TimelineMarker.done
                                : i == current
                                ? TimelineMarker.current
                                : TimelineMarker.pending,
                            icon: i == current
                                ? Icons.local_shipping_outlined
                                : null,
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
            onPressed: () => _changeDropOff(context, order),
            child: Text(l.changeDropOff, textAlign: TextAlign.center),
          ),
          FilledButton(
            onPressed: order.driver == null
                ? null
                : () => callNumber(context, order.driver!.phone),
            child: Text(l.callDriver, textAlign: TextAlign.center),
          ),
        ],
      ),
    );
  }

  void _changeDropOff(BuildContext context, Order order) {
    final l = AppLocalizations.of(context);
    JogooScope.read(context).requestFromSales(
      Bi('Change drop-off for ${order.id}', 'Changer le retrait de ${order.id}'),
    );
    showJogooToast(context, l.dropOffChangeTitle, l.dropOffChangeBody);
  }
}

class _CollectionCode extends StatelessWidget {
  const _CollectionCode({required this.code});

  final String code;

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 12, 10, 12),
      decoration: BoxDecoration(
        color: const Color(0x26FFFFFF),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  l.collectionCode,
                  style: const TextStyle(
                    color: Color(0xFFC9DBEC),
                    fontSize: 13,
                  ),
                ),
                Text(
                  code.split('').join(' '),
                  semanticsLabel: code,
                  style: const TextStyle(
                    fontFamily: 'Poppins',
                    fontWeight: FontWeight.w700,
                    fontSize: 28,
                    letterSpacing: 4,
                    color: Colors.white,
                  ),
                ),
              ],
            ),
          ),
          CircleButton(
            icon: Icons.qr_code_2,
            tooltip: l.showCode,
            color: JColors.navy,
            size: 56,
            onPressed: () => _showLargeCode(context),
          ),
        ],
      ),
    );
  }

  /// Big, high-contrast code for showing to the driver in bright sun.
  void _showLargeCode(BuildContext context) {
    final l = AppLocalizations.of(context);
    showDialog<void>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(l.collectionCode, textAlign: TextAlign.center),
        content: Text(
          code,
          textAlign: TextAlign.center,
          style: const TextStyle(
            fontFamily: 'Poppins',
            fontWeight: FontWeight.w700,
            fontSize: 56,
            letterSpacing: 10,
            color: JColors.navy,
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(l.close),
          ),
        ],
      ),
    );
  }
}

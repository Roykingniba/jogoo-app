import 'package:flutter/material.dart';

import '../app/shell.dart';
import '../app/theme.dart';
import '../data/demo_data.dart';
import '../data/jogoo_store.dart';
import '../generated/l10n/app_localizations.dart';
import '../models/models.dart';
import '../utils/actions.dart';
import '../utils/format.dart';
import '../widgets/jogoo_widgets.dart';
import 'agronomist_screen.dart';
import 'report_problem_screen.dart';
import 'service_request_screen.dart';

/// Screen 08: after-sales support hub.
class ServiceScreen extends StatelessWidget {
  const ServiceScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    final store = JogooScope.of(context);
    final open = store.openRequestCount;

    return ListView(
      padding: const EdgeInsets.only(bottom: 24),
      children: [
        PageTitle(title: l.navService, subtitle: l.serviceHours),
        const ExampleBanner(),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              JCard(
                padding: const EdgeInsets.symmetric(
                  horizontal: 8,
                  vertical: 16,
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: RoundShortcut(
                        label: l.actionReport,
                        icon: Icons.error_outline,
                        tone: Tone.pink,
                        onTap: () => push(context, const ReportProblemScreen()),
                      ),
                    ),
                    Expanded(
                      child: RoundShortcut(
                        label: l.actionBookVisit,
                        icon: Icons.calendar_month_outlined,
                        tone: Tone.blue,
                        onTap: () => bookVisit(context),
                      ),
                    ),
                    Expanded(
                      child: RoundShortcut(
                        label: l.actionWarranty,
                        icon: Icons.verified_user_outlined,
                        tone: Tone.cyan,
                        onTap: () => _showWarranty(context),
                      ),
                    ),
                    Expanded(
                      child: RoundShortcut(
                        label: 'WhatsApp',
                        icon: Icons.chat_bubble_outline,
                        tone: Tone.lime,
                        onTap: () => openWhatsApp(context),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              JCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    SectionTitle(
                      l.myRequests,
                      trailing: open == 0
                          ? null
                          : StatusPill(l.openCount(open), tone: Tone.pink),
                    ),
                    const SizedBox(height: 8),
                    DividedColumn(
                      children: [
                        for (final request in store.serviceRequests)
                          _RequestRow(request: request),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              JCard(
                padding: const EdgeInsets.symmetric(
                  horizontal: 20,
                  vertical: 6,
                ),
                onTap: () => push(context, const AgronomistScreen()),
                child: ListRow(
                  leading: const TintIcon(
                    Icons.spa_outlined,
                    tone: Tone.lime,
                    size: 52,
                  ),
                  title: l.agronomistsTitle,
                  subtitle: l.repliesWeekdays,
                  trailing: const Icon(Icons.chevron_right),
                ),
              ),
              const SizedBox(height: 16),
              JCard(
                padding: const EdgeInsets.symmetric(
                  horizontal: 20,
                  vertical: 6,
                ),
                onTap: () => callJogoo(context),
                child: ListRow(
                  leading: Container(
                    width: 56,
                    height: 56,
                    decoration: const BoxDecoration(
                      color: JColors.limeSoft,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.call_outlined, color: JColors.ink),
                  ),
                  title: l.callJogooCameroon,
                  subtitle: DemoData.jogooPhoneDisplay,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  void _showWarranty(BuildContext context) {
    showModalBottomSheet<void>(
      context: context,
      builder: (context) {
        final l = AppLocalizations.of(context);
        final store = JogooScope.of(context);
        final text = Theme.of(context).textTheme;
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(l.actionWarranty, style: text.titleLarge),
                const SizedBox(height: 8),
                for (final item in store.equipment)
                  ListRow(
                    leading: Icon(
                      item.underWarranty
                          ? Icons.verified_user_outlined
                          : Icons.gpp_maybe_outlined,
                      color: item.underWarranty ? JColors.olive : JColors.brown,
                    ),
                    title: item.name.of(context),
                    subtitle: item.underWarranty
                        ? l.monthsOf(
                            item.warrantyMonthsLeft,
                            item.warrantyMonths,
                          )
                        : l.warrantyEnded,
                  ),
                const SizedBox(height: 8),
                Text(l.warrantyNote, style: text.bodyMedium),
              ],
            ),
          ),
        );
      },
    );
  }
}

/// Asks which installation needs a visit, then passes it to JOGOO.
Future<void> bookVisit(BuildContext context) async {
  final l = AppLocalizations.of(context);
  final store = JogooScope.read(context);
  final chosen = await showModalBottomSheet<Equipment>(
    context: context,
    builder: (context) => SafeArea(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(20, 0, 20, 16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              l.bookVisitTitle,
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 4),
            Text(l.bookVisitBody),
            const SizedBox(height: 8),
            for (final item in store.equipment)
              ListRow(
                leading: TintIcon(item.icon, tone: item.tone, size: 44),
                title: item.name.of(context),
                trailing: const Icon(Icons.chevron_right),
                onTap: () => Navigator.pop(context, item),
              ),
          ],
        ),
      ),
    ),
  );
  if (chosen == null || !context.mounted) return;
  store.requestFromSales(
    Bi(
      'Service visit: ${chosen.name.en}',
      "Visite d'entretien : ${chosen.name.fr}",
    ),
  );
  await contactJogooAbout(
    context,
    title: l.visitRequestedTitle,
    body: l.visitRequestedBody,
    message: l.waServiceVisit(chosen.name.of(context)),
  );
}

class _RequestRow extends StatelessWidget {
  const _RequestRow({required this.request});

  final ServiceRequest request;

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    final store = JogooScope.read(context);
    void openRequest() =>
        push(context, ServiceRequestScreen(requestId: request.id));

    if (request.isOpen) {
      return ListRow(
        leading: InitialsAvatar(
          request.technician == null
              ? request.id.substring(3)
              : initials(request.technician!.name),
          size: 56,
        ),
        title: request.title.of(context),
        subtitle: request.visitAt == null
            ? l.visitToBeScheduled
            : l.visitOn(shortDate(context, request.visitAt!)),
        trailing: FilledButton(onPressed: openRequest, child: Text(l.open)),
        onTap: openRequest,
      );
    }
    return ListRow(
      leading: Container(
        width: 56,
        height: 56,
        decoration: const BoxDecoration(
          color: JColors.olive,
          shape: BoxShape.circle,
        ),
        child: const Icon(Icons.check, color: Colors.white),
      ),
      title: request.title.of(context),
      subtitle: l.resolvedOn(dayMonth(context, request.resolvedOn!)),
      trailing: request.rating != null
          ? StatusPill('★ ${request.rating}', tone: Tone.lime)
          : OutlinedButton(
              onPressed: () async {
                final rating = await _askRating(context);
                if (rating != null) store.rateRequest(request.id, rating);
              },
              child: Text(l.rate),
            ),
      onTap: openRequest,
    );
  }

  Future<int?> _askRating(BuildContext context) {
    final l = AppLocalizations.of(context);
    return showDialog<int>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(l.rateTitle),
        content: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            for (var stars = 1; stars <= 5; stars++)
              IconButton(
                tooltip: l.starsLabel(stars),
                iconSize: 36,
                color: JColors.orange,
                icon: const Icon(Icons.star_rounded),
                onPressed: () => Navigator.pop(context, stars),
              ),
          ],
        ),
      ),
    );
  }
}

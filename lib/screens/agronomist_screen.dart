import 'package:flutter/material.dart';

import '../app/theme.dart';
import '../data/demo_data.dart';
import '../data/jogoo_store.dart';
import '../generated/l10n/app_localizations.dart';
import '../models/models.dart';
import '../utils/format.dart';
import '../widgets/chat_widgets.dart';
import '../utils/actions.dart';
import '../widgets/jogoo_widgets.dart';

/// Screen 15: advice from the JOGOO engineering team.
class AgronomistScreen extends StatefulWidget {
  const AgronomistScreen({super.key});

  @override
  State<AgronomistScreen> createState() => _AgronomistScreenState();
}

class _AgronomistScreenState extends State<AgronomistScreen> {
  final _input = TextEditingController();

  @override
  void dispose() {
    _input.dispose();
    super.dispose();
  }

  void _send() {
    final l = AppLocalizations.of(context);
    final text = _input.text.trim();
    if (text.isEmpty) return;
    JogooScope.read(context).sendToAgronomists(text);
    _input.clear();
    contactJogooAbout(
      context,
      title: l.messageSavedTitle,
      body: l.messageSavedBody,
      message: l.waAgronomist(text),
    );
  }

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    final store = JogooScope.of(context);
    final text = Theme.of(context).textTheme;

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            ScreenHeader(
              title: l.agronomistsTitle,
              subtitle: l.repliesWeekdays,
              leading: Container(
                width: 56,
                height: 56,
                decoration: const BoxDecoration(
                  color: JColors.olive,
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.spa_outlined, color: Colors.white),
              ),
            ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(16, 4, 16, 16),
                children: [
                  JCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        SectionTitle(
                          l.wateringPlanThisWeek,
                          trailing: StatusPill(
                            l.updatedOn(
                              dayMonth(context, DemoData.wateringPlanUpdated),
                            ),
                            tone: Tone.cyan,
                          ),
                        ),
                        const SizedBox(height: 8),
                        for (final plot in DemoData.wateringPlan)
                          ListRow(
                            padding: const EdgeInsets.symmetric(vertical: 8),
                            leading: Container(
                              width: 48,
                              height: 48,
                              alignment: Alignment.center,
                              decoration: BoxDecoration(
                                color: plot.tone.background,
                                shape: BoxShape.circle,
                              ),
                              child: Text(
                                plot.badge,
                                style: text.titleSmall?.copyWith(
                                  color: plot.tone.foreground,
                                ),
                              ),
                            ),
                            title: plot.name.of(context),
                            subtitle: plot.schedule.of(context),
                          ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  for (final message in store.agronomistChat)
                    ChatBubble(message: message),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 4, 16, 0),
              child: SizedBox(
                width: double.infinity,
                child: OutlinedButton(
                  onPressed: () => _bookFieldVisit(context),
                  child: Text(l.bookFieldVisit),
                ),
              ),
            ),
            ChatInputBar(
              controller: _input,
              hint: l.askTheAgronomists,
              onSend: _send,
            ),
          ],
        ),
      ),
    );
  }

  void _bookFieldVisit(BuildContext context) {
    final l = AppLocalizations.of(context);
    JogooScope.read(context).requestFromSales(
      const Bi('Agronomist field visit', 'Visite terrain agronome'),
    );
    contactJogooAbout(
      context,
      title: l.fieldVisitTitle,
      body: l.fieldVisitBody,
      message: l.waFieldVisit,
    );
  }
}

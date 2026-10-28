import 'package:flutter/material.dart';

import '../app/shell.dart';
import '../app/theme.dart';
import '../data/jogoo_store.dart';
import '../generated/l10n/app_localizations.dart';
import '../models/models.dart';
import '../utils/format.dart';
import '../widgets/jogoo_widgets.dart';

/// Screen 10: who the client is and what they want this season.
class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    final store = JogooScope.of(context);
    final profile = store.profile;
    final text = Theme.of(context).textTheme;
    const cropTones = [Tone.pink, Tone.orange, Tone.lime, Tone.blue];

    return TabChildScaffold(
      tab: null,
      body: ListView(
        padding: const EdgeInsets.only(bottom: 24),
        children: [
          SizedBox(
            height: 250,
            child: Stack(
              children: [
                Positioned(
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 170,
                  child: ClipRect(
                    child: ColoredBox(
                      color: JColors.navy,
                      child: Stack(
                        children: [
                          Positioned(
                            right: -70,
                            top: -120,
                            child: Container(
                              width: 260,
                              height: 260,
                              decoration: const BoxDecoration(
                                color: JColors.lime,
                                shape: BoxShape.circle,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                Positioned(
                  left: 16,
                  top: 12,
                  child: Row(
                    children: [
                      CircleButton(
                        icon: Icons.chevron_left,
                        tooltip: l.back,
                        color: Colors.white,
                        background: const Color(0x33FFFFFF),
                        size: 48,
                        onPressed: () => Navigator.maybePop(context),
                      ),
                      const SizedBox(width: 12),
                      const _LanguageToggle(),
                    ],
                  ),
                ),
                Positioned(
                  left: 0,
                  right: 0,
                  top: 110,
                  child: Center(
                    child: InitialsAvatar(
                      initials(profile.clientName),
                      size: 128,
                      color: JColors.magenta,
                      borderColor: JColors.background,
                    ),
                  ),
                ),
              ],
            ),
          ),
          Text(
            profile.clientName,
            textAlign: TextAlign.center,
            style: text.headlineSmall?.copyWith(color: JColors.navy),
          ),
          const SizedBox(height: 4),
          Text(
            l.clientSince(monthYear(context, profile.clientSince)),
            textAlign: TextAlign.center,
            style: text.bodyMedium,
          ),
          const SizedBox(height: 20),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                JCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      SectionTitle(
                        l.navMyFarm,
                        trailing: OutlinedButton(
                          onPressed: () => _editFarm(context),
                          child: Text(l.edit),
                        ),
                      ),
                      const SizedBox(height: 14),
                      Row(
                        children: [
                          Expanded(
                            child: _Fact(
                              label: l.location,
                              value: profile.location,
                            ),
                          ),
                          Expanded(
                            child: _Fact(
                              label: l.area,
                              value: l.hectares(
                                decimalTrim(context, profile.areaHa),
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 14),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: [
                          for (final (i, crop) in profile.crops.indexed)
                            StatusPill(
                              crop.of(context),
                              tone: cropTones[i % cropTones.length],
                            ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                JCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      SectionTitle(l.thisSeasonIWant),
                      const SizedBox(height: 4),
                      Text(l.goalsHelp, style: text.bodyMedium),
                      const SizedBox(height: 14),
                      Wrap(
                        spacing: 10,
                        runSpacing: 10,
                        children: [
                          for (final goal in SeasonGoal.values)
                            ChoicePill(
                              label: _goalLabel(l, goal),
                              selected: store.goals.contains(goal),
                              onTap: () => store.toggleGoal(goal),
                            ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _goalLabel(AppLocalizations l, SeasonGoal goal) => switch (goal) {
    SeasonGoal.higherYields => l.goalHigherYields,
    SeasonGoal.moreLandWatered => l.goalMoreLand,
    SeasonGoal.saveWater => l.goalSaveWater,
    SeasonGoal.lessLabour => l.goalLessLabour,
  };

  Future<void> _editFarm(BuildContext context) async {
    final l = AppLocalizations.of(context);
    final store = JogooScope.read(context);
    final location = TextEditingController(text: store.profile.location);
    final area = TextEditingController(
      text: decimalTrim(context, store.profile.areaHa),
    );
    final saved = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(l.editFarmTitle),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: location,
              decoration: InputDecoration(
                labelText: l.location,
                border: const OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: area,
              keyboardType: const TextInputType.numberWithOptions(
                decimal: true,
              ),
              decoration: InputDecoration(
                labelText: l.area,
                suffixText: 'ha',
                border: const OutlineInputBorder(),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: Text(l.cancel),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            child: Text(l.save),
          ),
        ],
      ),
    );
    final hectares = double.tryParse(area.text.replaceAll(',', '.'));
    if (saved == true && location.text.trim().isNotEmpty && hectares != null) {
      store.updateFarm(location: location.text.trim(), areaHa: hectares);
    }
    location.dispose();
    area.dispose();
  }
}

class _Fact extends StatelessWidget {
  const _Fact({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: text.bodyMedium),
        Text(value, style: text.titleSmall),
      ],
    );
  }
}

class _LanguageToggle extends StatelessWidget {
  const _LanguageToggle();

  @override
  Widget build(BuildContext context) {
    final store = JogooScope.of(context);
    final french = isFrench(context);
    Widget option(String code, bool selected) => Semantics(
      selected: selected,
      button: true,
      child: Material(
        color: selected ? Colors.white : Colors.transparent,
        shape: const StadiumBorder(),
        child: InkWell(
          customBorder: const StadiumBorder(),
          onTap: () => store.setLocale(Locale(code.toLowerCase())),
          child: Container(
            constraints: const BoxConstraints(minWidth: 56, minHeight: 44),
            alignment: Alignment.center,
            child: Text(
              code,
              style: TextStyle(
                fontWeight: FontWeight.w700,
                color: selected ? JColors.navy : Colors.white,
              ),
            ),
          ),
        ),
      ),
    );
    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: const Color(0x33FFFFFF),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [option('EN', !french), option('FR', french)],
      ),
    );
  }
}

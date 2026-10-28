import 'package:flutter/material.dart';

import '../app/shell.dart';
import '../app/theme.dart';
import '../data/demo_data.dart';
import '../data/jogoo_store.dart';
import '../generated/l10n/app_localizations.dart';
import '../models/models.dart';
import '../widgets/jogoo_widgets.dart';
import 'guide_screen.dart';
import 'offline_library_screen.dart';

/// Screen 07: a knowledge base written by JOGOO agronomists.
class LearnScreen extends StatefulWidget {
  const LearnScreen({super.key});

  @override
  State<LearnScreen> createState() => _LearnScreenState();
}

class _LearnScreenState extends State<LearnScreen> {
  String _query = '';

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    final store = JogooScope.of(context);
    final query = _query.trim().toLowerCase();
    final guides = store.guides
        .where(
          (g) =>
              query.isEmpty ||
              g.title.en.toLowerCase().contains(query) ||
              g.title.fr.toLowerCase().contains(query),
        )
        .toList();
    final videos = guides.where((g) => g.kind == GuideKind.video).take(2);
    final reading = guides.where((g) => g.kind != GuideKind.video);

    return ListView(
      padding: const EdgeInsets.only(bottom: 24),
      children: [
        PageTitle(title: l.navLearn, subtitle: l.learnSubtitle),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              SearchBox(
                hint: l.searchGuides,
                onChanged: (value) => setState(() => _query = value),
              ),
              const SizedBox(height: 16),
              if (query.isEmpty) ...[
                const _SeasonAlert(),
                const SizedBox(height: 16),
              ],
              if (videos.isNotEmpty) ...[
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    for (final (i, video) in videos.indexed) ...[
                      if (i > 0) const SizedBox(width: 12),
                      Expanded(child: _VideoCard(guide: video)),
                    ],
                    if (videos.length == 1) const Spacer(),
                  ],
                ),
                const SizedBox(height: 16),
              ],
              if (reading.isNotEmpty)
                JCard(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 20,
                    vertical: 4,
                  ),
                  child: DividedColumn(
                    children: [
                      for (final guide in reading)
                        ListRow(
                          leading: TintIcon(
                            guide.icon,
                            tone: guide.tone,
                            size: 52,
                          ),
                          title: guide.title.of(context),
                          subtitle: l.readMinutes(guide.minutes),
                          onTap: () => push(
                            context,
                            GuideScreen(guideId: guide.id),
                          ),
                        ),
                    ],
                  ),
                ),
              if (guides.isEmpty) JCard(child: Text(l.noGuides)),
              const SizedBox(height: 16),
              JCard(
                padding: const EdgeInsets.symmetric(
                  horizontal: 20,
                  vertical: 4,
                ),
                onTap: () => push(context, const OfflineLibraryScreen()),
                child: ListRow(
                  leading: const TintIcon(
                    Icons.download_done,
                    tone: Tone.lime,
                    size: 52,
                  ),
                  title: l.offlineLibrary,
                  subtitle: l.librarySubtitle,
                  trailing: const Icon(Icons.chevron_right),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _SeasonAlert extends StatelessWidget {
  const _SeasonAlert();

  @override
  Widget build(BuildContext context) {
    final alert = DemoData.seasonAlert;
    return ClipRRect(
      borderRadius: BorderRadius.circular(28),
      child: ColoredBox(
        color: JColors.orangeTint,
        child: Stack(
          children: [
            Positioned(
              right: -40,
              top: -50,
              child: Container(
                width: 130,
                height: 130,
                decoration: const BoxDecoration(
                  color: Color(0xFFF8C98A),
                  shape: BoxShape.circle,
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(20),
              child: Row(
                children: [
                  Container(
                    width: 56,
                    height: 56,
                    decoration: const BoxDecoration(
                      color: JColors.orange,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.thunderstorm_outlined,
                      color: JColors.ink,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          alert.title.of(context),
                          style: Theme.of(context).textTheme.titleSmall,
                        ),
                        Text(
                          alert.body.of(context),
                          style: const TextStyle(color: JColors.brown),
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
    );
  }
}

class _VideoCard extends StatelessWidget {
  const _VideoCard({required this.guide});

  final Guide guide;

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    final text = Theme.of(context).textTheme;
    return JCard(
      padding: const EdgeInsets.fromLTRB(12, 18, 12, 18),
      onTap: () => push(context, GuideScreen(guideId: guide.id)),
      child: Column(
        children: [
          Stack(
            children: [
              PhotoCircle(asset: guide.photo!, size: 104),
              Positioned(
                right: 0,
                bottom: 0,
                child: Container(
                  width: 42,
                  height: 42,
                  decoration: BoxDecoration(
                    color: JColors.navy,
                    shape: BoxShape.circle,
                    border: Border.all(color: Colors.white, width: 3),
                  ),
                  child: const Icon(
                    Icons.play_arrow_rounded,
                    color: Colors.white,
                    size: 22,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            guide.title.of(context),
            textAlign: TextAlign.center,
            style: text.titleSmall,
          ),
          const SizedBox(height: 6),
          Text(l.videoMinutes(guide.minutes), style: text.bodyMedium),
        ],
      ),
    );
  }
}

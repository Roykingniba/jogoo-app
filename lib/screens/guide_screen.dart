import 'package:flutter/material.dart';

import '../app/shell.dart';
import '../app/theme.dart';
import '../data/jogoo_store.dart';
import '../generated/l10n/app_localizations.dart';
import '../models/models.dart';
import '../widgets/jogoo_widgets.dart';
import 'mia_screen.dart';
import 'walkthrough_screen.dart';

/// Reader for one guide, crop sheet or video summary from the Learn library.
class GuideScreen extends StatelessWidget {
  const GuideScreen({super.key, required this.guideId});

  final String guideId;

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    final guide = JogooScope.of(context).guideById(guideId);
    final text = Theme.of(context).textTheme;
    final isVideo = guide.kind == GuideKind.video;

    return TabChildScaffold(
      tab: AppTab.learn,
      body: Column(
        children: [
          ScreenHeader(
            title: guide.title.of(context),
            subtitle: isVideo
                ? l.illustratedMinutes(guide.minutes)
                : l.readMinutes(guide.minutes),
          ),
          Expanded(
            child: ScreenList(
              children: [
                if (guide.photo != null)
                  Center(
                    child: Stack(
                      alignment: Alignment.center,
                      children: [
                        PhotoCircle(asset: guide.photo, size: 200, ring: 6),
                        if (isVideo)
                          CircleButton(
                            icon: Icons.play_arrow_rounded,
                            tooltip: l.playVideo,
                            color: Colors.white,
                            background: JColors.navy,
                            size: 64,
                            onPressed: () => push(
                              context,
                              WalkthroughScreen(guideId: guide.id),
                            ),
                          ),
                      ],
                    ),
                  )
                else
                  Center(child: TintIcon(guide.icon, tone: guide.tone, size: 96)),
                JCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (guide.savedOffline) ...[
                        StatusPill(l.savedOffline, tone: Tone.lime),
                        const SizedBox(height: 12),
                      ],
                      Text(guide.body.of(context), style: text.bodyLarge),
                    ],
                  ),
                ),
                OutlinedButton.icon(
                  onPressed: () => push(context, const MiaScreen()),
                  icon: const Icon(Icons.chat_bubble_outline),
                  label: Text(l.askMiaAboutThis),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

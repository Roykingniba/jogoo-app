import 'package:flutter/material.dart';

import '../app/shell.dart';
import '../app/theme.dart';
import '../data/jogoo_store.dart';
import '../generated/l10n/app_localizations.dart';
import '../models/models.dart';
import '../widgets/jogoo_widgets.dart';
import 'documents_screen.dart';
import 'guide_screen.dart';

/// Screen 20: manuals and videos that work without internet.
class OfflineLibraryScreen extends StatelessWidget {
  const OfflineLibraryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    final store = JogooScope.of(context);
    final text = Theme.of(context).textTheme;
    final manuals = store.documents
        .where((d) => d.type == DocumentType.manual)
        .toList();
    final videos = store.guides
        .where((g) => g.kind == GuideKind.video)
        .toList();
    final savedGuides = store.guides
        .where((g) => g.kind != GuideKind.video && g.savedOffline)
        .length + manuals.where((m) => m.savedOffline).length;
    final savedVideos = videos.where((v) => v.savedOffline).length;

    return TabChildScaffold(
      tab: AppTab.learn,
      body: Column(
        children: [
          ScreenHeader(title: l.offlineLibrary, subtitle: l.librarySubtitle),
          Expanded(
            child: ScreenList(
              children: [
                JCard(
                  child: Row(
                    children: [
                      const TintIcon(Icons.check, tone: Tone.lime, size: 64),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              l.savedSummary(
                                l.guidesCount(savedGuides),
                                l.videosCount(savedVideos),
                              ),
                              style: text.titleSmall,
                            ),
                            Text(l.worksOffline, style: text.bodyMedium),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                JCard(
                  padding: const EdgeInsets.fromLTRB(16, 18, 16, 4),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Text(l.userManuals, style: text.titleMedium),
                      DividedColumn(
                        children: [for (final m in manuals) DocumentRow(m)],
                      ),
                    ],
                  ),
                ),
                JCard(
                  padding: const EdgeInsets.fromLTRB(16, 18, 16, 4),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Text(l.videos, style: text.titleMedium),
                      DividedColumn(
                        children: [
                          for (final video in videos)
                            ListRow(
                              leading: PhotoCircle(
                                asset: video.photo!,
                                size: 52,
                              ),
                              title: video.title.of(context),
                              subtitle: l.videoMinutes(video.minutes),
                              trailing: video.savedOffline
                                  ? const CircleAvatar(
                                      radius: 22,
                                      backgroundColor: JColors.limeTint,
                                      child: Icon(
                                        Icons.check,
                                        color: JColors.olive,
                                      ),
                                    )
                                  : CircleButton(
                                      icon: Icons.download_outlined,
                                      tooltip: l.download,
              outlined: true,
                                      color: JColors.navy,
                                      size: 44,
                                      onPressed: () => showJogooToast(
                                        context,
                                        l.downloadsLaterTitle,
                                        l.downloadsLaterBody,
                                      ),
                                    ),
                              onTap: () => push(
                                context,
                                GuideScreen(guideId: video.id),
                              ),
                            ),
                        ],
                      ),
                    ],
                  ),
                ),
                JCard(
                  padding: const EdgeInsets.fromLTRB(20, 6, 12, 6),
                  child: SwitchListTile(
                    contentPadding: EdgeInsets.zero,
                    title: Text(l.wifiOnly, style: text.titleSmall),
                    subtitle: Text(l.wifiOnlyHelp),
                    value: store.wifiOnly,
                    onChanged: (value) => store.wifiOnly = value,
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

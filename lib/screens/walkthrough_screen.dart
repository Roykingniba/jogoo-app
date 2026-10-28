import 'dart:async';

import 'package:flutter/material.dart';

import '../app/shell.dart';
import '../app/theme.dart';
import '../data/jogoo_store.dart';
import '../generated/l10n/app_localizations.dart';
import '../widgets/jogoo_widgets.dart';

class WalkthroughScreen extends StatefulWidget {
  const WalkthroughScreen({super.key, required this.guideId});

  final String guideId;

  @override
  State<WalkthroughScreen> createState() => _WalkthroughScreenState();
}

class _WalkthroughScreenState extends State<WalkthroughScreen> {
  static const _stepDuration = Duration(seconds: 6);

  Timer? _timer;
  int _stepIndex = 0;
  bool _playing = false;

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  void _setPlaying(bool playing, int stepCount) {
    _timer?.cancel();
    setState(() => _playing = playing);
    if (!playing) return;

    _timer = Timer.periodic(_stepDuration, (_) {
      if (_stepIndex + 1 >= stepCount) {
        _timer?.cancel();
        setState(() => _playing = false);
      } else {
        setState(() => _stepIndex++);
      }
    });
  }

  void _moveToStep(int index, int stepCount) {
    _timer?.cancel();
    setState(() {
      _stepIndex = index.clamp(0, stepCount - 1);
      _playing = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    final guide = JogooScope.of(context).guideById(widget.guideId);
    final steps = guide.body
        .of(context)
        .split(RegExp(r'(?<=[.!?])\s+'))
        .where((step) => step.trim().isNotEmpty)
        .toList();
    final stepCount = steps.length;

    return TabChildScaffold(
      tab: AppTab.learn,
      body: Column(
        children: [
          ScreenHeader(
            title: guide.title.of(context),
            subtitle: l.illustratedWalkthrough,
          ),
          Expanded(
            child: ScreenList(
              children: [
                JCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      if (guide.photo != null)
                        ClipRRect(
                          borderRadius: BorderRadius.circular(16),
                          child: AspectRatio(
                            aspectRatio: 16 / 9,
                            child: Image.asset(
                              guide.photo!,
                              fit: BoxFit.cover,
                              semanticLabel: guide.title.of(context),
                            ),
                          ),
                        ),
                      const SizedBox(height: 18),
                      Text(
                        l.walkthroughStep(_stepIndex + 1, stepCount),
                        style: Theme.of(context).textTheme.labelLarge?.copyWith(
                          color: JColors.olive,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 8),
                      AnimatedSwitcher(
                        duration: const Duration(milliseconds: 220),
                        child: Text(
                          steps[_stepIndex],
                          key: ValueKey(_stepIndex),
                          style: Theme.of(context).textTheme.bodyLarge,
                        ),
                      ),
                      const SizedBox(height: 16),
                      LinearProgressIndicator(
                        value: (_stepIndex + 1) / stepCount,
                        minHeight: 6,
                        borderRadius: BorderRadius.circular(99),
                        color: JColors.olive,
                        backgroundColor: JColors.limeTint,
                      ),
                      const SizedBox(height: 16),
                      Text(
                        l.walkthroughOfflineNote,
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                IconButton(
                  tooltip: l.previousStep,
                  onPressed: _stepIndex == 0
                      ? null
                      : () => _moveToStep(_stepIndex - 1, stepCount),
                  icon: const Icon(Icons.skip_previous_rounded),
                  iconSize: 36,
                ),
                const SizedBox(width: 12),
                IconButton(
                  tooltip: _playing ? l.pauseWalkthrough : l.playVideo,
                  onPressed: () => _setPlaying(!_playing, stepCount),
                  style: IconButton.styleFrom(
                    minimumSize: const Size(56, 56),
                    backgroundColor: JColors.navy,
                    foregroundColor: Colors.white,
                  ),
                  iconSize: 32,
                  icon: Icon(
                    _playing ? Icons.pause_rounded : Icons.play_arrow_rounded,
                  ),
                ),
                const SizedBox(width: 12),
                IconButton(
                  tooltip: l.nextStep,
                  onPressed: _stepIndex == stepCount - 1
                      ? null
                      : () => _moveToStep(_stepIndex + 1, stepCount),
                  icon: const Icon(Icons.skip_next_rounded),
                  iconSize: 36,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

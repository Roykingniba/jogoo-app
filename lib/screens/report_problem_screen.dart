import 'package:flutter/material.dart';

import '../app/theme.dart';
import '../data/jogoo_store.dart';
import '../generated/l10n/app_localizations.dart';
import '../models/models.dart';
import '../utils/actions.dart';
import '../widgets/jogoo_widgets.dart';
import 'service_request_screen.dart';

enum _Problem { leak, lowPressure, brokenPart, leafSymptoms }

class _Media {
  const _Media(this.path, {required this.video});

  final String path;
  final bool video;
}

/// Screen 14: a field ticket with photos and video.
class ReportProblemScreen extends StatefulWidget {
  const ReportProblemScreen({super.key, this.equipmentId});

  /// Pre-selected when opened from an equipment page.
  final String? equipmentId;

  @override
  State<ReportProblemScreen> createState() => _ReportProblemScreenState();
}

class _ReportProblemScreenState extends State<ReportProblemScreen> {
  late String? _equipmentId = widget.equipmentId;
  _Problem? _problem;
  final _description = TextEditingController();
  final List<_Media> _media = [];

  @override
  void dispose() {
    _description.dispose();
    super.dispose();
  }

  Bi _problemText(_Problem problem) => switch (problem) {
    _Problem.leak => const Bi('Leak', 'Fuite'),
    _Problem.lowPressure => const Bi('Low pressure', 'Pression faible'),
    _Problem.brokenPart => const Bi('Broken part', 'Pièce cassée'),
    _Problem.leafSymptoms => const Bi(
      'Leaf symptoms',
      'Symptômes sur feuilles',
    ),
  };

  Future<void> _addMedia({required bool video}) async {
    final path = await pickMedia(context, video: video);
    if (path != null && mounted) {
      setState(() => _media.add(_Media(path, video: video)));
    }
  }

  Future<void> _send() async {
    final l = AppLocalizations.of(context);
    if (_equipmentId == null || _problem == null) {
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text(l.pickProblemFirst)));
      return;
    }
    final request = JogooScope.read(context).reportProblem(
      equipmentId: _equipmentId!,
      problem: _problemText(_problem!),
      description: _description.text.trim(),
      mediaPaths: [for (final m in _media) m.path],
    );
    final store = JogooScope.read(context);
    final details = _description.text.trim();
    final message = [
      l.waProblem(
        store.equipmentById(_equipmentId!).name.of(context),
        _problemText(_problem!).of(context),
      ),
      if (details.isNotEmpty) l.waProblemDetails(details),
    ].join('\n');
    await contactJogooAbout(
      context,
      title: l.reportSavedTitle(request.id),
      body: _media.isEmpty
          ? l.reportSavedBody
          : '${l.reportSavedBody} ${l.photosOnWhatsApp}',
      message: message,
    );
    if (!mounted) return;
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(
        builder: (_) => ServiceRequestScreen(requestId: request.id),
      ),
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
            ScreenHeader(title: l.reportProblem, subtitle: l.serviceHours),
            Expanded(
              child: ScreenList(
                children: [
                  JCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(l.whichEquipment, style: text.titleMedium),
                        const SizedBox(height: 12),
                        Wrap(
                          spacing: 10,
                          runSpacing: 10,
                          children: [
                            for (final item in store.equipment)
                              ChoicePill(
                                label: item.shortName.of(context),
                                selected: _equipmentId == item.id,
                                onTap: () =>
                                    setState(() => _equipmentId = item.id),
                              ),
                          ],
                        ),
                        const SizedBox(height: 20),
                        Text(l.whatIsWrong, style: text.titleMedium),
                        const SizedBox(height: 12),
                        Wrap(
                          spacing: 10,
                          runSpacing: 10,
                          children: [
                            for (final problem in _Problem.values)
                              ChoicePill(
                                label: _problemText(problem).of(context),
                                selected: _problem == problem,
                                selectedColor: JColors.magenta,
                                onTap: () => setState(() => _problem = problem),
                              ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  JCard(
                    child: TextField(
                      controller: _description,
                      minLines: 3,
                      maxLines: 6,
                      textCapitalization: TextCapitalization.sentences,
                      decoration: InputDecoration(
                        labelText: l.describeProblem,
                        floatingLabelBehavior: FloatingLabelBehavior.always,
                        hintText: l.describeProblemHint,
                      ),
                    ),
                  ),
                  JCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(l.photosAndVideos, style: text.titleMedium),
                        const SizedBox(height: 12),
                        Wrap(
                          spacing: 12,
                          runSpacing: 12,
                          children: [
                            for (final media in _media)
                              _MediaThumb(
                                media: media,
                                onRemove: () =>
                                    setState(() => _media.remove(media)),
                              ),
                            _AddMediaButton(
                              icon: Icons.photo_camera_outlined,
                              tooltip: l.takePhoto,
                              onTap: () => _addMedia(video: false),
                            ),
                            _AddMediaButton(
                              icon: Icons.videocam_outlined,
                              tooltip: l.recordVideo,
                              onTap: () => _addMedia(video: true),
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
      ),
      bottomNavigationBar: BottomActionBar(
        children: [FilledButton(onPressed: _send, child: Text(l.sendRequest))],
      ),
    );
  }
}

class _MediaThumb extends StatelessWidget {
  const _MediaThumb({required this.media, required this.onRemove});

  final _Media media;
  final VoidCallback onRemove;

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    return Stack(
      clipBehavior: Clip.none,
      children: [
        media.video
            ? const TintIcon(
                Icons.play_arrow_rounded,
                tone: Tone.blue,
                size: 76,
              )
            : PhotoCircle(file: media.path, size: 76),
        Positioned(
          right: -6,
          top: -6,
          child: CircleButton(
            icon: Icons.close,
            tooltip: l.remove,
            size: 30,
            background: JColors.ink,
            color: Colors.white,
            onPressed: onRemove,
          ),
        ),
      ],
    );
  }
}

class _AddMediaButton extends StatelessWidget {
  const _AddMediaButton({
    required this.icon,
    required this.tooltip,
    required this.onTap,
  });

  final IconData icon;
  final String tooltip;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Tooltip(
      message: tooltip,
      child: Material(
        color: JColors.surface,
        shape: const CircleBorder(
          side: BorderSide(color: Color(0xFFB9B5AA), width: 2),
        ),
        child: InkWell(
          customBorder: const CircleBorder(),
          onTap: onTap,
          child: SizedBox(
            width: 76,
            height: 76,
            child: Icon(icon, color: JColors.navy),
          ),
        ),
      ),
    );
  }
}

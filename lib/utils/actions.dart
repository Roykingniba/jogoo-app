import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:url_launcher/url_launcher.dart';

import '../app/theme.dart';
import '../data/demo_data.dart';
import '../generated/l10n/app_localizations.dart';
import '../widgets/jogoo_widgets.dart';

/// Opens the phone dialler. Calls work without mobile data.
Future<void> callNumber(BuildContext context, String number) =>
    _open(context, Uri(scheme: 'tel', path: number));

Future<void> callJogoo(BuildContext context) =>
    callNumber(context, DemoData.jogooPhone);

/// Opens a WhatsApp chat with the JOGOO team.
Future<void> openWhatsApp(BuildContext context, {String? text}) => _open(
  context,
  Uri.https('wa.me', '/${DemoData.whatsAppNumber}', {'text': ?text}),
);

Future<void> _open(BuildContext context, Uri uri) async {
  final messenger = ScaffoldMessenger.of(context);
  final message = AppLocalizations.of(context).cannotOpenLink;
  final ok = await launchUrl(uri, mode: LaunchMode.externalApplication);
  if (!ok) messenger.showSnackBar(SnackBar(content: Text(message)));
}

/// Honest hand-off for a client request. The app cannot send requests to
/// JOGOO yet, so it says so and offers a prefilled WhatsApp message or a call.
Future<void> contactJogooAbout(
  BuildContext context, {
  required String title,
  String? body,
  required String message,
}) {
  final l = AppLocalizations.of(context);
  return showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    showDragHandle: true,
    builder: (sheetContext) {
      final text = Theme.of(sheetContext).textTheme;
      return SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(20, 0, 20, 16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(title, style: text.titleLarge),
              if (body != null) ...[
                const SizedBox(height: 6),
                Text(body, style: text.bodyLarge),
              ],
              const SizedBox(height: 14),
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(Icons.error_outline, color: JColors.brown),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      '${l.notSentTitle}. ${l.notSentBody}',
                      style: text.bodyMedium,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),
              Text(l.messagePreview, style: text.labelLarge),
              const SizedBox(height: 6),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: JColors.chip,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(message, style: text.bodyMedium),
              ),
              const SizedBox(height: 16),
              FilledButton.icon(
                style: FilledButton.styleFrom(
                  backgroundColor: const Color(0xFF25D366),
                  foregroundColor: JColors.ink,
                  minimumSize: const Size.fromHeight(48),
                ),
                icon: const Icon(Icons.chat_bubble_outline),
                label: Text(l.sendOnWhatsApp),
                onPressed: () {
                  Navigator.pop(sheetContext);
                  openWhatsApp(context, text: message);
                },
              ),
              const SizedBox(height: 8),
              OutlinedButton.icon(
                style: OutlinedButton.styleFrom(
                  minimumSize: const Size.fromHeight(48),
                ),
                icon: const Icon(Icons.call_outlined),
                label: Text(l.callJogoo),
                onPressed: () {
                  Navigator.pop(sheetContext);
                  callJogoo(context);
                },
              ),
            ],
          ),
        ),
      );
    },
  );
}

/// For features planned in the design but not built in this version.
void showComingSoon(BuildContext context) {
  final l = AppLocalizations.of(context);
  showJogooToast(context, l.comingSoonTitle, l.comingSoonBody);
}

/// Lets the client take a photo/video or pick one from the gallery.
/// Images are scaled down before they are stored or sent.
Future<String?> pickMedia(BuildContext context, {bool video = false}) async {
  final l = AppLocalizations.of(context);
  final source = await showModalBottomSheet<ImageSource>(
    context: context,
    builder: (context) => SafeArea(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          ListTile(
            leading: Icon(
              video ? Icons.videocam_outlined : Icons.photo_camera_outlined,
            ),
            title: Text(video ? l.recordVideo : l.takePhoto),
            onTap: () => Navigator.pop(context, ImageSource.camera),
          ),
          ListTile(
            leading: const Icon(Icons.photo_library_outlined),
            title: Text(l.chooseFromGallery),
            onTap: () => Navigator.pop(context, ImageSource.gallery),
          ),
          const SizedBox(height: 8),
        ],
      ),
    ),
  );
  if (source == null) return null;

  final picker = ImagePicker();
  try {
    final file = video
        ? await picker.pickVideo(
            source: source,
            maxDuration: const Duration(seconds: 60),
          )
        : await picker.pickImage(
            source: source,
            maxWidth: 1280,
            maxHeight: 1280,
            imageQuality: 75,
          );
    return file?.path;
  } catch (_) {
    if (context.mounted) {
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text(l.cannotOpenCamera)));
    }
    return null;
  }
}

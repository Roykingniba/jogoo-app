import 'package:flutter/material.dart';

import '../app/shell.dart';
import '../app/theme.dart';
import '../data/demo_data.dart';
import '../data/jogoo_store.dart';
import '../generated/l10n/app_localizations.dart';
import '../utils/actions.dart';
import '../widgets/chat_widgets.dart';
import '../widgets/jogoo_widgets.dart';
import 'agronomist_screen.dart';
import 'guide_screen.dart';

/// Screen 06: the website chatbot, now in the app, with photos and handover.
class MiaScreen extends StatefulWidget {
  const MiaScreen({super.key});

  @override
  State<MiaScreen> createState() => _MiaScreenState();
}

class _MiaScreenState extends State<MiaScreen> {
  final _input = TextEditingController();
  final _scroll = ScrollController();
  bool _unavailable = false;

  @override
  void dispose() {
    _input.dispose();
    _scroll.dispose();
    super.dispose();
  }

  Future<void> _send({String? photo}) async {
    final text = _input.text.trim();
    if (text.isEmpty && photo == null) return;
    _input.clear();
    final reached = await JogooScope.read(context).sendToMia(
      text: text,
      photoFile: photo,
      languageCode: Localizations.localeOf(context).languageCode,
    );
    if (!mounted) return;
    setState(() => _unavailable = !reached);
    _scrollToEnd();
  }

  Future<void> _sendPhoto() async {
    final path = await pickMedia(context);
    if (path != null && mounted) await _send(photo: path);
  }

  void _scrollToEnd() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scroll.hasClients) {
        _scroll.animateTo(
          _scroll.position.maxScrollExtent,
          duration: const Duration(milliseconds: 250),
          curve: Curves.easeOut,
        );
      }
    });
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
              title: 'Mia',
              subtitle: l.miaSubtitle,
              leading: const _MiaAvatar(),
              trailing: CircleButton(
                icon: Icons.call_outlined,
                tooltip: l.callJogoo,
                color: JColors.navy,
                onPressed: () => callJogoo(context),
              ),
            ),
            Expanded(
              child: ListView(
                controller: _scroll,
                padding: const EdgeInsets.fromLTRB(16, 4, 16, 16),
                children: [
                  for (final message in store.miaChat)
                    ChatBubble(
                      message: message,
                      footer: message.guideId == null
                          ? null
                          : _GuideLink(guideId: message.guideId!),
                    ),
                  if (store.miaBusy)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: Text(l.miaTyping, style: text.bodyMedium),
                    ),
                  if (_unavailable) _UnavailableCard(),
                  const SizedBox(height: 4),
                  Wrap(
                    spacing: 10,
                    runSpacing: 10,
                    children: [
                      OutlinedButton(
                        onPressed: () =>
                            push(context, const AgronomistScreen()),
                        child: Text(l.bookAgronomist),
                      ),
                      OutlinedButton(
                        onPressed: () => openWhatsApp(context),
                        child: Text(l.talkToPerson),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            ChatInputBar(
              controller: _input,
              hint: l.messageMia,
              onSend: store.miaBusy ? null : _send,
              onCamera: store.miaBusy ? null : _sendPhoto,
              showCamera: true,
            ),
            InkWell(
              onTap: () => callJogoo(context),
              child: Padding(
                padding: const EdgeInsets.only(bottom: 8, top: 2),
                child: Text(
                  l.urgentCall(DemoData.jogooPhoneDisplay),
                  style: text.bodySmall,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _MiaAvatar extends StatelessWidget {
  const _MiaAvatar();

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Container(
          width: 56,
          height: 56,
          padding: const EdgeInsets.all(10),
          decoration: const BoxDecoration(
            color: JColors.pinkTint,
            shape: BoxShape.circle,
          ),
          child: Image.asset('assets/images/jogoo_mark.png', cacheWidth: 120),
        ),
        Positioned(
          right: 0,
          bottom: 2,
          child: Container(
            width: 16,
            height: 16,
            decoration: BoxDecoration(
              color: JColors.olive,
              shape: BoxShape.circle,
              border: Border.all(color: JColors.background, width: 2),
            ),
          ),
        ),
      ],
    );
  }
}

class _GuideLink extends StatelessWidget {
  const _GuideLink({required this.guideId});

  final String guideId;

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    final guide = JogooScope.of(context).guideById(guideId);
    return Material(
      color: JColors.background,
      shape: const StadiumBorder(),
      child: InkWell(
        customBorder: const StadiumBorder(),
        onTap: () => push(context, GuideScreen(guideId: guideId)),
        child: Padding(
          padding: const EdgeInsets.all(8),
          child: Row(
            children: [
              const TintIcon(Icons.menu_book_outlined, tone: Tone.orange, size: 40),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  l.readGuide(guide.title.of(context)),
                  style: Theme.of(context).textTheme.titleSmall,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _UnavailableCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: JColors.orangeTint,
          borderRadius: BorderRadius.circular(24),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(l.miaUnavailable),
            const SizedBox(height: 12),
            Wrap(
              spacing: 10,
              runSpacing: 10,
              children: [
                FilledButton.icon(
                  onPressed: () => callJogoo(context),
                  icon: const Icon(Icons.call_outlined),
                  label: Text(l.call),
                ),
                OutlinedButton(
                  onPressed: () => openWhatsApp(context),
                  child: const Text('WhatsApp'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

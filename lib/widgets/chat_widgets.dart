import 'package:flutter/material.dart';

import '../app/theme.dart';
import '../generated/l10n/app_localizations.dart';
import '../models/models.dart';
import 'jogoo_widgets.dart';

/// A message in the Mia or agronomist chat.
class ChatBubble extends StatelessWidget {
  const ChatBubble({super.key, required this.message, this.footer});

  final ChatMessage message;
  final Widget? footer;

  @override
  Widget build(BuildContext context) {
    final mine = message.author == ChatAuthor.client;
    final text = message.text.of(context);
    final width = MediaQuery.sizeOf(context).width;

    if (message.photo != null || message.photoFile != null) {
      return Padding(
        padding: const EdgeInsets.only(bottom: 12),
        child: Column(
          crossAxisAlignment: mine
              ? CrossAxisAlignment.end
              : CrossAxisAlignment.start,
          children: [
            PhotoCircle(
              asset: message.photo,
              file: message.photoFile,
              size: 140,
              ring: 5,
            ),
            if (text.isNotEmpty) ...[
              const SizedBox(height: 8),
              _Bubble(mine: mine, maxWidth: width * 0.78, child: Text(text)),
            ],
          ],
        ),
      );
    }

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Align(
        alignment: mine ? Alignment.centerRight : Alignment.centerLeft,
        child: _Bubble(
          mine: mine,
          maxWidth: width * 0.82,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (message.sender != null) ...[
                Text(
                  message.sender!.of(context),
                  style: const TextStyle(
                    color: JColors.olive,
                    fontWeight: FontWeight.w700,
                    fontSize: 13,
                  ),
                ),
                const SizedBox(height: 4),
              ],
              Text(
                text,
                style: TextStyle(
                  fontSize: 15,
                  height: 1.45,
                  color: mine ? Colors.white : JColors.ink,
                ),
              ),
              if (footer != null) ...[const SizedBox(height: 12), footer!],
            ],
          ),
        ),
      ),
    );
  }
}

class _Bubble extends StatelessWidget {
  const _Bubble({required this.mine, required this.maxWidth, required this.child});

  final bool mine;
  final double maxWidth;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: BoxConstraints(maxWidth: maxWidth),
      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
      decoration: BoxDecoration(
        color: mine ? JColors.navy : JColors.surface,
        borderRadius: BorderRadius.only(
          topLeft: const Radius.circular(24),
          topRight: const Radius.circular(24),
          bottomLeft: Radius.circular(mine ? 24 : 6),
          bottomRight: Radius.circular(mine ? 6 : 24),
        ),
      ),
      child: DefaultTextStyle.merge(
        style: TextStyle(color: mine ? Colors.white : JColors.ink),
        child: child,
      ),
    );
  }
}

/// Message field with an optional camera button and the lime send button.
class ChatInputBar extends StatelessWidget {
  const ChatInputBar({
    super.key,
    required this.controller,
    required this.hint,
    required this.onSend,
    this.onCamera,
    this.showCamera = false,
  });

  final TextEditingController controller;
  final String hint;
  final VoidCallback? onSend;
  final VoidCallback? onCamera;
  final bool showCamera;

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
      child: Row(
        children: [
          if (showCamera) ...[
            CircleButton(
              icon: Icons.photo_camera_outlined,
              tooltip: l.sendPhoto,
              color: JColors.navy,
              onPressed: onCamera,
            ),
            const SizedBox(width: 10),
          ],
          Expanded(
            child: Container(
              height: 56,
              padding: const EdgeInsets.symmetric(horizontal: 20),
              alignment: Alignment.centerLeft,
              decoration: BoxDecoration(
                color: JColors.surface,
                borderRadius: BorderRadius.circular(999),
              ),
              child: TextField(
                controller: controller,
                textInputAction: TextInputAction.send,
                onSubmitted: (_) => onSend?.call(),
                minLines: 1,
                maxLines: 3,
                decoration: InputDecoration(hintText: hint, isCollapsed: true),
              ),
            ),
          ),
          const SizedBox(width: 10),
          CircleButton(
            icon: Icons.send_outlined,
            tooltip: l.send,
            color: JColors.ink,
            background: JColors.limeSoft,
            size: 56,
            onPressed: onSend,
          ),
        ],
      ),
    );
  }
}

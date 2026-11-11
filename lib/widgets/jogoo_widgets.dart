import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

import '../app/theme.dart';
import '../generated/l10n/app_localizations.dart';

const _cardRadius = BorderRadius.all(Radius.circular(28));

/// Decodes images at the size they are drawn, which keeps memory low on
/// entry-level phones.
int _cachePx(BuildContext context, double size) =>
    (size * MediaQuery.devicePixelRatioOf(context)).round();

/// White rounded card used for every content block.
class JCard extends StatelessWidget {
  const JCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(20),
    this.onTap,
  });

  final Widget child;
  final EdgeInsetsGeometry padding;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: JColors.surface,
      borderRadius: _cardRadius,
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: Padding(padding: padding, child: child),
      ),
    );
  }
}

/// Round tinted icon, the design's main visual marker.
class TintIcon extends StatelessWidget {
  const TintIcon(this.icon, {super.key, this.tone = Tone.blue, this.size = 56});

  final IconData icon;
  final Tone tone;
  final double size;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(color: tone.background, shape: BoxShape.circle),
      child: Icon(icon, color: tone.foreground, size: size * 0.42),
    );
  }
}

/// Round photo from the app bundle or the phone's storage.
class PhotoCircle extends StatelessWidget {
  const PhotoCircle({
    super.key,
    this.asset,
    this.file,
    required this.size,
    this.ring = 0,
    this.ringColor = JColors.surface,
  }) : assert(asset != null || file != null);

  final String? asset;
  final String? file;
  final double size;
  final double ring;
  final Color ringColor;

  @override
  Widget build(BuildContext context) {
    final px = _cachePx(context, size);
    final image = asset != null
        ? Image.asset(
            asset!,
            fit: BoxFit.cover,
            cacheWidth: px,
            width: size,
            height: size,
          )
        : kIsWeb
        // On the web, picked photos are blob URLs rather than files.
        ? Image.network(
            file!,
            fit: BoxFit.cover,
            cacheWidth: px,
            width: size,
            height: size,
          )
        : Image.file(
            File(file!),
            fit: BoxFit.cover,
            cacheWidth: px,
            width: size,
            height: size,
          );
    return Container(
      width: size + ring * 2,
      height: size + ring * 2,
      padding: EdgeInsets.all(ring),
      decoration: BoxDecoration(color: ringColor, shape: BoxShape.circle),
      child: ClipOval(child: image),
    );
  }
}

/// Initials in a coloured circle (technicians, the client).
class InitialsAvatar extends StatelessWidget {
  const InitialsAvatar(
    this.initials, {
    super.key,
    this.size = 56,
    this.color = JColors.navy,
    this.borderColor,
  });

  final String initials;
  final double size;
  final Color color;
  final Color? borderColor;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: color,
        shape: BoxShape.circle,
        border: borderColor == null
            ? null
            : Border.all(color: borderColor!, width: 3),
      ),
      child: Text(
        initials,
        style: TextStyle(
          fontFamily: 'Poppins',
          fontWeight: FontWeight.w700,
          fontSize: size * 0.34,
          color: Colors.white,
        ),
      ),
    );
  }
}

/// Small rounded status label: "Due soon", "Confirmed", "Synced"...
class StatusPill extends StatelessWidget {
  const StatusPill(this.label, {super.key, this.tone = Tone.lime});

  final String label;
  final Tone tone;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
      decoration: BoxDecoration(
        color: tone.background,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 12.5,
          fontWeight: FontWeight.w700,
          color: tone.foreground,
        ),
      ),
    );
  }
}

/// Selectable pill used for tabs, filters and quick choices.
class ChoicePill extends StatelessWidget {
  const ChoicePill({
    super.key,
    required this.label,
    required this.selected,
    required this.onTap,
    this.selectedColor = JColors.navy,
  });

  final String label;
  final bool selected;
  final VoidCallback onTap;
  final Color selectedColor;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      selected: selected,
      button: true,
      child: Material(
        color: selected ? selectedColor : JColors.chip,
        shape: const StadiumBorder(),
        child: InkWell(
          customBorder: const StadiumBorder(),
          onTap: onTap,
          // Sized to its label, so pills stay compact inside a Wrap.
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
            child: Text(
              label,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w700,
                color: selected ? Colors.white : JColors.ink,
              ),
            ),
          ),
        ),
      ),
    );
  }
}

/// Horizontal row of [ChoicePill]s that scrolls when it does not fit.
class PillRow extends StatelessWidget {
  const PillRow({super.key, required this.children});

  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: [
          for (var i = 0; i < children.length; i++) ...[
            if (i > 0) const SizedBox(width: 10),
            children[i],
          ],
        ],
      ),
    );
  }
}

/// White round button used for back, close, share and call.
class CircleButton extends StatelessWidget {
  const CircleButton({
    super.key,
    required this.icon,
    required this.onPressed,
    required this.tooltip,
    this.color = JColors.ink,
    this.background = JColors.surface,
    this.size = 52,
    this.outlined = false,
  });

  final IconData icon;
  final VoidCallback? onPressed;
  final String tooltip;
  final Color color;
  final Color background;
  final double size;

  /// Thin ring in [color], for secondary actions on white cards.
  final bool outlined;

  @override
  Widget build(BuildContext context) {
    return Tooltip(
      message: tooltip,
      child: Material(
        color: background,
        shape: CircleBorder(
          side: outlined
              ? BorderSide(color: color, width: 1.5)
              : BorderSide.none,
        ),
        child: InkWell(
          customBorder: const CircleBorder(),
          onTap: onPressed,
          child: SizedBox(
            width: size,
            height: size,
            child: Icon(icon, color: color, size: size * 0.42),
          ),
        ),
      ),
    );
  }
}

/// Header of pushed screens: back button, title, subtitle, optional action.
class ScreenHeader extends StatelessWidget {
  const ScreenHeader({
    super.key,
    required this.title,
    this.subtitle,
    this.trailing,
    this.leading,
    this.close = false,
    this.centerTitle = false,
  });

  final String title;
  final String? subtitle;
  final Widget? trailing;

  /// Shown after the back button, e.g. Mia's avatar.
  final Widget? leading;
  final bool close;
  final bool centerTitle;

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    final text = Theme.of(context).textTheme;
    final titleBlock = Column(
      crossAxisAlignment: centerTitle
          ? CrossAxisAlignment.center
          : CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          title,
          style: text.headlineSmall?.copyWith(fontSize: centerTitle ? 18 : 22),
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
        ),
        if (subtitle != null)
          Text(subtitle!, style: text.bodyMedium, maxLines: 2),
      ],
    );
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
      child: Row(
        children: [
          CircleButton(
            icon: close ? Icons.close : Icons.chevron_left,
            tooltip: close ? l.close : l.back,
            onPressed: () => Navigator.of(context).maybePop(),
          ),
          const SizedBox(width: 14),
          if (leading != null) ...[leading!, const SizedBox(width: 12)],
          Expanded(child: centerTitle ? Center(child: titleBlock) : titleBlock),
          if (trailing != null) ...[
            const SizedBox(width: 12),
            trailing!,
          ] else if (centerTitle)
            const SizedBox(width: 52),
        ],
      ),
    );
  }
}

/// Says the farm, shop and service screens show example data, not the
/// client's own, until JOGOO sets up their account.
class ExampleBanner extends StatelessWidget {
  const ExampleBanner({super.key});

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 14),
      child: Semantics(
        container: true,
        child: Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: JColors.orangeTint,
            borderRadius: BorderRadius.circular(14),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Icon(Icons.info_outline, color: JColors.brown),
              const SizedBox(width: 10),
              Expanded(
                child: Text.rich(
                  TextSpan(
                    children: [
                      TextSpan(
                        text: '${l.exampleBannerTitle} ',
                        style: const TextStyle(fontWeight: FontWeight.w700),
                      ),
                      TextSpan(text: l.exampleBannerBody),
                    ],
                  ),
                  style: const TextStyle(color: JColors.ink, fontSize: 14),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Large navy title at the top of each main tab.
class PageTitle extends StatelessWidget {
  const PageTitle({
    super.key,
    required this.title,
    this.subtitle,
    this.trailing,
  });

  final String title;
  final String? subtitle;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: text.displaySmall),
                if (subtitle != null) ...[
                  const SizedBox(height: 4),
                  Text(
                    subtitle!,
                    style: text.bodyLarge?.copyWith(color: JColors.muted),
                  ),
                ],
              ],
            ),
          ),
          ?trailing,
        ],
      ),
    );
  }
}

/// Bold section heading inside or above cards.
class SectionTitle extends StatelessWidget {
  const SectionTitle(this.text, {super.key, this.trailing});

  final String text;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    final title = Text(text, style: Theme.of(context).textTheme.titleLarge);
    if (trailing == null) return title;
    // The trailing pill or button moves under the title when both do not
    // fit, e.g. long French titles or large system text.
    return SizedBox(
      width: double.infinity,
      child: Wrap(
        alignment: WrapAlignment.spaceBetween,
        crossAxisAlignment: WrapCrossAlignment.center,
        spacing: 12,
        runSpacing: 8,
        children: [title, trailing!],
      ),
    );
  }
}

/// Navy card with the lime brand circle in the top-right corner.
class BrandCard extends StatelessWidget {
  const BrandCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(22),
    this.blobSize = 180,
  });

  final Widget child;
  final EdgeInsetsGeometry padding;
  final double blobSize;

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: _cardRadius,
      child: ColoredBox(
        color: JColors.navy,
        child: Stack(
          children: [
            Positioned(
              right: -blobSize * 0.32,
              top: -blobSize * 0.45,
              child: Container(
                width: blobSize,
                height: blobSize,
                decoration: const BoxDecoration(
                  color: JColors.lime,
                  shape: BoxShape.circle,
                ),
              ),
            ),
            Padding(padding: padding, child: child),
          ],
        ),
      ),
    );
  }
}

/// One row in a list card: icon, title, subtitle, action.
class ListRow extends StatelessWidget {
  const ListRow({
    super.key,
    required this.title,
    this.leading,
    this.subtitle,
    this.subtitleColor,
    this.trailing,
    this.onTap,
    this.padding = const EdgeInsets.symmetric(vertical: 12),
  });

  final Widget? leading;
  final String title;
  final String? subtitle;
  final Color? subtitleColor;
  final Widget? trailing;
  final VoidCallback? onTap;
  final EdgeInsetsGeometry padding;

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;
    final row = Padding(
      padding: padding,
      child: Row(
        children: [
          if (leading != null) ...[leading!, const SizedBox(width: 16)],
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: text.titleSmall),
                if (subtitle != null) ...[
                  const SizedBox(height: 2),
                  Text(
                    subtitle!,
                    style: text.bodyMedium?.copyWith(
                      color: subtitleColor,
                      fontWeight: subtitleColor == null
                          ? null
                          : FontWeight.w600,
                    ),
                  ),
                ],
              ],
            ),
          ),
          if (trailing != null) ...[const SizedBox(width: 12), trailing!],
        ],
      ),
    );
    if (onTap == null) return row;
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: row,
    );
  }
}

/// Column with dividers between children, as in the design's list cards.
class DividedColumn extends StatelessWidget {
  const DividedColumn({super.key, required this.children});

  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        for (var i = 0; i < children.length; i++) ...[
          if (i > 0) const Divider(),
          children[i],
        ],
      ],
    );
  }
}

class TimelineItem {
  const TimelineItem({
    required this.title,
    required this.state,
    this.subtitle,
    this.subtitleColor,
    this.trailing,
    this.icon,
  });

  final String title;
  final String? subtitle;
  final Color? subtitleColor;
  final TimelineMarker state;
  final Widget? trailing;

  /// Replaces the dot for the current step, e.g. a truck on the road.
  final IconData? icon;
}

enum TimelineMarker { done, current, due, pending }

/// Vertical progress list: done (lime check), current (navy dot), due
/// (orange ring) and pending (grey ring).
class Timeline extends StatelessWidget {
  const Timeline({super.key, required this.items});

  final List<TimelineItem> items;

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;
    return Column(
      children: [
        for (var i = 0; i < items.length; i++)
          IntrinsicHeight(
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                SizedBox(
                  width: 36,
                  child: Column(
                    children: [
                      _Marker(items[i]),
                      if (i < items.length - 1)
                        Expanded(
                          child: Container(
                            width: 2,
                            color: items[i].state == TimelineMarker.done
                                ? JColors.limeSoft
                                : JColors.line,
                          ),
                        ),
                    ],
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Padding(
                    padding: EdgeInsets.only(
                      bottom: i < items.length - 1 ? 18 : 0,
                      top: 2,
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                items[i].title,
                                style: text.titleSmall?.copyWith(
                                  color:
                                      items[i].state == TimelineMarker.pending
                                      ? JColors.muted
                                      : JColors.ink,
                                ),
                              ),
                              if (items[i].subtitle != null)
                                Text(
                                  items[i].subtitle!,
                                  style: text.bodyMedium?.copyWith(
                                    color: items[i].subtitleColor,
                                    fontWeight: items[i].subtitleColor == null
                                        ? null
                                        : FontWeight.w700,
                                  ),
                                ),
                            ],
                          ),
                        ),
                        ?items[i].trailing,
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
      ],
    );
  }
}

class _Marker extends StatelessWidget {
  const _Marker(this.item);

  final TimelineItem item;

  @override
  Widget build(BuildContext context) {
    const size = 34.0;
    return switch (item.state) {
      TimelineMarker.done => Container(
        width: size,
        height: size,
        decoration: const BoxDecoration(
          color: JColors.limeSoft,
          shape: BoxShape.circle,
        ),
        child: const Icon(Icons.check, size: 18, color: JColors.ink),
      ),
      TimelineMarker.current => Container(
        width: size,
        height: size,
        decoration: const BoxDecoration(
          color: JColors.navy,
          shape: BoxShape.circle,
        ),
        child: item.icon == null
            ? null
            : Icon(item.icon, size: 16, color: Colors.white),
      ),
      TimelineMarker.due => Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          border: Border.all(color: JColors.orange, width: 4),
        ),
      ),
      TimelineMarker.pending => Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: JColors.surface,
          border: Border.all(color: JColors.line, width: 2.5),
        ),
      ),
    };
  }
}

/// White bar pinned to the bottom with one or two actions.
class BottomActionBar extends StatelessWidget {
  const BottomActionBar({super.key, required this.children, this.footer});

  final List<Widget> children;
  final String? footer;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: JColors.surface,
      child: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 14, 16, 12),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                children: [
                  for (var i = 0; i < children.length; i++) ...[
                    if (i > 0) const SizedBox(width: 12),
                    Expanded(child: children[i]),
                  ],
                ],
              ),
              if (footer != null) ...[
                const SizedBox(height: 8),
                Text(
                  footer!,
                  style: Theme.of(context).textTheme.bodySmall,
                  textAlign: TextAlign.center,
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

/// Rounded search box.
class SearchBox extends StatelessWidget {
  const SearchBox({
    super.key,
    required this.hint,
    required this.onChanged,
    this.controller,
  });

  final String hint;
  final ValueChanged<String> onChanged;
  final TextEditingController? controller;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 56,
      padding: const EdgeInsets.symmetric(horizontal: 20),
      decoration: BoxDecoration(
        color: JColors.surface,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Row(
        children: [
          const Icon(Icons.search, color: JColors.muted),
          const SizedBox(width: 12),
          Expanded(
            child: TextField(
              controller: controller,
              onChanged: onChanged,
              textInputAction: TextInputAction.search,
              decoration: InputDecoration(hintText: hint, isCollapsed: true),
            ),
          ),
        ],
      ),
    );
  }
}

/// Round shortcut with a label underneath (Home, Service hub).
class RoundShortcut extends StatelessWidget {
  const RoundShortcut({
    super.key,
    required this.label,
    required this.onTap,
    this.icon,
    this.tone = Tone.blue,
    this.image,
    this.size = 64,
  });

  final String label;
  final VoidCallback onTap;
  final IconData? icon;
  final Tone tone;
  final String? image;
  final double size;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 2),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (image != null)
              Container(
                width: size,
                height: size,
                padding: EdgeInsets.all(size * 0.16),
                decoration: BoxDecoration(
                  color: tone.background,
                  shape: BoxShape.circle,
                ),
                child: Image.asset(image!, cacheWidth: _cachePx(context, size)),
              )
            else
              TintIcon(icon!, tone: tone, size: size),
            const SizedBox(height: 8),
            Text(
              label,
              textAlign: TextAlign.center,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontSize: 13.5,
                fontWeight: FontWeight.w600,
                color: JColors.ink,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Dark floating confirmation with the JOGOO mark, as in the Shop design.
void showJogooToast(BuildContext context, String title, [String? body]) {
  final messenger = ScaffoldMessenger.of(context);
  messenger.hideCurrentSnackBar();
  messenger.showSnackBar(
    SnackBar(
      duration: const Duration(seconds: 4),
      padding: const EdgeInsets.fromLTRB(14, 12, 14, 12),
      content: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            padding: const EdgeInsets.all(7),
            decoration: const BoxDecoration(
              color: Colors.white,
              shape: BoxShape.circle,
            ),
            child: Image.asset('assets/images/jogoo_mark.png', cacheWidth: 96),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontWeight: FontWeight.w700,
                    color: Colors.white,
                  ),
                ),
                if (body != null)
                  Text(
                    body,
                    style: const TextStyle(
                      fontSize: 13,
                      color: Color(0xFFC9D6E3),
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          const CircleAvatar(
            radius: 14,
            backgroundColor: JColors.limeSoft,
            child: Icon(Icons.check, size: 16, color: JColors.ink),
          ),
        ],
      ),
    ),
  );
}

/// Standard screen padding and spacing between cards.
class ScreenList extends StatelessWidget {
  const ScreenList({
    super.key,
    required this.children,
    this.padding = const EdgeInsets.fromLTRB(16, 0, 16, 24),
  });

  final List<Widget> children;
  final EdgeInsetsGeometry padding;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: padding,
      children: [
        for (var i = 0; i < children.length; i++) ...[
          if (i > 0) const SizedBox(height: 16),
          children[i],
        ],
      ],
    );
  }
}

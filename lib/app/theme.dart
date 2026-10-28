import 'package:flutter/material.dart';

/// JOGOO brand palette, taken from the client app design.
abstract final class JColors {
  static const navy = Color(0xFF004A87);
  static const ink = Color(0xFF0E2338);
  static const lime = Color(0xFF9DB93A);
  static const limeSoft = Color(0xFFBDD647);
  static const olive = Color(0xFF5B7A12);
  static const magenta = Color(0xFFB12176);
  static const orange = Color(0xFFF2A33A);
  static const brown = Color(0xFF8A4B00);

  static const background = Color(0xFFF3F0E8);
  static const surface = Color(0xFFFFFFFF);
  static const muted = Color(0xFF56657A);
  static const line = Color(0xFFE6E2D8);
  static const chip = Color(0xFFE9E5DA);

  // Soft tints used behind round icons and status pills.
  static const blueTint = Color(0xFFDCE6F2);
  static const limeTint = Color(0xFFE5EFC4);
  static const orangeTint = Color(0xFFFBE3C0);
  static const pinkTint = Color(0xFFF7D9E8);
  static const cyanTint = Color(0xFFD5EEF3);
  static const cyan = Color(0xFF0E6E80);
}

/// A tint and the matching foreground colour for an icon or pill.
enum Tone {
  blue(JColors.blueTint, JColors.navy),
  lime(JColors.limeTint, JColors.olive),
  orange(JColors.orangeTint, JColors.brown),
  pink(JColors.pinkTint, JColors.magenta),
  cyan(JColors.cyanTint, JColors.cyan);

  const Tone(this.background, this.foreground);

  final Color background;
  final Color foreground;
}

const _display = 'Poppins';
const _body = 'Montserrat';

ThemeData buildJogooTheme() {
  const scheme = ColorScheme(
    brightness: Brightness.light,
    primary: JColors.navy,
    onPrimary: Colors.white,
    secondary: JColors.lime,
    onSecondary: JColors.ink,
    tertiary: JColors.magenta,
    onTertiary: Colors.white,
    error: Color(0xFFB3261E),
    onError: Colors.white,
    surface: JColors.surface,
    onSurface: JColors.ink,
    onSurfaceVariant: JColors.muted,
    outline: JColors.line,
  );

  const textTheme = TextTheme(
    displaySmall: TextStyle(
      fontFamily: _display,
      fontSize: 32,
      fontWeight: FontWeight.w700,
      color: JColors.navy,
      height: 1.15,
    ),
    headlineSmall: TextStyle(
      fontFamily: _display,
      fontSize: 24,
      fontWeight: FontWeight.w700,
      color: JColors.ink,
      height: 1.2,
    ),
    titleLarge: TextStyle(
      fontFamily: _display,
      fontSize: 20,
      fontWeight: FontWeight.w600,
      color: JColors.ink,
      height: 1.25,
    ),
    titleMedium: TextStyle(
      fontFamily: _display,
      fontSize: 17,
      fontWeight: FontWeight.w600,
      color: JColors.ink,
      height: 1.3,
    ),
    titleSmall: TextStyle(
      fontFamily: _body,
      fontSize: 15,
      fontWeight: FontWeight.w700,
      color: JColors.ink,
      height: 1.3,
    ),
    bodyLarge: TextStyle(
      fontFamily: _body,
      fontSize: 15,
      color: JColors.ink,
      height: 1.45,
    ),
    bodyMedium: TextStyle(
      fontFamily: _body,
      fontSize: 13.5,
      color: JColors.muted,
      height: 1.35,
    ),
    bodySmall: TextStyle(fontFamily: _body, fontSize: 12, color: JColors.muted),
    labelLarge: TextStyle(
      fontFamily: _body,
      fontSize: 15,
      fontWeight: FontWeight.w700,
    ),
    labelMedium: TextStyle(
      fontFamily: _body,
      fontSize: 13,
      fontWeight: FontWeight.w700,
    ),
  );

  final pill = WidgetStatePropertyAll<OutlinedBorder>(const StadiumBorder());
  const buttonPadding = WidgetStatePropertyAll(
    EdgeInsets.symmetric(horizontal: 22, vertical: 14),
  );

  return ThemeData(
    useMaterial3: true,
    colorScheme: scheme,
    scaffoldBackgroundColor: JColors.background,
    fontFamily: _body,
    textTheme: textTheme,
    // Cheaper than the default ink sparkle on low-end GPUs.
    splashFactory: InkRipple.splashFactory,
    appBarTheme: const AppBarTheme(
      backgroundColor: JColors.background,
      surfaceTintColor: Colors.transparent,
      elevation: 0,
    ),
    filledButtonTheme: FilledButtonThemeData(
      style: ButtonStyle(
        shape: pill,
        padding: buttonPadding,
        minimumSize: const WidgetStatePropertyAll(Size(64, 48)),
        backgroundColor: const WidgetStatePropertyAll(JColors.navy),
        textStyle: WidgetStatePropertyAll(textTheme.labelLarge),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: ButtonStyle(
        shape: pill,
        padding: buttonPadding,
        minimumSize: const WidgetStatePropertyAll(Size(64, 48)),
        foregroundColor: const WidgetStatePropertyAll(JColors.navy),
        side: const WidgetStatePropertyAll(
          BorderSide(color: JColors.navy, width: 1.5),
        ),
        textStyle: WidgetStatePropertyAll(textTheme.labelLarge),
      ),
    ),
    textButtonTheme: TextButtonThemeData(
      style: ButtonStyle(
        foregroundColor: const WidgetStatePropertyAll(JColors.navy),
        textStyle: WidgetStatePropertyAll(textTheme.labelLarge),
      ),
    ),
    navigationBarTheme: NavigationBarThemeData(
      backgroundColor: JColors.surface,
      surfaceTintColor: Colors.transparent,
      indicatorColor: JColors.limeSoft,
      height: 68,
      labelTextStyle: WidgetStateProperty.resolveWith(
        (states) => TextStyle(
          fontFamily: _body,
          fontSize: 12,
          fontWeight: states.contains(WidgetState.selected)
              ? FontWeight.w700
              : FontWeight.w600,
          color: states.contains(WidgetState.selected)
              ? JColors.navy
              : JColors.muted,
        ),
      ),
      iconTheme: WidgetStateProperty.resolveWith(
        (states) => IconThemeData(
          color: states.contains(WidgetState.selected)
              ? JColors.navy
              : JColors.muted,
        ),
      ),
    ),
    switchTheme: SwitchThemeData(
      thumbColor: const WidgetStatePropertyAll(Colors.white),
      trackColor: WidgetStateProperty.resolveWith(
        (states) => states.contains(WidgetState.selected)
            ? JColors.olive
            : const Color(0xFFD9D5CB),
      ),
      trackOutlineColor: const WidgetStatePropertyAll(Colors.transparent),
    ),
    snackBarTheme: SnackBarThemeData(
      backgroundColor: JColors.ink,
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
      contentTextStyle: const TextStyle(
        fontFamily: _body,
        fontSize: 14,
        color: Colors.white,
      ),
    ),
    inputDecorationTheme: const InputDecorationTheme(
      border: InputBorder.none,
      hintStyle: TextStyle(fontFamily: _body, color: JColors.muted),
    ),
    dividerTheme: const DividerThemeData(
      color: JColors.line,
      thickness: 1,
      space: 1,
    ),
    bottomSheetTheme: const BottomSheetThemeData(
      backgroundColor: JColors.surface,
      surfaceTintColor: Colors.transparent,
      showDragHandle: true,
    ),
    dialogTheme: const DialogThemeData(
      backgroundColor: JColors.surface,
      surfaceTintColor: Colors.transparent,
    ),
  );
}

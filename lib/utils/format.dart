import 'package:flutter/widgets.dart';
import 'package:intl/intl.dart';

String _locale(BuildContext context) =>
    Localizations.localeOf(context).languageCode;

bool isFrench(BuildContext context) => _locale(context) == 'fr';

/// Groups thousands with a space, as written in Cameroon: 18 500.
String formatAmount(int value) {
  final digits = value.abs().toString();
  final buffer = StringBuffer(value < 0 ? '-' : '');
  for (var i = 0; i < digits.length; i++) {
    if (i > 0 && (digits.length - i) % 3 == 0) buffer.write(' ');
    buffer.write(digits[i]);
  }
  return buffer.toString();
}

/// "Thu 9 Oct" / "jeu. 9 oct."
String shortDate(BuildContext context, DateTime date) =>
    DateFormat('EEE d MMM', _locale(context)).format(date);

/// "9 Oct" / "9 oct."
String dayMonth(BuildContext context, DateTime date) =>
    DateFormat('d MMM', _locale(context)).format(date);

/// "6 Oct 2026" / "6 oct. 2026"
String fullDate(BuildContext context, DateTime date) =>
    DateFormat('d MMM y', _locale(context)).format(date);

/// "10:00" in both languages.
String timeOfDay(DateTime date) => DateFormat('HH:mm').format(date);

/// "Thu 9 Oct, 10:00"
String dateTime(BuildContext context, DateTime date) =>
    '${shortDate(context, date)}, ${timeOfDay(date)}';

/// "6 Oct, 08:12"
String dayMonthTime(BuildContext context, DateTime date) =>
    '${dayMonth(context, date)}, ${timeOfDay(date)}';

/// "TUESDAY 6 OCTOBER" / "MARDI 6 OCTOBRE"
String longDayHeader(BuildContext context, DateTime date) =>
    DateFormat('EEEE d MMMM', _locale(context)).format(date).toUpperCase();

/// "March 2026" / "mars 2026"
String monthYear(BuildContext context, DateTime date) =>
    DateFormat('MMMM y', _locale(context)).format(date);

/// "OCT" / "OCT." for calendar badges.
String monthBadge(BuildContext context, DateTime date) => DateFormat(
  'MMM',
  _locale(context),
).format(date).replaceAll('.', '').toUpperCase();

/// "2.4" / "2,4"
String decimal(BuildContext context, double value) =>
    NumberFormat('0.0', _locale(context)).format(value);

/// "3" for whole numbers, otherwise "2.5" / "2,5".
String decimalTrim(BuildContext context, double value) =>
    value == value.roundToDouble()
    ? value.round().toString()
    : decimal(context, value);

/// Two-letter initials from a full name.
String initials(String name) {
  final parts = name.trim().split(RegExp(r'\s+'));
  return parts.take(2).map((p) => p.isEmpty ? '' : p[0]).join().toUpperCase();
}

bool isSameDay(DateTime a, DateTime b) =>
    a.year == b.year && a.month == b.month && a.day == b.day;

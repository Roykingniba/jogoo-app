import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';

import '../generated/l10n/app_localizations.dart';
import '../models/models.dart';

Future<Uint8List> buildFarmDocumentPdf({
  required String title,
  required String equipmentName,
  required String serialLabel,
  required String copyLabel,
  required String demoNotice,
}) async {
  final regular = pw.Font.ttf(
    await rootBundle.load('assets/fonts/Montserrat-Regular.ttf'),
  );
  final bold = pw.Font.ttf(
    await rootBundle.load('assets/fonts/Montserrat-Bold.ttf'),
  );
  final pdf = pw.Document(
    theme: pw.ThemeData.withFont(base: regular, bold: bold),
  );

  pdf.addPage(
    pw.Page(
      build: (context) => pw.Padding(
        padding: const pw.EdgeInsets.all(28),
        child: pw.Column(
          crossAxisAlignment: pw.CrossAxisAlignment.start,
          children: [
            pw.Text(
              'JOGOO',
              style: pw.TextStyle(fontSize: 12, fontWeight: pw.FontWeight.bold),
            ),
            pw.SizedBox(height: 24),
            pw.Text(
              title,
              style: pw.TextStyle(fontSize: 22, fontWeight: pw.FontWeight.bold),
            ),
            pw.SizedBox(height: 8),
            pw.Text(equipmentName, style: const pw.TextStyle(fontSize: 14)),
            pw.Text(serialLabel),
            pw.SizedBox(height: 24),
            pw.Divider(),
            pw.SizedBox(height: 16),
            pw.Text(demoNotice, style: const pw.TextStyle(fontSize: 12)),
            pw.Spacer(),
            pw.Text(
              copyLabel,
              style: pw.TextStyle(
                fontSize: 10,
                fontWeight: pw.FontWeight.bold,
                color: PdfColors.grey700,
              ),
            ),
          ],
        ),
      ),
    ),
  );
  return pdf.save();
}

Future<Uint8List> buildMaintenanceLogPdf({
  required String locale,
  required Equipment equipment,
  required List<LogEntry> entries,
  required String demoNotice,
  required String loggedByLabel,
  required String waitingLabel,
  required String syncedLabel,
  required String reportTitle,
}) async {
  final regular = pw.Font.ttf(
    await rootBundle.load('assets/fonts/Montserrat-Regular.ttf'),
  );
  final bold = pw.Font.ttf(
    await rootBundle.load('assets/fonts/Montserrat-Bold.ttf'),
  );
  final pdf = pw.Document(
    theme: pw.ThemeData.withFont(base: regular, bold: bold),
  );
  final dateFormat = DateFormat.yMMMd(locale);

  pdf.addPage(
    pw.MultiPage(
      build: (context) => [
        pw.Header(level: 0, child: pw.Text(reportTitle)),
        pw.Text(
          locale == 'fr'
              ? '${equipment.name.fr} · Série : ${equipment.serial}'
              : '${equipment.name.en} · Serial: ${equipment.serial}',
        ),
        pw.SizedBox(height: 18),
        if (entries.isEmpty)
          pw.Text(locale == 'fr' ? 'Aucune saisie.' : 'No entries.')
        else
          for (final entry in entries) ...[
            pw.Container(
              margin: const pw.EdgeInsets.only(bottom: 12),
              padding: const pw.EdgeInsets.all(12),
              decoration: const pw.BoxDecoration(
                border: pw.Border(
                  left: pw.BorderSide(color: PdfColors.green, width: 3),
                  bottom: pw.BorderSide(color: PdfColors.grey300),
                ),
              ),
              child: pw.Column(
                crossAxisAlignment: pw.CrossAxisAlignment.start,
                children: [
                  pw.Text(
                    locale == 'fr' ? entry.title.fr : entry.title.en,
                    style: pw.TextStyle(
                      fontSize: 12,
                      fontWeight: pw.FontWeight.bold,
                    ),
                  ),
                  pw.SizedBox(height: 4),
                  pw.Text(dateFormat.format(entry.date)),
                  pw.Text('$loggedByLabel ${entry.loggedBy}'),
                  pw.Text(entry.synced ? syncedLabel : waitingLabel),
                ],
              ),
            ),
          ],
        pw.SizedBox(height: 12),
        pw.Divider(),
        pw.Text(demoNotice, style: const pw.TextStyle(fontSize: 10)),
      ],
    ),
  );

  return pdf.save();
}

Future<void> previewFarmDocument(
  BuildContext context,
  FarmDocument document,
  Equipment equipment,
) async {
  final l = AppLocalizations.of(context);
  try {
    final bytes = await buildFarmDocumentPdf(
      title: document.title.of(context),
      equipmentName: equipment.name.of(context),
      serialLabel: l.serialNumber(equipment.serial),
      copyLabel: l.demoCopy,
      demoNotice: l.demoDocumentNotice,
    );
    await Printing.layoutPdf(
      name: 'jogoo-${document.id}.pdf',
      onLayout: (_) async => bytes,
    );
  } on Exception catch (error, stackTrace) {
    debugPrint('Could not preview demo document: $error\n$stackTrace');
    if (context.mounted) {
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text(l.pdfExportFailed)));
    }
  }
}

Future<void> downloadFarmDocument(
  BuildContext context,
  FarmDocument document,
  Equipment equipment,
) async {
  final l = AppLocalizations.of(context);
  try {
    final bytes = await buildFarmDocumentPdf(
      title: document.title.of(context),
      equipmentName: equipment.name.of(context),
      serialLabel: l.serialNumber(equipment.serial),
      copyLabel: l.demoCopy,
      demoNotice: l.demoDocumentNotice,
    );
    await Printing.sharePdf(bytes: bytes, filename: 'jogoo-${document.id}.pdf');
  } on Exception catch (error, stackTrace) {
    debugPrint('Could not share demo document: $error\n$stackTrace');
    if (context.mounted) {
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text(l.pdfExportFailed)));
    }
  }
}

Future<void> shareMaintenanceLog(
  BuildContext context,
  Equipment equipment,
  List<LogEntry> entries,
) async {
  final l = AppLocalizations.of(context);
  try {
    final bytes = await buildMaintenanceLogPdf(
      locale: l.localeName,
      equipment: equipment,
      entries: entries,
      demoNotice: l.demoDocumentNotice,
      loggedByLabel: l.loggedByLabel,
      waitingLabel: l.waitingToSync,
      syncedLabel: l.synced,
      reportTitle: l.logReportTitle,
    );
    await Printing.sharePdf(
      bytes: bytes,
      filename: 'jogoo-maintenance-${equipment.id}.pdf',
    );
  } on Exception catch (error, stackTrace) {
    debugPrint('Could not share maintenance log: $error\n$stackTrace');
    if (context.mounted) {
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text(l.pdfExportFailed)));
    }
  }
}

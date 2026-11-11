import 'package:flutter/material.dart';

import '../app/theme.dart';
import '../data/jogoo_store.dart';
import '../generated/l10n/app_localizations.dart';
import '../models/models.dart';
import '../utils/actions.dart';
import '../utils/format.dart';
import '../widgets/jogoo_widgets.dart';

/// Screen 09: follow one request from report to fix.
class ServiceRequestScreen extends StatelessWidget {
  const ServiceRequestScreen({super.key, required this.requestId});

  final String requestId;

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    final store = JogooScope.of(context);
    final request = store.requestById(requestId);
    final equipment = store.equipmentById(request.equipmentId);
    final text = Theme.of(context).textTheme;

    // The first step that is not done is the one in progress.
    final current = request.steps.indexWhere((s) => !s.done);

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            ScreenHeader(
              title: l.requestTitle(request.id),
              subtitle: equipment.name.of(context),
            ),
            Expanded(
              child: ScreenList(
                children: [
                  BrandCard(
                    blobSize: 190,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          l.technicianVisit.toUpperCase(),
                          style: const TextStyle(
                            color: Color(0xFFC9DBEC),
                            fontWeight: FontWeight.w700,
                            letterSpacing: 1.2,
                            fontSize: 12.5,
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          request.visitAt == null
                              ? l.visitToBeScheduled
                              : dateTime(context, request.visitAt!),
                          style: const TextStyle(
                            fontFamily: 'Poppins',
                            fontWeight: FontWeight.w700,
                            fontSize: 24,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(height: 18),
                        Row(
                          children: [
                            InitialsAvatar(
                              request.technician == null
                                  ? 'J'
                                  : initials(request.technician!.name),
                              color: JColors.magenta,
                              borderColor: Colors.white,
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    request.technician?.name ??
                                        l.technicianToAssign,
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontWeight: FontWeight.w700,
                                      fontSize: 16,
                                    ),
                                  ),
                                  if (request.technician != null)
                                    Text(
                                      request.technician!.role.of(context),
                                      style: const TextStyle(
                                        color: Color(0xFFC9DBEC),
                                      ),
                                    ),
                                ],
                              ),
                            ),
                            if (request.technician != null)
                              CircleButton(
                                icon: Icons.call_outlined,
                                tooltip: l.callTechnician,
                                color: JColors.navy,
                                onPressed: () => callNumber(
                                  context,
                                  request.technician!.phone,
                                ),
                              ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  JCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        SectionTitle(l.progress),
                        const SizedBox(height: 16),
                        Timeline(
                          items: [
                            for (final (i, step) in request.steps.indexed)
                              _item(
                                context,
                                request,
                                equipment,
                                step,
                                i == current,
                              ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  if (request.description != null || request.notes.isNotEmpty)
                    JCard(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          SectionTitle(l.yourNotes),
                          const SizedBox(height: 8),
                          if (request.description != null)
                            Text(request.description!, style: text.bodyLarge),
                          for (final note in request.notes)
                            Padding(
                              padding: const EdgeInsets.only(top: 8),
                              child: Text('• $note', style: text.bodyLarge),
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
      bottomNavigationBar: request.isOpen
          ? BottomActionBar(
              children: [
                OutlinedButton(
                  onPressed: () => _reschedule(context, request),
                  child: Text(l.reschedule),
                ),
                FilledButton(
                  onPressed: () => _addDetails(context, request),
                  child: Text(l.addDetails),
                ),
              ],
            )
          : null,
    );
  }

  TimelineItem _item(
    BuildContext context,
    ServiceRequest request,
    Equipment equipment,
    RequestStep step,
    bool isCurrent,
  ) {
    final l = AppLocalizations.of(context);
    final title =
        step.title?.of(context) ??
        switch (step.kind) {
          RequestStepKind.received => l.stepReceived,
          RequestStepKind.diagnosed => l.stepDiagnosed,
          RequestStepKind.booked => l.stepBooked,
          RequestStepKind.fixed => l.stepFixed,
        };
    String? subtitle =
        step.note?.of(context) ??
        (step.at == null ? null : dayMonthTime(context, step.at!));
    if (step.kind == RequestStepKind.booked && step.at == null) {
      subtitle = equipment.underWarranty ? l.coveredByWarranty : l.notCovered;
    }
    return TimelineItem(
      title: title,
      subtitle: subtitle,
      state: step.done
          ? TimelineMarker.done
          : isCurrent
          ? TimelineMarker.current
          : TimelineMarker.pending,
    );
  }

  Future<void> _addDetails(BuildContext context, ServiceRequest request) async {
    final l = AppLocalizations.of(context);
    final store = JogooScope.read(context);
    final controller = TextEditingController();
    final note = await showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(l.addDetails),
        content: TextField(
          controller: controller,
          autofocus: true,
          maxLines: 4,
          decoration: InputDecoration(
            hintText: l.detailsHint,
            border: const OutlineInputBorder(),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(l.cancel),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, controller.text.trim()),
            child: Text(l.save),
          ),
        ],
      ),
    );
    controller.dispose();
    if (note == null || note.isEmpty || !context.mounted) return;
    store.addRequestNote(request.id, note);
    await contactJogooAbout(
      context,
      title: l.noteAdded,
      message: l.waRequestNote(request.id, note),
    );
  }

  Future<void> _reschedule(BuildContext context, ServiceRequest request) async {
    final l = AppLocalizations.of(context);
    final store = JogooScope.read(context);
    final now = DateTime.now();
    final date = await showDatePicker(
      context: context,
      firstDate: now,
      lastDate: now.add(const Duration(days: 60)),
      initialDate: (request.visitAt ?? now).isBefore(now)
          ? now
          : request.visitAt ?? now,
      helpText: l.pickNewDate,
    );
    if (date == null || !context.mounted) return;
    store.addRequestNote(request.id, l.rescheduleNote(fullDate(context, date)));
    await contactJogooAbout(
      context,
      title: l.rescheduleSentTitle,
      body: l.rescheduleSentBody,
      message: l.waReschedule(request.id, fullDate(context, date)),
    );
  }
}

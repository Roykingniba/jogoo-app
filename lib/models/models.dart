import 'package:flutter/widgets.dart';

import '../app/theme.dart';

/// Content written by JOGOO in both languages (product names, guides...).
/// Text typed by the client is stored once and shown as typed: [Bi.same].
class Bi {
  const Bi(this.en, this.fr);
  const Bi.same(String text) : en = text, fr = text;

  final String en;
  final String fr;

  String of(BuildContext context) =>
      Localizations.localeOf(context).languageCode == 'fr' ? fr : en;
}

class Person {
  const Person({required this.name, required this.role, required this.phone});

  final String name;
  final Bi role;
  final String phone;
}

enum EquipmentHealth { good, open, dueSoon }

enum TimelineState { done, current, due, pending }

class MaintenanceStep {
  const MaintenanceStep({
    required this.title,
    required this.state,
    required this.date,
    this.note,
    this.price,
    this.partCode,
  });

  final Bi title;
  final TimelineState state;
  final DateTime date;
  final Bi? note;
  final int? price;

  /// Spare part to order when this step is due.
  final String? partCode;
}

class Equipment {
  const Equipment({
    required this.id,
    required this.name,
    required this.shortName,
    required this.serial,
    required this.health,
    required this.healthNote,
    required this.installedOn,
    required this.warrantyMonths,
    required this.warrantyMonthsLeft,
    required this.icon,
    required this.tone,
    this.photo,
    this.lastService,
    this.nextVisit,
    this.maintenance = const [],
  });

  final String id;
  final Bi name;
  final Bi shortName;
  final String serial;
  final EquipmentHealth health;
  final Bi healthNote;
  final DateTime installedOn;
  final int warrantyMonths;
  final int warrantyMonthsLeft;
  final IconData icon;
  final Tone tone;
  final String? photo;
  final DateTime? lastService;
  final DateTime? nextVisit;
  final List<MaintenanceStep> maintenance;

  bool get underWarranty => warrantyMonthsLeft > 0;
}

enum ProductCategory { filters, valves, sprinklers, pivots, kits }

class AddOn {
  const AddOn({
    required this.id,
    required this.title,
    required this.price,
    required this.icon,
    required this.tone,
    this.fittingDate,
    this.selectedByDefault = false,
  });

  final String id;
  final Bi title;
  final int price;
  final IconData icon;
  final Tone tone;

  /// Set for the "Fitted by JOGOO" add-on, which shows its install date.
  final DateTime? fittingDate;
  final bool selectedByDefault;
}

class Product {
  const Product({
    required this.id,
    required this.name,
    required this.category,
    required this.price,
    required this.photo,
    this.fitNote,
    this.highlightFit = false,
    this.addOns = const [],
    this.recommended = false,
  });

  final String id;
  final Bi name;
  final ProductCategory category;
  final int price;
  final String photo;

  /// "Fits your drip kit", "For the plot C extension"...
  final Bi? fitNote;

  /// Green "fits" notes confirm compatibility; grey ones explain the use.
  final bool highlightFit;
  final List<AddOn> addOns;

  /// Shown under "Picked for your farm" and "For you".
  final bool recommended;
}

class SparePart {
  const SparePart({
    required this.code,
    required this.name,
    required this.price,
    required this.equipmentId,
    required this.icon,
    required this.tone,
    this.dueOn,
  });

  final String code;
  final Bi name;
  final int price;
  final String equipmentId;
  final IconData icon;
  final Tone tone;
  final DateTime? dueOn;
}

class FarmInput {
  const FarmInput({
    required this.id,
    required this.name,
    required this.note,
    required this.icon,
    required this.tone,
    this.lastBought,
  });

  final String id;
  final Bi name;
  final Bi note;
  final IconData icon;
  final Tone tone;
  final DateTime? lastBought;
}

enum RequestStepKind { received, diagnosed, booked, fixed }

class RequestStep {
  const RequestStep({
    required this.kind,
    this.title,
    this.note,
    this.at,
    this.done = false,
  });

  final RequestStepKind kind;

  /// Overrides the standard label, e.g. the diagnosis itself.
  final Bi? title;
  final Bi? note;
  final DateTime? at;
  final bool done;
}

class ServiceRequest {
  const ServiceRequest({
    required this.id,
    required this.equipmentId,
    required this.title,
    required this.createdAt,
    required this.steps,
    this.description,
    this.technician,
    this.visitAt,
    this.resolvedOn,
    this.rating,
    this.mediaPaths = const [],
    this.notes = const [],
  });

  final String id;
  final String equipmentId;
  final Bi title;
  final DateTime createdAt;
  final List<RequestStep> steps;
  final String? description;
  final Person? technician;
  final DateTime? visitAt;
  final DateTime? resolvedOn;
  final int? rating;
  final List<String> mediaPaths;
  final List<String> notes;

  bool get isOpen => resolvedOn == null;

  ServiceRequest copyWith({int? rating, List<String>? notes}) => ServiceRequest(
    id: id,
    equipmentId: equipmentId,
    title: title,
    createdAt: createdAt,
    steps: steps,
    description: description,
    technician: technician,
    visitAt: visitAt,
    resolvedOn: resolvedOn,
    rating: rating ?? this.rating,
    mediaPaths: mediaPaths,
    notes: notes ?? this.notes,
  );
}

class TrackStep {
  const TrackStep({required this.title, this.note, this.at, this.done = false});

  final Bi title;
  final Bi? note;
  final DateTime? at;
  final bool done;
}

class Order {
  const Order({
    required this.id,
    required this.item,
    required this.total,
    required this.orderedOn,
    required this.steps,
    this.arrivalWindow,
    this.dropOff,
    this.collectionCode,
    this.driver,
    this.delivered = false,
  });

  final String id;
  final Bi item;
  final int total;
  final DateTime orderedOn;
  final List<TrackStep> steps;
  final Bi? arrivalWindow;
  final String? dropOff;
  final String? collectionCode;
  final Person? driver;
  final bool delivered;
}

class Invoice {
  const Invoice({
    required this.id,
    required this.title,
    required this.amount,
    required this.issuedOn,
    required this.paid,
  });

  final String id;
  final Bi title;
  final int amount;
  final DateTime issuedOn;
  final bool paid;
}

enum GuideKind { video, article, cropSheet }

class Guide {
  const Guide({
    required this.id,
    required this.title,
    required this.kind,
    required this.minutes,
    required this.body,
    required this.icon,
    required this.tone,
    this.photo,
    this.savedOffline = false,
  });

  final String id;
  final Bi title;
  final GuideKind kind;
  final int minutes;
  final Bi body;
  final IconData icon;
  final Tone tone;
  final String? photo;
  final bool savedOffline;
}

enum DocumentType { plan, electrical, warranty, specification, manual }

class FarmDocument {
  const FarmDocument({
    required this.id,
    required this.equipmentId,
    required this.title,
    required this.type,
    required this.sizeMb,
    required this.savedOffline,
  });

  final String id;
  final String equipmentId;
  final Bi title;
  final DocumentType type;
  final double sizeMb;
  final bool savedOffline;
}

enum LogEntryType { service, partReplaced, fertigation }

class LogEntry {
  const LogEntry({
    required this.id,
    required this.equipmentId,
    required this.type,
    required this.title,
    required this.date,
    required this.loggedBy,
    required this.synced,
    this.checklist = const [],
  });

  final String id;
  final String equipmentId;
  final LogEntryType type;
  final Bi title;
  final DateTime date;
  final String loggedBy;
  final bool synced;
  final List<String> checklist;
}

class AppNotification {
  const AppNotification({
    required this.title,
    required this.detail,
    required this.at,
    required this.icon,
    required this.tone,
    this.unread = false,
  });

  final Bi title;
  final Bi detail;
  final DateTime at;
  final IconData icon;
  final Tone tone;
  final bool unread;
}

class WateringPlot {
  const WateringPlot({
    required this.badge,
    required this.name,
    required this.schedule,
    required this.tone,
  });

  final String badge;
  final Bi name;
  final Bi schedule;
  final Tone tone;
}

enum ChatAuthor { client, mia, agronomist }

class ChatMessage {
  const ChatMessage({
    required this.author,
    required this.text,
    this.photo,
    this.photoFile,
    this.guideId,
    this.sender,
  });

  final ChatAuthor author;
  final Bi text;

  /// Bundled image (demo history) or a photo taken on the phone.
  final String? photo;
  final String? photoFile;

  /// Guide in the Learn library linked from Mia's answer.
  final String? guideId;

  /// Team name shown above agronomist replies.
  final Bi? sender;
}

enum SeasonGoal { higherYields, moreLandWatered, saveWater, lessLabour }

enum NotificationChannel { push, sms, whatsApp }

class FarmProfile {
  const FarmProfile({
    required this.clientName,
    required this.firstName,
    required this.clientSince,
    required this.location,
    required this.areaHa,
    required this.crops,
  });

  final String clientName;
  final String firstName;
  final DateTime clientSince;
  final String location;
  final double areaHa;
  final List<Bi> crops;

  FarmProfile copyWith({String? location, double? areaHa}) => FarmProfile(
    clientName: clientName,
    firstName: firstName,
    clientSince: clientSince,
    location: location ?? this.location,
    areaHa: areaHa ?? this.areaHa,
    crops: crops,
  );
}

/// A quote or price request passed to JOGOO sales (Zoho CRM via Mia).
class SalesRequest {
  const SalesRequest({required this.subject, required this.at});

  final Bi subject;
  final DateTime at;
}

class CartLine {
  const CartLine({
    required this.id,
    required this.title,
    required this.unitPrice,
    this.quantity = 1,
  });

  final String id;
  final Bi title;
  final int unitPrice;
  final int quantity;

  int get total => unitPrice * quantity;
}

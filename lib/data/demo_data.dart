import 'package:flutter/material.dart';

import '../app/theme.dart';
import '../models/models.dart';

/// Demo content for the design persona (Royking Niba, Obala). It stands in
/// for the Supabase/PowerSync data until the backend data model is agreed.
abstract final class DemoData {
  static const jogooPhone = '+237653291311';
  static const jogooPhoneDisplay = '+237 6 53 29 13 11';
  static const whatsAppNumber = '237653291311';

  static const _img = 'assets/images';
  static const dripPhoto = '$_img/drip_line.jpg';
  static const fieldPhoto = '$_img/field.jpg';

  static final profile = FarmProfile(
    clientName: 'Royking Niba',
    firstName: 'Royking',
    clientSince: DateTime(2026, 3),
    location: 'Obala, Centre',
    areaHa: 3,
    crops: const [
      Bi('Tomato', 'Tomate'),
      Bi('Chilli pepper', 'Piment'),
      Bi('Cucumber', 'Concombre'),
    ],
  );

  static const sergeMbida = Person(
    name: 'Serge Mbida',
    role: Bi('Pump technician', 'Technicien pompe'),
    phone: '+237677000101',
  );

  static const paulAteba = Person(
    name: 'Paul Ateba',
    role: Bi('Driver', 'Chauffeur'),
    phone: '+237677000202',
  );

  static final equipment = [
    Equipment(
      id: 'drip-kit',
      name: const Bi('Drip kit, 2 ha', 'Kit goutte-à-goutte, 2 ha'),
      shortName: const Bi('Drip kit', 'Goutte-à-goutte'),
      serial: 'DK2-0312',
      health: EquipmentHealth.dueSoon,
      healthNote: const Bi(
        'Filter due in 12 days',
        'Filtre à changer dans 12 jours',
      ),
      installedOn: DateTime(2026, 3, 12),
      warrantyMonths: 24,
      warrantyMonthsLeft: 17,
      icon: Icons.water_drop_outlined,
      tone: Tone.lime,
      photo: fieldPhoto,
      lastService: DateTime(2026, 7, 2),
      nextVisit: DateTime(2026, 10, 9),
      maintenance: [
        MaintenanceStep(
          title: const Bi('Lines flushed', 'Lignes rincées'),
          state: TimelineState.done,
          date: DateTime(2026, 7, 2),
        ),
        MaintenanceStep(
          title: const Bi('System check-up', 'Contrôle du système'),
          state: TimelineState.current,
          date: DateTime(2026, 10, 9),
          note: const Bi('with your pump visit', 'avec la visite pompe'),
        ),
        MaintenanceStep(
          title: const Bi('New filter cartridge', 'Nouvelle cartouche filtre'),
          state: TimelineState.due,
          date: DateTime(2026, 10, 18),
          price: 18500,
          partCode: 'DF-120',
        ),
      ],
    ),
    Equipment(
      id: 'solar-pump',
      name: const Bi('Solar pump, 3 kW', 'Pompe solaire, 3 kW'),
      shortName: const Bi('Solar pump', 'Pompe solaire'),
      serial: 'SP3-0412',
      health: EquipmentHealth.open,
      healthNote: const Bi('Visit Fri 9 Oct', 'Visite ven. 9 oct.'),
      installedOn: DateTime(2026, 3, 12),
      warrantyMonths: 24,
      warrantyMonthsLeft: 17,
      icon: Icons.wb_sunny_outlined,
      tone: Tone.pink,
      lastService: DateTime(2026, 7, 2),
      nextVisit: DateTime(2026, 10, 9, 10),
      maintenance: [
        MaintenanceStep(
          title: const Bi('Panels cleaned', 'Panneaux nettoyés'),
          state: TimelineState.done,
          date: DateTime(2026, 7, 2),
        ),
        MaintenanceStep(
          title: const Bi('Pump pressure check', 'Contrôle de pression'),
          state: TimelineState.current,
          date: DateTime(2026, 10, 9),
          note: const Bi('request SR-1042', 'demande SR-1042'),
        ),
      ],
    ),
    Equipment(
      id: 'greenhouse',
      name: const Bi('Greenhouse 8×30 m', 'Serre 8×30 m'),
      shortName: const Bi('Greenhouse', 'Serre'),
      serial: 'GH8-0520',
      health: EquipmentHealth.good,
      healthNote: const Bi('Tomatoes · all good', 'Tomates · tout va bien'),
      installedOn: DateTime(2026, 9, 2),
      warrantyMonths: 36,
      warrantyMonthsLeft: 33,
      icon: Icons.foundation_outlined,
      tone: Tone.lime,
      lastService: DateTime(2026, 9, 29),
      maintenance: [
        MaintenanceStep(
          title: const Bi('Door repaired', 'Porte réparée'),
          state: TimelineState.done,
          date: DateTime(2026, 9, 29),
        ),
        MaintenanceStep(
          title: const Bi('Film tension check', 'Contrôle de la bâche'),
          state: TimelineState.pending,
          date: DateTime(2027, 1, 15),
        ),
      ],
    ),
  ];

  static final products = [
    Product(
      id: 'fertigation-kit',
      name: const Bi('Fertigation kit', 'Kit de fertigation'),
      category: ProductCategory.kits,
      price: 85000,
      photo: dripPhoto,
      fitNote: const Bi('Fits your drip kit', 'Compatible avec votre goutte-à-goutte'),
      highlightFit: true,
      recommended: true,
      addOns: [
        AddOn(
          id: 'fitting',
          title: const Bi('Fitted on {date}', 'Posé le {date}'),
          price: 15000,
          icon: Icons.build_outlined,
          tone: Tone.blue,
          fittingDate: DateTime(2026, 10, 9),
          selectedByDefault: true,
        ),
        const AddOn(
          id: 'npk-25',
          title: Bi('NPK 20-20-20, 25 kg', 'NPK 20-20-20, 25 kg'),
          price: 32000,
          icon: Icons.science_outlined,
          tone: Tone.lime,
        ),
      ],
    ),
    const Product(
      id: 'double-disc-filter',
      name: Bi('Double disc filter', 'Double filtre à disques'),
      category: ProductCategory.filters,
      price: 64000,
      photo: '$_img/disc_filter.jpg',
      fitNote: Bi('Fits your drip kit', 'Compatible avec votre goutte-à-goutte'),
      highlightFit: true,
      recommended: true,
    ),
    const Product(
      id: 'ring-mini-valve',
      name: Bi('Ring mini valve', 'Mini vanne à bague'),
      category: ProductCategory.valves,
      price: 2500,
      photo: '$_img/ring_valve.jpg',
      fitNote: Bi('For the plot C extension', "Pour l'extension parcelle C"),
      recommended: true,
    ),
    const Product(
      id: 'blue-sprinkler',
      name: Bi('Impact sprinkler', 'Asperseur à impact'),
      category: ProductCategory.sprinklers,
      price: 12500,
      photo: '$_img/sprinkler.jpg',
      fitNote: Bi('For nursery beds', 'Pour les pépinières'),
    ),
    const Product(
      id: 'center-pivot',
      name: Bi('Centre pivot', 'Pivot central'),
      category: ProductCategory.pivots,
      price: 0,
      photo: '$_img/pivot.jpg',
      fitNote: Bi('Price on quote', 'Prix sur devis'),
    ),
  ];

  static final spareParts = [
    SparePart(
      code: 'DF-120',
      name: const Bi('Disc filter cartridge', 'Cartouche filtre à disques'),
      price: 18500,
      equipmentId: 'drip-kit',
      icon: Icons.radio_button_checked,
      tone: Tone.orange,
      dueOn: DateTime(2026, 10, 18),
    ),
    const SparePart(
      code: 'DL-16',
      name: Bi('Dripline 16 mm, 100 m', 'Gaine 16 mm, 100 m'),
      price: 27000,
      equipmentId: 'drip-kit',
      icon: Icons.water_drop_outlined,
      tone: Tone.cyan,
    ),
    const SparePart(
      code: 'GV-32',
      name: Bi('Gate valve 32 mm', 'Vanne 32 mm'),
      price: 9500,
      equipmentId: 'drip-kit',
      icon: Icons.control_point,
      tone: Tone.blue,
    ),
    const SparePart(
      code: 'PG-06',
      name: Bi('Pressure gauge 0 to 6 bar', 'Manomètre 0 à 6 bar'),
      price: 6000,
      equipmentId: 'drip-kit',
      icon: Icons.speed,
      tone: Tone.lime,
    ),
    const SparePart(
      code: 'SP-IMP',
      name: Bi('Pump impeller', 'Turbine de pompe'),
      price: 42000,
      equipmentId: 'solar-pump',
      icon: Icons.cyclone,
      tone: Tone.pink,
    ),
    const SparePart(
      code: 'SP-CBL',
      name: Bi('Solar cable 6 mm², 10 m', 'Câble solaire 6 mm², 10 m'),
      price: 15000,
      equipmentId: 'solar-pump',
      icon: Icons.cable,
      tone: Tone.orange,
    ),
    const SparePart(
      code: 'GH-FLM',
      name: Bi('Greenhouse film repair tape', 'Ruban de réparation de bâche'),
      price: 7500,
      equipmentId: 'greenhouse',
      icon: Icons.healing_outlined,
      tone: Tone.lime,
    ),
    const SparePart(
      code: 'GH-NET',
      name: Bi('Insect-proof net 8×30 m', 'Filet insect-proof 8×30 m'),
      price: 58000,
      equipmentId: 'greenhouse',
      icon: Icons.grid_on,
      tone: Tone.blue,
    ),
  ];

  static final usualInput = FarmInput(
    id: 'npk-25',
    name: const Bi('NPK 20-20-20, 25 kg', 'NPK 20-20-20, 25 kg'),
    note: const Bi('Water-soluble fertiliser', 'Engrais hydrosoluble'),
    icon: Icons.spa_outlined,
    tone: Tone.lime,
    lastBought: DateTime(2026, 9, 2),
  );

  /// Bags of NPK recommended per hectare per season.
  static const npkBagsPerHa = 4 / 3;
  static const npkBagPrice = 32000;

  static final otherInputs = [
    FarmInput(
      id: 'calcium-nitrate',
      name: const Bi('Calcium nitrate, 25 kg', 'Nitrate de calcium, 25 kg'),
      note: const Bi('Last bought {date}', 'Dernier achat le {date}'),
      icon: Icons.science_outlined,
      tone: Tone.cyan,
      lastBought: DateTime(2026, 8, 14),
    ),
    const FarmInput(
      id: 'seed-inoculant',
      name: Bi('Seed inoculant, 1 kg', 'Inoculant de semences, 1 kg'),
      note: Bi('For next sowing', 'Pour le prochain semis'),
      icon: Icons.grain,
      tone: Tone.orange,
    ),
    const FarmInput(
      id: 'crop-protection',
      name: Bi('Crop protection pack', 'Pack protection des cultures'),
      note: Bi('Advised for the rainy season', 'Conseillé en saison des pluies'),
      icon: Icons.shield_outlined,
      tone: Tone.pink,
    ),
  ];

  static final serviceRequests = [
    ServiceRequest(
      id: 'SR-1042',
      equipmentId: 'solar-pump',
      title: const Bi('Pump pressure', 'Pression de la pompe'),
      createdAt: DateTime(2026, 10, 6, 8, 12),
      technician: sergeMbida,
      visitAt: DateTime(2026, 10, 9, 10),
      steps: [
        RequestStep(
          kind: RequestStepKind.received,
          at: DateTime(2026, 10, 6, 8, 12),
          done: true,
        ),
        RequestStep(
          kind: RequestStepKind.diagnosed,
          title: const Bi('Likely a clogged filter', 'Filtre probablement colmaté'),
          at: DateTime(2026, 10, 6, 9, 30),
          done: true,
        ),
        const RequestStep(kind: RequestStepKind.booked),
        const RequestStep(kind: RequestStepKind.fixed),
      ],
    ),
    ServiceRequest(
      id: 'SR-1031',
      equipmentId: 'greenhouse',
      title: const Bi('Greenhouse door', 'Porte de la serre'),
      createdAt: DateTime(2026, 9, 25, 14),
      technician: sergeMbida,
      visitAt: DateTime(2026, 9, 29, 9),
      resolvedOn: DateTime(2026, 9, 29),
      steps: [
        RequestStep(
          kind: RequestStepKind.received,
          at: DateTime(2026, 9, 25, 14),
          done: true,
        ),
        RequestStep(
          kind: RequestStepKind.diagnosed,
          title: const Bi('Hinge bent by wind', 'Charnière tordue par le vent'),
          at: DateTime(2026, 9, 26, 9),
          done: true,
        ),
        RequestStep(
          kind: RequestStepKind.booked,
          at: DateTime(2026, 9, 26, 10),
          done: true,
        ),
        RequestStep(
          kind: RequestStepKind.fixed,
          at: DateTime(2026, 9, 29, 11),
          done: true,
        ),
      ],
    ),
  ];

  static final orders = [
    Order(
      id: 'JG-0418',
      item: const Bi('Insect-proof net 8×30 m', 'Filet insect-proof 8×30 m'),
      total: 58000,
      orderedOn: DateTime(2026, 10, 6, 10, 12),
      arrivalWindow: const Bi('Thu 8 Oct, afternoon', 'Jeu. 8 oct., après-midi'),
      dropOff: 'Obala',
      collectionCode: '4827',
      driver: paulAteba,
      steps: [
        TrackStep(
          title: const Bi('Order confirmed', 'Commande confirmée'),
          at: DateTime(2026, 10, 6, 10, 12),
          done: true,
        ),
        TrackStep(
          title: const Bi('Packed at Yaoundé hub', 'Préparée au dépôt de Yaoundé'),
          at: DateTime(2026, 10, 7, 15, 40),
          done: true,
        ),
        TrackStep(
          title: const Bi('On the road', 'En route'),
          note: const Bi('driver Paul Ateba', 'chauffeur Paul Ateba'),
          at: DateTime(2026, 10, 8, 7, 30),
        ),
        const TrackStep(title: Bi('Ready to collect', 'Prête au retrait')),
      ],
    ),
    Order(
      id: 'JG-0377',
      item: const Bi('NPK 20-20-20, 25 kg × 4', 'NPK 20-20-20, 25 kg × 4'),
      total: 128000,
      orderedOn: DateTime(2026, 9, 2, 9),
      delivered: true,
      steps: [
        TrackStep(
          title: const Bi('Order confirmed', 'Commande confirmée'),
          at: DateTime(2026, 9, 2, 9),
          done: true,
        ),
        TrackStep(
          title: const Bi('Collected', 'Retirée'),
          at: DateTime(2026, 9, 4, 16),
          done: true,
        ),
      ],
    ),
  ];

  static final invoices = [
    Invoice(
      id: 'F-2026-0418',
      title: const Bi('Insect-proof net', 'Filet insect-proof'),
      amount: 58000,
      issuedOn: DateTime(2026, 10, 6),
      paid: false,
    ),
    Invoice(
      id: 'F-2026-0377',
      title: const Bi('NPK 20-20-20 × 4', 'NPK 20-20-20 × 4'),
      amount: 128000,
      issuedOn: DateTime(2026, 9, 2),
      paid: true,
    ),
    Invoice(
      id: 'F-2026-0112',
      title: const Bi('Drip kit and solar pump', 'Goutte-à-goutte et pompe solaire'),
      amount: 2450000,
      issuedOn: DateTime(2026, 3, 12),
      paid: true,
    ),
  ];

  static const seasonAlert = (
    title: Bi('Rainy season alert', 'Alerte saison des pluies'),
    body: Bi('Watch tomatoes for late blight', 'Surveillez le mildiou des tomates'),
  );

  static const guides = [
    Guide(
      id: 'flush-lines',
      title: Bi('Flush your drip lines', 'Rincer vos lignes goutte-à-goutte'),
      kind: GuideKind.video,
      minutes: 4,
      icon: Icons.play_arrow_rounded,
      tone: Tone.blue,
      photo: dripPhoto,
      savedOffline: true,
      body: Bi(
        'Open the end caps of each lateral, run the system for 3 minutes until '
            'the water runs clear, then close the caps. Do it once a month and '
            'after every fertigation.',
        "Ouvrez les bouchons en bout de chaque latéral, faites tourner le "
            "système 3 minutes jusqu'à ce que l'eau soit claire, puis refermez. "
            'À faire chaque mois et après chaque fertigation.',
      ),
    ),
    Guide(
      id: 'clean-filter',
      title: Bi('Clean the pump filter', 'Nettoyer le filtre de la pompe'),
      kind: GuideKind.video,
      minutes: 3,
      icon: Icons.play_arrow_rounded,
      tone: Tone.blue,
      photo: fieldPhoto,
      savedOffline: true,
      body: Bi(
        'Switch the pump off, open the filter housing, rinse the discs in clean '
            'water and check the seal before closing. A clean filter keeps the '
            'pressure up.',
        "Arrêtez la pompe, ouvrez le boîtier du filtre, rincez les disques à "
            "l'eau propre et vérifiez le joint avant de refermer. Un filtre "
            'propre garde la pression.',
      ),
    ),
    Guide(
      id: 'dry-season',
      title: Bi('Dry season watering', 'Arrosage en saison sèche'),
      kind: GuideKind.video,
      minutes: 6,
      icon: Icons.play_arrow_rounded,
      tone: Tone.blue,
      photo: fieldPhoto,
      savedOffline: true,
      body: Bi(
        'Water early in the morning, check the soil at root depth before each '
            'cycle and lengthen cycles rather than adding more of them.',
        "Arrosez tôt le matin, vérifiez l'humidité au niveau des racines avant "
            "chaque cycle et allongez les cycles plutôt que d'en ajouter.",
      ),
    ),
    Guide(
      id: 'late-blight',
      title: Bi('Tomato late blight', 'Mildiou de la tomate'),
      kind: GuideKind.article,
      minutes: 6,
      icon: Icons.coronavirus_outlined,
      tone: Tone.pink,
      savedOffline: true,
      body: Bi(
        'Late blight shows as brown patches on leaves, often after rain. Remove '
            'affected leaves, water only in the morning, keep the foliage dry '
            'and ask JOGOO about a protection treatment before it spreads.',
        'Le mildiou apparaît en taches brunes sur les feuilles, souvent après '
            'la pluie. Retirez les feuilles touchées, arrosez seulement le '
            'matin, gardez le feuillage sec et demandez à JOGOO un traitement '
            'avant que la maladie ne se propage.',
      ),
    ),
    Guide(
      id: 'chilli-sheet',
      title: Bi('Crop sheet: chilli pepper', 'Fiche culture : piment'),
      kind: GuideKind.cropSheet,
      minutes: 8,
      icon: Icons.description_outlined,
      tone: Tone.lime,
      savedOffline: true,
      body: Bi(
        'Chilli pepper likes steady moisture: water every 2 days for about '
            '40 minutes on drip, feed with a potassium-rich mix at flowering '
            'and harvest every week once fruits colour.',
        "Le piment aime une humidité régulière : arrosez tous les 2 jours "
            "environ 40 minutes au goutte-à-goutte, apportez un mélange riche "
            'en potassium à la floraison et récoltez chaque semaine dès que '
            'les fruits colorent.',
      ),
    ),
  ];

  static const documents = [
    FarmDocument(
      id: 'dk-layout',
      equipmentId: 'drip-kit',
      title: Bi('As-built layout plan', "Plan d'implantation"),
      type: DocumentType.plan,
      sizeMb: 2.4,
      savedOffline: true,
    ),
    FarmDocument(
      id: 'dk-wiring',
      equipmentId: 'drip-kit',
      title: Bi('Pump wiring diagram', 'Schéma électrique de la pompe'),
      type: DocumentType.electrical,
      sizeMb: 1.1,
      savedOffline: true,
    ),
    FarmDocument(
      id: 'dk-warranty',
      equipmentId: 'drip-kit',
      title: Bi('Warranty contract', 'Contrat de garantie'),
      type: DocumentType.warranty,
      sizeMb: 0.3,
      savedOffline: true,
    ),
    FarmDocument(
      id: 'dk-spec',
      equipmentId: 'drip-kit',
      title: Bi('System design specification', 'Cahier des charges du système'),
      type: DocumentType.specification,
      sizeMb: 3.8,
      savedOffline: false,
    ),
    FarmDocument(
      id: 'gh-plan',
      equipmentId: 'greenhouse',
      title: Bi('Greenhouse layout plan', 'Plan de la serre'),
      type: DocumentType.plan,
      sizeMb: 1.6,
      savedOffline: true,
    ),
    FarmDocument(
      id: 'gh-warranty',
      equipmentId: 'greenhouse',
      title: Bi('Warranty contract', 'Contrat de garantie'),
      type: DocumentType.warranty,
      sizeMb: 0.3,
      savedOffline: true,
    ),
    FarmDocument(
      id: 'gh-manual',
      equipmentId: 'greenhouse',
      title: Bi('Greenhouse assembly guide', 'Guide de montage de la serre'),
      type: DocumentType.manual,
      sizeMb: 4.2,
      savedOffline: false,
    ),
    FarmDocument(
      id: 'dk-manual',
      equipmentId: 'drip-kit',
      title: Bi('Drip kit user manual', 'Manuel du kit goutte-à-goutte'),
      type: DocumentType.manual,
      sizeMb: 2.9,
      savedOffline: true,
    ),
  ];

  static final logEntries = [
    LogEntry(
      id: 'log-3',
      equipmentId: 'drip-kit',
      type: LogEntryType.fertigation,
      title: const Bi(
        'Fertigation: NPK 20-20-20, 2 kg in 200 L',
        'Fertigation : NPK 20-20-20, 2 kg dans 200 L',
      ),
      date: DateTime(2026, 10, 6),
      loggedBy: 'Royking Niba',
      synced: false,
    ),
    LogEntry(
      id: 'log-2',
      equipmentId: 'drip-kit',
      type: LogEntryType.partReplaced,
      title: const Bi('Valve replaced, plot B, 32 mm', 'Vanne remplacée, parcelle B, 32 mm'),
      date: DateTime(2026, 10, 2),
      loggedBy: 'Serge Mbida, JOGOO',
      synced: true,
    ),
    LogEntry(
      id: 'log-1',
      equipmentId: 'drip-kit',
      type: LogEntryType.service,
      title: const Bi('Lines flushed, filter cleaned', 'Lignes rincées, filtre nettoyé'),
      date: DateTime(2026, 7, 2),
      loggedBy: 'Serge Mbida, JOGOO',
      synced: true,
    ),
  ];

  static final notifications = [
    AppNotification(
      title: const Bi('Your order is on the road', 'Votre commande est en route'),
      detail: const Bi('JG-0418', 'JG-0418'),
      at: DateTime(2026, 10, 6, 7, 30),
      icon: Icons.local_shipping_outlined,
      tone: Tone.cyan,
      unread: true,
    ),
    AppNotification(
      title: const Bi('Rain this afternoon', 'Pluie cet après-midi'),
      detail: const Bi(
        'Skip the afternoon drip cycle',
        "Sautez le cycle d'arrosage de l'après-midi",
      ),
      at: DateTime(2026, 10, 6, 6),
      icon: Icons.thunderstorm_outlined,
      tone: Tone.blue,
      unread: true,
    ),
    AppNotification(
      title: const Bi('Filter cartridge due in 12 days', 'Cartouche filtre dans 12 jours'),
      detail: const Bi('Drip kit, 2 ha', 'Kit goutte-à-goutte, 2 ha'),
      at: DateTime(2026, 10, 6, 5),
      icon: Icons.radio_button_checked,
      tone: Tone.orange,
    ),
    AppNotification(
      title: const Bi('Visit confirmed for Fri 9 Oct', 'Visite confirmée le ven. 9 oct.'),
      detail: const Bi('Solar pump', 'Pompe solaire'),
      at: DateTime(2026, 10, 5, 16),
      icon: Icons.event_available_outlined,
      tone: Tone.lime,
    ),
    AppNotification(
      title: const Bi('The agronomists replied', 'Les agronomes ont répondu'),
      detail: const Bi('Watering plan updated', "Plan d'arrosage mis à jour"),
      at: DateTime(2026, 10, 5, 11),
      icon: Icons.chat_bubble_outline,
      tone: Tone.pink,
    ),
  ];

  static final wateringPlanUpdated = DateTime(2026, 10, 6);

  static const wateringPlan = [
    WateringPlot(
      badge: 'A',
      name: Bi('Plot A · tomatoes', 'Parcelle A · tomates'),
      schedule: Bi('Mornings only, 30 min', 'Le matin uniquement, 30 min'),
      tone: Tone.pink,
    ),
    WateringPlot(
      badge: 'B',
      name: Bi('Plot B · chilli pepper', 'Parcelle B · piment'),
      schedule: Bi('Every 2 days, 40 min', 'Tous les 2 jours, 40 min'),
      tone: Tone.orange,
    ),
    WateringPlot(
      badge: 'S',
      name: Bi('Greenhouse · tomatoes', 'Serre · tomates'),
      schedule: Bi('Daily, 20 min', 'Tous les jours, 20 min'),
      tone: Tone.lime,
    ),
  ];

  static const agronomistChat = [
    ChatMessage(
      author: ChatAuthor.agronomist,
      sender: Bi('JOGOO engineering team', 'Équipe technique JOGOO'),
      text: Bi(
        'Your tomatoes are flowering. Switch to a potassium-rich fertigation '
            'mix from next week.',
        'Vos tomates sont en fleur. Passez à un mélange de fertigation riche '
            'en potassium dès la semaine prochaine.',
      ),
    ),
    ChatMessage(
      author: ChatAuthor.client,
      text: Bi.same('Thanks. Can you send the mix for 200 L?'),
    ),
  ];

  static const miaChat = [
    ChatMessage(
      author: ChatAuthor.mia,
      text: Bi(
        'Good morning Royking. How can I help today?',
        "Bonjour Royking. Comment puis-je vous aider aujourd'hui ?",
      ),
    ),
    ChatMessage(
      author: ChatAuthor.client,
      text: Bi.same('My tomato leaves have brown patches since the rains.'),
    ),
    ChatMessage(author: ChatAuthor.client, text: Bi.same(''), photo: fieldPhoto),
    ChatMessage(
      author: ChatAuthor.mia,
      text: Bi(
        'This may be early late blight. Remove the affected leaves and water '
            'only in the morning.',
        "Il peut s'agir d'un début de mildiou. Retirez les feuilles touchées "
            "et arrosez uniquement le matin.",
      ),
      guideId: 'late-blight',
    ),
  ];
}

// ignore: unused_import
import 'package:intl/intl.dart' as intl;

import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for French (`fr`).
class AppLocalizationsFr extends AppLocalizations {
  AppLocalizationsFr([String locale = 'fr']) : super(locale);

  @override
  String get appTitle => 'Jogoo';

  @override
  String get navHome => 'Accueil';

  @override
  String get navMyFarm => 'Ma ferme';

  @override
  String get navShop => 'Boutique';

  @override
  String get navLearn => 'Apprendre';

  @override
  String get navService => 'SAV';

  @override
  String get back => 'Retour';

  @override
  String get close => 'Fermer';

  @override
  String get cancel => 'Annuler';

  @override
  String get save => 'Enregistrer';

  @override
  String get send => 'Envoyer';

  @override
  String get edit => 'Modifier';

  @override
  String get add => 'Ajouter';

  @override
  String get added => 'Ajouté';

  @override
  String get remove => 'Retirer';

  @override
  String get view => 'Voir';

  @override
  String get open => 'Ouvrir';

  @override
  String get find => 'Chercher';

  @override
  String get share => 'Partager';

  @override
  String get call => 'Appeler';

  @override
  String get track => 'Suivre';

  @override
  String get order => 'Commander';

  @override
  String get request => 'Demander';

  @override
  String get total => 'Total';

  @override
  String get today => 'Aujourd\'hui';

  @override
  String get earlier => 'Plus tôt';

  @override
  String get yesterday => 'hier';

  @override
  String get download => 'Télécharger';

  @override
  String get savedOffline => 'Enregistré hors ligne';

  @override
  String get comingSoonTitle => 'Prévu dans une prochaine version';

  @override
  String get comingSoonBody =>
      'Cette partie de l\'application n\'est pas encore prête.';

  @override
  String get cannotOpenLink => 'Ce téléphone n\'a pas pu ouvrir le lien.';

  @override
  String get cannotOpenCamera =>
      'Impossible d\'ouvrir l\'appareil photo ou la galerie.';

  @override
  String get takePhoto => 'Prendre une photo';

  @override
  String get recordVideo => 'Filmer une vidéo';

  @override
  String get chooseFromGallery => 'Choisir dans la galerie';

  @override
  String get sendPhoto => 'Envoyer une photo';

  @override
  String get callJogoo => 'Appeler JOGOO';

  @override
  String fillIn(String field) {
    return 'À renseigner : $field';
  }

  @override
  String greetingMorning(String name) {
    return 'Bonjour, $name';
  }

  @override
  String greetingAfternoon(String name) {
    return 'Bonjour, $name';
  }

  @override
  String greetingEvening(String name) {
    return 'Bonsoir, $name';
  }

  @override
  String get switchLanguage => 'Switch to English';

  @override
  String get openProfile => 'Ouvrir mon profil';

  @override
  String get askMia => 'Mia';

  @override
  String get nextVisit => 'Prochaine visite';

  @override
  String get confirmed => 'Confirmée';

  @override
  String equipmentCheck(String name) {
    return 'Contrôle : $name';
  }

  @override
  String get pickedForYourFarm => 'Pour votre ferme';

  @override
  String newCount(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count nouveautés',
      one: '1 nouveauté',
    );
    return '$_temp0';
  }

  @override
  String installationsAt(int count, String place) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count installations',
      one: '1 installation',
    );
    return '$_temp0 · $place';
  }

  @override
  String get addEquipment => 'Ajouter un équipement';

  @override
  String get addEquipmentBody =>
      'Décrivez une nouvelle installation ou un produit acheté ailleurs, puis envoyez-le à JOGOO sur WhatsApp pour que l\'équipe l\'ajoute à votre ferme.';

  @override
  String get addEquipmentHint => 'Par exemple : citerne 5 000 L';

  @override
  String get addEquipmentSavedTitle => 'Pas encore envoyé à JOGOO';

  @override
  String get addEquipmentSavedBody =>
      'Terminez l\'envoi sur WhatsApp ou appelez JOGOO pour que l\'équipe l\'ajoute à votre ferme.';

  @override
  String get tabEquipment => 'Équipements';

  @override
  String get tabOrders => 'Commandes';

  @override
  String get tabInvoices => 'Factures';

  @override
  String get statusGood => 'Bon';

  @override
  String get statusOpen => 'Ouverte';

  @override
  String get statusDueSoon => 'Bientôt';

  @override
  String get warrantyLeft => 'Garantie restante';

  @override
  String monthsOf(int left, int total) {
    return '$left sur $total mois';
  }

  @override
  String get myDocuments => 'Mes documents';

  @override
  String get maintenanceLog => 'Carnet d\'entretien';

  @override
  String get orderDelivered => 'Livrée';

  @override
  String get orderOnTheRoad => 'En route';

  @override
  String get invoicePaid => 'Payée';

  @override
  String get invoiceDue => 'À payer';

  @override
  String get equipmentTitle => 'Équipement';

  @override
  String installedOn(String date) {
    return 'Installé le $date';
  }

  @override
  String get workingWell => 'Fonctionne bien';

  @override
  String get requestOpen => 'Demande SAV en cours';

  @override
  String monthsShort(int count) {
    return '$count mois';
  }

  @override
  String get lastService => 'Dernier entretien';

  @override
  String get maintenance => 'Entretien';

  @override
  String doneOn(String date) {
    return 'Fait le $date';
  }

  @override
  String dueOn(String date) {
    return 'Prévu le $date';
  }

  @override
  String get reportProblem => 'Signaler un problème';

  @override
  String get bookService => 'Réserver un entretien';

  @override
  String bookServiceBody(String equipment) {
    return 'Pour une visite sur : $equipment, écrivez à JOGOO sur WhatsApp ou appelez. L\'application ne réserve pas encore de visite elle-même.';
  }

  @override
  String get visitRequestedTitle => 'Visite pas encore réservée';

  @override
  String get visitRequestedBody =>
      'Seulement noté sur cet écran. Fixez la date avec JOGOO sur WhatsApp ou par téléphone.';

  @override
  String get detailsCopied => 'Détails copiés';

  @override
  String get shopSubtitle => 'Gamme JOGOO, choisie pour votre ferme';

  @override
  String get searchProducts => 'Rechercher produits et pièces';

  @override
  String get searchResults => 'Résultats';

  @override
  String get noProducts =>
      'Aucun produit trouvé. Essayez un autre mot ou demandez à Mia.';

  @override
  String get catForYou => 'Pour vous';

  @override
  String get catFilters => 'Filtres';

  @override
  String get catValves => 'Vannes';

  @override
  String get catSprinklers => 'Asperseurs';

  @override
  String get catPivots => 'Pivots';

  @override
  String get catKits => 'Kits';

  @override
  String get upsellTitle => 'Irriguez votre dernier hectare';

  @override
  String get upsellBody => 'Étendez votre goutte-à-goutte à la parcelle C';

  @override
  String get getQuote => 'Demander un devis';

  @override
  String get forYourEquipment => 'Pour vos équipements';

  @override
  String get requestSavedTitle => 'Demande pas encore envoyée';

  @override
  String requestSavedBody(String item) {
    return '$item · seulement noté sur cet écran. Terminez sur WhatsApp ou appelez JOGOO.';
  }

  @override
  String get cart => 'Panier';

  @override
  String get cartTitle => 'Votre panier';

  @override
  String get cartEmpty => 'Votre panier est vide.';

  @override
  String get sendOrderRequest => 'Envoyer la commande sur WhatsApp';

  @override
  String get orderRequestSavedTitle =>
      'Commande non envoyée par l\'application';

  @override
  String get orderRequestSavedBody =>
      'Envoyez le message WhatsApp ou appelez JOGOO pour confirmer prix, pose et livraison.';

  @override
  String get paymentLater =>
      'Aucun paiement maintenant. Vous payez par mobile money une fois la commande confirmée par JOGOO.';

  @override
  String get saveForLater => 'Garder pour plus tard';

  @override
  String get priceOnQuote => 'Prix sur devis';

  @override
  String get addToCart => 'Ajouter au panier';

  @override
  String get addedToCart => 'Ajouté au panier';

  @override
  String get miaSubtitle => 'Votre assistante JOGOO';

  @override
  String get messageMia => 'Écrire à Mia';

  @override
  String get miaTyping => 'Mia écrit…';

  @override
  String get miaUnavailable =>
      'Mia n\'est pas encore connectée. Un conseiller JOGOO peut vous aider dès maintenant par téléphone ou WhatsApp.';

  @override
  String urgentCall(String phone) {
    return 'Urgent ? Appelez le $phone';
  }

  @override
  String get bookAgronomist => 'Réserver un agronome';

  @override
  String get talkToPerson => 'Parler à un conseiller';

  @override
  String readGuide(String title) {
    return 'Lire le guide : $title';
  }

  @override
  String get learnSubtitle => 'Guides des agronomes JOGOO';

  @override
  String get searchGuides => 'Rechercher un guide';

  @override
  String get noGuides =>
      'Aucun guide trouvé. Essayez un autre mot ou demandez à Mia.';

  @override
  String videoMinutes(int minutes) {
    return 'Vidéo · $minutes min';
  }

  @override
  String readMinutes(int minutes) {
    return '$minutes min de lecture';
  }

  @override
  String illustratedMinutes(int minutes) {
    return 'Guide illustré · $minutes min';
  }

  @override
  String get playVideo => 'Lire le guide illustré';

  @override
  String get illustratedWalkthrough => 'Guide illustré hors ligne';

  @override
  String walkthroughStep(int current, int total) {
    return 'Étape $current sur $total';
  }

  @override
  String get walkthroughOfflineNote =>
      'Guide de démonstration avec photos et texte intégrés. Aucune vidéo ni piste audio.';

  @override
  String get pauseWalkthrough => 'Mettre en pause';

  @override
  String get previousStep => 'Étape précédente';

  @override
  String get nextStep => 'Étape suivante';

  @override
  String get askMiaAboutThis => 'Poser une question à Mia';

  @override
  String get offlineLibrary => 'Bibliothèque hors ligne';

  @override
  String get librarySubtitle =>
      'Lire et suivre les guides illustrés sans internet';

  @override
  String get serviceHours => 'Lun. au ven., 9h00 à 18h00';

  @override
  String get actionReport => 'Signaler';

  @override
  String get actionBookVisit => 'Réserver';

  @override
  String get actionWarranty => 'Garantie';

  @override
  String get myRequests => 'Mes demandes';

  @override
  String openCount(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count en cours',
      one: '1 en cours',
    );
    return '$_temp0';
  }

  @override
  String visitOn(String date) {
    return 'Visite $date';
  }

  @override
  String get visitToBeScheduled => 'Visite à planifier';

  @override
  String resolvedOn(String date) {
    return 'Résolue le $date';
  }

  @override
  String get rate => 'Noter';

  @override
  String get rateTitle => 'Comment s\'est passée l\'intervention ?';

  @override
  String starsLabel(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count étoiles',
      one: '1 étoile',
    );
    return '$_temp0';
  }

  @override
  String get callJogooCameroon => 'Appeler JOGOO Cameroun';

  @override
  String get warrantyEnded => 'Garantie terminée';

  @override
  String get warrantyNote =>
      'Les réparations des pièces sous garantie sont gratuites. Le technicien confirme la prise en charge avant toute intervention.';

  @override
  String get bookVisitTitle => 'Réserver une visite';

  @override
  String get bookVisitBody =>
      'Quelle installation a besoin d\'une visite ? Vous envoyez ensuite la demande à JOGOO sur WhatsApp ou par téléphone.';

  @override
  String requestTitle(String id) {
    return 'Demande $id';
  }

  @override
  String get technicianVisit => 'Visite du technicien';

  @override
  String get technicianToAssign => 'Technicien à désigner';

  @override
  String get callTechnician => 'Appeler le technicien';

  @override
  String get progress => 'Avancement';

  @override
  String get stepReceived => 'Demande reçue';

  @override
  String get stepDiagnosed => 'Diagnostic';

  @override
  String get stepBooked => 'Visite planifiée';

  @override
  String get stepFixed => 'Réparé';

  @override
  String get coveredByWarranty => 'Couvert par la garantie';

  @override
  String get notCovered => 'Non couvert par la garantie';

  @override
  String get yourNotes => 'Vos notes';

  @override
  String get reschedule => 'Reporter';

  @override
  String get addDetails => 'Ajouter des détails';

  @override
  String get detailsHint => 'Une note pour le technicien';

  @override
  String get noteAdded => 'Note gardée sur cet écran seulement';

  @override
  String get pickNewDate => 'Choisir une nouvelle date';

  @override
  String rescheduleNote(String date) {
    return 'Demande de report de la visite au $date';
  }

  @override
  String get rescheduleSentTitle => 'Nouvelle date pas encore envoyée';

  @override
  String get rescheduleSentBody =>
      'Seulement noté sur cet écran. Fixez la nouvelle date avec JOGOO sur WhatsApp ou par téléphone.';

  @override
  String clientSince(String date) {
    return 'Client JOGOO depuis $date';
  }

  @override
  String get location => 'Lieu';

  @override
  String get area => 'Surface';

  @override
  String hectares(String value) {
    return '$value ha';
  }

  @override
  String get thisSeasonIWant => 'Cette saison, je veux';

  @override
  String get goalsHelp =>
      'Vos objectifs orientent les offres et les conseils de JOGOO.';

  @override
  String get goalHigherYields => 'Meilleurs rendements';

  @override
  String get goalMoreLand => 'Plus de surface irriguée';

  @override
  String get goalSaveWater => 'Économiser l\'eau';

  @override
  String get goalLessLabour => 'Moins de main-d\'œuvre';

  @override
  String get editFarmTitle => 'Modifier ma ferme';

  @override
  String get partsTitle => 'Pièces pour ma ferme';

  @override
  String get partsSubtitle => 'Adaptées à vos installations';

  @override
  String get scanSticker => 'Scanner l\'étiquette JOGOO';

  @override
  String get pointCameraAtSticker =>
      'Pointez la caméra vers une étiquette ou un code QR de l\'équipement.';

  @override
  String get orTypeSerial => 'Ou saisissez le numéro de série';

  @override
  String serialNotFound(String serial) {
    return 'Aucune installation avec le numéro $serial.';
  }

  @override
  String serialFound(String name) {
    return 'Pièces pour : $name';
  }

  @override
  String get reorderTitle => 'Racheter des intrants';

  @override
  String sizedFor(String area) {
    return 'Dosé pour vos $area ha';
  }

  @override
  String get yourUsualOrder => 'Votre commande habituelle';

  @override
  String lastBought(String date) {
    return 'dernier achat le $date';
  }

  @override
  String bags(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count sacs',
      one: '1 sac',
    );
    return '$_temp0';
  }

  @override
  String get fewerBags => 'Moins de sacs';

  @override
  String get moreBags => 'Plus de sacs';

  @override
  String recommendedFor(String area) {
    return 'Conseillé pour $area ha';
  }

  @override
  String get reorderOneTap => 'Recommander sur WhatsApp';

  @override
  String get reorderSavedTitle => 'Réassort pas encore envoyé';

  @override
  String get remindBeforeSeason => 'Me rappeler avant chaque saison';

  @override
  String orderTitle(String id) {
    return 'Commande $id';
  }

  @override
  String get arriving => 'Arrivée prévue';

  @override
  String dropOffPoint(String place) {
    return 'Point de retrait : $place';
  }

  @override
  String get collectionCode => 'Code de retrait';

  @override
  String get showCode => 'Afficher le code en grand';

  @override
  String get changeDropOff => 'Changer le retrait';

  @override
  String get callDriver => 'Appeler le chauffeur';

  @override
  String get dropOffChangeTitle => 'Changement pas encore envoyé';

  @override
  String get dropOffChangeBody =>
      'Fixez le nouveau point de retrait avec JOGOO sur WhatsApp ou par téléphone.';

  @override
  String get whichEquipment => 'Quel équipement ?';

  @override
  String get whatIsWrong => 'Quel est le problème ?';

  @override
  String get describeProblem => 'Décrivez le problème';

  @override
  String get describeProblemHint => 'Où, et depuis quand ?';

  @override
  String get photosAndVideos => 'Photos et vidéos';

  @override
  String get sendRequest => 'Envoyer sur WhatsApp';

  @override
  String get pickProblemFirst =>
      'Choisissez d\'abord l\'équipement et le problème.';

  @override
  String reportSavedTitle(String id) {
    return 'Demande $id notée sur cet écran';
  }

  @override
  String get reportSavedBody =>
      'L\'application ne l\'envoie pas à JOGOO. Terminez l\'envoi sur WhatsApp ou appelez JOGOO.';

  @override
  String get agronomistsTitle => 'Agronomes JOGOO';

  @override
  String get repliesWeekdays => 'Répondent du lun. au ven.';

  @override
  String get wateringPlanThisWeek => 'Plan d\'arrosage de la semaine';

  @override
  String updatedOn(String date) {
    return 'Mis à jour le $date';
  }

  @override
  String get bookFieldVisit => 'Réserver une visite terrain';

  @override
  String get askTheAgronomists => 'Écrire aux agronomes';

  @override
  String get messageSavedTitle => 'Question non envoyée par l\'application';

  @override
  String get messageSavedBody =>
      'Envoyez-la dans WhatsApp pour joindre les agronomes. Ils répondent du lundi au vendredi.';

  @override
  String get fieldVisitTitle => 'Visite terrain pas encore réservée';

  @override
  String get fieldVisitBody =>
      'Fixez une date avec un agronome JOGOO sur WhatsApp ou par téléphone.';

  @override
  String get documentsSubtitle => 'Plans, schémas électriques et garanties';

  @override
  String get filterAll => 'Tous';

  @override
  String get filterPlans => 'Plans';

  @override
  String get filterElectrical => 'Électricité';

  @override
  String get filterWarranty => 'Garantie';

  @override
  String get noDocuments => 'Aucun document de ce type pour l\'instant.';

  @override
  String documentsCount(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count documents',
      one: '1 document',
    );
    return '$_temp0';
  }

  @override
  String pdfSize(String size) {
    return 'PDF · $size Mo';
  }

  @override
  String get generatedDemoPdf =>
      'PDF de démonstration · document original non fourni';

  @override
  String serialNumber(String serial) {
    return 'Numéro de série : $serial';
  }

  @override
  String get demoDocumentNotice =>
      'Démonstration uniquement. Généré à partir des données d\'exemple de l\'application ; ce document n\'est pas un plan, un contrat ni un document technique JOGOO original.';

  @override
  String get demoCopy => 'COPIE DE DÉMONSTRATION';

  @override
  String get pdfExportFailed =>
      'Impossible de créer ou de partager le PDF. Réessayez.';

  @override
  String get downloadsLaterTitle => 'Documents pas encore connectés';

  @override
  String get downloadsLaterBody =>
      'L\'ouverture et le téléchargement fonctionneront dès que les documents JOGOO seront en ligne.';

  @override
  String pendingSync(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other:
          '$count saisies sont seulement sur cet écran. Elles ne sont pas envoyées à JOGOO.',
      one: '1 saisie est seulement sur cet écran. Elle n\'est pas envoyée à JOGOO.',
    );
    return '$_temp0';
  }

  @override
  String loggedBy(String name) {
    return 'Saisi par $name';
  }

  @override
  String get loggedByLabel => 'Saisi par';

  @override
  String get waitingToSync => 'Cet écran seulement';

  @override
  String get synced => 'Fourni par JOGOO';

  @override
  String get exportPdf => 'Exporter pour audit (PDF)';

  @override
  String get logReportTitle => 'Journal d\'entretien JOGOO';

  @override
  String get emptyLog => 'Aucune saisie. Touchez + pour noter un travail.';

  @override
  String get newEntry => 'Nouvelle saisie';

  @override
  String get entryService => 'Entretien';

  @override
  String get entryPartReplaced => 'Pièce remplacée';

  @override
  String get entryFertigation => 'Fertigation';

  @override
  String get date => 'Date';

  @override
  String get equipment => 'Équipement';

  @override
  String get product => 'Produit';

  @override
  String get quantity => 'Quantité';

  @override
  String get waterVolume => 'Volume d\'eau';

  @override
  String get workDone => 'Travaux';

  @override
  String get workDoneHint => 'ex. Filtre nettoyé';

  @override
  String get part => 'Pièce';

  @override
  String get partHint => 'ex. Vanne 32 mm';

  @override
  String get checklist => 'Liste de contrôle';

  @override
  String get checkFilterBeforeInjection => 'Filtre nettoyé avant injection';

  @override
  String get checkTankRinsed => 'Cuve rincée';

  @override
  String get checkLinesFlushed => 'Lignes rincées après injection';

  @override
  String get checkFilterCleaned => 'Filtre nettoyé';

  @override
  String get checkPressure => 'Pression vérifiée';

  @override
  String get checkLeaks => 'Fuites contrôlées';

  @override
  String get checkOldPartKept => 'Ancienne pièce gardée pour le technicien';

  @override
  String get checkSystemTested => 'Système testé après la pose';

  @override
  String fertigationEntry(String product, String quantity, String water) {
    return 'Fertigation : $product, $quantity dans $water';
  }

  @override
  String partReplacedEntry(String part) {
    return 'Pièce remplacée : $part';
  }

  @override
  String get saveOnPhone => 'Ajouter au carnet';

  @override
  String get syncLater =>
      'Gardé dans l\'application seulement jusqu\'à sa fermeture. Pas envoyé à JOGOO.';

  @override
  String get entrySavedTitle => 'Ajouté sur cet écran seulement';

  @override
  String get notificationsTitle => 'Notifications';

  @override
  String get notificationsSubtitle => 'Choisissez comment JOGOO vous contacte';

  @override
  String get channelPush => 'Push';

  @override
  String savedSummary(String guides, String videos) {
    return '$guides et $videos enregistrés';
  }

  @override
  String guidesCount(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count guides',
      one: '1 guide',
    );
    return '$_temp0';
  }

  @override
  String videosCount(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count guides illustrés',
      one: '1 guide illustré',
    );
    return '$_temp0';
  }

  @override
  String get worksOffline => 'Tout ici fonctionne sans internet';

  @override
  String get userManuals => 'Manuels d\'utilisation';

  @override
  String get illustratedGuides => 'Guides illustrés';

  @override
  String get wifiOnly => 'Télécharger en Wi-Fi uniquement';

  @override
  String get wifiOnlyHelp => 'Économise vos données mobiles';

  @override
  String get exampleBannerTitle => 'Données d\'exemple.';

  @override
  String get exampleBannerBody =>
      'Votre ferme apparaîtra ici quand JOGOO aura créé votre compte.';

  @override
  String get sendOnWhatsApp => 'Envoyer sur WhatsApp';

  @override
  String get notSentTitle => 'L\'application n\'envoie pas encore ceci à JOGOO';

  @override
  String get notSentBody =>
      'Envoyez-le sur WhatsApp ou appelez JOGOO. Ce que vous saisissez ici reste seulement sur cet écran.';

  @override
  String get messagePreview => 'Votre message WhatsApp';

  @override
  String get keepOnScreen => 'Garder sur cet écran seulement';

  @override
  String get requestPriceTitle => 'Demander un prix à JOGOO';

  @override
  String requestPriceBody(String item) {
    return 'Demandez aux ventes JOGOO le prix de : $item, et si cela convient à votre ferme.';
  }

  @override
  String get cartNotSent =>
      'L\'application n\'envoie pas encore de commande. Votre panier s\'ouvre en message WhatsApp pour les ventes JOGOO.';

  @override
  String get photosOnWhatsApp =>
      'Les photos et vidéos ne partent pas depuis cet écran : ajoutez-les dans la discussion WhatsApp.';

  @override
  String get agronomistNote =>
      'Votre question s\'ouvre dans WhatsApp pour joindre les agronomes JOGOO.';

  @override
  String waAddEquipment(String item) {
    return 'Bonjour JOGOO, merci d\'ajouter cet équipement à ma ferme : $item';
  }

  @override
  String waServiceVisit(String equipment) {
    return 'Bonjour JOGOO, je souhaite une visite d\'entretien pour : $equipment';
  }

  @override
  String waPriceRequest(String item) {
    return 'Bonjour JOGOO, je souhaite un prix pour : $item';
  }

  @override
  String waOrder(String lines, String total) {
    return 'Bonjour JOGOO, je souhaite commander :\n$lines\nTotal affiché dans l\'application : $total FCFA';
  }

  @override
  String waProblem(String equipment, String problem) {
    return 'Bonjour JOGOO, j\'ai un problème avec : $equipment. Problème : $problem.';
  }

  @override
  String waProblemDetails(String details) {
    return 'Détails : $details';
  }

  @override
  String waAgronomist(String question) {
    return 'Question pour les agronomes JOGOO : $question';
  }

  @override
  String get waFieldVisit =>
      'Bonjour JOGOO, je souhaite la visite d\'un agronome sur ma ferme.';

  @override
  String waReorder(String quantity, String item) {
    return 'Bonjour JOGOO, je souhaite commander : $item, $quantity.';
  }

  @override
  String waDropOff(String id) {
    return 'Bonjour JOGOO, je souhaite changer le point de retrait de la commande $id.';
  }

  @override
  String waReschedule(String id, String date) {
    return 'Bonjour JOGOO, pour la demande $id : la visite peut-elle être déplacée au $date ?';
  }

  @override
  String waRequestNote(String id, String note) {
    return 'Bonjour JOGOO, pour la demande $id : $note';
  }

  @override
  String resultsCount(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count produits trouvés',
      one: '1 produit trouvé',
      zero: 'Aucun produit trouvé',
    );
    return '$_temp0';
  }
}

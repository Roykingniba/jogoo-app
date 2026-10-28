// ignore: unused_import
import 'package:intl/intl.dart' as intl;

import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get appTitle => 'Jogoo';

  @override
  String get navHome => 'Home';

  @override
  String get navMyFarm => 'My farm';

  @override
  String get navShop => 'Shop';

  @override
  String get navLearn => 'Learn';

  @override
  String get navService => 'Service';

  @override
  String get back => 'Back';

  @override
  String get close => 'Close';

  @override
  String get cancel => 'Cancel';

  @override
  String get save => 'Save';

  @override
  String get send => 'Send';

  @override
  String get edit => 'Edit';

  @override
  String get add => 'Add';

  @override
  String get added => 'Added';

  @override
  String get remove => 'Remove';

  @override
  String get view => 'View';

  @override
  String get open => 'Open';

  @override
  String get find => 'Find';

  @override
  String get share => 'Share';

  @override
  String get call => 'Call';

  @override
  String get track => 'Track';

  @override
  String get order => 'Order';

  @override
  String get request => 'Request';

  @override
  String get total => 'Total';

  @override
  String get today => 'Today';

  @override
  String get earlier => 'Earlier';

  @override
  String get yesterday => 'yesterday';

  @override
  String get download => 'Download';

  @override
  String get savedOffline => 'Saved offline';

  @override
  String get comingSoonTitle => 'Coming in a later version';

  @override
  String get comingSoonBody => 'This part of the app is not ready yet.';

  @override
  String get cannotOpenLink => 'This phone could not open the link.';

  @override
  String get cannotOpenCamera => 'The camera or gallery could not be opened.';

  @override
  String get takePhoto => 'Take a photo';

  @override
  String get recordVideo => 'Record a video';

  @override
  String get chooseFromGallery => 'Choose from the gallery';

  @override
  String get sendPhoto => 'Send a photo';

  @override
  String get callJogoo => 'Call JOGOO';

  @override
  String fillIn(String field) {
    return 'Fill in: $field';
  }

  @override
  String greetingMorning(String name) {
    return 'Good morning, $name';
  }

  @override
  String greetingAfternoon(String name) {
    return 'Good afternoon, $name';
  }

  @override
  String greetingEvening(String name) {
    return 'Good evening, $name';
  }

  @override
  String get switchLanguage => 'Passer en français';

  @override
  String get openProfile => 'Open my profile';

  @override
  String get askMia => 'Ask Mia';

  @override
  String get nextVisit => 'Next visit';

  @override
  String get confirmed => 'Confirmed';

  @override
  String equipmentCheck(String name) {
    return '$name check';
  }

  @override
  String get pickedForYourFarm => 'Picked for your farm';

  @override
  String newCount(int count) {
    return '$count new';
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
  String get addEquipment => 'Add equipment';

  @override
  String get addEquipmentBody =>
      'Tell us about a new installation or a product bought elsewhere. The JOGOO team will add it to your farm.';

  @override
  String get addEquipmentHint => 'For example: water tank 5,000 L';

  @override
  String get addEquipmentSavedTitle => 'Saved for the JOGOO team';

  @override
  String get addEquipmentSavedBody =>
      'A technician will confirm the details with you.';

  @override
  String get tabEquipment => 'Equipment';

  @override
  String get tabOrders => 'Orders';

  @override
  String get tabInvoices => 'Invoices';

  @override
  String get statusGood => 'Good';

  @override
  String get statusOpen => 'Open';

  @override
  String get statusDueSoon => 'Due soon';

  @override
  String get warrantyLeft => 'Warranty left';

  @override
  String monthsOf(int left, int total) {
    return '$left of $total months';
  }

  @override
  String get myDocuments => 'My documents';

  @override
  String get maintenanceLog => 'Maintenance log';

  @override
  String get orderDelivered => 'Delivered';

  @override
  String get orderOnTheRoad => 'On the road';

  @override
  String get invoicePaid => 'Paid';

  @override
  String get invoiceDue => 'To pay';

  @override
  String get equipmentTitle => 'Equipment';

  @override
  String installedOn(String date) {
    return 'Installed $date';
  }

  @override
  String get workingWell => 'Working well';

  @override
  String get requestOpen => 'Service request open';

  @override
  String monthsShort(int count) {
    return '$count mo';
  }

  @override
  String get lastService => 'Last service';

  @override
  String get maintenance => 'Maintenance';

  @override
  String doneOn(String date) {
    return 'Done $date';
  }

  @override
  String dueOn(String date) {
    return 'Due $date';
  }

  @override
  String get reportProblem => 'Report a problem';

  @override
  String get bookService => 'Book service';

  @override
  String bookServiceBody(String equipment) {
    return 'JOGOO will call you to agree a visit date for your $equipment.';
  }

  @override
  String get visitRequestedTitle => 'Visit request saved';

  @override
  String get visitRequestedBody => 'JOGOO will call you to confirm the date.';

  @override
  String get detailsCopied => 'Details copied';

  @override
  String get shopSubtitle => 'JOGOO range, picked for your farm';

  @override
  String get searchProducts => 'Search products and parts';

  @override
  String get searchResults => 'Search results';

  @override
  String get noProducts => 'No product matches. Try another word or ask Mia.';

  @override
  String get catForYou => 'For you';

  @override
  String get catFilters => 'Filters';

  @override
  String get catValves => 'Valves';

  @override
  String get catSprinklers => 'Sprinklers';

  @override
  String get catPivots => 'Pivots';

  @override
  String get catKits => 'Kits';

  @override
  String get upsellTitle => 'Water your last hectare';

  @override
  String get upsellBody => 'Extend your drip system to plot C';

  @override
  String get getQuote => 'Get a quote';

  @override
  String get forYourEquipment => 'For your equipment';

  @override
  String get requestSavedTitle => 'Request saved for JOGOO sales';

  @override
  String requestSavedBody(String item) {
    return '$item · a JOGOO adviser will call you back';
  }

  @override
  String get cart => 'Cart';

  @override
  String get cartTitle => 'Your cart';

  @override
  String get cartEmpty => 'Your cart is empty.';

  @override
  String get sendOrderRequest => 'Send order request';

  @override
  String get orderRequestSavedTitle => 'Order request saved';

  @override
  String get orderRequestSavedBody =>
      'JOGOO will call you to confirm price, fitting and delivery.';

  @override
  String get paymentLater =>
      'No payment now. You pay by mobile money once JOGOO confirms the order.';

  @override
  String get saveForLater => 'Save for later';

  @override
  String get priceOnQuote => 'Price on quote';

  @override
  String get addToCart => 'Add to cart';

  @override
  String get addedToCart => 'Added to cart';

  @override
  String get miaSubtitle => 'Your JOGOO assistant';

  @override
  String get messageMia => 'Message Mia';

  @override
  String get miaTyping => 'Mia is writing…';

  @override
  String get miaUnavailable =>
      'Mia is not connected yet. A JOGOO adviser can help you now by phone or WhatsApp.';

  @override
  String urgentCall(String phone) {
    return 'Urgent? Call $phone';
  }

  @override
  String get bookAgronomist => 'Book an agronomist';

  @override
  String get talkToPerson => 'Talk to a person';

  @override
  String readGuide(String title) {
    return 'Read the guide: $title';
  }

  @override
  String get learnSubtitle => 'Guides from JOGOO agronomists';

  @override
  String get searchGuides => 'Search guides';

  @override
  String get noGuides => 'No guide matches. Try another word or ask Mia.';

  @override
  String videoMinutes(int minutes) {
    return 'Video · $minutes min';
  }

  @override
  String readMinutes(int minutes) {
    return '$minutes min read';
  }

  @override
  String get playVideo => 'Play the video';

  @override
  String get askMiaAboutThis => 'Ask Mia about this';

  @override
  String get offlineLibrary => 'Offline library';

  @override
  String get librarySubtitle => 'Read and watch without internet';

  @override
  String get serviceHours => 'Mon to Fri, 9:00 to 18:00';

  @override
  String get actionReport => 'Report';

  @override
  String get actionBookVisit => 'Book visit';

  @override
  String get actionWarranty => 'Warranty';

  @override
  String get myRequests => 'My requests';

  @override
  String openCount(int count) {
    return '$count open';
  }

  @override
  String visitOn(String date) {
    return 'Visit $date';
  }

  @override
  String get visitToBeScheduled => 'Visit to be scheduled';

  @override
  String resolvedOn(String date) {
    return 'Resolved $date';
  }

  @override
  String get rate => 'Rate';

  @override
  String get rateTitle => 'How was the repair?';

  @override
  String starsLabel(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count stars',
      one: '1 star',
    );
    return '$_temp0';
  }

  @override
  String get callJogooCameroon => 'Call JOGOO Cameroon';

  @override
  String get warrantyEnded => 'Warranty ended';

  @override
  String get warrantyNote =>
      'Repairs on parts under warranty are free. The technician confirms cover before any work.';

  @override
  String get bookVisitTitle => 'Book a visit';

  @override
  String get bookVisitBody =>
      'Which installation needs a visit? JOGOO will call you to agree a date.';

  @override
  String requestTitle(String id) {
    return 'Request $id';
  }

  @override
  String get technicianVisit => 'Technician visit';

  @override
  String get technicianToAssign => 'Technician to be assigned';

  @override
  String get callTechnician => 'Call the technician';

  @override
  String get progress => 'Progress';

  @override
  String get stepReceived => 'Request received';

  @override
  String get stepDiagnosed => 'Diagnosis';

  @override
  String get stepBooked => 'Visit booked';

  @override
  String get stepFixed => 'Fixed';

  @override
  String get coveredByWarranty => 'Covered by warranty';

  @override
  String get notCovered => 'Not covered by warranty';

  @override
  String get yourNotes => 'Your notes';

  @override
  String get reschedule => 'Reschedule';

  @override
  String get addDetails => 'Add details';

  @override
  String get detailsHint => 'A note for the technician';

  @override
  String get noteAdded => 'Note added';

  @override
  String get pickNewDate => 'Pick a new date';

  @override
  String rescheduleNote(String date) {
    return 'Asked to move the visit to $date';
  }

  @override
  String get rescheduleSentTitle => 'New date requested';

  @override
  String get rescheduleSentBody => 'The technician will call you to confirm.';

  @override
  String clientSince(String date) {
    return 'JOGOO client since $date';
  }

  @override
  String get location => 'Location';

  @override
  String get area => 'Area';

  @override
  String hectares(String value) {
    return '$value ha';
  }

  @override
  String get thisSeasonIWant => 'This season I want';

  @override
  String get goalsHelp => 'Your goals shape JOGOO\'s offers and advice.';

  @override
  String get goalHigherYields => 'Higher yields';

  @override
  String get goalMoreLand => 'More land watered';

  @override
  String get goalSaveWater => 'Save water';

  @override
  String get goalLessLabour => 'Less labour';

  @override
  String get editFarmTitle => 'Edit my farm';

  @override
  String get partsTitle => 'Parts for my farm';

  @override
  String get partsSubtitle => 'Matched to your installations';

  @override
  String get scanSticker => 'Scan the JOGOO sticker';

  @override
  String get orTypeSerial => 'Or type the serial number';

  @override
  String serialNotFound(String serial) {
    return 'No installation found with serial $serial.';
  }

  @override
  String serialFound(String name) {
    return 'Showing parts for $name';
  }

  @override
  String get reorderTitle => 'Reorder inputs';

  @override
  String sizedFor(String area) {
    return 'Sized for your $area ha';
  }

  @override
  String get yourUsualOrder => 'Your usual order';

  @override
  String lastBought(String date) {
    return 'last bought $date';
  }

  @override
  String bags(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count bags',
      one: '1 bag',
    );
    return '$_temp0';
  }

  @override
  String get fewerBags => 'Fewer bags';

  @override
  String get moreBags => 'More bags';

  @override
  String recommendedFor(String area) {
    return 'Recommended for $area ha';
  }

  @override
  String get reorderOneTap => 'Reorder in one tap';

  @override
  String get reorderSavedTitle => 'Reorder saved for JOGOO sales';

  @override
  String get remindBeforeSeason => 'Remind me before each season';

  @override
  String orderTitle(String id) {
    return 'Order $id';
  }

  @override
  String get arriving => 'Arriving';

  @override
  String dropOffPoint(String place) {
    return 'Drop-off point: $place';
  }

  @override
  String get collectionCode => 'Collection code';

  @override
  String get showCode => 'Show the code in large';

  @override
  String get changeDropOff => 'Change drop-off';

  @override
  String get callDriver => 'Call the driver';

  @override
  String get dropOffChangeTitle => 'Change requested';

  @override
  String get dropOffChangeBody =>
      'JOGOO will call you to agree the new drop-off point.';

  @override
  String get whichEquipment => 'Which equipment?';

  @override
  String get whatIsWrong => 'What is wrong?';

  @override
  String get describeProblem => 'Describe the problem';

  @override
  String get describeProblemHint => 'Where is it, and since when?';

  @override
  String get photosAndVideos => 'Photos and videos';

  @override
  String get sendRequest => 'Send request';

  @override
  String get pickProblemFirst => 'Choose the equipment and the problem first.';

  @override
  String reportSavedTitle(String id) {
    return 'Request $id saved';
  }

  @override
  String get reportSavedBody => 'JOGOO will call you today.';

  @override
  String get agronomistsTitle => 'JOGOO agronomists';

  @override
  String get repliesWeekdays => 'Replies Mon to Fri';

  @override
  String get wateringPlanThisWeek => 'Watering plan this week';

  @override
  String updatedOn(String date) {
    return 'Updated $date';
  }

  @override
  String get bookFieldVisit => 'Book a field visit';

  @override
  String get askTheAgronomists => 'Ask the agronomists';

  @override
  String get messageSavedTitle => 'Message saved';

  @override
  String get messageSavedBody => 'The agronomists reply Monday to Friday.';

  @override
  String get fieldVisitTitle => 'Field visit requested';

  @override
  String get fieldVisitBody => 'An agronomist will call you to agree a date.';

  @override
  String get documentsSubtitle => 'Saved on this phone, readable offline';

  @override
  String get filterAll => 'All';

  @override
  String get filterPlans => 'Plans';

  @override
  String get filterElectrical => 'Electrical';

  @override
  String get filterWarranty => 'Warranty';

  @override
  String get noDocuments => 'No document of this type yet.';

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
    return 'PDF · $size MB';
  }

  @override
  String get downloadsLaterTitle => 'Documents are not connected yet';

  @override
  String get downloadsLaterBody =>
      'Opening and downloading files will work once JOGOO documents are online.';

  @override
  String pendingSync(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count entries waiting to sync',
      one: '1 entry waiting to sync',
    );
    return '$_temp0';
  }

  @override
  String loggedBy(String name) {
    return 'Logged by $name';
  }

  @override
  String get waitingToSync => 'Waiting to sync';

  @override
  String get synced => 'Synced';

  @override
  String get exportPdf => 'Export for audit (PDF)';

  @override
  String get emptyLog => 'No entries yet. Tap + to log a job.';

  @override
  String get newEntry => 'New entry';

  @override
  String get entryService => 'Service';

  @override
  String get entryPartReplaced => 'Part replaced';

  @override
  String get entryFertigation => 'Fertigation';

  @override
  String get date => 'Date';

  @override
  String get equipment => 'Equipment';

  @override
  String get product => 'Product';

  @override
  String get quantity => 'Quantity';

  @override
  String get waterVolume => 'Water volume';

  @override
  String get workDone => 'Work done';

  @override
  String get workDoneHint => 'e.g. Filter cleaned';

  @override
  String get part => 'Part';

  @override
  String get partHint => 'e.g. Valve 32 mm';

  @override
  String get checklist => 'Checklist';

  @override
  String get checkFilterBeforeInjection => 'Filter cleaned before injection';

  @override
  String get checkTankRinsed => 'Tank rinsed';

  @override
  String get checkLinesFlushed => 'Lines flushed after injection';

  @override
  String get checkFilterCleaned => 'Filter cleaned';

  @override
  String get checkPressure => 'Pressure checked';

  @override
  String get checkLeaks => 'Lines checked for leaks';

  @override
  String get checkOldPartKept => 'Old part kept for the technician';

  @override
  String get checkSystemTested => 'System tested after fitting';

  @override
  String fertigationEntry(String product, String quantity, String water) {
    return 'Fertigation: $product, $quantity in $water';
  }

  @override
  String partReplacedEntry(String part) {
    return 'Part replaced: $part';
  }

  @override
  String get saveOnPhone => 'Save on this phone';

  @override
  String get syncLater => 'It will sync by itself when you are back online';

  @override
  String get entrySavedTitle => 'Saved on this phone';

  @override
  String get notificationsTitle => 'Notifications';

  @override
  String get notificationsSubtitle => 'Choose how JOGOO reaches you';

  @override
  String get channelPush => 'Push';

  @override
  String savedSummary(String guides, String videos) {
    return '$guides and $videos saved';
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
      other: '$count videos',
      one: '1 video',
    );
    return '$_temp0';
  }

  @override
  String get worksOffline => 'Everything here works without internet';

  @override
  String get userManuals => 'User manuals';

  @override
  String get videos => 'Videos';

  @override
  String get wifiOnly => 'Download on Wi-Fi only';

  @override
  String get wifiOnlyHelp => 'Saves your mobile data';
}

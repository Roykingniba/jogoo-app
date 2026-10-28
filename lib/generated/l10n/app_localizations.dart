import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_en.dart';
import 'app_localizations_fr.dart';

// ignore_for_file: type=lint

/// Callers can lookup localized strings with an instance of AppLocalizations
/// returned by `AppLocalizations.of(context)`.
///
/// Applications need to include `AppLocalizations.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'l10n/app_localizations.dart';
///
/// return MaterialApp(
///   localizationsDelegates: AppLocalizations.localizationsDelegates,
///   supportedLocales: AppLocalizations.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the AppLocalizations.supportedLocales
/// property.
abstract class AppLocalizations {
  AppLocalizations(String locale)
    : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static AppLocalizations of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations)!;
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates =
      <LocalizationsDelegate<dynamic>>[
        delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
      ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[
    Locale('en'),
    Locale('fr'),
  ];

  /// No description provided for @appTitle.
  ///
  /// In en, this message translates to:
  /// **'Jogoo'**
  String get appTitle;

  /// No description provided for @navHome.
  ///
  /// In en, this message translates to:
  /// **'Home'**
  String get navHome;

  /// No description provided for @navMyFarm.
  ///
  /// In en, this message translates to:
  /// **'My farm'**
  String get navMyFarm;

  /// No description provided for @navShop.
  ///
  /// In en, this message translates to:
  /// **'Shop'**
  String get navShop;

  /// No description provided for @navLearn.
  ///
  /// In en, this message translates to:
  /// **'Learn'**
  String get navLearn;

  /// No description provided for @navService.
  ///
  /// In en, this message translates to:
  /// **'Service'**
  String get navService;

  /// No description provided for @back.
  ///
  /// In en, this message translates to:
  /// **'Back'**
  String get back;

  /// No description provided for @close.
  ///
  /// In en, this message translates to:
  /// **'Close'**
  String get close;

  /// No description provided for @cancel.
  ///
  /// In en, this message translates to:
  /// **'Cancel'**
  String get cancel;

  /// No description provided for @save.
  ///
  /// In en, this message translates to:
  /// **'Save'**
  String get save;

  /// No description provided for @send.
  ///
  /// In en, this message translates to:
  /// **'Send'**
  String get send;

  /// No description provided for @edit.
  ///
  /// In en, this message translates to:
  /// **'Edit'**
  String get edit;

  /// No description provided for @add.
  ///
  /// In en, this message translates to:
  /// **'Add'**
  String get add;

  /// No description provided for @added.
  ///
  /// In en, this message translates to:
  /// **'Added'**
  String get added;

  /// No description provided for @remove.
  ///
  /// In en, this message translates to:
  /// **'Remove'**
  String get remove;

  /// No description provided for @view.
  ///
  /// In en, this message translates to:
  /// **'View'**
  String get view;

  /// No description provided for @open.
  ///
  /// In en, this message translates to:
  /// **'Open'**
  String get open;

  /// No description provided for @find.
  ///
  /// In en, this message translates to:
  /// **'Find'**
  String get find;

  /// No description provided for @share.
  ///
  /// In en, this message translates to:
  /// **'Share'**
  String get share;

  /// No description provided for @call.
  ///
  /// In en, this message translates to:
  /// **'Call'**
  String get call;

  /// No description provided for @track.
  ///
  /// In en, this message translates to:
  /// **'Track'**
  String get track;

  /// No description provided for @order.
  ///
  /// In en, this message translates to:
  /// **'Order'**
  String get order;

  /// No description provided for @request.
  ///
  /// In en, this message translates to:
  /// **'Request'**
  String get request;

  /// No description provided for @total.
  ///
  /// In en, this message translates to:
  /// **'Total'**
  String get total;

  /// No description provided for @today.
  ///
  /// In en, this message translates to:
  /// **'Today'**
  String get today;

  /// No description provided for @earlier.
  ///
  /// In en, this message translates to:
  /// **'Earlier'**
  String get earlier;

  /// No description provided for @yesterday.
  ///
  /// In en, this message translates to:
  /// **'yesterday'**
  String get yesterday;

  /// No description provided for @download.
  ///
  /// In en, this message translates to:
  /// **'Download'**
  String get download;

  /// No description provided for @savedOffline.
  ///
  /// In en, this message translates to:
  /// **'Saved offline'**
  String get savedOffline;

  /// No description provided for @comingSoonTitle.
  ///
  /// In en, this message translates to:
  /// **'Coming in a later version'**
  String get comingSoonTitle;

  /// No description provided for @comingSoonBody.
  ///
  /// In en, this message translates to:
  /// **'This part of the app is not ready yet.'**
  String get comingSoonBody;

  /// No description provided for @cannotOpenLink.
  ///
  /// In en, this message translates to:
  /// **'This phone could not open the link.'**
  String get cannotOpenLink;

  /// No description provided for @cannotOpenCamera.
  ///
  /// In en, this message translates to:
  /// **'The camera or gallery could not be opened.'**
  String get cannotOpenCamera;

  /// No description provided for @takePhoto.
  ///
  /// In en, this message translates to:
  /// **'Take a photo'**
  String get takePhoto;

  /// No description provided for @recordVideo.
  ///
  /// In en, this message translates to:
  /// **'Record a video'**
  String get recordVideo;

  /// No description provided for @chooseFromGallery.
  ///
  /// In en, this message translates to:
  /// **'Choose from the gallery'**
  String get chooseFromGallery;

  /// No description provided for @sendPhoto.
  ///
  /// In en, this message translates to:
  /// **'Send a photo'**
  String get sendPhoto;

  /// No description provided for @callJogoo.
  ///
  /// In en, this message translates to:
  /// **'Call JOGOO'**
  String get callJogoo;

  /// No description provided for @fillIn.
  ///
  /// In en, this message translates to:
  /// **'Fill in: {field}'**
  String fillIn(String field);

  /// No description provided for @greetingMorning.
  ///
  /// In en, this message translates to:
  /// **'Good morning, {name}'**
  String greetingMorning(String name);

  /// No description provided for @greetingAfternoon.
  ///
  /// In en, this message translates to:
  /// **'Good afternoon, {name}'**
  String greetingAfternoon(String name);

  /// No description provided for @greetingEvening.
  ///
  /// In en, this message translates to:
  /// **'Good evening, {name}'**
  String greetingEvening(String name);

  /// No description provided for @switchLanguage.
  ///
  /// In en, this message translates to:
  /// **'Passer en français'**
  String get switchLanguage;

  /// No description provided for @openProfile.
  ///
  /// In en, this message translates to:
  /// **'Open my profile'**
  String get openProfile;

  /// No description provided for @askMia.
  ///
  /// In en, this message translates to:
  /// **'Ask Mia'**
  String get askMia;

  /// No description provided for @nextVisit.
  ///
  /// In en, this message translates to:
  /// **'Next visit'**
  String get nextVisit;

  /// No description provided for @confirmed.
  ///
  /// In en, this message translates to:
  /// **'Confirmed'**
  String get confirmed;

  /// No description provided for @equipmentCheck.
  ///
  /// In en, this message translates to:
  /// **'{name} check'**
  String equipmentCheck(String name);

  /// No description provided for @pickedForYourFarm.
  ///
  /// In en, this message translates to:
  /// **'Picked for your farm'**
  String get pickedForYourFarm;

  /// No description provided for @newCount.
  ///
  /// In en, this message translates to:
  /// **'{count} new'**
  String newCount(int count);

  /// No description provided for @installationsAt.
  ///
  /// In en, this message translates to:
  /// **'{count, plural, =1{1 installation} other{{count} installations}} · {place}'**
  String installationsAt(int count, String place);

  /// No description provided for @addEquipment.
  ///
  /// In en, this message translates to:
  /// **'Add equipment'**
  String get addEquipment;

  /// No description provided for @addEquipmentBody.
  ///
  /// In en, this message translates to:
  /// **'Tell us about a new installation or a product bought elsewhere. The JOGOO team will add it to your farm.'**
  String get addEquipmentBody;

  /// No description provided for @addEquipmentHint.
  ///
  /// In en, this message translates to:
  /// **'For example: water tank 5,000 L'**
  String get addEquipmentHint;

  /// No description provided for @addEquipmentSavedTitle.
  ///
  /// In en, this message translates to:
  /// **'Saved for the JOGOO team'**
  String get addEquipmentSavedTitle;

  /// No description provided for @addEquipmentSavedBody.
  ///
  /// In en, this message translates to:
  /// **'A technician will confirm the details with you.'**
  String get addEquipmentSavedBody;

  /// No description provided for @tabEquipment.
  ///
  /// In en, this message translates to:
  /// **'Equipment'**
  String get tabEquipment;

  /// No description provided for @tabOrders.
  ///
  /// In en, this message translates to:
  /// **'Orders'**
  String get tabOrders;

  /// No description provided for @tabInvoices.
  ///
  /// In en, this message translates to:
  /// **'Invoices'**
  String get tabInvoices;

  /// No description provided for @statusGood.
  ///
  /// In en, this message translates to:
  /// **'Good'**
  String get statusGood;

  /// No description provided for @statusOpen.
  ///
  /// In en, this message translates to:
  /// **'Open'**
  String get statusOpen;

  /// No description provided for @statusDueSoon.
  ///
  /// In en, this message translates to:
  /// **'Due soon'**
  String get statusDueSoon;

  /// No description provided for @warrantyLeft.
  ///
  /// In en, this message translates to:
  /// **'Warranty left'**
  String get warrantyLeft;

  /// No description provided for @monthsOf.
  ///
  /// In en, this message translates to:
  /// **'{left} of {total} months'**
  String monthsOf(int left, int total);

  /// No description provided for @myDocuments.
  ///
  /// In en, this message translates to:
  /// **'My documents'**
  String get myDocuments;

  /// No description provided for @maintenanceLog.
  ///
  /// In en, this message translates to:
  /// **'Maintenance log'**
  String get maintenanceLog;

  /// No description provided for @orderDelivered.
  ///
  /// In en, this message translates to:
  /// **'Delivered'**
  String get orderDelivered;

  /// No description provided for @orderOnTheRoad.
  ///
  /// In en, this message translates to:
  /// **'On the road'**
  String get orderOnTheRoad;

  /// No description provided for @invoicePaid.
  ///
  /// In en, this message translates to:
  /// **'Paid'**
  String get invoicePaid;

  /// No description provided for @invoiceDue.
  ///
  /// In en, this message translates to:
  /// **'To pay'**
  String get invoiceDue;

  /// No description provided for @equipmentTitle.
  ///
  /// In en, this message translates to:
  /// **'Equipment'**
  String get equipmentTitle;

  /// No description provided for @installedOn.
  ///
  /// In en, this message translates to:
  /// **'Installed {date}'**
  String installedOn(String date);

  /// No description provided for @workingWell.
  ///
  /// In en, this message translates to:
  /// **'Working well'**
  String get workingWell;

  /// No description provided for @requestOpen.
  ///
  /// In en, this message translates to:
  /// **'Service request open'**
  String get requestOpen;

  /// No description provided for @monthsShort.
  ///
  /// In en, this message translates to:
  /// **'{count} mo'**
  String monthsShort(int count);

  /// No description provided for @lastService.
  ///
  /// In en, this message translates to:
  /// **'Last service'**
  String get lastService;

  /// No description provided for @maintenance.
  ///
  /// In en, this message translates to:
  /// **'Maintenance'**
  String get maintenance;

  /// No description provided for @doneOn.
  ///
  /// In en, this message translates to:
  /// **'Done {date}'**
  String doneOn(String date);

  /// No description provided for @dueOn.
  ///
  /// In en, this message translates to:
  /// **'Due {date}'**
  String dueOn(String date);

  /// No description provided for @reportProblem.
  ///
  /// In en, this message translates to:
  /// **'Report a problem'**
  String get reportProblem;

  /// No description provided for @bookService.
  ///
  /// In en, this message translates to:
  /// **'Book service'**
  String get bookService;

  /// No description provided for @bookServiceBody.
  ///
  /// In en, this message translates to:
  /// **'JOGOO will call you to agree a visit date for your {equipment}.'**
  String bookServiceBody(String equipment);

  /// No description provided for @visitRequestedTitle.
  ///
  /// In en, this message translates to:
  /// **'Visit request saved'**
  String get visitRequestedTitle;

  /// No description provided for @visitRequestedBody.
  ///
  /// In en, this message translates to:
  /// **'JOGOO will call you to confirm the date.'**
  String get visitRequestedBody;

  /// No description provided for @detailsCopied.
  ///
  /// In en, this message translates to:
  /// **'Details copied'**
  String get detailsCopied;

  /// No description provided for @shopSubtitle.
  ///
  /// In en, this message translates to:
  /// **'JOGOO range, picked for your farm'**
  String get shopSubtitle;

  /// No description provided for @searchProducts.
  ///
  /// In en, this message translates to:
  /// **'Search products and parts'**
  String get searchProducts;

  /// No description provided for @searchResults.
  ///
  /// In en, this message translates to:
  /// **'Search results'**
  String get searchResults;

  /// No description provided for @noProducts.
  ///
  /// In en, this message translates to:
  /// **'No product matches. Try another word or ask Mia.'**
  String get noProducts;

  /// No description provided for @catForYou.
  ///
  /// In en, this message translates to:
  /// **'For you'**
  String get catForYou;

  /// No description provided for @catFilters.
  ///
  /// In en, this message translates to:
  /// **'Filters'**
  String get catFilters;

  /// No description provided for @catValves.
  ///
  /// In en, this message translates to:
  /// **'Valves'**
  String get catValves;

  /// No description provided for @catSprinklers.
  ///
  /// In en, this message translates to:
  /// **'Sprinklers'**
  String get catSprinklers;

  /// No description provided for @catPivots.
  ///
  /// In en, this message translates to:
  /// **'Pivots'**
  String get catPivots;

  /// No description provided for @catKits.
  ///
  /// In en, this message translates to:
  /// **'Kits'**
  String get catKits;

  /// No description provided for @upsellTitle.
  ///
  /// In en, this message translates to:
  /// **'Water your last hectare'**
  String get upsellTitle;

  /// No description provided for @upsellBody.
  ///
  /// In en, this message translates to:
  /// **'Extend your drip system to plot C'**
  String get upsellBody;

  /// No description provided for @getQuote.
  ///
  /// In en, this message translates to:
  /// **'Get a quote'**
  String get getQuote;

  /// No description provided for @forYourEquipment.
  ///
  /// In en, this message translates to:
  /// **'For your equipment'**
  String get forYourEquipment;

  /// No description provided for @requestSavedTitle.
  ///
  /// In en, this message translates to:
  /// **'Request saved for JOGOO sales'**
  String get requestSavedTitle;

  /// No description provided for @requestSavedBody.
  ///
  /// In en, this message translates to:
  /// **'{item} · a JOGOO adviser will call you back'**
  String requestSavedBody(String item);

  /// No description provided for @cart.
  ///
  /// In en, this message translates to:
  /// **'Cart'**
  String get cart;

  /// No description provided for @cartTitle.
  ///
  /// In en, this message translates to:
  /// **'Your cart'**
  String get cartTitle;

  /// No description provided for @cartEmpty.
  ///
  /// In en, this message translates to:
  /// **'Your cart is empty.'**
  String get cartEmpty;

  /// No description provided for @sendOrderRequest.
  ///
  /// In en, this message translates to:
  /// **'Send order request'**
  String get sendOrderRequest;

  /// No description provided for @orderRequestSavedTitle.
  ///
  /// In en, this message translates to:
  /// **'Order request saved'**
  String get orderRequestSavedTitle;

  /// No description provided for @orderRequestSavedBody.
  ///
  /// In en, this message translates to:
  /// **'JOGOO will call you to confirm price, fitting and delivery.'**
  String get orderRequestSavedBody;

  /// No description provided for @paymentLater.
  ///
  /// In en, this message translates to:
  /// **'No payment now. You pay by mobile money once JOGOO confirms the order.'**
  String get paymentLater;

  /// No description provided for @saveForLater.
  ///
  /// In en, this message translates to:
  /// **'Save for later'**
  String get saveForLater;

  /// No description provided for @priceOnQuote.
  ///
  /// In en, this message translates to:
  /// **'Price on quote'**
  String get priceOnQuote;

  /// No description provided for @addToCart.
  ///
  /// In en, this message translates to:
  /// **'Add to cart'**
  String get addToCart;

  /// No description provided for @addedToCart.
  ///
  /// In en, this message translates to:
  /// **'Added to cart'**
  String get addedToCart;

  /// No description provided for @miaSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Your JOGOO assistant'**
  String get miaSubtitle;

  /// No description provided for @messageMia.
  ///
  /// In en, this message translates to:
  /// **'Message Mia'**
  String get messageMia;

  /// No description provided for @miaTyping.
  ///
  /// In en, this message translates to:
  /// **'Mia is writing…'**
  String get miaTyping;

  /// No description provided for @miaUnavailable.
  ///
  /// In en, this message translates to:
  /// **'Mia is not connected yet. A JOGOO adviser can help you now by phone or WhatsApp.'**
  String get miaUnavailable;

  /// No description provided for @urgentCall.
  ///
  /// In en, this message translates to:
  /// **'Urgent? Call {phone}'**
  String urgentCall(String phone);

  /// No description provided for @bookAgronomist.
  ///
  /// In en, this message translates to:
  /// **'Book an agronomist'**
  String get bookAgronomist;

  /// No description provided for @talkToPerson.
  ///
  /// In en, this message translates to:
  /// **'Talk to a person'**
  String get talkToPerson;

  /// No description provided for @readGuide.
  ///
  /// In en, this message translates to:
  /// **'Read the guide: {title}'**
  String readGuide(String title);

  /// No description provided for @learnSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Guides from JOGOO agronomists'**
  String get learnSubtitle;

  /// No description provided for @searchGuides.
  ///
  /// In en, this message translates to:
  /// **'Search guides'**
  String get searchGuides;

  /// No description provided for @noGuides.
  ///
  /// In en, this message translates to:
  /// **'No guide matches. Try another word or ask Mia.'**
  String get noGuides;

  /// No description provided for @videoMinutes.
  ///
  /// In en, this message translates to:
  /// **'Video · {minutes} min'**
  String videoMinutes(int minutes);

  /// No description provided for @readMinutes.
  ///
  /// In en, this message translates to:
  /// **'{minutes} min read'**
  String readMinutes(int minutes);

  /// No description provided for @illustratedMinutes.
  ///
  /// In en, this message translates to:
  /// **'Illustrated · {minutes} min'**
  String illustratedMinutes(int minutes);

  /// No description provided for @playVideo.
  ///
  /// In en, this message translates to:
  /// **'Play the walkthrough'**
  String get playVideo;

  /// No description provided for @illustratedWalkthrough.
  ///
  /// In en, this message translates to:
  /// **'Illustrated offline walkthrough'**
  String get illustratedWalkthrough;

  /// No description provided for @walkthroughStep.
  ///
  /// In en, this message translates to:
  /// **'Step {current} of {total}'**
  String walkthroughStep(int current, int total);

  /// No description provided for @walkthroughOfflineNote.
  ///
  /// In en, this message translates to:
  /// **'Demo guide using bundled photos and text. No video or audio clip is included.'**
  String get walkthroughOfflineNote;

  /// No description provided for @pauseWalkthrough.
  ///
  /// In en, this message translates to:
  /// **'Pause'**
  String get pauseWalkthrough;

  /// No description provided for @previousStep.
  ///
  /// In en, this message translates to:
  /// **'Previous step'**
  String get previousStep;

  /// No description provided for @nextStep.
  ///
  /// In en, this message translates to:
  /// **'Next step'**
  String get nextStep;

  /// No description provided for @askMiaAboutThis.
  ///
  /// In en, this message translates to:
  /// **'Ask Mia about this'**
  String get askMiaAboutThis;

  /// No description provided for @offlineLibrary.
  ///
  /// In en, this message translates to:
  /// **'Offline library'**
  String get offlineLibrary;

  /// No description provided for @librarySubtitle.
  ///
  /// In en, this message translates to:
  /// **'Read and follow illustrated guides without internet'**
  String get librarySubtitle;

  /// No description provided for @serviceHours.
  ///
  /// In en, this message translates to:
  /// **'Mon to Fri, 9:00 to 18:00'**
  String get serviceHours;

  /// No description provided for @actionReport.
  ///
  /// In en, this message translates to:
  /// **'Report'**
  String get actionReport;

  /// No description provided for @actionBookVisit.
  ///
  /// In en, this message translates to:
  /// **'Book visit'**
  String get actionBookVisit;

  /// No description provided for @actionWarranty.
  ///
  /// In en, this message translates to:
  /// **'Warranty'**
  String get actionWarranty;

  /// No description provided for @myRequests.
  ///
  /// In en, this message translates to:
  /// **'My requests'**
  String get myRequests;

  /// No description provided for @openCount.
  ///
  /// In en, this message translates to:
  /// **'{count} open'**
  String openCount(int count);

  /// No description provided for @visitOn.
  ///
  /// In en, this message translates to:
  /// **'Visit {date}'**
  String visitOn(String date);

  /// No description provided for @visitToBeScheduled.
  ///
  /// In en, this message translates to:
  /// **'Visit to be scheduled'**
  String get visitToBeScheduled;

  /// No description provided for @resolvedOn.
  ///
  /// In en, this message translates to:
  /// **'Resolved {date}'**
  String resolvedOn(String date);

  /// No description provided for @rate.
  ///
  /// In en, this message translates to:
  /// **'Rate'**
  String get rate;

  /// No description provided for @rateTitle.
  ///
  /// In en, this message translates to:
  /// **'How was the repair?'**
  String get rateTitle;

  /// No description provided for @starsLabel.
  ///
  /// In en, this message translates to:
  /// **'{count, plural, =1{1 star} other{{count} stars}}'**
  String starsLabel(int count);

  /// No description provided for @callJogooCameroon.
  ///
  /// In en, this message translates to:
  /// **'Call JOGOO Cameroon'**
  String get callJogooCameroon;

  /// No description provided for @warrantyEnded.
  ///
  /// In en, this message translates to:
  /// **'Warranty ended'**
  String get warrantyEnded;

  /// No description provided for @warrantyNote.
  ///
  /// In en, this message translates to:
  /// **'Repairs on parts under warranty are free. The technician confirms cover before any work.'**
  String get warrantyNote;

  /// No description provided for @bookVisitTitle.
  ///
  /// In en, this message translates to:
  /// **'Book a visit'**
  String get bookVisitTitle;

  /// No description provided for @bookVisitBody.
  ///
  /// In en, this message translates to:
  /// **'Which installation needs a visit? JOGOO will call you to agree a date.'**
  String get bookVisitBody;

  /// No description provided for @requestTitle.
  ///
  /// In en, this message translates to:
  /// **'Request {id}'**
  String requestTitle(String id);

  /// No description provided for @technicianVisit.
  ///
  /// In en, this message translates to:
  /// **'Technician visit'**
  String get technicianVisit;

  /// No description provided for @technicianToAssign.
  ///
  /// In en, this message translates to:
  /// **'Technician to be assigned'**
  String get technicianToAssign;

  /// No description provided for @callTechnician.
  ///
  /// In en, this message translates to:
  /// **'Call the technician'**
  String get callTechnician;

  /// No description provided for @progress.
  ///
  /// In en, this message translates to:
  /// **'Progress'**
  String get progress;

  /// No description provided for @stepReceived.
  ///
  /// In en, this message translates to:
  /// **'Request received'**
  String get stepReceived;

  /// No description provided for @stepDiagnosed.
  ///
  /// In en, this message translates to:
  /// **'Diagnosis'**
  String get stepDiagnosed;

  /// No description provided for @stepBooked.
  ///
  /// In en, this message translates to:
  /// **'Visit booked'**
  String get stepBooked;

  /// No description provided for @stepFixed.
  ///
  /// In en, this message translates to:
  /// **'Fixed'**
  String get stepFixed;

  /// No description provided for @coveredByWarranty.
  ///
  /// In en, this message translates to:
  /// **'Covered by warranty'**
  String get coveredByWarranty;

  /// No description provided for @notCovered.
  ///
  /// In en, this message translates to:
  /// **'Not covered by warranty'**
  String get notCovered;

  /// No description provided for @yourNotes.
  ///
  /// In en, this message translates to:
  /// **'Your notes'**
  String get yourNotes;

  /// No description provided for @reschedule.
  ///
  /// In en, this message translates to:
  /// **'Reschedule'**
  String get reschedule;

  /// No description provided for @addDetails.
  ///
  /// In en, this message translates to:
  /// **'Add details'**
  String get addDetails;

  /// No description provided for @detailsHint.
  ///
  /// In en, this message translates to:
  /// **'A note for the technician'**
  String get detailsHint;

  /// No description provided for @noteAdded.
  ///
  /// In en, this message translates to:
  /// **'Note added'**
  String get noteAdded;

  /// No description provided for @pickNewDate.
  ///
  /// In en, this message translates to:
  /// **'Pick a new date'**
  String get pickNewDate;

  /// No description provided for @rescheduleNote.
  ///
  /// In en, this message translates to:
  /// **'Asked to move the visit to {date}'**
  String rescheduleNote(String date);

  /// No description provided for @rescheduleSentTitle.
  ///
  /// In en, this message translates to:
  /// **'New date requested'**
  String get rescheduleSentTitle;

  /// No description provided for @rescheduleSentBody.
  ///
  /// In en, this message translates to:
  /// **'The technician will call you to confirm.'**
  String get rescheduleSentBody;

  /// No description provided for @clientSince.
  ///
  /// In en, this message translates to:
  /// **'JOGOO client since {date}'**
  String clientSince(String date);

  /// No description provided for @location.
  ///
  /// In en, this message translates to:
  /// **'Location'**
  String get location;

  /// No description provided for @area.
  ///
  /// In en, this message translates to:
  /// **'Area'**
  String get area;

  /// No description provided for @hectares.
  ///
  /// In en, this message translates to:
  /// **'{value} ha'**
  String hectares(String value);

  /// No description provided for @thisSeasonIWant.
  ///
  /// In en, this message translates to:
  /// **'This season I want'**
  String get thisSeasonIWant;

  /// No description provided for @goalsHelp.
  ///
  /// In en, this message translates to:
  /// **'Your goals shape JOGOO\'s offers and advice.'**
  String get goalsHelp;

  /// No description provided for @goalHigherYields.
  ///
  /// In en, this message translates to:
  /// **'Higher yields'**
  String get goalHigherYields;

  /// No description provided for @goalMoreLand.
  ///
  /// In en, this message translates to:
  /// **'More land watered'**
  String get goalMoreLand;

  /// No description provided for @goalSaveWater.
  ///
  /// In en, this message translates to:
  /// **'Save water'**
  String get goalSaveWater;

  /// No description provided for @goalLessLabour.
  ///
  /// In en, this message translates to:
  /// **'Less labour'**
  String get goalLessLabour;

  /// No description provided for @editFarmTitle.
  ///
  /// In en, this message translates to:
  /// **'Edit my farm'**
  String get editFarmTitle;

  /// No description provided for @partsTitle.
  ///
  /// In en, this message translates to:
  /// **'Parts for my farm'**
  String get partsTitle;

  /// No description provided for @partsSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Matched to your installations'**
  String get partsSubtitle;

  /// No description provided for @scanSticker.
  ///
  /// In en, this message translates to:
  /// **'Scan the JOGOO sticker'**
  String get scanSticker;

  /// No description provided for @pointCameraAtSticker.
  ///
  /// In en, this message translates to:
  /// **'Point your camera at an equipment sticker or QR code.'**
  String get pointCameraAtSticker;

  /// No description provided for @orTypeSerial.
  ///
  /// In en, this message translates to:
  /// **'Or type the serial number'**
  String get orTypeSerial;

  /// No description provided for @serialNotFound.
  ///
  /// In en, this message translates to:
  /// **'No installation found with serial {serial}.'**
  String serialNotFound(String serial);

  /// No description provided for @serialFound.
  ///
  /// In en, this message translates to:
  /// **'Showing parts for {name}'**
  String serialFound(String name);

  /// No description provided for @reorderTitle.
  ///
  /// In en, this message translates to:
  /// **'Reorder inputs'**
  String get reorderTitle;

  /// No description provided for @sizedFor.
  ///
  /// In en, this message translates to:
  /// **'Sized for your {area} ha'**
  String sizedFor(String area);

  /// No description provided for @yourUsualOrder.
  ///
  /// In en, this message translates to:
  /// **'Your usual order'**
  String get yourUsualOrder;

  /// No description provided for @lastBought.
  ///
  /// In en, this message translates to:
  /// **'last bought {date}'**
  String lastBought(String date);

  /// No description provided for @bags.
  ///
  /// In en, this message translates to:
  /// **'{count, plural, =1{1 bag} other{{count} bags}}'**
  String bags(int count);

  /// No description provided for @fewerBags.
  ///
  /// In en, this message translates to:
  /// **'Fewer bags'**
  String get fewerBags;

  /// No description provided for @moreBags.
  ///
  /// In en, this message translates to:
  /// **'More bags'**
  String get moreBags;

  /// No description provided for @recommendedFor.
  ///
  /// In en, this message translates to:
  /// **'Recommended for {area} ha'**
  String recommendedFor(String area);

  /// No description provided for @reorderOneTap.
  ///
  /// In en, this message translates to:
  /// **'Reorder in one tap'**
  String get reorderOneTap;

  /// No description provided for @reorderSavedTitle.
  ///
  /// In en, this message translates to:
  /// **'Reorder saved for JOGOO sales'**
  String get reorderSavedTitle;

  /// No description provided for @remindBeforeSeason.
  ///
  /// In en, this message translates to:
  /// **'Remind me before each season'**
  String get remindBeforeSeason;

  /// No description provided for @orderTitle.
  ///
  /// In en, this message translates to:
  /// **'Order {id}'**
  String orderTitle(String id);

  /// No description provided for @arriving.
  ///
  /// In en, this message translates to:
  /// **'Arriving'**
  String get arriving;

  /// No description provided for @dropOffPoint.
  ///
  /// In en, this message translates to:
  /// **'Drop-off point: {place}'**
  String dropOffPoint(String place);

  /// No description provided for @collectionCode.
  ///
  /// In en, this message translates to:
  /// **'Collection code'**
  String get collectionCode;

  /// No description provided for @showCode.
  ///
  /// In en, this message translates to:
  /// **'Show the code in large'**
  String get showCode;

  /// No description provided for @changeDropOff.
  ///
  /// In en, this message translates to:
  /// **'Change drop-off'**
  String get changeDropOff;

  /// No description provided for @callDriver.
  ///
  /// In en, this message translates to:
  /// **'Call the driver'**
  String get callDriver;

  /// No description provided for @dropOffChangeTitle.
  ///
  /// In en, this message translates to:
  /// **'Change requested'**
  String get dropOffChangeTitle;

  /// No description provided for @dropOffChangeBody.
  ///
  /// In en, this message translates to:
  /// **'JOGOO will call you to agree the new drop-off point.'**
  String get dropOffChangeBody;

  /// No description provided for @whichEquipment.
  ///
  /// In en, this message translates to:
  /// **'Which equipment?'**
  String get whichEquipment;

  /// No description provided for @whatIsWrong.
  ///
  /// In en, this message translates to:
  /// **'What is wrong?'**
  String get whatIsWrong;

  /// No description provided for @describeProblem.
  ///
  /// In en, this message translates to:
  /// **'Describe the problem'**
  String get describeProblem;

  /// No description provided for @describeProblemHint.
  ///
  /// In en, this message translates to:
  /// **'Where is it, and since when?'**
  String get describeProblemHint;

  /// No description provided for @photosAndVideos.
  ///
  /// In en, this message translates to:
  /// **'Photos and videos'**
  String get photosAndVideos;

  /// No description provided for @sendRequest.
  ///
  /// In en, this message translates to:
  /// **'Send request'**
  String get sendRequest;

  /// No description provided for @pickProblemFirst.
  ///
  /// In en, this message translates to:
  /// **'Choose the equipment and the problem first.'**
  String get pickProblemFirst;

  /// No description provided for @reportSavedTitle.
  ///
  /// In en, this message translates to:
  /// **'Request {id} saved'**
  String reportSavedTitle(String id);

  /// No description provided for @reportSavedBody.
  ///
  /// In en, this message translates to:
  /// **'JOGOO will call you today.'**
  String get reportSavedBody;

  /// No description provided for @agronomistsTitle.
  ///
  /// In en, this message translates to:
  /// **'JOGOO agronomists'**
  String get agronomistsTitle;

  /// No description provided for @repliesWeekdays.
  ///
  /// In en, this message translates to:
  /// **'Replies Mon to Fri'**
  String get repliesWeekdays;

  /// No description provided for @wateringPlanThisWeek.
  ///
  /// In en, this message translates to:
  /// **'Watering plan this week'**
  String get wateringPlanThisWeek;

  /// No description provided for @updatedOn.
  ///
  /// In en, this message translates to:
  /// **'Updated {date}'**
  String updatedOn(String date);

  /// No description provided for @bookFieldVisit.
  ///
  /// In en, this message translates to:
  /// **'Book a field visit'**
  String get bookFieldVisit;

  /// No description provided for @askTheAgronomists.
  ///
  /// In en, this message translates to:
  /// **'Ask the agronomists'**
  String get askTheAgronomists;

  /// No description provided for @messageSavedTitle.
  ///
  /// In en, this message translates to:
  /// **'Message saved'**
  String get messageSavedTitle;

  /// No description provided for @messageSavedBody.
  ///
  /// In en, this message translates to:
  /// **'The agronomists reply Monday to Friday.'**
  String get messageSavedBody;

  /// No description provided for @fieldVisitTitle.
  ///
  /// In en, this message translates to:
  /// **'Field visit requested'**
  String get fieldVisitTitle;

  /// No description provided for @fieldVisitBody.
  ///
  /// In en, this message translates to:
  /// **'An agronomist will call you to agree a date.'**
  String get fieldVisitBody;

  /// No description provided for @documentsSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Saved on this phone, readable offline'**
  String get documentsSubtitle;

  /// No description provided for @filterAll.
  ///
  /// In en, this message translates to:
  /// **'All'**
  String get filterAll;

  /// No description provided for @filterPlans.
  ///
  /// In en, this message translates to:
  /// **'Plans'**
  String get filterPlans;

  /// No description provided for @filterElectrical.
  ///
  /// In en, this message translates to:
  /// **'Electrical'**
  String get filterElectrical;

  /// No description provided for @filterWarranty.
  ///
  /// In en, this message translates to:
  /// **'Warranty'**
  String get filterWarranty;

  /// No description provided for @noDocuments.
  ///
  /// In en, this message translates to:
  /// **'No document of this type yet.'**
  String get noDocuments;

  /// No description provided for @documentsCount.
  ///
  /// In en, this message translates to:
  /// **'{count, plural, =1{1 document} other{{count} documents}}'**
  String documentsCount(int count);

  /// No description provided for @pdfSize.
  ///
  /// In en, this message translates to:
  /// **'PDF · {size} MB'**
  String pdfSize(String size);

  /// No description provided for @generatedDemoPdf.
  ///
  /// In en, this message translates to:
  /// **'Generated demo PDF · not an original document'**
  String get generatedDemoPdf;

  /// No description provided for @serialNumber.
  ///
  /// In en, this message translates to:
  /// **'Serial number: {serial}'**
  String serialNumber(String serial);

  /// No description provided for @demoDocumentNotice.
  ///
  /// In en, this message translates to:
  /// **'Demonstration only. Generated from sample app data; this is not an original JOGOO plan, contract, or technical document.'**
  String get demoDocumentNotice;

  /// No description provided for @demoCopy.
  ///
  /// In en, this message translates to:
  /// **'DEMONSTRATION COPY'**
  String get demoCopy;

  /// No description provided for @pdfExportFailed.
  ///
  /// In en, this message translates to:
  /// **'The PDF could not be created or shared. Please try again.'**
  String get pdfExportFailed;

  /// No description provided for @downloadsLaterTitle.
  ///
  /// In en, this message translates to:
  /// **'Documents are not connected yet'**
  String get downloadsLaterTitle;

  /// No description provided for @downloadsLaterBody.
  ///
  /// In en, this message translates to:
  /// **'Opening and downloading files will work once JOGOO documents are online.'**
  String get downloadsLaterBody;

  /// No description provided for @pendingSync.
  ///
  /// In en, this message translates to:
  /// **'{count, plural, =1{1 entry waiting to sync} other{{count} entries waiting to sync}}'**
  String pendingSync(int count);

  /// No description provided for @loggedBy.
  ///
  /// In en, this message translates to:
  /// **'Logged by {name}'**
  String loggedBy(String name);

  /// No description provided for @loggedByLabel.
  ///
  /// In en, this message translates to:
  /// **'Logged by'**
  String get loggedByLabel;

  /// No description provided for @waitingToSync.
  ///
  /// In en, this message translates to:
  /// **'Waiting to sync'**
  String get waitingToSync;

  /// No description provided for @synced.
  ///
  /// In en, this message translates to:
  /// **'Synced'**
  String get synced;

  /// No description provided for @exportPdf.
  ///
  /// In en, this message translates to:
  /// **'Export for audit (PDF)'**
  String get exportPdf;

  /// No description provided for @logReportTitle.
  ///
  /// In en, this message translates to:
  /// **'JOGOO maintenance log'**
  String get logReportTitle;

  /// No description provided for @emptyLog.
  ///
  /// In en, this message translates to:
  /// **'No entries yet. Tap + to log a job.'**
  String get emptyLog;

  /// No description provided for @newEntry.
  ///
  /// In en, this message translates to:
  /// **'New entry'**
  String get newEntry;

  /// No description provided for @entryService.
  ///
  /// In en, this message translates to:
  /// **'Service'**
  String get entryService;

  /// No description provided for @entryPartReplaced.
  ///
  /// In en, this message translates to:
  /// **'Part replaced'**
  String get entryPartReplaced;

  /// No description provided for @entryFertigation.
  ///
  /// In en, this message translates to:
  /// **'Fertigation'**
  String get entryFertigation;

  /// No description provided for @date.
  ///
  /// In en, this message translates to:
  /// **'Date'**
  String get date;

  /// No description provided for @equipment.
  ///
  /// In en, this message translates to:
  /// **'Equipment'**
  String get equipment;

  /// No description provided for @product.
  ///
  /// In en, this message translates to:
  /// **'Product'**
  String get product;

  /// No description provided for @quantity.
  ///
  /// In en, this message translates to:
  /// **'Quantity'**
  String get quantity;

  /// No description provided for @waterVolume.
  ///
  /// In en, this message translates to:
  /// **'Water volume'**
  String get waterVolume;

  /// No description provided for @workDone.
  ///
  /// In en, this message translates to:
  /// **'Work done'**
  String get workDone;

  /// No description provided for @workDoneHint.
  ///
  /// In en, this message translates to:
  /// **'e.g. Filter cleaned'**
  String get workDoneHint;

  /// No description provided for @part.
  ///
  /// In en, this message translates to:
  /// **'Part'**
  String get part;

  /// No description provided for @partHint.
  ///
  /// In en, this message translates to:
  /// **'e.g. Valve 32 mm'**
  String get partHint;

  /// No description provided for @checklist.
  ///
  /// In en, this message translates to:
  /// **'Checklist'**
  String get checklist;

  /// No description provided for @checkFilterBeforeInjection.
  ///
  /// In en, this message translates to:
  /// **'Filter cleaned before injection'**
  String get checkFilterBeforeInjection;

  /// No description provided for @checkTankRinsed.
  ///
  /// In en, this message translates to:
  /// **'Tank rinsed'**
  String get checkTankRinsed;

  /// No description provided for @checkLinesFlushed.
  ///
  /// In en, this message translates to:
  /// **'Lines flushed after injection'**
  String get checkLinesFlushed;

  /// No description provided for @checkFilterCleaned.
  ///
  /// In en, this message translates to:
  /// **'Filter cleaned'**
  String get checkFilterCleaned;

  /// No description provided for @checkPressure.
  ///
  /// In en, this message translates to:
  /// **'Pressure checked'**
  String get checkPressure;

  /// No description provided for @checkLeaks.
  ///
  /// In en, this message translates to:
  /// **'Lines checked for leaks'**
  String get checkLeaks;

  /// No description provided for @checkOldPartKept.
  ///
  /// In en, this message translates to:
  /// **'Old part kept for the technician'**
  String get checkOldPartKept;

  /// No description provided for @checkSystemTested.
  ///
  /// In en, this message translates to:
  /// **'System tested after fitting'**
  String get checkSystemTested;

  /// No description provided for @fertigationEntry.
  ///
  /// In en, this message translates to:
  /// **'Fertigation: {product}, {quantity} in {water}'**
  String fertigationEntry(String product, String quantity, String water);

  /// No description provided for @partReplacedEntry.
  ///
  /// In en, this message translates to:
  /// **'Part replaced: {part}'**
  String partReplacedEntry(String part);

  /// No description provided for @saveOnPhone.
  ///
  /// In en, this message translates to:
  /// **'Save on this phone'**
  String get saveOnPhone;

  /// No description provided for @syncLater.
  ///
  /// In en, this message translates to:
  /// **'It will sync by itself when you are back online'**
  String get syncLater;

  /// No description provided for @entrySavedTitle.
  ///
  /// In en, this message translates to:
  /// **'Saved on this phone'**
  String get entrySavedTitle;

  /// No description provided for @notificationsTitle.
  ///
  /// In en, this message translates to:
  /// **'Notifications'**
  String get notificationsTitle;

  /// No description provided for @notificationsSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Choose how JOGOO reaches you'**
  String get notificationsSubtitle;

  /// No description provided for @channelPush.
  ///
  /// In en, this message translates to:
  /// **'Push'**
  String get channelPush;

  /// No description provided for @savedSummary.
  ///
  /// In en, this message translates to:
  /// **'{guides} and {videos} saved'**
  String savedSummary(String guides, String videos);

  /// No description provided for @guidesCount.
  ///
  /// In en, this message translates to:
  /// **'{count, plural, =1{1 guide} other{{count} guides}}'**
  String guidesCount(int count);

  /// No description provided for @videosCount.
  ///
  /// In en, this message translates to:
  /// **'{count, plural, =1{1 walkthrough} other{{count} walkthroughs}}'**
  String videosCount(int count);

  /// No description provided for @worksOffline.
  ///
  /// In en, this message translates to:
  /// **'Everything here works without internet'**
  String get worksOffline;

  /// No description provided for @userManuals.
  ///
  /// In en, this message translates to:
  /// **'User manuals'**
  String get userManuals;

  /// No description provided for @illustratedGuides.
  ///
  /// In en, this message translates to:
  /// **'Illustrated guides'**
  String get illustratedGuides;

  /// No description provided for @wifiOnly.
  ///
  /// In en, this message translates to:
  /// **'Download on Wi-Fi only'**
  String get wifiOnly;

  /// No description provided for @wifiOnlyHelp.
  ///
  /// In en, this message translates to:
  /// **'Saves your mobile data'**
  String get wifiOnlyHelp;
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(lookupAppLocalizations(locale));
  }

  @override
  bool isSupported(Locale locale) =>
      <String>['en', 'fr'].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

AppLocalizations lookupAppLocalizations(Locale locale) {
  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'en':
      return AppLocalizationsEn();
    case 'fr':
      return AppLocalizationsFr();
  }

  throw FlutterError(
    'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
    'an issue with the localizations generation tool. Please file an issue '
    'on GitHub with a reproducible sample app and the gen-l10n configuration '
    'that was used.',
  );
}

import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:jogoo_app/app/app.dart';
import 'package:jogoo_app/config/app_config.dart';
import 'package:jogoo_app/data/app_database.dart';
import 'package:jogoo_app/data/jogoo_store.dart';
import 'package:jogoo_app/data/mia_client.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  _registerFontLicenses();

  final database = await openAppDatabase();
  final language = await readLanguage(database);

  if (AppConfig.hasSupabase) {
    await Supabase.initialize(
      url: AppConfig.supabaseUrl,
      publishableKey: AppConfig.supabasePublishableKey,
    );
    if (AppConfig.hasPowerSync) {
      syncWhileSignedIn(database, Supabase.instance.client);
    }
  }

  final store = JogooStore(
    mia: AppConfig.hasSupabase
        ? const SupabaseMiaClient()
        : const OfflineMiaClient(),
    locale: language == null ? null : Locale(language),
    onLocaleChanged: (locale) =>
        saveLanguage(database, locale.languageCode),
  );

  runApp(JogooApp(store: store));
}

/// Poppins and Montserrat are bundled under the SIL Open Font License.
void _registerFontLicenses() {
  LicenseRegistry.addLicense(() async* {
    for (final (family, file) in [
      ('Poppins', 'assets/fonts/OFL-Poppins.txt'),
      ('Montserrat', 'assets/fonts/OFL-Montserrat.txt'),
    ]) {
      yield LicenseEntryWithLineBreaks([family], await rootBundle.loadString(file));
    }
  });
}

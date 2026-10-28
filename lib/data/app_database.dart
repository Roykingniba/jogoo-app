import 'package:flutter/foundation.dart';
import 'package:path/path.dart';
import 'package:path_provider/path_provider.dart';
import 'package:powersync/powersync.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'schema.dart';
import 'supabase_connector.dart';

/// Opens the on-device database. The app reads and writes locally, so it
/// works offline; sync is layered on top when a user is signed in.
Future<PowerSyncDatabase> openAppDatabase() async {
  // On the web PowerSync stores the database in the browser (IndexedDB/OPFS)
  // using the files in web/ from `dart run powersync:setup_web`.
  final path = kIsWeb
      ? 'jogoo.db'
      : join((await getApplicationSupportDirectory()).path, 'jogoo.db');
  final database = PowerSyncDatabase(schema: schema, path: path);
  await database.initialize();
  return database;
}

/// The language the client picked in the app, if any.
Future<String?> readLanguage(PowerSyncDatabase database) async {
  final row = await database.getOptional(
    "SELECT value FROM local_settings WHERE id = 'language'",
  );
  return row?['value'] as String?;
}

Future<void> saveLanguage(PowerSyncDatabase database, String code) {
  return database.writeTransaction((tx) async {
    await tx.execute("DELETE FROM local_settings WHERE id = 'language'");
    await tx.execute(
      "INSERT INTO local_settings (id, value) VALUES ('language', ?)",
      [code],
    );
  });
}

/// Syncs while a user is signed in. On sign-out the local copy is cleared so
/// the next person on a shared phone cannot see the previous farm's data.
void syncWhileSignedIn(PowerSyncDatabase database, SupabaseClient client) {
  final connector = SupabaseConnector(client.auth, client);
  client.auth.onAuthStateChange.listen((data) async {
    switch (data.event) {
      case AuthChangeEvent.initialSession || AuthChangeEvent.signedIn
          when data.session != null:
        await database.connect(connector: connector);
      case AuthChangeEvent.signedOut:
        await database.disconnectAndClear();
      default:
        break;
    }
  });
}

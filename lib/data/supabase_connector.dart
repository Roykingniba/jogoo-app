import 'package:flutter/foundation.dart';
import 'package:powersync/powersync.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../config/app_config.dart';

/// Postgres errors that retrying cannot fix: data exceptions (22xxx),
/// constraint violations (23xxx), and RLS/permission denials (42501).
final _fatalResponseCodes = [
  RegExp(r'^22...$'),
  RegExp(r'^23...$'),
  RegExp(r'^42501$'),
];

/// Authenticates PowerSync with the Supabase session and uploads local
/// writes through the Supabase Data API, where RLS applies.
class SupabaseConnector extends PowerSyncBackendConnector {
  SupabaseConnector(this._auth, this._client);

  final GoTrueClient _auth;
  final SupabaseClient _client;

  @override
  Future<PowerSyncCredentials?> fetchCredentials() async {
    var session = _auth.currentSession;
    if (session == null) return null;
    if (session.isExpired) {
      session = (await _auth.refreshSession()).session;
      if (session == null) return null;
    }
    return PowerSyncCredentials(
      endpoint: AppConfig.powerSyncUrl,
      token: session.accessToken,
      userId: session.user.id,
    );
  }

  @override
  Future<void> uploadData(PowerSyncDatabase database) async {
    final transaction = await database.getNextCrudTransaction();
    if (transaction == null) return;

    try {
      for (final op in transaction.crud) {
        final table = _client.rest.from(op.table);
        switch (op.op) {
          case UpdateType.put:
            await table.upsert({...?op.opData, 'id': op.id});
          case UpdateType.patch:
            await table.update(op.opData!).eq('id', op.id);
          case UpdateType.delete:
            await table.delete().eq('id', op.id);
        }
      }
      await transaction.complete();
    } on PostgrestException catch (e) {
      final code = e.code;
      if (code != null && _fatalResponseCodes.any((re) => re.hasMatch(code))) {
        // Drop the rejected change so it cannot block the upload queue.
        debugPrint('Discarding rejected upload (${e.code}): ${e.message}');
        await transaction.complete();
      } else {
        rethrow;
      }
    }
  }
}

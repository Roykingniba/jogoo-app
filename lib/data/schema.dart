import 'package:powersync/powersync.dart';

/// On-device SQLite schema. Synced tables must match the Supabase tables in
/// `supabase/migrations` and the sync rules in `powersync/sync-rules.yaml`.
/// PowerSync adds the `id` column automatically.
const schema = Schema([
  Table('farms', [
    Column.text('name'),
    Column.text('created_by'),
    Column.text('created_at'),
    Column.text('updated_at'),
  ]),
  Table(
    'farm_members',
    [
      Column.text('farm_id'),
      Column.text('user_id'),
      Column.text('role'),
      Column.text('created_at'),
    ],
    indexes: [
      Index('farm', [IndexedColumn('farm_id')]),
    ],
  ),
  // Preferences for this phone only (e.g. language); never synced.
  Table.localOnly('local_settings', [Column.text('value')]),
]);

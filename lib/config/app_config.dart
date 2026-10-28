/// Build-time configuration passed with `--dart-define-from-file`.
///
/// Only public client values belong here. The Supabase publishable key is
/// designed to ship in apps; RLS protects the data. Service-role keys and
/// third-party API keys (Claude, Zoho, SMS, WhatsApp, payments) must stay in
/// Supabase function secrets.
abstract final class AppConfig {
  static const supabaseUrl = String.fromEnvironment('SUPABASE_URL');
  static const supabasePublishableKey = String.fromEnvironment(
    'SUPABASE_PUBLISHABLE_KEY',
  );
  static const powerSyncUrl = String.fromEnvironment('POWERSYNC_URL');

  static bool get hasSupabase =>
      supabaseUrl.isNotEmpty && supabasePublishableKey.isNotEmpty;

  static bool get hasPowerSync => hasSupabase && powerSyncUrl.isNotEmpty;
}

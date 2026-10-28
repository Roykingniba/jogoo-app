import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../config/app_config.dart';
import '../models/models.dart';

/// Talks to Mia. The Claude API is only ever called by the `mia` Supabase
/// Edge Function; the app never holds an API key.
abstract interface class MiaClient {
  /// Mia's answer, or null when Mia cannot be reached (offline, not signed
  /// in, or the function is not configured yet).
  Future<String?> reply({
    required List<ChatMessage> history,
    required String languageCode,
  });
}

class SupabaseMiaClient implements MiaClient {
  const SupabaseMiaClient();

  @override
  Future<String?> reply({
    required List<ChatMessage> history,
    required String languageCode,
  }) async {
    if (!AppConfig.hasSupabase) return null;
    final client = Supabase.instance.client;
    if (client.auth.currentSession == null) return null;

    try {
      final response = await client.functions.invoke(
        'mia',
        body: {
          'language': languageCode,
          'messages': [
            for (final message in history)
              if (message.text.en.isNotEmpty)
                {
                  'role': message.author == ChatAuthor.client
                      ? 'user'
                      : 'assistant',
                  'content': languageCode == 'fr'
                      ? message.text.fr
                      : message.text.en,
                },
          ],
        },
      );
      final data = response.data;
      if (data is Map && data['reply'] is String) return data['reply'];
      return null;
    } on FunctionException catch (e) {
      debugPrint('Mia unavailable (${e.status})');
      return null;
    } catch (e) {
      debugPrint('Mia unavailable: $e');
      return null;
    }
  }
}

/// Used when no backend is configured, and in tests.
class OfflineMiaClient implements MiaClient {
  const OfflineMiaClient();

  @override
  Future<String?> reply({
    required List<ChatMessage> history,
    required String languageCode,
  }) async => null;
}

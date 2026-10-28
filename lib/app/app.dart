import 'package:flutter/material.dart';

import '../data/jogoo_store.dart';
import '../generated/l10n/app_localizations.dart';
import 'shell.dart';
import 'theme.dart';

class JogooApp extends StatelessWidget {
  const JogooApp({super.key, required this.store});

  final JogooStore store;

  @override
  Widget build(BuildContext context) {
    // The scope sits above MaterialApp so dialogs and sheets can reach it.
    return JogooScope(
      store: store,
      child: ValueListenableBuilder<Locale?>(
        valueListenable: store.localeListenable,
        builder: (context, locale, _) => MaterialApp(
          locale: locale,
          onGenerateTitle: (context) => AppLocalizations.of(context).appTitle,
          localizationsDelegates: AppLocalizations.localizationsDelegates,
          supportedLocales: AppLocalizations.supportedLocales,
          theme: buildJogooTheme(),
          debugShowCheckedModeBanner: false,
          home: AppShell(key: AppShell.globalKey),
        ),
      ),
    );
  }
}

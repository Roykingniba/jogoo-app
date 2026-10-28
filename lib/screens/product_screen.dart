import 'package:flutter/material.dart';

import '../app/theme.dart';
import '../data/jogoo_store.dart';
import '../generated/l10n/app_localizations.dart';
import '../models/models.dart';
import '../utils/format.dart';
import '../widgets/jogoo_widgets.dart';

/// Screen 05: a product page that sells the add-ons too.
class ProductScreen extends StatefulWidget {
  const ProductScreen({super.key, required this.productId});

  final String productId;

  @override
  State<ProductScreen> createState() => _ProductScreenState();
}

class _ProductScreenState extends State<ProductScreen> {
  late final Product _product = JogooScope.read(
    context,
  ).productById(widget.productId);
  late final Set<String> _selected = {
    for (final addOn in _product.addOns)
      if (addOn.selectedByDefault) addOn.id,
  };
  bool _saved = false;

  int get _total =>
      _product.price +
      _product.addOns
          .where((a) => _selected.contains(a.id))
          .fold(0, (sum, a) => sum + a.price);

  String _addOnTitle(AddOn addOn) {
    final title = addOn.title.of(context);
    if (addOn.fittingDate == null) return title;
    return title.replaceAll('{date}', dayMonth(context, addOn.fittingDate!));
  }

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    final text = Theme.of(context).textTheme;
    final onQuote = _product.price == 0;

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
              child: Row(
                children: [
                  CircleButton(
                    icon: Icons.chevron_left,
                    tooltip: l.back,
                    onPressed: () => Navigator.pop(context),
                  ),
                  const Spacer(),
                  CircleButton(
                    icon: _saved ? Icons.favorite : Icons.favorite_border,
                    color: JColors.magenta,
                    tooltip: l.saveForLater,
                    onPressed: () => setState(() => _saved = !_saved),
                  ),
                ],
              ),
            ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
                children: [
                  Center(
                    child: Container(
                      padding: const EdgeInsets.all(18),
                      decoration: const BoxDecoration(
                        color: JColors.limeTint,
                        shape: BoxShape.circle,
                      ),
                      child: PhotoCircle(
                        asset: _product.photo,
                        size: 220,
                        ring: 6,
                      ),
                    ),
                  ),
                  const SizedBox(height: 18),
                  if (_product.fitNote != null)
                    Center(
                      child: StatusPill(
                        _product.fitNote!.of(context),
                        tone: _product.highlightFit ? Tone.lime : Tone.blue,
                      ),
                    ),
                  const SizedBox(height: 10),
                  Text(
                    _product.name.of(context),
                    textAlign: TextAlign.center,
                    style: text.headlineSmall?.copyWith(
                      color: JColors.navy,
                      fontSize: 26,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    onQuote
                        ? l.priceOnQuote
                        : '${formatAmount(_product.price)} FCFA',
                    textAlign: TextAlign.center,
                    style: text.titleLarge,
                  ),
                  if (_product.addOns.isNotEmpty) ...[
                    const SizedBox(height: 20),
                    JCard(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 20,
                        vertical: 4,
                      ),
                      child: DividedColumn(
                        children: [
                          for (final addOn in _product.addOns)
                            CheckboxListTile(
                              contentPadding: EdgeInsets.zero,
                              value: _selected.contains(addOn.id),
                              onChanged: (on) => setState(
                                () => on == true
                                    ? _selected.add(addOn.id)
                                    : _selected.remove(addOn.id),
                              ),
                              activeColor: JColors.navy,
                              secondary: TintIcon(
                                addOn.icon,
                                tone: addOn.tone,
                                size: 52,
                              ),
                              title: Text(
                                _addOnTitle(addOn),
                                style: text.titleSmall,
                              ),
                              subtitle: Text(
                                '+${formatAmount(addOn.price)} FCFA',
                                style: text.bodyMedium,
                              ),
                            ),
                        ],
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: Material(
        color: JColors.surface,
        child: SafeArea(
          top: false,
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 14, 16, 14),
            child: Row(
              children: [
                if (!onQuote) ...[
                  Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(l.total, style: text.bodySmall),
                      Text(
                        '${formatAmount(_total)} F',
                        style: text.titleLarge,
                      ),
                    ],
                  ),
                  const SizedBox(width: 16),
                ],
                Expanded(
                  child: FilledButton(
                    onPressed: onQuote ? _requestQuote : _addToCart,
                    child: Text(onQuote ? l.getQuote : l.addToCart),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _addToCart() {
    final l = AppLocalizations.of(context);
    final store = JogooScope.read(context);
    store.addToCart(
      CartLine(id: _product.id, title: _product.name, unitPrice: _product.price),
    );
    for (final addOn in _product.addOns.where((a) => _selected.contains(a.id))) {
      store.addToCart(
        CartLine(
          id: '${_product.id}/${addOn.id}',
          title: Bi.same(_addOnTitle(addOn)),
          unitPrice: addOn.price,
        ),
      );
    }
    showJogooToast(context, l.addedToCart, _product.name.of(context));
  }

  void _requestQuote() {
    final l = AppLocalizations.of(context);
    JogooScope.read(context).requestFromSales(
      Bi('Quote: ${_product.name.en}', 'Devis : ${_product.name.fr}'),
    );
    showJogooToast(
      context,
      l.requestSavedTitle,
      l.requestSavedBody(_product.name.of(context)),
    );
  }
}

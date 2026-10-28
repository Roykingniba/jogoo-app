import 'package:flutter/material.dart';

import '../app/shell.dart';
import '../app/theme.dart';
import '../data/jogoo_store.dart';
import '../generated/l10n/app_localizations.dart';
import '../models/models.dart';
import '../utils/format.dart';
import '../widgets/jogoo_widgets.dart';
import 'product_screen.dart';
import 'reorder_inputs_screen.dart';
import 'spare_parts_screen.dart';

/// Screen 04: one unified shop and catalogue, filtered for this farm.
class ShopScreen extends StatefulWidget {
  const ShopScreen({super.key});

  @override
  State<ShopScreen> createState() => _ShopScreenState();
}

class _ShopScreenState extends State<ShopScreen> {
  ProductCategory? _category; // null = "For you"
  String _query = '';

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    final store = JogooScope.of(context);
    final query = _query.trim().toLowerCase();

    final List<Product> shown;
    final String heading;
    if (query.isNotEmpty) {
      shown = store.products
          .where(
            (p) =>
                p.name.en.toLowerCase().contains(query) ||
                p.name.fr.toLowerCase().contains(query),
          )
          .toList();
      heading = l.searchResults;
    } else if (_category == null) {
      shown = store.products.where((p) => p.recommended).toList();
      heading = l.forYourEquipment;
    } else {
      shown = store.products.where((p) => p.category == _category).toList();
      heading = _categoryLabel(l, _category!);
    }

    return ListView(
      padding: const EdgeInsets.only(bottom: 24),
      children: [
        PageTitle(
          title: l.navShop,
          subtitle: l.shopSubtitle,
          trailing: _CartButton(count: store.cartCount),
        ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: SearchBox(
            hint: l.searchProducts,
            onChanged: (value) => setState(() => _query = value),
          ),
        ),
        const SizedBox(height: 18),
        SizedBox(
          height: 112,
          child: ListView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 12),
            children: [
              _CategoryBubble(
                label: l.catForYou,
                selected: _category == null,
                onTap: () => setState(() => _category = null),
              ),
              for (final category in [
                ProductCategory.filters,
                ProductCategory.valves,
                ProductCategory.sprinklers,
                ProductCategory.pivots,
              ])
                _CategoryBubble(
                  label: _categoryLabel(l, category),
                  photo: store.products
                      .firstWhere((p) => p.category == category)
                      .photo,
                  selected: _category == category,
                  onTap: () => setState(() => _category = category),
                ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: BrandCard(
            blobSize: 200,
            child: LayoutBuilder(
              builder: (context, constraints) {
                final copy = Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      l.upsellTitle,
                      style: const TextStyle(
                        fontFamily: 'Poppins',
                        fontWeight: FontWeight.w700,
                        fontSize: 19,
                        color: Colors.white,
                        height: 1.2,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      l.upsellBody,
                      style: const TextStyle(
                        color: Color(0xFFC9DBEC),
                        fontSize: 13.5,
                      ),
                    ),
                  ],
                );
                final button = FilledButton(
                  style: FilledButton.styleFrom(
                    backgroundColor: Colors.white,
                    foregroundColor: JColors.navy,
                  ),
                  onPressed: () {
                    store.requestFromSales(
                      const Bi(
                        'Quote: extend drip system to plot C',
                        'Devis : extension goutte-à-goutte parcelle C',
                      ),
                    );
                    showJogooToast(
                      context,
                      l.requestSavedTitle,
                      l.requestSavedBody(l.upsellTitle),
                    );
                  },
                  child: Text(l.getQuote),
                );
                // Side by side on roomy screens, stacked on small ones or
                // with large system text.
                if (constraints.maxWidth >= 340 &&
                    MediaQuery.textScalerOf(context).scale(1) <= 1.1) {
                  return Row(
                    children: [
                      Expanded(child: copy),
                      const SizedBox(width: 12),
                      button,
                    ],
                  );
                }
                return Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [copy, const SizedBox(height: 14), button],
                );
              },
            ),
          ),
        ),
        const SizedBox(height: 16),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Row(
            children: [
              Expanded(
                child: _QuickLink(
                  icon: Icons.qr_code_2,
                  tone: Tone.blue,
                  title: l.partsTitle,
                  onTap: () => push(context, const SparePartsScreen()),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _QuickLink(
                  icon: Icons.spa_outlined,
                  tone: Tone.lime,
                  title: l.reorderTitle,
                  onTap: () => push(context, const ReorderInputsScreen()),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 22),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: SectionTitle(heading),
        ),
        const SizedBox(height: 12),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: shown.isEmpty
              ? JCard(child: Text(l.noProducts))
              : _ProductGrid(products: shown),
        ),
      ],
    );
  }
}

String _categoryLabel(AppLocalizations l, ProductCategory category) =>
    switch (category) {
      ProductCategory.filters => l.catFilters,
      ProductCategory.valves => l.catValves,
      ProductCategory.sprinklers => l.catSprinklers,
      ProductCategory.pivots => l.catPivots,
      ProductCategory.kits => l.catKits,
    };

class _CategoryBubble extends StatelessWidget {
  const _CategoryBubble({
    required this.label,
    required this.selected,
    required this.onTap,
    this.photo,
  });

  final String label;
  final String? photo;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    const size = 72.0;
    return Semantics(
      selected: selected,
      button: true,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(20),
        child: SizedBox(
          width: 88,
          child: Column(
            children: [
              if (photo == null)
                Container(
                  width: size,
                  height: size,
                  decoration: BoxDecoration(
                    color: selected ? JColors.navy : JColors.blueTint,
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    Icons.spa_outlined,
                    color: selected ? Colors.white : JColors.navy,
                    size: 30,
                  ),
                )
              else
                PhotoCircle(
                  asset: photo,
                  size: size - 6,
                  ring: 3,
                  ringColor: selected ? JColors.navy : JColors.surface,
                ),
              const SizedBox(height: 8),
              Text(
                label,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  fontSize: 13.5,
                  fontWeight: selected ? FontWeight.w700 : FontWeight.w600,
                  color: JColors.ink,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _QuickLink extends StatelessWidget {
  const _QuickLink({
    required this.icon,
    required this.tone,
    required this.title,
    required this.onTap,
  });

  final IconData icon;
  final Tone tone;
  final String title;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return JCard(
      padding: const EdgeInsets.all(14),
      onTap: onTap,
      child: Row(
        children: [
          TintIcon(icon, tone: tone, size: 44),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              title,
              style: Theme.of(context).textTheme.titleSmall,
              maxLines: 2,
            ),
          ),
        ],
      ),
    );
  }
}

class _ProductGrid extends StatelessWidget {
  const _ProductGrid({required this.products});

  final List<Product> products;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        for (var i = 0; i < products.length; i += 2) ...[
          if (i > 0) const SizedBox(height: 12),
          IntrinsicHeight(
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Expanded(child: _ProductCard(product: products[i])),
                const SizedBox(width: 12),
                Expanded(
                  child: i + 1 < products.length
                      ? _ProductCard(product: products[i + 1])
                      : const SizedBox(),
                ),
              ],
            ),
          ),
        ],
      ],
    );
  }
}

class _ProductCard extends StatelessWidget {
  const _ProductCard({required this.product});

  final Product product;

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    final store = JogooScope.read(context);
    final text = Theme.of(context).textTheme;

    void request() {
      store.requestFromSales(
        Bi('Price request: ${product.name.en}', 'Demande de prix : ${product.name.fr}'),
      );
      showJogooToast(
        context,
        l.requestSavedTitle,
        l.requestSavedBody(product.name.of(context)),
      );
    }

    return JCard(
      padding: const EdgeInsets.fromLTRB(12, 18, 12, 16),
      onTap: () => push(context, ProductScreen(productId: product.id)),
      child: Column(
        children: [
          PhotoCircle(
            asset: product.photo,
            size: 104,
            ring: 4,
            ringColor: JColors.background,
          ),
          const SizedBox(height: 12),
          Text(
            product.name.of(context),
            style: text.titleSmall,
            textAlign: TextAlign.center,
          ),
          if (product.fitNote != null) ...[
            const SizedBox(height: 4),
            Text(
              product.fitNote!.of(context),
              textAlign: TextAlign.center,
              style: text.bodyMedium?.copyWith(
                color: product.highlightFit ? JColors.olive : null,
                fontWeight: product.highlightFit ? FontWeight.w700 : null,
              ),
            ),
          ],
          const Spacer(),
          const SizedBox(height: 12),
          product.highlightFit
              ? FilledButton(onPressed: request, child: Text(l.request))
              : OutlinedButton(onPressed: request, child: Text(l.request)),
        ],
      ),
    );
  }
}

class _CartButton extends StatelessWidget {
  const _CartButton({required this.count});

  final int count;

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    return Stack(
      clipBehavior: Clip.none,
      children: [
        CircleButton(
          icon: Icons.shopping_cart_outlined,
          tooltip: l.cart,
          color: JColors.navy,
          size: 56,
          onPressed: () => showCartSheet(context),
        ),
        if (count > 0)
          Positioned(
            right: -2,
            top: -2,
            child: Container(
              padding: const EdgeInsets.all(6),
              decoration: const BoxDecoration(
                color: JColors.magenta,
                shape: BoxShape.circle,
              ),
              child: Text(
                '$count',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
          ),
      ],
    );
  }
}

/// Cart review. No online payment yet: the order request goes to JOGOO
/// sales, who confirm price, fitting and delivery by phone.
Future<void> showCartSheet(BuildContext context) {
  return showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    builder: (sheetContext) {
      final l = AppLocalizations.of(sheetContext);
      final store = JogooScope.of(sheetContext);
      final text = Theme.of(sheetContext).textTheme;
      return SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 0, 20, 16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(l.cartTitle, style: text.titleLarge),
              const SizedBox(height: 8),
              if (store.cart.isEmpty)
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 24),
                  child: Text(l.cartEmpty, textAlign: TextAlign.center),
                )
              else ...[
                for (final line in store.cart)
                  ListRow(
                    title: line.title.of(sheetContext),
                    subtitle:
                        '${line.quantity} × ${formatAmount(line.unitPrice)} F',
                    trailing: IconButton(
                      tooltip: l.remove,
                      icon: const Icon(Icons.delete_outline),
                      onPressed: () => store.removeFromCart(line.id),
                    ),
                  ),
                const Divider(),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Text(l.total, style: text.bodyLarge),
                    const Spacer(),
                    Text(
                      '${formatAmount(store.cartTotal)} FCFA',
                      style: text.titleMedium,
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                FilledButton(
                  onPressed: () {
                    store.submitCart();
                    Navigator.pop(sheetContext);
                    showJogooToast(
                      context,
                      l.orderRequestSavedTitle,
                      l.orderRequestSavedBody,
                    );
                  },
                  child: Text(l.sendOrderRequest),
                ),
                const SizedBox(height: 8),
                Text(
                  l.paymentLater,
                  style: text.bodySmall,
                  textAlign: TextAlign.center,
                ),
              ],
            ],
          ),
        ),
      );
    },
  );
}

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/models/inventory_model.dart';
import '../../../../core/services/api_service.dart';
import '../../../../core/providers/auth_provider.dart';
import 'product_form_page.dart';

class ProductDetailPage extends StatefulWidget {
  final int productId;

  const ProductDetailPage({super.key, required this.productId});

  @override
  State<ProductDetailPage> createState() => _ProductDetailPageState();
}

class _ProductDetailPageState extends State<ProductDetailPage> {
  Product? _product;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadProduct();
  }

  Future<void> _loadProduct() async {
    setState(() => _isLoading = true);
    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final token = authProvider.token;
      if (token == null) return;

      final data = await ApiService.getProduct(token, widget.productId);
      setState(() {
        _product = Product.fromJson(data);
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erro ao carregar produto: $e')),
        );
      }
    }
  }

  Future<void> _stockIn() async {
    final quantityController = TextEditingController();
    final costController = TextEditingController();

    final result = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Entrada de Estoque - ${_product!.name}'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: quantityController,
              decoration: InputDecoration(
                labelText: _product!.sellByWeight ? 'Quantidade (kg)' : 'Quantidade',
                keyboardType: TextInputType.number,
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: costController,
              decoration: const InputDecoration(
                labelText: 'Custo (R\$) - Opcional',
                keyboardType: TextInputType.number,
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancelar'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Confirmar'),
          ),
        ],
      ),
    );

    if (result == true && quantityController.text.isNotEmpty) {
      try {
        final authProvider = Provider.of<AuthProvider>(context, listen: false);
        final token = authProvider.token;
        if (token == null) return;

        await ApiService.stockIn(
          token,
          widget.productId,
          double.parse(quantityController.text),
          cost: costController.text.isNotEmpty
              ? double.parse(costController.text)
              : null,
        );

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Entrada registrada com sucesso!'),
              backgroundColor: Colors.green,
            ),
          );
          _loadProduct();
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Erro ao registrar entrada: $e')),
          );
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        appBar: AppBar(title: const Text('Produto')),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    if (_product == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Produto')),
        body: const Center(child: Text('Produto não encontrado')),
      );
    }

    final product = _product!;

    return Scaffold(
      appBar: AppBar(
        title: Text(product.name),
        actions: [
          IconButton(
            icon: const Icon(Icons.edit),
            onPressed: () async {
              final result = await context.push(
                '/inventory/${product.id}/edit',
                extra: product,
              );
              if (result == true) {
                _loadProduct();
              }
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Status do Estoque
            Card(
              color: product.stockStatusColor.withOpacity(0.1),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Row(
                  children: [
                    Icon(
                      product.isLowStock ? Icons.warning : Icons.check_circle,
                      color: product.stockStatusColor,
                      size: 32,
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            product.sellByWeight
                                ? 'Estoque: ${product.currentStock.toStringAsFixed(2)} kg'
                                : 'Estoque: ${product.stock} unidades',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: product.stockStatusColor,
                            ),
                          ),
                          Text(
                            product.sellByWeight
                                ? 'Mínimo: ${product.minStockValue.toStringAsFixed(2)} kg'
                                : 'Mínimo: ${product.minStock} unidades',
                            style: TextStyle(color: Colors.grey[600]),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Informações do Produto
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Informações',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                    const SizedBox(height: 16),
                    _buildInfoRow('Categoria', product.categoryLabel),
                    if (product.brand != null) _buildInfoRow('Marca', product.brand!),
                    if (product.sku != null) _buildInfoRow('SKU', product.sku!),
                    _buildInfoRow(
                      'Preço',
                      product.sellByWeight
                          ? 'R\$ ${product.pricePerKg?.toStringAsFixed(2)}/kg'
                          : 'R\$ ${product.price.toStringAsFixed(2)}',
                    ),
                    if (product.description != null)
                      _buildInfoRow('Descrição', product.description!),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Informações de Consumo (se aplicável)
            if (product.isConsumable) ...[
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Informações de Consumo',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                      ),
                      const SizedBox(height: 12),
                      if (product.volume != null)
                        _buildInfoRow('Volume Total', '${product.volume} ${product.unit ?? ''}'),
                      if (product.cost != null)
                        _buildInfoRow('Custo', 'R\$ ${product.cost!.toStringAsFixed(2)}'),
                      if (product.yieldPerService != null)
                        _buildInfoRow(
                          'Rendimento por Serviço',
                          '${product.yieldPerService} ${product.unit ?? ''}',
                        ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
            ],

            // Ações
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: _stockIn,
                    icon: const Icon(Icons.add),
                    label: const Text('Entrada'),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () {
                      // TODO: Implementar saída de estoque
                    },
                    icon: const Icon(Icons.remove),
                    label: const Text('Saída'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              '$label:',
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
          ),
          Expanded(child: Text(value)),
        ],
      ),
    );
  }
}

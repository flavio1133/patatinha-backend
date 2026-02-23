import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/models/inventory_model.dart';
import '../../../../core/services/api_service.dart';
import '../../../../core/providers/auth_provider.dart';
import 'product_form_page.dart';
import 'product_detail_page.dart';

class InventoryListPage extends StatefulWidget {
  const InventoryListPage({super.key});

  @override
  State<InventoryListPage> createState() => _InventoryListPageState();
}

class _InventoryListPageState extends State<InventoryListPage> {
  List<Product> _products = [];
  bool _isLoading = true;
  String _searchQuery = '';
  String? _selectedCategory;
  bool _showLowStockOnly = false;
  final TextEditingController _searchController = TextEditingController();

  final List<String> _categories = [
    'racao',
    'shampoo',
    'condicionador',
    'perfume',
    'antisseptico',
    'acessorios',
    'medicamentos',
    'outros',
  ];

  @override
  void initState() {
    super.initState();
    _loadProducts();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadProducts() async {
    setState(() => _isLoading = true);
    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final token = authProvider.token;
      if (token == null) return;

      final data = await ApiService.getInventory(
        token,
        search: _searchQuery.isEmpty ? null : _searchQuery,
        category: _selectedCategory,
        lowStock: _showLowStockOnly ? true : null,
      );

      setState(() {
        _products = data.map((json) => Product.fromJson(json)).toList();
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erro ao carregar produtos: $e')),
        );
      }
    }
  }

  void _onSearchChanged(String query) {
    setState(() => _searchQuery = query);
    _loadProducts();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Estoque'),
        actions: [
          IconButton(
            icon: Stack(
              children: [
                const Icon(Icons.warning),
                FutureBuilder<Map<String, dynamic>>(
                  future: _getLowStockCount(),
                  builder: (context, snapshot) {
                    if (snapshot.hasData && snapshot.data!['count'] > 0) {
                      return Positioned(
                        right: 0,
                        top: 0,
                        child: Container(
                          padding: const EdgeInsets.all(4),
                          decoration: const BoxDecoration(
                            color: Colors.red,
                            shape: BoxShape.circle,
                          ),
                          child: Text(
                            '${snapshot.data!['count']}',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      );
                    }
                    return const SizedBox.shrink();
                  },
                ),
              ],
            ),
            onPressed: () {
              setState(() {
                _showLowStockOnly = !_showLowStockOnly;
              });
              _loadProducts();
            },
          ),
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () async {
              final result = await context.push('/inventory/new');
              if (result == true) {
                _loadProducts();
              }
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Barra de busca e filtros
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              children: [
                TextField(
                  controller: _searchController,
                  decoration: InputDecoration(
                    hintText: 'Buscar produto...',
                    prefixIcon: const Icon(Icons.search),
                    suffixIcon: _searchQuery.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.clear),
                            onPressed: () {
                              _searchController.clear();
                              _onSearchChanged('');
                            },
                          )
                        : null,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  onChanged: _onSearchChanged,
                ),
                const SizedBox(height: 8),
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      FilterChip(
                        label: const Text('Todos'),
                        selected: _selectedCategory == null,
                        onSelected: (selected) {
                          setState(() => _selectedCategory = null);
                          _loadProducts();
                        },
                      ),
                      ..._categories.map((cat) {
                        return Padding(
                          padding: const EdgeInsets.only(left: 8.0),
                          child: FilterChip(
                            label: Text(_getCategoryLabel(cat)),
                            selected: _selectedCategory == cat,
                            onSelected: (selected) {
                              setState(() => _selectedCategory = selected ? cat : null);
                              _loadProducts();
                            },
                          ),
                        );
                      }),
                    ],
                  ),
                ),
              ],
            ),
          ),
          // Lista de produtos
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _products.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.inventory_2_outlined,
                                size: 64, color: Colors.grey[400]),
                            const SizedBox(height: 16),
                            Text(
                              _showLowStockOnly
                                  ? 'Nenhum produto com estoque baixo'
                                  : 'Nenhum produto cadastrado',
                              style: TextStyle(color: Colors.grey[600]),
                            ),
                          ],
                        ),
                      )
                    : RefreshIndicator(
                        onRefresh: _loadProducts,
                        child: ListView.builder(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          itemCount: _products.length,
                          itemBuilder: (context, index) {
                            final product = _products[index];
                            return Card(
                              margin: const EdgeInsets.only(bottom: 12),
                              child: ListTile(
                                leading: CircleAvatar(
                                  backgroundColor: product.stockStatusColor,
                                  child: Icon(
                                    product.sellByWeight
                                        ? Icons.scale
                                        : Icons.inventory_2,
                                    color: Colors.white,
                                  ),
                                ),
                                title: Text(
                                  product.name,
                                  style: const TextStyle(fontWeight: FontWeight.bold),
                                ),
                                subtitle: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    if (product.brand != null)
                                      Text('Marca: ${product.brand}'),
                                    const SizedBox(height: 4),
                                    Row(
                                      children: [
                                        Icon(
                                          _getStockIcon(product.stockStatus ?? product.stockLevel),
                                          size: 16,
                                          color: product.stockStatusColor,
                                        ),
                                        const SizedBox(width: 4),
                                        Text(
                                          product.sellByWeight
                                              ? 'Estoque: ${product.currentStock.toStringAsFixed(2)} kg'
                                              : 'Estoque: ${product.stock} unidades',
                                          style: TextStyle(
                                            color: product.stockStatusColor,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                      ],
                                    ),
                                    if (product.isLowStock)
                                      Text(
                                        'Mínimo: ${product.sellByWeight ? product.minStockValue.toStringAsFixed(2) : product.minStock}',
                                        style: TextStyle(
                                          color: Colors.red,
                                          fontSize: 12,
                                        ),
                                      ),
                                  ],
                                ),
                                trailing: Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Text(
                                      product.sellByWeight
                                          ? 'R\$ ${product.pricePerKg?.toStringAsFixed(2)}/kg'
                                          : 'R\$ ${product.price.toStringAsFixed(2)}',
                                      style: const TextStyle(
                                        fontWeight: FontWeight.bold,
                                        fontSize: 14,
                                      ),
                                    ),
                                  ],
                                ),
                                onTap: () async {
                                  final result = await context.push(
                                    '/inventory/${product.id}',
                                  );
                                  if (result == true) {
                                    _loadProducts();
                                  }
                                },
                              ),
                            );
                          },
                        ),
                      ),
          ),
        ],
      ),
    );
  }

  Future<Map<String, dynamic>> _getLowStockCount() async {
    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final token = authProvider.token;
      if (token == null) return {'count': 0};

      final data = await ApiService.getLowStockAlerts(token);
      return data;
    } catch (e) {
      return {'count': 0};
    }
  }

  String _getCategoryLabel(String category) {
    switch (category) {
      case 'racao':
        return 'Ração';
      case 'shampoo':
        return 'Shampoo';
      case 'condicionador':
        return 'Condicionador';
      case 'perfume':
        return 'Perfume';
      case 'antisseptico':
        return 'Antisséptico';
      case 'acessorios':
        return 'Acessórios';
      case 'medicamentos':
        return 'Medicamentos';
      default:
        return 'Outros';
    }
  }

  IconData _getStockIcon(String? status) {
    switch (status) {
      case 'critical':
        return Icons.error;
      case 'low':
        return Icons.warning;
      default:
        return Icons.check_circle;
    }
  }
}

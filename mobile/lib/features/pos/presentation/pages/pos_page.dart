import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../../../core/models/inventory_model.dart';
import '../../../../core/models/sale_model.dart';
import '../../../../core/services/api_service.dart';
import '../../../../core/providers/auth_provider.dart';

class POSPage extends StatefulWidget {
  final int? customerId;
  final int? appointmentId;

  const POSPage({super.key, this.customerId, this.appointmentId});

  @override
  State<POSPage> createState() => _POSPageState();
}

class _POSPageState extends State<POSPage> {
  List<SaleItem> _cartItems = [];
  List<Product> _products = [];
  bool _isLoadingProducts = false;
  String _searchQuery = '';
  final TextEditingController _searchController = TextEditingController();
  String _selectedPaymentMethod = 'cash';
  double? _cashAmount;
  final TextEditingController _cashAmountController = TextEditingController();
  final TextEditingController _notesController = TextEditingController();
  bool _isProcessing = false;

  @override
  void initState() {
    super.initState();
    _loadProducts();
  }

  @override
  void dispose() {
    _searchController.dispose();
    _cashAmountController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _loadProducts() async {
    setState(() => _isLoadingProducts = true);
    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final token = authProvider.token;
      if (token == null) return;

      final data = await ApiService.getInventory(token, search: _searchQuery.isEmpty ? null : _searchQuery);
      setState(() {
        _products = data.map((json) => Product.fromJson(json)).toList();
        _isLoadingProducts = false;
      });
    } catch (e) {
      setState(() => _isLoadingProducts = false);
    }
  }

  void _addToCart(Product product) {
    if (product.sellByWeight) {
      // Para produtos vendidos por quilo, pedir quantidade
      _showQuantityDialog(product);
    } else {
      // Para produtos unitários, adicionar 1 unidade
      _addItemToCart(product, 1.0);
    }
  }

  void _showQuantityDialog(Product product) {
    final quantityController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Quantidade - ${product.name}'),
        content: TextField(
          controller: quantityController,
          decoration: InputDecoration(
            labelText: 'Quantidade (kg)',
            hintText: 'Ex: 2.5',
            keyboardType: TextInputType.number,
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancelar'),
          ),
          ElevatedButton(
            onPressed: () {
              final quantity = double.tryParse(quantityController.text);
              if (quantity != null && quantity > 0) {
                Navigator.pop(context);
                _addItemToCart(product, quantity);
              }
            },
            child: const Text('Adicionar'),
          ),
        ],
      ),
    );
  }

  void _addItemToCart(Product product, double quantity) {
    setState(() {
      // Verificar se já existe no carrinho
      final existingIndex = _cartItems.indexWhere((item) => item.productId == product.id);
      
      if (existingIndex >= 0) {
        // Atualizar quantidade
        final existingItem = _cartItems[existingIndex];
        final newQuantity = existingItem.quantity + quantity;
        final unitPrice = product.sellByWeight ? (product.pricePerKg ?? product.price) : product.price;
        final totalPrice = unitPrice * newQuantity;
        
        _cartItems[existingIndex] = SaleItem(
          productId: product.id,
          productName: product.name,
          quantity: newQuantity,
          unitPrice: unitPrice,
          totalPrice: totalPrice,
          sellByWeight: product.sellByWeight,
        );
      } else {
        // Adicionar novo item
        final unitPrice = product.sellByWeight ? (product.pricePerKg ?? product.price) : product.price;
        final totalPrice = unitPrice * quantity;
        
        _cartItems.add(SaleItem(
          productId: product.id,
          productName: product.name,
          quantity: quantity,
          unitPrice: unitPrice,
          totalPrice: totalPrice,
          sellByWeight: product.sellByWeight,
        ));
      }
    });
  }

  void _removeFromCart(int index) {
    setState(() {
      _cartItems.removeAt(index);
    });
  }

  void _updateCartItemQuantity(int index, double newQuantity) {
    if (newQuantity <= 0) {
      _removeFromCart(index);
      return;
    }

    setState(() {
      final item = _cartItems[index];
      _cartItems[index] = SaleItem(
        productId: item.productId,
        productName: item.productName,
        quantity: newQuantity,
        unitPrice: item.unitPrice,
        totalPrice: item.unitPrice * newQuantity,
        sellByWeight: item.sellByWeight,
      );
    });
  }

  double get _cartTotal {
    return _cartItems.fold(0.0, (sum, item) => sum + item.totalPrice);
  }

  double get _change {
    if (_selectedPaymentMethod == 'cash' && _cashAmount != null) {
      return _cashAmount! - _cartTotal;
    }
    return 0;
  }

  Future<void> _processSale() async {
    if (_cartItems.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Adicione produtos ao carrinho')),
      );
      return;
    }

    if (_selectedPaymentMethod == 'cash' && (_cashAmount == null || _cashAmount! < _cartTotal)) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Valor em dinheiro insuficiente')),
      );
      return;
    }

    setState(() => _isProcessing = true);
    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final token = authProvider.token;
      if (token == null) return;

      final data = {
        'customerId': widget.customerId,
        'appointmentId': widget.appointmentId,
        'items': _cartItems.map((item) => {
          'productId': item.productId,
          'quantity': item.quantity,
        }).toList(),
        'paymentMethod': _selectedPaymentMethod,
        if (_selectedPaymentMethod == 'cash') ...[
          'cashAmount': _cashAmount,
          'change': _change,
        ],
        'notes': _notesController.text.trim().isEmpty
            ? null
            : _notesController.text.trim(),
      };

      await ApiService.createSale(token, data);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Venda realizada com sucesso!'),
            backgroundColor: Colors.green,
          ),
        );
        // Limpar carrinho
        setState(() {
          _cartItems.clear();
          _cashAmount = null;
          _cashAmountController.clear();
          _notesController.clear();
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erro ao processar venda: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isProcessing = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('PDV - Ponto de Venda'),
      ),
      body: Row(
        children: [
          // Lista de Produtos (esquerda)
          Expanded(
            flex: 2,
            child: Column(
              children: [
                // Busca
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: TextField(
                    controller: _searchController,
                    decoration: InputDecoration(
                      hintText: 'Buscar produto...',
                      prefixIcon: const Icon(Icons.search),
                      suffixIcon: _searchQuery.isNotEmpty
                          ? IconButton(
                              icon: const Icon(Icons.clear),
                              onPressed: () {
                                _searchController.clear();
                                setState(() => _searchQuery = '');
                                _loadProducts();
                              },
                            )
                          : null,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    onChanged: (value) {
                      setState(() => _searchQuery = value);
                      _loadProducts();
                    },
                  ),
                ),
                // Grid de produtos
                Expanded(
                  child: _isLoadingProducts
                      ? const Center(child: CircularProgressIndicator())
                      : GridView.builder(
                          padding: const EdgeInsets.all(16),
                          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 3,
                            crossAxisSpacing: 12,
                            mainAxisSpacing: 12,
                            childAspectRatio: 0.8,
                          ),
                          itemCount: _products.length,
                          itemBuilder: (context, index) {
                            final product = _products[index];
                            return Card(
                              child: InkWell(
                                onTap: () => _addToCart(product),
                                child: Padding(
                                  padding: const EdgeInsets.all(8.0),
                                  child: Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Icon(
                                        product.sellByWeight
                                            ? Icons.scale
                                            : Icons.inventory_2,
                                        size: 32,
                                        color: Theme.of(context).colorScheme.primary,
                                      ),
                                      const SizedBox(height: 8),
                                      Text(
                                        product.name,
                                        style: const TextStyle(
                                          fontWeight: FontWeight.bold,
                                          fontSize: 12,
                                        ),
                                        textAlign: TextAlign.center,
                                        maxLines: 2,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        product.sellByWeight
                                            ? 'R\$ ${product.pricePerKg?.toStringAsFixed(2)}/kg'
                                            : 'R\$ ${product.price.toStringAsFixed(2)}',
                                        style: TextStyle(
                                          color: Theme.of(context).colorScheme.primary,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            );
                          },
                        ),
                ),
              ],
            ),
          ),
          // Carrinho e Pagamento (direita)
          Container(
            width: 400,
            decoration: BoxDecoration(
              color: Colors.grey[100],
              border: Border(left: BorderSide(color: Colors.grey[300]!)),
            ),
            child: Column(
              children: [
                // Cabeçalho do carrinho
                Container(
                  padding: const EdgeInsets.all(16),
                  color: Theme.of(context).colorScheme.primary,
                  child: Row(
                    children: [
                      const Icon(Icons.shopping_cart, color: Colors.white),
                      const SizedBox(width: 8),
                      Text(
                        'Carrinho (${_cartItems.length})',
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 18,
                        ),
                      ),
                    ],
                  ),
                ),
                // Itens do carrinho
                Expanded(
                  child: _cartItems.isEmpty
                      ? const Center(
                          child: Text('Carrinho vazio'),
                        )
                      : ListView.builder(
                          padding: const EdgeInsets.all(8),
                          itemCount: _cartItems.length,
                          itemBuilder: (context, index) {
                            final item = _cartItems[index];
                            return Card(
                              margin: const EdgeInsets.only(bottom: 8),
                              child: ListTile(
                                title: Text(
                                  item.productName,
                                  style: const TextStyle(fontWeight: FontWeight.bold),
                                ),
                                subtitle: Text(
                                  '${item.quantity.toStringAsFixed(item.sellByWeight ? 2 : 0)} ${item.sellByWeight ? 'kg' : 'un'} × R\$ ${item.unitPrice.toStringAsFixed(2)}',
                                ),
                                trailing: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    IconButton(
                                      icon: const Icon(Icons.remove_circle_outline),
                                      onPressed: () {
                                        _updateCartItemQuantity(index, item.quantity - (item.sellByWeight ? 0.1 : 1));
                                      },
                                    ),
                                    Text(
                                      'R\$ ${item.totalPrice.toStringAsFixed(2)}',
                                      style: const TextStyle(fontWeight: FontWeight.bold),
                                    ),
                                    IconButton(
                                      icon: const Icon(Icons.add_circle_outline),
                                      onPressed: () {
                                        _updateCartItemQuantity(index, item.quantity + (item.sellByWeight ? 0.1 : 1));
                                      },
                                    ),
                                    IconButton(
                                      icon: const Icon(Icons.delete_outline),
                                      onPressed: () => _removeFromCart(index),
                                    ),
                                  ],
                                ),
                              ),
                            );
                          },
                        ),
                ),
                // Total e Pagamento
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    border: Border(top: BorderSide(color: Colors.grey[300]!)),
                  ),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'Total:',
                            style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                          ),
                          Text(
                            'R\$ ${_cartTotal.toStringAsFixed(2)}',
                            style: TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                              color: Theme.of(context).colorScheme.primary,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      // Forma de pagamento
                      DropdownButtonFormField<String>(
                        value: _selectedPaymentMethod,
                        decoration: const InputDecoration(
                          labelText: 'Forma de Pagamento',
                          prefixIcon: Icon(Icons.payment),
                        ),
                        items: const [
                          DropdownMenuItem(value: 'cash', child: Text('Dinheiro')),
                          DropdownMenuItem(value: 'credit_card', child: Text('Cartão de Crédito')),
                          DropdownMenuItem(value: 'debit_card', child: Text('Cartão de Débito')),
                          DropdownMenuItem(value: 'pix', child: Text('PIX')),
                          DropdownMenuItem(value: 'store_credit', child: Text('Crediário')),
                        ],
                        onChanged: (value) {
                          setState(() {
                            _selectedPaymentMethod = value ?? 'cash';
                            if (_selectedPaymentMethod != 'cash') {
                              _cashAmount = null;
                              _cashAmountController.clear();
                            }
                          });
                        },
                      ),
                      // Valor em dinheiro e troco
                      if (_selectedPaymentMethod == 'cash') ...[
                        const SizedBox(height: 16),
                        TextField(
                          controller: _cashAmountController,
                          decoration: const InputDecoration(
                            labelText: 'Valor Recebido (R\$)',
                            prefixIcon: Icon(Icons.money),
                          ),
                          keyboardType: TextInputType.number,
                          onChanged: (value) {
                            setState(() {
                              _cashAmount = double.tryParse(value);
                            });
                          },
                        ),
                        if (_cashAmount != null && _change >= 0) ...[
                          const SizedBox(height: 8),
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: Colors.green[50],
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text('Troco:'),
                                Text(
                                  'R\$ ${_change.toStringAsFixed(2)}',
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 18,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ],
                      const SizedBox(height: 16),
                      TextField(
                        controller: _notesController,
                        decoration: const InputDecoration(
                          labelText: 'Observações',
                          prefixIcon: Icon(Icons.note),
                        ),
                        maxLines: 2,
                      ),
                      const SizedBox(height: 16),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: _isProcessing ? null : _processSale,
                          style: ElevatedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 16),
                          ),
                          child: _isProcessing
                              ? const SizedBox(
                                  height: 20,
                                  width: 20,
                                  child: CircularProgressIndicator(strokeWidth: 2),
                                )
                              : const Text('Finalizar Venda'),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

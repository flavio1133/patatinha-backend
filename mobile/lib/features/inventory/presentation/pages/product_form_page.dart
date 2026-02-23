import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/models/inventory_model.dart';
import '../../../../core/services/api_service.dart';
import '../../../../core/providers/auth_provider.dart';

class ProductFormPage extends StatefulWidget {
  final Product? product;

  const ProductFormPage({super.key, this.product});

  @override
  State<ProductFormPage> createState() => _ProductFormPageState();
}

class _ProductFormPageState extends State<ProductFormPage> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _brandController = TextEditingController();
  final _skuController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _priceController = TextEditingController();
  final _stockController = TextEditingController();
  final _minStockController = TextEditingController();
  final _pricePerKgController = TextEditingController();
  final _stockWeightController = TextEditingController();
  final _minStockWeightController = TextEditingController();
  final _volumeController = TextEditingController();
  final _costController = TextEditingController();
  final _yieldController = TextEditingController();

  String _selectedCategory = 'racao';
  bool _sellByWeight = false;
  bool _isConsumable = false;
  String? _selectedUnit;
  bool _isLoading = false;

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

  final List<String> _units = ['ml', 'litros', 'gramas', 'kg', 'unidade'];

  @override
  void initState() {
    super.initState();
    if (widget.product != null) {
      final product = widget.product!;
      _nameController.text = product.name;
      _brandController.text = product.brand ?? '';
      _skuController.text = product.sku ?? '';
      _descriptionController.text = product.description ?? '';
      _priceController.text = product.price.toStringAsFixed(2);
      _stockController.text = product.stock.toString();
      _minStockController.text = product.minStock.toString();
      _pricePerKgController.text = product.pricePerKg?.toStringAsFixed(2) ?? '';
      _stockWeightController.text = product.stockWeight != null
          ? (product.stockWeight! / 1000).toStringAsFixed(2)
          : '';
      _minStockWeightController.text = product.minStockWeight != null
          ? (product.minStockWeight! / 1000).toStringAsFixed(2)
          : '';
      _volumeController.text = product.volume?.toString() ?? '';
      _costController.text = product.cost?.toStringAsFixed(2) ?? '';
      _yieldController.text = product.yieldPerService?.toString() ?? '';
      _selectedCategory = product.category;
      _sellByWeight = product.sellByWeight;
      _isConsumable = product.isConsumable;
      _selectedUnit = product.unit;
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _brandController.dispose();
    _skuController.dispose();
    _descriptionController.dispose();
    _priceController.dispose();
    _stockController.dispose();
    _minStockController.dispose();
    _pricePerKgController.dispose();
    _stockWeightController.dispose();
    _minStockWeightController.dispose();
    _volumeController.dispose();
    _costController.dispose();
    _yieldController.dispose();
    super.dispose();
  }

  Future<void> _saveProduct() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);
    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final token = authProvider.token;
      if (token == null) return;

      final data = {
        'name': _nameController.text.trim(),
        'brand': _brandController.text.trim().isEmpty
            ? null
            : _brandController.text.trim(),
        'sku': _skuController.text.trim().isEmpty
            ? null
            : _skuController.text.trim(),
        'category': _selectedCategory,
        'description': _descriptionController.text.trim().isEmpty
            ? null
            : _descriptionController.text.trim(),
        'price': double.parse(_priceController.text),
        'stock': int.tryParse(_stockController.text) ?? 0,
        'minStock': int.tryParse(_minStockController.text) ?? 0,
        'sellByWeight': _sellByWeight,
        if (_sellByWeight) ...[
          'stockWeight': _stockWeightController.text.isNotEmpty
              ? double.parse(_stockWeightController.text) * 1000 // converter kg para gramas
              : null,
          'minStockWeight': _minStockWeightController.text.isNotEmpty
              ? double.parse(_minStockWeightController.text) * 1000
              : null,
          'pricePerKg': _pricePerKgController.text.isNotEmpty
              ? double.parse(_pricePerKgController.text)
              : null,
        ],
        'isConsumable': _isConsumable,
        if (_isConsumable) ...[
          'volume': _volumeController.text.isNotEmpty
              ? double.parse(_volumeController.text)
              : null,
          'cost': _costController.text.isNotEmpty
              ? double.parse(_costController.text)
              : null,
          'yieldPerService': _yieldController.text.isNotEmpty
              ? double.parse(_yieldController.text)
              : null,
          'unit': _selectedUnit,
        ],
      };

      if (widget.product == null) {
        await ApiService.createProduct(token, data);
      } else {
        await ApiService.updateProduct(token, widget.product!.id, data);
      }

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              widget.product == null
                  ? 'Produto cadastrado com sucesso!'
                  : 'Produto atualizado com sucesso!',
            ),
            backgroundColor: Colors.green,
          ),
        );
        context.pop(true);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Erro ao salvar produto: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.product == null ? 'Novo Produto' : 'Editar Produto'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Informações Básicas
              Text(
                'Informações Básicas',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _nameController,
                decoration: const InputDecoration(
                  labelText: 'Nome do Produto *',
                  prefixIcon: Icon(Icons.inventory_2),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Nome é obrigatório';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _brandController,
                      decoration: const InputDecoration(
                        labelText: 'Marca',
                        prefixIcon: Icon(Icons.branding_watermark),
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: TextFormField(
                      controller: _skuController,
                      decoration: const InputDecoration(
                        labelText: 'SKU',
                        prefixIcon: Icon(Icons.qr_code),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                value: _selectedCategory,
                decoration: const InputDecoration(
                  labelText: 'Categoria *',
                  prefixIcon: Icon(Icons.category),
                ),
                items: _categories.map((cat) {
                  return DropdownMenuItem(
                    value: cat,
                    child: Text(_getCategoryLabel(cat)),
                  );
                }).toList(),
                onChanged: (value) {
                  if (value != null) {
                    setState(() => _selectedCategory = value);
                  }
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _descriptionController,
                decoration: const InputDecoration(
                  labelText: 'Descrição',
                  prefixIcon: Icon(Icons.description),
                ),
                maxLines: 2,
              ),
              const SizedBox(height: 24),

              // Preço e Estoque
              Text(
                'Preço e Estoque',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              ),
              const SizedBox(height: 16),
              SwitchListTile(
                title: const Text('Venda Fracionada (por quilo)'),
                subtitle: const Text('Ative para produtos como ração vendidos por peso'),
                value: _sellByWeight,
                onChanged: (value) {
                  setState(() => _sellByWeight = value);
                },
              ),
              if (_sellByWeight) ...[
                TextFormField(
                  controller: _pricePerKgController,
                  decoration: const InputDecoration(
                    labelText: 'Preço por Quilo (R\$) *',
                    prefixIcon: Icon(Icons.attach_money),
                  ),
                  keyboardType: TextInputType.number,
                  validator: (value) {
                    if (_sellByWeight && (value == null || value.isEmpty)) {
                      return 'Preço por quilo é obrigatório';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _stockWeightController,
                  decoration: const InputDecoration(
                    labelText: 'Estoque Atual (kg)',
                    prefixIcon: Icon(Icons.scale),
                  ),
                  keyboardType: TextInputType.number,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _minStockWeightController,
                  decoration: const InputDecoration(
                    labelText: 'Estoque Mínimo (kg)',
                    prefixIcon: Icon(Icons.warning),
                  ),
                  keyboardType: TextInputType.number,
                ),
              ] else ...[
                TextFormField(
                  controller: _priceController,
                  decoration: const InputDecoration(
                    labelText: 'Preço Unitário (R\$) *',
                    prefixIcon: Icon(Icons.attach_money),
                  ),
                  keyboardType: TextInputType.number,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Preço é obrigatório';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: TextFormField(
                        controller: _stockController,
                        decoration: const InputDecoration(
                          labelText: 'Estoque Atual',
                          prefixIcon: Icon(Icons.inventory),
                        ),
                        keyboardType: TextInputType.number,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: TextFormField(
                        controller: _minStockController,
                        decoration: const InputDecoration(
                          labelText: 'Estoque Mínimo',
                          prefixIcon: Icon(Icons.warning),
                        ),
                        keyboardType: TextInputType.number,
                      ),
                    ),
                  ],
                ),
              ],
              const SizedBox(height: 24),

              // Produto de Consumo (para cálculo de custo)
              if (_selectedCategory == 'shampoo' ||
                  _selectedCategory == 'condicionador' ||
                  _selectedCategory == 'perfume' ||
                  _selectedCategory == 'antisseptico') ...[
                Text(
                  'Informações de Consumo',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                ),
                const SizedBox(height: 16),
                SwitchListTile(
                  title: const Text('Produto de Consumo'),
                  subtitle: const Text('Usado para calcular custo por serviço'),
                  value: _isConsumable,
                  onChanged: (value) {
                    setState(() => _isConsumable = value);
                  },
                ),
                if (_isConsumable) ...[
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: TextFormField(
                          controller: _volumeController,
                          decoration: const InputDecoration(
                            labelText: 'Volume Total',
                            prefixIcon: Icon(Icons.water_drop),
                            hintText: 'Ex: 5 (litros)',
                          ),
                          keyboardType: TextInputType.number,
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: DropdownButtonFormField<String>(
                          value: _selectedUnit,
                          decoration: const InputDecoration(
                            labelText: 'Unidade',
                            prefixIcon: Icon(Icons.straighten),
                          ),
                          items: _units.map((unit) {
                            return DropdownMenuItem(
                              value: unit,
                              child: Text(unit),
                            );
                          }).toList(),
                          onChanged: (value) {
                            setState(() => _selectedUnit = value);
                          },
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _costController,
                    decoration: const InputDecoration(
                      labelText: 'Custo de Aquisição (R\$)',
                      prefixIcon: Icon(Icons.monetization_on),
                    ),
                    keyboardType: TextInputType.number,
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _yieldController,
                    decoration: const InputDecoration(
                      labelText: 'Rendimento por Serviço',
                      prefixIcon: Icon(Icons.science),
                      hintText: 'Ex: 50 (ml por banho)',
                    ),
                    keyboardType: TextInputType.number,
                  ),
                ],
                const SizedBox(height: 24),
              ],

              ElevatedButton(
                onPressed: _isLoading ? null : _saveProduct,
                child: _isLoading
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : Text(widget.product == null ? 'Cadastrar' : 'Salvar'),
              ),
            ],
          ),
        ),
      ),
    );
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
}

import 'package:flutter/material.dart';

class Product {
  final int id;
  final String name;
  final String? brand;
  final String? sku;
  final String category;
  final String? description;
  final double price;
  final int stock; // Quantidade em unidades
  final int minStock; // Estoque mínimo
  final bool sellByWeight; // true para venda fracionada (ração por quilo)
  final double? stockWeight; // Estoque em gramas/quilos
  final double? minStockWeight; // Estoque mínimo em gramas/quilos
  final double? pricePerKg; // Preço por quilo
  final bool isConsumable; // true para produtos de consumo (shampoo, etc)
  final double? volume; // Volume do produto (ex: 5 litros)
  final double? cost; // Custo de aquisição
  final double? yieldPerService; // Rendimento por serviço (ex: 50ml por banho)
  final String? unit; // Unidade de medida (ml, litros, gramas, kg)
  final DateTime createdAt;
  final DateTime updatedAt;
  final String? stockStatus; // 'normal', 'low', 'critical'
  final String? stockLevel; // 'normal', 'low', 'critical'

  Product({
    required this.id,
    required this.name,
    this.brand,
    this.sku,
    required this.category,
    this.description,
    required this.price,
    required this.stock,
    required this.minStock,
    required this.sellByWeight,
    this.stockWeight,
    this.minStockWeight,
    this.pricePerKg,
    required this.isConsumable,
    this.volume,
    this.cost,
    this.yieldPerService,
    this.unit,
    required this.createdAt,
    required this.updatedAt,
    this.stockStatus,
    this.stockLevel,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'],
      name: json['name'],
      brand: json['brand'],
      sku: json['sku'],
      category: json['category'],
      description: json['description'],
      price: (json['price'] ?? 0).toDouble(),
      stock: json['stock'] ?? 0,
      minStock: json['minStock'] ?? 0,
      sellByWeight: json['sellByWeight'] ?? false,
      stockWeight: json['stockWeight']?.toDouble(),
      minStockWeight: json['minStockWeight']?.toDouble(),
      pricePerKg: json['pricePerKg']?.toDouble(),
      isConsumable: json['isConsumable'] ?? false,
      volume: json['volume']?.toDouble(),
      cost: json['cost']?.toDouble(),
      yieldPerService: json['yieldPerService']?.toDouble(),
      unit: json['unit'],
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
      stockStatus: json['stockStatus'],
      stockLevel: json['stockLevel'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'brand': brand,
      'sku': sku,
      'category': category,
      'description': description,
      'price': price,
      'stock': stock,
      'minStock': minStock,
      'sellByWeight': sellByWeight,
      'stockWeight': stockWeight,
      'minStockWeight': minStockWeight,
      'pricePerKg': pricePerKg,
      'isConsumable': isConsumable,
      'volume': volume,
      'cost': cost,
      'yieldPerService': yieldPerService,
      'unit': unit,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  String get categoryLabel {
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

  double get currentStock {
    if (sellByWeight) {
      return (stockWeight ?? 0) / 1000; // converter gramas para kg
    }
    return stock.toDouble();
  }

  double get minStockValue {
    if (sellByWeight) {
      return (minStockWeight ?? 0) / 1000; // converter gramas para kg
    }
    return minStock.toDouble();
  }

  bool get isLowStock {
    if (sellByWeight) {
      return (stockWeight ?? 0) <= (minStockWeight ?? 0);
    }
    return stock <= minStock;
  }

  Color get stockStatusColor {
    final status = stockStatus ?? stockLevel ?? 'normal';
    switch (status) {
      case 'critical':
        return const Color(0xFFE53935); // Vermelho
      case 'low':
        return const Color(0xFFFF9800); // Laranja
      default:
        return const Color(0xFF4CAF50); // Verde
    }
  }
}

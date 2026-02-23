class Sale {
  final int id;
  final int? customerId;
  final int? appointmentId;
  final List<SaleItem> items;
  final double subtotal;
  final double discount;
  final double total;
  final String paymentMethod; // cash, credit_card, debit_card, pix, store_credit
  final double? cashAmount;
  final double? change;
  final String? notes;
  final String date;
  final String time;
  final DateTime createdAt;

  Sale({
    required this.id,
    this.customerId,
    this.appointmentId,
    required this.items,
    required this.subtotal,
    required this.discount,
    required this.total,
    required this.paymentMethod,
    this.cashAmount,
    this.change,
    this.notes,
    required this.date,
    required this.time,
    required this.createdAt,
  });

  factory Sale.fromJson(Map<String, dynamic> json) {
    return Sale(
      id: json['id'],
      customerId: json['customerId'],
      appointmentId: json['appointmentId'],
      items: (json['items'] as List<dynamic>?)
              ?.map((item) => SaleItem.fromJson(item))
              .toList() ??
          [],
      subtotal: (json['subtotal'] ?? 0).toDouble(),
      discount: (json['discount'] ?? 0).toDouble(),
      total: (json['total'] ?? 0).toDouble(),
      paymentMethod: json['paymentMethod'],
      cashAmount: json['cashAmount']?.toDouble(),
      change: json['change']?.toDouble(),
      notes: json['notes'],
      date: json['date'],
      time: json['time'],
      createdAt: DateTime.parse(json['createdAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'customerId': customerId,
      'appointmentId': appointmentId,
      'items': items.map((item) => item.toJson()).toList(),
      'subtotal': subtotal,
      'discount': discount,
      'total': total,
      'paymentMethod': paymentMethod,
      'cashAmount': cashAmount,
      'change': change,
      'notes': notes,
      'date': date,
      'time': time,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  String get paymentMethodLabel {
    switch (paymentMethod) {
      case 'cash':
        return 'Dinheiro';
      case 'credit_card':
        return 'Cartão de Crédito';
      case 'debit_card':
        return 'Cartão de Débito';
      case 'pix':
        return 'PIX';
      case 'store_credit':
        return 'Crediário';
      default:
        return paymentMethod;
    }
  }
}

class SaleItem {
  final int productId;
  final String productName;
  final double quantity;
  final double unitPrice;
  final double totalPrice;
  final bool sellByWeight;

  SaleItem({
    required this.productId,
    required this.productName,
    required this.quantity,
    required this.unitPrice,
    required this.totalPrice,
    required this.sellByWeight,
  });

  factory SaleItem.fromJson(Map<String, dynamic> json) {
    return SaleItem(
      productId: json['productId'],
      productName: json['productName'],
      quantity: (json['quantity'] ?? 0).toDouble(),
      unitPrice: (json['unitPrice'] ?? 0).toDouble(),
      totalPrice: (json['totalPrice'] ?? 0).toDouble(),
      sellByWeight: json['sellByWeight'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'productId': productId,
      'productName': productName,
      'quantity': quantity,
      'unitPrice': unitPrice,
      'totalPrice': totalPrice,
      'sellByWeight': sellByWeight,
    };
  }
}

class CashClosing {
  final String date;
  final int totalSales;
  final double totalRevenue;
  final double cashRevenue;
  final double expectedCash;
  final double actualCash;
  final double difference;
  final Map<String, double> byPaymentMethod;
  final double withdrawals;
  final double deposits;
  final String? notes;
  final DateTime closedAt;

  CashClosing({
    required this.date,
    required this.totalSales,
    required this.totalRevenue,
    required this.cashRevenue,
    required this.expectedCash,
    required this.actualCash,
    required this.difference,
    required this.byPaymentMethod,
    required this.withdrawals,
    required this.deposits,
    this.notes,
    required this.closedAt,
  });

  factory CashClosing.fromJson(Map<String, dynamic> json) {
    return CashClosing(
      date: json['date'],
      totalSales: json['totalSales'] ?? 0,
      totalRevenue: (json['totalRevenue'] ?? 0).toDouble(),
      cashRevenue: (json['cashRevenue'] ?? 0).toDouble(),
      expectedCash: (json['expectedCash'] ?? 0).toDouble(),
      actualCash: (json['actualCash'] ?? 0).toDouble(),
      difference: (json['difference'] ?? 0).toDouble(),
      byPaymentMethod: (json['byPaymentMethod'] as Map<String, dynamic>?)
              ?.map((key, value) => MapEntry(key, (value as num).toDouble())) ??
          {},
      withdrawals: (json['withdrawals'] ?? 0).toDouble(),
      deposits: (json['deposits'] ?? 0).toDouble(),
      notes: json['notes'],
      closedAt: DateTime.parse(json['closedAt']),
    );
  }
}

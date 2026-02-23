class SubscriptionPlan {
  final int id;
  final String name;
  final String? description;
  final double monthlyPrice;
  final List<PlanService> services; // Serviços inclusos
  final double productDiscount; // % de desconto em produtos
  final int contractMonths; // 0 = mensal
  final List<String> benefits;
  final bool isActive;
  final DateTime createdAt;

  SubscriptionPlan({
    required this.id,
    required this.name,
    this.description,
    required this.monthlyPrice,
    required this.services,
    required this.productDiscount,
    required this.contractMonths,
    required this.benefits,
    required this.isActive,
    required this.createdAt,
  });

  factory SubscriptionPlan.fromJson(Map<String, dynamic> json) {
    return SubscriptionPlan(
      id: json['id'],
      name: json['name'],
      description: json['description'],
      monthlyPrice: (json['monthlyPrice'] ?? 0).toDouble(),
      services: (json['services'] as List<dynamic>?)
              ?.map((s) => PlanService.fromJson(s))
              .toList() ??
          [],
      productDiscount: (json['productDiscount'] ?? 0).toDouble(),
      contractMonths: json['contractMonths'] ?? 0,
      benefits: json['benefits'] != null ? List<String>.from(json['benefits']) : [],
      isActive: json['isActive'] ?? true,
      createdAt: DateTime.parse(json['createdAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'monthlyPrice': monthlyPrice,
      'services': services.map((s) => s.toJson()).toList(),
      'productDiscount': productDiscount,
      'contractMonths': contractMonths,
      'benefits': benefits,
      'isActive': isActive,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}

class PlanService {
  final String type; // banho, tosa, banho_tosa, veterinario
  final int quantity;

  PlanService({
    required this.type,
    required this.quantity,
  });

  factory PlanService.fromJson(Map<String, dynamic> json) {
    return PlanService(
      type: json['type'],
      quantity: json['quantity'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'type': type,
      'quantity': quantity,
    };
  }

  String get typeLabel {
    switch (type) {
      case 'banho':
        return 'Banho';
      case 'tosa':
        return 'Tosa';
      case 'banho_tosa':
        return 'Banho & Tosa';
      case 'veterinario':
        return 'Veterinário';
      default:
        return type;
    }
  }
}

class Subscription {
  final int id;
  final int customerId;
  final int planId;
  final String planName;
  final double monthlyPrice;
  final String paymentMethod;
  final String? creditCardToken;
  final String status; // active, cancelled, payment_failed
  final String startDate;
  final String nextBillingDate;
  final Map<String, int> serviceBalance; // Saldo de serviços do mês
  final double totalPaid;
  final DateTime createdAt;
  final DateTime? cancelledAt;
  final String? cancellationReason;

  Subscription({
    required this.id,
    required this.customerId,
    required this.planId,
    required this.planName,
    required this.monthlyPrice,
    required this.paymentMethod,
    this.creditCardToken,
    required this.status,
    required this.startDate,
    required this.nextBillingDate,
    required this.serviceBalance,
    required this.totalPaid,
    required this.createdAt,
    this.cancelledAt,
    this.cancellationReason,
  });

  factory Subscription.fromJson(Map<String, dynamic> json) {
    return Subscription(
      id: json['id'],
      customerId: json['customerId'],
      planId: json['planId'],
      planName: json['planName'],
      monthlyPrice: (json['monthlyPrice'] ?? 0).toDouble(),
      paymentMethod: json['paymentMethod'],
      creditCardToken: json['creditCardToken'],
      status: json['status'] ?? 'active',
      startDate: json['startDate'],
      nextBillingDate: json['nextBillingDate'],
      serviceBalance: json['serviceBalance'] != null
          ? Map<String, int>.from(json['serviceBalance'])
          : {},
      totalPaid: (json['totalPaid'] ?? 0).toDouble(),
      createdAt: DateTime.parse(json['createdAt']),
      cancelledAt: json['cancelledAt'] != null ? DateTime.parse(json['cancelledAt']) : null,
      cancellationReason: json['cancellationReason'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'customerId': customerId,
      'planId': planId,
      'planName': planName,
      'monthlyPrice': monthlyPrice,
      'paymentMethod': paymentMethod,
      'creditCardToken': creditCardToken,
      'status': status,
      'startDate': startDate,
      'nextBillingDate': nextBillingDate,
      'serviceBalance': serviceBalance,
      'totalPaid': totalPaid,
      'createdAt': createdAt.toIso8601String(),
      'cancelledAt': cancelledAt?.toIso8601String(),
      'cancellationReason': cancellationReason,
    };
  }

  String get statusLabel {
    switch (status) {
      case 'active':
        return 'Ativa';
      case 'cancelled':
        return 'Cancelada';
      case 'payment_failed':
        return 'Pagamento Falhou';
      default:
        return status;
    }
  }

  bool get isActive => status == 'active';
}

class MRRReport {
  final int activeSubscriptions;
  final double mrr; // Monthly Recurring Revenue
  final double arr; // Annual Recurring Revenue
  final double churnRate;
  final double averageSubscriptionValue;

  MRRReport({
    required this.activeSubscriptions,
    required this.mrr,
    required this.arr,
    required this.churnRate,
    required this.averageSubscriptionValue,
  });

  factory MRRReport.fromJson(Map<String, dynamic> json) {
    return MRRReport(
      activeSubscriptions: json['activeSubscriptions'] ?? 0,
      mrr: (json['mrr'] ?? 0).toDouble(),
      arr: (json['arr'] ?? 0).toDouble(),
      churnRate: (json['churnRate'] ?? 0).toDouble(),
      averageSubscriptionValue: (json['averageSubscriptionValue'] ?? 0).toDouble(),
    );
  }
}

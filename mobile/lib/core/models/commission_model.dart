class CommissionRule {
  final int id;
  final int professionalId;
  final String type; // percentage_service, fixed_service, percentage_product, mixed
  final double? servicePercentage;
  final double? serviceFixedAmount;
  final double? productPercentage;
  final double? minAmount;
  final double? maxAmount;
  final bool isActive;
  final DateTime createdAt;

  CommissionRule({
    required this.id,
    required this.professionalId,
    required this.type,
    this.servicePercentage,
    this.serviceFixedAmount,
    this.productPercentage,
    this.minAmount,
    this.maxAmount,
    required this.isActive,
    required this.createdAt,
  });

  factory CommissionRule.fromJson(Map<String, dynamic> json) {
    return CommissionRule(
      id: json['id'],
      professionalId: json['professionalId'],
      type: json['type'],
      servicePercentage: json['servicePercentage']?.toDouble(),
      serviceFixedAmount: json['serviceFixedAmount']?.toDouble(),
      productPercentage: json['productPercentage']?.toDouble(),
      minAmount: json['minAmount']?.toDouble(),
      maxAmount: json['maxAmount']?.toDouble(),
      isActive: json['isActive'] ?? true,
      createdAt: DateTime.parse(json['createdAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'professionalId': professionalId,
      'type': type,
      'servicePercentage': servicePercentage,
      'serviceFixedAmount': serviceFixedAmount,
      'productPercentage': productPercentage,
      'minAmount': minAmount,
      'maxAmount': maxAmount,
      'isActive': isActive,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  String get typeLabel {
    switch (type) {
      case 'percentage_service':
        return 'Percentual sobre Serviço';
      case 'fixed_service':
        return 'Valor Fixo por Serviço';
      case 'percentage_product':
        return 'Percentual sobre Produtos';
      case 'mixed':
        return 'Misto';
      default:
        return type;
    }
  }
}

class CommissionRecord {
  final int id;
  final int professionalId;
  final int appointmentId;
  final int ruleId;
  final double serviceAmount;
  final double productAmount;
  final double commission;
  final DateTime calculatedAt;
  final bool paid;
  final DateTime? paidAt;
  final String? paymentNotes;

  CommissionRecord({
    required this.id,
    required this.professionalId,
    required this.appointmentId,
    required this.ruleId,
    required this.serviceAmount,
    required this.productAmount,
    required this.commission,
    required this.calculatedAt,
    required this.paid,
    this.paidAt,
    this.paymentNotes,
  });

  factory CommissionRecord.fromJson(Map<String, dynamic> json) {
    return CommissionRecord(
      id: json['id'],
      professionalId: json['professionalId'],
      appointmentId: json['appointmentId'],
      ruleId: json['ruleId'],
      serviceAmount: (json['serviceAmount'] ?? 0).toDouble(),
      productAmount: (json['productAmount'] ?? 0).toDouble(),
      commission: (json['commission'] ?? 0).toDouble(),
      calculatedAt: DateTime.parse(json['calculatedAt']),
      paid: json['paid'] ?? false,
      paidAt: json['paidAt'] != null ? DateTime.parse(json['paidAt']) : null,
      paymentNotes: json['paymentNotes'],
    );
  }
}

class MonthlyCommissionReport {
  final int year;
  final int month;
  final double totalCommissions;
  final double paidCommissions;
  final double unpaidCommissions;
  final List<ProfessionalCommissionSummary> byProfessional;

  MonthlyCommissionReport({
    required this.year,
    required this.month,
    required this.totalCommissions,
    required this.paidCommissions,
    required this.unpaidCommissions,
    required this.byProfessional,
  });

  factory MonthlyCommissionReport.fromJson(Map<String, dynamic> json) {
    return MonthlyCommissionReport(
      year: json['year'],
      month: json['month'],
      totalCommissions: (json['totalCommissions'] ?? 0).toDouble(),
      paidCommissions: (json['paidCommissions'] ?? 0).toDouble(),
      unpaidCommissions: (json['unpaidCommissions'] ?? 0).toDouble(),
      byProfessional: (json['byProfessional'] as List<dynamic>?)
              ?.map((p) => ProfessionalCommissionSummary.fromJson(p))
              .toList() ??
          [],
    );
  }
}

class ProfessionalCommissionSummary {
  final int professionalId;
  final String professionalName;
  final double totalCommissions;
  final double totalServices;
  final double totalProducts;
  final int count;
  final List<CommissionRecord> records;

  ProfessionalCommissionSummary({
    required this.professionalId,
    required this.professionalName,
    required this.totalCommissions,
    required this.totalServices,
    required this.totalProducts,
    required this.count,
    required this.records,
  });

  factory ProfessionalCommissionSummary.fromJson(Map<String, dynamic> json) {
    return ProfessionalCommissionSummary(
      professionalId: json['professionalId'],
      professionalName: json['professionalName'] ?? 'Desconhecido',
      totalCommissions: (json['totalCommissions'] ?? 0).toDouble(),
      totalServices: (json['totalServices'] ?? 0).toDouble(),
      totalProducts: (json['totalProducts'] ?? 0).toDouble(),
      count: json['count'] ?? 0,
      records: (json['records'] as List<dynamic>?)
              ?.map((r) => CommissionRecord.fromJson(r))
              .toList() ??
          [],
    );
  }
}

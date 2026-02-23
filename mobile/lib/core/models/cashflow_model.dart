import 'package:flutter/material.dart';

class Transaction {
  final int id;
  final String type; // 'income' ou 'expense'
  final double amount;
  final String category;
  final String? description;
  final String date;
  final String paymentMethod;
  final bool reconciled;
  final List<String> tags;
  final int? relatedSaleId;
  final int? relatedAppointmentId;
  final DateTime createdAt;
  final DateTime? updatedAt;

  Transaction({
    required this.id,
    required this.type,
    required this.amount,
    required this.category,
    this.description,
    required this.date,
    required this.paymentMethod,
    required this.reconciled,
    this.tags = const [],
    this.relatedSaleId,
    this.relatedAppointmentId,
    required this.createdAt,
    this.updatedAt,
  });

  factory Transaction.fromJson(Map<String, dynamic> json) {
    return Transaction(
      id: json['id'],
      type: json['type'],
      amount: (json['amount'] ?? 0).toDouble(),
      category: json['category'],
      description: json['description'],
      date: json['date'],
      paymentMethod: json['paymentMethod'] ?? 'cash',
      reconciled: json['reconciled'] ?? false,
      tags: json['tags'] != null ? List<String>.from(json['tags']) : [],
      relatedSaleId: json['relatedSaleId'],
      relatedAppointmentId: json['relatedAppointmentId'],
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: json['updatedAt'] != null ? DateTime.parse(json['updatedAt']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'type': type,
      'amount': amount,
      'category': category,
      'description': description,
      'date': date,
      'paymentMethod': paymentMethod,
      'reconciled': reconciled,
      'tags': tags,
      'relatedSaleId': relatedSaleId,
      'relatedAppointmentId': relatedAppointmentId,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
    };
  }

  String get categoryLabel {
    switch (category) {
      case 'service_revenue':
        return 'Receita de Serviços';
      case 'product_revenue':
        return 'Receita de Produtos';
      case 'subscription_revenue':
        return 'Receita de Assinaturas';
      case 'supplier':
        return 'Fornecedores';
      case 'payroll':
        return 'Folha de Pagamento';
      case 'fixed_expenses':
        return 'Despesas Fixas';
      case 'variable_expenses':
        return 'Despesas Variáveis';
      case 'withdrawal':
        return 'Retirada de Sócios';
      default:
        return category;
    }
  }

  Color get typeColor {
    return type == 'income' ? Colors.green : Colors.red;
  }

  IconData get typeIcon {
    return type == 'income' ? Icons.arrow_downward : Icons.arrow_upward;
  }
}

class DailyDashboard {
  final String date;
  final double income;
  final double expense;
  final double balance;
  final int transactionsCount;
  final Map<String, double> incomeByCategory;
  final Map<String, double> expenseByCategory;

  DailyDashboard({
    required this.date,
    required this.income,
    required this.expense,
    required this.balance,
    required this.transactionsCount,
    required this.incomeByCategory,
    required this.expenseByCategory,
  });

  factory DailyDashboard.fromJson(Map<String, dynamic> json) {
    return DailyDashboard(
      date: json['date'],
      income: (json['income'] ?? 0).toDouble(),
      expense: (json['expense'] ?? 0).toDouble(),
      balance: (json['balance'] ?? 0).toDouble(),
      transactionsCount: json['transactionsCount'] ?? 0,
      incomeByCategory: (json['incomeByCategory'] as Map<String, dynamic>?)
              ?.map((key, value) => MapEntry(key, (value as num).toDouble())) ??
          {},
      expenseByCategory: (json['expenseByCategory'] as Map<String, dynamic>?)
              ?.map((key, value) => MapEntry(key, (value as num).toDouble())) ??
          {},
    );
  }
}

class ForecastDay {
  final String date;
  final double projectedIncome;
  final double projectedExpense;
  final double projectedBalance;
  final int confirmedAppointments;

  ForecastDay({
    required this.date,
    required this.projectedIncome,
    required this.projectedExpense,
    required this.projectedBalance,
    required this.confirmedAppointments,
  });

  factory ForecastDay.fromJson(Map<String, dynamic> json) {
    return ForecastDay(
      date: json['date'],
      projectedIncome: (json['projectedIncome'] ?? 0).toDouble(),
      projectedExpense: (json['projectedExpense'] ?? 0).toDouble(),
      projectedBalance: (json['projectedBalance'] ?? 0).toDouble(),
      confirmedAppointments: json['confirmedAppointments'] ?? 0,
    );
  }
}

class CashFlowForecast {
  final double currentBalance;
  final int forecastDays;
  final List<ForecastDay> forecast;
  final List<ForecastDay> warnings;

  CashFlowForecast({
    required this.currentBalance,
    required this.forecastDays,
    required this.forecast,
    required this.warnings,
  });

  factory CashFlowForecast.fromJson(Map<String, dynamic> json) {
    return CashFlowForecast(
      currentBalance: (json['currentBalance'] ?? 0).toDouble(),
      forecastDays: json['forecastDays'] ?? 30,
      forecast: (json['forecast'] as List<dynamic>?)
              ?.map((day) => ForecastDay.fromJson(day))
              .toList() ??
          [],
      warnings: (json['warnings'] as List<dynamic>?)
              ?.map((day) => ForecastDay.fromJson(day))
              .toList() ??
          [],
    );
  }
}

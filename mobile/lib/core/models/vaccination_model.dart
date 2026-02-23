class Vaccination {
  final int id;
  final int petId;
  final String name; // V8, V10, Raiva, etc.
  final String type; // vaccine, dewormer, flea
  final DateTime applicationDate;
  final DateTime? nextBoosterDate;
  final String? lot;
  final String? veterinarianName;
  final String? attachment; // URL da foto do comprovante
  final DateTime createdAt;
  final DateTime? updatedAt;

  Vaccination({
    required this.id,
    required this.petId,
    required this.name,
    required this.type,
    required this.applicationDate,
    this.nextBoosterDate,
    this.lot,
    this.veterinarianName,
    this.attachment,
    required this.createdAt,
    this.updatedAt,
  });

  factory Vaccination.fromJson(Map<String, dynamic> json) {
    return Vaccination(
      id: json['id'],
      petId: json['petId'],
      name: json['name'],
      type: json['type'],
      applicationDate: DateTime.parse(json['applicationDate']),
      nextBoosterDate: json['nextBoosterDate'] != null
          ? DateTime.parse(json['nextBoosterDate'])
          : null,
      lot: json['lot'],
      veterinarianName: json['veterinarianName'],
      attachment: json['attachment'],
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: json['updatedAt'] != null ? DateTime.parse(json['updatedAt']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'petId': petId,
      'name': name,
      'type': type,
      'applicationDate': applicationDate.toIso8601String(),
      'nextBoosterDate': nextBoosterDate?.toIso8601String(),
      'lot': lot,
      'veterinarianName': veterinarianName,
      'attachment': attachment,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
    };
  }

  bool get isExpiringSoon {
    if (nextBoosterDate == null) return false;
    final daysUntilExpiration = nextBoosterDate!.difference(DateTime.now()).inDays;
    return daysUntilExpiration <= 30 && daysUntilExpiration >= 0;
  }

  bool get isExpired {
    if (nextBoosterDate == null) return false;
    return nextBoosterDate!.isBefore(DateTime.now());
  }
}

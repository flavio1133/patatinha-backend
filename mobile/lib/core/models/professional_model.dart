class Professional {
  final int id;
  final String name;
  final List<String> specialties; // ['banho', 'tosa', 'gatos', 'caes_grandes']
  final int averageSpeed; // minutos por serviço
  final WorkSchedule workSchedule;
  final List<String> daysOff; // ['sunday', 'monday']
  final bool isActive;
  final DateTime createdAt;
  final DateTime updatedAt;

  Professional({
    required this.id,
    required this.name,
    required this.specialties,
    required this.averageSpeed,
    required this.workSchedule,
    required this.daysOff,
    required this.isActive,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Professional.fromJson(Map<String, dynamic> json) {
    return Professional(
      id: json['id'],
      name: json['name'],
      specialties: json['specialties'] != null
          ? List<String>.from(json['specialties'])
          : [],
      averageSpeed: json['averageSpeed'] ?? 60,
      workSchedule: json['workSchedule'] != null
          ? WorkSchedule.fromJson(json['workSchedule'])
          : WorkSchedule(),
      daysOff: json['daysOff'] != null
          ? List<String>.from(json['daysOff'])
          : [],
      isActive: json['isActive'] ?? true,
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'specialties': specialties,
      'averageSpeed': averageSpeed,
      'workSchedule': workSchedule.toJson(),
      'daysOff': daysOff,
      'isActive': isActive,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  bool hasSpecialty(String specialty) {
    return specialties.contains(specialty);
  }
}

class WorkSchedule {
  final String start; // '08:00'
  final String end; // '18:00'
  final String lunchStart; // '12:00'
  final String lunchEnd; // '13:00'

  WorkSchedule({
    this.start = '08:00',
    this.end = '18:00',
    this.lunchStart = '12:00',
    this.lunchEnd = '13:00',
  });

  factory WorkSchedule.fromJson(Map<String, dynamic> json) {
    return WorkSchedule(
      start: json['start'] ?? '08:00',
      end: json['end'] ?? '18:00',
      lunchStart: json['lunchStart'] ?? '12:00',
      lunchEnd: json['lunchEnd'] ?? '13:00',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'start': start,
      'end': end,
      'lunchStart': lunchStart,
      'lunchEnd': lunchEnd,
    };
  }
}

class MedicalRecord {
  final int id;
  final int petId;
  final String type; // consulta, banho, tosa, veterinario, hotel, outros
  final DateTime date;
  final String? description;
  final String? professionalName;
  final List<String> attachments; // URLs de fotos/documentos
  final String? behaviorNotes;
  final DateTime createdAt;
  final DateTime? updatedAt;

  MedicalRecord({
    required this.id,
    required this.petId,
    required this.type,
    required this.date,
    this.description,
    this.professionalName,
    this.attachments = const [],
    this.behaviorNotes,
    required this.createdAt,
    this.updatedAt,
  });

  factory MedicalRecord.fromJson(Map<String, dynamic> json) {
    return MedicalRecord(
      id: json['id'],
      petId: json['petId'],
      type: json['type'],
      date: DateTime.parse(json['date']),
      description: json['description'],
      professionalName: json['professionalName'],
      attachments: json['attachments'] != null
          ? List<String>.from(json['attachments'])
          : [],
      behaviorNotes: json['behaviorNotes'],
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: json['updatedAt'] != null ? DateTime.parse(json['updatedAt']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'petId': petId,
      'type': type,
      'date': date.toIso8601String(),
      'description': description,
      'professionalName': professionalName,
      'attachments': attachments,
      'behaviorNotes': behaviorNotes,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
    };
  }
}

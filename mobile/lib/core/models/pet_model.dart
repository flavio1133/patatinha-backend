class Pet {
  final int id;
  final int? userId;
  final int? customerId;
  final String name;
  final String? breed;
  final int? age;
  final DateTime? birthDate;
  final String species; // dog, cat, bird, rabbit, other
  final String? color;
  final double? weight;
  final String? photo;
  final String? importantInfo; // Alerta importante (ex: "diabético")
  final List<String> behaviorAlerts; // Alertas de comportamento
  final GroomingPreferences groomingPreferences;
  final DateTime createdAt;
  final DateTime updatedAt;

  Pet({
    required this.id,
    this.userId,
    this.customerId,
    required this.name,
    this.breed,
    this.age,
    this.birthDate,
    required this.species,
    this.color,
    this.weight,
    this.photo,
    this.importantInfo,
    this.behaviorAlerts = const [],
    required this.groomingPreferences,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Pet.fromJson(Map<String, dynamic> json) {
    return Pet(
      id: json['id'],
      userId: json['userId'],
      customerId: json['customerId'],
      name: json['name'],
      breed: json['breed'],
      age: json['age'],
      birthDate: json['birthDate'] != null ? DateTime.parse(json['birthDate']) : null,
      species: json['species'] ?? 'dog',
      color: json['color'],
      weight: json['weight']?.toDouble(),
      photo: json['photo'],
      importantInfo: json['importantInfo'],
      behaviorAlerts: json['behaviorAlerts'] != null 
          ? List<String>.from(json['behaviorAlerts'])
          : [],
      groomingPreferences: json['groomingPreferences'] != null
          ? GroomingPreferences.fromJson(json['groomingPreferences'])
          : GroomingPreferences(),
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'customerId': customerId,
      'name': name,
      'breed': breed,
      'age': age,
      'birthDate': birthDate?.toIso8601String(),
      'species': species,
      'color': color,
      'weight': weight,
      'photo': photo,
      'importantInfo': importantInfo,
      'behaviorAlerts': behaviorAlerts,
      'groomingPreferences': groomingPreferences.toJson(),
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
}

class GroomingPreferences {
  final String? hairLength;
  final String? shampooType;
  final List<String> finishing; // perfume, laços, etc.
  final String? notes;

  GroomingPreferences({
    this.hairLength,
    this.shampooType,
    this.finishing = const [],
    this.notes,
  });

  factory GroomingPreferences.fromJson(Map<String, dynamic> json) {
    return GroomingPreferences(
      hairLength: json['hairLength'],
      shampooType: json['shampooType'],
      finishing: json['finishing'] != null 
          ? List<String>.from(json['finishing'])
          : [],
      notes: json['notes'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'hairLength': hairLength,
      'shampooType': shampooType,
      'finishing': finishing,
      'notes': notes,
    };
  }
}

class Appointment {
  final int id;
  final int? userId;
  final int? customerId;
  final int petId;
  final int professionalId;
  final String service; // banho, tosa, banho_tosa, veterinario, hotel, outros
  final String date; // YYYY-MM-DD
  final String time; // HH:mm
  final int duration; // minutos
  final String? notes;
  final String status; // confirmed, checked_in, in_progress, completed, cancelled
  final DateTime? checkInTime;
  final DateTime? checkOutTime;
  final DateTime? estimatedCompletionTime;
  final String? completionPhoto;
  final String? completionNotes;
  final DateTime createdAt;
  final DateTime? updatedAt;

  // Dados relacionados (preenchidos pela API)
  final String? petName;
  final String? customerName;
  final String? professionalName;

  Appointment({
    required this.id,
    this.userId,
    this.customerId,
    required this.petId,
    required this.professionalId,
    required this.service,
    required this.date,
    required this.time,
    required this.duration,
    this.notes,
    required this.status,
    this.checkInTime,
    this.checkOutTime,
    this.estimatedCompletionTime,
    this.completionPhoto,
    this.completionNotes,
    required this.createdAt,
    this.updatedAt,
    this.petName,
    this.customerName,
    this.professionalName,
  });

  factory Appointment.fromJson(Map<String, dynamic> json) {
    return Appointment(
      id: json['id'],
      userId: json['userId'],
      customerId: json['customerId'],
      petId: json['petId'],
      professionalId: json['professionalId'],
      service: json['service'],
      date: json['date'],
      time: json['time'],
      duration: json['duration'] ?? 60,
      notes: json['notes'],
      status: json['status'] ?? 'confirmed',
      checkInTime: json['checkInTime'] != null
          ? DateTime.parse(json['checkInTime'])
          : null,
      checkOutTime: json['checkOutTime'] != null
          ? DateTime.parse(json['checkOutTime'])
          : null,
      estimatedCompletionTime: json['estimatedCompletionTime'] != null
          ? DateTime.parse(json['estimatedCompletionTime'])
          : null,
      completionPhoto: json['completionPhoto'],
      completionNotes: json['completionNotes'],
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: json['updatedAt'] != null
          ? DateTime.parse(json['updatedAt'])
          : null,
      petName: json['petName'],
      customerName: json['customerName'],
      professionalName: json['professionalName'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'customerId': customerId,
      'petId': petId,
      'professionalId': professionalId,
      'service': service,
      'date': date,
      'time': time,
      'duration': duration,
      'notes': notes,
      'status': status,
      'checkInTime': checkInTime?.toIso8601String(),
      'checkOutTime': checkOutTime?.toIso8601String(),
      'estimatedCompletionTime': estimatedCompletionTime?.toIso8601String(),
      'completionPhoto': completionPhoto,
      'completionNotes': completionNotes,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
    };
  }

  String get serviceLabel {
    switch (service) {
      case 'banho':
        return 'Banho';
      case 'tosa':
        return 'Tosa';
      case 'banho_tosa':
        return 'Banho & Tosa';
      case 'veterinario':
        return 'Veterinário';
      case 'hotel':
        return 'Hotel';
      default:
        return 'Outros';
    }
  }

  String get statusLabel {
    switch (status) {
      case 'confirmed':
        return 'Confirmado';
      case 'checked_in':
        return 'Check-in realizado';
      case 'in_progress':
        return 'Em andamento';
      case 'completed':
        return 'Concluído';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  }

  bool get canCheckIn => status == 'confirmed';
  bool get canStart => status == 'checked_in';
  bool get canCheckOut => status == 'checked_in' || status == 'in_progress';
  bool get isCompleted => status == 'completed';
  bool get isCancelled => status == 'cancelled';
}

class AvailabilitySlot {
  final String time;
  final bool available;

  AvailabilitySlot({
    required this.time,
    required this.available,
  });

  factory AvailabilitySlot.fromJson(Map<String, dynamic> json) {
    return AvailabilitySlot(
      time: json['time'],
      available: json['available'] ?? true,
    );
  }
}

class ProfessionalAvailability {
  final int professionalId;
  final String professionalName;
  final List<AvailabilitySlot> availableSlots;
  final int currentAppointments;

  ProfessionalAvailability({
    required this.professionalId,
    required this.professionalName,
    required this.availableSlots,
    required this.currentAppointments,
  });

  factory ProfessionalAvailability.fromJson(Map<String, dynamic> json) {
    return ProfessionalAvailability(
      professionalId: json['professionalId'],
      professionalName: json['professionalName'],
      availableSlots: (json['availableSlots'] as List<dynamic>?)
              ?.map((slot) => AvailabilitySlot.fromJson(slot))
              .toList() ??
          [],
      currentAppointments: json['currentAppointments'] ?? 0,
    );
  }
}

class AvailabilityResponse {
  final String date;
  final String service;
  final List<ProfessionalAvailability> availability;

  AvailabilityResponse({
    required this.date,
    required this.service,
    required this.availability,
  });

  factory AvailabilityResponse.fromJson(Map<String, dynamic> json) {
    return AvailabilityResponse(
      date: json['date'],
      service: json['service'],
      availability: (json['availability'] as List<dynamic>?)
              ?.map((avail) => ProfessionalAvailability.fromJson(avail))
              .toList() ??
          [],
    );
  }
}

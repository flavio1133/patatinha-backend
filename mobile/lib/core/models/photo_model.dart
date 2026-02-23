class PetPhoto {
  final int id;
  final int petId;
  final String type; // before, after, general
  final String imageUrl;
  final String? serviceType;
  final DateTime serviceDate;
  final int? beforeAfterPairId; // ID da foto "antes" se esta for "depois"
  final String? caption;
  final DateTime createdAt;

  PetPhoto({
    required this.id,
    required this.petId,
    required this.type,
    required this.imageUrl,
    this.serviceType,
    required this.serviceDate,
    this.beforeAfterPairId,
    this.caption,
    required this.createdAt,
  });

  factory PetPhoto.fromJson(Map<String, dynamic> json) {
    return PetPhoto(
      id: json['id'],
      petId: json['petId'],
      type: json['type'],
      imageUrl: json['imageUrl'],
      serviceType: json['serviceType'],
      serviceDate: DateTime.parse(json['serviceDate']),
      beforeAfterPairId: json['beforeAfterPairId'],
      caption: json['caption'],
      createdAt: DateTime.parse(json['createdAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'petId': petId,
      'type': type,
      'imageUrl': imageUrl,
      'serviceType': serviceType,
      'serviceDate': serviceDate.toIso8601String(),
      'beforeAfterPairId': beforeAfterPairId,
      'caption': caption,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}

class BeforeAfterPair {
  final PetPhoto? before;
  final PetPhoto? after;

  BeforeAfterPair({
    this.before,
    this.after,
  });

  factory BeforeAfterPair.fromJson(Map<String, dynamic> json) {
    return BeforeAfterPair(
      before: json['before'] != null ? PetPhoto.fromJson(json['before']) : null,
      after: json['after'] != null ? PetPhoto.fromJson(json['after']) : null,
    );
  }

  bool get isComplete => before != null && after != null;
}

class AppConstants {
  // URLs e configurações da API
  static const String apiBaseUrl = 'http://localhost:3000/api';
  
  // Tempo de expiração do token (em dias)
  static const int tokenExpirationDays = 7;
  
  // Tamanho máximo de upload de imagem (em bytes)
  static const int maxImageSize = 5 * 1024 * 1024; // 5MB
  
  // Categorias de produtos
  static const List<String> productCategories = [
    'racao',
    'brinquedos',
    'acessorios',
    'higiene',
    'medicamentos',
    'outros',
  ];
  
  // Tipos de serviços
  static const List<String> serviceTypes = [
    'banho',
    'tosa',
    'veterinario',
    'hotel',
    'adestramento',
    'outros',
  ];
  
  // Espécies de pets
  static const List<String> petSpecies = [
    'dog',
    'cat',
    'bird',
    'rabbit',
    'other',
  ];
}

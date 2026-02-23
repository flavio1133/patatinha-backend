# 📱 Patatinha Mobile App

App mobile cross-platform desenvolvido em Flutter para Android e iOS.

## 🚀 Como executar

### Pré-requisitos
- Flutter SDK instalado (versão 3.0 ou superior)
- Dart SDK
- Android Studio / Xcode (para emuladores)

### Instalação

1. Instalar dependências:
```bash
flutter pub get
```

2. Executar o app:
```bash
flutter run
```

### Configuração

Antes de executar, configure a URL da API no arquivo:
`lib/core/services/api_service.dart`

Altere a constante `baseUrl` para apontar para o seu backend.

## 📁 Estrutura do Projeto

```
lib/
├── core/              # Configurações e serviços centrais
│   ├── providers/     # Gerenciamento de estado
│   ├── router/        # Navegação
│   ├── services/      # Serviços (API, storage, etc.)
│   └── theme/         # Temas e estilos
├── features/          # Funcionalidades do app
│   ├── auth/          # Autenticação
│   ├── home/          # Tela inicial
│   ├── pets/          # Gerenciamento de pets
│   ├── appointments/  # Agendamentos
│   ├── shop/          # Loja virtual
│   └── profile/       # Perfil do usuário
└── main.dart          # Ponto de entrada
```

## 🛠️ Tecnologias

- **Flutter** - Framework cross-platform
- **Provider** - Gerenciamento de estado
- **GoRouter** - Navegação
- **HTTP/Dio** - Requisições HTTP
- **Shared Preferences** - Armazenamento local

# 🌐 Patatinha Web - Versão Web do App

O mesmo código Flutter que roda no Android e iOS também funciona na web! Isso significa **uma única base de código** para todas as plataformas.

## 🚀 Como Executar

### Desenvolvimento (Hot Reload)

```bash
cd mobile
flutter run -d chrome
```

Ou use o script:
```bash
# Windows
scripts\run_web.bat

# Linux/Mac
chmod +x scripts/run_web.sh
./scripts/run_web.sh
```

O app abrirá automaticamente no Chrome em `http://localhost:8080`

### Build para Produção

```bash
cd mobile
flutter build web --release
```

Ou use o script:
```bash
# Windows
scripts\build_web.bat

# Linux/Mac
chmod +x scripts/build_web.sh
./scripts/build_web.sh
```

Os arquivos estarão em `build/web/` prontos para deploy.

## 📦 Deploy

### Opção 1: Servir Localmente (Teste)

```bash
cd build/web
python -m http.server 8080
```

### Opção 2: Deploy em Servidor Web

Copie os arquivos de `build/web/` para seu servidor web (Apache, Nginx, etc.)

### Opção 3: Deploy em Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
# Selecione build/web como diretório público
firebase deploy
```

### Opção 4: Deploy em Vercel/Netlify

- Conecte seu repositório
- Configure o diretório de build como `mobile/build/web`
- Deploy automático!

## ⚙️ Configuração

### URL da API

O app detecta automaticamente se está rodando na web e ajusta a URL da API:

- **Web**: Usa `/api` (mesma origem)
- **Mobile**: Usa `http://localhost:3000/api`

Para produção, configure um proxy no servidor web ou ajuste a URL em `lib/core/services/api_service.dart`.

### PWA (Progressive Web App)

O app já está configurado como PWA! Usuários podem:
- Instalar no celular/desktop
- Usar offline (quando implementado)
- Receber notificações push

## 🎯 Vantagens do Flutter Web

✅ **Mesmo código** para Android, iOS e Web  
✅ **Mesma experiência** em todas as plataformas  
✅ **Atualização única** - mudanças refletem em todos os lugares  
✅ **Economia de tempo e dinheiro**  
✅ **PWA nativo** - funciona como app instalado  

## 📱 Responsivo

O app se adapta automaticamente a:
- 💻 Desktop
- 📱 Tablet
- 📱 Mobile (navegador)

## 🔗 Integração com Backend

O app web usa a mesma API do app mobile:
- Backend: `http://localhost:3000` (desenvolvimento)
- Web: `http://localhost:8080` (Flutter Web)
- Gestores: `http://localhost:3005` (React)

Todos compartilham a mesma API!

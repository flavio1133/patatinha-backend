# 🎨 Identidade Visual - Patatinha

Guia completo da identidade visual do sistema Patatinha.

## 🎯 Conceito Visual

### Personalidade da Marca

**Amigável e Profissional**
- Cores quentes (laranja) transmitem calor e proximidade
- Azul transmite confiança e profissionalismo
- Verde transmite saúde e bem-estar

**Moderno e Acessível**
- Design limpo e minimalista
- Tipografia legível
- Ícones claros e intuitivos

---

## 🎨 Paleta de Cores Completa

### Cores Primárias

#### 🟠 Laranja Pet (#FF6B4A)
**Uso:** Botões principais, destaques, CTAs  
**Significado:** Calor, energia, amigável  
**Aplicação:**
- Botão "Agendar"
- Card de próximo agendamento
- Indicadores de progresso
- Links importantes

**Variações:**
- Light: #FF8A6B (hover states)
- Dark: #E55A3A (active states)
- Background: #FFF0EB (cards destacados)

#### 🔵 Azul Confiança (#4A90E2)
**Uso:** Links, informações, profissionalismo  
**Significado:** Confiança, segurança, profissionalismo  
**Aplicação:**
- Links secundários
- Informações importantes
- Painel gestor (sidebar)
- Botões de informação

**Variações:**
- Light: #6BA8E8
- Dark: #3A7BC8

#### 🟢 Verde Natureza (#2DCF8A)
**Uso:** Sucesso, confirmações, saúde  
**Significado:** Saúde, bem-estar, sucesso  
**Aplicação:**
- Status de sucesso
- Confirmações
- Botões de ação positiva
- Indicadores de saúde

**Variações:**
- Light: #4DD9A0
- Dark: #25B875

---

### Cores de Status

```css
/* Sucesso */
--success: #34C759;
--success-bg: #E8F5E9;
--success-text: #2E7D32;

/* Aviso */
--warning: #FFCC00;
--warning-bg: #FFF3E0;
--warning-text: #E65100;

/* Erro/Alerta */
--error: #FF3B30;
--error-bg: #FFEBEE;
--error-text: #C62828;

/* Informação */
--info: #4A90E2;
--info-bg: #E3F2FD;
--info-text: #1976D2;
```

---

### Cores Neutras

```css
/* Texto */
--text-primary: #333333;      /* Texto principal */
--text-secondary: #757575;     /* Texto secundário */
--text-disabled: #BDBDBD;     /* Texto desabilitado */
--text-hint: #9E9E9E;         /* Hints, placeholders */

/* Fundos */
--background: #F5F5F5;        /* Fundo geral */
--surface: #FFFFFF;           /* Cards, superfícies */
--surface-variant: #FAFAFA;   /* Variação de superfície */

/* Divisores */
--divider: #E0E0E0;           /* Divisores, bordas */
--border: #BDBDBD;            /* Bordas de inputs */
```

---

## 📝 Tipografia

### Família de Fontes

**Mobile (Flutter):**
- iOS: SF Pro Display / SF Pro Text
- Android: Roboto

**Web (React):**
```css
font-family: 'SF Pro Display', 'SF Pro Text', 'Roboto', 
             -apple-system, BlinkMacSystemFont, 'Segoe UI', 
             'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
```

### Escala Tipográfica

| Nome | Tamanho Mobile | Tamanho Web | Peso | Uso |
|:-----|:--------------|:------------|:-----|:----|
| Display | 32px | 32px | Bold | Tela de boas-vindas |
| H1 | 24px | 24px | Bold | Títulos principais |
| H2 | 20px | 20px | Semibold | Subtítulos |
| H3 | 18px | 18px | Medium | Seções |
| Body | 16px | 16px | Regular | Texto padrão |
| Body Small | 14px | 14px | Regular | Texto secundário |
| Caption | 12px | 12px | Regular | Labels, hints |

### Hierarquia Visual

```
Display (32px, Bold)
  ↓
H1 (24px, Bold) - Títulos de página
  ↓
H2 (20px, Semibold) - Subtítulos
  ↓
Body (16px, Regular) - Conteúdo principal
  ↓
Caption (12px, Regular) - Informações auxiliares
```

---

## 🖼️ Ícones

### Biblioteca

- **Material Icons** (Web e Android)
- **SF Symbols** (iOS)
- **Font Awesome** (Alternativa)

### Tamanhos Padrão

```css
--icon-xs: 16px;   /* Informações pequenas */
--icon-sm: 20px;   /* Menu, navegação */
--icon-md: 24px;   /* Botões, ações */
--icon-lg: 32px;   /* Destaques */
--icon-xl: 40px;   /* Ilustrações */
```

### Ícones Principais

| Ícone | Código | Cor | Uso |
|:------|:-------|:----|:----|
| 🐾 | `pets` | Laranja | Logo, pets |
| 📅 | `calendar_today` | Azul | Agenda |
| 👥 | `people` | Azul | Clientes |
| 📦 | `inventory` | Azul | Estoque |
| 💰 | `attach_money` | Verde | Financeiro |
| 🔔 | `notifications` | Laranja | Notificações |
| ⚙️ | `settings` | Cinza | Configurações |
| ➕ | `add` | Laranja | Adicionar |
| ✎ | `edit` | Azul | Editar |
| ✕ | `close` | Vermelho | Fechar |

---

## 🎭 Componentes Visuais

### Botões

#### Botão Primário (Laranja)
```css
.btn-primary {
  background: #FF6B4A;
  color: white;
  padding: 14px 28px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  box-shadow: 0 4px 8px rgba(255, 107, 74, 0.3);
  transition: all 0.2s;
}

.btn-primary:hover {
  background: #E55A3A;
  box-shadow: 0 6px 12px rgba(255, 107, 74, 0.4);
  transform: translateY(-1px);
}
```

#### Botão Secundário (Azul)
```css
.btn-secondary {
  background: white;
  color: #4A90E2;
  padding: 14px 28px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  border: 2px solid #4A90E2;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #F5F5F5;
  border-color: #3A7BC8;
}
```

#### Botão Sucesso (Verde)
```css
.btn-success {
  background: #2DCF8A;
  color: white;
  padding: 14px 28px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  border: none;
}
```

---

### Cards

#### Card Padrão
```css
.card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}

.card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}
```

#### Card Destacado (Laranja)
```css
.card-highlight {
  background: linear-gradient(135deg, #FFF0EB 0%, #FFFFFF 100%);
  border: 2px solid #FF6B4A;
  border-radius: 12px;
  padding: 20px;
}
```

---

### Inputs

```css
.input {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #E0E0E0;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.2s;
}

.input:focus {
  border-color: #FF6B4A;
  outline: none;
  box-shadow: 0 0 0 4px rgba(255, 107, 74, 0.1);
}

.input-error {
  border-color: #FF3B30;
}

.input-success {
  border-color: #2DCF8A;
}
```

---

### Badges e Status

```css
.badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
}

.badge-success {
  background: #E8F5E9;
  color: #2E7D32;
}

.badge-warning {
  background: #FFF3E0;
  color: #E65100;
}

.badge-error {
  background: #FFEBEE;
  color: #C62828;
}

.badge-info {
  background: #E3F2FD;
  color: #1976D2;
}
```

---

## 🎬 Animações e Transições

### Transições Padrão

```css
/* Transição suave */
.transition {
  transition: all 0.2s ease-in-out;
}

/* Hover lift */
.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Loading spinner */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.spinner {
  border: 3px solid #F5F5F5;
  border-top: 3px solid #FF6B4A;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}
```

### Micro-interações

- **Botões:** Elevação ao hover, feedback tátil
- **Cards:** Sombra aumenta ao hover
- **Inputs:** Borda muda de cor no focus
- **Loading:** Spinner animado
- **Transições:** Suaves e naturais (0.2s)

---

## 📐 Espaçamento

### Sistema de Grid (Base: 4px)

```css
--spacing-1: 4px;   /* 0.25rem */
--spacing-2: 8px;   /* 0.5rem */
--spacing-3: 12px;  /* 0.75rem */
--spacing-4: 16px;  /* 1rem */
--spacing-5: 20px;  /* 1.25rem */
--spacing-6: 24px;  /* 1.5rem */
--spacing-8: 32px;  /* 2rem */
--spacing-10: 40px; /* 2.5rem */
--spacing-12: 48px; /* 3rem */
```

### Aplicação

- **Padding de containers:** 16px (mobile), 24px (tablet), 32px (desktop)
- **Espaçamento entre elementos:** 16px
- **Espaçamento entre seções:** 32px
- **Padding interno de cards:** 20px

---

## 📱 Breakpoints Responsivos

```css
/* Mobile */
@media (max-width: 767px) {
  --container-padding: 16px;
  --card-padding: 16px;
  --font-size-base: 14px;
  --grid-columns: 1;
}

/* Tablet */
@media (min-width: 768px) and (max-width: 1023px) {
  --container-padding: 24px;
  --card-padding: 20px;
  --font-size-base: 16px;
  --grid-columns: 2;
}

/* Desktop */
@media (min-width: 1024px) {
  --container-padding: 32px;
  --card-padding: 24px;
  --font-size-base: 16px;
  --grid-columns: 3;
  --max-width: 1200px;
}
```

---

## 🎯 Acessibilidade

### Contraste

- **Texto sobre fundo claro:** Mínimo 4.5:1
- **Texto sobre fundo escuro:** Mínimo 4.5:1
- **Texto grande:** Mínimo 3:1

### Tamanhos Touch

- **Botões:** Mínimo 44px x 44px
- **Links:** Mínimo 44px altura
- **Áreas clicáveis:** Mínimo 48px

### Navegação por Teclado

- Tab order lógico
- Focus visível (borda laranja)
- Atalhos de teclado

---

## 📋 Checklist de Implementação

### Flutter (Mobile)
- [ ] Criar `app_theme.dart` com nova paleta
- [ ] Atualizar cores primárias para laranja
- [ ] Criar componentes de botões
- [ ] Criar componentes de cards
- [ ] Aplicar tipografia SF Pro/Roboto
- [ ] Implementar animações

### React (Web)
- [ ] Criar `theme.css` com variáveis CSS
- [ ] Atualizar cores primárias
- [ ] Criar componentes de UI
- [ ] Aplicar gradientes e sombras
- [ ] Implementar animações CSS
- [ ] Testar responsividade

---

**Última atualização:** 2026-02-20

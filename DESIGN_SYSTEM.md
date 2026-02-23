# 🎨 Design System - Patatinha

Sistema de design completo para garantir consistência visual em todas as interfaces.

## 🎯 Princípios de Design

### 1. Simplicidade
- Interface limpa e intuitiva
- Menos é mais
- Foco na funcionalidade

### 2. Consistência
- Mesmos padrões em todas as telas
- Componentes reutilizáveis
- Nomenclatura padronizada

### 3. Acessibilidade
- Contraste adequado
- Tamanhos de fonte legíveis
- Navegação por teclado

### 4. Responsividade
- Funciona em qualquer dispositivo
- Layout adaptativo
- Touch-friendly (mobile)

---

## 🎨 1. CORES (Sistema de Cores)

### **Cores Primárias**

```
PRIMARY - Laranja Pet
├── 50: #FFF0EB (mais clara - fundos)
├── 100: #FFE0D5
├── 200: #FFC0B0
├── 300: #FFA08A
├── 400: #FF7F64
├── 500: #FF6B4A (principal)
├── 600: #E55A3D
├── 700: #CC4A36
├── 800: #B2392E
└── 900: #992927 (mais escura)

SECONDARY - Azul Confiança
├── 50: #E8F0FE
├── 100: #D1E0FD
├── 200: #A3C1FA
├── 300: #75A2F8
├── 400: #4783F5
├── 500: #4A90E2 (principal)
├── 600: #3A73B5
├── 700: #2B5688
├── 800: #1B3A5A
└── 900: #0C1D2D

SUCCESS - Verde Natureza
├── 500: #2DCF8A (principal)
└── 100: #E6F9F0 (fundo)

WARNING - Amarelo Atenção
├── 500: #FFCC00 (principal)
└── 100: #FFF9E6 (fundo)

ERROR - Vermelho Alerta
├── 500: #FF3B30 (principal)
└── 100: #FFEBEA (fundo)
```

### **Cores Neutras**

```
NEUTROS
├── White: #FFFFFF
├── Gray 50: #F9F9F9 (fundo)
├── Gray 100: #F5F5F5 (cards)
├── Gray 200: #EEEEEE (bordas)
├── Gray 300: #E0E0E0 (divisores)
├── Gray 400: #BDBDBD (placeholder)
├── Gray 500: #9E9E9E (texto secundário)
├── Gray 600: #757575
├── Gray 700: #616161
├── Gray 800: #424242 (texto principal)
├── Gray 900: #212121 (títulos)
└── Black: #000000
```

### **Variáveis CSS**

```css
/* Primárias */
--primary-50: #FFF0EB;
--primary-100: #FFE0D5;
--primary-200: #FFC0B0;
--primary-300: #FFA08A;
--primary-400: #FF7F64;
--primary-500: #FF6B4A;
--primary-600: #E55A3D;
--primary-700: #CC4A36;
--primary-800: #B2392E;
--primary-900: #992927;

/* Secundárias */
--secondary-50: #E8F0FE;
--secondary-100: #D1E0FD;
--secondary-200: #A3C1FA;
--secondary-300: #75A2F8;
--secondary-400: #4783F5;
--secondary-500: #4A90E2;
--secondary-600: #3A73B5;
--secondary-700: #2B5688;
--secondary-800: #1B3A5A;
--secondary-900: #0C1D2D;

/* Status */
--success-100: #E6F9F0;
--success-500: #2DCF8A;
--warning-100: #FFF9E6;
--warning-500: #FFCC00;
--error-100: #FFEBEA;
--error-500: #FF3B30;

/* Neutros */
--white: #FFFFFF;
--gray-50: #F9F9F9;
--gray-100: #F5F5F5;
--gray-200: #EEEEEE;
--gray-300: #E0E0E0;
--gray-400: #BDBDBD;
--gray-500: #9E9E9E;
--gray-600: #757575;
--gray-700: #616161;
--gray-800: #424242;
--gray-900: #212121;
--black: #000000;
```

---

## 🔤 2. TIPOGRAFIA

### **Fontes**

```
TÍTULOS GRANDES: SF Pro Display / Roboto
├── Size: 32px
├── Weight: Bold (700)
├── Line Height: 40px
└── Tracking: -0.5px

TÍTULOS MÉDIOS: SF Pro Display / Roboto
├── Size: 24px
├── Weight: Bold (700)
├── Line Height: 32px
└── Tracking: -0.3px

TÍTULOS PEQUENOS: SF Pro Text / Roboto
├── Size: 20px
├── Weight: Semibold (600)
├── Line Height: 28px
└── Tracking: -0.2px

CORPO GRANDE: SF Pro Text / Roboto
├── Size: 16px
├── Weight: Regular (400)
├── Line Height: 24px
└── Tracking: 0px

CORPO PADRÃO: SF Pro Text / Roboto
├── Size: 14px
├── Weight: Regular (400)
├── Line Height: 20px
└── Tracking: 0px

CORPO PEQUENO: SF Pro Text / Roboto
├── Size: 12px
├── Weight: Regular (400)
├── Line Height: 16px
└── Tracking: 0px

DESTAQUE: SF Pro Text / Roboto
├── Size: 14px
├── Weight: Medium (500)
└── Line Height: 20px

LEGENDA: SF Pro Text / Roboto
├── Size: 12px
├── Weight: Regular (400)
├── Line Height: 16px
└── Color: Gray 600
```

### **Escala Tipográfica**

| Nome | Tamanho | Peso | Line Height | Tracking | Uso |
|:-----|:--------|:-----|:------------|:---------|:----|
| Display | 32px | Bold (700) | 40px | -0.5px | Títulos grandes |
| H1 | 24px | Bold (700) | 32px | -0.3px | Títulos principais |
| H2 | 20px | Semibold (600) | 28px | -0.2px | Subtítulos |
| Body Large | 16px | Regular (400) | 24px | 0px | Texto padrão grande |
| Body | 14px | Regular (400) | 20px | 0px | Texto padrão |
| Body Small | 12px | Regular (400) | 16px | 0px | Texto secundário |
| Highlight | 14px | Medium (500) | 20px | 0px | Destaques |
| Caption | 12px | Regular (400) | 16px | 0px | Labels, hints |

### **Hierarquia**

```
Display (32px) - Tela de boas-vindas
  ↓
H1 (24px) - Títulos de página
  ↓
H2 (20px) - Subtítulos
  ↓
Body Large (16px) - Conteúdo principal
  ↓
Body (14px) - Texto padrão
  ↓
Caption (12px) - Informações auxiliares
```

---

## 🧩 3. COMPONENTES UI

### **3.1 Botões**

#### **BOTÃO PRIMÁRIO (Preenchido)**
```
┌─────────────────────┐
│   [    AÇÃO      ]  │
└─────────────────────┘
├── Background: Primary 500 (#FF6B4A)
├── Text: White, 16px, Medium
├── Padding: 12px 24px
├── Border Radius: 8px
├── Shadow: none (normal) / inset (pressed)
└── States:
    ├── Normal: Primary 500
    ├── Hover: Primary 600
    ├── Pressed: Primary 700
    └── Disabled: Gray 300, text Gray 500
```

#### **BOTÃO SECUNDÁRIO (Borda)**
```
┌─────────────────────┐
│   [    AÇÃO      ]  │
└─────────────────────┘
├── Background: Transparent
├── Border: 1px solid Primary 500
├── Text: Primary 500, 16px, Medium
├── Padding: 12px 24px
├── Border Radius: 8px
└── States:
    ├── Normal: borda Primary 500
    ├── Hover: background Primary 50
    └── Disabled: borda Gray 300, text Gray 500
```

#### **BOTÃO TERCIÁRIO (Texto)**
```
┌─────────────────────┐
│        AÇÃO         │
└─────────────────────┘
├── Background: Transparent
├── Text: Primary 500, 14px, Medium
├── Padding: 8px 16px
└── States:
    ├── Normal: Primary 500
    └── Hover: Primary 700 + underline
```

#### **BOTÃO ÍCONE**
```
┌─────┐
│  🔔  │
└─────┘
├── Size: 40x40px
├── Background: Transparent
├── Border Radius: 20px (circular)
└── States:
    ├── Normal: ícone Gray 700
    └── Hover: background Gray 100
```

### **3.2 Cards**

#### **CARD PADRÃO**
```
┌─────────────────────────────┐
│                             │
│   Título do Card           │
│   Conteúdo aqui...         │
│                             │
│   [ Ação ]                 │
│                             │
└─────────────────────────────┘
├── Background: White
├── Border Radius: 12px
├── Padding: 16px
├── Shadow: 0px 2px 8px rgba(0,0,0,0.05)
├── Border: 1px solid Gray 200 (opcional)
└── Espaçamento interno: 12px entre elementos
```

#### **CARD DESTAQUE**
```
┌─────────────────────────────┐
│   🎯                        │
│   Título em destaque        │
│   Valor principal           │
└─────────────────────────────┘
├── Background: Primary 50
├── Border: 1px solid Primary 200
├── Border Radius: 12px
├── Padding: 16px
└── Shadow: 0px 4px 12px rgba(255,107,74,0.1)
```

### **3.3 Campos de Formulário**

#### **CAMPO DE TEXTO**
```
┌─────────────────────────────┐
│ Rótulo *                    │
│ ┌───────────────────────┐   │
│ │ Texto do campo       │   │
│ └───────────────────────┘   │
│ Mensagem de ajuda           │
└─────────────────────────────┘
├── Rótulo: 14px, Medium, Gray 800
├── Campo:
│   ├── Height: 48px
│   ├── Border: 1px solid Gray 300
│   ├── Border Radius: 8px
│   ├── Padding: 0 16px
│   ├── Text: 16px, Regular
│   └── Placeholder: Gray 400
├── Focus: border Primary 500 + shadow 0 0 0 3px Primary 100
├── Error: border Error 500 + icon ⚠️
├── Success: border Success 500 + icon ✓
└── Disabled: background Gray 100, text Gray 500
```

#### **SELECT/DROPDOWN**
```
┌─────────────────────────────┐
│ Rótulo                      │
│ ┌───────────────────────┐ ▼ │
│ │ Opção selecionada    │   │
│ └───────────────────────┘   │
└─────────────────────────────┘
├── Mesmo estilo do campo texto
└── Ícone seta na direita
```

#### **CHECKBOX**
```
┌─────────────────────────────┐
│ ☐ Opção de escolha          │
└─────────────────────────────┘
├── Unchecked: borda 2px Gray 500
├── Checked: background Primary 500, check branco
├── Label: 14px, Regular, Gray 800
└── Gap: 8px entre box e texto
```

#### **RADIO BUTTON**
```
┌─────────────────────────────┐
│ ( ) Opção 1   ( ) Opção 2   │
└─────────────────────────────┘
├── Unchecked: círculo borda 2px Gray 500
├── Checked: círculo preenchido Primary 500
└── Label: 14px, Regular, Gray 800
```

#### **SWITCH (TOGGLE)**
```
┌─────────────────────────────┐
│    Opção           [   |  ] │
└─────────────────────────────┘
├── Off: background Gray 300
├── On: background Primary 500
├── Circle: White, 20px
└── Size: 44px width, 24px height
```

### **3.4 Navegação**

#### **TAB BAR (Menu Inferior - App Cliente)**
```
┌─────────────────────────────────────┐
│ [🏠]  [📅]  [📷]  [👤]              │
│ Home  Agenda  Fotos  Conta          │
└─────────────────────────────────────┘
├── Background: White
├── Border Top: 1px solid Gray 200
├── Height: 60px
├── Ícones: 24px
├── Texto: 12px, Regular
└── Active: Primary 500 / Inactive: Gray 500
```

#### **SIDEBAR (Menu Lateral - Painel Gestor)**
```
┌──────────┬────────────────────────┐
│ 🐾       │                        │
│ PetManager│                        │
│          │                        │
│ 🏠 Dash. │                        │
│ 📅 Agenda │      CONTEÚDO          │
│ 👥 Clientes│                        │
│ 📦 Estoque│                        │
│ 💰 Financ.│                        │
│ 📊 Relat. │                        │
│ ⚙️ Config │                        │
│          │                        │
│ 👤 João  │                        │
└──────────┴────────────────────────┘
├── Width: 240px
├── Background: White
├── Border Right: 1px solid Gray 200
├── Ícones: 20px, Gray 600
├── Texto: 14px, Medium, Gray 700
├── Active: background Primary 50, text Primary 600
├── Hover: background Gray 100
└── User section: border top, padding 16px
```

#### **TABS (Abas)**
```
┌─────────────────────────────────┐
│ [ Ativo ] [ Histórico ] [ Info ]│
└─────────────────────────────────┘
├── Container: border bottom 2px solid Gray 200
├── Tab: padding 12px 16px, 14px Medium
├── Active: text Primary 500, border bottom 2px Primary 500
├── Inactive: text Gray 600
└── Hover: text Gray 800
```

### **3.5 Feedback e Alertas**

#### **ALERTA SUCESSO**
```
┌─────────────────────────────────┐
│ ✅ Operação concluída com sucesso│
└─────────────────────────────────┘
├── Background: Success 100
├── Border: 1px solid Success 500
├── Text: Success 700, 14px
├── Icon: Success 500
├── Padding: 12px 16px
└── Border Radius: 8px
```

#### **ALERTA ERRO**
```
┌─────────────────────────────────┐
│ ❌ Erro ao processar solicitação│
└─────────────────────────────────┘
├── Background: Error 100
├── Border: 1px solid Error 500
├── Text: Error 700, 14px
└── Icon: Error 500
```

#### **ALERTA AVISO**
```
┌─────────────────────────────────┐
│ ⚠️ Estoque baixo, fazer pedido  │
└─────────────────────────────────┘
├── Background: Warning 100
├── Border: 1px solid Warning 500
├── Text: Warning 700, 14px
└── Icon: Warning 500
```

#### **ALERTA INFO**
```
┌─────────────────────────────────┐
│ ℹ️ Nova funcionalidade disponível│
└─────────────────────────────────┘
├── Background: Secondary 100
├── Border: 1px solid Secondary 500
├── Text: Secondary 700, 14px
└── Icon: Secondary 500
```

#### **BADGE (Etiquetas)**
```
┌──────┐
│ Pend.│
└──────┘
├── Padding: 4px 8px
├── Border Radius: 16px (pill)
├── Font: 12px, Medium
├── Success: background Success 100, text Success 700
├── Warning: background Warning 100, text Warning 700
├── Error: background Error 100, text Error 700
├── Info: background Secondary 100, text Secondary 700
└── Neutral: background Gray 200, text Gray 700
```

### **3.6 Listas e Tabelas**

#### **LISTA ITEM**
```
┌─────────────────────────────────┐
│ 🐶 Rex                           │
│   Último banho: 10/03          │
└─────────────────────────────────┘
├── Padding: 12px 16px
├── Border bottom: 1px solid Gray 200
├── Ícone: 24px (esquerda)
├── Título: 16px, Medium
├── Subtítulo: 14px, Regular, Gray 600
└── Ações: ícones à direita
```

#### **TABELA DE DADOS**
```
┌─────────────────────────────────┐
│ Produto    Qtd   Preço   Status │
├─────────────────────────────────┤
│ Ração X    5     R$150    🟢    │
│ Shampoo Y  2     R$45     🔴    │
│ Coleira Z  8     R$30     🟡    │
└─────────────────────────────────┘
├── Header: background Gray 100, 14px Bold
├── Row: border bottom 1px Gray 200
├── Cell: padding 12px 8px
├── Hover row: background Gray 50
└── Status com badge colorido
```

### **3.7 Modais e Diálogos**

#### **MODAL CONFIRMAÇÃO**
```
┌─────────────────────────────────┐
│                                 │
│        🔔                       │
│   Confirmar exclusão?           │
│                                 │
│   Esta ação não pode ser        │
│   desfeita.                     │
│                                 │
│   [ Cancelar ]  [ Confirmar ]   │
│                                 │
└─────────────────────────────────┘
├── Overlay: black 50% opacity
├── Modal: background White, radius 16px
├── Padding: 24px
├── Width: 90% (mobile), 400px (desktop)
├── Icon: 48px, Error 500
└── Buttons: lado a lado (mobile empilhado)
```

#### **BOTTOM SHEET (Mobile)**
```
┌─────────────────────────────────┐
│ ────                            │
│ Título                          │
│                                 │
│ Opção 1                         │
│ Opção 2                         │
│ Opção 3                         │
│                                 │
│ [ Fechar ]                      │
└─────────────────────────────────┘
├── Overlay: black 50% opacity
├── Sheet: background White, radius 16px top
├── Handle: 40px width, 4px height, Gray 300
└── Animation: slide from bottom
```

### **3.8 Loaders e Skeleton**

#### **SPINNER (Carregando)**
```
┌─────┐
│ ⭕️  │
└─────┘
├── Animation: rotate infinite
├── Color: Primary 500
├── Size: 24px (small), 40px (medium), 56px (large)
└── Texto opcional: "Carregando..." 14px Gray 600
```

#### **SKELETON (Placeholder)**
```
┌─────────────────────────────────┐
│ █████████████████████████████   │
│ ██████████                      │
│ ███████████████████████         │
└─────────────────────────────────┘
├── Background: Gray 200
├── Animation: pulse (opacidade 1 → 0.5 → 1)
└── Simula formato do conteúdo
```

---

## 📏 4. ESPAÇAMENTOS E GRID

### **Espaçamento**

```
ESPACE
├── 4px   (xxs)
├── 8px   (xs)
├── 12px  (s)
├── 16px  (m) - base
├── 24px  (l)
├── 32px  (xl)
├── 48px  (xxl)
└── 64px  (xxxl)
```

### **Variáveis CSS**

```css
--spacing-xxs: 4px;
--spacing-xs: 8px;
--spacing-s: 12px;
--spacing-m: 16px;
--spacing-l: 24px;
--spacing-xl: 32px;
--spacing-xxl: 48px;
--spacing-xxxl: 64px;
```

### **GRID (Responsivo)**

```
Mobile (até 640px)
├── 1 coluna
├── Margens laterais: 16px
└── Gutter: 16px

Tablet (641px - 1024px)
├── 2 colunas
├── Margens laterais: 24px
└── Gutter: 24px

Desktop (1025px+)
├── 12 colunas
├── Max width: 1200px
├── Margens laterais: 32px
└── Gutter: 24px
```

### **Breakpoints**

```css
/* Mobile */
@media (max-width: 640px) {
  --container-max-width: 100%;
  --grid-columns: 1;
  --margin-lateral: 16px;
  --gutter: 16px;
}

/* Tablet */
@media (min-width: 641px) and (max-width: 1024px) {
  --container-max-width: 768px;
  --grid-columns: 2;
  --margin-lateral: 24px;
  --gutter: 24px;
}

/* Desktop */
@media (min-width: 1025px) {
  --container-max-width: 1200px;
  --grid-columns: 12;
  --margin-lateral: 32px;
  --gutter: 24px;
}
```

---

## 📱 5. ÍCONES

### **Sistema de Ícones**

```
ÍCONES SISTEMA
├── Tamanhos: 16px, 20px, 24px, 32px, 48px
├── Estilo: Outline (traço 2px)
├── Família: Material Icons ou Font Awesome
└── Cores: conforme contexto
```

### **Ícones Principais**

| Ícone | Código | Uso |
|:------|:-------|:----|
| 🏠 | `home` | Home |
| 📅 | `calendar_today` | Agenda/Calendário |
| 👤 | `person` | Perfil/Usuário |
| 🐶 | `pets` | Pet |
| 📦 | `inventory` | Estoque |
| 💰 | `attach_money` | Financeiro |
| 📊 | `bar_chart` | Relatório |
| ⚙️ | `settings` | Configurações |
| 🔔 | `notifications` | Notificações |
| ✏️ | `edit` | Editar |
| 🗑️ | `delete` | Excluir |
| ✓ | `check` | Confirmar/Sucesso |
| ✕ | `close` | Fechar/Cancelar |
| ＋ | `add` | Adicionar |
| 📷 | `photo_camera` | Fotos |
| 👥 | `people` | Clientes |
| 🔍 | `search` | Buscar |
| ⚠️ | `warning` | Alerta |
| ✅ | `check_circle` | Sucesso |
| ❌ | `error` | Erro |
| ℹ️ | `info` | Informação |

---

## 🎭 6. ANIMAÇÕES

### **Transições Padrão**

```css
/* Transição suave */
.transition {
  transition: all 0.2s ease-in-out;
}

/* Hover suave */
.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* Loading spinner */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.spinner {
  animation: spin 1s linear infinite;
}

/* Pulse (skeleton) */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.skeleton {
  animation: pulse 1.5s ease-in-out infinite;
}
```

### **Micro-interações**

- Botões: Elevação ao hover
- Cards: Sombra ao hover
- Inputs: Borda muda de cor no focus
- Loading: Spinner animado
- Skeleton: Pulse para placeholders

---

## 🎯 7. ACESSIBILIDADE

### **Contraste**

- Texto sobre fundo claro: mínimo 4.5:1
- Texto sobre fundo escuro: mínimo 4.5:1
- Texto grande: mínimo 3:1

### **Tamanhos Touch**

- Botões: mínimo 44px x 44px
- Links: mínimo 44px altura
- Áreas clicáveis: mínimo 48px

### **Navegação por Teclado**

- Tab order lógico
- Focus visível
- Atalhos de teclado

---

## 📋 8. CHECKLIST DE IMPLEMENTAÇÃO

### **Flutter (Mobile)**

- [ ] Criar arquivo `app_theme.dart` com cores
- [ ] Criar componentes reutilizáveis (botões, cards, inputs)
- [ ] Aplicar tema em todas as telas
- [ ] Testar em diferentes tamanhos de tela
- [ ] Implementar animações e transições

### **React (Web)**

- [ ] Criar arquivo `theme.css` com variáveis CSS
- [ ] Criar componentes de UI reutilizáveis
- [ ] Aplicar tema em todas as páginas
- [ ] Testar responsividade
- [ ] Implementar animações e transições

---

## 📚 9. REFERÊNCIAS

### **Documentos Relacionados**

- `VISUAL_IDENTITY.md` - Identidade visual completa
- `WIREFRAMES_HIGH_FIDELITY.md` - Wireframes de alta fidelidade
- `PROTOTYPE_FLOWS.md` - Fluxos navegáveis
- `PROTOTYPE_INTERACTIONS.md` - Especificações de interação

---

**Última atualização:** 2026-02-20  
**Versão:** 2.4 (Design System Completo)

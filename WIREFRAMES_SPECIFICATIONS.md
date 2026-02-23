# 📐 Especificações Técnicas dos Wireframes

Este documento detalha as especificações técnicas para implementação das telas baseadas nos wireframes.

## 🎨 Design System

### Paleta de Cores

```css
/* Cores Principais */
--primary: #4CAF50;        /* Verde - Botões principais */
--primary-dark: #45a049;   /* Verde escuro - Hover */
--secondary: #2196F3;      /* Azul - Links, informações */
--accent: #FF9800;         /* Laranja - Avisos */

/* Cores de Status */
--success: #4CAF50;        /* Verde - Sucesso */
--warning: #FF9800;        /* Laranja - Aviso */
--error: #FF5722;          /* Vermelho - Erro, alertas */
--info: #2196F3;           /* Azul - Informação */

/* Cores Neutras */
--text-primary: #212121;   /* Preto - Texto principal */
--text-secondary: #757575; /* Cinza - Texto secundário */
--divider: #E0E0E0;        /* Cinza claro - Divisores */
--background: #F5F5F5;     /* Cinza muito claro - Fundo */
--surface: #FFFFFF;        /* Branco - Cards, superfícies */
```

### Tipografia

```css
/* Família de Fontes */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 
             'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 
             'Fira Sans', 'Droid Sans', 'Helvetica Neue', 
             sans-serif;

/* Tamanhos */
--font-size-xs: 12px;      /* Labels pequenos */
--font-size-sm: 14px;      /* Texto secundário */
--font-size-base: 16px;    /* Texto padrão */
--font-size-lg: 18px;      /* Subtítulos */
--font-size-xl: 24px;      /* Títulos */
--font-size-2xl: 32px;     /* Títulos grandes */

/* Pesos */
--font-weight-regular: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
```

### Espaçamento

```css
/* Sistema de espaçamento (múltiplos de 4) */
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;
--spacing-2xl: 48px;
```

### Componentes Base

#### Botões

```css
/* Botão Primário */
.btn-primary {
  background: #4CAF50;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 16px;
  border: none;
  cursor: pointer;
}

/* Botão Secundário */
.btn-secondary {
  background: white;
  color: #4CAF50;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 16px;
  border: 2px solid #4CAF50;
  cursor: pointer;
}

/* Botão Texto */
.btn-text {
  background: transparent;
  color: #4CAF50;
  padding: 8px 16px;
  border: none;
  font-weight: 500;
  cursor: pointer;
}
```

#### Cards

```css
.card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-header {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #212121;
}
```

#### Inputs

```css
.input {
  width: 100%;
  padding: 12px;
  border: 1px solid #E0E0E0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s;
}

.input:focus {
  outline: none;
  border-color: #4CAF50;
}

.input-error {
  border-color: #FF5722;
}
```

---

## 📱 Telas Detalhadas

### APP CLIENTE

#### TELA 1: Onboarding

**Layout:**
- Container centralizado verticalmente
- Logo: 120px x 120px
- Espaçamento entre elementos: 24px
- Botões: largura 100%, altura 48px

**Elementos:**
- Logo: Ícone grande (emoji ou imagem)
- Título: 24px, bold, cor primária
- Subtítulo: 16px, regular, cor secundária
- Botão WhatsApp: Verde (#4CAF50), branco
- Botão E-mail: Branco, borda verde
- Link: 14px, cor secundária

**Comportamento:**
- Animação suave ao aparecer
- Botões com feedback tátil (mobile)

---

#### TELA 4: Home / Dashboard

**Layout:**
- Header fixo: 64px altura
- Conteúdo scrollável
- Menu inferior fixo: 56px altura

**Cards:**
- Próximo agendamento: Card grande, verde claro
- Pets: Grid 3 colunas, círculos 80px
- Últimos serviços: Lista vertical, cards pequenos

**Espaçamentos:**
- Entre seções: 24px
- Entre cards: 16px
- Padding lateral: 16px

**Menu Inferior:**
- Ícones: 24px
- Labels: 12px
- Altura total: 56px
- Fundo branco, sombra superior

---

### PAINEL GESTOR

#### TELA G2: Dashboard

**Layout:**
- Sidebar: 250px largura fixa
- Conteúdo principal: Flexível
- Header: 64px altura

**Grid de Cards:**
- 2 colunas em desktop
- 1 coluna em tablet
- Espaçamento: 20px

**Cards:**
- Altura mínima: 120px
- Padding interno: 24px
- Ícone: 40px, cor primária

**Alertas:**
- Card especial: fundo amarelo claro
- Ícone de alerta: vermelho
- Lista com bullets

---

#### TELA G3: Agenda

**Layout:**
- Lista vertical de profissionais
- Cada profissional: seção colapsável
- Agendamentos: cards horizontais

**Agendamento Card:**
- Altura: 60px
- Padding: 12px
- Borda esquerda colorida (por status)
- Ícone de status: 20px

**Status Colors:**
- ✓ Concluído: Verde (#4CAF50)
- ⏳ Em andamento: Laranja (#FF9800)
- ☐ Pendente: Cinza (#9E9E9E)

---

#### TELA G6: PDV

**Layout:**
- Busca no topo: altura 48px
- Lista de itens: scrollável
- Resumo fixo no rodapé: altura 200px

**Item da Venda:**
- Altura: 60px
- Quantidade: 40px largura
- Nome: flexível
- Preço: 100px largura, alinhado à direita
- Botão remover: 32px x 32px

**Resumo:**
- Fundo branco
- Borda superior: 2px sólida #E0E0E0
- Total: destaque, 24px, bold

---

## 🔄 Estados e Interações

### Estados dos Botões

```css
/* Normal */
.btn-primary { background: #4CAF50; }

/* Hover */
.btn-primary:hover { background: #45a049; }

/* Active */
.btn-primary:active { transform: scale(0.98); }

/* Disabled */
.btn-primary:disabled { 
  background: #CCCCCC; 
  cursor: not-allowed; 
}
```

### Estados dos Inputs

```css
/* Normal */
.input { border: 1px solid #E0E0E0; }

/* Focus */
.input:focus { border: 2px solid #4CAF50; }

/* Error */
.input-error { border: 2px solid #FF5722; }

/* Disabled */
.input:disabled { 
  background: #F5F5F5; 
  cursor: not-allowed; 
}
```

### Loading States

```css
.loading {
  opacity: 0.6;
  pointer-events: none;
}

.spinner {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #4CAF50;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}
```

---

## 📐 Breakpoints Responsivos

```css
/* Mobile */
@media (max-width: 767px) {
  /* App Cliente */
  --container-padding: 16px;
  --card-padding: 12px;
  --font-size-base: 14px;
}

/* Tablet */
@media (min-width: 768px) and (max-width: 1023px) {
  /* Painel Gestor */
  --sidebar-width: 200px;
  --grid-columns: 2;
}

/* Desktop */
@media (min-width: 1024px) {
  /* Painel Gestor */
  --sidebar-width: 250px;
  --grid-columns: 3;
  --max-width: 1200px;
}
```

---

## 🎯 Checklist de Implementação

### Mobile (Flutter)
- [ ] Criar tema base com cores
- [ ] Implementar componentes reutilizáveis
- [ ] Criar telas de onboarding
- [ ] Criar tela de home
- [ ] Criar tela de perfil do pet
- [ ] Criar tela de detalhes do agendamento

### Web (React)
- [ ] Criar tema base com cores
- [ ] Implementar componentes reutilizáveis
- [ ] Criar layout com sidebar
- [ ] Criar dashboard
- [ ] Criar tela de agenda
- [ ] Criar tela de PDV

---

**Última atualização:** 2026-02-20

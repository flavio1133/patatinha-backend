# 🎮 Especificações de Interação - Protótipo Navegável

Este documento detalha todas as interações, animações e comportamentos do protótipo navegável.

## 🎯 Princípios de Interação

### 1. Feedback Imediato
- Toda ação tem resposta visual instantânea
- Loading states sempre visíveis
- Mensagens de erro claras

### 2. Transições Suaves
- Animações de 0.2s a 0.3s
- Easing natural (ease-out)
- Sem movimentos bruscos

### 3. Consistência
- Mesmas interações em contextos similares
- Padrões visuais uniformes
- Comportamento previsível

---

## 🔄 Transições entre Telas

### Tipos de Transição

#### 1. Slide Horizontal (Navegação Principal)
```css
/* Avançar (→) */
.slide-forward {
  animation: slideInRight 0.3s ease-out;
}

/* Voltar (←) */
.slide-back {
  animation: slideInLeft 0.3s ease-out;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideInLeft {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
```

**Uso:** Navegação entre telas principais (Home → Agenda → Perfil)

---

#### 2. Fade (Modais, Overlays)
```css
.fade-in {
  animation: fadeIn 0.2s ease-out;
}

.fade-out {
  animation: fadeOut 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```

**Uso:** Modais, confirmações, overlays

---

#### 3. Slide Vertical (Menus, Dropdowns)
```css
.slide-down {
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
```

**Uso:** Menus dropdown, autocomplete, seletores

---

## 🎨 Estados de Componentes

### Botões

#### Estado Normal
```css
.btn {
  background: #FF6B4A;
  color: white;
  padding: 14px 28px;
  border-radius: 12px;
  transition: all 0.2s;
}
```

#### Estado Hover
```css
.btn:hover {
  background: #E55A3A;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(255, 107, 74, 0.4);
}
```

#### Estado Active
```css
.btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(255, 107, 74, 0.3);
}
```

#### Estado Disabled
```css
.btn:disabled {
  background: #CCCCCC;
  color: #999999;
  cursor: not-allowed;
  opacity: 0.6;
}
```

#### Estado Loading
```css
.btn-loading {
  position: relative;
  color: transparent;
}

.btn-loading::after {
  content: "";
  position: absolute;
  width: 20px;
  height: 20px;
  top: 50%;
  left: 50%;
  margin-left: -10px;
  margin-top: -10px;
  border: 2px solid white;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 0.8s linear infinite;
}
```

---

### Inputs

#### Estado Normal
```css
.input {
  border: 2px solid #E0E0E0;
  padding: 14px 16px;
  border-radius: 12px;
  transition: all 0.2s;
}
```

#### Estado Focus
```css
.input:focus {
  border-color: #FF6B4A;
  outline: none;
  box-shadow: 0 0 0 4px rgba(255, 107, 74, 0.1);
}
```

#### Estado Error
```css
.input-error {
  border-color: #FF3B30;
  background: #FFEBEE;
}

.input-error-message {
  color: #FF3B30;
  font-size: 12px;
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}
```

#### Estado Success
```css
.input-success {
  border-color: #2DCF8A;
}

.input-success-icon {
  position: absolute;
  right: 12px;
  color: #2DCF8A;
}
```

---

### Cards

#### Estado Normal
```css
.card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}
```

#### Estado Hover (Clicável)
```css
.card-clickable:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  cursor: pointer;
}
```

#### Estado Selecionado
```css
.card-selected {
  border: 2px solid #FF6B4A;
  background: #FFF0EB;
}
```

---

## 🎬 Animações Específicas

### Barra de Progresso (Acompanhamento)

```css
.progress-bar {
  height: 8px;
  background: #E0E0E0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #FF6B4A, #FF8A6B);
  border-radius: 4px;
  transition: width 0.5s ease-out;
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
```

**Comportamento:**
- Atualiza a cada 30 segundos
- Animação suave de crescimento
- Efeito shimmer para indicar atividade

---

### Notificações Push

```css
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideInNotification 0.3s ease-out;
  z-index: 1000;
}

@keyframes slideInNotification {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
```

**Comportamento:**
- Aparece do lado direito
- Auto-dismiss após 5 segundos
- Clicável para ver detalhes
- Stack de múltiplas notificações

---

### Loading Spinner

```css
.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #F5F5F5;
  border-top: 3px solid #FF6B4A;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
```

**Uso:**
- Carregamento de dados
- Processamento de ações
- Estados de loading em botões

---

### Skeleton Loading

```css
.skeleton {
  background: linear-gradient(
    90deg,
    #F5F5F5 0%,
    #E0E0E0 50%,
    #F5F5F5 100%
  );
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
  border-radius: 8px;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
```

**Uso:**
- Placeholder durante carregamento
- Cards, listas, imagens

---

## 🎯 Interações Específicas

### Calendário

**Interações:**
- Clicar em dia → Seleciona
- Dias disponíveis: Clicáveis, cor preta
- Dias ocupados: Cinza, não clicáveis
- Dia selecionado: Fundo laranja, texto branco
- Hover: Fundo laranja claro

**Animações:**
- Seleção: Scale 1.1 → 1.0 (0.2s)
- Mudança de mês: Fade out → Fade in

---

### Grid de Horários

**Interações:**
- Clicar em horário → Seleciona
- Horário selecionado: Fundo laranja, texto branco
- Horários ocupados: Fundo cinza claro, não clicáveis
- Hover: Fundo laranja claro

**Animações:**
- Seleção: Bounce suave (scale 1.05 → 1.0)
- Desabilitação: Fade out (opacity 0.5)

---

### Autocomplete

**Interações:**
- Digitar → Lista aparece abaixo
- Clicar em item → Seleciona e fecha lista
- ESC → Fecha lista
- Setas ↑↓ → Navega na lista
- Enter → Seleciona item destacado

**Animações:**
- Abertura: Slide down (0.2s)
- Fechamento: Slide up (0.2s)
- Highlight: Fundo laranja claro

---

### Modais

**Interações:**
- Abrir: Fade in + scale (0.2s)
- Fechar: Fade out + scale (0.2s)
- Clicar fora: Fecha modal
- ESC: Fecha modal
- Backdrop: Fundo escuro semi-transparente

**Animações:**
```css
.modal-backdrop {
  background: rgba(0, 0, 0, 0.5);
  animation: fadeIn 0.2s;
}

.modal-content {
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    transform: translateY(-50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
```

---

### Swipe (Mobile)

**Interações:**
- Swipe horizontal: Navega entre slides (onboarding)
- Swipe vertical: Scroll em listas
- Swipe para deletar: Confirmação antes de deletar

**Sensibilidade:**
- Mínimo 50px de movimento
- Velocidade mínima: 0.3px/ms

---

## 📱 Gestos Touch (Mobile)

### Tap
- Feedback visual imediato
- Ripple effect (opcional)
- Tempo de resposta < 100ms

### Long Press
- Menu contextual aparece
- Vibração (se disponível)
- Tempo: 500ms

### Swipe
- Horizontal: Navegação
- Vertical: Scroll
- Diagonal: Desabilitado

### Pinch
- Zoom em imagens
- Galeria de fotos
- Mapa (se implementado)

---

## 🔔 Notificações e Alertas

### Tipos de Notificação

#### Sucesso
```css
.notification-success {
  background: #E8F5E9;
  border-left: 4px solid #34C759;
  color: #2E7D32;
}
```

#### Aviso
```css
.notification-warning {
  background: #FFF3E0;
  border-left: 4px solid #FFCC00;
  color: #E65100;
}
```

#### Erro
```css
.notification-error {
  background: #FFEBEE;
  border-left: 4px solid #FF3B30;
  color: #C62828;
}
```

#### Info
```css
.notification-info {
  background: #E3F2FD;
  border-left: 4px solid #4A90E2;
  color: #1976D2;
}
```

### Comportamento

- **Aparição:** Slide in do topo (mobile) ou canto superior direito (web)
- **Duração:** 5 segundos (configurável)
- **Ação:** Clicável para ver detalhes
- **Fechar:** Botão X ou swipe (mobile)

---

## 🎨 Micro-interações

### Checkbox/Radio

```css
.checkbox {
  width: 24px;
  height: 24px;
  border: 2px solid #E0E0E0;
  border-radius: 4px;
  transition: all 0.2s;
}

.checkbox:checked {
  background: #FF6B4A;
  border-color: #FF6B4A;
}

.checkbox:checked::after {
  content: "✓";
  color: white;
  animation: checkMark 0.2s ease-out;
}

@keyframes checkMark {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}
```

### Toggle Switch

```css
.toggle {
  width: 48px;
  height: 24px;
  background: #E0E0E0;
  border-radius: 12px;
  transition: all 0.3s;
}

.toggle:checked {
  background: #FF6B4A;
}

.toggle::after {
  content: "";
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: transform 0.3s;
}

.toggle:checked::after {
  transform: translateX(24px);
}
```

### Badge de Contador

```css
.badge-count {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #FF3B30;
  color: white;
  border-radius: 10px;
  padding: 2px 6px;
  font-size: 10px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}
```

---

## 📋 Checklist de Implementação no Protótipo

### Figma/Adobe XD

- [ ] Criar componentes reutilizáveis
- [ ] Definir variantes de estados
- [ ] Conectar todas as telas
- [ ] Adicionar animações
- [ ] Testar fluxos completos
- [ ] Exportar assets

### Interações a Implementar

- [ ] Navegação entre telas
- [ ] Modais e overlays
- [ ] Formulários com validação
- [ ] Loading states
- [ ] Animações de transição
- [ ] Feedback visual em ações

---

**Última atualização:** 2026-02-20

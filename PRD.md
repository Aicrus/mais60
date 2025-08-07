# PRD - Aplicativo Mais 60 Saúde

## 📋 Visão Geral

**Nome:** Mais 60 Saúde  
**Plataforma:** React Native (Mobile Only)  
**Público-Alvo:** Pessoas com 60+ anos  
**Objetivo:** Aplicativo intuitivo para gerenciamento de saúde em 5 áreas-chave através de conteúdo multimídia

## 🎨 Design System

### Tipografia
- **Principal:** Poppins (títulos, chamadas, textos importantes)
- **Secundária:** Omnes (textos corridos, descrições)
- **Apoio:** Bebas Neue (elementos específicos/estampas)

### Paleta de Cores
```
Primárias:
- Roxo: #430593 (RGB: 67, 5, 147)
- Verde: #27CC95 (RGB: 39, 204, 149)
- Coral: #FB5C3D (RGB: 251, 92, 61)
- Azul: #06AAFC (RGB: 6, 170, 252)
- Amarelo: #FFA300 (RGB: 255, 163, 0)
- Cinza Claro: #E8F3F5 (RGB: 232, 243, 245)
```

### Princípios de Design
- Fontes grandes e legíveis
- Alto contraste para acessibilidade
- Navegação simples (máximo 3 cliques)
- Botões grandes (mín. 48px altura)
- Ícones claros e intuitivos
- Feedback visual imediato

## 🏗️ Arquitetura do Projeto

### Processo de Implementação Adaptado ao Projeto Base

Este projeto parte de um template base já configurado com:

- Design System (tokens, componentes atômicos e utilitários)
- Navegação (React Navigation configurado)
- Autenticação (Supabase)
- Infraestrutura (Expo, TypeScript, Tailwind/NW)

Dessa forma, o fluxo de desenvolvimento seguirá três macro-etapas:

1. **Customização do Design System (Adaptar base existente)**
   - ✅ Projeto já tem design system completo em `design-system/tokens/`
   - ✅ Projeto já tem componentes prontos (Button, Input, Header, etc.)
   - 🔄 Atualizar cores para paleta Mais 60 Saúde
   - 🔄 Configurar fonte Poppins (substituir Plus Jakarta Sans)
   - 🔄 Ajustar tamanhos mínimos para acessibilidade de idosos
   - 🔄 Criar tabelas específicas do Mais 60 no Supabase

2. **Criação das Telas dos Módulos**
   - ✅ Projeto já tem navegação Stack e Tab configurada
   - ✅ Projeto já tem componentes prontos para reutilizar
   - 🔄 Criar 5 telas dos módulos principais usando componentes existentes
   - 🔄 Implementar dashboard na home com acesso aos módulos
   - 🔄 Criar componentes específicos para conteúdo (VideoCard, RecipeCard, etc.)

3. **Configurações e Ajustes Finais**
   - Implementar telas de configurações e preferências (Fase 5)
   - Polir animações, estados vazios e mensagens de erro
   - Realizar testes de usabilidade e performance

### Stack Tecnológica
- **Frontend:** React Native + Expo
- **Backend:** Supabase (MCP)
- **Navegação:** React Navigation 6
- **Estado:** Context API + AsyncStorage
- **Integração:** YouTube API
- **Sensores:** Expo Sensorsß

## 📱 Fluxo de Navegação

### 1. Onboarding (3 telas)
- **Tela 1:** Boas-vindas + explicação do app
- **Tela 2:** Permissões (sensores, notificações)
- **Tela 3:** Configurações de acessibilidade

### 2. Autenticação (já configurada no projeto base)
- Login com email/senha
- Recuperação de senha
- Cadastro básico

### 3. Tela Principal (Home)
- Menu visual com 5 módulos
- Estatísticas básicas (tempo de uso, atividades)
- Acesso rápido aos favoritos

### 4. Módulos Principais
1. **Atividade Física**
2. **Hábitos Alimentares**
3. **Segurança Domiciliar**
4. **Estimulação Cognitiva**
5. **Saúde Mental**

### 5. Telas Auxiliares
- Perfil/Configurações
- Favoritos
- Estatísticas detalhadas
- Ajuda/Suporte

## 🎯 Tasks de Desenvolvimento

### 📋 MAPEAMENTO COMPLETO: O QUE EXISTE vs O QUE CRIAR

## 🟢 **JÁ EXISTE NO PROJETO BASE (REUTILIZAR)**

#### 📁 **Design System Completo**
```
✅ design-system/tokens/colors.ts        → Sistema de cores claro/escuro
✅ design-system/tokens/typography.ts    → Plus Jakarta Sans configurada
✅ design-system/tokens/spacing.ts       → Sistema de espaçamentos
✅ design-system/tokens/borders.ts       → Bordas e border-radius
✅ design-system/tokens/effects.ts       → Sombras e efeitos
✅ design-system/tokens/breakpoints.ts   → Responsividade
```

#### 🧩 **Componentes Prontos para Reutilizar**
```
✅ components/buttons/Button.tsx         → Botão completo (5 variantes, tamanhos, estados)
✅ components/inputs/Input.tsx           → Input avançado (máscaras, tipos, validação)
✅ components/headers/Header.tsx         → Header responsivo com menus
✅ components/sheets/Sheet.tsx           → Modal/Sheet com animações
✅ components/checkboxes/Checkbox.tsx    → Checkbox estilizado
✅ components/dropdowns/Select.tsx       → Select/Dropdown
✅ components/accordions/Accordion.tsx   → Accordion expansível
✅ components/tables/DataTable.tsx       → Tabela de dados avançada
✅ components/toasts/Toast.tsx           → Sistema de notificações
✅ components/layout/PageContainer.tsx   → Container de página
✅ components/theme/ThemeSelector.tsx    → Seletor de tema
```

#### 🔧 **Infraestrutura Configurada**
```
✅ contexts/auth.tsx                     → Sistema de autenticação completo
✅ lib/supabase.ts                       → Supabase configurado
✅ hooks/DesignSystemContext.tsx         → Context de tema
✅ hooks/useResponsive.tsx               → Hook de responsividade
✅ hooks/useToast.tsx                    → Sistema de toasts
✅ app/_layout.tsx                       → Navegação Stack configurada
✅ app/(tabs)/_layout.tsx                → Tab navigation configurada
✅ app/(auth)/_layout.tsx                → Autenticação configurada
```

---

## 🟡 **PRECISA MODIFICAR (ADAPTAR EXISTENTE)**

#### 🎨 **Design System - Customização Mais 60**
```
🔄 design-system/tokens/colors.ts
   ATUAL: primary-light: '#687789'
   NOVO:  primary-light: '#430593' (Roxo Mais 60)
   + ADICIONAR: 4 cores extras (Verde, Coral, Azul, Amarelo)

🔄 design-system/tokens/typography.ts  
   ATUAL: Plus Jakarta Sans
   NOVO:  Poppins + tamanhos maiores para idosos
   
🔄 app.json
   ADICIONAR: Fontes Poppins (5 variantes)
   
🔄 components/buttons/Button.tsx
   ATUAL: altura md: 42px
   NOVO:  altura md: 48px (acessibilidade idosos)
```

#### 📱 **Navegação - Expandir para 5 Módulos**
```
🔄 app/(tabs)/_layout.tsx
   ATUAL: 2 tabs (home, dev)
   NOVO:  6 tabs (home + 5 módulos)
   
🔄 app/(tabs)/home.tsx  
   ATUAL: Tela simples de exemplo
   NOVO:  Dashboard com grid 2x3 dos módulos
```

---

## 🔴 **PRECISA CRIAR DO ZERO**

#### 📱 **5 Telas dos Módulos**
```
❌ app/(tabs)/physical-activity.tsx     → Lista vídeos exercícios + categorias
❌ app/(tabs)/nutrition-habits.tsx      → Lista receitas + filtros refeição  
❌ app/(tabs)/home-safety.tsx           → Checklists segurança + dicas
❌ app/(tabs)/cognitive-stimulation.tsx → Jogos memória + progress tracker
❌ app/(tabs)/mental-health.tsx         → Meditações + mood tracker
```

#### 🧩 **Componentes Específicos dos Módulos**
```
❌ components/modules/ModuleGrid.tsx      → Grid 2x3 módulos na home
❌ components/modules/VideoCard.tsx       → Card vídeo (thumb + título + duração)
❌ components/modules/VideoList.tsx       → Lista de vídeos com filtros
❌ components/modules/RecipeCard.tsx      → Card receita (img + título + dificuldade)
❌ components/modules/RecipeList.tsx      → Lista receitas com filtros
❌ components/modules/ChecklistView.tsx   → View de checklists interativos
❌ components/modules/ChecklistItem.tsx   → Item individual de checklist
❌ components/modules/GamesList.tsx       → Lista de jogos cognitivos
❌ components/modules/MeditationList.tsx  → Lista de meditações
❌ components/stats/QuickStats.tsx        → Estatísticas rápidas usuário
❌ components/filters/CategoryFilter.tsx  → Filtro por categoria
❌ components/filters/MealFilter.tsx      → Filtro por refeição
```

#### 🗄️ **Banco de Dados - Estrutura Completa a Criar**
```
❌ 6 Tabelas principais + relacionamentos + funções RPC
❌ Políticas de segurança (RLS) para cada tabela
❌ Índices para performance
❌ Triggers para auditoria
```

**OBS:** ✅ Arquivo `.env` já configurado com credenciais Supabase

---

## ✅ **CHECKLIST DE EXECUÇÃO - ORDEM DE IMPLEMENTAÇÃO**

### 🎯 **ETAPA 1: CONFIGURAÇÃO BASE (Semana 1)**

#### 📋 **1.1 - Customizar Design System**
- [x] **1.1.1** - Atualizar cores em `design-system/tokens/colors.ts`
  - [x] Substituir `primary-light: '#687789'` por `'#430593'` (Roxo)
  - [x] Substituir `secondary-light: '#22D3EE'` por `'#27CC95'` (Verde)
  - [x] Substituir `tertiary-light: '#D3545D'` por `'#FB5C3D'` (Coral)
  - [x] Adicionar `quaternary-light: '#06AAFC'` (Azul)
  - [x] Adicionar `quinary-light: '#FFA300'` (Amarelo)

- [x] **1.1.2** - Configurar fonte Poppins em `app.json`
  - [x] Adicionar `Poppins_300Light` nas fontes
  - [x] Adicionar `Poppins_400Regular` nas fontes
  - [x] Adicionar `Poppins_500Medium` nas fontes
  - [x] Adicionar `Poppins_600SemiBold` nas fontes
  - [x] Adicionar `Poppins_700Bold` nas fontes

- [x] **1.1.3** - Atualizar tipografia em `design-system/tokens/typography.ts`
  - [x] Substituir Jakarta Sans por Poppins
  - [x] Aumentar `body-lg` de 16px para 18px
  - [x] Aumentar `body-md` de 14px para 16px

- [x] **1.1.4** - Ajustar componente Button para acessibilidade
  - [x] Aumentar altura mínima md de 42px para 48px
  - [x] Aplicar fonte Poppins no Button

#### 📋 **1.2 - Criar Banco de Dados Supabase**
- [x] **1.2.1** - Criar tabela `perfis`
- [x] **1.2.2** - Criar tabela `conteudos` 
- [x] **1.2.3** - Criar tabela `atividades_usuarios`
- [x] **1.2.4** - Criar tabela `favoritos_usuarios`
- [x] **1.2.5** - Criar tabela `checklists_seguranca`
- [x] **1.2.6** - Criar tabela `dados_sensores`
- [x] **1.2.7** - Criar função RPC `get_contents_by_module`
- [x] **1.2.8** - Criar função RPC `log_user_activity`
- [x] **1.2.9** - Criar função RPC `get_user_stats`
- [x] **1.2.10** - Criar função RPC `toggle_favorite`
- [x] **1.2.11** - Criar função RPC `update_safety_checklist`
- [x] **1.2.12** - Configurar triggers de `update_updated_at_column`
- [x] **1.2.13** - Inserir dados iniciais (seeds)

---

### 🎯 **ETAPA 2: NAVEGAÇÃO E TELAS (Semana 2-3)**

#### 📋 **2.1 - Expandir Navegação**
- [ ] **2.1.1** - Atualizar `app/(tabs)/_layout.tsx` 
  - [ ] Adicionar tab `atividade-fisica`
  - [ ] Adicionar tab `habitos-alimentares`  
  - [ ] Adicionar tab `seguranca-domiciliar`
  - [ ] Adicionar tab `estimulacao-cognitiva`
  - [ ] Adicionar tab `saude-mental`
  - [ ] Configurar ícones grandes (32px+)

- [ ] **2.1.2** - Atualizar `app/(tabs)/home.tsx`
  - [ ] Criar dashboard com grid 2x3 dos módulos
  - [ ] Integrar QuickStats
  - [ ] Integrar ModuleGrid

#### 📋 **2.2 - Criar Componentes Base dos Módulos**
- [ ] **2.2.1** - `components/modules/ModuleGrid.tsx`
- [ ] **2.2.2** - `components/stats/QuickStats.tsx`
- [ ] **2.2.3** - `components/modules/VideoCard.tsx`
- [ ] **2.2.4** - `components/modules/VideoList.tsx`
- [ ] **2.2.5** - `components/modules/RecipeCard.tsx`
- [ ] **2.2.6** - `components/modules/RecipeList.tsx`
- [ ] **2.2.7** - `components/modules/ChecklistView.tsx`
- [ ] **2.2.8** - `components/modules/ChecklistItem.tsx`
- [ ] **2.2.9** - `components/modules/GamesList.tsx`
- [ ] **2.2.10** - `components/modules/MeditationList.tsx`
- [ ] **2.2.11** - `components/filters/CategoryFilter.tsx`
- [ ] **2.2.12** - `components/filters/MealFilter.tsx`

#### 📋 **2.3 - Criar 5 Telas dos Módulos**
- [ ] **2.3.1** - `app/(tabs)/atividade-fisica.tsx`
  - [ ] Implementar lista de vídeos
  - [ ] Integrar filtros de categoria
  - [ ] Conectar com Supabase

- [ ] **2.3.2** - `app/(tabs)/habitos-alimentares.tsx`
  - [ ] Implementar lista de receitas
  - [ ] Integrar filtros de refeição
  - [ ] Conectar com Supabase

- [ ] **2.3.3** - `app/(tabs)/seguranca-domiciliar.tsx`
  - [ ] Implementar checklists interativos
  - [ ] Integrar dicas de segurança
  - [ ] Conectar com Supabase

- [ ] **2.3.4** - `app/(tabs)/estimulacao-cognitiva.tsx`
  - [ ] Implementar lista de jogos
  - [ ] Integrar progress tracker
  - [ ] Conectar com Supabase

- [ ] **2.3.5** - `app/(tabs)/saude-mental.tsx`
  - [ ] Implementar lista de meditações
  - [ ] Integrar mood tracker
  - [ ] Conectar com Supabase

---

### 🎯 **ETAPA 3: INTEGRAÇÃO E FUNCIONALIDADES (Semana 4)**

#### 📋 **3.1 - Sistema de Favoritos**
- [ ] **3.1.1** - Implementar toggle de favoritos em todos os cards
- [ ] **3.1.2** - Criar tela de favoritos
- [ ] **3.1.3** - Sincronização com Supabase

#### 📋 **3.2 - Sistema de Tracking**
- [ ] **3.2.1** - Implementar tracking de tempo de uso
- [ ] **3.2.2** - Implementar progresso de vídeos
- [ ] **3.2.3** - Implementar estatísticas do usuário

#### 📋 **3.3 - Integração YouTube**
- [ ] **3.3.1** - Player de vídeo integrado
- [ ] **3.3.2** - Controles de reprodução
- [ ] **3.3.3** - Tracking de progresso de vídeo

#### 📋 **3.4 - Sensores (Opcional)**
- [ ] **3.4.1** - Integrar Expo Pedometer
- [ ] **3.4.2** - Contador de passos
- [ ] **3.4.3** - Armazenamento de dados de sensor

---

### 🎯 **ETAPA 4: POLIMENTO E TESTES (Semana 5-6)**

#### 📋 **4.1 - Acessibilidade**
- [ ] **4.1.1** - Testar navegação por voz
- [ ] **4.1.2** - Testar alto contraste
- [ ] **4.1.3** - Testar tamanhos de fonte
- [ ] **4.1.4** - Testar com usuários 60+

#### 📋 **4.2 - Performance**
- [ ] **4.2.1** - Otimizar carregamento de imagens
- [ ] **4.2.2** - Otimizar consultas Supabase
- [ ] **4.2.3** - Testar em dispositivos antigos
- [ ] **4.2.4** - Implementar cache local

#### 📋 **4.3 - Testes Finais**
- [ ] **4.3.1** - Teste completo do fluxo de usuário
- [ ] **4.3.2** - Teste de todos os módulos
- [ ] **4.3.3** - Teste de sincronização offline/online
- [ ] **4.3.4** - Teste de autenticação
- [ ] **4.3.5** - Teste de responsividade

---

### FASE 1: Customização para Mais 60 Saúde

#### Task 1.1: Adaptar Design System Existente
```markdown
OBJETIVO: Customizar o design system existente para o público 60+

⚠️  PROJETO JÁ TEM:
- ✅ Design system completo em design-system/tokens/
- ✅ Componentes prontos (Button, Input, etc.)
- ✅ Tipografia Plus Jakarta Sans configurada
- ✅ Sistema de temas claro/escuro

🔄 MODIFICAÇÕES ESPECÍFICAS POR ARQUIVO:

📁 design-system/tokens/colors.ts:
ATUAL: 'primary-light': '#687789'
NOVO:  'primary-light': '#430593' (Roxo Mais 60)

ATUAL: 'secondary-light': '#22D3EE'  
NOVO:  'secondary-light': '#27CC95' (Verde Mais 60)

ATUAL: 'tertiary-light': '#D3545D'
NOVO:  'tertiary-light': '#FB5C3D' (Coral Mais 60)

+ ADICIONAR: 'quaternary-light': '#06AAFC' (Azul Mais 60)
+ ADICIONAR: 'quinary-light': '#FFA300' (Amarelo Mais 60)
+ ADICIONAR: 'neutral-light': '#E8F3F5' (Cinza Claro)

📁 design-system/tokens/typography.ts:
ATUAL: 'jakarta-regular': 'PlusJakartaSans_400Regular'
NOVO:  'poppins-regular': 'Poppins_400Regular'

ATUAL: 'body-lg': { size: '16px', lineHeight: '24px' }
NOVO:  'body-lg': { size: '18px', lineHeight: '26px' } (mínimo para idosos)

ATUAL: 'body-md': { size: '14px', lineHeight: '20px' }
NOVO:  'body-md': { size: '16px', lineHeight: '22px' }

📁 app.json:
ADICIONAR na seção expo.font.google:
+ "Poppins_300Light"
+ "Poppins_400Regular" 
+ "Poppins_500Medium"
+ "Poppins_600SemiBold"
+ "Poppins_700Bold"

📁 components/buttons/Button.tsx:
ATUAL: height mínima md: 42px
NOVO:  height mínima md: 48px (acessibilidade idosos)

ATUAL: fontSize body-lg: 16px
NOVO:  fontSize body-lg: 18px

ATUAL: fontFamily: jakarta-regular
NOVO:  fontFamily: poppins-regular

CRITÉRIOS DE ACESSIBILIDADE:
- Botões altura mínima 48px ✅
- Textos tamanho mínimo 18px ✅  
- Contraste mínimo AA (4.5:1) ✅
- Alto contraste para modo específico idosos
```

#### Task 1.2: Criar Telas dos Módulos
```markdown
OBJETIVO: Criar as 5 telas principais dos módulos

⚠️  PROJETO JÁ TEM:
- ✅ Navegação Stack e Tab configurada
- ✅ Estrutura de telas em app/(tabs)/
- ✅ Autenticação funcionando
- ✅ Componentes reutilizáveis (Button, Header, etc.)

🔄 MODIFICAÇÕES ESPECÍFICAS POR ARQUIVO:

📁 app/(tabs)/_layout.tsx:
ATUAL: 2 tabs (home, dev)
NOVO: 6 tabs total:
```tsx
<Tabs.Screen name="home" options={{title: 'Início'}} />
<Tabs.Screen name="atividade-fisica" options={{title: 'Atividade Física'}} />
<Tabs.Screen name="habitos-alimentares" options={{title: 'Alimentação'}} />
<Tabs.Screen name="seguranca-domiciliar" options={{title: 'Segurança'}} />
<Tabs.Screen name="estimulacao-cognitiva" options={{title: 'Mente'}} />
<Tabs.Screen name="saude-mental" options={{title: 'Bem-estar'}} />
```

📁 app/(tabs)/home.tsx:
ATUAL: Tela simples
NOVO: Dashboard com grid 2x3 dos módulos:
```tsx
import { ModuleGrid } from '@/components/modules/ModuleGrid';
import { QuickStats } from '@/components/stats/QuickStats';
import { FavoritesList } from '@/components/favorites/FavoritesList';

// Layout: Header + Stats + Grid Módulos + Favoritos
```

📁 CRIAR: app/(tabs)/atividade-fisica.tsx:
```tsx
import { VideoList } from '@/components/modules/VideoList';
import { CategoryFilter } from '@/components/filters/CategoryFilter';
// Categorias: Alongamento, Caminhada, Fortalecimento
```

📁 CRIAR: app/(tabs)/habitos-alimentares.tsx:
```tsx
import { RecipeList } from '@/components/modules/RecipeList';
import { MealFilter } from '@/components/filters/MealFilter';
// Categorias: Café, Almoço, Jantar, Lanche
```

📁 CRIAR: app/(tabs)/seguranca-domiciliar.tsx:
```tsx
import { ChecklistView } from '@/components/modules/ChecklistView';
import { SafetyTips } from '@/components/modules/SafetyTips';
// Checklists interativos + Dicas de segurança
```

📁 CRIAR: app/(tabs)/estimulacao-cognitiva.tsx:
```tsx
import { GamesList } from '@/components/modules/GamesList';
import { ProgressTracker } from '@/components/modules/ProgressTracker';
// Jogos de memória + Exercícios cognitivos
```

📁 CRIAR: app/(tabs)/saude-mental.tsx:
```tsx
import { MeditationList } from '@/components/modules/MeditationList';
import { MoodTracker } from '@/components/modules/MoodTracker';
// Meditações guiadas + Diário de humor
```

COMPONENTES A CRIAR:
- components/modules/ModuleGrid.tsx (grid 2x3 com ícones grandes)
- components/modules/VideoCard.tsx (thumbnail + título + duração)
- components/modules/RecipeCard.tsx (imagem + título + dificuldade)
- components/modules/ChecklistItem.tsx (checkbox + descrição)
- components/stats/QuickStats.tsx (tempo uso + atividades)

CRITÉRIOS DE ACESSIBILIDADE:
- Ícones 32px+ nas tabs ✅
- Labels sempre visíveis ✅
- Botões 48px+ altura ✅
- Textos 18px+ tamanho ✅
- Navegação máx 3 cliques ✅
```

### FASE 2: Telas Fundamentais

#### Task 2.1: Onboarding
```markdown
OBJETIVO: Criar fluxo de primeiro acesso

COMPONENTES:
- OnboardingCarousel
- PermissionRequest
- AccessibilitySetup

TELAS:
- screens/Onboarding/Welcome.tsx
- screens/Onboarding/Permissions.tsx
- screens/Onboarding/Accessibility.tsx

FUNCIONALIDADES:
- Slider com 3 telas
- Solicitação de permissões (câmera, localização, sensores)
- Configuração inicial de acessibilidade
- Skip opcional na última tela
```

#### Task 2.2: Home Screen
```markdown
OBJETIVO: Tela principal com acesso aos módulos

COMPONENTES:
- HeaderStats (tempo uso, atividades do dia)
- ModuleGrid (5 módulos em grid 2x3)
- QuickAccess (favoritos recentes)

LAYOUT:
- Header com saudação personalizada
- Grid de módulos com ícones grandes
- Seção de acesso rápido
- Bottom tab navigation

FUNCIONALIDADES:
- Exibir estatísticas básicas
- Navegação para módulos
- Acesso rápido a conteúdos favoritos
```

### FASE 3: Módulos de Conteúdo

#### Task 3.1: Módulo Atividade Física
```markdown
OBJETIVO: Repositório de vídeos de exercícios

TELAS:
- screens/PhysicalActivity/Index.tsx
- screens/PhysicalActivity/VideoList.tsx
- screens/PhysicalActivity/VideoPlayer.tsx

COMPONENTES:
- VideoCard (thumbnail, título, duração, descrição)
- CategoryFilter (Alongamento, Caminhada, Fortalecimento)
- ProgressTracker (vídeos assistidos)

FUNCIONALIDADES:
- Listar vídeos por categoria
- Player integrado do YouTube
- Sistema de favoritos
- Tracking de progresso
- Pedômetro integrado (Expo Sensors)
```

#### Task 3.2: Módulo Hábitos Alimentares
```markdown
OBJETIVO: Receitas saudáveis e dicas nutricionais

TELAS:
- screens/NutritionHabits/Index.tsx
- screens/NutritionHabits/RecipeList.tsx
- screens/NutritionHabits/RecipeDetail.tsx

COMPONENTES:
- RecipeCard (imagem, título, dificuldade, tempo)
- IngredientsList
- ShoppingListGenerator

FUNCIONALIDADES:
- Categorização por refeição
- Lista de ingredientes
- Sugestão de lista de compras
- Dicas de substituição
```

#### Task 3.3: Módulo Segurança Domiciliar
```markdown
OBJETIVO: Prevenção de acidentes domésticos

TELAS:
- screens/HomeSafety/Index.tsx
- screens/HomeSafety/Checklist.tsx
- screens/HomeSafety/EmergencyGuide.tsx

COMPONENTES:
- ChecklistItem (com estado checked/unchecked)
- SafetyTipCard
- EmergencyContact

FUNCIONALIDADES:
- Checklists interativos
- Progresso de implementação
- Guia de primeiros socorros
- Contatos de emergência
```

#### Task 3.4: Módulo Estimulação Cognitiva
```markdown
OBJETIVO: Exercícios para memória e raciocínio

TELAS:
- screens/CognitiveStimulation/Index.tsx
- screens/CognitiveStimulation/GamesList.tsx
- screens/CognitiveStimulation/BrainExercise.tsx

COMPONENTES:
- GameCard (tipo, dificuldade, benefícios)
- ScoreTracker
- ExerciseTimer

FUNCIONALIDADES:
- Jogos simples integrados
- Exercícios de memória
- Tracking de progresso cognitivo
- Links para jogos externos
```

#### Task 3.5: Módulo Saúde Mental
```markdown
OBJETIVO: Bem-estar emocional e relaxamento

TELAS:
- screens/MentalHealth/Index.tsx
- screens/MentalHealth/MeditationList.tsx
- screens/MentalHealth/RelaxationPlayer.tsx

COMPONENTES:
- MeditationCard (duração, tipo, benefícios)
- RelaxationTimer
- MoodTracker

FUNCIONALIDADES:
- Meditações guiadas
- Exercícios de respiração
- Áudios para dormir
- Diário de humor simples
```

### FASE 4: Funcionalidades Avançadas

#### Task 4.1: Sistema de Monitoramento
```markdown
OBJETIVO: Analytics e progresso do usuário

TABELAS SUPABASE:
- user_activities (user_id, module, activity_type, duration, created_at)
- video_progress (user_id, video_id, watch_time, completed)
- daily_stats (user_id, date, total_time, modules_accessed)

COMPONENTES:
- StatsCard (métricas visuais)
- ProgressChart (gráfico simples)
- ActivityFeed (últimas atividades)

FUNCIONALIDADES:
- Tempo de uso por módulo
- Vídeos assistidos/favoritados
- Dados dos sensores (passos, movimento)
- Relatórios semanais simples
```

#### Task 4.2: Integração Sensores
```markdown
OBJETIVO: Utilizar sensores do dispositivo

SENSORES:
- Acelerômetro (detecção de movimento)
- Pedômetro (contagem de passos)
- Bateria (alertas de bateria baixa)

IMPLEMENTAÇÃO:
- Expo Sensors para acelerômetro
- Expo Pedometer para passos
- Expo Battery para nível de bateria

FUNCIONALIDADES:
- Contador de passos diário
- Detecção básica de atividade
- Alertas de bateria baixa
- Dados armazenados localmente (AsyncStorage)
```

#### Task 4.3: Sistema de Favoritos
```markdown
OBJETIVO: Acesso rápido ao conteúdo preferido

TABELAS SUPABASE:
- user_favorites (user_id, content_type, content_id, created_at)

FUNCIONALIDADES:
- Favoritar/desfavoritar conteúdos
- Lista unificada de favoritos
- Acesso rápido na home
- Sincronização com Supabase
```

### FASE 5: Configurações e Acessibilidade

#### Task 5.1: Tela de Configurações
```markdown
OBJETIVO: Personalização da experiência

TELAS:
- screens/Settings/Index.tsx
- screens/Settings/Accessibility.tsx
- screens/Settings/Profile.tsx

CONFIGURAÇÕES:
- Tamanho da fonte (Grande, Muito Grande)
- Modo alto contraste
- Ativação/desativação de sensores
- Notificações
- Dados pessoais básicos
```

#### Task 5.2: Acessibilidade
```markdown
OBJETIVO: Máxima acessibilidade para idosos

IMPLEMENTAÇÕES:
- Text-to-Speech opcional
- Gestos simplificados
- Navegação por voz básica (opcional)
- Leitura automática de botões
- Confirmações duplas para ações críticas
```

## 🗄️ ESTRUTURA COMPLETA DO BANCO DE DADOS (SUPABASE)

### ⚠️ **IMPORTANTE: CONFIGURAÇÃO JÁ PRONTA**
```
✅ Arquivo .env configurado com credenciais Supabase
✅ lib/supabase.ts configurado e funcionando  
✅ Autenticação (auth.users) já configurada
✅ Sistema de usuários já implementado
```

### 📋 **TABELAS A CRIAR (6 principais + relacionamentos)**

#### 1️⃣ **TABELA: perfis** (Perfil Estendido do Usuário)
```sql
CREATE TABLE public.perfis (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  nome_completo TEXT NOT NULL,
  data_nascimento DATE,
  telefone TEXT,
  configuracoes_acessibilidade JSONB DEFAULT '{}',
  preferencias JSONB DEFAULT '{}', -- preferências de conteúdo
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Política RLS
ALTER TABLE perfis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuários podem ver próprio perfil" ON perfis FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Usuários podem atualizar próprio perfil" ON perfis FOR UPDATE USING (auth.uid() = id);
```

#### 2️⃣ **TABELA: conteudos** (Conteúdos dos Módulos)
```sql
CREATE TABLE public.conteudos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  modulo TEXT NOT NULL, -- 'atividade_fisica', 'habitos_alimentares', 'seguranca_domiciliar', 'estimulacao_cognitiva', 'saude_mental'
  categoria TEXT, -- subcategoria dentro do módulo
  tipo_conteudo TEXT NOT NULL, -- 'video', 'receita', 'checklist', 'jogo', 'meditacao'
  
  -- Para vídeos
  id_youtube TEXT,
  duracao_segundos INTEGER,
  url_thumbnail TEXT,
  
  -- Para receitas
  ingredientes JSONB,
  instrucoes JSONB,
  nivel_dificuldade TEXT, -- 'facil', 'medio', 'dificil'
  tempo_preparo_minutos INTEGER,
  
  -- Para checklists
  itens_checklist JSONB,
  
  -- Para jogos
  configuracao_jogo JSONB,
  
  -- Para meditações
  url_audio TEXT,
  
  -- Metadados
  ativo BOOLEAN DEFAULT true,
  ordem_classificacao INTEGER DEFAULT 0,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_conteudos_modulo ON conteudos(modulo);
CREATE INDEX idx_conteudos_categoria ON conteudos(categoria);
CREATE INDEX idx_conteudos_tipo ON conteudos(tipo_conteudo);
CREATE INDEX idx_conteudos_ativo ON conteudos(ativo);

-- Política RLS (conteúdos são públicos para usuários autenticados)
ALTER TABLE conteudos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuários autenticados podem ver conteúdos" ON conteudos FOR SELECT TO authenticated USING (ativo = true);
```

#### 3️⃣ **TABELA: atividades_usuarios** (Atividades do Usuário)
```sql
CREATE TABLE public.atividades_usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_usuario UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  id_conteudo UUID REFERENCES conteudos(id) ON DELETE CASCADE,
  tipo_atividade TEXT NOT NULL, -- 'visualizado', 'completado', 'iniciado', 'pausado'
  
  -- Dados específicos da atividade
  duracao_segundos INTEGER DEFAULT 0, -- tempo gasto
  percentual_progresso INTEGER DEFAULT 0, -- progresso (0-100)
  dados_sessao JSONB DEFAULT '{}', -- dados específicos da sessão
  
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_atividades_usuarios_id_usuario ON atividades_usuarios(id_usuario);
CREATE INDEX idx_atividades_usuarios_id_conteudo ON atividades_usuarios(id_conteudo);
CREATE INDEX idx_atividades_usuarios_tipo ON atividades_usuarios(tipo_atividade);
CREATE INDEX idx_atividades_usuarios_data ON atividades_usuarios(criado_em);

-- Política RLS
ALTER TABLE atividades_usuarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuários podem gerenciar próprias atividades" ON atividades_usuarios FOR ALL USING (auth.uid() = id_usuario);
```

#### 4️⃣ **TABELA: favoritos_usuarios** (Favoritos do Usuário)
```sql
CREATE TABLE public.favoritos_usuarios (
  id_usuario UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  id_conteudo UUID REFERENCES conteudos(id) ON DELETE CASCADE,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (id_usuario, id_conteudo)
);

-- Índices para performance
CREATE INDEX idx_favoritos_usuarios_id_usuario ON favoritos_usuarios(id_usuario);
CREATE INDEX idx_favoritos_usuarios_id_conteudo ON favoritos_usuarios(id_conteudo);

-- Política RLS
ALTER TABLE favoritos_usuarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuários podem gerenciar próprios favoritos" ON favoritos_usuarios FOR ALL USING (auth.uid() = id_usuario);
```

#### 5️⃣ **TABELA: checklists_seguranca** (Checklists de Segurança Personalizados)
```sql
CREATE TABLE public.checklists_seguranca (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_usuario UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo_checklist TEXT NOT NULL, -- 'seguranca_domiciliar', 'medicamentos', 'contatos_emergencia'
  titulo TEXT NOT NULL,
  itens JSONB NOT NULL, -- array de objetos: [{"id": "1", "texto": "...", "concluido": false, "concluido_em": null}]
  percentual_conclusao INTEGER DEFAULT 0,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_checklists_seguranca_id_usuario ON checklists_seguranca(id_usuario);
CREATE INDEX idx_checklists_seguranca_tipo ON checklists_seguranca(tipo_checklist);

-- Política RLS
ALTER TABLE checklists_seguranca ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuários podem gerenciar próprios checklists" ON checklists_seguranca FOR ALL USING (auth.uid() = id_usuario);
```

#### 6️⃣ **TABELA: dados_sensores** (Dados dos Sensores)
```sql
CREATE TABLE public.dados_sensores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_usuario UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo_sensor TEXT NOT NULL, -- 'passos', 'nivel_atividade', 'nivel_bateria'
  valor NUMERIC NOT NULL,
  unidade TEXT, -- 'passos', 'percentual', 'minutos'
  metadados JSONB DEFAULT '{}', -- dados extras do sensor
  registrado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_dados_sensores_id_usuario ON dados_sensores(id_usuario);
CREATE INDEX idx_dados_sensores_tipo ON dados_sensores(tipo_sensor);
CREATE INDEX idx_dados_sensores_data ON dados_sensores(registrado_em);

-- Política RLS
ALTER TABLE dados_sensores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuários podem gerenciar próprios dados de sensor" ON dados_sensores FOR ALL USING (auth.uid() = id_usuario);
```

---

### 🔧 **FUNÇÕES RPC A CRIAR (5 principais)**

#### 1️⃣ **Buscar conteúdos por módulo**
```sql
CREATE OR REPLACE FUNCTION obter_conteudos_por_modulo(
  nome_modulo TEXT,
  filtro_categoria TEXT DEFAULT NULL,
  id_usuario UUID DEFAULT auth.uid()
)
RETURNS TABLE(
  id UUID,
  titulo TEXT,
  descricao TEXT,
  modulo TEXT,
  categoria TEXT,
  tipo_conteudo TEXT,
  id_youtube TEXT,
  duracao_segundos INTEGER,
  url_thumbnail TEXT,
  nivel_dificuldade TEXT,
  favoritado BOOLEAN,
  progresso_usuario INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.titulo,
    c.descricao,
    c.modulo,
    c.categoria,
    c.tipo_conteudo,
    c.id_youtube,
    c.duracao_segundos,
    c.url_thumbnail,
    c.nivel_dificuldade,
    (fu.id_usuario IS NOT NULL) as favoritado,
    COALESCE(MAX(au.percentual_progresso), 0) as progresso_usuario
  FROM conteudos c
  LEFT JOIN favoritos_usuarios fu ON c.id = fu.id_conteudo AND fu.id_usuario = id_usuario
  LEFT JOIN atividades_usuarios au ON c.id = au.id_conteudo AND au.id_usuario = id_usuario
  WHERE c.modulo = nome_modulo 
    AND c.ativo = true
    AND (filtro_categoria IS NULL OR c.categoria = filtro_categoria)
  GROUP BY c.id, c.titulo, c.descricao, c.modulo, c.categoria, c.tipo_conteudo, 
           c.id_youtube, c.duracao_segundos, c.url_thumbnail, c.nivel_dificuldade, fu.id_usuario
  ORDER BY c.ordem_classificacao, c.criado_em;
END;
$$;
```

#### 2️⃣ **Registrar atividade do usuário**
```sql
CREATE OR REPLACE FUNCTION registrar_atividade_usuario(
  id_conteudo UUID,
  tipo_atividade TEXT,
  duracao_segundos INTEGER DEFAULT 0,
  percentual_progresso INTEGER DEFAULT 0,
  dados_sessao JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  id_atividade UUID;
  id_usuario UUID := auth.uid();
BEGIN
  -- Inserir nova atividade
  INSERT INTO atividades_usuarios (id_usuario, id_conteudo, tipo_atividade, duracao_segundos, percentual_progresso, dados_sessao)
  VALUES (id_usuario, id_conteudo, tipo_atividade, duracao_segundos, percentual_progresso, dados_sessao)
  RETURNING id INTO id_atividade;
  
  RETURN id_atividade;
END;
$$;
```

#### 3️⃣ **Obter estatísticas do usuário**
```sql
CREATE OR REPLACE FUNCTION obter_estatisticas_usuario(id_usuario UUID DEFAULT auth.uid())
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  estatisticas JSON;
BEGIN
  SELECT json_build_object(
    'total_atividades', COUNT(*),
    'tempo_total_minutos', COALESCE(SUM(duracao_segundos), 0) / 60,
    'modulos_acessados', COUNT(DISTINCT c.modulo),
    'total_favoritos', (SELECT COUNT(*) FROM favoritos_usuarios WHERE id_usuario = id_usuario),
    'conteudos_completados', COUNT(*) FILTER (WHERE au.percentual_progresso >= 100),
    'atividades_semanais', (
      SELECT COUNT(*) 
      FROM atividades_usuarios au2 
      WHERE au2.id_usuario = id_usuario 
        AND au2.criado_em >= NOW() - INTERVAL '7 days'
    ),
    'estatisticas_modulos', json_agg(
      json_build_object(
        'modulo', c.modulo,
        'contagem_atividades', COUNT(*),
        'tempo_total_minutos', COALESCE(SUM(au.duracao_segundos), 0) / 60
      )
    )
  ) INTO estatisticas
  FROM atividades_usuarios au
  JOIN conteudos c ON au.id_conteudo = c.id
  WHERE au.id_usuario = id_usuario
  GROUP BY c.modulo;
  
  RETURN COALESCE(estatisticas, '{}'::json);
END;
$$;
```

#### 4️⃣ **Gerenciar favoritos**
```sql
CREATE OR REPLACE FUNCTION alternar_favorito(id_conteudo UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  id_usuario UUID := auth.uid();
  favoritado BOOLEAN;
BEGIN
  -- Verificar se já está nos favoritos
  SELECT EXISTS(
    SELECT 1 FROM favoritos_usuarios 
    WHERE id_usuario = id_usuario AND id_conteudo = id_conteudo
  ) INTO favoritado;
  
  IF favoritado THEN
    -- Remover dos favoritos
    DELETE FROM favoritos_usuarios 
    WHERE id_usuario = id_usuario AND id_conteudo = id_conteudo;
    RETURN false;
  ELSE
    -- Adicionar aos favoritos
    INSERT INTO favoritos_usuarios (id_usuario, id_conteudo) 
    VALUES (id_usuario, id_conteudo);
    RETURN true;
  END IF;
END;
$$;
```

#### 5️⃣ **Atualizar checklist de segurança**
```sql
CREATE OR REPLACE FUNCTION atualizar_checklist_seguranca(
  id_checklist UUID,
  dados_itens JSONB
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  id_usuario UUID := auth.uid();
  percentual_conclusao INTEGER;
  total_itens INTEGER;
  itens_concluidos INTEGER;
BEGIN
  -- Calcular percentual de conclusão
  SELECT 
    jsonb_array_length(dados_itens),
    (SELECT COUNT(*) FROM jsonb_array_elements(dados_itens) item WHERE (item->>'concluido')::boolean = true)
  INTO total_itens, itens_concluidos;
  
  percentual_conclusao := CASE 
    WHEN total_itens = 0 THEN 0 
    ELSE (itens_concluidos * 100 / total_itens) 
  END;
  
  -- Atualizar checklist
  UPDATE checklists_seguranca 
  SET 
    itens = dados_itens,
    percentual_conclusao = percentual_conclusao,
    atualizado_em = NOW()
  WHERE id = id_checklist AND id_usuario = id_usuario;
  
  RETURN FOUND;
END;
$$;
```

---

### 🔒 **TRIGGERS E AUDITORIA**

#### Trigger para atualizar atualizado_em automaticamente
```sql
CREATE OR REPLACE FUNCTION atualizar_coluna_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger nas tabelas que têm atualizado_em
CREATE TRIGGER atualizar_perfis_atualizado_em BEFORE UPDATE ON perfis FOR EACH ROW EXECUTE FUNCTION atualizar_coluna_atualizado_em();
CREATE TRIGGER atualizar_conteudos_atualizado_em BEFORE UPDATE ON conteudos FOR EACH ROW EXECUTE FUNCTION atualizar_coluna_atualizado_em();
CREATE TRIGGER atualizar_atividades_usuarios_atualizado_em BEFORE UPDATE ON atividades_usuarios FOR EACH ROW EXECUTE FUNCTION atualizar_coluna_atualizado_em();
CREATE TRIGGER atualizar_checklists_seguranca_atualizado_em BEFORE UPDATE ON checklists_seguranca FOR EACH ROW EXECUTE FUNCTION atualizar_coluna_atualizado_em();
```

---

### 📊 **DADOS INICIAIS (SEEDS) A INSERIR**

#### Conteúdos exemplo para cada módulo
```sql
-- Inserir conteúdos de exemplo (será feito via interface admin ou script)
INSERT INTO conteudos (titulo, descricao, modulo, categoria, tipo_conteudo, id_youtube, duracao_segundos, url_thumbnail) VALUES
('Alongamento Matinal', 'Exercícios suaves para começar o dia', 'atividade_fisica', 'alongamento', 'video', 'dQw4w9WgXcQ', 600, 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'),
('Receita: Sopa Nutritiva', 'Sopa rica em vitaminas para idosos', 'habitos_alimentares', 'almoco', 'receita', NULL, NULL, 'https://example.com/sopa.jpg'),
('Checklist: Segurança no Banheiro', 'Itens importantes para evitar quedas', 'seguranca_domiciliar', 'banheiro', 'checklist', NULL, NULL, NULL);
-- ... mais conteúdos
```

## 🚀 Estratégia de Implementação

### Cronograma Sugerido (Adaptado ao Projeto Base)
1. **Semana 1:** Customização Design System (cores, fontes, acessibilidade)
2. **Semana 2-3:** Criação das 5 telas dos módulos + dashboard
3. **Semana 4:** Integração com Supabase + funcionalidades específicas
4. **Semana 5:** Configurações, onboarding e ajustes finais
5. **Semana 6:** Testes de usabilidade, performance e refinamentos

### Prioridades de Desenvolvimento (Baseado no que já existe)
1. **Crítico:** Customizar design system existente, criar telas dos módulos
2. **Importante:** Integração Supabase, sistema de conteúdos, favoritos
3. **Desejável:** Sensores, analytics detalhados, funcionalidades avançadas

### Testes e Validação
- Testes com usuários 60+ em cada fase
- Validação de acessibilidade
- Performance em dispositivos mais antigos
- Testes de usabilidade específicos para idosos

## 📋 Checklist Final

### Antes do Deploy
- [ ] Todas as fontes carregam corretamente
- [ ] Alto contraste funciona em todas as telas
- [ ] Botões têm tamanho mínimo adequado
- [ ] Navegação é intuitiva (máximo 3 cliques)
- [ ] Textos são legíveis (tamanho mínimo)
- [ ] Feedback visual em todas as interações
- [ ] Dados são persistidos corretamente
- [ ] Integração YouTube funciona offline/online
- [ ] Sensores coletam dados adequadamente
- [ ] Performance adequada em dispositivos Android 8+/iOS 12+

### Pós-Launch
- [ ] Monitoramento de crashes
- [ ] Analytics de uso por módulo
- [ ] Feedback dos usuários
- [ ] Ajustes de acessibilidade conforme necessário

---

Este PRD fornece uma base sólida para desenvolvimento com Cursor AI, mantendo foco na simplicidade e acessibilidade para o público 60+.
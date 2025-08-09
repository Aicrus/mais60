# PRD – Mais 60 Saúde (versão objetiva)

## 1) Visão rápida
- **Nome**: Mais 60 Saúde
- **Público‑alvo**: Pessoas idosas (60+)
- **Objetivo**: App simples e acessível para apoiar a saúde em 5 áreas, via conteúdo multimídia e monitoramento básico de uso/atividade.

## 2) Escopo funcional (pedido do cliente)

### 2.1 Módulos
1. **Atividade Física**
   - Conteúdo: vídeos do YouTube (exercícios leves, alongamentos, yoga adaptada, caminhadas guiadas, baixo impacto)
   - Funcionalidades: categorias; favoritar vídeos; descrição breve dos benefícios
2. **Hábitos Alimentares**
   - Conteúdo: vídeos do YouTube (receitas fáceis, dicas de nutrição para idosos)
   - Funcionalidades: categorias por refeição; dicas de preparo/substituições; listas de compras sugeridas
3. **Segurança no Domicílio**
   - Conteúdo: vídeos do YouTube (prevenção de quedas, segurança cozinha/banheiro, o que fazer em emergências)
   - Funcionalidades: checklists interativos; dicas visuais de organização; informações básicas de primeiros socorros (com ressalva de procurar ajuda profissional)
4. **Estimulação Cognitiva**
   - Conteúdo: vídeos do YouTube (exercícios de memória, lógica, atenção)
   - Funcionalidades: links para jogos simples (quando possível); sugestões de atividades offline; exercícios guiados por vídeo
5. **Saúde Mental**
   - Conteúdo: vídeos do YouTube (meditações guiadas, respiração, relaxamento, gestão de estresse)
   - Funcionalidades: áudios/vídeos de relaxamento; mensagens motivacionais; lembretes de pausas/autocuidado

### 2.2 Monitoramento e dados
- Registros de atividade: o que foi visto, por quanto tempo, frequência
- Progresso (opcional): marcar como assistido/concluído
- Tempo de uso: total por dia/semana + resumo simples
- Sensores (com permissão): pedômetro/acelerômetro (passos); giroscópio (tendências); localização (opcional, caminhadas); bateria (alertas)

### 2.3 Design e acessibilidade
- Fontes grandes, alto contraste, ícones claros, botões grandes, poucos toques, feedback visual
- Acessibilidade: modo alto contraste; considerar Text‑to‑Speech

### 2.4 Conteúdo YouTube e curadoria
- Vídeos não são armazenados; apenas incorporados/linked (YouTube público)
- Curadoria pela Mais60 para adequação e segurança

### 2.5 Considerações técnicas
- Integração YouTube (incorporação/iframe)
- Coleta/visualização de métricas básicas de uso
- Acesso a sensores com permissão e privacidade
- Listagem/repositório de conteúdos com categorização

## 3) Status de implementação (feito vs faltando)

### 3.0 Resumo do status (rápido)
- **Feito (high‑level)**:
  - Navegação principal (tabs `home` e `perfil`)
  - Rota genérica dos módulos + `components/modules/ModuleScreen.tsx`
  - Onboarding básico e redirecionamento inicial
  - Design tokens (cores/tipografia)
  - Supabase configurado (auth e cliente)
  - Listas/telas base dos 5 módulos

- **Faltando (consolidado)**:
  - Player de vídeo YouTube funcional (integração no `app/player/video/[id].tsx`)
  - Favoritar vídeos (Atividade Física)
  - Dicas de substituição/preparo e lista de compras (Hábitos Alimentares)
  - Dicas visuais de organização e primeiros socorros básicos (Segurança no Domicílio)
  - Links para jogos simples e sugestões offline (Estimulação Cognitiva)
  - Player de áudio acessível (frases motivacionais) e lembretes de autocuidado (Saúde Mental)
  - Registro de visualizações/tempo e marcação de progresso
  - Tempo de uso diário/semanal com resumo visual
  - Integração de sensores (pedômetro/acelerômetro, giroscópio, bateria, localização opcional)
  - Tabelas mínimas (conteúdos, favoritos, atividades) e RPCs simples (listar, toggle favorito, log de atividade, stats)
  - Alto contraste dedicado e revisão de tamanhos de toque; considerar Text‑to‑Speech

> Legenda a seguir: `[x]` feito · `[ ]` faltando

### 3.1 Infra e navegação
- [x] Navegação principal com tabs `home` e `perfil` (`app/(tabs)/_layout.tsx`)
- [x] Rota genérica dos módulos: `app/modulo/[module].tsx` + `components/modules/ModuleScreen.tsx`
- [x] Onboarding básico e redirecionamento inicial (`app/index.tsx`)
- [x] Design tokens (cores da marca) e tipografia Poppins
- [x] Botão: altura mínima md 48px (está 42px)

### 3.2 Módulos – UI base e listas
- Atividade Física:
  - [x] Lista/filtros (protótipo) com cards de vídeo
  - [ ] Integração YouTube no player (atual placeholder)
  - [ ] Favoritar vídeos
  - [x] Descrições breves nos cards
- Hábitos Alimentares:
  - [x] Lista por refeição (MealFilter + RecipeList)
  - [ ] Dicas de substituição / preparo
  - [ ] Lista de compras sugerida
- Segurança no Domicílio:
  - [x] Checklists interativos (ChecklistView + ChecklistItem)
  - [ ] Dicas visuais de organização
  - [ ] Informações básicas de primeiros socorros (com ressalva)
- Estimulação Cognitiva:
  - [x] Lista de atividades/jogos (GamesList)
  - [ ] Links para jogos simples (quando possível)
  - [ ] Sugestões offline (leitura/socialização)
- Saúde Mental:
  - [x] Lista de meditações/áudios (MeditationList)
  - [ ] Player de áudio com frases motivacionais
  - [ ] Lembretes de pausas/autocuidado

### 3.3 Monitoramento, sensores e métricas
- [ ] Registro de visualizações e tempo por conteúdo
- [ ] Progresso (assistido/concluído)
- [ ] Tempo de uso diário/semanal com resumo visual
- [ ] Integração sensores (pedômetro, giroscópio, bateria, localização opcional)

### 3.4 Back‑end/dados (mínimo para o escopo)
- [x] Supabase configurado (auth e cliente)
- [ ] Tabelas mínimas: conteúdos, favoritos, atividades (apenas o necessário para o escopo)
- [ ] Endpoints/RPC simples: listar por módulo/categoria; toggle favorito; log de atividade; stats básicas

## 4) Entregáveis por fase (curto e direto)

### Fase A – Fundamentos UI/Conteúdo
- [x] Home com acesso aos 5 módulos
- [x] Telas base dos 5 módulos (listas e filtros)
- [ ] Player de vídeo YouTube funcional
 - [ ] Player de áudio com controles acessíveis

### Fase B – Favoritos e Métricas
- [ ] Favoritar vídeos (Atividade Física)
- [ ] Registro básico de visualizações e tempo
- [ ] Painel simples de uso (dia/semana)

### Fase C – Sensores e Acessibilidade
- [ ] Pedômetro/acelerômetro (passos) com consentimento
- [ ] Alto contraste dedicado e revisão de tamanhos de toque
- [ ] Considerar Text‑to‑Speech nas telas de conteúdo

## 5) Fora de escopo (removido deste PRD)
- Esquemas SQL completos, triggers complexas e auditoria detalhada
- Telas e fluxos não listados no pedido (estatísticas avançadas, relatórios, guias extensos)
- Qualquer automação de curadoria (conteúdo será escolhido manualmente pela Mais60)

## 6) Próximos passos imediatos
1. Implementar player YouTube no `app/player/video/[id].tsx` (controles simples, alto contraste)
2. Persistir favoritos de vídeos (mínimo viável)
3. Registrar tempo de visualização e "assistido"
4. Preparar telas/strings de alto contraste e revisar altura mínima de botões (48px)
5. Especificar apenas as tabelas mínimas no Supabase e RPCs essenciais

---
Documento reduzido para execução direta, refletindo somente o escopo solicitado pelo cliente e marcando claramente o que já foi feito e o que falta.


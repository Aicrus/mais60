## Resumo do App "Mais 60 Saúde"

**O aplicativo é sobre:** Ajudar idosos (60+) a melhorar a saúde através de conteúdo de vídeos do YouTube em 5 áreas principais.

**As 5 áreas principais são:**
1. **Atividade Física** - exercícios leves, alongamentos, yoga
2. **Hábitos Alimentares** - receitas saudáveis, dicas de nutrição  
3. **Segurança no Domicílio** - prevenção de quedas, segurança em casa
4. **Estimulação Cognitiva** - exercícios de memória, jogos de lógica
5. **Saúde Mental** - meditação, relaxamento, bem-estar

**Funcionalidades principais:**
- Repositório de vídeos do YouTube categorizados por área
- Sistema de favoritos para salvar vídeos
- Categorização de conteúdo (ex: "Alongamento Matinal", "Café da Manhã")
- Checklists interativos (principalmente para Segurança)
- Descrições dos benefícios de cada exercício/atividade

**Monitoramento e dados:**
- Registrar quais vídeos foram assistidos e por quanto tempo
- Tempo total de uso do app por dia/semana
- Integração com sensores do celular:
  - Pedômetro para contar passos
  - Acelerômetro para detectar movimentos
  - Monitor de bateria

**Design obrigatório:**
- Fontes grandes
- Alto contraste
- Ícones claros
- Botões grandes
- Navegação simples
- Poucos cliques para acessar conteúdo

**Resumo das telas necessárias:** Menu inicial com as 5 áreas + telas de lista de vídeos para cada área + tela de monitoramento/estatísticas.

## Checklist de Telas

- [x] **Tela Home** - com os 5 cards das áreas principais
- [x] **Tela de Perfil** - informações do usuário
- [x] **Tela de Lista de Vídeos** - lista de vídeos por área (acessada pelos cards)
- [x] **Tela de Reprodução de Vídeo** - para assistir os vídeos do YouTube
- [x] **Tela de Favoritos** - vídeos salvos pelo usuário
- [x] **Tela de Monitoramento/Estatísticas** - dados de uso e sensores
- [x] **Notificacoes** - Nitificacoes gerais de baterias uso do app etc. 


## Checklist de Funcionalidades Principais (Detalhadas):

**1. Repositório de vídeos do YouTube categorizados por área**
- [x] O app não armazena vídeos, apenas faz incorporação/links para vídeos públicos do YouTube
- [x] Cada uma das 5 áreas tem sua própria coleção curada de vídeos
- [x] Vídeos são organizados por tema (Atividade Física, Hábitos Alimentares, Segurança no Domicílio, Estimulação Cognitiva, Saúde Mental)
- [x] A curadoria dos vídeos é feita pela Mais60

**2. Sistema de favoritos para salvar vídeos**
- [x] Opção de "Favoritar" vídeos para acesso rápido

**3. Categorização de conteúdo dentro de cada área**
- [x] **Atividade Física:** "Alongamento Matinal", "Caminhada em Casa", "Fortalecimento Muscular"
- [x] **Hábitos Alimentares:** "Café da Manhã", "Almoço/Jantar", "Lanches Saudáveis"

**4. Checklists interativos (exclusivo da área de Segurança)**
- [x] Checklists interativos (ex: "Verificar iluminação", "Remover obstáculos")

**5. Descrições dos benefícios de cada exercício/atividade**
- [x] Breve descrição do benefício de cada exercício

**6. Marcação de progresso (opcional)**
- [x] Marcar vídeos como "concluídos" ou "assistidos" (se a plataforma permitir)



## Tela de Estatísticas/Monitoramento - O que deve conter:

**Registros de Atividade:**
- [x] Lista dos vídeos assistidos pelo usuário
- [x] Tempo de duração que cada vídeo foi assistido
- [x] Frequência de acesso a cada uma das 5 áreas (quantas vezes acessou cada módulo)
- [x] Vídeos marcados como "concluídos" ou "assistidos"

**Tempo de Uso do App:**
- [x] Tempo total de uso do app no dia atual
- [x] Tempo total de uso do app na semana atual
- [x] Resumo gráfico do tempo de uso por área/módulo
- [x] Histórico de uso diário/semanal

**Dados dos Sensores do Celular:**
- [x] **Pedômetro:** Contador de passos diários (para complementar o módulo de Atividade Física)
- [x] **Acelerômetro/Giroscópio:** Detecção de movimentos e tendências de atividade (não para segurança crítica)
- [x] **Localização (Opcional):** Registro de percursos de caminhada, se o usuário permitir (tracking diário + distância)
- [x] **Monitor de Bateria:** Nível atual da bateria + alerta quando bateria baixa (toast ao atingir 15%)

**Observações Importantes:**
- [x] Todos os dados de sensores devem ter permissão explícita do usuário (solicitado em Perfil > Permissões)
- [x] Ênfase na privacidade - dados ficam no dispositivo
- [x] Alertas de bateria baixa para incentivar carregamento (toast 15%)
- [x] Interface deve mostrar dados de forma gráfica e simples para idosos (gráficos simples implementados)

## Modelo de Dados (Supabase)

### Visão Geral

- Todas as tabelas foram criadas com nomes e campos em português.
- IDs seguem o tipo natural de cada domínio: `uuid` quando vinculado ao `auth.users`, `text` para slugs estáveis (pilares e categorias), `uuid` para `videos`.
- RLS habilitado em todas as tabelas. Conteúdo (pilares, categorias e vídeos publicados) possui leitura pública. Tabelas por usuário possuem políticas de leitura/escrita restritas ao próprio usuário.
- Trigger pós-cadastro cria/atualiza automaticamente um registro em `usuarios` quando um usuário é criado no `auth.users`.

### Tabelas

1. usuarios
   - id: uuid, PK, referencia `auth.users(id)` (on delete cascade)
   - email: text, único
   - nome: text
   - provedor: text
   - imagem_url: text
   - criado_em: timestamptz, default now()
   - atualizado_em: timestamptz, default now(), atualizado via trigger
   - RLS: cada usuário pode selecionar/atualizar apenas o próprio registro

2. pilares
   - id: text, PK (slug: `atividade-fisica`, `habitos-alimentares`, `seguranca-domiciliar`, `estimulacao-cognitiva`, `saude-mental`)
   - titulo: text, not null
   - descricao: text
   - ordem: int
   - criado_em: timestamptz, default now()
   - atualizado_em: timestamptz, default now(), atualizado via trigger
   - RLS: leitura pública

3. categorias
   - id: text, PK (slug)
   - titulo: text, not null
   - pilar_id: text, FK → `pilares(id)` (on delete cascade)
   - descricao: text
   - ordem: int
   - criado_em: timestamptz, default now()
   - atualizado_em: timestamptz, default now(), atualizado via trigger
   - RLS: leitura pública

4. videos
   - id: uuid, PK, default gen_random_uuid()
   - titulo: text, not null
   - descricao: text
   - url: text, not null (URL completa do YouTube)
   - youtube_id: text, not null (ID do vídeo no YouTube)
   - pilar_id: text, FK → `pilares(id)` (on delete restrict)
   - categoria_id: text, FK → `categorias(id)` (on delete set null)
   - publicado: boolean, default true
   - criado_em: timestamptz, default now()
   - atualizado_em: timestamptz, default now(), atualizado via trigger
   - Índice único: `(youtube_id, pilar_id, categoria_id)` para evitar duplicatas por contexto
   - RLS: leitura pública apenas para vídeos `publicado = true`

5. favoritos
   - usuario_id: uuid, FK → `auth.users(id)` (on delete cascade)
   - video_id: uuid, FK → `videos(id)` (on delete cascade)
   - criado_em: timestamptz, default now()
   - PK composta: `(usuario_id, video_id)`
   - RLS: leitura e escrita apenas do próprio usuário

6. progresso_videos
   - usuario_id: uuid, FK → `auth.users(id)` (on delete cascade)
   - video_id: uuid, FK → `videos(id)` (on delete cascade)
   - segundos_total: int, default 0
   - concluido: boolean, default false
   - atualizado_em: timestamptz, default now(), atualizado via trigger
   - PK composta: `(usuario_id, video_id)`
   - RLS: leitura e escrita apenas do próprio usuário

7. acessos_modulos
   - usuario_id: uuid, FK → `auth.users(id)` (on delete cascade)
   - pilar_id: text, FK → `pilares(id)` (on delete cascade)
   - contador: int, default 0 (quantidade de acessos)
   - segundos_total: int, default 0 (tempo acumulado)
   - atualizado_em: timestamptz, default now(), atualizado via trigger
   - PK composta: `(usuario_id, pilar_id)`
   - RLS: leitura e escrita apenas do próprio usuário

### Relacionamentos

- `categorias.pilar_id` → `pilares.id` (1:N)
- `videos.pilar_id` → `pilares.id` (1:N)
- `videos.categoria_id` → `categorias.id` (1:N, opcional)
- `favoritos.usuario_id` → `auth.users.id` (1:N por usuário)
- `favoritos.video_id` → `videos.id` (1:N por vídeo)
- `progresso_videos.usuario_id` → `auth.users.id` (1:N por usuário)
- `progresso_videos.video_id` → `videos.id` (1:N por vídeo)
- `acessos_modulos.usuario_id` → `auth.users.id`
- `acessos_modulos.pilar_id` → `pilares.id`

### Triggers e Funções

- `public.atualiza_timestamp()`: mantém `atualizado_em` das tabelas que possuem esse campo.
- Trigger `on_auth_user_created` (em `auth.users`): chama `public.cria_usuario_apos_signup()` para inserir/atualizar em `public.usuarios` automaticamente com dados `email`, `nome`, `provedor` e `imagem_url`.

### Políticas RLS

- `pilares`, `categorias`: SELECT público.
- `videos`: SELECT público apenas quando `publicado = true`.
- `usuarios`: SELECT/UPDATE apenas quando `id = auth.uid()`.
- `favoritos`, `progresso_videos`, `acessos_modulos`: ALL (select/insert/update/delete) apenas quando `usuario_id = auth.uid()`.

### Seed Inicial de Conteúdo

- Pilares: 5 registros conforme PRD.
- Categorias: 3 por pilar, total de 15.
- Vídeos: 15 registros (3 por pilar), alternando os dois links informados:
  - [Vídeo 1](https://www.youtube.com/watch?v=9cKe2I-Ta14)
  - [Vídeo 2](https://www.youtube.com/watch?v=YTUEan019KI)

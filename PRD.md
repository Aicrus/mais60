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
- [ ] O app não armazena vídeos, apenas faz incorporação/links para vídeos públicos do YouTube
- [ ] Cada uma das 5 áreas tem sua própria coleção curada de vídeos
- [ ] Vídeos são organizados por tema (Atividade Física, Hábitos Alimentares, Segurança no Domicílio, Estimulação Cognitiva, Saúde Mental)
- [ ] A curadoria dos vídeos é feita pela Mais60 para garantir conteúdo adequado e seguro para idosos

**2. Sistema de favoritos para salvar vídeos**
- [ ] Opção de "Favoritar" vídeos em todas as áreas para acesso rápido
- [ ] Vídeos favoritados ficam salvos numa lista pessoal
- [ ] Permite que o usuário crie sua própria seleção de conteúdos preferidos

**3. Categorização de conteúdo dentro de cada área**
- [ ] **Atividade Física:** "Alongamento Matinal", "Caminhada em Casa", "Fortalecimento Muscular"
- [ ] **Hábitos Alimentares:** "Café da Manhã", "Almoço/Jantar", "Lanches Saudáveis"
- [ ] **Segurança, Estimulação Cognitiva e Saúde Mental:** também terão subcategorias específicas
- [ ] Facilita a busca por tipo específico de conteúdo

**4. Checklists interativos (exclusivo da área de Segurança)**
- [ ] Listas de verificação complementares aos vídeos de segurança
- [ ] Exemplos: "Verificar iluminação", "Remover obstáculos"
- [ ] Usuário pode marcar itens como concluídos
- [ ] Funcionam como guia prático para aplicar as dicas dos vídeos

**5. Descrições dos benefícios de cada exercício/atividade**
- [ ] Cada vídeo tem uma breve descrição explicando seus benefícios
- [ ] Informa ao usuário por que aquela atividade é importante para sua saúde
- [ ] Motiva o uso do conteúdo através da educação sobre os benefícios

**6. Marcação de progresso (opcional)**
- [ ] Possibilidade de marcar vídeos como "concluídos" ou "assistidos"
- [ ] Permite acompanhar o progresso do usuário no consumo do conteúdo


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
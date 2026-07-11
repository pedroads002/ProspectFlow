# ProspectFlow — Fluxo Operacional Diário (Workflow)

> Companion a [VISION.md](./VISION.md), [PRD.md](./PRD.md), [ARCHITECTURE.md](./ARCHITECTURE.md) e
> [DATA_MODEL.md](./DATA_MODEL.md). Este documento **não** introduz entidades, migrações ou módulos
> novos — ele descreve a coreografia de uso diário que as próximas implementações devem seguir,
> mapeada sobre a arquitetura e o modelo de dados já existentes. Onde uma peça ainda não existe
> (ex.: metas diárias configuráveis, um "Modo Foco"), isso é marcado explicitamente como trabalho
> futuro, não como algo já implementado.
>
> Leia isto antes de propor qualquer nova tela, botão ou campo relacionado ao uso diário — o
> objetivo é que toda implementação futura reforce esta jornada em vez de fragmentá-la.

## 0. Por que este documento existe

ProspectFlow (VISION.md) não é um CRM: é o sistema operacional de um profissional que faz
**prospecção ativa**, hoje concentrada em DM do Instagram. Esse profissional abre o sistema logo
cedo e o mantém aberto por várias horas, alternando entre Instagram/WhatsApp (onde a conversa
realmente acontece) e ProspectFlow (onde ele decide o que fazer a seguir e registra o que já fez).

Cada minuto gasto navegando, clicando em excesso ou procurando "quem eu deveria contatar agora" é
tempo que devia estar em VISION.md's "menos tempo operando ferramentas, mais tempo construindo
relações". Este documento modela a jornada de ponta a ponta para que essa promessa seja concreta,
não apenas uma frase de princípio.

## 1. Premissa e Persona (recapitulando VISION.md)

- Persona: consultor/profissional comercial independente, vende serviço/consultoria, prospecta
  hoje "na mão" via Instagram e WhatsApp, sem paciência para ferramentas complexas.
- Uso real: dezenas de primeiras mensagens e follow-ups por semana, várias horas por dia dentro do
  sistema — não uma checagem ocasional.
- Canal primário desta fase: **DM do Instagram** (`Channel.INSTAGRAM`, já existente no modelo de
  dados — ver DATA_MODEL.md §3.6). WhatsApp continua suportado; a priorização de Instagram é uma
  escolha de UX/fluxo (ordenação e defaults), não uma remoção de capacidade.
- Objetivo do dia não é "gerenciar uma carteira de clientes" — é **executar volume de prospecção
  com qualidade**: abrir conversas novas, mover conversas existentes adiante, e não deixar nada
  esfriar por esquecimento.

## 2. Princípios que Orientam o Fluxo Diário

Estes princípios especializam VISION.md §"Product Philosophy" para o contexto específico do loop
diário:

1. **Execução > navegação.** A tela padrão do dia deve responder "o que eu faço agora?" sem o
   usuário precisar filtrar ou pensar. Qualquer clique que não seja "agir sobre um lead" é
   candidato a ser removido ou movido para segundo plano.
2. **Um lead por vez, decisão em um clique.** As Quick Actions (PRD §1.2) já são o mecanismo
   correto — o fluxo diário deve ser desenhado para apresentá-las no momento certo, lead a lead,
   em vez de forçar o usuário a caçar cada lead na lista.
3. **Momentum é o critério de prioridade, não a data de criação.** `Cooling`/`Stalled` sobem para
   o topo da fila de trabalho; `Rising` aparece como "aproveitar enquanto está quente"; leads
   `Steady` sem urgência ficam disponíveis, mas não competem por atenção (PRD §1.4).
4. **Capturar não pode quebrar o fluxo.** Encontrar um novo prospecto no Instagram enquanto está no
   meio da execução deve custar um clique e retornar exatamente para onde o usuário estava — nunca
   uma navegação completa para "Adicionar Lead".
5. **Envio continua manual e deliberado.** Nenhuma etapa deste fluxo automatiza ou envia mensagens
   por conta própria (PRD Regra de Negócio #2, VISION.md "What ProspectFlow Is NOT"). O sistema
   acelera decisão e redação; a ação de enviar continua sendo do humano, fora do ProspectFlow.
6. **Ações de alto risco continuam deliberadas, não reflexo.** "Reunião Agendada" e "Proposta
   Enviada" exigem um instante de confirmação consciente (já é assim no PRD §1.2) — a busca por
   velocidade não deve comprimir esses dois pontos a ponto de virarem cliques acidentais.
7. **O dia tem começo, meio e fim visíveis.** Um profissional que usa o sistema por horas precisa
   de um sinal claro de progresso (metas do dia) e de encerramento (resumo do dia), não apenas uma
   lista infinita de leads.

## 3. A Jornada do Dia

```
Manhã                Bloco de Execução              Ao longo do dia           Fim do dia
──────────────────────────────────────────────────────────────────────────────────────
Painel do Dia   →   Fila de Prospecção Ativa   →   Ciclo de Resposta   →   Revisão do Dia
(metas + fila)      (novo contato / follow-up)      (cola conversa,         (metas vs.
                                                      IA, Quick Action)       realizado)
                                                                              +
                                                                        Reuniões/Propostas
                                                                        (ação deliberada,
                                                                         a qualquer momento)
```

### 3.1 Manhã — Abertura do "Painel do Dia"

Ao abrir o ProspectFlow, antes de qualquer lista de leads, o usuário deve ver um painel de
abertura (hoje o Dashboard em `src/app/(dashboard)/page.tsx`; ver §5 para o que isso implica
evoluir) que responde três perguntas em segundos:

1. **Onde eu estou hoje?** Contadores do dia (ver §4: mensagens enviadas, respostas, conversas
   iniciadas, reuniões agendadas, follow-ups), comparados a uma meta diária quando configurada.
2. **Quem precisa de mim agora?** A fila de leads ordenada por Momentum — `Stalled` e `Cooling`
   primeiro, depois `Rising` (aproveitar o calor), depois `Steady`/`New` sem contato ainda. Esta
   ordenação já existe como conceito (`sortByMomentumPriority` em
   `src/modules/outreach/momentum.service.ts`) — o Painel do Dia é a superfície certa para expor
   essa fila como o primeiro conteúdo visto, não a lista genérica de leads.
3. **Por onde eu começo?** Um ponto de entrada único para o Bloco de Execução (§3.2), não múltiplos
   caminhos concorrentes.

Este painel não introduz dados novos por si — ele é uma _view_ sobre `Lead`, `LeadEvent` e
`OutboundMessage` já existentes, recortada por dia e ordenada por Momentum.

### 3.2 Bloco de Execução — Prospecção Ativa

Este é o núcleo do dia: o tempo gasto abrindo conversas novas e avançando conversas existentes.
Duas filas, priorizadas nesta ordem:

**Fila A — Novo Contato** (leads em `NEW`, ainda sem primeira mensagem)
1. Sistema mostra o próximo lead da fila com seus dados públicos (Instagram, Niche, Notes).
2. Usuário aciona o rascunho de primeira mensagem via IA (PRD FR-2), já usando o Perfil Comercial e
   tom configurados — nenhuma digitação extra necessária para obter o rascunho.
3. Usuário edita se quiser, copia, envia manualmente pelo Instagram.
4. Usuário confirma "mensagem enviada" → status `NEW → CONTACTED`, Momentum → `Rising`
   (`OutboundMessage.status = SENT`, `LeadEvent` — fluxo já implementado em
   `message.service.ts`/`status.service.ts`).
5. Sistema avança automaticamente para o próximo lead da fila — sem o usuário precisar voltar à
   lista e escolher manualmente o próximo.

**Fila B — Acompanhamento** (leads pós-contato, ordenados por Momentum)
1. Sistema mostra o próximo lead que precisa de atenção (prioridade: `Stalled` > `Cooling` >
   `Rising` sem follow-up recente).
2. Usuário decide com um clique via Quick Action (PRD §1.2): `Sem Resposta`, `Respondeu`,
   `Interessado`, `Follow-up`, `Reunião Agendada`, `Venda Concluída`, `Perdido` — exatamente o
   conjunto e as regras de transição já implementadas em
   `src/modules/outreach/status.service.ts`.
3. Se há uma resposta nova e substantiva, o usuário cola o texto da conversa (FR-4) e recebe
   assistência de IA modular (resumo, sentimento, objeções, próxima mensagem sugerida) antes de
   decidir a Quick Action.
4. Sistema avança para o próximo lead da fila.

**Captura rápida durante o bloco (não interrompe o fluxo)**
Ao encontrar um novo prospecto navegando no Instagram, o usuário precisa de um atalho de "adicionar
e voltar" — um formulário mínimo (Nome + Instagram, os demais campos opcionais depois) que grava o
`Lead` (`sourceType = MANUAL`, já suportado por `manual-entry.provider.ts`) sem sair da tela de
execução. Isso não é uma entidade nova — é uma variação de UX mais enxuta do formulário de
`leads/new` já existente, pensada para não quebrar o ritmo da fila.

### 3.3 Ciclo de Resposta

Como não há integração direta com Instagram/WhatsApp (PRD §8, fora de escopo), o "ouvir uma
resposta chegar" continua sendo o usuário verificando o app de mensagens por conta própria. O
fluxo do ProspectFlow começa no momento em que ele traz essa resposta para dentro do sistema:

1. Usuário abre o lead (a partir da fila do §3.2 ou de uma notificação mental própria, fora do
   sistema).
2. Cola o texto da conversa (`ConversationEntry`, FR-4.5).
3. Recebe apenas as saídas de IA relevantes ao estágio atual (FR-4.3) — nunca um bloco fixo com
   tudo.
4. Decide a Quick Action correspondente. Isso o devolve à Fila B, não a uma tela separada.

### 3.4 Reuniões e Propostas — ações deliberadas

Estas duas ações ficam **fora** do ritmo de "um clique e próximo", por design do próprio PRD
(§1.2: "Proposal Sent é alcançado deliberadamente, não via quick-action"):

- **Reunião Agendada** é uma Quick Action (um clique), mas por natureza acontece pontualmente, não
  em lote dentro da fila — normalmente surge durante o Ciclo de Resposta (§3.3).
- **Proposta**: o usuário gera o rascunho via IA (FR-5), edita, envia manualmente fora do sistema,
  e só então confirma "enviada" (`status → PROPOSAL_SENT`). Esse momento de pausa é intencional e
  não deve ser comprimido pela busca por velocidade do restante do dia.

### 3.5 Encerramento do Dia

Ao final do expediente (ou sempre que o usuário decidir parar), o Painel do Dia deve permitir uma
leitura rápida do que foi feito, funcionando como o "fechamento de caixa" do dia comercial:

1. Metas do dia vs. realizado (§4) — mesmos contadores do painel da manhã, agora como resultado.
2. Leads que ficaram `Cooling`/`Stalled` e não foram tratados hoje — a lista que "sobra" para
   amanhã, para que nada se perca de um dia para o outro.
3. Nenhuma ação nova é exigida aqui — é uma tela de leitura, não mais um ponto de decisão. O valor
   é o encerramento psicológico do dia de trabalho, coerente com VISION.md's "tempo é o ativo mais
   importante que o ProspectFlow devolve".

## 4. Métricas Diárias — Definição e Origem de Dados

Todas as métricas abaixo são **derivadas de dados que já existem** no modelo (DATA_MODEL.md) —
nenhuma requer uma tabela nova. Cada uma deve ser calculada tenant-scoped (`scopeToTenant`, sem
exceção — CLAUDE.md) e filtrada por `createdAt`/`sentAt` dentro do dia corrente (fuso do tenant).

| Métrica | Definição | Origem no modelo de dados |
|---|---|---|
| **Mensagens enviadas** | Total de mensagens marcadas como enviadas hoje, de qualquer tipo | `OutboundMessage` onde `status = SENT` e `sentAt` = hoje |
| **Conversas iniciadas** | Primeiras mensagens enviadas hoje (abrir uma conversa nova, distinto de dar sequência a uma existente) | `OutboundMessage` onde `kind = FIRST_CONTACT` e `sentAt` = hoje (subconjunto de "Mensagens enviadas") |
| **Respostas** | Leads que responderam hoje | `LeadEvent` onde `type = STATUS_CHANGED` e `toStatus = REPLIED`, `createdAt` = hoje |
| **Follow-ups** | Follow-ups registrados hoje (conversa em andamento, sem mudança de estágio) | `LeadEvent` onde `type = FOLLOW_UP_LOGGED`, `createdAt` = hoje |
| **Reuniões agendadas** | Reuniões marcadas hoje | `LeadEvent` onde `type = STATUS_CHANGED` e `toStatus = NEGOTIATION`, `createdAt` = hoje |

Métrica secundária, opcional, útil para o mesmo painel mas não pedida explicitamente:
**Tentativas sem resposta** — `LeadEvent` onde `type = NO_REPLY_LOGGED`, `createdAt` = hoje (sinal
de volume de esforço mesmo quando não há retorno).

Todas essas consultas seguem o padrão já estabelecido: passam pelo serviço do módulo dono do dado
(`outreach` para `LeadEvent`/`OutboundMessage`) via o helper de escopo de tenant — nunca uma query
Prisma direta a partir de `app/` (ARCHITECTURE.md §3).

## 5. Implicações para Implementações Futuras

Este documento é uma referência de fluxo, não uma especificação técnica pronta para codar. Abaixo,
o que já foi construído a partir dele e o que ainda falta — cada peça futura seguindo o processo
normal de atualização de documentação do CLAUDE.md quando for construída:

**Já implementado:**
- **Painel do Dia como superfície dedicada.** `src/app/(dashboard)/page.tsx` foi redesenhado como
  o centro operacional descrito no §3.1: contadores do dia + fila única priorizada por Momentum
  (`getPriorityLeads` em `src/modules/outreach/momentum.service.ts`), sem o card de equipe que
  ocupava a tela antes. É puramente composição de UI sobre serviços já existentes de `outreach`
  (Momentum, LeadEvent, OutboundMessage) — nenhuma lógica de negócio nova, nenhuma migração.
- **Contadores diários como consulta.** As métricas do §4 (mensagens enviadas, conversas
  iniciadas, respostas, follow-ups, reuniões agendadas) são calculadas sob demanda em
  `src/modules/outreach/daily-summary.service.ts`, via novas funções de contagem por intervalo em
  `message.repository.ts`/`lead-event.repository.ts` — nenhum campo persistente novo, a fonte de
  verdade continua sendo `LeadEvent`/`OutboundMessage`. Sem meta diária configurada, o painel
  mostra só os contadores, sem barra de progresso (decisão validada em §7).

**Ainda não construído:**
- **Metas diárias configuráveis.** Hoje não existe onde guardar "quero enviar N mensagens por
  dia". Candidato natural: um campo novo (ex. `dailyMessageGoal` ou similar) próximo de
  `CommercialProfile` (módulo `tenancy`), já que ali vive a configuração do tenant. Isso exigiria
  uma migração aditiva e a atualização correspondente de DATA_MODEL.md **no momento em que for
  implementado** — não antes.
- **"Modo Foco" / fila sequencial (Fila A / Fila B do §3.2).** Hoje a UI trabalha por lista de
  leads (`/leads`) e detalhe individual (`/leads/[id]`), mais a fila única de prioridade do Painel
  do Dia (acima) — que ainda não avança automaticamente de lead em lead. Uma experiência de "um
  lead por vez, avança automaticamente" é uma camada de UI nova sobre os mesmos dados e Quick
  Actions — não uma mudança de modelo.
- **Formulário de captura rápida.** Uma variante mais enxuta de `leads/new` (menos campos
  obrigatórios na hora, edição completa depois) — reaproveita `lead.service.ts`/`lead.schema.ts`
  como estão.

Nenhum item pendente deve ser iniciado como código a partir deste documento sozinho — cada um
precisa da aprovação explícita do usuário como uma tarefa própria, seguindo o fluxo de trabalho já
estabelecido no projeto.

## 6. Guardrails / Não-Objetivos (reafirmando VISION.md e PRD.md)

- Nenhuma etapa deste fluxo envia mensagem automaticamente — toda confirmação de envio continua
  manual e explícita.
- Este fluxo não introduz pipeline de negociação, calendário, faturamento ou gestão de tarefas
  genérica — ele organiza exclusivamente a execução de prospecção via os conceitos já existentes
  (Status, Momentum, Quick Actions).
- "Velocidade" aqui significa menos cliques e navegação, nunca menos revisão humana — os pontos
  deliberadamente não otimizados para clique único (Reunião Agendada como confirmação pontual,
  envio de Proposta) permanecem assim.
- Este documento não substitui PRD.md/ARCHITECTURE.md/DATA_MODEL.md — qualquer novo campo, módulo
  ou fluxo que nasça daqui deve, no momento da implementação, atualizar esses documentos como de
  costume (CLAUDE.md, "Documentation Updates").

## 7. Decisões Validadas

Estas decisões foram revisadas e confirmadas com o dono do produto antes de qualquer
implementação. Ficam registradas aqui para que a implementação futura não precise
relitigá-las:

- **Escopo da meta diária: por tenant.** A meta diária acompanha o mesmo padrão do
  `CommercialProfile` (1:1 com `Tenant`, DATA_MODEL.md §3.3). Não há meta individual por usuário
  na MVP. Se/quando tenants multi-usuário existirem, revisitar junto da própria migração de
  `CommercialProfile` para por-usuário já sinalizada em DATA_MODEL.md — não antes, e não como um
  caso especial só para a meta.
- **Valor da meta: sem padrão sugerido, nasce vazia.** Nenhum número é pré-preenchido. Até o
  usuário configurar uma meta em Configurações, o Painel do Dia mostra apenas os contadores (§4)
  sem barra de progresso/comparação. Isso evita o sistema impor uma expectativa de produtividade
  não solicitada.
- **"Modo Foco" convive com a lista de leads, não a substitui.** A lista de leads (`/leads`,
  ordenável/filtrável por Momentum) continua sendo a tela de visão geral, busca e revisão. O
  Painel do Dia ganha uma ação explícita (ex. "Iniciar Prospecção") que entra no modo de fila
  sequencial descrito no §3.2 — um ponto de entrada adicional, não uma substituição de navegação
  existente.
- **"Conversas iniciadas" conta qualquer canal.** A métrica usa `OutboundMessage` com
  `kind = FIRST_CONTACT` independentemente de `channel` (Instagram ou WhatsApp), mantendo
  consistência com "Mensagens enviadas" (mesma base de dados, sem filtro de canal). A priorização
  do Instagram acontece na UX — ordenação da fila, canal padrão em formulários — não na contagem.

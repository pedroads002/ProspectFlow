<!--
  Fonte de conhecimento do método comercial usado pela IA do ProspectFlow
  (ARCHITECTURE.md §4, DECISIONS.md "Why the Sales Playbook Is File-Based").

  Este arquivo é lido em runtime por knowledge.service.ts, que seleciona
  apenas as seções relevantes para cada tarefa de IA (rascunho de primeira
  mensagem, follow-up, análise de conversa, proposta) — nunca o arquivo
  inteiro de uma vez. Este comentário e todo o texto fora das seções "## "
  nunca chegam ao modelo.

  Preencha cada seção abaixo com o conteúdo real do seu playbook (hoje no
  Google Docs). Inclua exemplos reais de conversa dentro da seção a que
  pertencem (ex.: um exemplo de quebra de objeção vai dentro de "Quebra de
  Objeções"), não como uma seção separada — mantém cada trecho de
  conhecimento junto do estágio onde ele é usado.

  Contrato importante: os 7 títulos abaixo (exatamente como estão escritos,
  em português, sem acentos trocados) são lidos por
  HEADING_TO_STAGE em knowledge.service.ts. Não renomeie, não remova, não
  reordene os títulos sem atualizar esse mapeamento também. Uma seção
  deixada vazia é simplesmente ignorada (não quebra nada).

  Enquanto uma seção estiver vazia, a IA usa apenas as regras gerais já
  embutidas em cada prompt (src/modules/ai/prompts/) — o comportamento
  atual do produto não muda até você preencher o conteúdo real aqui.
-->

# Playbook Comercial

## Abertura

## Diagnóstico

## Quebra de Objeções

## Transição

## Pitch

## Convite para Reunião

## Follow-up

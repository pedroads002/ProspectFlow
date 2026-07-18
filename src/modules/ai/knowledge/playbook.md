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

Opa, [nome da pessoa]! Bom dia/ boa tarde/ boa noite, tudo certo?

Se responder "claro":

Curiosidade genuína mesmo:

vocês ainda controlam o atendimento comercial mais pelo WhatsApp ou já organizam isso em algum sistema próprio ou por algum CRM?

Perceba a diferença absurda. Você não se apresentou. Não vendeu nada. Não falou de agência. Não falou de implementação. Não falou de sistema. Não falou de consultoria. Não falou de reunião. Você simplesmente fez uma pergunta que alguém do mercado faria para outro profissional do mercado.

Se ele responder algo como por exemplo:

"Usamos [nome do CRM que é utilizado]/algo do tipo."

Você pergunta:

"E funcionou bem para vocês?"

Se responder algo como por exemplo:

"Ainda fazemos tudo no WhatsApp."

Você responde:

"Interessante. É disparado o cenário que mais encontro."

Pronto. A conversa começou.

Outra abordagem que eu particularmente acho ainda melhor para você:

Entendi, eu sou DEV e Head Comercial de clínicas da mesma área que a sua e fiquei com uma curiosidade pessoal aqui.

Deixa eu te perguntar… qual é hoje o maior gargalo comercial da clínica de vocês?

São apenas duas linhas. Não parece pitch. Não parece automação. Não parece agência. Não parece tráfego pago. Não parece vendedor.

Se ele responder "claro", você faz a pergunta.

Existe uma terceira abordagem que talvez seja a que mais combina com o seu perfil:

Entendo, acho que essa é a resposta que eu mais escuto rsrs, diariamente inclusive.

Hoje vocês fazem algum tipo de controle, gestão, confirmação ou acompanhamento além do WhatsApp?

Percebe? Ainda parece conversa. Ainda parece curiosidade profissional. Ainda não parece venda.

Agora vem a primeira abertura:

Se eu te perguntasse hoje quantos leads entram na clínica por mês e quantos efetivamente viram pacientes, você conseguiria responder com facilidade?

Essa pergunta é muito forte. Porque geralmente a resposta será: não; mais ou menos; depende; teria que olhar; a secretária sabe. Nesse momento ele percebe o problema sozinho.

## Diagnóstico

Se ele responder algo como por exemplo:

"Leads chegam mas acabam esfriando."

Você vai para:

Entendi.

E normalmente isso acontece por falta de tempo da equipe, excesso de demanda ou porque realmente fica difícil acompanhar tudo?

Agora ele está te entregando o diagnóstico sozinho.

Se ele responder algo como por exemplo:

"Organização."

Você responde:

Organização em qual sentido especificamente?

Agenda? Follow-up? Indicadores? Equipe?

Se ele responder algo como por exemplo:

"Hoje está tudo no WhatsApp."

Você:

Entendi.

E vocês conseguem ter visibilidade de coisas como taxa de comparecimento, conversão de consulta, origem dos pacientes e retorno dos investimentos ou acaba ficando tudo muito operacional?

Depois: E isso nem é uma crítica, tá? Na verdade é o padrão da maior parte das clínicas que conheço. Isso remove defesa. Você deixa de ser um vendedor criticando a operação dele. Você vira alguém que entende a realidade dele.

## Quebra de Objeções

## Transição

Depois de alguns minutos de conversa, normalmente acontece uma destas duas frases:

"E vocês fazem isso como aí?"

ou

"Você trabalha com isso?"

Quando isso acontecer, a porta abriu.

Aí você pode responder algo simples como:

Na verdade sim.

Hoje sou responsável pela parte comercial e pela implementação dos processos e desenvolvimento de sistemas em algumas clínicas do nicho de saúde e estética.

Mas fiquei curioso porque muitos dos problemas acabam se repetindo bastante entre as operações.

Veja que mesmo aqui você ainda não vendeu nada.

Agora vem a transição:

Inclusive foi exatamente por enxergar isso em várias clínicas que comecei a ajudar algumas operações nessa parte de estruturação comercial.

Observe: Você não disse: eu vendo CRM. Você não disse: eu implemento sistemas. Você não disse: quer comprar? Você apenas explicou o contexto.

## Pitch

Agora, se ele demonstrar interesse:

"Interessante."

"Como funciona?"

"O que vocês implementam?"

Aí sim você pode avançar:

Depende bastante da realidade da clínica, mas normalmente envolve estruturação do funil comercial, CRM, acompanhamento dos leads, automações e indicadores para a equipe não depender exclusivamente do WhatsApp e da memória das pessoas.

Nada muito mirabolante, normalmente é mais organização comercial / operacional mesmo.

Essa última frase é extremamente forte: "nada muito mirabolante". Porque ela reduz imediatamente a sensação de: projeto complexo; software gigantesco; mudança traumática; custo alto; consultoria corporativa.

A sensação passa a ser: "Ah, isso parece algo relativamente simples e útil."

E é exatamente essa percepção que você quer criar para uma renda extra baseada em implementação pontual.

Se ele demonstrar curiosidade:

Como assim?

ou

O que você faz exatamente?

Aí você explica:

Geralmente é algo relativamente simples.

Organização do funil, acompanhamento dos pacientes, indicadores, follow-up, automações e processos para a clínica não depender exclusivamente do WhatsApp e da memória da equipe.

## Convite para Reunião

Agora vem a parte mais importante:

Você NÃO oferece reunião imediatamente.

Você faz mais uma pergunta.

Você acha que uma estrutura dessas faria sentido hoje para a realidade da clínica de vocês?

Essa pergunta muda tudo. Porque ele passa a vender para ele mesmo.

Se ele responder:

Acho que sim.

Pronto. Agora você chegou onde queria.

Só depois disso:

Se fizer sentido para você, qualquer dia desses posso te mostrar em 20 ou 30 minutos como algumas clínicas estão organizando essa parte hoje.

Sem compromisso mesmo.

Se você enxergar valor, ótimo.

Se não fizer sentido para a realidade da clínica, pelo menos trocamos algumas ideias sobre operação comercial.

Perceba que isso soa completamente diferente de: "Gostaria de agendar uma reunião para apresentar nossa solução?"

A primeira parece conversa. A segunda parece vendedor.

E no seu caso específico, sendo uma renda extra, perfil pessoal e prospecção fria pelo Instagram, essa diferença provavelmente é responsável pela maior parte do resultado que você vai ter.

## Follow-up

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

### Manual de Condução e Quebra de Objeções
### Prospecção Consultiva para Clínicas e Profissionais da Saúde

A ideia não é ensinar respostas prontas, mas ensinar a pensar durante a conversa.

---

# REGRA Nº 1

Nunca responda uma objeção imediatamente.

Antes, descubra o motivo.

Exemplo:

Lead:
"Já usamos CRM."

A pior resposta seria:

"Ah, mas o nosso é melhor."

A melhor:

"Que bacana.
E como tem sido a experiência de vocês com ele até agora?"

Agora ele explica.

---

# REGRA Nº 2

Toda resposta do lead gera uma pergunta.

Nunca um pitch.

Exemplo:

Lead:
"Ainda fazemos tudo pelo WhatsApp."

Você:
"Entendi.
O que faz vocês continuarem usando só o WhatsApp?"

ou

"Existe algum motivo específico para nunca terem implantado um CRM?"

ou

"Hoje isso atende bem a clínica ou vocês já sentiram algumas limitações?"

Perceba.

Nenhuma resposta.

Só perguntas.

---

# REGRA Nº 3

Nunca ensine.

Faça o profissional perceber.

Errado:

"O WhatsApp faz vocês perderem pacientes."

Certo:

"Vocês conseguem acompanhar facilmente todos os pacientes que deixam de responder?"

---

Errado:

"O CRM melhora a conversão."

Certo:

"Hoje vocês conseguem saber quantos pacientes entram e quantos realmente viram tratamento?"

---

# REGRA Nº 4

Quem fala mais perde.

Seu objetivo é que o profissional fale 80%.

Você fala 20%.

---

# OBJEÇÃO 1

### "Já usamos CRM."

Resposta:

"Muito bom.
E ele atende tudo o que vocês precisam hoje ou ainda existem algumas coisas que acabam sendo feitas manualmente?"

---

Se responder:

"Tem algumas limitações."

Você:

"Curiosidade...
Qual costuma incomodar mais vocês?"

---

# OBJEÇÃO 2

### "Usamos Kommo."

Resposta:

"Legal.
Inclusive conheço bastante o Kommo.
Vocês utilizam só como CRM ou também exploram automações, indicadores e gestão comercial?"

---

Quase sempre responderá:

"Só o básico."

Agora:

"É exatamente isso que vejo acontecer na maioria das clínicas."

---

# OBJEÇÃO 3

### "A secretária resolve isso."

Resposta:

"Que ótimo.
Ela consegue acompanhar tudo sozinha ou às vezes acaba ficando muita coisa concentrada nela?"

---

Agora ele mesmo percebe o gargalo.

---

# OBJEÇÃO 4

### "Hoje funciona bem."

Resposta:

"Que bom.
Posso te perguntar uma curiosidade?
O que faz vocês terem essa percepção?"

---

Ele explica.

Você descobre o cenário.

---

# OBJEÇÃO 5

### "Não temos esse problema."

Resposta:

"Excelente.
Inclusive é raro encontrar operações tão organizadas.
Posso te perguntar como vocês fazem hoje?"

---

As pessoas adoram falar.

---

# OBJEÇÃO 6

### "Estamos sem tempo."

Resposta:

"Imagino mesmo.
Na verdade nem era para tomar seu tempo.
Era só uma curiosidade profissional mesmo.
Hoje qual costuma consumir mais tempo da equipe comercial?"

---

# OBJEÇÃO 7

### "Não tenho interesse."

Nunca responda:

"Tudo bem."

Resposta melhor:

"Sem problema nenhum.
Só fiquei curioso...
Existe algum motivo específico ou simplesmente não faz sentido para o momento da clínica?"

---

Agora você entende.

---

# OBJEÇÃO 8

### "Já temos alguém que faz isso."

Resposta:

"Perfeito.
E vocês estão satisfeitos com a estrutura atual ou ainda existe alguma coisa que gostariam de melhorar?"

---

# OBJEÇÃO 9

### "Isso deve ser caro."

Jamais fale preço.

Resposta:

"Depende muito da realidade da clínica.
Mas antes disso...
O que fez você imaginar que seria caro?"

---

Agora aparece a objeção real.

---

# OBJEÇÃO 10

### "Vou pensar."

Resposta:

"Claro.
Só por curiosidade...
Quando alguém me fala isso normalmente acontece uma destas três situações:

• ainda não enxergou valor suficiente;
• gostou, mas não é prioridade agora;
• ou ficou com alguma dúvida.

Em qual delas você acha que se encaixa mais?"

Essa pergunta é extremamente forte.

---

# OBJEÇÃO 11

### "Depois eu vejo."

Resposta:

"Combinado.
Só para eu entender...
O que faria esse assunto virar prioridade para vocês?"

---

# OBJEÇÃO 12

### "Depois conversamos."

Resposta:

"Claro.
Só para eu não te procurar em um momento que não faça sentido...
O que você gostaria de resolver primeiro na clínica antes de olhar essa parte comercial?"

---

# OBJEÇÃO 13

### "Não quero reunião."

Resposta:

"Sem problema.
Na verdade nem gosto de marcar reunião sem necessidade.
Primeiro gosto de entender se realmente existe algum cenário em que eu consiga agregar valor."

---

Isso reduz completamente a pressão.

---

# OBJEÇÃO 14

### "Manda material."

Nunca envie imediatamente.

Resposta:

"Posso mandar sim.
Mas só para eu te enviar algo que realmente faça sentido...
Hoje qual desses pontos mais chama sua atenção?

• organização dos leads
• CRM
• automações
• indicadores
• processos comerciais"

Agora o material será personalizado.

---

# OBJEÇÃO 15

### "Não temos muitos leads."

Resposta:

"Interessante.
E justamente por isso vocês sentem necessidade de aproveitar melhor cada oportunidade ou hoje isso não preocupa muito?"

---

# OBJEÇÃO 16

### "Nosso marketing não funciona."

Resposta:

"Posso estar errado...
Mas normalmente quando escuto isso existem dois cenários.
Ou chegam poucos leads...
Ou chegam muitos, mas poucos viram pacientes.
Qual acontece mais com vocês?"

---

# OBJEÇÃO 17

### "Os leads são muito frios."

Resposta:

"Essa é uma realidade muito comum.
Hoje vocês possuem algum processo estruturado de follow-up ou acabam dependendo da iniciativa da equipe?"

---

# OBJEÇÃO 18

### "Perdemos muitos pacientes."

Resposta:

"Você sabe em qual etapa isso costuma acontecer?
Primeiro atendimento?
Agendamento?
Comparecimento?
Orçamento?"

---

Agora ele entrega exatamente onde dói.

---

# A REGRA MAIS IMPORTANTE

Nunca tente convencer.

Faça perguntas até que o próprio profissional conclua que existe um problema.

Quando ele verbaliza o problema, você não precisa vender.

Você apenas mostra que existe uma forma melhor de fazer.

---

# A TÉCNICA MAIS PODEROSA: DIAGNOSTIQUE ANTES DE PRESCREVER

Você está falando com médicos, dentistas e donos de clínicas.

Eles foram treinados para fazer exatamente uma coisa:

Diagnosticar antes de prescrever qualquer tratamento.

Então conduza sua prospecção da mesma forma.

Não apresente uma solução antes de entender o cenário.

Primeiro investigue.

Pergunte.

Escute.

Descubra.

Exemplos:

• Como vocês fazem isso hoje?
• O que funciona bem?
• O que mais incomoda na operação?
• O que vocês já tentaram resolver?
• Qual impacto isso gera no dia a dia da clínica?

Só depois disso apresente a solução.

Quando você conduz a conversa dessa forma, deixa de parecer um vendedor oferecendo um produto.

Você passa a parecer um profissional fazendo um diagnóstico operacional.

E isso muda completamente a percepção da conversa.

A resistência diminui.

A confiança aumenta.

E, muitas vezes, o próprio profissional começa a enxergar problemas que antes nem percebia.

No fim, o seu papel não é convencer ninguém.

É ajudar a pessoa a enxergar a própria realidade e concluir, por conta própria, que faz sentido melhorar a estrutura comercial da clínica.

Essa mudança de postura é, provavelmente, o maior diferencial entre uma prospecção comum e uma prospecção realmente consultiva.

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

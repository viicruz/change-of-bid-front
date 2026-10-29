# Requisitos do projeto

Fonte: a página “Requisitos do projeto” do Notion, relida em 2026-10-29. Esta é a especificação de produto. O formato de requisição e resposta fica em [api/](./api/). O que este repositório implementa, e onde o código diverge, fica em [frontend.md](./frontend.md).

Onde esta página ainda cita uma decisão em aberto e a página do endpoint já descreve o comportamento, vale a página do endpoint. Esses casos estão no final. Regras de persistência, liquidação e hash são do servidor. A interface apresenta o resultado e não as executa.

## Definições

**Carta de origem** é o registro de uma carta obtido na YGOPRODeck. **Lote** é a oferta de leilão vinculada a uma ou mais cartas de origem e configurada por um leiloeiro. O lote é uma entidade própria. Não se confunde com o id da carta no catálogo.

**Lance inicial** é o valor mínimo para o primeiro lance. **Incremento mínimo** é a diferença mínima entre o lance atual e um novo lance. **Líder** é o licitante com o maior lance aceito de um lote ainda em disputa. **Vencedor** é o líder de um lote encerrado e liquidado.

**Saldo total** é o saldo simulado contabilizado na carteira. **Saldo comprometido** é a soma das reservas dos lotes em que o licitante lidera. **Saldo disponível** é a parcela que pode ser usada em novos lances:

```text
saldo disponível = saldo total − saldo comprometido
```

**Comprovante de arremate** é o registro consultável de um lote vencido. **Auditoria** é a consulta pública ao histórico de lances aceitos e ao resultado da verificação de integridade desse histórico.

## Requisitos funcionais



### RF-01 - Autenticar e autorizar por papel

A aplicação distingue leiloeiros e licitantes e autoriza operações conforme o papel. A interface não é a única barreira. O servidor verifica as permissões, inclusive em mensagens WebSocket que possam provocar alteração.

- Um leiloeiro autenticado gerencia os próprios lotes e não envia lances.
- Um licitante autenticado opera a própria carteira e envia lances, e não cria nem gerencia lotes.
- Uma pessoa sem sessão válida não envia lances, não deposita e não gerencia lotes.
- Um leiloeiro não altera nem cancela lotes de outro leiloeiro por chamada direta à API.



### RF-02 - Buscar e selecionar cartas para publicação

O painel do leiloeiro busca cartas na YGOPRODeck e seleciona uma carta para formar um lote. Mostra nome, imagem e informações suficientes para identificar o item selecionado.

- Uma busca por nome devolve cartas correspondentes, ou informa a ausência de resultados.
- A seleção mantém o vínculo entre o lote e o id da carta no catálogo.
- Erro, indisponibilidade ou limite do provedor produz uma mensagem compreensível e não interrompe lotes já publicados.



### RF-03 - Criar e publicar lotes

O leiloeiro cria um lote a partir das cartas selecionadas, com imagem, título, atributos disponíveis da carta, lance inicial, incremento mínimo, início e fim.

- A criação vincula o lote ao leiloeiro autenticado e persiste as cartas selecionadas e a apresentação delas.
- Campos obrigatórios, valores monetários válidos e um período em que o início precede o fim são validados.
- O incremento mínimo é positivo, para que um novo lance supere de fato o anterior.
- O lote publicado aparece na categoria do estado atual e pode ser aberto.



### RF-04 - Exibir a vitrine por estado do lote

A vitrine separa os lotes em ao vivo, agendados e encerrados. Lotes cancelados não aparecem.

Um lote futuro fica entre os agendados. Durante o período válido, fica entre os ao vivo. Depois do encerramento, fica entre os encerrados. O cancelamento o remove da vitrine pública sem apagar o histórico.

### RF-05 - Buscar e filtrar lotes

A vitrine oferece busca textual pelo título ou pelo nome da carta, e filtro por estado do lote. Esses são os critérios mínimos. Filtros extras por tipo, atributo, raridade ou preço não são obrigatórios.

Busca e filtro podem ser combinados. Os resultados respeitam os dois critérios e excluem lotes cancelados. Ausência de resultados é um estado vazio, não um erro de sistema.

### RF-06 - Exibir a sala do lote em tempo real

A sala mostra as cartas e os dados do lote, o lance atual, o histórico de lances aceitos, a posição do licitante, a contagem regressiva e uma indicação clara de liderança ou de superação. As atualizações chegam por WebSocket, sem recarregar a página.

- Quando um lance é aceito, os clientes conectados àquele lote veem o mesmo lance atual e o mesmo líder.
- Quem assume a liderança vê “você está ganhando”, ou texto equivalente. O líder anterior vê que foi superado.
- Uma prorrogação atualiza o término usado na contagem regressiva de todos os clientes.
- Encerramento e cancelamento atualizam a sala e impedem novos lances.
- Depois de uma queda de conexão, a sala recupera o estado atual. Uma contagem regressiva local desatualizada não é a fonte da verdade.



### RF-07 - Enviar lances e informar recusas

O licitante envia um lance. O servidor valida. Cada recusa mostra um motivo claro.

A aplicação distingue, no mínimo: valor abaixo do mínimo, saldo insuficiente, usuário já líder, lote ainda não iniciado, lote encerrado e lote cancelado. Uma recusa não altera saldo, liderança nem o histórico de lances aceitos. Um lance aceito produz uma única alteração consistente e é propagado aos clientes da sala.

### RF-08 - Consultar a carteira

A carteira do licitante exibe saldo total, saldo comprometido e saldo disponível, refletindo os lotes em que ele lidera.

Os três valores seguem a fórmula acima. Liderar mais de um lote compromete a soma desses lances. Ser superado, vencer ou ter o lote cancelado atualiza a carteira sem deixar reserva para trás.

### RF-09 - Realizar depósito simulado

O licitante adiciona saldo simulado à própria carteira. Não há pagamento real.

Um depósito válido aumenta o total e o disponível pelo mesmo valor e mantém o comprometido. Valores negativos, zero ou inválidos são recusados e não mudam o saldo.

### RF-10 - Encerrar e liquidar lotes

O sistema encerra o lote no término vigente, incluindo prorrogações. Quando há vencedor, debita a carteira dele, credita o leiloeiro e gera o comprovante de arremate. Um lote sem lances encerra sem vencedor.

- A liquidação não exige que o leiloeiro ou um licitante mantenha a sala aberta.
- O valor debitado do vencedor e creditado ao leiloeiro é o lance vencedor.
- A reserva do vencedor se encerra junto com a liquidação.
- Executar a liquidação de novo não produz um segundo débito, crédito ou comprovante.
- Um lote sem lances não gera transferência nem comprovante.
- Um lote cancelado não é liquidado como arremate.



### RF-11 - Consultar resultados no painel do leiloeiro

O painel lista os lotes do próprio leiloeiro, os estados deles e o resultado dos encerrados, incluindo se foram arrematados, o valor de arremate e o total recebido.

Lotes sem vencedor são distintos dos arrematados e dos cancelados. O total recebido soma somente valores efetivamente creditados ao leiloeiro. Não inclui reservas nem lotes cancelados.

### RF-12 - Consultar participação e arremates

O licitante tem uma tela para os lotes em que deu lance e os lotes que venceu, com acesso aos comprovantes e aos links de compartilhamento.

A participação aparece depois de pelo menos um lance aceito. Os lotes vencidos são identificados pelo resultado da liquidação, não por uma liderança temporária. A participação histórica em lote cancelado continua visível e não aparece como arremate.

### RF-13 - Gerar e compartilhar comprovante

Cada arremate liquidado tem comprovante e link de compartilhamento. O comprovante identifica o lote, as cartas, o valor final, o vencedor de forma não pessoal e o momento do encerramento.

O comprovante corresponde ao resultado persistido e continua acessível sem a YGOPRODeck. O link compartilhado não revela e-mail, nome completo, credenciais nem outros dados pessoais.

### RF-14 - Disponibilizar auditoria pública

Qualquer pessoa, inclusive sem login, consulta o histórico completo de lances aceitos de um lote e o resultado da verificação de integridade por hash.

- A página mostra a sequência dos lances, os valores, as datas e os identificadores não pessoais dos licitantes.
- O histórico inclui os lances anteriores ao cancelamento, quando houver.
- A auditoria diferencia um histórico validado de um histórico em que a adulteração foi detectada.
- Uma verificação que falhou, ou a ausência da referência de que a verificação precisa, não é apresentada como histórico íntegro.



### RF-15 - Cancelar lotes com liberação da reserva

O leiloeiro cancela os próprios lotes agendados ou ao vivo, mesmo depois de lances aceitos. O cancelamento libera o saldo comprometido do líder, preserva o histórico e retira o lote da vitrine.

- Somente o leiloeiro dono cancela o lote.
- Um lote cancelado não aceita novos lances, não produz vencedor e não liquida como arremate.
- O valor reservado para esse lote volta integralmente ao disponível do líder.
- Nenhuma carteira recebe um depósito extra. Antes da liquidação o valor estava reservado, não debitado.
- Repetir o cancelamento não libera a mesma reserva duas vezes.
- Lotes já encerrados e liquidados não podem ser cancelados por este fluxo. Estorno de arremate concluído está fora do escopo.



## Requisitos não funcionais



### RNF-01 - Continuar funcionando com a API externa indisponível

Vitrine, salas, carteira, auditoria e comprovantes de lotes já publicados continuam funcionando quando a YGOPRODeck está indisponível ou limita as requisições. A espera e o tratamento da falha dessa chamada externa não tornam essas funcionalidades inutilizáveis.

A documentação do provedor informa limite de 20 requisições por segundo e bloqueio de uma hora ao excedê-lo. Esses números pertencem ao provedor e podem mudar. A integração respeita os limites vigentes, evita chamadas repetidas e não tenta de novo sem um limite.

Aceitação: com a API externa falha ou bloqueada, um lote existente ainda pode ser aberto e disputado, encerrado, conferido no comprovante e auditado. A busca de cartas informa a própria indisponibilidade sem afetar esses fluxos.

### RNF-02 - Persistência, atomicidade e idempotência

Lances aceitos, reservas, transferências, cancelamentos e resultados persistem. Operações de negócio que alteram várias linhas não deixam estado parcial. Liquidação e cancelamento podem ser executados de novo sem duplicar efeitos.

Uma falha no meio da operação não deixa lance aceito sem reserva, saldo reservado sem o líder correspondente, nem débito sem crédito. Depois de um reinício, os dados gravados continuam coerentes. Lotes cujo tempo já acabou chegam ao resultado correto sem depender de alguém manter a sala aberta.

### RNF-03 - Segurança e privacidade dos acessos

O servidor valida a entrada e aplica autenticação e autorização. Eventos WebSocket seguem as mesmas permissões das operações HTTP. Segredos de autenticação e de banco não aparecem no frontend, em recursos públicos nem no repositório.

Os testes mostram o bloqueio de operações sem permissão, inclusive acesso a lote alheio e alteração da carteira de outra pessoa. Auditoria e comprovantes expõem somente os dados de que esses recursos precisam.

### RNF-04 - Precisão monetária e referência temporal

Valores de saldo, reserva e lance usam uma representação adequada a dinheiro, sem erro de arredondamento de ponto flutuante. O servidor é a referência de início, término e prorrogação. A contagem regressiva do frontend só apresenta esse estado.

Somas, reservas, liberações e liquidações mantêm a fórmula de saldo, e um débito é igual ao crédito correspondente. A moeda é BRL. Os valores decimais usam duas casas. Cada depósito, lance inicial, incremento mínimo, lance aceito e movimentação individual da carteira tem teto de R$ 1.000.000,00. Saldos de carteira se acumulam e ficam limitados por `numeric(18,2)`, sem teto comercial extra sobre o total acumulado. As datas seguem a regra registrada em “Decisões que a API já fechou”.

### RNF-05 - Ambiente com Docker Compose

O ambiente de avaliação cobre PostgreSQL, a API e este frontend. Dados persistentes e imagens armazenadas têm uma estratégia de persistência no ambiente da API.

Neste repositório, o Compose sobe somente o Next.js. PostgreSQL, migrações e seed ficam no repositório da API. Veja [frontend.md](./frontend.md).

### RNF-06 - Testes automatizados

Os comportamentos críticos têm testes automatizados. Não se exige ferramenta específica, percentual de cobertura nem pipeline de CI. A forma de executar os testes está documentada e é reproduzível.

Cobertura mínima de aceitação:

- Papéis e autorização, inclusive a proibição de o leiloeiro dar lance e de gerenciar lote alheio.
- Primeiro lance, incremento mínimo, recusa do líder atual e janela temporal do lote.
- Depósito, cálculo de saldo, reservas em vários lotes e liberação ao ser superado.
- Lances concorrentes, e a impossibilidade de comprometer mais do que o saldo disponível.
- Prorrogação anti-sniping e os limites temporais dela.
- Encerramento com vencedor, encerramento sem lances e reexecução da liquidação.
- Cancelamento com e sem lances, liberação única da reserva e disputa com o encerramento.
- Auditoria de histórico íntegro, alterado, com registro removido e com registro inserido.
- Auditoria e comprovantes não expõem dados pessoais.
- Lotes existentes continuam operando com a API externa indisponível.
- Integração WebSocket, propagação para clientes distintos e recuperação de estado depois da reconexão.

A validação visual dos dois temas, a inicialização por Docker Compose e o ambiente publicado complementam os testes automatizados. Não os substituem.

### RNF-07 - Feedback compreensível e consistente

Falhas de negócio são compreensíveis e coerentes entre a interface e o servidor. A pessoa distingue recusa de lance, problema de conexão e busca de cartas indisponível. Erros técnicos e segredos não aparecem no lugar de mensagens de uso.

Cada recusa do RF-07 produz o motivo correspondente. Uma desconexão não é mostrada como uma operação concluída que o servidor não confirmou. Não há meta numérica de latência, disponibilidade, capacidade ou SLA. Esses números não são inventados aqui. Atualizar sem recarregar, e os testes concorrentes, continuam obrigatórios.

## Regras de negócio



### RN-01 - Estados do lote

Os estados que uma pessoa vê são agendado, ao vivo, encerrado e cancelado. Agendado é o período anterior ao início, calculado pelo relógio do servidor. Um lote encerrado indica se houve arremate ou se terminou sem lances. O estado efetivo usa o relógio do servidor e o término vigente, não só o que o cliente pintou por último.

Cancelado e encerrado são terminais para lance neste escopo. Um lote cancelado não volta à vitrine e não é reaberto automaticamente.

O valor gravado pela API é `ACTIVE`, `ENDED` ou `CANCELED`. Agendado e ao vivo são calculados. O cliente renderiza o campo `status` que as rotas de leitura devolvem. Veja [api/conventions.md](./api/conventions.md).

### RN-02 - Quando um lance é aceito

Lances só são aceitos enquanto o lote está ao vivo: depois do início e antes do término vigente. Um lance enviado antes do início ou depois do término vigente é recusado, mesmo se o cliente ainda mostra um estado antigo.

### RN-03 - Lance mínimo, e o líder não cobre o próprio lance

Sem lance anterior, o valor precisa ser maior ou igual a `openingBid`. Com lance atual, o novo valor precisa ser maior ou igual ao lance atual mais o incremento mínimo. O líder não cobre o próprio lance.

O servidor recalcula o mínimo no momento da aceitação. Dois clientes não aceitam valores que só eram válidos contra um estado que já passou.

### RN-04 - Cálculo dos saldos

```text
saldo disponível = saldo total − saldo comprometido
```

O saldo comprometido é a soma das reservas dos lotes em que o licitante lidera. Um novo lance só é aceito quando o valor integral cabe no saldo disponível naquele momento. Comprometido e disponível não ficam negativos.

### RN-05 - Reserva e troca de liderança

Um lance aceito compromete o valor na carteira do novo líder. Quando um líder é superado, a reserva daquele lote é liberada na hora. A substituição mantém saldo, histórico e liderança consistentes como uma única operação de negócio.

Perder a liderança em um lote não libera as reservas dos outros lotes do mesmo licitante. A atualização em tempo real é publicada depois que a gravação tem sucesso.

### RN-06 - Prorrogação anti-sniping

Um lance aceito nos últimos dois minutos prorroga o término do lote em dois minutos. Um lance recusado não prorroga o lote.

O texto original não dizia se esses dois minutos são somados ao término anterior ou contados a partir do lance, nem como prorrogações sucessivas funcionam. Os contratos de lance e de sala fecham isso. Veja abaixo.

### RN-07 - Liquidação do vencedor

Quando um lote com lances encerra, o líder válido é o vencedor. O lance dele é debitado do saldo total e creditado ao leiloeiro. A reserva correspondente deixa de contar como comprometida. A transferência e o resultado são gravados uma vez.

Não há comissão nem desconto extra neste escopo.

### RN-08 - Encerramento sem vencedor

Um lote sem lances aceitos encerra sem vencedor, sem movimentação de carteira e sem comprovante de arremate.

### RN-09 - Cancelamento libera a reserva

Antes da liquidação, cancelar significa liberar a reserva, e não criar crédito extra. O saldo total do líder permanece igual. O comprometido diminui pelo valor reservado naquele lote, e o disponível aumenta pelo mesmo valor.

O cancelamento preserva o histórico de lances e o vínculo com o lote, para que participação e auditoria continuem consultáveis.

### RN-10 — Disputa entre lance, cancelamento e encerramento

Operações concorrentes produzem uma única ordem válida de acontecimentos. Não há lance aceito em lote já cancelado ou encerrado, nem cancelamento que também liquide um vencedor, nem uso do mesmo saldo disponível para assumir reservas incompatíveis em lotes diferentes.

### RN-11 - Identificação sem dados pessoais

Auditoria e comprovantes usam identificadores não pessoais para os licitantes. E-mail, nome completo, dados de autenticação e outros dados privados não são devolvidos nesses recursos, inclusive pela API.

O identificador distingue participantes e identifica o vencedor sem publicar dados pessoais. Nesta API, esse identificador é o número do participante dentro do lote.

### RN-12 - Integridade do histórico

Alterações, remoções e inserções posteriores no histórico de lances aceitos, inclusive edições feitas direto no banco, são detectadas pela auditoria usando hash. A verificação cobre conteúdo, ordem e completude. Conferir só que cada linha tem um hash não atende ao requisito.

A solução trata, em particular, a remoção do último registro e a reconstrução de parte do histórico. Mudanças legítimas de estado, como cancelamento e encerramento, não apagam nem reescrevem os lances anteriores.

O cliente não calcula o hash. Ele renderiza os três resultados que a rota de auditoria devolve: íntegro, adulterado e falha na verificação. Veja [api/audit.md](./api/audit.md).

### RN-13 - Dados da carta independentes do catálogo

Os dados de apresentação usados no lote são gravados pela aplicação. Mudanças posteriores na API do catálogo não alteram em silêncio o item de um lote já publicado. Vitrine, sala, auditoria e comprovante de lotes existentes não precisam de uma chamada externa.

As imagens são armazenadas e servidas pela aplicação, ou por um armazenamento sob controle dela. O provedor exige baixar e hospedar as imagens em vez de fazer hotlink, e guardar localmente os dados recebidos.

### RN-14 - Consulta de cartas e busca de lotes são separadas

O título no Notion é a separação entre consultar cartas e buscar lotes. O corpo sob esse título repete o RNF-01. O comportamento que o título nomeia já é exigido por RN-13 e RF-05: a busca de cartas fala com o catálogo, e a busca de lotes usa o título e o nome da carta gravados no lote.

## Decisões que a API já fechou

Estes pontos ainda estavam abertos na página de requisitos. As páginas de endpoint descrevem o comportamento que o cliente segue.

**Prorrogação (P-02, RN-06).** Um lance aceito com dois minutos ou menos restantes soma dois minutos ao `endsAt` atual e incrementa `extensionCount` em um. Um lance aceito depois, dentro da nova janela, pode prorrogar o lote de novo. Use o `endsAt` da resposta do lance ou do próximo snapshot da sala.

**Janela de tempo (P-06, RN-02).** O instante de início já é ao vivo: `serverNow >= startsAt` e `serverNow < endsAt`. O instante de fim já é encerrado: `serverNow >= endsAt`. `CANCELED` prevalece sobre o relógio.

**Duração na criação.** `endsAt` está no futuro, e `endsAt - startsAt` é de pelo menos 24 horas. Exatamente 24 horas é aceito. `startsAt` pode estar no passado. O formulário deste repositório ainda aceita durações menores. Veja [frontend.md](./frontend.md).

**Teto do depósito (P-04).** Os requisitos limitam cada depósito a R$ 1.000.000,00. `POST /private/wallet/deposits`, como documentada, aceita até `"9999999999999999.99"` e recusa um depósito que levaria a carteira além desse limite numérico (`AMOUNT_OUT_OF_RANGE`). Siga a rota até a API passar a aplicar o teto comercial.

**Lote inteiro.** Cancelamento e liquidação valem para o lote. Não há venda parcial de uma carta dentro dele.
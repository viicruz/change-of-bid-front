# Este frontend

O app é a interface do leilão. A API, o banco e a liquidação ficam em [change-of-bid-back](https://github.com/viicruz/change-of-bid-back). A origem das chamadas é `NEXT_PUBLIC_BACKEND_URL`.

## Telas

| Rota | Quem entra | O que a tela faz |
| --- | --- | --- |
| `/` | Qualquer pessoa | Vitrine. Busca por `q` e filtro de status (`LIVE`, `SCHEDULED`, `ENDED`). Lotes cancelados não aparecem. |
| `/sign-up` | Qualquer pessoa | Cria a conta com nome, e-mail, senha e papel. |
| `/sign-in` | Qualquer pessoa | Entra com e-mail e senha. |
| `/auction/[id]` | Qualquer pessoa | Sala do lote. Visitante vê o snapshot. Licitante autenticado pode dar lance enquanto o lote está `LIVE` e ele não é o líder. |
| `/auction/[id]/audit` | Qualquer pessoa | Histórico de lances aceitos e o resultado da verificação de integridade. |
| `/receipts/[shareToken]` | Qualquer pessoa com o token | Comprovante público do arremate. |
| `/wallet` | Licitante | Saldo total, comprometido, disponível, extrato e depósito simulado. |
| `/my-bids` | Licitante | Lotes em que a pessoa deu lance, com vitória liquidada, sala, auditoria e comprovante quando existem. |
| `/auctioneer` | Leiloeiro | Busca de cartas, criação de lote, lista dos próprios lotes e cancelamento. |

`/auctioneer` redireciona para `/` quando a sessão do servidor não tem `role` igual a `AUCTIONEER`. O restante da navegação esconde atalhos pelo papel lido na sessão. Isso organiza a interface. A autorização que vale é a da API: `401` sem sessão e `403` com o código da rota.

## O que a tela só apresenta

Estes valores já vêm prontos. Recalcular no cliente produz um estado que a API pode recusar no instante seguinte.

- **Status do lote.** Renderize `status`. Agendado e ao vivo não são um enum gravado. A criação é a exceção: a resposta de `POST /private/lots` traz `ACTIVE`.
- **Dinheiro.** String decimal. O saldo disponível já vem em `availableBalance`.
- **Relógio.** A contagem usa `serverNow` com `startsAt` ou `endsAt`. Um lance aceito nos últimos dois minutos troca `endsAt`; a contagem anterior é descartada.
- **“Você está ganhando”.** Compare `viewerParticipantNo` com `leaderParticipantNo`. O socket não diz quem é o usuário.
- **Integridade.** Mostre íntegro, adulterado ou falha na verificação. O cliente não calcula hash.
- **Participante.** “Licitante #3”, a partir de `participantNo` daquele lote. Nome, e-mail e id de usuário não vêm nesses payloads.
- **Carta de um lote publicado.** `cardName` e `imagePath` do item. A vitrine, a sala, a auditoria e o comprovante não chamam a YGOPRODeck.

O preço em destaque é `currentBid` quando não é `null`. Sem lance, é `openingBid`.

`ENDED` com `bidCount > 0` e `sold: false` ainda está sendo liquidado. Mantenha o histórico e espere o snapshot que preenche `sold` e `winnerParticipantNo`. `ENDED` com `bidCount === 0` encerrou sem lances.

## Papel no cadastro

O formulário envia `role`: `BIDDER` ou `AUCTIONEER`. A navbar e `/auctioneer` leem `user.role` da sessão. O schema do cliente exige esse campo; uma resposta de cadastro sem `role` é tratada como falha.

As páginas de rota do Notion ainda dizem que o cadastro ignora `role` e grava sempre `BIDDER`. Se a API continuar assim, o seletor não cria um leiloeiro. As contas do seed descritas no README são o caminho conhecido para cada papel.

## Duração na criação do lote

A API exige `endsAt` no futuro e duração de pelo menos 24 horas. Menos que isso volta `422` `INVALID_SCHEDULE`, com a frase `The lot must last at least 24 hours, and the end must be in the future.`

O formulário deste repositório aceita a partir de 4 minutos e oferece um atalho de 5 minutos, além de 1, 3, 5 e 7 dias. Um lote que o formulário deixa passar ainda pode ser recusado pela API. A regra que vale no servidor está em [api/lots.md](./api/lots.md).

## Busca de cartas

O painel do leiloeiro envia `fname`, `type`, `attribute`, `archetype`, `level` como comparação, `sort`, `num` 16 e `offset`. Os outros filtros do catálogo existem na rota e no hook, e a tela não os usa.

Uma busca sem correspondência chega como `500` com a mensagem `No card matching your query was found in the database.` O hook transforma isso em lista vazia, e a tela mostra “Nenhuma carta encontrada.” Qualquer outra falha mostra “Não foi possível buscar as cartas.” Essa frase não separa limite do provedor de uma falha genérica. Lotes já publicados continuam nas outras rotas.

A imagem do seletor é a URL do catálogo. O lote publicado usa `imagePath`. Este app não baixa nem hospeda a imagem. Se `imagePath` ainda apontar para a YGOPRODeck, isso é o que a API gravou.

## O que a interface ainda não cobre

- O painel do leiloeiro mostra o resultado de cada lote. Não há um total somado do que já foi creditado ao leiloeiro.
- `docker-compose.yml` sobe só este Next.js, na rede do host, em `http://localhost:3000`, falando com a API em `NEXT_PUBLIC_BACKEND_URL`. PostgreSQL e a API não entram nesse compose.
- A vitrine filtra por texto e por status. Não filtra por tipo de carta, atributo, raridade ou preço. Esses filtros estão na busca de cartas do leiloeiro, que é outra rota.

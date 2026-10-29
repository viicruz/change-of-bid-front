# Lotes

Dinheiro, datas, status e erros seguem [conventions.md](./conventions.md).

Campos compartilhados do item, salvo quando uma rota disser o contrário:

| Campo | Tipo | Uso |
| --- | --- | --- |
| `id` | UUID | Id do item. |
| `position` | number | Ordem de exibição, começando em 1. |
| `cardId` | number | Id da carta no catálogo. |
| `quantity` | number | Cópias dessa carta no lote. |
| `cardName` | string | Nome congelado quando a carta entrou no lote. |
| `imagePath` | string | URL da imagem a renderizar. |

`cardName` e `imagePath` permanecem como estavam na criação. Uma renomeação posterior no catálogo não os altera. Não consulte o catálogo de cartas para renderizar um lote já publicado.

## Criar um lote

`POST /private/lots`

Cria um lote para o leiloeiro autenticado. Os ids das cartas vêm de [cards.md](./cards.md). Uma requisição rejeitada não cria lote.

### Autenticação

| Status | Quando | Corpo |
| --- | --- | --- |
| 401 | Sessão ausente ou inválida | Texto puro `Unauthorized`. Não é JSON e não tem `code`. |
| 403 | O usuário autenticado não é leiloeiro | `{ "code": "NOT_AUCTIONEER", "message": "Only an auctioneer can create a lot." }` |

### Requisição

```json
{
  "title": "Blue-Eyes lot",
  "description": "Optional text",
  "openingBid": "10.00",
  "minIncrement": "0.50",
  "startsAt": "2026-10-26T18:00:00.000Z",
  "endsAt": "2026-10-27T18:00:00.000Z",
  "cardIds": [89631139, 46986414]
}
```

| Campo | Tipo | Regras |
| --- | --- | --- |
| `title` | string | Obrigatório. Sem espaços nas pontas. Não pode ficar vazio. |
| `description` | string, `null` ou omitido | Sem espaços nas pontas. Omitido, `null`, `""` ou só espaços é gravado e devolvido como `null`. |
| `openingBid` | string | Dinheiro. Veja as convenções. |
| `minIncrement` | string | Dinheiro. Veja as convenções. |
| `startsAt` | string | Datetime ISO 8601 com offset de fuso. |
| `endsAt` | string | Datetime ISO 8601 com offset de fuso. |
| `cardIds` | number[] | Pelo menos um inteiro positivo. A ordem é a ordem do lote. |

Agenda:

- `endsAt` precisa estar no futuro.
- `endsAt - startsAt` precisa ser de pelo menos 24 horas. Exatamente 24 horas é aceito.
- `startsAt` pode estar no passado ou no futuro.

O formulário deste repositório valida um mínimo menor. A API continua recusando abaixo de 24 horas. Veja [frontend.md](../frontend.md).

Cartas:

- Não há campo de quantidade. Cada entrada vira um item com `quantity: 1`. Enviar o mesmo id duas vezes cria dois itens.
- Todo id já precisa estar no catálogo e ter imagem.
- A posição na resposta começa em `1`.

### 201

```json
{
  "id": "6d5c0c3e-2b1a-4f0e-9c2a-1a2b3c4d5e6f",
  "auctioneerId": "user-id",
  "title": "Blue-Eyes lot",
  "description": null,
  "openingBid": "10.00",
  "minIncrement": "0.50",
  "startsAt": "2026-10-26T18:00:00.000Z",
  "originalEndsAt": "2026-10-27T18:00:00.000Z",
  "endsAt": "2026-10-27T18:00:00.000Z",
  "status": "ACTIVE",
  "items": [
    {
      "id": "item-id",
      "position": 1,
      "cardId": 89631139,
      "quantity": 1,
      "cardName": "Blue-Eyes White Dragon",
      "imagePath": "https://images.ygoprodeck.com/images/cards/89631139.jpg"
    }
  ]
}
```

`originalEndsAt` e `endsAt` são iguais na criação. `status` é `"ACTIVE"`. Use `startsAt` e `endsAt` para decidir o que a tela mostra. `items` segue a ordem de `cardIds`. A resposta não inclui o payload completo da carta vindo da busca.

### Erros

| Status | `code` | Quando | Campos extras |
| --- | --- | --- | --- |
| 403 | `NOT_AUCTIONEER` | O usuário não é leiloeiro. | — |
| 422 | `INVALID_SCHEDULE` | O lote dura menos de 24 horas, ou `endsAt` não está no futuro. | — |
| 422 | `UNKNOWN_CARDS` | Um ou mais ids não estão no catálogo. | `cardIds`: os ids que faltam |
| 422 | `CARD_WITHOUT_IMAGE` | Uma ou mais cartas não têm imagem. | `cardIds`: esses ids de carta |
| 422 | `INVALID_MONEY` | Um valor de dinheiro é zero, negativo ou tem mais de 2 casas decimais. | — |

```json
{
  "code": "UNKNOWN_CARDS",
  "message": "One or more cards are not in the catalog.",
  "cardIds": [123]
}
```

`cardIds` só está presente em `UNKNOWN_CARDS` e `CARD_WITHOUT_IMAGE`. Destaque essas cartas e peça para a pessoa removê-las.

Mensagens:

- `NOT_AUCTIONEER`: `Only an auctioneer can create a lot.`
- `INVALID_SCHEDULE`: `The lot must last at least 24 hours, and the end must be in the future.`
- `UNKNOWN_CARDS`: `One or more cards are not in the catalog.`
- `CARD_WITHOUT_IMAGE`: `One or more cards do not have an image.`
- `INVALID_MONEY`: `Money values must be greater than zero and have at most 2 decimal places.`

Uma requisição normal com string de dinheiro inválida é rejeitada como validação de corpo antes de `INVALID_MONEY`. Trate os dois casos: validação quando `type` é `"validation"`, e `code` quando ele está presente.

A validação `422` cobre título em branco, `cardIds` vazio, id que não é inteiro, dinheiro no formato errado ou datetime sem offset.

```json
{
  "type": "validation",
  "on": "body",
  "property": "/startsAt",
  "message": "Invalid ISO datetime"
}
```

## Listar lotes públicos

`GET /public/lots`

Sem sessão e sem corpo. A lista inteira volta já ordenada.

| Parâmetro | Valores | Efeito |
| --- | --- | --- |
| `q` | texto | Correspondência parcial no título do lote ou no nome da carta gravado em um item. |
| `status` | `SCHEDULED`, `LIVE` ou `ENDED` | Filtra pelo status atual. |

Os dois são opcionais. Quando os dois são enviados, o lote precisa passar nos dois.

`q` ignora espaços nas pontas. Vazio ou só com espaços equivale a omitir o parâmetro. A comparação não diferencia maiúsculas de minúsculas. `%`, `_` e `\` são caracteres literais.

A busca olha o título do lote e o nome da carta gravado no item. Não olha a descrição nem o nome atual no catálogo. Se várias cartas do mesmo lote corresponderem, o lote aparece uma vez. `items` nessa lista é uma prévia; `totalItems` é a contagem do lote.

`status` fora dessa lista, inclusive `ACTIVE` e `CANCELED`, é `422` com `type: "validation"`. Lotes cancelados nunca aparecem, com ou sem filtro.

Nada encontrado é `200` com `lots: []`.

Ordem:

1. `LIVE`, o `endsAt` mais próximo primeiro.
2. `SCHEDULED`, o `startsAt` mais próximo primeiro.
3. `ENDED`, o `endsAt` mais recente primeiro.

```json
{
  "lots": [
    {
      "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      "title": "Blue-Eyes",
      "description": null,
      "openingBid": "10.00",
      "minIncrement": "1.00",
      "startsAt": "2026-10-26T16:00:00.000Z",
      "endsAt": "2026-10-26T18:00:00.000Z",
      "status": "SCHEDULED",
      "currentBid": null,
      "bidCount": 0,
      "sold": false,
      "totalItems": 1,
      "items": [
        {
          "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
          "position": 1,
          "cardId": 89631139,
          "quantity": 1,
          "cardName": "Blue-Eyes White Dragon",
          "imagePath": "https://images.example/blue-eyes.jpg"
        }
      ]
    }
  ]
}
```

| Campo | Uso |
| --- | --- |
| `currentBid` | Lance líder, ou `null` quando ninguém deu lance. |
| `bidCount` | Lances aceitos. |
| `sold` | `true` só quando o lote tem vencedor. |
| `endsAt` | Fim atual. Se o lote foi prorrogado, este já é o novo fim. |
| `items` | Cartas na ordem de `position`. O hook da vitrine trata esta lista como prévia de no máximo cinco itens. |
| `totalItems` | Quantidade real de cartas do lote. A contagem no card da vitrine lê este campo. |

Para o preço em destaque, use `currentBid` quando não for `null`. Caso contrário, use `openingBid`.

## Ler um lote público

`GET /public/lots/{id}`

Sem corpo e sem query. `{id}` precisa ser um UUID. Este é o snapshot da sala pública. O socket ao vivo envia o mesmo `lot`. Veja [lot-room.md](./lot-room.md).

A rota funciona sem sessão. Uma sessão válida só preenche `viewerParticipantNo`. Sessão ausente, expirada ou inválida ainda é `200`, com `viewerParticipantNo: null`.

```json
{
  "serverNow": "2026-10-27T12:00:00.000Z",
  "viewerParticipantNo": 6,
  "lot": {
    "id": "uuid",
    "title": "Room Dragon",
    "description": null,
    "openingBid": "10.00",
    "minIncrement": "1.00",
    "startsAt": "2026-10-27T13:00:00.000Z",
    "endsAt": "2026-10-27T15:00:00.000Z",
    "extensionCount": 0,
    "status": "SCHEDULED",
    "currentBid": null,
    "leaderParticipantNo": null,
    "bidCount": 0,
    "sold": false,
    "winnerParticipantNo": null,
    "items": [],
    "bids": []
  }
}
```

`viewerParticipantNo` é o número deste usuário neste lote. É `null` quando não há sessão válida, ou quando esse usuário não tem lance aceito neste lote.

`extensionCount` é quantas vezes `endsAt` foi adiado. `leaderParticipantNo` é o número do líder, ou `null`. `winnerParticipantNo` é o número do vencedor, ou `null`. Um lote cancelado ainda pode ter lances e `sold: false`.

Cada item também inclui `cardSnapshot`, os dados da carta gravados com o lote. `card_images` é removido. Renderize `imagePath`.

`bids` são só lances aceitos, ordenados por `sequence` crescente (o mais antigo primeiro):

| Campo | Tipo |
| --- | --- |
| `sequence` | number |
| `amount` | string, duas casas decimais |
| `createdAt` | ISO 8601 |
| `participantNo` | number |

Compare `participantNo` com `viewerParticipantNo` para destacar os lances do usuário atual, e com `leaderParticipantNo` e `winnerParticipantNo` do mesmo jeito.

| Status | Quando |
| --- | --- |
| 404 | UUID válido, lote inexistente. `{ "code": "LOT_NOT_FOUND", "message": "Lot was not found." }` |
| 422 | `{id}` não é um UUID. `type: "validation"`. |

## Listar os lotes do leiloeiro

`GET /private/lots`

Sessão obrigatória. Somente leiloeiro. A lista é sempre a dos lotes do leiloeiro autenticado.

| Parâmetro | Valores | Efeito |
| --- | --- | --- |
| `q` | texto | Correspondência parcial, sem diferenciar maiúsculas, no título do lote ou no nome de uma carta. Espaços nas pontas são ignorados. Vazio significa sem filtro. |
| `status` | `SCHEDULED`, `LIVE`, `ENDED`, `CANCELED` | Status atual. `ACTIVE` não é aceito. |

Os dois são opcionais e se combinam. Sem nenhum dos dois, a rota devolve todos os lotes deste leiloeiro.

Ordem:

1. `LIVE`, o `endsAt` mais próximo primeiro.
2. `SCHEDULED`, o `startsAt` mais próximo primeiro.
3. `ENDED`, o `endsAt` mais recente primeiro.
4. `CANCELED`, o cancelado mais recente primeiro.

```json
{
  "totalReceived": "150.00",
  "lots": [
    {
      "id": "uuid",
      "title": "Lote de dragões",
      "description": null,
      "openingBid": "10.00",
      "minIncrement": "0.50",
      "startsAt": "2026-10-26T18:00:00.000Z",
      "endsAt": "2026-10-27T18:00:00.000Z",
      "status": "LIVE",
      "currentBid": "12.50",
      "bidCount": 3,
      "sold": false,
      "receivedAmount": null,
      "items": [
        {
          "id": "uuid",
          "position": 1,
          "cardId": 42,
          "quantity": 1,
          "cardName": "Panel Dragon",
          "imagePath": "https://images.example/panel.jpg"
        }
      ]
    }
  ]
}
```

- `totalReceived` é o valor já creditado a este leiloeiro em todos os lotes liquidados. Não muda com `q` nem com `status`.
- `receivedAmount` é o valor creditado por aquele lote, ou `null` quando ainda não foi liquidado.
- Lista vazia é `200` com `"lots": []`.

| Status | Quando | Corpo |
| --- | --- | --- |
| 401 | Sem sessão. | Sem `code`. |
| 403 | O usuário autenticado não é leiloeiro. | `{ "code": "NOT_AUCTIONEER", "message": "Only an auctioneer can list their lots." }` |
| 422 | Query inválida, por exemplo `status=ACTIVE`. | `{ "type": "validation", ... }`. Sem `code` de negócio. |

## Ler um lote como o leiloeiro dono

`GET /private/lots/{id}`

Carrega um lote para o leiloeiro que é dono dele: agenda, cartas, histórico de lances e liquidação. A resposta é um snapshot. Chame de novo para ver lances mais novos ou uma mudança de status.

`id` é o UUID do lote. Sem query e sem corpo. Quem chama precisa ser leiloeiro e dono do lote.

```json
{
  "serverNow": "2026-10-26T15:00:00.000Z",
  "lot": {
    "id": "6f1c2a40-7b3e-4d1a-9c20-1a2b3c4d5e6f",
    "title": "Blue-Eyes lot",
    "description": null,
    "openingBid": "10.00",
    "minIncrement": "0.50",
    "startsAt": "2026-10-26T14:00:00.000Z",
    "endsAt": "2026-10-26T16:00:00.000Z",
    "extensionCount": 0,
    "status": "LIVE",
    "currentBid": "15.00",
    "leaderParticipantNo": 4,
    "bidCount": 2,
    "sold": false,
    "winnerParticipantNo": null,
    "receivedAmount": null,
    "items": [],
    "bids": []
  }
}
```

O formato de `lot` é o da leitura pública, mais `receivedAmount`. Os itens incluem `cardSnapshot`. `bids` é cada lance aceito, do mais antigo para o mais novo. `bidCount` corresponde a `bids.length`. O último lance é o lance líder: o `participantNo` dele é `leaderParticipantNo` e o `amount` dele é `currentBid`.

`receivedAmount` permanece `null` enquanto o lote está `LIVE`, mesmo quando `currentBid` tem valor. Depois da liquidação, é o valor creditado, o mesmo valor do lance vencedor. Um lote `ENDED` com `sold: false` encerrou sem vencedor, então `winnerParticipantNo` e `receivedAmount` são `null`.

`cardSnapshot` pode conter campos extras do catálogo, como `atk`. Trate chaves desconhecidas como opcionais. Ele não inclui `card_images`.

| Status | `code` | Quando | `message` |
| --- | --- | --- | --- |
| 401 | — | Sem sessão válida. | Sem `code`. |
| 403 | `NOT_AUCTIONEER` | O usuário autenticado não é leiloeiro. | `Only an auctioneer can view their lot.` |
| 403 | `LOT_NOT_OWNED` | O lote pertence a outro leiloeiro. | `Only the owner can view this lot.` |
| 404 | `LOT_NOT_FOUND` | Não existe lote com esse id. | `Lot was not found.` |
| 422 | — | `id` não é um UUID. | `type: "validation"`, sem `code`. |

## Cancelar um lote

`POST /private/lots/{id}/cancel`

Cancela um lote do leiloeiro autenticado. Sem corpo. `id` é um UUID.

Um lote que ainda não começou e um lote que já está ao vivo podem ser cancelados, desde que `endsAt` ainda esteja no futuro. Se o lote tem lance líder, a reserva desse líder é liberada. A resposta não inclui dados de carteira nem de lance.

Chamar a rota de novo em um lote que já está `CANCELED` devolve `200` com o mesmo corpo, inclusive o `canceledAt` original.

### 200

```json
{
  "id": "3f1c2a4e-8b0d-4e6a-9c11-2d5f7a8b9c0d",
  "status": "CANCELED",
  "canceledAt": "2026-10-27T03:39:00.000Z"
}
```

| Status | `code` | Quando | `message` |
| --- | --- | --- | --- |
| 401 | — | Sessão ausente ou inválida. | Sem corpo JSON. |
| 403 | `NOT_AUCTIONEER` | O usuário autenticado não é leiloeiro. | `Only an auctioneer can cancel a lot.` |
| 403 | `LOT_NOT_OWNED` | Outro leiloeiro é dono do lote. | `Only the owner can cancel this lot.` |
| 404 | `LOT_NOT_FOUND` | Não existe lote com este id. | `Lot was not found.` |
| 409 | `LOT_NOT_CANCELABLE` | O lote está `ENDED`, ou `endsAt` já passou. | `Only a scheduled or live lot can be canceled.` |
| 422 | — | `id` não é um UUID. | `type: "validation"`. |

`409` deixa o lote como está. Desabilite o cancelamento quando o lote está encerrado ou o horário de fim já passou.

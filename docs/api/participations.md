# Participações

`GET /private/participations`

Lista os lotes em que o licitante autenticado deu lance. Uma requisição, sem filtros, sem paginação e sem corpo. O array já vem ordenado. O servidor usa o usuário da sessão.

A origem do navegador precisa ser a origem da página configurada.

Um lote aparece só depois que este usuário tem um lance aceito nele. Abrir a página do lote não o inclui. Lotes em que outro licitante entrou ficam de fora. Um licitante sem lances recebe `200` e `{ "lots": [] }`. Um leiloeiro recebe `403`.

## 200

```json
{
  "lots": [
    {
      "id": "6d8f0c3e-1b2a-4c5d-9e0f-123456789abc",
      "title": "Blue-Eyes",
      "description": "Main deck",
      "openingBid": "10.00",
      "minIncrement": "1.00",
      "startsAt": "2026-10-26T15:00:00.000Z",
      "endsAt": "2026-10-26T17:00:00.000Z",
      "status": "LIVE",
      "currentBid": "12.50",
      "bidCount": 2,
      "participantNo": 3,
      "won": false,
      "items": [
        {
          "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
          "position": 1,
          "cardId": 89631139,
          "quantity": 1,
          "cardName": "Blue-Eyes White Dragon",
          "imagePath": "https://images.example/card.jpg"
        }
      ]
    }
  ]
}
```

| Campo | Significado |
| --- | --- |
| `openingBid`, `minIncrement` | Strings decimais com duas casas, sem símbolo de moeda. |
| `startsAt`, `endsAt` | Timestamps ISO 8601 em UTC. `endsAt` é exclusivo: o lote ainda está ao vivo no instante anterior a ele. |
| `status` | `SCHEDULED`, `LIVE`, `ENDED` ou `CANCELED`. Calculado na hora da requisição. |
| `currentBid` | Lance líder do lote, ou `null`. É o maior lance do lote, não o último lance deste usuário. |
| `bidCount` | Lances aceitos no lote, de todos os licitantes. |
| `participantNo` | Número deste usuário neste lote. Atribuído no primeiro lance aceito dele. Estável, começa em 1. |
| `won` | `true` só quando este usuário é o vencedor registrado. |
| `items` | Cartas, ordenadas por `position`. `imagePath` já serve de `src` de imagem. |

`won` permanece `false` enquanto o lote está ao vivo, mesmo se este usuário lidera. Também permanece `false` quando a janela fechou e o vencedor ainda não foi gravado, quando outra pessoa venceu e quando o lote foi cancelado. `ENDED` mais `won: false` não basta para mostrar “você perdeu” no instante em que o relógio chega em `endsAt`.

| `status` | Quando |
| --- | --- |
| `SCHEDULED` | `startsAt` ainda está no futuro. |
| `LIVE` | `startsAt` já passou e `endsAt` ainda não. |
| `ENDED` | A janela fechou, ou o lote já foi liquidado. |
| `CANCELED` | O leiloeiro cancelou. `won` é `false`. |

Ordem:

1. `LIVE`, o `endsAt` mais próximo primeiro.
2. `SCHEDULED`, o `startsAt` mais próximo primeiro.
3. `ENDED`, o `endsAt` mais recente primeiro.
4. `CANCELED`, o cancelado mais recente primeiro.

Renderize o array nessa ordem. Esta lista não inclui o `shareToken` do comprovante. O comprovante é uma rota pública separada. Veja [receipts.md](./receipts.md).

## Erros

| Status | Corpo | Quando |
| --- | --- | --- |
| 401 | Sem contrato JSON. Use o status. | Sessão ausente ou inválida. |
| 403 | `{ "code": "NOT_BIDDER", "message": "Only a bidder can list their participations." }` | Autenticado como leiloeiro. |

Qualquer outro caso é uma falha inesperada. Não faça parse de um corpo para ela.

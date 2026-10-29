# Comprovante público

`GET /public/receipts/{shareToken}`

Pública. Sem sessão, sem corpo e sem query. A página é o próprio link de compartilhamento.

`shareToken` é uma string base64url de 43 caracteres: `A–Z`, `a–z`, `0–9`, `_` e `-`. Sem `+`, `/` ou `=`.

Um id de lote não é um `shareToken`. Enviar um UUID devolve `422`.

## 200

```json
{
  "receipt": {
    "lotId": "2d3c4b5a-1111-4222-8333-444455556666",
    "title": "Frozen lot",
    "description": "Sealed duel",
    "endedAt": "2026-10-26T14:45:00.000Z",
    "finalAmount": "12.50",
    "winnerParticipantNo": 7,
    "items": [
      {
        "id": "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
        "position": 1,
        "cardId": 89631139,
        "quantity": 2,
        "cardName": "Frozen Dragon",
        "imagePath": "https://images.example/frozen.jpg",
        "cardSnapshot": {
          "id": 89631139,
          "name": "Frozen Dragon",
          "atk": 2500
        }
      }
    ]
  }
}
```

| Campo | Uso |
| --- | --- |
| `lotId` | Lote a que este comprovante pertence. UUID. |
| `title` | Título do lote. |
| `description` | Descrição do lote, ou `null`. |
| `endedAt` | Quando o lote foi liquidado. ISO 8601 UTC. |
| `finalAmount` | Valor vencedor como string decimal com exatamente duas casas. |
| `winnerParticipantNo` | Número do vencedor dentro deste lote. É a única identidade do vencedor no payload. |
| `items` | Cartas, ordenadas por `position` crescente. |

Cada item tem `id`, `position`, `cardId`, `quantity`, `cardName`, `imagePath` e `cardSnapshot`. `cardSnapshot` varia por carta e nunca inclui `card_images`. Renderize a imagem a partir de `imagePath`. `cardName` e `cardSnapshot` permanecem como estavam na criação do lote.

A resposta não inclui o token de compartilhamento, o nome do vencedor, o e-mail do vencedor, o leiloeiro nem ids de lance. A página continua funcionando quando o catálogo de cartas está fora.

## Erros

| Status | Quando | Corpo |
| --- | --- | --- |
| 404 | O token é válido e não existe comprovante para ele. | `{ "code": "RECEIPT_NOT_FOUND", "message": "Receipt was not found." }` |
| 422 | `shareToken` não casa com o padrão (tamanho errado, um UUID, `+`, `/` ou padding). | `type: "validation"`. |

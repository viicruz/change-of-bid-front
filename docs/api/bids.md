# Enviar um lance

`POST /private/lots/{id}/bids`

Envia um lance em um lote. Só um usuário autenticado com papel `BIDDER` pode chamar. `{id}` é o UUID do lote.

```http
POST /private/lots/{id}/bids
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "amount": "11.50"
}
```

`amount` é uma string, nunca um número. Veja [conventions.md](./conventions.md). Enviar `"10"` devolve `"10.00"`.

## Valor mínimo

A rota não devolve o mínimo. Calcule a partir do lote que a tela já tem.

- Primeiro lance: `amount` precisa ser pelo menos `openingBid`.
- Lances seguintes: `amount` precisa ser pelo menos o lance atual mais `minIncrement`.

O líder atual não pode dar outro lance até outra pessoa assumir a liderança.

O valor aceito fica reservado no saldo disponível do licitante. A reserva do líder anterior é liberada.

## 201

```json
{
  "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "sequence": 2,
  "amount": "11.50",
  "createdAt": "2026-10-27T12:00:00.000Z",
  "participantNo": 4,
  "endsAt": "2026-10-27T18:00:00.000Z",
  "extensionCount": 0
}
```

| Campo | Significado |
| --- | --- |
| `id` | Id do lance aceito. |
| `sequence` | Posição deste lance no lote, começando em 1. |
| `amount` | Valor aceito, sempre com 2 casas decimais. |
| `createdAt` | Quando o lance foi aceito, ISO 8601 UTC. |
| `participantNo` | Número deste licitante neste lote. A mesma pessoa mantém o mesmo número. Nome, e-mail e id de usuário não são devolvidos. |
| `endsAt` | Fim do lote depois deste lance. |
| `extensionCount` | Quantas vezes este lote foi prorrogado. |

Se o lance é aceito com 2 minutos ou menos restantes, `endsAt` avança 2 minutos e `extensionCount` aumenta em 1. Um lance aceito depois, dentro da nova janela, pode prorrogar o lote de novo. Use o `endsAt` desta resposta. Um lance recusado não prorroga o lote.

O primeiro lance aceito é o que atribui `participantNo`. Grave esse número no cache da sala. O socket ao vivo não o envia. Veja [lot-room.md](./lot-room.md).

## Erros

Decida pelo `code`. `message` está em inglês e pode mudar.

| Status | `code` | Quando |
| --- | --- | --- |
| 401 | — | Sem sessão. O corpo vem vazio. |
| 403 | `NOT_BIDDER` | O usuário autenticado não é licitante. |
| 404 | `LOT_NOT_FOUND` | Não existe lote com este id. |
| 409 | `BID_BELOW_MINIMUM` | Abaixo do lance inicial, ou abaixo do lance atual mais `minIncrement`. |
| 409 | `INSUFFICIENT_BALANCE` | O saldo disponível não cobre `amount`. |
| 409 | `ALREADY_LEADER` | Este licitante já tem o lance atual. |
| 409 | `LOT_NOT_STARTED` | O lote ainda não chegou em `startsAt`. |
| 409 | `LOT_ENDED` | `endsAt` já passou, ou o lote já encerrou. |
| 409 | `LOT_CANCELED` | O lote está cancelado. |
| 422 | `INVALID_MONEY` | `amount` está ausente ou não é dinheiro válido. |

Um id de lote que não é UUID também é `422`, com `type: "validation"` e sem `code`. Isso é validação da requisição, não `INVALID_MONEY`.

```json
{
  "code": "BID_BELOW_MINIMUM",
  "message": "The bid is below the minimum accepted amount."
}
```

Mostre essas mensagens no formulário de lance. Uma recusa não muda a sala. O socket publica um snapshot novo só depois que um lance aceito é gravado.

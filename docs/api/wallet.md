# Carteira

Dinheiro e erros seguem [conventions.md](./conventions.md). Toda rota usa a carteira do usuário autenticado. `userId` e `role` no corpo são ignorados.

Uma carteira é criada no cadastro, então `404` `WALLET_NOT_FOUND` significa que a linha não existe.

## Ler o saldo

`GET /private/wallet`

Sem corpo e sem query. Funciona para licitante ou leiloeiro.

### 200

```json
{
  "totalBalance": "10.10",
  "committedBalance": "0.01",
  "availableBalance": "10.09"
}
```

Os três campos são strings decimais com exatamente duas casas. Uma conta nova começa em `"0.00"` em todos os campos.

- `totalBalance` é o saldo total.
- `committedBalance` é o valor reservado agora.
- `availableBalance` é `totalBalance - committedBalance`, já calculado.

| Status | Quando | Corpo |
| --- | --- | --- |
| 401 | Sessão ausente ou inválida. | nenhum |
| 404 | O usuário não tem linha de carteira. | `{ "code": "WALLET_NOT_FOUND", "message": "Wallet was not found." }` |

## Listar movimentações

`GET /private/wallet/movements`

Uma página de movimentações, da mais nova para a mais antiga. Sem corpo.

| Parâmetro | Regras | Padrão |
| --- | --- | --- |
| `page` | Inteiro de `1` a `1000`. | `1` |
| `limit` | Inteiro de `1` a `50`. | `20` |

Qualquer outro parâmetro de query é ignorado.

### 200

```json
{
  "movements": [
    {
      "id": "6f1c0c3e-1b2a-4d5e-9f70-8a1b2c3d4e5f",
      "type": "HOLD",
      "amount": "2.00",
      "lotId": "11111111-1111-4111-8111-111111111111",
      "bidId": "22222222-2222-4222-8222-222222222222",
      "createdAt": "2026-04-02T00:00:00.000Z"
    }
  ],
  "page": 1,
  "limit": 20,
  "total": 5
}
```

`page` e `limit` repetem os valores usados. `total` é a quantidade de movimentações na carteira, não o tamanho desta página. Uma página depois da última movimentação ainda é `200`, com `movements: []` e o `total` real.

A ordem é `createdAt` decrescente e, em seguida, `id` decrescente.

`amount` é sempre positivo. O tipo diz o que o valor fez.

| `type` | Significado | `lotId` | `bidId` |
| --- | --- | --- | --- |
| `DEPOSIT` | Dinheiro acrescentado à carteira. | `null` | `null` |
| `HOLD` | Valor reservado porque este usuário virou líder. | presente | presente |
| `RELEASE` | Uma reserva anterior foi liberada (foi superado ou o lote foi cancelado). | presente | presente |
| `SETTLEMENT_DEBIT` | Valor debitado do vencedor quando um lote liquida. | presente | `null` |
| `SETTLEMENT_CREDIT` | Valor creditado ao leiloeiro quando um lote liquida. | presente | `null` |

| Status | Quando | Corpo |
| --- | --- | --- |
| 401 | Sessão ausente ou inválida. | nenhum |
| 404 | O usuário não tem linha de carteira. | `{ "code": "WALLET_NOT_FOUND", "message": "Wallet was not found." }` |
| 422 | `page` ou `limit` foge das regras acima (`0`, `51`, `1.5`, `"abc"`, página acima de `1000`). | JSON com `"type": "validation"`. |

Em `422`, corrija a query e tente de novo. Não leia `movements` desse corpo.

## Depósito

`POST /private/wallet/deposits`

Credita um valor simulado na carteira do licitante autenticado. Cada chamada bem-sucedida é um depósito novo. Não há pagamento real.

Só um `BIDDER` deposita. Um leiloeiro recebe `403`.

```json
{
  "amount": "2.50"
}
```

`amount` é uma string.

- Maior que zero. Mínimo `"0.01"`.
- No máximo 2 casas decimais. `"2.5"` e `"2"` são aceitos.
- Sem sinal, sem separador de milhar e sem zeros à esquerda (`"01.50"` é inválido).
- Até 16 dígitos antes do ponto decimal. Teto absoluto de um depósito: `"9999999999999999.99"`.
- Espaços nas pontas são removidos.

A especificação de produto também cita um teto comercial de R$ 1.000.000,00 por depósito. Esta rota, como documentada, aplica o teto numérico acima. Siga a rota até a API passar a recusar o teto comercial.

### 201

Saldos depois do depósito. `committedBalance` não muda. Substitua o estado da carteira por este objeto.

```json
{
  "totalBalance": "12.50",
  "committedBalance": "4.00",
  "availableBalance": "8.50"
}
```

### Erros

Nenhum destes altera o saldo.

| Status | `code` | Quando | `message` |
| --- | --- | --- | --- |
| 401 | — | Sem sessão válida. | Sem `code`. |
| 403 | `NOT_BIDDER` | O usuário não é licitante. | `Only a bidder can deposit into a wallet.` |
| 404 | `WALLET_NOT_FOUND` | A carteira não existe. | `Wallet was not found.` |
| 422 | `INVALID_MONEY` | `amount` está ausente, não é string, ou foge das regras acima. | `Money values must be greater than zero and have at most 2 decimal places.` |
| 422 | `AMOUNT_OUT_OF_RANGE` | A soma passaria de `9999999999999999.99`. | `The deposit exceeds the wallet balance limit.` |

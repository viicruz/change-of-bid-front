# Convenções da API

A origem da API é `NEXT_PUBLIC_BACKEND_URL` (veja `example.env`). Os caminhos abaixo são relativos a essa origem.

Rotas privadas aceitam uma das duas formas:

- `Authorization: Bearer <token>`, em que o token é o header `set-auth-token` da resposta de cadastro ou login, ou
- o cookie de sessão, enviado com `credentials: "include"`.

A origem do navegador precisa ser a origem configurada na API (`PAGE_ORIGIN`).

## Dinheiro

Dinheiro é uma string decimal com ponto. Nunca é um número JSON e nunca usa vírgula.

Envie valores maiores que zero, com no máximo duas casas decimais, sem sinal, sem separador de milhar e sem zeros à esquerda. `"10"`, `"10.5"` e `"10.50"` são válidos. `10`, `"0"`, `"0.00"`, `"-1"`, `"1,50"`, `"10.555"` e `"01.00"` não são.

As respostas usam sempre exatamente duas casas decimais (`"10.00"`, `"0.50"`). Mantenha esses valores como string na exibição e na comparação. Não converta com `Number`.

O saldo disponível é `totalBalance - committedBalance`. As respostas da carteira já incluem `availableBalance`.

## Datas

Datas e horários são ISO 8601 com offset de fuso. `Date.prototype.toISOString()` é válido. Um valor de `datetime-local` não é, até o cliente acrescentar o offset.

As respostas usam UTC e terminam em `Z`.

`serverNow`, quando o payload traz esse campo, é o relógio que calculou `status`. A contagem regressiva é uma apresentação desse relógio e de `startsAt` ou `endsAt`. O relógio do navegador não é a fonte da verdade.

## Status do lote

As rotas de lista e de detalhe devolvem o status a renderizar. Não recalcule esse status a partir de um enum gravado.

| Status | Significado |
| --- | --- |
| `SCHEDULED` | `serverNow` é anterior a `startsAt`. |
| `LIVE` | `serverNow` é igual ou posterior a `startsAt`, e anterior a `endsAt`. O instante de início já é ao vivo. |
| `ENDED` | `serverNow` é igual ou posterior a `endsAt`, ou o lote já foi liquidado. O instante de fim já é encerrado. |
| `CANCELED` | O leiloeiro cancelou o lote. Esse valor prevalece sobre os horários acima. |

`POST /private/lots` é a exceção: o `status` dela é o valor gravado `ACTIVE`. Use `startsAt` e `endsAt` para decidir o que esse lote novo deve mostrar.

`sold` é `true` somente depois que um vencedor é registrado. Um lote `ENDED` pode ainda ter lances e `sold: false` enquanto a liquidação está em andamento. `bidCount === 0` junto com `ENDED` é um lote encerrado sem lances. Veja [lot-room.md](./lot-room.md).

Listas públicas omitem lotes cancelados. A leitura direta de um lote cancelado ainda o devolve.

## Pessoas em um lote

Auditoria, comprovantes e salas identificam licitantes por `participantNo` (ou `winnerParticipantNo`) dentro daquele lote. A mesma pessoa mantém o mesmo número em todos os lances daquele lote. O número começa em 1, existe só dentro daquele lote e não é um id de usuário. Mostre como “Licitante #3”, ou o texto equivalente.

Esses payloads não incluem nome, e-mail nem id de usuário.

## Erros

Confira o status HTTP primeiro.

`401` significa sessão ausente ou inválida. O corpo não é JSON. Não faça `JSON.parse` nele. Envie a pessoa para o login.

Erros de negócio são JSON:

```json
{
  "code": "LOT_NOT_FOUND",
  "message": "Lot was not found."
}
```

Decida pelo `code`. `message` está em inglês e pode mudar, exceto onde a página do endpoint diz que a frase é fixa.

Validação de corpo e de query é `422` com `type: "validation"` e sem `code`. O corpo pode incluir `on`, `property` e `message`. Em produção o payload pode ser menor, então não dependa de `property` estar presente.

Uma operação de negócio recusada não altera o recurso que a rota ia gravar.

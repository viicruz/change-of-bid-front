# Auditoria pública

`GET /public/lots/{id}/audit`

Auditoria pública dos lances aceitos de um lote. Sem sessão, query ou corpo. Chame com o id do lote de `GET /public/lots` ou `GET /public/lots/{id}`.

`id` precisa ser um UUID.

```http
GET /public/lots/3f1c2a40-7b6e-4d2a-9c11-8e5a1b0d4f22/audit
```

## 200

```json
{
  "audit": {
    "lotId": "3f1c2a40-7b6e-4d2a-9c11-8e5a1b0d4f22",
    "status": "INTACT",
    "bids": [
      {
        "sequence": 1,
        "amount": "10.00",
        "createdAt": "2026-10-26T16:00:00.000Z",
        "participantNo": 1
      },
      {
        "sequence": 2,
        "amount": "12.50",
        "createdAt": "2026-10-26T16:05:00.000Z",
        "participantNo": 2
      }
    ]
  }
}
```

| Campo | Tipo | Significado |
| --- | --- | --- |
| `audit.lotId` | UUID | Lote auditado. O mesmo valor enviado no path. |
| `audit.status` | `INTACT`, `TAMPERED` ou `VERIFICATION_FAILED` | Resultado da verificação da cadeia de lances. |
| `audit.bids` | array | Lances aceitos, ordenados por `sequence` crescente. Vazio quando o lote não tem lances. |

Cada lance:

| Campo | Tipo | Significado |
| --- | --- | --- |
| `sequence` | integer | Posição na cadeia. Começa em `1`. |
| `amount` | string | Valor decimal, em geral com duas casas (`"12.50"`). Exiba a string. Não faça parse como float. |
| `createdAt` | string | Timestamp ISO 8601. |
| `participantNo` | integer | Número anônimo daquele licitante neste lote. Não é um id de usuário. |

A resposta não inclui nomes, e-mails, ids de usuário nem hashes. Título, agenda e status do lote não estão aqui. Continue usando `GET /public/lots/{id}` para isso. Um lote cancelado ainda devolve os lances anteriores.

`status` sempre vem junto com `bids`. Uma verificação que falhou não é um erro HTTP.

| Valor | O que mostrar |
| --- | --- |
| `INTACT` | A cadeia confere. Um lote sem lances é `INTACT` e `bids` é `[]`. |
| `TAMPERED` | Os lances gravados não conferem com a cadeia. Ainda é `200`. Renderize `bids` como veio e marque a auditoria como não confiável. Os valores podem diferir do que foi aceito originalmente. |
| `VERIFICATION_FAILED` | O servidor não conseguiu executar a verificação. Ainda é `200`, e `bids` continua sendo a lista pública. Não trate isso como íntegro nem como adulterado. |

## Erros

### 404

O id é um UUID, mas o lote não existe.

```json
{
  "code": "LOT_NOT_FOUND",
  "message": "Lot was not found."
}
```

Decida pelo `code`. `message` é uma frase fixa em inglês.

### 422

`id` não é um UUID.

```json
{
  "type": "validation"
}
```

O corpo sempre tem `type: "validation"`. Isso é um path inválido, não um lote ausente.

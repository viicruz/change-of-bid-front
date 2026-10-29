# Busca de cartas

`GET /public/yugioh/cards/search`

Pública. Sem sessão. É assim que o leiloeiro encontra os ids das cartas antes de criar um lote.

```http
GET /public/yugioh/cards/search?fname=blue-eyes&num=32&offset=0
```

## Parâmetros


| Parâmetro | Uso no painel |
| --- | --- |
| `fname` | Nome parcial. |
| `type` | Tipo da carta, um valor do catálogo. |
| `attribute` | Atributo. |
| `archetype` | Arquétipo. |
| `level` | Comparação (`lt`, `lte`, `gt`, `gte`) e um número. A tela não envia um nível exato. |
| `sort` | `atk`, `def`, `name`, `type`, `level`, `id` ou `new`. |
| `num` | Tamanho da página. O painel envia `16`. O padrão da rota, sem o parâmetro, é `32`. |
| `offset` | Deslocamento. O painel usa `página × 16`. |

`name` e `id` também existem na rota e não podem ir juntos. O painel não os envia. O mesmo vale para `race`, `atk`, `def`, `link`, `linkmarker`, `scale`, `cardset`, `banlist`, `format`, `misc`, `staple`, `has_effect`, `startdate`, `enddate`, `dateregion` e `language`: a rota aceita, e esta tela não usa.

`name` e `id` na mesma query é `422` com `type: "validation"`.

## 200

O corpo é o payload do catálogo de origem: `data` são as cartas, e `meta` traz a paginação quando vem.

```json
{
  "data": [
    {
      "id": 89631139,
      "name": "Blue-Eyes White Dragon",
      "type": "Normal Monster",
      "desc": "This legendary dragon is a powerful engine of destruction.",
      "card_images": [
        {
          "id": 89631139,
          "image_url": "https://images.ygoprodeck.com/images/cards/89631139.jpg",
          "image_url_small": "https://images.ygoprodeck.com/images/cards_small/89631139.jpg"
        }
      ]
    }
  ],
  "meta": {
    "current_rows": 1,
    "total_rows": 1,
    "rows_remaining": 0,
    "next_page_offset": 32
  }
}
```

Envia `data[].id` depois em `cardIds`. Não envia `card_images[].id`.

Use `card_images[0].image_url` ou `image_url_small` no seletor. O lote grava só o primeiro `image_url`. O cliente não escolhe uma arte alternativa. Se `card_images` estiver ausente ou a primeira imagem não tiver `image_url`, não adicione essa carta. Criar lote responde `422` `CARD_WITHOUT_IMAGE`.

Um id que esta busca nunca devolveu não está no catálogo. Criar lote responde `422` `UNKNOWN_CARDS`. Ids de uma busca anterior bem-sucedida podem ser reutilizados.

Enquanto `meta.rows_remaining` for maior que `0`, peça a próxima página com `offset` igual a `meta.next_page_offset`.

## Nenhum resultado

Uma busca sem correspondência não devolve `{ "data": [] }`. Ela falha com `500` e a mensagem de origem `No card matching your query was found in the database.` Mostre um estado vazio. Não apresente essa frase como uma falha do sistema.

Qualquer outra falha desta rota significa que a busca de cartas está indisponível. Lotes já publicados, salas, carteira, auditoria e comprovantes continuam funcionando. Diga que a busca no catálogo está indisponível, sem um erro técnico.
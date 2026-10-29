# Camada de dados

Como este repositório fala com a API. Os formatos de cada rota estão em [api/](./api/).

## Onde cada coisa mora

| Caminho | Dono de |
| --- | --- |
| `src/schemas/` | O recurso e os primitivos compartilhados: dinheiro, erro, usuário, lote, carta, carteira. |
| `src/hooks/<entidade>/queries/` | Uma leitura. O arquivo declara o envelope daquela rota. |
| `src/hooks/<entidade>/mutations/` | Uma escrita, o schema do corpo quando o formulário usa o mesmo schema, e as chaves que a escrita invalida. |
| `src/lib/api.ts` | `GET` e `POST`. Faz o parse do sucesso com Zod e lança `ApiError` no HTTP de erro. |
| `src/lib/query-client.ts` | `QUERY_KEYS` e `queryInvalidator`. |
| `src/lib/auth-client.ts` | Better Auth. Cadastro, login, logout e sessão não passam por `api.ts`. |

A tela chama o hook. Ela não monta a URL e não faz `JSON.parse` da resposta.

O tipo de um recurso é `z.infer` do schema. Um recorte de endpoint usa `.pick()` em cima do schema da entidade, como `use-index-lots.ts` faz com `lotSchema`.

## O que não é convertido

Dinheiro permanece string. Datas de lote, lance, carteira e auditoria permanecem string ISO. Comparar ou somar com `Number` perde o contrato de duas casas.

A exceção é o usuário do Better Auth: `createdAt` e `updatedAt` chegam como `Date` no cliente de auth.

## Erros

`ApiError` carrega `status`, `message` e `body`. A UI decide pelo status e, nos erros de negócio, pelo `code`. `401` pode ser texto puro. Não assuma JSON.

A busca de cartas é o caso especial: o `500` cuja mensagem começa com `No card matching your query was found in the database.` vira `{ data: [] }` dentro de `use-index-cards.ts`. As outras falhas seguem como erro.

## Cache

`QUERY_KEYS` é o único lugar que escreve o nome da chave. Filtro, página e id que mudam a resposta entram na chave.

Uma mutation bem-sucedida chama `queryInvalidator` com o prefixo da coleção e, quando existe, a chave do registro. Login e logout limpam o cache com `queryClient.clear()`, para a sessão anterior não permanecer na tela.

A sala pública é a exceção. O GET é a query. O socket escreve `serverNow` e `lot` nessa mesma entrada e preserva `viewerParticipantNo`. Um frame com `serverNow` mais antigo que o cache é ignorado. O detalhe está em [api/lot-room.md](./api/lot-room.md).

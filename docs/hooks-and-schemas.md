# Especificação da camada de dados: schemas Zod e hooks de query/mutation

Este documento especifica como uma aplicação cliente modela os dados da API e os expõe para a UI. Ele foi escrito para que outro projeto adote os mesmos limites sem copiar o domínio de um produto específico.

A stack assumida aqui é TypeScript, Zod, TanStack Query e um cliente HTTP tipado que faz o parse de toda resposta com um schema Zod antes de o hook devolvê-la.

## Responsabilidades

Três camadas são donas de três trabalhos diferentes. Uma mudança pertence a exatamente uma delas.

| Camada | É dona de | Não é dona de |
| --- | --- | --- |
| Schema da entidade | O recurso como o domínio o conhece: campos, enums, timestamps, mensagens de validação compartilhadas | O envelope de um endpoint, paginação ou chaves de cache |
| Hook | Um endpoint: formato da requisição, envelope de sucesso, envelope de erro, query key, invalidação de cache | Regras de campo reutilizáveis que outros endpoints também precisam |
| UI | Formulários, apresentação de vazio/carregamento/erro, chamar `mutate` ou ler os dados da query | Fazer parse de JSON, inventar um segundo tipo para o mesmo recurso |

Os tipos sempre vêm dos schemas:

```ts
export type Order = z.infer<typeof orderSchema>;
```

Interfaces escritas à mão ficam reservadas para valores que não são validados, como um objeto de filtro que o hook monta antes da requisição. Se o valor atravessa a rede ou um formulário, ele é um schema Zod.

## Organização dos arquivos

```txt
schemas/
  common/                 # primitivos reutilizados por toda entidade
    identification.ts
    time.ts
    sort.ts
    api.ts
    index.ts              # reexporta os primitivos comuns
  order.ts                # um arquivo por entidade

hooks/
  order/
    queries/
      use-index-orders.ts
      use-show-order.ts
    mutations/
      use-store-order.ts
      use-update-order.ts
      use-destroy-order.ts

utils/
  query-client.ts         # QueryClient, QUERY_KEYS, queryInvalidator
```

Regras:

- Agrupe os hooks por entidade e, em seguida, por tipo de operação. Arquivos de query e arquivos de mutation nunca compartilham uma pasta.
- Nomeie os arquivos como `use-<action>-<entity>.ts`.
- Use o nome da coleção no plural para hooks de listagem (`use-index-orders.ts`, `useIndexOrders`). Use o nome do recurso no singular para toda outra ação (`use-show-order.ts`, `useShowOrder`).
- O nome da pasta é a entidade no plural (`hooks/order` está errado; `hooks/orders` está certo).
- Marque todo módulo de hook com `"use client"` quando a biblioteca de dados roda no navegador.
- Exporte o hook. Mantenha a função assíncrona de requisição no mesmo arquivo e sem export. O hook é a API pública.

Vocabulário de ações, usado em nomes de arquivo, nomes de função e URLs:

| Ação | HTTP | Significado |
| --- | --- | --- |
| `index` | `GET /resources` | Coleção paginada ou filtrada |
| `show` | `GET /resources/:id` | Um recurso |
| `store` | `POST /resources` | Criar |
| `update` | `PUT` ou `PATCH /resources/:id` | Substituir ou atualizar parcialmente |
| `destroy` | `DELETE /resources/:id` | Remover |

Um domínio que não é um recurso CRUD ainda segue a mesma divisão. Autenticação fica em `hooks/auth/queries` e `hooks/auth/mutations`; cada arquivo continua sendo um endpoint.

## Camadas de schema

### 1. Primitivos comuns

Coloque uma regra em `schemas/common` quando duas ou mais entidades precisam da mesma restrição. Primitivos típicos:

- identificadores (`id` como inteiro positivo, `uuid`)
- timestamps (`created_at`, `updated_at`) e soft delete (`deleted_at` anulável)
- direção de ordenação (`asc` | `desc`)
- resposta de paginação (`total`, `per_page`, `current_page`, `last_page`)
- filtros padrão de listagem (`search`, `page`, `limit`, `sort`, `sortBy`)
- entrada padrão de leitura por id (`id`, `enabled` opcional)
- o envelope de erro que a API devolve em falha (`message`)

Faça coerção na fronteira quando o formato no fio não é o tipo em runtime. Datas chegam como strings; contagens de paginação às vezes chegam como strings numéricas. Use `z.coerce.date()` e `z.coerce.number()` nos schemas de resposta para que quem chama receba `Date` e `number`.

Exporte três acompanhantes para todo enum:

```ts
export const orderStatusSchema = z.enum(["DRAFT", "OPEN", "CLOSED"]);
export type OrderStatus = z.infer<typeof orderStatusSchema>;

export const orderStatusEnum = orderStatusSchema.enum;
export const orderStatusArray: OrderStatus[] = Object.values(orderStatusEnum);
```

Componentes que renderizam um select leem `orderStatusArray`. Eles não redeclaram a union.

### 2. Schema da entidade

`schemas/<entity>.ts` descreve o recurso completo e os enums de domínio que pertencem somente a ele. Componha-o a partir de primitivos espalhando `.shape`:

```ts
export const orderSchema = z.object({
  id: uuidSchema,
  status: orderStatusSchema,
  total: z.number().nonnegative(),
  ...timestampSchema.shape,
  ...softDeleteSchema.shape,
});

export type Order = z.infer<typeof orderSchema>;
```

O schema da entidade é a descrição honesta mais ampla do recurso. Um endpoint que devolve menos campos não encolhe esse schema. O hook escolhe o subconjunto.

As mensagens de validação ficam no schema que o resolver do formulário usa. Campos compartilhados (email, nome, política de senha) carregam suas mensagens uma única vez, no schema comum ou da entidade, para que todo formulário as herde.

Regras entre campos usam `.refine()` ou `.superRefine()` no schema que é dono dos dois campos (senha e confirmação, início e fim). Anexe o problema ao campo que o usuário deve ver (`path`).

### 3. Schemas locais do hook

Cada arquivo de hook declara os schemas que existem somente para aquele endpoint.

**Envelope de sucesso.** Privado ao arquivo. Ele envolve a entidade (ou um recorte dela) no formato JSON exato daquela rota:

```ts
const apiResponseSchema = z.object({
  orders: z.object({
    data: z.array(indexOrderSchema),
    ...defaultApiPaginationSchema.shape,
  }),
});
```

Uma rota de recurso único envolve um objeto (`{ order: showOrderSchema }`). A função de requisição desembrulha e devolve `response.order`. Uma rota de coleção devolve o envelope inteiro, porque a paginação fica ao lado de `data` e a UI precisa dos dois.

**Projeção da resposta.** Quando o endpoint devolve um subconjunto da entidade, derive-o. Não escreva um segundo objeto que repete os tipos dos campos.

```ts
const showOrderSchema = z.object({
  ...orderSchema.pick({
    id: true,
    status: true,
    total: true,
  }).shape,
});
export type ShowOrder = z.infer<typeof showOrderSchema>;
```

Exporte o tipo inferido quando um componente anota props ou estado com ele. Deixe a const do schema privada quando só o hook faz o parse.

**Payload de escrita.** Exporte o schema e o tipo inferido quando um resolver de formulário ou outro módulo precisa validar o mesmo payload. Derive-o da entidade:

```ts
export const storeOrderSchema = z.object({
  status: orderStatusSchema,
  ...orderSchema.pick({ total: true }).shape,
});
export type StoreOrder = z.infer<typeof storeOrderSchema>;
```

Um schema de escrita pode viver em `schemas/<entity>.ts` quando ele é linguagem de domínio (`UpdateOrder`) e mais do que o hook precisa dele. Ele vive no arquivo do hook quando é apenas o corpo daquele endpoint (`storeOrderSchema`). De qualquer forma existe um único schema, e o formulário importa esse mesmo schema.

**Respostas variantes.** Modele corpos de sucesso mutuamente exclusivos com `z.discriminatedUnion` em um campo literal (`requires_two_factor: z.literal(true) | z.literal(false)`). Quem chama então estreita pelo campo. Não colapse variantes em campos opcionais.

**Envelope de erro.** Passe o `apiResponseErrorSchema` compartilhado em toda chamada. O cliente HTTP faz o parse de um corpo sem sucesso com ele e anexa o resultado ao erro lançado. Hooks não fazem parse de erros de novo.

### Onde um schema vive

| O schema descreve | Local | Exportado |
| --- | --- | --- |
| Um campo usado por muitas entidades | `schemas/common` | sim |
| O recurso | `schemas/<entity>.ts` | sim |
| Um modelo de escrita de domínio compartilhado com formulários | `schemas/<entity>.ts` ou o arquivo da mutation | sim |
| O envelope JSON de um endpoint | o arquivo do hook | schema privado; tipo exportado só se a UI o nomeia |
| Uma regra só de formulário (campo de confirmação) | o schema que o resolver do formulário importa | sim |

Construa schemas mais estreitos com `.pick()`, `.omit()`, `.extend()` e spreads de `.shape`. Um `z.object` novo que copia campos da entidade é um bug de divergência: a próxima mudança na entidade não chega à cópia.

## Contrato do cliente HTTP

O cliente aceita, em toda chamada:

- `url`
- `schema` — schema Zod do corpo de sucesso
- `errorSchema` — schema Zod do corpo de falha
- `params` ou `body` quando o método os tem

No sucesso, ele faz `safeParse` do JSON com `schema` e devolve os dados parseados. Em uma incompatibilidade de schema, ele lança, e inclui os issues do Zod no erro para que uma mudança de contrato fique visível nos logs. Em um erro HTTP, ele faz o parse do corpo com `errorSchema` e lança um erro que expõe a mensagem parseada.

Hooks nunca chamam `fetch` diretamente e nunca confiam em `response.json()` como `any`. O argumento de schema é o que torna verdadeiro o tipo de retorno do hook.

Parâmetros de rota ficam na URL. Remova-os do corpo antes de enviar:

```ts
const { id, ...body } = data;
await api.put({ url: `/orders/${id}`, body, schema, errorSchema });
```

## Query client

Um módulo é dono do cache:

```ts
export const queryClient = new QueryClient();

export const QUERY_KEYS = {
  ORDERS: {
    ALL: "orders",
    SINGLE: "order",
  },
} as const;

export async function queryInvalidator(queryKeys: (string | number)[][]) {
  await Promise.all(
    queryKeys.map((queryKey) => queryClient.invalidateQueries({ queryKey })),
  );
}
```

`QUERY_KEYS` é o único lugar em que uma string de chave de cache é escrita. Os hooks importam a constante. A invalidação usa a mesma constante, então uma renomeação não pode deixar uma string obsoleta para trás.

Formato da chave:

- Coleção: `[QUERY_KEYS.ORDERS.ALL, ...primitivos que mudam o resultado]`.
- Recurso único: `[QUERY_KEYS.ORDERS.SINGLE, id]`.
- Leituras de sessão ou singleton: uma chave estável, como `[QUERY_KEYS.AUTH.ME]`.

Todo filtro, página, ordenação e flag que muda a resposta faz parte da chave da coleção. Omitir um filtro faz duas requisições diferentes compartilharem uma entrada de cache.

O TanStack Query casa chaves por prefixo. Invalidar `[QUERY_KEYS.ORDERS.ALL]` atualiza toda lista em cache. Invalidar `[QUERY_KEYS.ORDERS.SINGLE, id]` atualiza aquele registro. Passe os dois depois de uma escrita que pode mudar a lista e o detalhe aberto.

`queryInvalidator` aceita uma lista de prefixos de chave e os invalida em paralelo. As mutations fazem `await` dele dentro de `onSuccess` para que o próximo render leia dados frescos.

Uma substituição de sessão (login, logout) chama `queryClient.resetQueries()` ou `queryClient.clear()` em vez de listar chaves. O cache do usuário anterior não pode sobreviver à nova sessão.

`staleTime` sugerido:

| Leitura | staleTime | Por quê |
| --- | --- | --- |
| Lista e detalhe editável | 10 minutos | Usuários transitam entre lista e formulário; uma janela curta evita buscas repetidas |
| Conteúdo que muda raramente | até 24 horas | A mutation invalida a chave na escrita, então um stale time longo é seguro |
| Usuário atual | 30 minutos, sem refetch no foco | A identidade é atualizada pelas mutations que a alteram |

Defina `enabled: props.enabled` nos hooks de `show` para que uma tela possa montar o hook antes de o id existir. `DefaultGetById` já carrega `enabled` opcional.

Defina `retry: false` em queries cuja falha significa "não autenticado" ou "não encontrado" quando tentar de novo só repetiria um erro permanente.

## Hook de query

Um hook de query lê. Ele tem este formato:

```ts
"use client";

const apiResponseSchema = z.object({
  order: showOrderSchema,
});

async function showOrder(props: DefaultGetById) {
  const response = await api.get({
    url: `/orders/${props.id}`,
    schema: apiResponseSchema,
    errorSchema: apiResponseErrorSchema,
  });

  return response.order;
}

export function useShowOrder(props: DefaultGetById) {
  return useQuery({
    queryKey: [QUERY_KEYS.ORDERS.SINGLE, props.id],
    queryFn: () => showOrder(props),
    enabled: props.enabled,
    staleTime: 1000 * 60 * 10,
  });
}
```

Hooks de listagem recebem um objeto de filtros. Os padrões (`page`, `limit`, `sort`, `sortBy`) vivem dentro da função de requisição, não no componente. A query key lista cada filtro como seu próprio elemento primitivo, inclusive valores aninhados que a requisição de fato envia (`filters?.role`), para que a identidade do objeto não invalide o cache.

```ts
const queryKey = [
  QUERY_KEYS.ORDERS.ALL,
  search,
  page,
  limit,
  sort,
  sortBy,
  withTrashed,
];
```

Flags booleanas que a API espera como `1` são convertidas na função de requisição (`if (withTrashed) params.withTrashed = 1`). O argumento público do hook continua sendo um booleano.

## Hook de mutation

Um hook de mutation escreve. Ele é dono do tipo do payload, da chamada e das chaves que a escrita torna obsoletas.

```ts
export function useUpdateOrder() {
  return useMutation({
    mutationFn: updateOrder,
    onSuccess: async (_data, variables) => {
      await queryInvalidator([
        [QUERY_KEYS.ORDERS.ALL],
        [QUERY_KEYS.ORDERS.SINGLE, variables.id],
      ]);
    },
  });
}
```

Regras de invalidação:

| Mutation | Invalidar |
| --- | --- |
| `store` | a chave da coleção |
| `update` | a chave da coleção e `[SINGLE, id]` |
| `destroy` | a chave da coleção; também a chave única quando uma tela de detalhe ainda pode estar aberta |
| atualização do usuário atual | a chave de sessão e qualquer lista que renderiza esse usuário |
| login que estabelece uma sessão | `resetQueries()`, depois escreva os efeitos colaterais da sessão (token, usuário) |
| login que ainda não estabelece uma sessão (desafio extra) | sem reset de cache |

Prefira o id das variables quando o corpo de sucesso devolve apenas um registro parcial. Prefira o id do corpo de sucesso quando o servidor o atribui e as variables não o contêm.

Efeitos colaterais que não são cache (persistir um token, entrada de redirecionamento) ficam na função de requisição ou em `onSuccess`. Eles ficam fora do componente para que todo chamador os receba.

## Contrato da UI

As telas consomem hooks; elas não os reimplementam.

**Leituras.** Trate três estados com os componentes que o projeto já tem:

- `isPending` — carregando
- `isError` — erro
- dados presentes e `length === 0` — vazio

Verifique `isPending` e `isError` antes de ler `data`.

**Escritas.** O formulário usa o mesmo schema que a mutation envia:

```ts
const form = useForm<StoreOrder>({
  resolver: zodResolver(storeOrderSchema),
});

function onSubmit(values: StoreOrder) {
  storeOrder.mutate(values);
}
```

O controle de envio reflete `mutation.isPending`. Desabilite-o enquanto a mutation está em andamento, e mantenha `id` e `type` no botão. Erros de campo vêm do resolver, que lê as mensagens definidas no schema. Erros do servidor vêm do corpo parseado do erro lançado (`message`), exibidos como toast ou como erro no nível do formulário.

Uma tela que precisa de um registro e de uma escrita monta `useShowOrder` e `useUpdateOrder` lado a lado. Ela não busca dentro da mutation, e não escreve o cache da query manualmente quando a invalidação já cobre as chaves.

## Adicionando um endpoint

1. Adicione ou estenda o schema da entidade. Reutilize um primitivo comum se o campo já tiver um.
2. Se a escrita é um modelo de domínio, adicione o schema dela com `.pick()` / `.extend()` e exporte o tipo inferido.
3. Crie `hooks/<entities>/queries/use-<action>-<entity>.ts` ou `.../mutations/...`.
4. Declare o envelope de sucesso nesse arquivo. Aponte `errorSchema` para o schema de erro compartilhado.
5. Adicione `QUERY_KEYS.<ENTITY>.ALL` e `SINGLE` se a entidade for nova.
6. Para uma query, coloque toda variável da requisição na query key e defina `staleTime`.
7. Para uma mutation, invalide o prefixo da coleção e a chave única afetada.
8. Na tela, ramifique em `isPending`, `isError` e vazio, ou ligue o schema exportado ao `zodResolver`.

O trabalho está feito quando o hook é o único módulo que conhece a URL, a UI importa tipos a partir do schema ou do hook, e uma escrita bem-sucedida atualiza toda query visível que exibe o recurso alterado.

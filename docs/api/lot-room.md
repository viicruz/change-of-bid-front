# Sala pública do lote

A sala do lote são duas leituras do mesmo snapshot.

| | `GET /public/lots/{id}` | `WS /public/lots/{id}/live` |
| --- | --- | --- |
| Para que serve | Carregar a sala e saber quem é o usuário autenticado neste lote. | Empurrar a sala atual para quem está assistindo este lote. |
| Autenticação | Opcional. Uma sessão válida preenche `viewerParticipantNo`. | Nenhuma. O socket nunca lê a sessão. |
| Corpo | `{ serverNow, viewerParticipantNo, lot }` | `{ serverNow, lot }` |

`lot` em um frame do socket é o `lot` de `GET /public/lots/{id}` para um visitante anônimo, com as datas já serializadas. O socket omite `viewerParticipantNo`. Ele não envia `null` nesse campo e não envia um formato diferente de lote.

Use o GET como cache do React Query. Escreva os frames do socket nesse mesmo cache. Mantenha `viewerParticipantNo` vindo do GET, ou da resposta do lance aceito. O socket não é a fonte de “este lance é meu?”.

Lances não são enviados neste socket. Um lance é `POST /private/lots/{id}/bids`. Depois que essa gravação faz commit, o servidor publica um snapshot novo na sala. Um lance recusado não publica nada.

Os campos HTTP estão em [lots.md](./lots.md). A resposta do lance está em [bids.md](./bids.md).

## Conectar

Abra o socket depois que o id do lote for conhecido. Não envie frame de inscrição. O upgrade em si entra na sala, e o servidor responde com um frame de texto: o snapshot atual.

```text
ws://<api-host>/public/lots/<lot-uuid>/live
wss://<api-host>/public/lots/<lot-uuid>/live
```

Use `wss` quando a página é `https`. O path é o path do GET mais `/live`. `{id}` é o mesmo UUID de lote usado no GET. `liveUrl` aponta para o host da API, não para o host da página, quando os dois diferem.

O navegador define `Origin`. O servidor aceita o upgrade só quando `Origin` está ausente ou é igual à origem da página configurada. Um segundo host (por exemplo `localhost` contra uma origem `127.0.0.1`) é recusado antes de o socket abrir.

Não envie cookies nem `Authorization` para identidade neste socket. O handler os ignora. Passe a sessão no GET.

A sala é de uma via. Texto que o cliente envia é descartado. Não há pong, canal de comando nem confirmação de lance no socket. Ignore payloads de `onmessage` que não sejam texto JSON. O servidor só envia frames de texto.

## Mensagens

Cada frame é um snapshot completo, não um diff. Substitua `serverNow` e `lot`. Não acrescente `bids` à lista anterior.

```ts
type PublicLotStatus = "SCHEDULED" | "LIVE" | "ENDED" | "CANCELED";

type PublicLotBid = {
  sequence: number;
  amount: string;
  createdAt: string;
  participantNo: number;
};

type PublicLotItem = {
  id: string;
  position: number;
  cardId: number;
  quantity: number;
  cardName: string;
  imagePath: string;
  cardSnapshot: Record<string, unknown>;
};

type PublicLot = {
  id: string;
  title: string;
  description: string | null;
  openingBid: string;
  minIncrement: string;
  startsAt: string;
  endsAt: string;
  extensionCount: number;
  status: PublicLotStatus;
  currentBid: string | null;
  leaderParticipantNo: number | null;
  bidCount: number;
  sold: boolean;
  winnerParticipantNo: number | null;
  items: PublicLotItem[];
  bids: PublicLotBid[];
};

type PublicLotLiveMessage = {
  serverNow: string;
  lot: PublicLot;
};

type PublicLotResponse = PublicLotLiveMessage & {
  viewerParticipantNo: number | null;
};
```

As datas são ISO 8601 UTC com milissegundos, como `2026-10-27T21:05:00.000Z`. Dinheiro é uma string decimal com duas casas. Não converta essas strings com `Number`.

`bids` é cada lance aceito, ordenado por `sequence` crescente. A última entrada é o lance aceito mais recente. O `participantNo` dela é `leaderParticipantNo`, e o `amount` dela é `currentBid`. Lances recusados estão ausentes.

`cardSnapshot` é a carta congelada na criação do lote, sem `card_images`. Renderize `imagePath`. Não consulte a YGOPRODeck para um lote já publicado.

O frame nunca inclui e-mail, nome, id de usuário, saldos da carteira, hashes de lance nem o `shareToken` do comprovante.

| Momento | O que o próximo frame contém |
| --- | --- |
| O socket abre | A sala no momento dessa leitura. |
| Um lance é aceito | Novos `currentBid`, `leaderParticipantNo`, `bidCount` e `bids`. `endsAt` e `extensionCount` mudam só quando o lance prorrogou o lote. |
| O leiloeiro cancela o lote | `status: "CANCELED"`, histórico preservado, `winnerParticipantNo: null`, `sold: false`. |
| A liquidação termina com vencedor | `status: "ENDED"`, `sold: true`, `winnerParticipantNo` igual ao número do líder. |
| A liquidação termina sem lances | `status: "ENDED"`, `sold: false`, `winnerParticipantNo: null`, `currentBid: null`, `bids: []`. |
| Reconexão | Um snapshot da sala atual, inclusive lances e prorrogações que aconteceram enquanto a aba estava desconectada. |

Um lance nos últimos dois minutos prorroga o `endsAt` atual em dois minutos e incrementa `extensionCount`. Recalcule a contagem a partir do novo `endsAt`. Um lance recusado não prorroga o lote e não produz frame. Um cancelamento repetido não publica outro frame.

Há um intervalo entre o relógio e a liquidação. Depois que `endsAt` passou, um GET novo já informa `status: "ENDED"` enquanto o job ainda pode estar gravando o resultado. Até esse commit, um lote que tem lances pode parecer `ENDED` com `sold: false` e `winnerParticipantNo: null`.

- `bidCount === 0` junto com `ENDED` é o lote vazio já encerrado.
- `bidCount > 0`, `ENDED` e `sold: false` significam que o resultado ainda está sendo gravado. Mantenha o histórico na tela e espere o frame que define `sold` e `winnerParticipantNo`. Não invente um vencedor e não trate esse intervalo como “encerrou sem vencedor”.

## Erros

Falhas antes de a sala abrir são respostas HTTP no upgrade. A API WebSocket do navegador não expõe esse corpo. `onerror` e `onclose` disparam, e `onopen` não.

| HTTP | Corpo | Quando |
| --- | --- | --- |
| 403 | `{ "code": "ORIGIN_NOT_ALLOWED", "message": "This origin cannot subscribe to the lot." }` | `Origin` está presente e não é a origem da página. |
| 404 | `{ "code": "LOT_NOT_FOUND", "message": "Lot was not found." }` | Não há lote para esse UUID. O mesmo `code` do GET. |
| 422 | `{ "type": "validation", ... }` | `id` não é um UUID. |

Se o socket nunca abre, chame `GET /public/lots/{id}` e decida por essa resposta:

- `404` com `LOT_NOT_FOUND`: a sala não existe. Mostre esse estado vazio. Não continue reconectando.
- `422`: o id na rota é inválido. Mostre esse estado vazio.
- `200` enquanto o socket ainda falha: a sala existe e a conexão ao vivo falhou (origem, rede ou servidor). Mostre um problema de conexão e tente o socket de novo. Não mostre isso como lance recusado.

Se o snapshot não puder ser lido depois que o socket já está aberto, o servidor fecha com código `1011` e reason `The live lot snapshot failed`. Trate `1011` como uma conexão caída: reconecte e aplique o próximo snapshot como a sala. Não mostre o reason do close como texto para a pessoa.

Um close vindo da aba, de um refresh ou de rede perdida não é erro de negócio. Mostre um estado de reconexão. Deixe o último snapshot na tela até o próximo frame substituí-lo. Um lance enviado só está aceito quando o POST devolve `201`, ou quando um snapshot posterior contém esse lance. Uma desconexão não significa que o lance foi aceito.

## Cache

Mantenha uma entrada de cache para o GET. O socket só atualiza essa entrada.

```ts
//* Libraries imports
import { useEffect } from "react";
import { useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";

const publicLotKey = (lotId: string) => ["public-lot", lotId] as const;

function applyLiveMessage(
  queryClient: QueryClient,
  lotId: string,
  message: PublicLotLiveMessage,
) {
  queryClient.setQueryData<PublicLotResponse>(publicLotKey(lotId), (current) => {
    if (current !== undefined && Date.parse(current.serverNow) > Date.parse(message.serverNow)) {
      return current;
    }

    return {
      serverNow: message.serverNow,
      viewerParticipantNo: current?.viewerParticipantNo ?? null,
      lot: message.lot,
    };
  });
}

function rememberViewer(
  queryClient: QueryClient,
  lotId: string,
  viewerParticipantNo: number,
) {
  queryClient.setQueryData<PublicLotResponse>(publicLotKey(lotId), (current) => {
    if (current === undefined) {
      return current;
    }

    if (current.viewerParticipantNo !== null) {
      return current;
    }

    return { ...current, viewerParticipantNo };
  });
}

export function usePublicLotRoom(lotId: string) {
  const queryClient = useQueryClient();

  const lotQuery = useQuery({
    queryKey: publicLotKey(lotId),
    queryFn: async () => {
      const response = await fetch(`/public/lots/${lotId}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Lot room request failed");
      }

      const body = (await response.json()) as PublicLotResponse;
      const cached = queryClient.getQueryData<PublicLotResponse>(publicLotKey(lotId));

      if (cached !== undefined && Date.parse(cached.serverNow) > Date.parse(body.serverNow)) {
        return {
          ...cached,
          viewerParticipantNo: body.viewerParticipantNo ?? cached.viewerParticipantNo,
        };
      }

      return body;
    },
  });

  useEffect(() => {
    const socket = new WebSocket(liveUrl(lotId));

    socket.addEventListener("message", (event) => {
      if (typeof event.data !== "string") {
        return;
      }

      applyLiveMessage(queryClient, lotId, JSON.parse(event.data) as PublicLotLiveMessage);
    });

    socket.addEventListener("close", (event) => {
      if (event.code === 1000) {
        return;
      }

      // Reconecta com backoff. O próximo frame de abertura substitui a sala.
    });

    return () => {
      socket.close(1000);
    };
  }, [lotId, queryClient]);

  return lotQuery;
}
```

Regras de merge:

- Um frame do socket substitui `serverNow` e `lot`. Ele preserva o `viewerParticipantNo` que já está no cache.
- Ignore um frame cujo `serverNow` é mais antigo que o cache. Um GET lento também não sobrescreve um frame mais novo. Se o GET resolve tarde, mantenha o `lot` mais novo. Copie `viewerParticipantNo` desse GET quando for um número. Se o GET atrasado ainda vier `null`, mantenha um número já gravado a partir da resposta do lance.
- No `201` da rota de lance, chame `rememberViewer` com o `participantNo` dessa resposta. Sem essa escrita, quem acabou de assumir a liderança continua com `viewerParticipantNo: null` e a sala não consegue dizer “você está ganhando”.
- Não faça polling do GET em intervalo para simular a sala. Refaça o GET quando a contagem chegar em `endsAt`, para `ENDED` aparecer mesmo se o frame de liquidação ainda não chegou, e refaça se o socket nunca abrir.
- Na reconexão, o primeiro frame é o snapshot de recuperação. Aplique com `applyLiveMessage`. Não acrescente os lances perdidos na mão.

`viewerParticipantNo` é `null` quando a requisição não tem sessão, o token é inválido ou este usuário não tem lance aceito neste lote. Uma pessoa autenticada que só assistiu a sala permanece `null`.

## Quem deu o último lance

Compare números do cache. Não compare nomes e não procure o id do usuário no frame.

```ts
function lastAcceptedBid(lot: PublicLot) {
  return lot.bids.at(-1) ?? null;
}

function viewerPlacedLastBid(room: PublicLotResponse) {
  const lastBid = lastAcceptedBid(room.lot);

  return (
    room.viewerParticipantNo !== null &&
    lastBid !== null &&
    lastBid.participantNo === room.viewerParticipantNo
  );
}
```

Essa verificação é o mesmo fato que `viewerParticipantNo === lot.leaderParticipantNo` sempre que `currentBid` está definido, porque o líder é o último lance aceito. Use `leaderParticipantNo` no banner, e a verificação do último lance quando o texto fala da última linha do histórico.

O líder anterior é o lance antes do último:

```ts
function viewerWasJustOutbid(room: PublicLotResponse) {
  const lastBid = room.lot.bids.at(-1) ?? null;
  const previousBid = room.lot.bids.at(-2) ?? null;

  return (
    room.viewerParticipantNo !== null &&
    previousBid !== null &&
    previousBid.participantNo === room.viewerParticipantNo &&
    lastBid?.participantNo !== room.viewerParticipantNo
  );
}
```

Quem deu lance antes, e não é nem o líder nem o líder anterior, simplesmente não está liderando. Reserve o texto “você foi superado” para `viewerWasJustOutbid`.

## O que a sala mostra

Renderize o cache. A contagem regressiva é uma apresentação de `serverNow` e `endsAt`, não um segundo relógio.

Mostre as cartas de `items` (`cardName`, `imagePath` e `cardSnapshot`), mais `title`, `description`, `openingBid`, `minIncrement`, `currentBid` e o histórico aceito. Marque a linha do líder com `leaderParticipantNo`. Marque as linhas do usuário autenticado com `viewerParticipantNo`.

Texto de liderança, enquanto `status` é `LIVE`:

- `viewerPlacedLastBid`: “você está ganhando”, ou o texto equivalente.
- `viewerWasJustOutbid`: “você foi superado”, ou o texto equivalente. O líder anterior vê isso sem recarregar.
- Qualquer outro visitante: o lance atual e “Licitante #{leaderParticipantNo}”, sem texto de “você”.

Contagem:

- `SCHEDULED`: conte de `serverNow` até `startsAt`. O lance permanece fechado.
- `LIVE`: conte de `serverNow` até `endsAt`.
- A cada frame, recalcule o offset `Date.parse(serverNow) - Date.now()` e o tempo restante a partir de `endsAt` (ou `startsAt`). Uma prorrogação substitui `endsAt`. Descarte o prazo local antigo.
- `ENDED` ou `CANCELED`: pare a contagem. Não continue rodando a partir de um `endsAt` velho.

Depois de uma desconexão, mantenha o último snapshot só como placeholder. O primeiro frame depois de `onopen` o substitui, inclusive `endsAt`. Se a aba ficou fora durante uma prorrogação, a contagem restaurada usa o `endsAt` novo.

Feche o lance quando `status` é `ENDED` ou `CANCELED`, e enquanto o visitante é o líder. O cancelamento preserva o histórico e não mostra vencedor. Um lote vendido mostra “Licitante #{winnerParticipantNo}” e o valor final. Um lote encerrado com `bidCount === 0` mostra que encerrou sem lances.

Todo socket aberto para aquele id de lote recebe o mesmo frame de um lance aceito. Um socket inscrito em outro id de lote não recebe esse frame.

Lances recusados ficam na resposta do POST (`BID_BELOW_MINIMUM`, `INSUFFICIENT_BALANCE`, `ALREADY_LEADER`, `LOT_NOT_STARTED`, `LOT_ENDED`, `LOT_CANCELED`). Mostre a mensagem do POST no formulário, e mostre falhas do socket como problema de conexão.

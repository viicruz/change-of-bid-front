# Plano de commits: correções de qualidade

Plano derivado de [`relatorio-qualidade-codigo.md`](./relatorio-qualidade-codigo.md). O objetivo é resolver os achados **aos poucos**, em commits pequenos, cada um com escopo único e verificável, sem misturar limpeza, refatoração e mudança de comportamento.

- **Branch base:** `refactor/quality-control` (a partir de `master`)
- **Convenção de mensagem:** Conventional Commits, como no histórico (`feat:`, `fix:`, `chore:`, `refactor:`, `test:`, `ci:`)
- **Sugestão de PRs:** uma PR por fase (as fases são independentes o bastante para revisão separada)

---

## Como usar este plano

### Ordem
As fases vão do **menor para o maior risco**:

1. Remover código morto não muda comportamento e reduz a superfície das refatorações seguintes.
2. Os ajustes de Next/segurança são pequenos e localizados, mas um deles depende de decisão.
3. A refatoração do hotspot nº 1 (`auction-room.tsx`) é feita com os testes já existentes como rede de proteção.
4. A deduplicação vem depois, quando o código já está mais limpo.
5. A manutenção de menor prioridade vem a seguir.
6. Por último, os guard-rails de CI, para não regredir.

### Checklist de cada commit
Rodar antes de cada commit:

```bash
npm run typecheck
npm run lint
npm run test:unit
```

Rodar também quando o commit tocar no item correspondente:

| Tocou em... | Rodar também |
|---|---|
| exports / arquivos removidos | `npx fallow dead-code` (e `npx fallow dead-code --trace <arquivo>:<export>` **antes** de remover) |
| componentes | `npm run test:ct` |
| `messages/*.json` | `npm run check-messages` |
| refatoração de função complexa | `npx fallow health --complexity` |
| código duplicado | `npx fallow dupes` |
| achados do React Doctor | `npx react-doctor@latest . --scope full --yes` |

> **Next 16:** o `AGENTS.md` exige ler o guia em `node_modules/next/dist/docs/` antes de escrever código de Next. Isso vale principalmente para os commits de rewrites (#11a), de `metadata` (#12) e de redirect no servidor (#13). No Next 16, `middleware.ts` virou `proxy.ts`.

### Legenda
- 🟢 risco baixo · 🟡 risco médio · 🔴 risco alto
- ↳ depende de outro commit

---

## Visão geral

| # | Commit | Fase | Risco | Depende de |
|---|---|---|---|---|
| 1 | `chore(fallow): manter ui/ no grafo e corrigir entries` | 0 | 🟢 | — |
| 2 | `chore(hooks): remover re-export morto de use-public-lot-live` | 1 | 🟢 | — |
| 3 | `chore(schemas): remover barrel schemas/common/index.ts` | 1 | 🟢 | — |
| 4 | `refactor(cards): mover cardTypes para lib/cards/card-types.ts` | 1 | 🟢 | — |
| 5 | `chore(lots): remover mock-lots.ts` | 1 | 🟢 | ↳ 4 |
| 6 | `refactor(schemas): deixar schemas intermediários de card.ts locais` | 1 | 🟢 | — |
| 7 | `refactor(schemas): deixar schemas intermediários de lot.ts e wallet.ts locais` | 1 | 🟢 | — |
| 8 | `chore: tratar exports e tipos não usados restantes` | 1 | 🟢 | — |
| 9 | `chore(env): remover env/server.ts` | 1 | 🟢 | — |
| 10 | `chore(ui): remover sidebar do shadcn e dependências órfãs` | 1 | 🟢 | — |
| 11a | `feat(api): servir o backend pela mesma origem do front` | 2 | 🟡 | — |
| 11b | `fix(auth): usar só o cookie de sessão e remover o bearer token` | 2 | 🔴 | ↳ 11a |
| 12 | `feat(seo): adicionar metadata às páginas home, sign-in e sign-up` | 2 | 🟢 | — |
| 13 | `refactor(auth): checar papel de leiloeiro no servidor` | 2 | 🟡 | ↳ 11b |
| 14 | `test(schemas): validar mensagens de erro do Zod 4 e suprimir falso positivo` | 2 | 🟢 | — |
| 15 | `refactor(auction): extrair helpers de valor de lance` | 3 | 🟢 | — |
| 16 | `refactor(auction): extrair ícones e cabeçalho/galeria do lote` | 3 | 🟢 | — |
| 17 | `refactor(auction): extrair PlaceBidForm e hook usePlaceBid` | 3 | 🟡 | ↳ 15 |
| 18 | `refactor(auction): extrair BidPanel e dividir por estado` | 3 | 🟡 | ↳ 17 |
| 19 | `refactor(auction): extrair BidHistory da sala de leilão` | 3 | 🟢 | ↳ 18 |
| 20 | `refactor(api): extrair política de retry compartilhada` | 4 | 🟢 | — |
| 21 | `refactor(hooks): criar useApiQuery e migrar hooks de carteira` | 4 | 🟡 | ↳ 20 |
| 22 | `refactor(hooks): migrar hooks de lote para useApiQuery` | 4 | 🟡 | ↳ 21 |
| 23 | `refactor(hooks): migrar hooks de listagem para useApiQuery` | 4 | 🟡 | ↳ 21 |
| 24 | `refactor(pagination): extrair componente de paginação compartilhado` | 4 | 🟡 | — |
| 25 | `refactor(lots): extrair lista com filtros compartilhada` | 4 | 🟡 | ↳ 24 |
| 26 | `test(auth): cobrir SignInForm e SignUpForm` | 4 | 🟢 | — |
| 27 | `refactor(auth): unificar SignInField/SignUpField em AuthField` | 4 | 🟢 | ↳ 26 |
| 28 | `refactor(auth): extrair AuthPageShell` | 4 | 🟢 | ↳ 12 |
| 29 | `refactor(auth): reduzir complexidade de SignUpForm e SignInForm` | 4 | 🟡 | ↳ 27 |
| 30 | `refactor: mover exports não-componentes para .ts (Fast Refresh)` | 5 | 🟢 | ↳ 25 |
| 31 | `refactor(scripts): quebrar compareStructure` | 5 | 🟢 | — |
| 32 | `refactor(theme): simplificar atalho de teclado do ThemeProvider` | 5 | 🟢 | — |
| 33 | `refactor: reduzir complexidade de componentes moderados` | 5 | 🟡 | — |
| 34 | `test: dividir describes grandes e simplificar harness` | 5 | 🟢 | ↳ 18 |
| 35 | `chore(fallow): configurar boundaries entre camadas` | 6 | 🟢 | — |
| 36 | `ci: tornar fallow e react-doctor bloqueantes` | 6 | 🟢 | ↳ fases 1–5 |

---

## Decisões tomadas

| ID | Pergunta | Resposta | Efeito |
|---|---|---|---|
| **D1** | O backend aceita sessão só por cookie, ou o Bearer token é obrigatório? | Aceita os dois; o Bearer é opcional. | #11a/#11b removem o Bearer; #13 passa a ser viável. |
| **D2** | O projeto vai precisar de variáveis de ambiente server-side? | Não. | #9 remove `src/env/server.ts`. |
| **D3** | O `Sidebar` do shadcn está nos planos? | Não; era usado antes e foi abandonado. | #10 remove o sidebar e o que ficar órfão. |

> **Atenção (D1):** o backend de produção fica em `change-of-bid-back.onrender.com`, outro domínio. `onrender.com` está na Public Suffix List, então o cookie da sessão é sempre **de terceiros** para o front. O Safari bloqueia cookies de terceiros, e é provável que o Bearer tenha sido criado justamente para contornar isso. Tirar o Bearer sem mais nada quebraria o login no Safari. Por isso o #11 virou dois commits: primeiro o front passa a falar com o backend pela **mesma origem** (#11a), e só depois o Bearer sai (#11b). Como bônus, o cookie passa a chegar no servidor do Next, o que permite o #13.

---

## Fase 0: base

### 1. `chore(fallow): manter ui/ no grafo e corrigir entries` 🟢
- **Arquivos:** `.fallowrc.json` (já modificado no working tree), `docs/relatorio-qualidade-codigo.md`, este plano.
- **O quê:** troca `ignorePatterns` por `ignoreFindings` + `overrides`, e adiciona `global.ts` e `playwright/gallery/main.tsx` em `entry` (relatório §2.4).
- **Resultado esperado:** Health Score 81,7 (B), 0 dependências não usadas.

---

## Fase 1: código morto (relatório §2)

Ao final desta fase, `npx fallow dead-code` deve ficar perto de 0 e o gate de severidade `error` deve passar.

### 2. `chore(hooks): remover re-export morto de use-public-lot-live` 🟢
- **Remover:** `src/hooks/lots/use-public-lot-live.ts`. É um re-export de 4 linhas que ninguém importa; o hook real fica em `hooks/lots/queries/`.

### 3. `chore(schemas): remover barrel schemas/common/index.ts` 🟢
- **Remover:** `src/schemas/common/index.ts`. Todos os consumidores importam direto dos módulos.

### 4. `refactor(cards): mover cardTypes para lib/cards/card-types.ts` 🟢
- **Criar:** `src/lib/cards/card-types.ts` com `cardTypes` e `CardType`.
- **Atualizar imports em:**
  - `src/lib/cards/to-auctioneer-card.ts`
  - `src/lib/cards/auctioneer-card.ts`
  - `src/components/auctioneer/card-thumb.tsx`
  - `src/components/auctioneer/create-lot-form-schema.ts`
- Não apagar nada ainda; o commit só move o código (o diff fica fácil de revisar).

### 5. `chore(lots): remover mock-lots.ts` 🟢 ↳ 4
- **Remover:** `src/lib/lots/mock-lots.ts` (`lotStatuses`, `mockLots`, `filterLots`, `LotStatus`, `Lot`).
- Isso também resolve o achado `js-set-map-lookups` do React Doctor (§6.2), que estava dentro de `filterLots`.

### 6. `refactor(schemas): deixar schemas intermediários de card.ts locais` 🟢
- **Arquivo:** `src/schemas/card.ts` (24 exports + 6 tipos mortos, ~83 % do arquivo).
- **O quê:** tirar o `export` de `card*Schema`, `card*Enum`, `card*Array`, `numericComparison*`, `CardSet`, `CardImage`, `CardPrice`, `CardBanlistInfo` e `CardMiscInfo`. **Manter as declarações**, porque elas compõem os schemas usados.
- Apagar só o que, sem `export`, também não é usado localmente (o TS/ESLint vai acusar).

### 7. `refactor(schemas): deixar schemas intermediários de lot.ts e wallet.ts locais` 🟢
- `src/schemas/lot.ts`: `lotStatusSchema`, `lotStatusArray`, `publicLotStatusEnum`, `publicLotStatusArray`, `privateLotStatusArray`, `LotStatus`.
- `src/schemas/wallet.ts`: `walletMoneySchema`, `walletMovementTypeSchema`, `walletMovementSchema`, `WalletMovements`.
- Mesmo critério do #6.

### 8. `chore: tratar exports e tipos não usados restantes` 🟢
Para cada item, rodar `npx fallow dead-code --trace <arquivo>:<export>` e decidir entre:

- **API pública intencional:** marcar com `/** @expected-unused */`. É o caso provável dos tipos de entrada/saída dos hooks: `SignInInput`, `SignUpInput`, `SignOutError`, `CancelLotInput`, `IndexLots`, `IndexPrivateLots`, `IndexParticipations`, `IndexWalletMovements`, `CardSearchResponse`.
- **Sem uso real:** remover o `export`. Candidatos: `cancelLotSchema`, `CardSearchFiltersError`, `toOffsetDateTime` (create-lot-form-schema), `maxMoneyAmount` (schemas/common/money), `ApiResponseError` (schemas/common/api), `AuthUser` (schemas/user) e `DesignIconName` (design-icons).

> Se ficar grande, divida em dois commits: (a) hooks e (b) schemas/lib.

### 9. `chore(env): remover env/server.ts` 🟢
- **Remover:** `src/env/server.ts`. Ele tem um `server: {}` vazio e ninguém usa o `env` exportado (D2).
- **Atualizar:** `next.config.ts`, que faz `import "@/src/env/server"`. Remover essa linha e manter o `import "@/src/env/client"`.
- Isso também resolve o export duplicado de `env` (relatório §2.3).
- **Verificar:** `npm run build`, além do checklist padrão, porque o `next.config.ts` só é exercitado no build/dev.

### 10. `chore(ui): remover sidebar do shadcn e dependências órfãs` 🟢
- **Remover** (D3):
  - `src/components/ui/sidebar.tsx`
  - `src/hooks/use-mobile.ts` (só o sidebar usava)
  - `src/components/ui/tooltip.tsx` (só o sidebar usava)
  - `src/components/ui/separator.tsx` (só o sidebar usava)
- **Manter:** `sheet.tsx` (usado pela navbar), `skeleton.tsx`, `input.tsx` e `button.tsx` (vários usos).
- **Verificar:** `npx fallow dead-code` não deve apontar novos órfãos. Se alguma dependência do `package.json` ficar sem uso, remova no mesmo commit.

---

## Fase 2: segurança e Next.js (relatório §6)

Os commits #11a, #11b e #13 mexem no fluxo de autenticação inteiro. Vale uma PR própria só para eles, separada do #12 e do #14.

### 11a. `feat(api): servir o backend pela mesma origem do front` 🟡
- **Objetivo:** o navegador passa a chamar o backend por um caminho do próprio front (ex.: `/backend/*`), e o Next encaminha para `NEXT_PUBLIC_BACKEND_URL`. Assim o cookie de sessão vira **primário** (first-party) e funciona no Safari.
- **Arquivos:**
  - `next.config.ts`: `rewrites()` de `/backend/:path*` para o backend. Ler antes o guia de rewrites em `node_modules/next/dist/docs/`.
  - `src/lib/api.ts` (`resolveUrl`) e `src/lib/auth-client.ts` (`baseURL`) passam a usar o caminho relativo no navegador.
  - `src/hooks/auth/use-sign-out.ts` (`signOutUrl`).
- **Não muda:** URLs de imagens (`remotePatterns`) continuam apontando direto para o backend.
- **Conferir no backend** (better-auth): o cookie de sessão não pode ter atributo `Domain` fixo, e o `trustedOrigins` precisa incluir a origem do front. Se o backend usa `SameSite=None` para o cross-site atual, pode voltar a `Lax`. Se isso exigir mudança no backend, faça essa mudança antes deste commit.
- O Bearer continua funcionando neste commit; nada é removido ainda. O commit só muda o caminho das chamadas.
- **Verificar:** `npm run test:e2e` e login manual em Chrome **e** Safari (ou WebKit no Playwright).

### 11b. `fix(auth): usar só o cookie de sessão e remover o bearer token` 🔴 ↳ 11a
- **Arquivo principal:** `src/lib/auth-client.ts`. Remover `TOKEN_KEY`, `readBearerToken`, `clearBearerToken`, `storeToken`, o `auth: { type: "Bearer" }` e o `onSuccess`. Manter `credentials: "include"`.
- **Consumidores a ajustar:**
  - `src/lib/api.ts:122`: tirar o header `Authorization`.
  - `src/hooks/auth/use-sign-out.ts:36` e `:62`: tirar a leitura e a limpeza do token.
  - Testes de `tests/unit/api/` e de auth que fazem mock do token.
- Resolve o achado `auth-token-in-web-storage` do React Doctor, o único de segurança real.
- **Verificar:** e2e de login → lance → logout em Chromium **e** WebKit, e conferir que recarregar a página mantém a sessão.

### 12. `feat(seo): adicionar metadata às páginas home, sign-in e sign-up` 🟢
- **Arquivos:** `src/app/page.tsx`, `src/app/sign-in/page.tsx`, `src/app/sign-up/page.tsx`, `messages/en.json`, `messages/pt-br.json`.
- **O quê:** `generateMetadata()` com `getTranslations` do `next-intl` para traduzir o título e a descrição.
- **Verificar:** `npm run check-messages`.

### 13. `refactor(auth): checar papel de leiloeiro no servidor` 🟡 ↳ 11b
- **Pré-requisito:** depois do #11a, o cookie de sessão é do domínio do front, então ele chega ao servidor do Next em toda requisição.
- **Arquivos:** layout de `src/app/auctioneer/` (ou `proxy.ts`, que substitui o `middleware.ts` no Next 16) e `src/components/auth/require-auctioneer.tsx`.
- **O quê:** no servidor, ler o cookie com `cookies()`, consultar a sessão no backend (endpoint de sessão do better-auth, repassando o cookie) e chamar `redirect("/")` se o papel não for `AUCTIONEER`. Depois disso o `RequireAuctioneer` com `router.replace` dentro de `useEffect` pode ser removido.
- **Cuidado:** a checagem no servidor adiciona uma chamada ao backend em cada navegação para `/auctioneer`. Se for usar `proxy.ts`, limitar o `matcher` a essa rota.
- **Verificar:** `tests/unit/auth/require-auctioneer.test.ts` precisará ser reescrito ou trocado por um e2e (bidder tentando abrir `/auctioneer` → vai para `/`).

### 14. `test(schemas): validar mensagens de erro do Zod 4 e suprimir falso positivo` 🟢
- **Arquivos:** `src/hooks/lots/mutations/use-store-bid.ts:17`, `src/hooks/wallets/mutations/use-store-deposit.ts:20`.
- **O quê:** adicionar um teste unitário que garante que `z.string("INVALID_MONEY")` / `{ error: ... }` produzem a mensagem esperada. Se o teste passar, suprimir `zod-v4-no-deprecated-error-customization` nesses dois pontos (ou no `doctor.config.json`) com um comentário apontando para o teste.

---

## Fase 3: `auction-room.tsx`, o hotspot nº 1 (relatório §3.1–3.2)

O arquivo tem 1083 linhas, é o hotspot com mudança acelerando e contém `BidPanel` (cic. 21 / cog. 28) e `PlaceBidForm` (cic. 15 / cog. 19). **Rede de proteção:** `tests/unit/auction/auction-room.test.ts` (832 linhas). Ele deve passar **sem alterações** nos commits 15–19; se precisar mudar o teste, o refactor mudou comportamento.

Estrutura-alvo sugerida:

```
src/components/auction/
  auction-room.tsx          # só AuctionRoom + AuctionRoomDetails
  auction-icons.tsx         # ClockIcon, CheckIcon, GavelIcon
  lot-header.tsx            # LotBreadcrumb, LotHeading, LotContents
  lot-gallery.tsx
  place-bid-form.tsx
  bid-panel.tsx             # BidPanel + LeadershipBanner, LotTimerBar, LotOutcome
  bid-lock.tsx
  room-bid-history.tsx
src/lib/auction/bid-money.ts
src/hooks/lots/use-place-bid.ts
```

### 15. `refactor(auction): extrair helpers de valor de lance` 🟢
- **Mover** para `src/lib/auction/bid-money.ts`: `moneyToNumber`, `moneyToCents`, `centsToMoney`, `minimumBidCents`, `isBidErrorCode` e `readBidErrorCode`.
- **Adicionar** testes unitários puros para esses helpers (hoje só são testados indiretamente).

### 16. `refactor(auction): extrair ícones e cabeçalho/galeria do lote` 🟢
- Mover `ClockIcon`/`CheckIcon`/`GavelIcon`, `SmallLabel`, `LotBreadcrumb`, `LotHeading`, `LotGallery` e `LotContents` para arquivos próprios.
- Só move código; não altera nada.

### 17. `refactor(auction): extrair PlaceBidForm e hook usePlaceBid` 🟡 ↳ 15
- `PlaceBidForm` vai para `place-bid-form.tsx` e `BidLock` para `bid-lock.tsx`.
- Extrair o estado e os handlers (valor, validação de mínimo, mutation, mapeamento de erro) para `usePlaceBid`. O componente fica só com a renderização.
- **Meta:** `PlaceBidForm` abaixo de 60 LOC e cognitiva < 15.

### 18. `refactor(auction): extrair BidPanel e dividir por estado` 🟡 ↳ 17
- `BidPanel` vai para `bid-panel.tsx` junto com `LeadershipBanner`, `LotTimerBar` e `LotOutcome`.
- Trocar a cadeia de condicionais por uma função `resolveBidPanelState(room, viewer)` que retorna um estado discriminado (ex.: `"guest" | "owner" | "locked" | "open" | "finished"`), e um `switch` que escolhe o subcomponente.
- **Meta:** ciclomática < 10; deve resolver o `no-high-complexity-react-function` do React Doctor.

### 19. `refactor(auction): extrair BidHistory da sala de leilão` 🟢 ↳ 18
- `BidHistory` (linha 880) vai para `room-bid-history.tsx`. Ele tem nome igual ao de `components/bids/bid-history.tsx`, então é bom renomear.
- Ao final, `auction-room.tsx` deve ter menos de 150 linhas.

---

## Fase 4: duplicação (relatório §4)

### 20. `refactor(api): extrair política de retry compartilhada` 🟢
- Os hooks de query repetem o mesmo `retry` (não repetir `ApiSchemaError` nem 4xx; no máximo 3 tentativas).
- **Criar:** `shouldRetryApiError(failureCount, error)` em `src/lib/query-client.ts` (ou `src/lib/api.ts`) e usar em todos os hooks.
- Commit pequeno que já remove boa parte dos clones de 15–19 linhas.

### 21. `refactor(hooks): criar useApiQuery e migrar hooks de carteira` 🟡 ↳ 20
- **Criar** um helper genérico (ex.: `src/hooks/commons/use-api-query.ts`) que recebe `queryKey`, `url`, `schema`, `enabled`, `staleTime` e, opcionalmente, um requisito de sessão, e aplica o retry e o `errorSchema` padrão.
- **Migrar:** `use-show-wallet.ts` e `use-index-wallet-movements.ts`.
- Os testes existentes dos hooks devem passar sem mudança.

### 22. `refactor(hooks): migrar hooks de lote para useApiQuery` 🟡 ↳ 21
- `use-show-lot.ts`, `use-show-private-lot.ts`, `use-show-lot-audit.ts` e `use-public-lot-live.ts`.
- Se a parte de "buscar e parsear lote" ainda sobrar duplicada (clone de 28 linhas), extrair um `fetchLot(url, schema)`.

### 23. `refactor(hooks): migrar hooks de listagem para useApiQuery` 🟡 ↳ 21
- `use-index-private-lots.ts`, `use-index-participations.ts` e, se couber, `use-index-lots.ts`.
- **Meta acumulada dos #20–23:** cerca de 100 linhas a menos e o mesmo tratamento de erro em todos os hooks.

### 24. `refactor(pagination): extrair componente de paginação compartilhado` 🟡
- Hoje `paginationEntryKey`/`PaginationPageItem` aparecem em `bids/bid-history.tsx`, `home/lot-section.tsx` e `wallet/wallet-movements-pagination.tsx`, e há um bloco parecido em `auctioneer/card-search-panel.tsx:362-384`.
- **Criar** um componente único (ex.: `src/components/utils/page-pagination.tsx`) sobre `ui/pagination.tsx` + `lib/pagination.ts`, e trocar os 4 usos.
- Pode ser dividido em um commit para criar e migrar `wallet-movements-pagination` e outro para os demais.

### 25. `refactor(lots): extrair lista com filtros compartilhada` 🟡 ↳ 24
- Resolver o clone de 122 linhas entre `bid-history.tsx:323-443` e `lot-section.tsx:213-334`. Depois do #24, ver o que sobra (filtros, estado vazio, skeleton) e extrair isso.
- Também deve reduzir a cognitiva de `LotSection` (19).

### 26. `test(auth): cobrir SignInForm e SignUpForm` 🟢
- Testes de componente (`npm run test:ct`) para submissão válida, erros de validação e erro da API.
- Vem **antes** dos refactors #27–29 para servir de rede de proteção. Também derruba o CRAP de 342/132.

### 27. `refactor(auth): unificar SignInField/SignUpField em AuthField` 🟢 ↳ 26
- Clone de 32 linhas entre `sign-in-form.tsx:52-83` e `sign-up-form.tsx:105-136`. Criar `src/components/auth/auth-field.tsx`.

### 28. `refactor(auth): extrair AuthPageShell` 🟢 ↳ 12
- Clone de 15 linhas entre `app/sign-in/page.tsx` e `app/sign-up/page.tsx`. Fazer depois do #12 para não gerar conflito com o `metadata`.

### 29. `refactor(auth): reduzir complexidade de SignUpForm e SignInForm` 🟡 ↳ 27
- Extrair a lógica de submissão/estado para hooks (`useSignInForm`, `useSignUpForm`) e quebrar o callback de `sign-up-form.tsx:289`.
- **Meta:** ambos abaixo de 60 LOC e cognitiva < 15.

---

## Fase 5: manutenção (prioridade baixa)

### 30. `refactor: mover exports não-componentes para .ts (Fast Refresh)` 🟢 ↳ 25
- `auctioneer/auctioneer-lot-list.tsx:31`, `design/design-icons.tsx:142` e `home/lot-section.tsx:40`: mover constantes/helpers exportados para arquivos `.ts` vizinhos.
- Fica depois do #25 porque `lot-section.tsx` vai mudar lá.

### 31. `refactor(scripts): quebrar compareStructure` 🟢
- `scripts/check-messages-parity.ts:35` (cognitiva 34): separar em `compareObjects`, `compareArrays`, `compareLeaf` etc.
- Já existe `tests/unit/scripts/`; garantir que cobre os casos antes de mexer.

### 32. `refactor(theme): simplificar atalho de teclado do ThemeProvider` 🟢
- `onKeyDown` (`theme-provider.tsx:41`) e `isTypingTarget` (`:24`): early returns e uma função pura `isThemeShortcut(event)`, com teste unitário.

### 33. `refactor: reduzir complexidade de componentes moderados` 🟡
Um commit por componente, só se houver tempo:
- `CardSearchPanel` (`auctioneer/card-search-panel.tsx:108`, 233 LOC)
- `BidCard` (`bids/bid-card.tsx:140`)
- `AuctioneerLotListItem` (`auctioneer/auctioneer-lot-list.tsx:96`)
- callback da navbar (`navbar/navbar.tsx:158`)
- `toLocale` (`i18n/request.ts:29`)

Antes, conferir `wallet-summary.tsx` (hotspot nº 2, acelerando) e `auctioneer-panel.tsx` (nº 3). Eles não estão acima do limite, mas recebem muitas mudanças.

### 34. `test: dividir describes grandes e simplificar harness` 🟢 ↳ 18
- `auction-room.test.ts` (832 linhas), `bid-history.test.ts` (569), `use-show-lot.test.ts` (523): `describe` aninhados por cenário.
- `ParticipationsHarness` (`use-index-participations.test.ts:81`, cic. 21): extrair fixtures.
- Fazer depois da fase 3, para dividir o teste já alinhado aos novos arquivos.

---

## Fase 6: guard-rails

### 35. `chore(fallow): configurar boundaries entre camadas` 🟢
- Adicionar `boundaries` no `.fallowrc.json` com as camadas `app → components → hooks → lib/schemas`. Proibir, por exemplo, `schemas` importar `components`/`hooks` e `lib` importar `components`.
- Rodar `npx fallow architecture` e corrigir as violações que aparecerem (se houver muitas, fazer em commits separados).

### 36. `ci: tornar fallow e react-doctor bloqueantes` 🟢 ↳ fases 1–5
- `.github/workflows/fallow.yml`: `fail-on-issues: true` (hoje é `false`).
- `.github/workflows/react-doctor.yml`: `blocking: error` (depois `warning`, quando estabilizar).
- `doctor.config.json`: trocar `"base": "preview"` por `"master"`, que é a branch base das PRs.
- Só ligar depois que as fases anteriores zerarem os achados; senão toda PR fica vermelha.

---

## Resultado esperado ao final

| Indicador | Antes | Meta |
|---|---|---|
| Fallow Health Score | 81,7 (B) | ≥ 90 (A) |
| React Doctor | 77 | ≥ 90 |
| Código morto (Fallow) | 66 itens | 0 (ou só `@expected-unused`) |
| Funções acima do limite | 20 (5 críticas) | 0 críticas, ≤ 5 moderadas (a maioria em testes) |
| Duplicação | 3,0 % / 12 grupos | < 1,5 % |
| `auction-room.tsx` | 1083 linhas | < 150 linhas |

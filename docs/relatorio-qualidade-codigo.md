# Relatório de Controle de Qualidade de Código

- **Projeto:** change-of-bid-front (Next.js 16.4.2 · React 19.3.0 · TypeScript · Zod 4 · TanStack Query 5)
- **Data:** 2026-10-29
- **Branch / commit:** `preview` @ `5906be8`
- **Ferramentas:** Fallow 3.37.0 · React Doctor 0.9.18
- **Escopo:** projeto completo (`src/`, `tests/`, `playwright/`, `scripts/`). Os achados de `src/components/ui/**` (shadcn) ficam ocultos.

> **Atualização (mesma data):** o `.fallowrc.json` foi corrigido depois da primeira rodada (ver §2.4). Os números deste relatório já refletem a config nova. Os valores originais aparecem entre parênteses quando mudaram.

> O React Doctor rodou com `--scope full`, porque o `doctor.config.json` usa `scope: "changed"` contra `preview` e, na própria branch `preview`, esse escopo não acha nada.

---

## 1. Resumo executivo

| Indicador | Valor | Leitura |
|---|---|---|
| **Fallow Health Score** | **81,7 / 100 (nota B)** (antes: 63,2 / C) | Subiu só com a correção da config (§2.4) |
| **React Doctor Score** | **77 / 100 ("Needs work")** | 0 erros, 12 avisos em 12 arquivos |
| Arquivos analisados | 223 (antes 202) | 2.168 funções; `ui/` agora entra no grafo |
| Manutenibilidade média | 92,1 | Boa |
| Complexidade ciclomática média / p90 | 1,6 / 3 | Boa |
| Dependências circulares | 0 | ✅ |
| Duplicação | 3,0 % (589 linhas, 12 grupos) | Aceitável, com 1 caso grande |
| Código morto (Fallow) | 66 itens (antes 77) | 3 arquivos, 41 exports, 21 tipos, 0 deps, 1 export duplicado |
| Funções acima do limite de complexidade | 20 | 5 críticas, 3 altas, 12 moderadas |
| Candidatos de segurança | 5 (Fallow) + 1 (React Doctor) | Nenhum confirmado como explorável; 1 merece decisão |
| Feature flags | 0 | — |

**Detalhe das penalidades no score do Fallow (config nova):** tamanho de unidade −10,0 · hotspots −3,3 · exports mortos −2,7 · acoplamento −2,0 · arquivos mortos −0,3. (Antes da correção havia também −17,4 de dependências "não usadas", todas falsos positivos.)

**Conclusão:** a base é saudável quanto a estrutura (sem ciclos, complexidade média baixa, manutenibilidade alta). Os principais pontos são: **(1)** ~~a configuração do Fallow, que gerava falsos positivos de dependências~~ (resolvido); **(2)** a superfície de exports mortos em `src/schemas/card.ts` e `src/lib/lots/mock-lots.ts`; **(3)** alguns componentes grandes e complexos (`BidPanel`, `PlaceBidForm`, `SignUpForm`, `SignInForm`); **(4)** duplicação entre `bid-history.tsx` e `lot-section.tsx` e entre os hooks de query.

---

## 2. Fallow: código morto

`fallow dead-code`: **66 itens** (antes: 77). O gate de severidade `error` continua falhando por causa dos exports mortos reais.

### 2.1 Arquivos não usados (3; antes 7)

| Arquivo | Veredito | Observação |
|---|---|---|
| `src/hooks/lots/use-public-lot-live.ts` | ✅ **Remover** | Re-export de 4 linhas de `hooks/lots/queries/use-public-lot-live.ts`; ninguém importa. |
| `src/schemas/common/index.ts` | ✅ Provável remoção | Barrel sem consumidores (todos importam direto dos módulos). |
| `src/hooks/use-mobile.ts` | ⚠️ Morto por cascata | Só `src/components/ui/sidebar.tsx` usa esse hook, e o próprio `sidebar.tsx` não é importado por ninguém (o `--trace-file` confirma que ele é inalcançável). Se o sidebar do shadcn não estiver nos planos, remova os dois. |
| ~~`global.ts`~~ | ✔️ Resolvido | Augmentation de tipos do `next-intl`; agora está em `entry`. |
| ~~`playwright/gallery/main.tsx`~~ | ✔️ Resolvido | Agora está em `entry`. |
| ~~`playwright/support/component-providers.tsx`~~ | ✔️ Resolvido | Passou a ser alcançado a partir da galeria. |
| ~~`src/components/wallet/deposit-form.story.tsx`~~ | ✔️ Resolvido | A galeria carrega via `import.meta.glob("**/*.story.tsx")`. |

### 2.2 Exports e tipos não usados (41 exports + 21 tipos)

Concentração por arquivo:

| Arquivo | Itens mortos | Destaques |
|---|---|---|
| `src/schemas/card.ts` | **24 exports + 6 tipos** (~83 % do arquivo) | `card*Schema`, `card*Enum`, `card*Array`, `numericComparison*`, `CardSet`, `CardImage`, `CardPrice`, `CardBanlistInfo`, `CardMiscInfo` |
| `src/lib/lots/mock-lots.ts` | 3 exports + 2 tipos (~75 %) | `lotStatuses`, `mockLots`, `filterLots`, `LotStatus`, `Lot`. Só `cardTypes`/`CardType` continuam em uso. |
| `src/schemas/lot.ts` | 5 exports + 1 tipo | `lotStatusSchema`, `lotStatusArray`, `publicLotStatusEnum`, `publicLotStatusArray`, `privateLotStatusArray`, `LotStatus` |
| `src/schemas/wallet.ts` | 3 exports + 1 tipo | `walletMoneySchema`, `walletMovementTypeSchema`, `walletMovementSchema`, `WalletMovements` |
| Hooks (`use-sign-in`, `use-sign-up`, `use-sign-out`, `use-cancel-lot`, `use-index-*`) | tipos de entrada/saída e schemas de erro | `SignInInput`, `SignUpInput`, `SignOutError`, `cancelLotSchema`, `CancelLotInput`, `IndexLots`, `IndexPrivateLots`, `IndexParticipations`, `IndexWalletMovements`, `CardSearchFiltersError`, `CardSearchResponse` |
| Outros | 1 cada | `toOffsetDateTime` (create-lot-form-schema), `maxMoneyAmount` (schemas/common/money), `ApiResponseError` (schemas/common/api), `AuthUser` (schemas/user), `DesignIconName` (design-icons), `env` (env/server) |

**Recomendação:**
- Em `card.ts`, `lot.ts` e `wallet.ts`, muitos schemas intermediários (`*Schema` → `*Enum` → `*Array`) só servem para compor outros schemas. Em vez de apagar, **remova o `export`** e mantenha a declaração local.
- Tipos exportados ao lado dos hooks (`SignInInput`, `IndexLots`, ...) são API pública "por convenção". Se forem intencionais, marque com `/** @expected-unused */`. Se não, remova o `export`.
- `mock-lots.ts`: mova `cardTypes`/`CardType` para um módulo de domínio (ex.: `src/lib/cards/card-types.ts`) e apague o restante do mock.
- Antes de cada remoção: `npx fallow dead-code --trace <arquivo>:<export>`.

### 2.3 Export duplicado

- `env` é exportado por `src/env/client.ts` e por `src/env/server.ts`. Além disso, `env` de `server.ts` **não é usado por ninguém**. Confirme se o projeto precisa de variáveis de ambiente server-side. Se não, remova `src/env/server.ts`. Se sim, renomeie para `serverEnv`.

### 2.4 Dependências não usadas: 0 (antes 6 + 1 dev) ✔️ resolvido

Na primeira rodada, 7 pacotes apareciam como não usados: `@base-ui/react`, `class-variance-authority`, `react-number-format`, `shadcn`, `tw-animate-css`, `date-fns` e `tailwindcss` (dev). **Todos eram falsos positivos.**

**Causa raiz:** o `ignorePatterns` antigo (`src/components/ui/**`, `**/*.css`) tirava esses arquivos do **grafo inteiro**, e não só dos relatórios. Assim, as dependências usadas pelo shadcn e pelo `globals.css` pareciam órfãs. O `date-fns` também é falso positivo: o `--trace-dependency` mostra que ele é *peer dependency* do `@base-ui/react`, então **não deve ser removido**. Essa era a maior penalidade do score (−17,4).

**Config aplicada (`.fallowrc.json`):**

```jsonc
{
  "$schema": "https://raw.githubusercontent.com/fallow-rs/fallow/main/schema.json",
  "entry": ["global.ts", "playwright/gallery/main.tsx"],
  // ui/** continua no grafo (dependências rastreadas), só os achados ficam ocultos
  "ignoreFindings": ["src/components/ui/**"],
  // stories exportam `Default` por convenção e são carregadas via import.meta.glob
  "ignoreExports": [{ "file": "**/*.story.tsx", "exports": ["*"] }],
  // ignoreFindings vale só para código morto; complexidade do shadcn fica fora assim
  "overrides": [
    {
      "files": ["src/components/ui/**"],
      "rules": {
        "complexity-cyclomatic": "off",
        "complexity-cognitive": "off",
        "complexity-crap": "off"
      }
    }
  ]
}
```

Efeito: o Health Score foi de 63,2 (C) para **81,7 (B)**, o código morto de 77 para 66 itens, e as funções acima do limite de complexidade continuam as mesmas 20.

---

## 3. Fallow: complexidade e saúde

Limites: ciclomática 20 · cognitiva 15 · CRAP 30 · tamanho de unidade 60 LOC.

### 3.1 Funções acima do limite (20)

| Sev. | Função | Arquivo:linha | Ciclom. | Cognit. | CRAP | LOC |
|---|---|---|---|---|---|---|
| 🔴 crítica | `BidPanel` | `src/components/auction/auction-room.tsx:777` | 21 | 28 | 116 | 102 |
| 🔴 crítica | `SignUpForm` | `src/app/sign-up/sign-up-form.tsx:142` | 18 | 20 | 342 | 212 |
| 🔴 crítica | `SignInForm` | `src/app/sign-in/sign-in-form.tsx:88` | 11 | 17 | 132 | 120 |
| 🔴 crítica | `onKeyDown` | `src/components/theme-provider.tsx:41` | 11 | 8 | 132 | 19 |
| 🔴 crítica | `ParticipationsHarness` (teste) | `tests/unit/hooks/use-index-participations.test.ts:81` | 21 | 12 | 116 | 30 |
| 🟠 alta | `compareStructure` | `scripts/check-messages-parity.ts:35` | 22 | **34** | — | 95 |
| 🟠 alta | `PlaceBidForm` | `src/components/auction/auction-room.tsx:457` | 15 | 19 | 64 | 178 |
| 🟠 alta | `<arrow>` | `playwright/gallery/main.tsx:72` | 7 | 4 | 56 | 25 |
| 🟡 moderada | `CardSearchPanel` | `src/components/auctioneer/card-search-panel.tsx:108` | 9 | 20 | — | 233 |
| 🟡 moderada | `LotSection` | `src/components/home/lot-section.tsx:75` | 9 | 19 | — | 134 |
| 🟡 moderada | `BidCard` | `src/components/bids/bid-card.tsx:140` | 15 | 16 | — | 141 |
| 🟡 moderada | `AuctioneerLotListItem` | `src/components/auctioneer/auctioneer-lot-list.tsx:96` | 12 | 11 | 43 | 87 |
| 🟡 moderada | `<arrow>` | `src/components/navbar/navbar.tsx:158` | 11 | 12 | 37 | 39 |
| 🟡 moderada | `SignInField` / `SignUpField` | `sign-in-form.tsx:43` / `sign-up-form.tsx:95` | 6 | 5 | 42 | ~45 |
| 🟡 moderada | `<arrow>` | `src/app/sign-up/sign-up-form.tsx:289` | 6 | 4 | 42 | 42 |
| 🟡 moderada | `toLocale` | `src/i18n/request.ts:29` | 5 | 5 | 30 | 19 |
| 🟡 moderada | `isTypingTarget` | `src/components/theme-provider.tsx:24` | 5 | 2 | 30 | 12 |
| 🟡 moderada | 2 casos de teste (`it(...)`) | `tests/unit/audit/lot-audit.test.ts:167`, `tests/unit/auction/auction-room.test.ts:216` | 11–13 | 0 | 37–50 | 59–75 |

> O CRAP é calculado com cobertura **estimada estaticamente** (`coverage_model: static_estimated`). Os valores altos de `SignUpForm`/`SignInForm`/`theme-provider` indicam falta de testes de componente que alcancem essas funções, não necessariamente lógica ruim.

### 3.2 Hotspots (complexidade × churn no git)

| Arquivo | Score | Commits | +/− linhas | Tendência |
|---|---|---|---|---|
| `src/components/auction/auction-room.tsx` | 59,1 | 12 | +1557 / −474 | 📈 acelerando |
| `src/components/wallet/wallet-summary.tsx` | 45,2 | 10 | +522 / −295 | 📈 acelerando |
| `src/components/auctioneer/auctioneer-panel.tsx` | 36,2 | 8 | +915 / −401 | estável |
| `src/components/wallet/deposit-form.tsx` | 34,1 | 6 | +340 / −135 | esfriando |
| `src/lib/auth-client.ts` | 33,6 | 6 | +64 / −3 | 📈 acelerando (fan-in 8) |
| `src/app/sign-up/sign-up-form.tsx` | 26,9 | 6 | +508 / −155 | estável |
| `src/components/home/lot-card.tsx` | 26,5 | 10 | +578 / −196 | estável |

**`auction-room.tsx` é o ponto mais crítico:** é o maior hotspot, a mudança está acelerando, e o arquivo contém as duas funções mais complexas da UI (`BidPanel` e `PlaceBidForm`). É o primeiro candidato a refatorar: extraia `BidPanel`/`PlaceBidForm` para arquivos próprios e mova a lógica de estado para hooks.

### 3.3 Alvos de refatoração priorizados (`--targets`)

1. `src/schemas/card.ts`: remover 24 exports mortos (83 % da superfície). Prioridade 31,6, confiança alta.
2. `src/lib/lots/mock-lots.ts`: remover 3 exports mortos (75 %). Prioridade 23,4, confiança alta.
3. `scripts/check-messages-parity.ts`: quebrar `compareStructure` (cognitiva 34) em funções menores. Prioridade 8,8.

### 3.4 Tamanho de unidade

- 8,1 % das funções têm risco alto e 5,8 % risco muito alto de tamanho; há 57,5 funções acima de 60 LOC por mil.
- Os maiores casos são blocos `describe(...)` de testes (`auction-room.test.ts` com 832 linhas, `bid-history.test.ts` com 569, `use-show-lot.test.ts` com 523). Em testes, isso pesa menos, mas vale dividir em `describe` aninhados por cenário.

---

## 4. Fallow: duplicação

`fallow dupes` (modo `mild`): **3,0 %** de linhas duplicadas (589 de 19.392; antes 3,5 % sobre 16.803, porque `ui/` não entrava na conta), 12 grupos de clones em 17 arquivos.

| Linhas | Arquivos | Sugestão |
|---|---|---|
| **122** | `components/bids/bid-history.tsx:323-443` ↔ `components/home/lot-section.tsx:213-334` | Extrair um componente compartilhado (provavelmente paginação/lista com filtros). |
| 32 | `app/sign-in/sign-in-form.tsx:52-83` ↔ `app/sign-up/sign-up-form.tsx:105-136` | Unificar `SignInField`/`SignUpField` em um `AuthField`. |
| 28 | `hooks/lots/queries/use-public-lot-live.ts`, `use-show-lot-audit.ts`, `use-show-private-lot.ts` | Extrair um helper de query/parse de lote. |
| 23 | `auctioneer/card-search-panel.tsx:362-384` ↔ `bids/bid-history.tsx:361-383` | Mesmo bloco de paginação/listagem. |
| 19 + 18 | `use-index-private-lots.ts`, `use-index-wallet-movements.ts`, `use-show-wallet.ts` | Extrair uma factory de hook autenticado (`useAuthedQuery`). |
| 19 + 18 | `use-show-lot-audit.ts`, `use-show-lot.ts`, `use-show-private-lot.ts` | Idem. |
| 17 | `use-public-lot-live.ts` ↔ `use-show-private-lot.ts` | Idem. |
| 15 | `use-index-private-lots.ts` ↔ `use-index-participations.ts` | Idem. |
| 15 | `app/sign-in/page.tsx` ↔ `app/sign-up/page.tsx` | Layout comum de autenticação (`AuthPageShell`). |
| 11 | `design/colors-section.tsx` ↔ `design/motion-section.tsx` | Baixa prioridade (página de design system). |

**Padrão recorrente:** os hooks em `src/hooks/**/queries/` repetem o mesmo esqueleto (sessão + `queryKey` + `api.get` + `schema`). Um helper genérico eliminaria cerca de 100 linhas e padronizaria o tratamento de erro.

---

## 5. Fallow: arquitetura, segurança e flags

### 5.1 Arquitetura
- **0** dependências circulares, re-export cycles ou violações client/server do Next (`invalid-client-export`, `mixed-client-server-barrel`, `misplaced-directive`, `route-collision`): ✅
- Não há `boundaries` nem `rulePacks` configurados, então esses detectores **não rodaram**. Recomenda-se definir camadas (ex.: `app → components → hooks → lib/schemas`) para impedir que `schemas` importe `components`.
- 70 entry points detectados (69 pelo plugin do Next).

### 5.2 Candidatos de segurança (não verificados pela ferramenta; analisados manualmente)

| Arquivo:linha | Categoria | Análise | Veredito |
|---|---|---|---|
| `src/lib/api.ts:147` e `:163` | SSRF (CWE-918) | A URL vem de `resolveUrl()`, que sempre prefixa `env.NEXT_PUBLIC_BACKEND_URL`. Só o *path* varia, e ele vem de código interno. Roda no cliente. | ❌ Falso positivo / risco baixo |
| `src/hooks/auth/use-sign-out.ts:45` | SSRF (CWE-918) | `signOutUrl()` é constante, baseada na mesma env. | ❌ Falso positivo |
| `scripts/check-messages-parity.ts:134` e `:147` | Path traversal (CWE-22) | Script local de CI que lê `messages/*.json`; não recebe entrada externa. | ❌ Falso positivo |

### 5.3 Feature flags
- Nenhuma flag detectada.

---

## 6. React Doctor

**Score 77/100 ("Needs work")**, 0 erros, 12 avisos, 202 arquivos, framework `nextjs`.

### 6.1 Por categoria

| Categoria | Qtde | Regras |
|---|---|---|
| Bugs | 4 | `nextjs-missing-metadata` (3), `nextjs-no-client-side-redirect` (1) |
| Maintainability | 6 | `only-export-components` (3), `zod-v4-no-deprecated-error-customization` (2), `no-high-complexity-react-function` (1) |
| Security | 1 | `auth-token-in-web-storage` |
| Performance | 1 | `js-set-map-lookups` |

### 6.2 Achados detalhados (ordem de prioridade do React Doctor)

| Prio. | Regra | Local | Análise / ação |
|---|---|---|---|
| **P2 (68)** | `auth-token-in-web-storage` | `src/lib/auth-client.ts:34` | O token Bearer do better-auth (`set-auth-token`) vai para `sessionStorage`, onde qualquer XSS consegue ler. **Achado real.** O ideal é depender só do cookie `HttpOnly` da sessão (`credentials: "include"` já está ativo). Se o Bearer for obrigatório (backend em outro domínio), documente o motivo e reforce a CSP. **Decisão de arquitetura necessária.** |
| P2 (56) | `nextjs-no-client-side-redirect` | `src/components/auth/require-auctioneer.tsx:29` | `router.replace("/")` dentro de `useEffect`. O componente retorna `null` enquanto não autoriza, então não há "flash" de conteúdo protegido, mas a página aparece em branco antes do redirect. Uma solução melhor é checar o papel no servidor (layout/`proxy`) e usar `redirect()`. |
| P2 (54) | `nextjs-missing-metadata` | `src/app/page.tsx`, `src/app/sign-in/page.tsx`, `src/app/sign-up/page.tsx` | Exportar `metadata`/`generateMetadata()` (com `next-intl` para traduzir títulos). |
| P3 (48) | `js-set-map-lookups` | `src/lib/lots/mock-lots.ts:151` | Fica dentro de `filterLots`, que já é código morto (§2.2). Resolva removendo o código. |
| P3 (34) | `zod-v4-no-deprecated-error-customization` | `src/hooks/lots/mutations/use-store-bid.ts:17`, `src/hooks/wallets/mutations/use-store-deposit.ts:20` | **Provável falso positivo.** O código já usa a sintaxe do Zod 4 (`z.string("INVALID_MONEY")` e `{ error: ... }`). Vale validar com um teste e, se confirmado, suprimir a regra. |
| P3 (12) | `only-export-components` | `auctioneer/auctioneer-lot-list.tsx:31`, `design/design-icons.tsx:142`, `home/lot-section.tsx:40` | Mova constantes/helpers exportados para arquivos `.ts` separados para preservar o Fast Refresh. |
| P3 | `no-high-complexity-react-function` | `src/components/auction/auction-room.tsx:777` (`BidPanel`) | Confirma o achado do Fallow (§3.1): ciclomática 21, cognitiva 24. |

---

## 7. Achados convergentes (as duas ferramentas)

| Tema | Fallow | React Doctor |
|---|---|---|
| `BidPanel` complexo demais | Crítica (cic. 21 / cog. 28), arquivo é o hotspot nº 1 | `no-high-complexity-react-function` |
| `mock-lots.ts` | 75 % de exports mortos | `js-set-map-lookups` em código morto |
| `lot-section.tsx` | Cognitiva 19 + clone de 122 linhas | `only-export-components` |
| `design-icons.tsx` | `DesignIconName` não usado | `only-export-components` |

---

## 8. Plano de ação recomendado

### Prioridade alta
1. ~~**Corrigir o `.fallowrc.json`** (§2.4)~~ ✔️ **Feito.** Removeu 7 falsos positivos de dependência e 4 de arquivo; o score foi de 63,2 para 81,7.
2. **Decidir o armazenamento do token** em `src/lib/auth-client.ts` (§6.2): é o único achado de segurança real.
3. **Refatorar `src/components/auction/auction-room.tsx`**: separar `BidPanel` e `PlaceBidForm` e extrair a lógica para hooks.

### Prioridade média
4. Limpar código morto: `src/hooks/lots/use-public-lot-live.ts`, `src/schemas/common/index.ts` (e, se o sidebar do shadcn não for usado, `ui/sidebar.tsx` + `hooks/use-mobile.ts`), o mock em `mock-lots.ts` e os exports intermediários de `schemas/card.ts`/`lot.ts`/`wallet.ts`. Use `npx fallow fix --dry-run` antes de `npx fallow fix --yes`.
5. Extrair o componente compartilhado entre `bid-history.tsx` e `lot-section.tsx` (122 linhas).
6. Criar um helper genérico para os hooks de query autenticados (cerca de 100 linhas duplicadas).
7. Adicionar `metadata` às 3 páginas e mover a checagem de `RequireAuctioneer` para o servidor.

### Prioridade baixa
8. Unificar `SignInForm`/`SignUpForm` (campo e layout compartilhados) e cobri-los com testes de componente para reduzir o CRAP.
9. Mover exports que não são componentes para arquivos `.ts` (Fast Refresh).
10. Quebrar `compareStructure` em `scripts/check-messages-parity.ts`.
11. Configurar `boundaries` no Fallow e um gate de CI (`fallow audit --base master` + `react-doctor --scope changed`).

---

## 9. Como reproduzir

```bash
npx fallow dead-code
npx fallow dupes
npx fallow health --score --hotspots --targets --complexity
npx fallow architecture
npx fallow security
npx react-doctor@latest . --scope full --yes --verbose
```

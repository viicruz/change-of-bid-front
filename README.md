# Change of Bid

Frontend de um leilão de cartas de Yu-Gi-Oh. Feito para o desafio **Teste técnico: Elite Dev** na empresa Verzel.

A interface está em inglês e português do Brasil (padrão: português). Cadastro e login conversam com a API. As telas de lotes, lances, carteira e leiloeiro usam dados locais de exemplo.

A API fica em outro repositório: [change-of-bid-back](https://github.com/viicruz/change-of-bid-back).

## Requisitos

- Node.js 20 ou mais recente
- npm
- O [backend](https://github.com/viicruz/change-of-bid-back) em execução para criar uma conta ou entrar

## Instalação e execução

```bash
npm install
cp example.env .env
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

O `example.env` aponta o app para a API:

```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

Altere esse valor se o backend não estiver na porta `3001`.

Build de produção:

```bash
npm run build
npm start
```

## Rotas

| Rota | O que faz |
| --- | --- |
| `/` | Vitrine de lotes. Busca e filtra lotes por tipo de carta (monstro, magia, armadilha, extra deck) e status (ao vivo, agendado, cancelado, encerrado). |
| `/sign-up` | Cria uma conta com nome, e-mail e senha. |
| `/sign-in` | Entra com e-mail e senha. |
| `/auction/[id]` | Sala do lote. Mostra as cartas do lote, o lance atual e o histórico de lances. Um lote ao vivo também mostra o formulário de lance. Ids desconhecidos retornam 404. Exemplo: `/auction/lot-blue-eyes-white-dragon`. |
| `/auction/[id]/audit` | Auditoria pública de um lote: cartas e lances, com os nomes dos licitantes censurados. Ids desconhecidos retornam 404. Exemplo: `/auction/lot-blue-eyes-white-dragon/audit`. |
| `/wallet` | Saldo e histórico de transações. |
| `/my-bids` | Lances do usuário autenticado. |
| `/auctioneer` | Painel do leiloeiro para gerenciar lotes e as cartas dentro deles. |

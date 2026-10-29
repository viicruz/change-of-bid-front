# Autenticação

Cadastro e login são rotas do Better Auth. O acesso é e-mail e senha.

O formulário envia `role`: `BIDDER` ou `AUCTIONEER`. A sessão é lida com esse campo, e é ele que a navbar e `/auctioneer` usam. O cliente trata como falha um usuário de cadastro sem `role`.

As páginas de rota do Notion ainda dizem que o cadastro ignora `role` e grava sempre `BIDDER`. Se a API estiver assim, o seletor não cria um leiloeiro, e uma rota exclusiva responde `403` com `NOT_AUCTIONEER`. O efeito prático está em [frontend.md](../frontend.md).

## Criar conta

`POST /api/auth/sign-up/email`

```json
{
  "name": "Nome",
  "email": "pessoa@example.com",
  "password": "senha",
  "role": "BIDDER"
}
```

`role` é `BIDDER` ou `AUCTIONEER`.

`200` devolve o usuário e um token de sessão. O mesmo token está no corpo, no header `set-auth-token` e no cookie `better-auth.session_token`. O cliente também lê `user.role`.

```json
{
  "token": "sessao-criada-no-cadastro",
  "user": {
    "id": "user-id",
    "name": "Nome",
    "email": "pessoa@example.com",
    "emailVerified": false,
    "image": null,
    "role": "BIDDER",
    "createdAt": "2026-10-26T19:00:00.000Z",
    "updatedAt": "2026-10-26T19:00:00.000Z"
  }
}
```

O schema do cliente exige `role` nesse usuário. Uma carteira é criada junto com a conta. Uma carteira nova está em `"0.00"` em todos os campos de saldo.

## Entrar

`POST /api/auth/sign-in/email`

```json
{
  "email": "pessoa@example.com",
  "password": "senha"
}
```

`200` devolve uma sessão nova. O token também sai em `set-auth-token` e em `better-auth.session_token`.

```json
{
  "redirect": false,
  "token": "sessao-criada-no-login",
  "user": {
    "id": "user-id",
    "name": "Nome",
    "email": "pessoa@example.com",
    "emailVerified": false,
    "image": null,
    "role": "BIDDER",
    "createdAt": "2026-10-26T19:00:00.000Z",
    "updatedAt": "2026-10-26T19:00:00.000Z"
  }
}
```

E-mail desconhecido ou senha errada é `401`. Nenhuma sessão é criada.

Guarde o token de `set-auth-token` (ou o cookie) e envie nas rotas privadas. Veja [conventions.md](./conventions.md).

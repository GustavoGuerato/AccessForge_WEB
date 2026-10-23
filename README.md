# AccessForge Web

Frontend do [AccessForge](https://github.com/GustavoGuerato/workspace_auth), uma API multi-tenant de autenticação e autorização. Construído com React, TypeScript e Vite.

> **Status:** em desenvolvimento. Hoje cobre login, restauração de sessão e listagem de workspaces. A interface ainda não tem refinamento visual.

## O que está implementado

- Tela de login integrada à API (`POST /auth/login`).
- Estado de autenticação centralizado com Context API (`AuthContext`).
- Restauração da sessão ao carregar a página: o refresh token vem em cookie `HttpOnly`, e o app chama `/auth/refresh` e `/auth/me` antes de decidir qual tela mostrar.
- Listagem dos workspaces do usuário autenticado (`GET /workspaces`).
- Logout (`POST /auth/logout`).
- Tratamento de `401` centralizado no `apiFetch`, que encerra a sessão local e volta para o login.

## Decisões

- **Access token só em memória.** Fica no estado do React e não é gravado em `localStorage`. O refresh token fica em cookie `HttpOnly`, fora do alcance do JavaScript.
- **Sem React Router por enquanto.** Com poucas telas, a navegação é feita por renderização condicional.
- **Autorização é da API.** Ter estado autenticado no frontend controla só o fluxo de telas. Quem valida token e permissões é o backend.

## Stack

React 19, TypeScript, Vite e ESLint.

## Como rodar

Pré-requisitos: Node.js e o backend [AccessForge](https://github.com/GustavoGuerato/workspace_auth) em execução.

```bash
npm install
```

Crie um arquivo `.env` na raiz com a URL do backend:

```
VITE_API_URL=<url-do-backend>
```

Depois:

```bash
npm run dev      # servidor de desenvolvimento
npm run build    # checagem de tipos e build de produção
npm run lint     # ESLint
```

O backend precisa aceitar a origem do frontend no CORS com credenciais, porque o app envia cookies (`credentials: "include"`).

## Limitações conhecidas

- O tratamento de `401` vale só para chamadas feitas com `apiFetch`. Chamadas diretas a `fetch` não passam por ele.
- Ainda não há renovação automática do access token com repetição da requisição original.
- Sem testes automatizados no frontend. Os testes feitos até agora foram manuais.
- Sem deploy.

## Autor

Gustavo Guerato, [LinkedIn](https://www.linkedin.com/in/gustavo-guerato-6b8403259/).

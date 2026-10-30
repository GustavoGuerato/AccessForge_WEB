# AccessForge Web

**Frontend do AccessForge**: cliente React que consome a API de autenticação, autorização e workspaces multi-tenant do repositório [`workspace_auth`](https://github.com/GustavoGuerato/workspace_auth).

`React 19` · `TypeScript` · `Vite` · `Context API` · `fetch`

O foco do projeto é o **comportamento correto de uma interface assíncrona** (sessão, estados de carregamento e erro, respostas inesperadas da API, requisições canceladas), não o visual. A interface é propositalmente simples.

> **Ainda sem deploy:** não há demonstração publicada. Para ver o app funcionando é preciso rodá-lo localmente junto com o backend (veja [Rodando localmente](#rodando-localmente)).

## Sumário

- [AccessForge Web](#accessforge-web)
  - [Sumário](#sumário)
  - [Status](#status)
  - [Funcionalidades](#funcionalidades)
  - [Rodando localmente](#rodando-localmente)
    - [Pré-requisitos](#pré-requisitos)
    - [Instalação](#instalação)
    - [Variáveis de ambiente](#variáveis-de-ambiente)
    - [Backend](#backend)
    - [Execução](#execução)
  - [Como funciona](#como-funciona)
    - [Restauração da sessão](#restauração-da-sessão)
    - [Chamadas autenticadas](#chamadas-autenticadas)
    - [Estados da tela de membros](#estados-da-tela-de-membros)
  - [API consumida](#api-consumida)
  - [Stack](#stack)
  - [Decisões técnicas](#decisões-técnicas)
  - [Segurança](#segurança)
  - [Scripts](#scripts)
  - [Estrutura do projeto](#estrutura-do-projeto)
  - [Limitações conhecidas](#limitações-conhecidas)
- [](#)

## Status

| Área                                                     | Implementado | Testado                      |
| -------------------------------------------------------- | ------------ | ---------------------------- |
| Login (e-mail e senha)                                   | Sim          | Manualmente                  |
| Restauração da sessão ao abrir o app (refresh + `/me`)   | Sim          | Manualmente                  |
| Logout com revogação do refresh token no servidor        | Sim          | Manualmente                  |
| Listagem dos workspaces do usuário                       | Sim          | Manualmente                  |
| Tela de membros do workspace                             | Sim          | Manualmente (ver limitações) |
| Tratamento global de `401` (`apiFetch`)                  | Sim          | Manualmente                  |
| Componente reutilizável `Field` (campo controlado, a11y) | Sim          | Manualmente                  |
| Formulário de convite de membros                         | Pendente     | —                            |
| Testes automatizados                                     | Não          | —                            |
| Roteamento por URL                                       | Não          | —                            |
| Deploy e integração contínua                             | Pendente     | —                            |

"Manualmente" significa verificado no navegador pelo autor; não há suíte automatizada neste repositório.

## Funcionalidades

- **Login** com validação mínima no cliente e mensagens de erro específicas (credenciais inválidas, API fora do ar, resposta inválida).
- **Sessão persistente sem `localStorage`:** ao abrir o app, ele pede um novo access token usando o cookie de refresh e busca o usuário em `/auth/me`.
- **Lista de workspaces** com o papel do usuário em cada um.
- **Membros do workspace:** nome e papel de cada membro, com estados de carregamento, vazio, erro e sucesso, e botão "Tentar novamente".
- **Logout** que chama a API para revogar o refresh token e encerra a sessão local mesmo se a API falhar (avisando o usuário).

## Rodando localmente

### Pré-requisitos

- Node.js compatível com as dependências (Vite 8 e ESLint 10 exigem versões recentes; confira o campo `engines` de cada pacote), npm e Git.
- O backend [`workspace_auth`](https://github.com/GustavoGuerato/workspace_auth) em execução, com o PostgreSQL migrado.

### Instalação

```bash
git clone https://github.com/GustavoGuerato/AccessForge_WEB.git
cd AccessForge_WEB
npm install
```

### Variáveis de ambiente

Crie `.env.local` na raiz (arquivo ignorado pelo Git, via `*.local`):

| Variável       | Obrigatória | Descrição                                                           |
| -------------- | ----------- | ------------------------------------------------------------------- |
| `VITE_API_URL` | Sim         | URL base da API, **sem barra final** (ex.: `http://localhost:3000`) |

Sem essa variável, as telas exibem "API URL não está definida".

### Backend

No `.env` do backend, `FRONTEND_ORIGIN` deve ser exatamente a origem do Vite (por padrão, `http://localhost:5173`); caso contrário o CORS bloqueia as chamadas com cookie. Confirme que há **uma única instância** do backend ouvindo na porta configurada: uma instância antiga ainda ativa pode responder no lugar da atual.

### Execução

```bash
npm run dev
```

Abra o endereço exibido pelo Vite. Para entrar, use um usuário cadastrado no backend (`POST /auth/register`).

## Como funciona

```text
main.tsx → AuthProvider → App
                           ├─ isLoading → "Verificando sessão..."
                           ├─ user + token → Workspaces → Members
                           └─ sem sessão → Login
```

A navegação é **condicional por estado React**, sem React Router: `App` escolhe entre `Login` e `Workspaces`, e `Workspaces` troca para `Members` quando há `selectedWorkspaceId`.

### Restauração da sessão

```mermaid
sequenceDiagram
    autonumber
    participant W as App (useEffect)
    participant A as API

    W->>A: POST /auth/refresh (credentials: include)
    alt Cookie de refresh válido
        A-->>W: { token }
        W->>A: GET /auth/me (Bearer token)
        A-->>W: { id, username, email }
        W->>W: login(user, token)
    else Qualquer falha
        W->>W: logout() e tela de login
    end
```

Cada resposta é tratada como `unknown` e validada por *type guards* (`isRefreshResponse`, `isUser`) antes de entrar no estado. O efeito usa `AbortController` e ignora o resultado se o componente foi desmontado.

O **access token fica só em memória** (estado do `AuthContext`); ao recarregar a página ele é refeito pelo passo acima. O refresh token vive em cookie `HttpOnly` gerenciado pelo backend e nunca é lido pelo JavaScript.

### Chamadas autenticadas

`src/api/apiFetch.ts` é um *wrapper* fino sobre `fetch`: acrescenta `Authorization: Bearer <token>` e, se a resposta for `401`, chama `logout()`. Ele devolve a `Response` original; cada tela decide como tratar os demais status.

### Estados da tela de membros

`Members.tsx` modela a requisição como **união discriminada**:

```ts
type MembersState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "empty" }
  | { status: "success"; members: Member[] };
```

Mapeamento de falhas: `401` → sessão expirada; `403` → sem permissão; `404` → workspace não encontrado; falha de rede (`TypeError`) → mensagem de backend inativo; resposta fora do formato esperado → "Resposta inválida do servidor". O botão "Tentar novamente" incrementa um contador (`attempt`) que reexecuta o efeito sem duplicar a lógica. O `AbortController` no *cleanup* evita que uma resposta antiga atualize o estado depois de o usuário trocar de tela.

## API consumida

O frontend depende destes endpoints do backend. O contrato completo está no repositório [`workspace_auth`](https://github.com/GustavoGuerato/workspace_auth).

| Método | Rota                               | Exige token | Uso no frontend                                                  |
| ------ | ---------------------------------- | ----------- | ---------------------------------------------------------------- |
| POST   | `/auth/login`                      | Não         | Entrar com e-mail e senha                                        |
| POST   | `/auth/refresh`                    | Cookie      | Obter novo access token ao abrir o app                           |
| GET    | `/auth/me`                         | Sim         | Buscar o usuário após o refresh                                  |
| POST   | `/auth/logout`                     | Cookie      | Revogar o refresh token no servidor                              |
| GET    | `/workspaces`                      | Sim         | Listar os workspaces do usuário e o papel em cada um             |
| GET    | `/workspaces/:workspaceId/members` | Sim         | Listar os membros de um workspace (`401`, `403`, `404` tratados) |

## Stack

| Tecnologia                 | Responsabilidade                                  |
| -------------------------- | ------------------------------------------------- |
| React 19                   | Interface e estado                                |
| TypeScript (~6.0)          | Tipagem estática (`tsc -b` faz parte do build)    |
| Vite 8                     | Servidor de desenvolvimento e build               |
| Context API                | Sessão (`user`, `token`, `isLoading`)             |
| `fetch` nativo             | Comunicação com a API                             |
| ESLint + typescript-eslint | Análise estática (`react-hooks`, `react-refresh`) |

Sem dependências de runtime além de `react` e `react-dom`.

## Decisões técnicas

| Decisão                                        | Alternativa                         | Motivo                                                        | Trade-off                                              |
| ---------------------------------------------- | ----------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------ |
| Access token só em memória                     | `localStorage`                      | Não fica exposto a leitura persistente por scripts            | Perde-se ao recarregar; exige refresh a cada abertura  |
| Restaurar sessão via cookie `HttpOnly` + `/me` | Guardar usuário no navegador        | O servidor continua sendo a fonte da verdade                  | Uma ida à API antes de renderizar a tela               |
| Respostas como `unknown` + *type guards*       | Cast direto (`as Tipo`)             | A API pode mudar ou falhar; o cliente não confia no formato   | Mais código de validação por tela                      |
| União discriminada para estados da requisição  | Vários `useState` booleanos         | Torna estados impossíveis irrepresentáveis                    | Mais verboso                                           |
| `AbortController` nos efeitos                  | Ignorar respostas antigas           | Cancela a requisição e evita `setState` obsoleto              | Exige checar `signal.aborted` em cada ponto assíncrono |
| Navegação por estado, sem React Router         | Roteador                            | Escopo mínimo na fase atual do roadmap                        | Sem URLs por tela; a seleção se perde ao recarregar    |
| `fetch` + `apiFetch` próprio                   | Axios, React Query                  | Sem dependência extra; comportamento explícito                | Sem cache, *retry* ou deduplicação automáticos         |
| Componente `Field` controlado e reutilizável   | Inputs repetidos em cada formulário | Um só lugar para `label`, `aria-invalid` e `aria-describedby` | Pai controla o valor e a mensagem de erro              |

## Segurança

| Risco                  | Mecanismo                                                                      | Observação                                                                         |
| ---------------------- | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| Roubo de token por XSS | Access token em memória; refresh em cookie `HttpOnly`                          | Um XSS ainda pode usar o token enquanto a página estiver aberta                    |
| Injeção de HTML (XSS)  | Dados da API renderizados como texto pelo React; sem `dangerouslySetInnerHTML` | Depende de manter essa prática                                                     |
| Respostas inesperadas  | *Type guards* antes de usar os dados                                           | Valida forma, não regras de negócio                                                |
| Autorização            | A **decisão é do backend** (`401`/`403`)                                       | O frontend só reage; esconder botões não é segurança                               |
| CORS e cookies         | `credentials: "include"` nas chamadas de sessão                                | O backend precisa permitir a origem do frontend (`FRONTEND_ORIGIN`)                |
| Variáveis `VITE_*`     | Só a URL pública da API                                                        | Tudo o que começa com `VITE_` vai para o bundle; **nunca** coloque segredos nelas |

## Scripts

| Script            | O que faz                                    |
| ----------------- | -------------------------------------------- |
| `npm run dev`     | Servidor de desenvolvimento com HMR          |
| `npm run build`   | Checagem de tipos (`tsc -b`) e build do Vite |
| `npm run lint`    | ESLint em todo o projeto                     |
| `npm run preview` | Serve o build de produção localmente         |

## Estrutura do projeto

```text
src/
├── api/
│   └── apiFetch.ts          # fetch com Bearer token e tratamento de 401
├── auth/
│   └── AuthContext.tsx      # estado e ações da sessão (login, logout, loading)
├── components/
│   └── Field/
│       └── Field.tsx        # campo controlado reutilizável (label, erro, a11y)
├── pages/
│   ├── Login/               # formulário de login
│   ├── Members/             # membros de um workspace
│   └── Workspaces/          # lista de workspaces e logout
├── App.tsx                  # restauração da sessão e escolha da tela
├── main.tsx                 # raiz: StrictMode + AuthProvider
└── index.css
```

## Limitações conhecidas

1. **Sem testes automatizados.** Cenários de troca rápida de workspace com atraso artificial e todas as respostas de erro de `Members` ainda precisam de confirmação individual (registrado no `DEVLOG.md`).
2. **A seleção do workspace não sobrevive ao recarregar** a página (sem roteamento por URL).
3. **Não há renovação automática do access token:** quando ele expira (1 hora, definido pelo backend), a próxima chamada recebe `401` e o usuário é deslogado. A sessão só é restaurada ao recarregar a página.
4. **`401` tratado em dois lugares:** `apiFetch` chama `logout()` e as telas também reagem ao status; a regra deveria ficar em um só ponto.
5. **A lista de workspaces só carrega ao clicar em "Carregar workspaces"**; não há carregamento automático.
6. **Tipo `User` duplicado** em `AuthContext.tsx` e `Login.tsx`; os *type guards* de formato estão repetidos entre telas.
7. **Acessibilidade parcial:** `Field` associa `label` e erro, e as mensagens usam `role="status"`/`role="alert"`, mas não houve auditoria (foco, leitor de tela, contraste).
8. **Interface sem estilo próprio** (apenas HTML semântico e o CSS do login).
9. **Formulário de convite de membros ainda não existe.**

#
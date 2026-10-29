# AccessForge Web

<<<<<<< HEAD
**Frontend do AccessForge**: cliente React que consome a API de autenticação, autorização e workspaces multi-tenant do repositório `workspace_auth`.

`React 19` · `TypeScript` · `Vite` · `Context API` · `fetch`

O foco do projeto é o **comportamento correto de uma interface assíncrona** (sessão, estados de carregamento e erro, respostas inesperadas da API, requisições canceladas), não o visual. A interface é propositalmente simples.

## Sumário

- [Status](#status)
- [Funcionalidades](#funcionalidades)
- [Como funciona](#como-funciona)
  - [Restauração da sessão](#restauração-da-sessão)
  - [Chamadas autenticadas](#chamadas-autenticadas)
  - [Estados da tela de membros](#estados-da-tela-de-membros)
- [Stack](#stack)
- [Decisões técnicas](#decisões-técnicas)
- [Segurança](#segurança)
- [Rodando localmente](#rodando-localmente)
- [Scripts](#scripts)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Limitações conhecidas](#limitações-conhecidas)
- [Roadmap](#roadmap)
- [Autor](#autor)

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
| Deploy                                                   | Pendente     | —                            |

"Manualmente" significa verificado no navegador pelo autor; não há suíte automatizada neste repositório.

## Funcionalidades

- **Login** com validação mínima no cliente e mensagens de erro específicas (credenciais inválidas, API fora do ar, resposta inválida).
- **Sessão persistente sem `localStorage`:** ao abrir o app, ele pede um novo access token usando o cookie de refresh e busca o usuário em `/auth/me`.
- **Lista de workspaces** com o papel do usuário em cada um.
- **Membros do workspace:** nome e papel de cada membro, com estados de carregamento, vazio, erro e sucesso, e botão "Tentar novamente".
- **Logout** que chama a API para revogar o refresh token e encerra a sessão local mesmo se a API falhar (avisando o usuário).

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
=======
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
>>>>>>> 1b66795a9d6a70001a1bc5faf588531ea3209339

    W->>A: POST /auth/refresh (credentials: include)
    alt Cookie de refresh válido
        A-->>W: { token }
        W->>A: GET /auth/me (Bearer token)
        A-->>W: { id, username, email }
        W->>W: login(user, token)
    else Qualquer falha
        W->>W: logout() → tela de login
    end
```
<<<<<<< HEAD

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

## Stack

| Tecnologia              | Responsabilidade                                |
| ----------------------- | ----------------------------------------------- |
| React 19                | Interface e estado                              |
| TypeScript (~6.0)       | Tipagem estática (`tsc -b` faz parte do build)  |
| Vite 8                  | Servidor de desenvolvimento e build             |
| Context API             | Sessão (`user`, `token`, `isLoading`)           |
| `fetch` nativo          | Comunicação com a API                           |
| ESLint + typescript-eslint | Análise estática (`react-hooks`, `react-refresh`) |

Sem dependências de runtime além de `react` e `react-dom`.

## Decisões técnicas

| Decisão                                          | Alternativa                         | Motivo                                                     | Trade-off                                                                    |
| ------------------------------------------------ | ----------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Access token só em memória                       | `localStorage`                      | Não fica exposto a leitura persistente por scripts         | Perde-se ao recarregar; exige refresh a cada abertura                        |
| Restaurar sessão via cookie `HttpOnly` + `/me`   | Guardar usuário no navegador        | O servidor continua sendo a fonte da verdade               | Uma ida à API antes de renderizar a tela                                     |
| Respostas como `unknown` + *type guards*         | Cast direto (`as Tipo`)             | A API pode mudar ou falhar; o cliente não confia no formato | Mais código de validação por tela                                            |
| União discriminada para estados da requisição    | Vários `useState` booleanos         | Torna estados impossíveis irrepresentáveis                 | Mais verboso                                                                 |
| `AbortController` nos efeitos                    | Ignorar respostas antigas           | Cancela a requisição e evita `setState` obsoleto           | Exige checar `signal.aborted` em cada ponto assíncrono                       |
| Navegação por estado, sem React Router           | Roteador                            | Escopo mínimo na fase atual do roadmap                     | Sem URLs por tela; a seleção se perde ao recarregar                          |
| `fetch` + `apiFetch` próprio                     | Axios, React Query                  | Sem dependência extra; comportamento explícito             | Sem cache, *retry* ou deduplicação automáticos                               |
| Componente `Field` controlado e reutilizável     | Inputs repetidos em cada formulário | Um só lugar para `label`, `aria-invalid` e `aria-describedby` | Pai controla o valor e a mensagem de erro                                    |

## Segurança

| Risco                      | Mecanismo                                                              | Observação                                                                         |
| -------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Roubo de token por XSS     | Access token em memória; refresh em cookie `HttpOnly`                  | Um XSS ainda pode usar o token enquanto a página estiver aberta                    |
| Injeção de HTML (XSS)      | Dados da API renderizados como texto pelo React; sem `dangerouslySetInnerHTML` | Depende de manter essa prática                                               |
| Respostas inesperadas      | *Type guards* antes de usar os dados                                   | Valida forma, não regras de negócio                                                |
| Autorização                | A **decisão é do backend** (`401`/`403`)                               | O frontend só reage; esconder botões não é segurança                               |
| CORS e cookies             | `credentials: "include"` nas chamadas de sessão                        | O backend precisa permitir a origem do frontend (`FRONTEND_ORIGIN`)                |
| Variáveis `VITE_*`         | Só a URL pública da API                                                | Tudo o que começa com `VITE_` vai para o bundle; **nunca** coloque segredos nelas |

## Rodando localmente

### Pré-requisitos

Node.js compatível com as dependências (Vite 8 e ESLint 10 exigem versões recentes; confira o campo `engines` de cada pacote), npm, Git e o backend [`workspace_auth`](../workspace_auth) em execução com PostgreSQL migrado.

### Instalação

```bash
git clone <URL_DO_REPOSITORIO>
cd accessforge-web
npm install
```

### Variáveis de ambiente

Crie `.env.local` na raiz (arquivo ignorado pelo Git, via `*.local`):

| Variável        | Obrigatória | Descrição                                                          |
| --------------- | ----------- | ------------------------------------------------------------------ |
| `VITE_API_URL`  | Sim         | URL base da API, **sem barra final** (ex.: `http://localhost:3000`) |

Sem essa variável, as telas exibem "API URL não está definida".

### Backend

No `.env` do backend, `FRONTEND_ORIGIN` deve ser exatamente a origem do Vite (por padrão, `http://localhost:5173`); caso contrário o CORS bloqueia as chamadas com cookie. Suba **uma única instância** do backend na porta configurada.

### Execução

```bash
npm run dev
```

Abra o endereço exibido pelo Vite. Para entrar, use um usuário cadastrado no backend (`POST /auth/register`).

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
│   ├── AuthContext.tsx      # estado e ações da sessão (login, logout, loading)
│   └── Protected.tsx        # arquivo vazio, ainda não usado
├── components/
│   └── Field/
│       ├── Field.tsx        # campo controlado reutilizável (label, erro, a11y)
│       └── FieldTest.tsx    # página de teste manual do Field, fora do fluxo
├── pages/
│   ├── Login/               # formulário de login
│   ├── Members/             # membros de um workspace
│   └── Worskpaces/          # lista de workspaces e logout
├── App.tsx                  # restauração da sessão e escolha da tela
├── main.tsx                 # raiz: StrictMode + AuthProvider
└── index.css
```

> A pasta `Worskpaces` está com o nome escrito errado; renomeá-la exige atualizar os imports.

## Limitações conhecidas

1. **Sem testes automatizados.** Cenários de troca rápida de workspace com atraso artificial e todas as respostas de erro de `Members` ainda precisam de confirmação individual (registrado no `DEVLOG.md`).
2. **A seleção do workspace não sobrevive ao recarregar** a página (sem roteamento por URL).
3. **Não há renovação automática do access token:** quando ele expira (1 hora, definido pelo backend), a próxima chamada recebe `401` e o usuário é deslogado. A sessão só é restaurada ao recarregar a página.
4. **`401` tratado em dois lugares:** `apiFetch` chama `logout()` e as telas também reagem ao status; a regra deveria ficar em um só ponto.
5. **A lista de workspaces só carrega ao clicar em "Carregar workspaces"**; não há carregamento automático.
6. **Tipo `User` duplicado** em `AuthContext.tsx` e `Login.tsx`; os *type guards* de formato estão repetidos entre telas.
7. **`Protected.tsx` vazio e `FieldTest.tsx` fora do fluxo** (arquivos de apoio que podem ser removidos ou concluídos).
8. **Acessibilidade parcial:** `Field` associa `label` e erro, e as mensagens usam `role="status"`/`role="alert"`, mas não houve auditoria (foco, leitor de tela, contraste).
9. **Interface sem estilo próprio** (apenas HTML semântico e o CSS do login).
10. O `index.html` ainda usa `lang="en"` e o título `accessforge-web`.
11. Formulário de convite de membros **ainda não existe**.

## Roadmap

- [ ] Formulário de convite de membros, com estados ocioso/enviando/sucesso/erro e atualização da lista.
- [ ] Centralizar o tratamento de `401` e a renovação do access token.
- [ ] Extrair tipos e *type guards* compartilhados.
- [ ] Testes automatizados dos fluxos principais.
- [ ] Roteamento (somente quando houver necessidade concreta).
- [ ] Deploy e integração contínua.

## Autor

**Gustavo Guerato dos Santos** · [LinkedIn](https://linkedin.com/in/gustavo-guerato-6b8403259)
=======
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
>>>>>>> 1b66795a9d6a70001a1bc5faf588531ea3209339

# DEVLOG — AccessForge Frontend

## 2026-10-16 — Dia 15 (S8) — Tela de login

### Objetivo

Implementar a primeira tela funcional do frontend do AccessForge usando React, TypeScript e Vite, integrada ao endpoint real de autenticação do backend.

### Implementações

- Criado o formulário de login com campos de e-mail e senha.
- Implementados inputs controlados com `useState`.
- Adicionada validação básica com os atributos HTML `required` e `type="email"`, além de verificação de campos vazios no envio.
- Implementado o envio de credenciais para `POST /auth/login` usando `fetch`.
- Configurados o cabeçalho `Content-Type: application/json` e o envio de credenciais com `credentials: "include"`.
- Implementado o estado de carregamento, desabilitando o botão durante a requisição.
- Adicionado tratamento de erros HTTP, incluindo mensagens específicas para credenciais inválidas (`401`).
- Adicionada verificação básica da estrutura da resposta da API.
- O JWT retornado pela API é mantido em memória no estado React.
- Os dados do usuário autenticado são exibidos após o login bem-sucedido.
- A senha é limpa após a autenticação bem-sucedida.
- Configurada a URL do backend por meio de `VITE_API_URL`, definida em `.env.local`.

### Integração com o backend

Endpoint utilizado: `POST http://localhost:3000/auth/login`.

Formato enviado:

- `email`
- `password`

Resposta esperada:

- `user`: dados do usuário autenticado.
- `token`: JWT de acesso.

O refresh token é gerenciado pelo backend por meio de cookie `HttpOnly`; sua configuração no navegador ainda precisa ser verificada.

### Testes realizados

- **Login com credenciais inválidas:** a interface exibiu uma mensagem de erro apropriada.
- **Registro de usuário de teste:** a API criou o usuário `gustavo_dev`, com e-mail `gustavo.dev@example.com`.
- **Login com credenciais válidas:** autenticação concluída com sucesso.
- **Exibição do usuário autenticado:** a interface apresentou o nome `gustavo_dev` e o e-mail correspondente.

### Decisões técnicas

- **Inputs controlados:** o React mantém os valores dos campos no estado do componente, permitindo controlar e processar o formulário.
- **JWT em memória:** nesta etapa, o token fica no estado React. Não há persistência em `localStorage` ou `sessionStorage`.
- **Refresh token em cookie `HttpOnly`:** o frontend solicita o envio de credenciais com `credentials: "include"`, sem precisar acessar diretamente o cookie.
- **Configuração por variável de ambiente:** a URL da API não fica fixa no código do componente.
- **Tratamento explícito de erros:** a interface diferencia falhas de autenticação de outros problemas de comunicação.

### Limitações conhecidas e pendências

- A autenticação ainda não está centralizada em um contexto ou mecanismo global.
- O JWT é perdido quando a página é recarregada.
- A restauração da sessão por meio do endpoint de refresh ainda não foi implementada no frontend.
- O acesso à rota protegida `/auth/me` ainda precisa ser validado pela interface.
- O envio e os atributos do cookie de refresh precisam ser confirmados nas ferramentas de desenvolvedor do navegador.
- A interface ainda é uma tela funcional básica, sem foco em estilização ou experiência visual refinada.
- A validação de formato e campos no frontend não substitui a validação e a autenticação no backend.

### Critério de conclusão

O formulário está integrado ao backend real e o login com credenciais válidas foi confirmado. A documentação do dia registra o estado atual do projeto; as verificações de sessão e cookie permanecem pendentes.

### Próximo passo

Conferir a resposta de `POST /auth/login` e o cookie de refresh na aba Network do navegador. Em seguida, validar o fluxo de autenticação com a rota protegida e continuar o roadmap do frontend.

## 2026-10-19 — Dia 16 (S8) — Listagem de workspaces

### Objetivo

Integrar a tela de login à listagem real de workspaces do usuário autenticado, consumindo o endpoint protegido do backend e apresentando os estados da requisição.

### Implementações

- Integrada a chamada `GET /workspaces` após o login bem-sucedido.
- Enviado o JWT de acesso no cabeçalho `Authorization: Bearer <token>`.
- Mantido o token de acesso em memória no estado React, sem persistência em `localStorage` ou `sessionStorage`.
- Definidos os tipos TypeScript para os dados de workspace: `id`, `name`, `slug` e `role`.
- Implementada validação em tempo de execução da estrutura da resposta recebida, utilizando `unknown` e uma função de verificação de tipo.
- Implementado estado de carregamento específico para a listagem de workspaces.
- Implementado tratamento de erros da requisição, incluindo respostas HTTP não bem-sucedidas e falhas de conexão.
- Implementado estado vazio para usuários autenticados sem workspaces associados.
- Implementada renderização da lista com o nome do workspace e o papel do usuário.
- Adicionado botão para tentar novamente quando a listagem falha.
- Separados os estados de erro do login e de erro da listagem de workspaces.

### Integração com o backend

Endpoint utilizado: `GET /workspaces`.

A requisição envia o token de acesso no cabeçalho `Authorization`. O backend identifica o usuário autenticado, consulta os memberships correspondentes e retorna os workspaces aos quais ele pertence.

A interface apresenta os dados recebidos, mas não determina quais workspaces o usuário está autorizado a acessar.

### Testes manuais realizados

- Confirmado o login com credenciais válidas utilizando um usuário de integração existente.
- Confirmada a apresentação dos dados do usuário autenticado na interface.
- Confirmado o estado vazio para um usuário sem memberships.
- Criado um membership de teste associando o usuário ao workspace `Workspace Teste` com o papel `owner`.
- Verificada a associação no PostgreSQL por meio de uma consulta com `JOIN` entre usuários, workspaces e roles.
- Confirmada a exibição de `Workspace Teste — Papel: owner` na interface após a associação.

### Decisões técnicas

- O token é enviado explicitamente na requisição protegida.
- Os dados da API são tratados como `unknown` antes da validação estrutural.
- Os estados de carregamento, erro, lista vazia e sucesso são diferenciados para evitar que uma falha seja apresentada como ausência de dados.
- A senha é limpa após o login bem-sucedido.
- O token continua armazenado somente em memória; a restauração da sessão após recarregar a página não faz parte desta implementação.

### Limitações e pendências

- A validação manual de token inválido ou expirado na interface ainda precisa ser confirmada.
- A restauração de sessão por meio de `POST /auth/refresh` ainda não está implementada no frontend.
- A autenticação ainda não está centralizada em um contexto global.
- A interface continua sendo uma implementação funcional básica, sem refinamento visual.
- Os testes automatizados do backend não substituem os testes manuais de interface.

### Estado do Dia 16

Confirmado o fluxo de login, a chamada autenticada de `GET /workspaces`, a renderização de um workspace real e a apresentação do estado vazio. O teste manual de erro de autenticação permanece pendente de confirmação.
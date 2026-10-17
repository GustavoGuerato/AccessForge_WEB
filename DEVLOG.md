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


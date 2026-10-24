**# DEVLOG — AccessForge Frontend**



**## 2026-10-16 — Dia 15 (S8) — Tela de login**



**### Objetivo**



Implementar a primeira tela funcional do frontend do AccessForge usando React, TypeScript e Vite, integrada ao endpoint real de autenticação do backend.



**### Implementações**



\- Criado o formulário de login com campos de e-mail e senha.

\- Implementados inputs controlados com \`useState\`.

\- Adicionada validação básica com os atributos HTML \`required\` e \`type="email"\`, além de verificação de campos vazios no envio.

\- Implementado o envio de credenciais para \`POST /auth/login\` usando \`fetch\`.

\- Configurados o cabeçalho \`Content-Type: application/json\` e o envio de credenciais com \`credentials: "include"\`.

\- Implementado o estado de carregamento, desabilitando o botão durante a requisição.

\- Adicionado tratamento de erros HTTP, incluindo mensagens específicas para credenciais inválidas (\`401\`).

\- Adicionada verificação básica da estrutura da resposta da API.

\- O JWT retornado pela API é mantido em memória no estado React.

\- Os dados do usuário autenticado são exibidos após o login bem-sucedido.

\- A senha é limpa após a autenticação bem-sucedida.

\- Configurada a URL do backend por meio de \`VITE_API_URL\`, definida em \`.env.local\`.



**### Integração com o backend**



Endpoint utilizado: \`POST http\://localhost:3000/auth/login\`.



Formato enviado:



\- \`email\`

\- \`password\`



Resposta esperada:



\- \`user\`: dados do usuário autenticado.

\- \`token\`: JWT de acesso.



O refresh token é gerenciado pelo backend por meio de cookie \`HttpOnly\`; sua configuração no navegador ainda precisa ser verificada.



**### Testes realizados**



\- **\*\*Login com credenciais inválidas:\*\*** a interface exibiu uma mensagem de erro apropriada.

\- **\*\*Registro de usuário de teste:\*\*** a API criou o usuário \`gustavo_dev\`, com e-mail \`gustavo.dev\@example.com\`.

\- **\*\*Login com credenciais válidas:\*\*** autenticação concluída com sucesso.

\- **\*\*Exibição do usuário autenticado:\*\*** a interface apresentou o nome \`gustavo_dev\` e o e-mail correspondente.



**### Decisões técnicas**



\- **\*\*Inputs controlados:\*\*** o React mantém os valores dos campos no estado do componente, permitindo controlar e processar o formulário.

\- **\*\*JWT em memória:\*\*** nesta etapa, o token fica no estado React. Não há persistência em \`localStorage\` ou \`sessionStorage\`.

\- **\*\*Refresh token em cookie \`HttpOnly\`:\*\*** o frontend solicita o envio de credenciais com \`credentials: "include"\`, sem precisar acessar diretamente o cookie.

\- **\*\*Configuração por variável de ambiente:\*\*** a URL da API não fica fixa no código do componente.

\- **\*\*Tratamento explícito de erros:\*\*** a interface diferencia falhas de autenticação de outros problemas de comunicação.



**### Limitações conhecidas e pendências**



\- A autenticação ainda não está centralizada em um contexto ou mecanismo global.

\- O JWT é perdido quando a página é recarregada.

\- A restauração da sessão por meio do endpoint de refresh ainda não foi implementada no frontend.

\- O acesso à rota protegida \`/auth/me\` ainda precisa ser validado pela interface.

\- O envio e os atributos do cookie de refresh precisam ser confirmados nas ferramentas de desenvolvedor do navegador.

\- A interface ainda é uma tela funcional básica, sem foco em estilização ou experiência visual refinada.

\- A validação de formato e campos no frontend não substitui a validação e a autenticação no backend.



**### Critério de conclusão**



O formulário está integrado ao backend real e o login com credenciais válidas foi confirmado. A documentação do dia registra o estado atual do projeto; as verificações de sessão e cookie permanecem pendentes.



**### Próximo passo**



Conferir a resposta de \`POST /auth/login\` e o cookie de refresh na aba Network do navegador. Em seguida, validar o fluxo de autenticação com a rota protegida e continuar o roadmap do frontend.



**---**



**## 2026-10-19 — Dia 16 (S8) — Listagem de workspaces**



**### Objetivo**



Integrar a tela de login à listagem real de workspaces do usuário autenticado, consumindo o endpoint protegido do backend e apresentando os estados da requisição.



**### Implementações**



\- Integrada a chamada \`GET /workspaces\` após o login bem-sucedido.

\- Enviado o JWT de acesso no cabeçalho \`Authorization: Bearer \<token>\`.

\- Mantido o token de acesso em memória no estado React, sem persistência em \`localStorage\` ou \`sessionStorage\`.

\- Definidos os tipos TypeScript para os dados de workspace: \`id\`, \`name\`, \`slug\` e \`role\`.

\- Implementada validação em tempo de execução da estrutura da resposta recebida, utilizando \`unknown\` e uma função de verificação de tipo.

\- Implementado estado de carregamento específico para a listagem de workspaces.

\- Implementado tratamento de erros da requisição, incluindo respostas HTTP não bem-sucedidas e falhas de conexão.

\- Implementado estado vazio para usuários autenticados sem workspaces associados.

\- Implementada renderização da lista com o nome do workspace e o papel do usuário.

\- Adicionado botão para tentar novamente quando a listagem falha.

\- Separados os estados de erro do login e de erro da listagem de workspaces.



**### Integração com o backend**



Endpoint utilizado: \`GET /workspaces\`.



A requisição envia o token de acesso no cabeçalho \`Authorization\`. O backend identifica o usuário autenticado, consulta os memberships correspondentes e retorna os workspaces aos quais ele pertence.



A interface apresenta os dados recebidos, mas não determina quais workspaces o usuário está autorizado a acessar.



**### Testes manuais realizados**



\- Confirmado o login com credenciais válidas utilizando um usuário de integração existente.

\- Confirmada a apresentação dos dados do usuário autenticado na interface.

\- Confirmado o estado vazio para um usuário sem memberships.

\- Criado um membership de teste associando o usuário ao workspace \`Workspace Teste\` com o papel \`owner\`.

\- Verificada a associação no PostgreSQL por meio de uma consulta com \`JOIN\` entre usuários, workspaces e roles.

\- Confirmada a exibição de \`Workspace Teste — Papel: owner\` na interface após a associação.



**### Decisões técnicas**



\- O token é enviado explicitamente na requisição protegida.

\- Os dados da API são tratados como \`unknown\` antes da validação estrutural.

\- Os estados de carregamento, erro, lista vazia e sucesso são diferenciados para evitar que uma falha seja apresentada como ausência de dados.

\- A senha é limpa após o login bem-sucedido.

\- O token continua armazenado somente em memória; a restauração da sessão após recarregar a página não faz parte desta implementação.



**### Limitações e pendências**



\- A validação manual de token inválido ou expirado na interface ainda precisa ser confirmada.

\- A restauração de sessão por meio de \`POST /auth/refresh\` ainda não está implementada no frontend.

\- A autenticação ainda não está centralizada em um contexto global.

\- A interface continua sendo uma implementação funcional básica, sem refinamento visual.

\- Os testes automatizados do backend não substituem os testes manuais de interface.



**### Estado do Dia 16**



Confirmado o fluxo de login, a chamada autenticada de \`GET /workspaces\`, a renderização de um workspace real e a apresentação do estado vazio. O teste manual de erro de autenticação permanece pendente de confirmação.



**---**



**## 2026-10-21 — Dia 17 (S8) — Restauração de sessão e tratamento centralizado de 401**



**### Objetivo**



Centralizar o estado de autenticação no frontend, restaurar a sessão após o recarregamento da página e encerrar o estado local de autenticação quando uma requisição protegida receber uma resposta HTTP \`401 Unauthorized\`.



**### Implementações**



\- Consolidado o gerenciamento do estado de autenticação no \`AuthContext\`.

\- Centralizados no contexto os dados do usuário autenticado, o access token, o estado de carregamento e as funções de login e logout.

\- Mantido o \`AuthProvider\` envolvendo a aplicação no ponto de entrada do React.

\- Implementada a verificação inicial da sessão no \`App.tsx\`.

\- Implementado o estado de carregamento inicial para impedir que a tela de login ou a área autenticada seja exibida antes da conclusão da verificação da sessão.

\- Integrado o endpoint \`POST /auth/refresh\` para solicitar um novo access token usando o cookie de refresh token enviado pelo navegador.

\- Integrado o endpoint \`GET /auth/me\` para recuperar os dados do usuário após a renovação do token.

\- Adicionadas verificações em tempo de execução para validar a estrutura da resposta de refresh e os dados do usuário.

\- Implementada a renderização condicional no \`App.tsx\`: durante a verificação, a aplicação exibe o estado de carregamento; após a verificação, apresenta a tela de workspaces quando existe um usuário autenticado com token ou a tela de login quando não existe autenticação válida.

\- Corrigida a consulta do backend utilizada por \`/auth/me\`, substituindo a referência à coluna inexistente \`username\` pela coluna \`name\`, com o alias \`username\`, compatível com o formato esperado pelo frontend.

\- Criado o módulo compartilhado \`src/api/apiFetch.ts\` para realizar requisições autenticadas com o access token.

\- Implementada no \`apiFetch\` a detecção de respostas HTTP \`401\`, acionando \`logout()\` para limpar o estado local de autenticação.

\- Integrado o \`apiFetch\` à requisição autenticada \`GET /workspaces\`, evitando manter nesse componente uma implementação duplicada do tratamento de \`401\`.



**### Integração com o backend**



Endpoints envolvidos:



\- \`POST /auth/login\`: autentica o usuário e fornece o access token.

\- \`POST /auth/refresh\`: utiliza o cookie de refresh token para solicitar um novo access token.

\- \`GET /auth/me\`: recupera os dados do usuário autenticado.

\- \`POST /auth/logout\`: encerra a sessão de refresh token no backend.

\- \`GET /workspaces\`: retorna os workspaces associados ao usuário autenticado.



A restauração da sessão depende do cookie de refresh token gerenciado pelo backend. O access token permanece em memória no frontend.



O \`apiFetch\` detecta respostas \`401\` nas requisições que passam por ele e aciona o logout local. Essa implementação não renova automaticamente o token e não repete a requisição que recebeu \`401\`.



**### Testes manuais realizados**



\- Confirmado o login com credenciais válidas.

\- Confirmada a restauração da sessão após recarregar a página com \`F5\`.

\- Confirmada a recuperação dos dados do usuário por meio de \`/auth/me\` após a correção da consulta SQL no backend.

\- Confirmada a exibição da área de workspaces quando a sessão é restaurada com sucesso.

\- Confirmado o retorno à tela de login após executar o logout.

\- Confirmada a resposta HTTP \`200\` de \`GET /workspaces\` com um access token válido.

\- Simulada uma requisição com token inválido e confirmada a resposta HTTP \`401\` do backend.

\- Confirmado que a resposta \`401\`, ao passar pelo \`apiFetch\`, aciona o logout local e faz a interface retornar à tela de login.

\- Confirmado que a implementação compilou sem erros de TypeScript durante a verificação realizada.



**### Decisões técnicas**



\- **\*\*Estado de autenticação centralizado:\*\*** o \`AuthContext\` mantém o estado compartilhado entre os componentes, evitando que cada tela gerencie isoladamente usuário e token.

\- **\*\*Access token em memória:\*\*** o token de acesso continua no estado React, sem persistência em \`localStorage\` ou \`sessionStorage\`.

\- **\*\*Refresh token em cookie \`HttpOnly\`:\*\*** o navegador envia o cookie conforme a configuração da requisição, sem expor seu conteúdo ao JavaScript do frontend.

\- **\*\*Restauração explícita da sessão:\*\*** a aplicação verifica a sessão durante a inicialização antes de decidir qual tela apresentar.

\- **\*\*Renderização condicional:\*\*** mantida a decisão de não introduzir React Router nesta etapa, considerando a quantidade atual de telas.

\- **\*\*Tratamento compartilhado de \`401\`:\*\*** o \`apiFetch\` concentra essa responsabilidade para as requisições que o utilizam.

\- **\*\*Separação entre autenticação e autorização:\*\*** a interface controla o fluxo de navegação, mas a autorização continua sendo responsabilidade do backend. A existência de estado autenticado no frontend não substitui a validação do token e das permissões na API.



**### Limitações e pendências**



\- O tratamento centralizado de \`401\` aplica-se somente às requisições que utilizam \`apiFetch\`. Chamadas diretas a \`fetch\` não recebem esse tratamento automaticamente.

\- Ainda não foi implementada a renovação automática do access token seguida da repetição da requisição original.

\- O teste com token inválido foi realizado manualmente. A expiração real do access token não foi comprovada por esse teste.

\- O comportamento de notificações ao usuário após o encerramento da sessão pode ser aprimorado em uma etapa posterior.

\- A interface continua funcional, mas sem refinamento visual significativo.

\- Os testes descritos neste registro são manuais; não devem ser interpretados como novos testes automatizados.



**### Estado do Dia 17**



A centralização do estado de autenticação, a restauração da sessão após o recarregamento da página e o tratamento de respostas \`401\` nas requisições que utilizam \`apiFetch\` foram implementados e verificados manualmente.



O frontend consegue recuperar a sessão por meio do refresh token, buscar os dados do usuário e apresentar a área autenticada. Quando uma requisição que utiliza \`apiFetch\` recebe \`401\`, o estado local de autenticação é encerrado e a interface retorna à tela de login.



A centralização do tratamento de erros depende do uso consistente de \`apiFetch\` nas futuras requisições autenticadas.



**### Próximo passo**



\- Restaurar o uso da variável \`token\` no \`Workspaces.tsx\`, caso o valor de teste \`"token-invalido"\` ainda esteja no código.

\- Revisar as alterações do frontend com \`git diff\`.

\- Atualizar o DEVLOG no repositório.

\- Registrar o commit do Dia 17 após confirmar que os arquivos estão corretos.

\- Avançar para o próximo item do roadmap depois de revisar o estado final do projeto.


**---**

**## 2026-10-24 — Dia 18 (S8) — Componente reutilizável de formulário com estados de erro**



**### Objetivo**



Refatorar o formulário de login do frontend do AccessForge para extrair um componente reutilizável de campo, separar erros específicos de campos dos erros gerais de submissão e preservar o comportamento existente da autenticação.



**### Implementações**



\- Identificada a estrutura repetível dos campos do formulário de login: label, input controlado e mensagem de erro.

\- Criado o componente reutilizável `Field` para renderizar campos de formulário.

\- Definido o contrato do componente por meio de props, incluindo `label`, `name`, `value`, `onChange`, `type`, `autoComplete`, `required` e `error`.

\- Implementada a geração de IDs únicos com `useId`.

\- Associados os elementos `label` aos respectivos inputs por meio de `htmlFor` e `id`.

\- Implementado o controle do valor dos inputs por meio de props, mantendo o estado dos campos no componente pai.

\- Implementados os atributos `aria-invalid` e `aria-describedby` para associar erros específicos aos respectivos campos.

\- Refatorados os campos de e-mail e senha da tela de login para utilizar o componente `Field`.

\- Mantida a lógica de autenticação no componente de login, sem transferir responsabilidades de API ou regras de negócio para `Field`.

\- Separados os estados de erro de campo (`errosCampo`) e de erro geral da submissão (`erro`).



**### Decisões técnicas**



\- **\*\*Responsabilidade única:\*\*** o componente `Field` cuida da apresentação do campo e de seu erro específico, sem conhecer autenticação, tokens ou requisições à API.

\- **\*\*Componente controlado:\*\*** o valor e a alteração do campo são controlados pelo componente pai por meio de `value` e `onChange`.

\- **\*\*IDs únicos:\*\*** o uso de `useId` evita depender de IDs fixos e permite associar corretamente labels e mensagens de erro.

\- **\*\*Acessibilidade:\*\*** `aria-invalid` indica o estado de validação do campo, enquanto `aria-describedby` referencia a mensagem de erro quando ela existe.

\- **\*\*Separação de erros:\*\*** erros específicos pertencem ao campo correspondente; erros como credenciais inválidas e falhas de conexão permanecem no nível do formulário.

\- **\*\*Preservação da autenticação:\*\*** a extração do componente não deve alterar o endpoint utilizado, o formato da requisição, o gerenciamento do token ou o fluxo de login.



**### Testes manuais realizados**



\- Verificada a associação entre labels e inputs por meio dos IDs gerados por `useId`.

\- Verificada a geração de IDs distintos para os campos de e-mail e senha.

\- Verificada a presença de `aria-invalid` e da referência `aria-describedby` quando o campo apresenta uma mensagem de erro.

\- Verificado que o campo sem erro não recebe uma referência `aria-describedby` desnecessária.

\- Verificada a renderização do componente `Field` em um teste temporário.

\- **\*\*Testes de regressão do login:\*\*** pendentes de confirmação: login válido, envio com Enter, campos vazios, formato do e-mail, credenciais inválidas e comportamento com o backend indisponível.



**### Limitações e pendências**



\- Confirmar que o `App.tsx` voltou a utilizar o fluxo normal da aplicação, caso ainda esteja configurado para o teste temporário.

\- Remover o arquivo temporário `FieldTest.tsx`, caso ainda exista.

\- Confirmar que o formulário de login preserva o comportamento anterior após a refatoração.

\- Preencher os resultados dos testes de regressão após executá-los.

\- Atualizar o registro do dia no repositório e revisar as alterações antes do commit.



**### Estado do Dia 18**



O componente reutilizável `Field` foi implementado e integrado aos campos de e-mail e senha da tela de login. O contrato por props, a geração de IDs únicos e a associação das mensagens de erro foram verificados manualmente.



A conclusão do dia depende da confirmação dos testes de regressão, da remoção de eventuais arquivos temporários e da revisão final das alterações.



**### Próximo passo**



\- Restaurar o fluxo normal da aplicação e remover arquivos temporários de teste, caso necessário.

\- Executar os testes de regressão do formulário de login.

\- Revisar as alterações com `git diff` e verificar o estado do repositório.

\- Registrar o commit da refatoração após confirmar que os arquivos estão corretos.

\- Avançar para o próximo item do roadmap após concluir as verificações.

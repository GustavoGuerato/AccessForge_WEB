
import { useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "../../auth/AuthContext";

type User = {
  id: string;
  username: string;
  email: string;
};

type LoginResponse = {
  user: User;
  token: string;
};

type ApiErrorResponse = {
  error?: string;
  message?: string;
};

type Workspace = {
  id: string;
  name: string;
  slug: string;
  role: string;
};

function isWorkspaceArray(value: unknown): value is Workspace[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item: unknown) =>
        typeof item === "object" &&
        item !== null &&
        "id" in item &&
        typeof item.id === "string" &&
        "name" in item &&
        typeof item.name === "string" &&
        "slug" in item &&
        typeof item.slug === "string" &&
        "role" in item &&
        typeof item.role === "string",
    )
  );
}

function Login() {
  const { user, token, login } = useAuth();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [workspacesLoading, setWorkspacesLoading] = useState(false);
  const [workspacesErro, setWorkspacesErro] = useState("");

  async function carregarWorkspaces(accessToken: string) {
    setWorkspacesLoading(true);
    setWorkspacesErro("");

    try {
      const apiUrl = import.meta.env.VITE_API_URL;

      if (!apiUrl) {
        throw new Error("API URL não está definida.");
      }

      const response = await fetch(`${apiUrl}/workspaces`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const body: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        const apiError = body as ApiErrorResponse | null;

        throw new Error(
          apiError?.error ??
          apiError?.message ??
          `Não foi possível carregar os workspaces. HTTP ${response.status}.`,
        );
      }

      if (!isWorkspaceArray(body)) {
        throw new Error(
          "A API retornou uma resposta inválida para os workspaces.",
        );
      }

      setWorkspaces(body);
    } catch (error: unknown) {
      setWorkspacesErro(
        error instanceof TypeError
          ? "Não foi possível conectar à API. Verifique se o backend está ativo."
          : error instanceof Error
            ? error.message
            : "Ocorreu um erro inesperado.",
      );
    } finally {
      setWorkspacesLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");

    if (email.trim() === "" || senha === "") {
      setErro("Por favor, preencha todos os campos.");
      return;
    }

    setLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL;

      if (!apiUrl) {
        throw new Error("API URL não está definida.");
      }

      const response = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: email.trim(),
          password: senha,
        }),
      });

      const body: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        const apiError = body as ApiErrorResponse | null;

        if (response.status === 401) {
          throw new Error(
            "Credenciais inválidas. Verifique seu e-mail e senha.",
          );
        }

        throw new Error(
          apiError?.error ??
          apiError?.message ??
          `Não foi possível entrar. Erro HTTP ${response.status}.`,
        );
      }

      if (
        !body ||
        typeof body !== "object" ||
        !("user" in body) ||
        !("token" in body)
      ) {
        throw new Error("Resposta da API inválida.");
      }

      const data = body as LoginResponse;

      if (
        typeof data.token !== "string" ||
        data.token.length === 0 ||
        typeof data.user !== "object" ||
        data.user === null ||
        typeof data.user.id !== "string" ||
        typeof data.user.username !== "string" ||
        typeof data.user.email !== "string"
      ) {
        throw new Error("Os dados de autenticação recebidos são inválidos.");
      }

      login(data.user, data.token);
      setSenha("");

      await carregarWorkspaces(data.token);
    } catch (error: unknown) {
      setErro(
        error instanceof TypeError
          ? "Não foi possível conectar à API. Verifique se o backend está ativo."
          : error instanceof Error
            ? error.message
            : "Ocorreu um erro inesperado.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (user && token) {
    return (
      <main>
        <h1>Bem-vindo ao AccessForge</h1>
        <p>Login realizado com sucesso, {user.username}.</p>
        <p>Usuário autenticado: {user.email}</p>

        <h2>Meus workspaces</h2>

        {workspacesLoading && (
          <p role="status">Carregando workspaces...</p>
        )}

        {workspacesErro && (
          <div>
            <p role="alert">{workspacesErro}</p>

            <button
              type="button"
              disabled={workspacesLoading}
              onClick={() => void carregarWorkspaces(token)}
            >
              Tentar novamente
            </button>
          </div>
        )}

        {!workspacesLoading &&
          !workspacesErro &&
          workspaces.length === 0 && (
            <p>Você ainda não pertence a nenhum workspace.</p>
          )}

        {!workspacesLoading &&
          !workspacesErro &&
          workspaces.length > 0 && (
            <ul>
              {workspaces.map((workspace) => (
                <li key={workspace.id}>
                  <strong>{workspace.name}</strong>
                  <span> — Papel: {workspace.role}</span>
                </li>
              ))}
            </ul>
          )}
      </main>
    );
  }

  return (
    <main>
      <h1>Entrar no AccessForge</h1>

      <form onSubmit={handleSubmit}>
        <label htmlFor="email">E-mail</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <label htmlFor="senha">Senha</label>
        <input
          id="senha"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={senha}
          onChange={(event) => setSenha(event.target.value)}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>

      {erro && <p role="alert">{erro}</p>}
    </main>
  );
}

export default Login;

import { useState } from "react";
import { useAuth } from "../../auth/AuthContext";

type Workspace = {
  id: string;
  name: string;
  slug: string;
  role: string;
};

type ApiErrorResponse = {
  error?: string;
  message?: string;
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

function Workspaces() {
  const { user, token, logout } = useAuth();

  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  async function carregarWorkspaces() {
    setLoading(true);
    setError("");

    try {
      if (!token) {
        throw new Error("Você precisa estar autenticado para continuar.");
      }

      const apiUrl = import.meta.env.VITE_API_URL;

      if (!apiUrl) {
        throw new Error("A URL da API não está configurada.");
      }

      const response = await fetch(`${apiUrl}/workspaces`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const body: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        const apiError = body as ApiErrorResponse | null;

        if (response.status === 401) {
          throw new Error(
            "Sua sessão expirou ou não é mais válida. Faça login novamente.",
          );
        }

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
    } catch (err: unknown) {
      setError(
        err instanceof TypeError
          ? "Não foi possível conectar à API. Verifique se o backend está ativo."
          : err instanceof Error
            ? err.message
            : "Ocorreu um erro inesperado ao carregar os workspaces.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);
    setError("");

    try {
      const apiUrl = import.meta.env.VITE_API_URL;

      if (!apiUrl) {
        throw new Error("A URL da API não está configurada.");
      }

      const response = await fetch(`${apiUrl}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(
          `O backend não confirmou o logout. HTTP ${response.status}.`,
        );
      }
    } catch (err: unknown) {
      setError(
        err instanceof TypeError
          ? "Não foi possível conectar à API. A sessão local será encerrada, mas o servidor pode não ter revogado o refresh token."
          : err instanceof Error
            ? `${err.message} A sessão local será encerrada, mas confirme a revogação no servidor.`
            : "Erro inesperado. A sessão local será encerrada, mas a revogação no servidor não foi confirmada.",
      );
    } finally {
      logout();
      setLoggingOut(false);
    }
  }

  return (
    <main>
      <h1>Bem-vindo ao AccessForge</h1>

      {user && (
        <>
          <p>Usuário autenticado: {user.email}</p>
          <p>Login realizado com sucesso, {user.username}!</p>
        </>
      )}

      <button
        type="button"
        onClick={() => void handleLogout()}
        disabled={loggingOut}
      >
        {loggingOut ? "Saindo..." : "Sair"}
      </button>

      <h2>Meus workspaces</h2>

      {!loading && (
        <button
          type="button"
          onClick={() => void carregarWorkspaces()}
          disabled={!token || loggingOut}
        >
          Carregar workspaces
        </button>
      )}

      {loading && <p role="status">Carregando workspaces...</p>}

      {error && <p role="alert">{error}</p>}

      {!loading && !error && workspaces.length === 0 && (
        <p>
          Você ainda não pertence a nenhum workspace, ou ainda não carregou a
          lista.
        </p>
      )}

      {!loading && workspaces.length > 0 && (
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

export default Workspaces;

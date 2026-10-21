import { useEffect } from "react";
import { useAuth, type User } from "./auth/AuthContext";
import Login from "./pages/Login/Login";
import Workspaces from "./pages/Worskpaces/Workspaces";

type RefreshResponse = {
  token: string;
};

function isUser(value: unknown): value is User {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  return (
    "id" in value &&
    typeof value.id === "string" &&
    "username" in value &&
    typeof value.username === "string" &&
    "email" in value &&
    typeof value.email === "string"
  );
}

function isRefreshResponse(value: unknown): value is RefreshResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    "token" in value &&
    typeof value.token === "string"
  );
}

function App() {
  const { user, token, login, logout, isLoading, updateLoading } = useAuth();

  useEffect(() => {
    const controller = new AbortController();

    async function restoreSession() {
      try {
        const apiUrl = import.meta.env.VITE_API_URL;

        if (!apiUrl) {
          throw new Error("API URL não está definida.");
        }

        const refreshResponse = await fetch(`${apiUrl}/auth/refresh`, {
          method: "POST",
          credentials: "include",
          signal: controller.signal,
        });

        if (!refreshResponse.ok) {
          throw new Error("Falha ao atualizar o token.");
        }

        const refreshBody: unknown = await refreshResponse
          .json()
          .catch(() => null);

        if (!isRefreshResponse(refreshBody)) {
          throw new Error("Resposta de atualização inválida.");
        }

        const meResponse = await fetch(`${apiUrl}/auth/me`, {
          headers: {
            Authorization: `Bearer ${refreshBody.token}`,
          },
          signal: controller.signal,
        });

        if (!meResponse.ok) {
          throw new Error("Falha ao obter informações do usuário.");
        }

        const meBody: unknown = await meResponse.json().catch(() => null);

        if (!isUser(meBody)) {
          throw new Error("Resposta do usuário inválida.");
        }

        login(meBody, refreshBody.token);
      } catch {
        if (!controller.signal.aborted) {
          logout();
        }
      } finally {
        if (!controller.signal.aborted) {
          updateLoading(false);
        }
      }
    }

    void restoreSession();

    return () => {
      controller.abort();
    };
  }, [login, logout, updateLoading]);

  if (isLoading) {
    return <p role="status">Verificando sessão...</p>;
  }

  if (user && token) {
    return <Workspaces />;
  }

  return <Login />;
}

export default App;

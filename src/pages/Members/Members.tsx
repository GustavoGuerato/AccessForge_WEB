import { useEffect, useState } from "react";
import { apiFetch } from "../../api/apiFetch";

type Member = {
  id: string;
  name: string;
  role: string;
};

type MembersProps = {
  workspaceId: string;
  token: string;
  logout: () => void;
  onBack: () => void;
};

type MembersState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "empty" }
  | { status: "success"; members: Member[] };

function isMemberArray(value: unknown): value is Member[] {
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
        "role" in item &&
        typeof item.role === "string",
    )
  );
}

function Members({ workspaceId, token, logout, onBack }: MembersProps) {
  const [state, setState] = useState<MembersState>({
    status: "loading",
  });

  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function carregarMembros() {
      setState({ status: "loading" });

      if (!workspaceId.trim()) {
        setState({
          status: "error",
          message: "ID do workspace inválido.",
        });
        return;
      }

      try {
        const apiURL = import.meta.env.VITE_API_URL;

        if (!apiURL) {
          throw new Error("API URL não está definida.");
        }

        const response = await apiFetch(
          `${apiURL}/workspaces/${workspaceId}/members`,
          {
            token,
            logout,
            signal: controller.signal,
          },
        );

        if (controller.signal.aborted) {
          return;
        }

        if (!response.ok) {
          if (response.status === 401) {
            setState({
              status: "error",
              message: "Sua sessão expirou. Faça login novamente.",
            });
            return;
          }

          if (response.status === 403) {
            setState({
              status: "error",
              message: "Você não tem permissão para acessar estes membros.",
            });
            return;
          }

          if (response.status === 404) {
            setState({
              status: "error",
              message: "Workspace não foi encontrado.",
            });
            return;
          }

          setState({
            status: "error",
            message: "Não foi possível carregar os membros.",
          });
          return;
        }

        const data: unknown = await response.json();

        if (controller.signal.aborted) {
          return;
        }

        if (!isMemberArray(data)) {
          setState({
            status: "error",
            message: "Resposta inválida do servidor.",
          });
          return;
        }

        if (data.length === 0) {
          setState({ status: "empty" });
          return;
        }

        setState({
          status: "success",
          members: data,
        });
      } catch (error: unknown) {
        if (controller.signal.aborted) {
          return;
        }

        setState({
          status: "error",
          message:
            error instanceof TypeError
              ? "Não foi possível conectar à API. Verifique se o backend está ativo."
              : error instanceof Error
                ? error.message
                : "Ocorreu um erro inesperado ao carregar os membros.",
        });
      }
    }

    void carregarMembros();

    return () => {
      controller.abort();
    };
  }, [workspaceId, token, logout, attempt]);

  function tentarNovamente() {
    setAttempt((previous) => previous + 1);
  }

  return (
    <main>
      <button type="button" onClick={onBack}>
        Voltar aos workspaces
      </button>

      <h1>Membros do workspace</h1>

      {state.status === "loading" && <p role="status">Carregando membros...</p>}

      {state.status === "error" && (
        <section>
          <p role="alert">{state.message}</p>

          <button type="button" onClick={tentarNovamente}>
            Tentar novamente
          </button>
        </section>
      )}

      {state.status === "empty" && (
        <p>Este workspace ainda não possui membros.</p>
      )}

      {state.status === "success" && (
        <ul>
          {state.members.map((member) => (
            <li key={member.id}>
              <strong>{member.name}</strong>
              <span> — Papel: {member.role}</span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

export default Members;

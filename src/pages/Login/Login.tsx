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

function Login() {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

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

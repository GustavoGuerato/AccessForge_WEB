import { useState } from "react";
import type { FormEvent } from "react";

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
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const [usuario, setUsuario] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

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
            "Credenciais inválidas. Por favor, verifique seu e-mail e senha.",
          );
        }

        throw new Error(
          apiError?.error ??
          apiError?.message ??
          `Não foi possível entrar. Erro HTTP ${response.status}.`,
        );
      }

      const data = body as LoginResponse;
      setUsuario(data.user);
      setToken(data.token);
      setSenha("");
      console.log("Login realizado com sucesso:", data.user);
    } catch (error: unknown) {
      setErro(
        error instanceof Error
          ? error.message
          : "Ocorreu um erro inesperado.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1>Entrar no AccessForge</h1>

      <form onSubmit={handleSubmit}>
        <label htmlFor="email">E-mail</label>
        <input
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label htmlFor="senha">Senha</label>
        <input
          id="senha"
          name="senha"
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>

      {erro && <p role="alert">{erro}</p>}
    </>
  );
}

export default Login;

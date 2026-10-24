import { useState } from "react";
import Field from "./Field";

function FieldTest() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  return (
    <main>
      <h1>Teste do Field</h1>

      <Field
        label="E-mail"
        name="email"
        type="email"
        value={email}
        onChange={setEmail}
        error="E-mail inválido"
      />

      <Field
        label="Senha"
        name="password"
        type="password"
        value={senha}
        onChange={setSenha}
      />
    </main>
  );
}

export default FieldTest;

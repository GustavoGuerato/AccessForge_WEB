import { useId } from "react";

/**
 * Campo controlado e reutilizável.
 * O componente pai controla o valor e fornece a mensagem
 * de erro específica, quando existir.
 */
type FieldProps = {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
  required?: boolean;
  error?: string;
};

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  autoComplete,
  required = false,
  error,
}: FieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const hasError = Boolean(error);

  return (
    <div>
      <label htmlFor={id}>{label}</label>

      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={hasError}
        aria-describedby={hasError ? errorId : undefined}
      />

      {hasError && <p id={errorId}>{error}</p>}
    </div>
  );
}

export default Field;

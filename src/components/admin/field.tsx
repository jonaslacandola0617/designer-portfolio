import { useId } from "react";
export function Field({
  label,
  name,
  value,
  multiline = false,
  type = "text",
  required = false,
}: {
  label: string;
  name: string;
  value?: string | number;
  multiline?: boolean;
  type?: string;
  required?: boolean;
}) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {multiline ? (
        <textarea
          id={id}
          name={name}
          defaultValue={value}
          required={required}
        />
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          defaultValue={value}
          required={required}
        />
      )}
    </div>
  );
}

import { AnyFieldApi } from "@tanstack/react-form";
import { FormFieldErrorMessage, FormFieldTextInput } from "@/components/rhc";

/** Fout bij een veld, zodra de gebruiker het veld heeft bezocht. */
const foutVan = (field: AnyFieldApi): string | undefined =>
  field.state.meta.isTouched && !field.state.meta.isValid
    ? field.state.meta.errors[0]?.message
    : undefined;

/** Koppelt een TanStack Form-veld aan het RHC-tekstveld. */
function FormField({
  field,
  label,
  readOnly = false,
}: {
  field: AnyFieldApi;
  label: string;
  readOnly?: boolean;
}) {
  const fout = foutVan(field);
  return (
    <FormFieldTextInput
      id={field.name}
      name={field.name}
      label={label}
      readOnly={readOnly}
      value={field.state.value ?? ""}
      invalid={!!fout}
      errorMessage={fout}
      onBlur={field.handleBlur}
      // Het event komt van de input, maar is getypt op de wrapper-div.
      onChange={(e) => field.handleChange((e.target as HTMLInputElement).value)}
    />
  );
}

/** Foutmelding voor velden die geen FormField gebruiken, zoals een select. */
export function FieldInfo({ field }: { field: AnyFieldApi }) {
  const fout = foutVan(field);
  return fout ? <FormFieldErrorMessage>{fout}</FormFieldErrorMessage> : null;
}

export default FormField;

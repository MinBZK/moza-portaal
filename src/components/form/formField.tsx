import { AnyFieldApi } from "@tanstack/react-form";
import { FormFieldErrorMessage, FormFieldTextInput } from "@/components/rhc";

/** Error for a field, once the user has visited the field. */
const errorOf = (field: AnyFieldApi): string | undefined =>
  field.state.meta.isTouched && !field.state.meta.isValid
    ? field.state.meta.errors[0]?.message
    : undefined;

/** Connects a TanStack Form field to the RHC text field. */
function FormField({
  field,
  label,
  readOnly = false,
}: {
  field: AnyFieldApi;
  label: string;
  readOnly?: boolean;
}) {
  const error = errorOf(field);
  return (
    <FormFieldTextInput
      id={field.name}
      name={field.name}
      label={label}
      readOnly={readOnly}
      value={field.state.value ?? ""}
      invalid={!!error}
      errorMessage={error}
      onBlur={field.handleBlur}
      // The event comes from the input, but is typed on the wrapper div.
      onChange={(e) => field.handleChange((e.target as HTMLInputElement).value)}
    />
  );
}

/** Error message for fields that do not use FormField, such as a select. */
export function FieldInfo({ field }: { field: AnyFieldApi }) {
  const error = errorOf(field);
  return error ? <FormFieldErrorMessage>{error}</FormFieldErrorMessage> : null;
}

export default FormField;

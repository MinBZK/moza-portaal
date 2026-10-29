import type { ReactNode } from "react";

/**
 * The label of a form field, with room for extra information next to it,
 * such as an InfoToggletip. The extra information sits outside the <label>:
 * a button inside a label would also activate the field.
 */
const FieldLabel = ({
  htmlFor,
  id,
  className,
  info,
  children,
}: {
  htmlFor: string;
  id?: string;
  /** Extra classes on the <label>. */
  className?: string;
  /** Shown right after the label, for example an InfoToggletip. */
  info?: ReactNode;
  children: ReactNode;
}) => {
  const label = (
    <label
      id={id}
      htmlFor={htmlFor}
      className={`utrecht-form-label${className ? ` ${className}` : ""}`}
    >
      {children}
    </label>
  );

  return info ? (
    <span className="rhc-mox-field-label">
      {label}
      {info}
    </span>
  ) : (
    label
  );
};

export default FieldLabel;

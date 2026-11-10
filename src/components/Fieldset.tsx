import type { ComponentProps, ReactNode } from "react";
import { Fieldset as RhcFieldset } from "@rijkshuisstijl-community/components-react/no-side-effects";

/**
 * RHC Fieldset with an optional `info`, such as an InfoToggletip, next to
 * the legend. The info sits outside the <legend>: a legend may not hold a
 * <details>, and the name of the button would end up in the name of the
 * group. The CSS (rhc.css) puts it on the same line as the legend.
 *
 * With `invalid` it also gets utrecht-form-fieldset--invalid: the RHC
 * Fieldset only marks the legend, so the red line at the start was missing.
 */
export const Fieldset = ({
  info,
  className,
  children,
  ...props
}: ComponentProps<typeof RhcFieldset> & {
  /** Next to the legend, for example an InfoToggletip. */
  info?: ReactNode;
}) => {
  const classes =
    [
      info && "rhc-mox-fieldset--info",
      props.invalid && "utrecht-form-fieldset--invalid",
      className,
    ]
      .filter(Boolean)
      .join(" ") || undefined;
  return (
    <RhcFieldset className={classes} {...props}>
      {info && <div className="rhc-mox-fieldset__info">{info}</div>}
      {children}
    </RhcFieldset>
  );
};

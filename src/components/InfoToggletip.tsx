import type { ReactNode } from "react";
import { Alert, Icon, Paragraph } from "@/components/rhc";

/**
 * The RHC Toggletip (same markup and classes), with an accessible name of our
 * own. The RHC version always names its button "tooltip-content", which a
 * screen reader reads out in English and without a subject.
 */
const InfoToggletip = ({
  label,
  children,
}: {
  /** Accessible name of the (i) button, such as "Toelichting bij loonkostensubsidie". */
  label: string;
  children: ReactNode;
}) => (
  <details className="rhc-toggletip">
    <summary
      aria-label={label}
      className="rhc-toggletip__summary rhc-toggletip__button"
    >
      <Icon icon="info-circle" className="rhc-toggletip__icon" />
    </summary>
    <div className="rhc-toggletip__content">
      <Alert type="info" className="rhc-toggletip__alert">
        <Paragraph>{children}</Paragraph>
      </Alert>
    </div>
  </details>
);

export default InfoToggletip;

import type { ReactNode } from "react";
import { Paragraph } from "@/components/rhc";
import Spinner from "@/components/Spinner";

/**
 * A temporary message while something loads or is calculated, such as "Wij
 * rekenen uit…", with a spinner in front. A status message, so a screen
 * reader reads it out; the spinner itself has no text.
 */
const LoadingStatus = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <Paragraph
    role="status"
    className={`rhc-mox-cluster${className ? ` ${className}` : ""}`}
  >
    <Spinner label="" />
    {children}
  </Paragraph>
);

export default LoadingStatus;

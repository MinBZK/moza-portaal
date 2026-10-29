import { VisuallyHidden } from "@/components/rhc";

/**
 * Small spinning circle in the text colour, for a value that is being
 * calculated or loaded. The circle is decorative; the label is for screen
 * readers. Announce the waiting itself in a role="status" elsewhere.
 */
const Spinner = ({ label = "Wordt berekend" }: { label?: string }) => (
  <>
    <span className="rhc-mox-spinner" aria-hidden="true" />
    <VisuallyHidden>{label}</VisuallyHidden>
  </>
);

export default Spinner;

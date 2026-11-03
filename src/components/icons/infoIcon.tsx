/**
 * A loose "i", as large as the check mark. The RHC icon "info" (Tabler
 * info-small) is drawn to fit inside a circle and is much smaller.
 */
export const InfoIcon = () => (
  <span className="utrecht-icon" role="presentation" aria-hidden="true">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M12 6h.01" />
      <path d="M11 10h1v8h1" />
    </svg>
  </span>
);

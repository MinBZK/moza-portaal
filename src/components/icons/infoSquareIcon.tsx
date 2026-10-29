/**
 * The letter "i" (Tabler info, 1.5 times as large around the centre), for a
 * toggletip.
 */
export const InfoSquareIcon = ({ className }: { className?: string }) => (
  <span
    className={`utrecht-icon${className ? ` ${className}` : ""}`}
    role="presentation"
    aria-hidden="true"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 7.25h.01" />
      <path d="M10.5 11.75h1.5v6h1.5" />
    </svg>
  </span>
);

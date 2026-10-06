/** Vlag voor gemarkeerde berichten. Omlijnd als niet gemarkeerd, gevuld als wel. */
export const FlagIcon = ({
  filled = false,
  ...props
}: React.SVGProps<SVGSVGElement> & { filled?: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
    {...props}
  >
    <path
      d="M5 14h14l-4.5 -4.5l4.5 -4.5h-14v16"
      fill={filled ? "currentColor" : "none"}
    />
  </svg>
);

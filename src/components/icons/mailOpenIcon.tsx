/** Geopende envelop, voor "Markeer als gelezen". De iconenset van RHC heeft die niet. */
export const MailOpenIcon = () => (
  <span className="utrecht-icon" role="presentation" aria-hidden="true">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
    >
      <path d="M3 9l9 6l9 -6l-9 -6l-9 6" />
      <path d="M21 9v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10" />
      <path d="M3 19l6 -6" />
      <path d="M15 13l6 6" />
    </svg>
  </span>
);

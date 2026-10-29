/**
 * Chevron of an accordion. Decorative: aria-expanded on the button already
 * says whether the section is open. Same shape as the Utrecht icon, without
 * its fixed ids (Layer_1, clippath), which repeat on every accordion.
 */
export const ChevronDownIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="8"
    viewBox="0 0 14 8"
    fill="currentColor"
    aria-hidden="true"
    focusable="false"
  >
    <path d="m7,8c-.26,0-.51-.1-.71-.29L.29,1.71C-.1,1.32-.1.68.29.29S1.32-.1,1.71.29l5.29,5.29L12.29.29c.39-.39,1.02-.39,1.41,0s.39,1.02,0,1.41l-6,6c-.2.2-.45.29-.71.29Z" />
  </svg>
);

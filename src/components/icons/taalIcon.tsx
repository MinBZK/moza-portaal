/**
 * Icoon voor de taalkeuze (LanguageNavigation).
 *
 * PLACEHOLDER: vervang de <path> hieronder door de echte icoon-code. Houd
 * viewBox="0 0 24 24" en currentColor aan, dan schaalt het icoon mee en neemt
 * het de tekstkleur over.
 *
 * Bewust zonder de class `utrecht-icon`: in mox.css staat het chevron-icoon van
 * de taalkeuze (ook een utrecht-icon) op display: none.
 */
export const TaalIcon = () => (
  <span className="mox-taal-icoon" role="presentation" aria-hidden="true">
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
      <path d="M9 6.371c0 4.418 -2.239 6.629 -5 6.629" />
      <path d="M4 6.371h7" />
      <path d="M5 9c0 2.144 2.252 3.908 6 4" />
      <path d="M12 20l4 -9l4 9" />
      <path d="M19.1 18h-6.2" />
      <path d="M6.694 3l.793 .582" />
    </svg>
  </span>
);

/**
 * Puts the focus on an element and scrolls it to the top of the screen, so
 * the content after it can be read. Smooth, unless the user prefers less
 * motion. With `waitMs`, the scroll waits until content that opens or closes
 * with an animation has its final size (such as an accordion panel).
 */
export const focusAtTop = (
  element: HTMLElement | null | undefined,
  { waitMs = 0 }: { waitMs?: number } = {},
) => {
  if (!element) return;
  const motion = window.matchMedia(
    "(prefers-reduced-motion: no-preference)",
  ).matches;
  element.focus({ preventScroll: true });
  const scroll = () =>
    element.scrollIntoView({
      behavior: motion ? "smooth" : "auto",
      block: "start",
    });
  // Without motion there is no animation to wait for.
  if (motion && waitMs > 0) setTimeout(scroll, waitMs);
  else scroll();
};

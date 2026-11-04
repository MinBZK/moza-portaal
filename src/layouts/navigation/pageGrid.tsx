"use client";

import { createContext, use, useState, type ReactNode } from "react";
import { FOCUS_MODE_COOKIE } from "./focusModeCookie";

type FocusMode = { on: boolean; set: (on: boolean) => void };

const FocusModeContext = createContext<FocusMode>({ on: true, set: () => {} });

/** Focus mode of the page: on hides the navigation (see CollapsibleNavigation). */
export const useFocusMode = () => use(FocusModeContext);

/**
 * The grid of the page, with the state of focus mode. The choice lives in a
 * cookie for this browser session, so the server renders the next page in the
 * same state.
 */
const PageGrid = ({
  focusModeOff,
  children,
}: {
  focusModeOff: boolean;
  children: ReactNode;
}) => {
  const [open, setOpen] = useState(focusModeOff);

  const set = (on: boolean) => {
    setOpen(!on);
    document.cookie = on
      ? `${FOCUS_MODE_COOKIE}=; path=/; max-age=0`
      : `${FOCUS_MODE_COOKIE}=uit; path=/; samesite=lax`;
  };

  return (
    <FocusModeContext value={{ on: !open, set }}>
      <div
        className="rhc-grid rhc-mox-page-grid"
        data-navigation={open ? "open" : undefined}
      >
        {children}
      </div>
    </FocusModeContext>
  );
};

export default PageGrid;

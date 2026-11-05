"use client";

import { useState, type ReactNode } from "react";

/**
 * A value that changes with what the user enters, such as an amount in a
 * calculation. When it changes, it is briefly bold and larger, so the user
 * sees what the input did. Not on the first render, not after a spinner,
 * and not with reduced motion.
 */
const ChangedValue = ({ children }: { children: ReactNode }) => {
  // Text only: a spinner or other element passes through unchanged.
  const text = typeof children === "string" ? children : undefined;
  const [previous, setPrevious] = useState(text);
  const [changes, setChanges] = useState(0);
  if (text !== undefined && text !== previous) {
    setPrevious(text);
    // The first text after a spinner is not a change.
    if (previous !== undefined) setChanges(changes + 1);
  }
  // A spinner already shows that something changes: no emphasis after it.
  if (text === undefined && (previous !== undefined || changes > 0)) {
    setPrevious(undefined);
    setChanges(0);
  }
  if (text === undefined) return <>{children}</>;
  return (
    <span
      key={changes}
      className={changes ? "rhc-mox-changed-value" : undefined}
    >
      {text}
    </span>
  );
};

export default ChangedValue;

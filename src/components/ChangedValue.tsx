"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

const GroupContext = createContext<{ settled: boolean } | null>(null);

/**
 * Values that change together. A change waits until the group is settled,
 * for example until the user lets go of a slider, so the values light up at
 * that moment and not with every step in between.
 */
export const ChangedValueGroup = ({
  settled,
  children,
}: {
  /** False while the values are still changing. */
  settled: boolean;
  children: ReactNode;
}) => (
  <GroupContext.Provider value={{ settled }}>{children}</GroupContext.Provider>
);

/**
 * A value that changes with what the user enters, such as an amount in a
 * calculation. When it changes, it is briefly bold and larger, so the user
 * sees what the input did. Not on the first render, not after a spinner,
 * and not with reduced motion.
 */
const ChangedValue = ({
  children,
  quiet = false,
}: {
  children: ReactNode;
  /** No emphasis for now, for example while the value is already emphasized
   * another way. Changes in the meantime are not emphasized afterwards. */
  quiet?: boolean;
}) => {
  // Text only: a spinner or other element passes through unchanged.
  const text = typeof children === "string" ? children : undefined;
  const [previous, setPrevious] = useState(text);
  const [changes, setChanges] = useState(0);
  const [pending, setPending] = useState(false);
  const group = useContext(GroupContext);
  const waiting = group !== null && !group.settled;
  if (text !== undefined && text !== previous) {
    setPrevious(text);
    // The first text after a spinner is not a change.
    if (previous !== undefined && !quiet) {
      if (waiting) setPending(true);
      else setChanges(changes + 1);
    }
  }
  if (pending && !waiting) {
    setPending(false);
    setChanges(changes + 1);
  }
  if (quiet && changes > 0) setChanges(0);
  // A spinner already shows that something changes: no emphasis after it.
  if (
    text === undefined &&
    (previous !== undefined || changes > 0 || pending)
  ) {
    setPrevious(undefined);
    setChanges(0);
    setPending(false);
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

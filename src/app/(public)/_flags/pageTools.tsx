"use client";

import { useEffect, useSyncExternalStore, type ReactNode } from "react";

/**
 * Tools for the team that belong to one page, such as choosing the stage of
 * a case. The page passes them on; the Flags panel shows them, so they are
 * not between the content that respondents see.
 */
type Tools = { title: string; content: ReactNode };

let current: Tools | null = null;
const listeners = new Set<() => void>();

const set = (tools: Tools | null) => {
  current = tools;
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/** The tools of the current page, for the Flags panel. */
export const usePageTools = () =>
  useSyncExternalStore(
    subscribe,
    () => current,
    () => null,
  );

/** Puts tools for this page in the Flags panel. Renders nothing. */
export const PageTools = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => {
  useEffect(() => {
    set({ title, content: children });
  }, [title, children]);
  useEffect(() => () => set(null), []);
  return null;
};

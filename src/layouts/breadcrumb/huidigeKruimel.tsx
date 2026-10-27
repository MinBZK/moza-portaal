"use client";

import { useLayoutEffect, useSyncExternalStore } from "react";

/**
 * Label voor de laatste kruimel als de URL dat niet kan geven, zoals bij een
 * id. De pagina zet het label; de breadcrumb in de layout leest het.
 */

let huidig: { pad: string; label: string } | null = null;
const luisteraars = new Set<() => void>();

const zet = (waarde: typeof huidig) => {
  huidig = waarde;
  luisteraars.forEach((luisteraar) => luisteraar());
};

const subscribe = (luisteraar: () => void) => {
  luisteraars.add(luisteraar);
  return () => luisteraars.delete(luisteraar);
};

export const useHuidigeKruimel = () =>
  useSyncExternalStore(
    subscribe,
    () => huidig,
    () => null,
  );

/** Zet het label van de huidige pagina in de breadcrumb. Rendert niets. */
export const HuidigeKruimel = ({
  pad,
  label,
}: {
  pad: string;
  label: string;
}) => {
  // Layout-effect: de breadcrumb past zich aan voordat de browser tekent.
  useLayoutEffect(() => {
    zet({ pad, label });
    return () => zet(null);
  }, [pad, label]);
  return null;
};

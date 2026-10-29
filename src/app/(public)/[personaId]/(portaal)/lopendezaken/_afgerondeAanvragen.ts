"use client";

import { useSyncExternalStore } from "react";

/**
 * Bewaarde aanvragen die de gebruiker heeft afgerond zonder te versturen,
 * zoals Iemand aannemen als er niets aan te vragen is. Alleen in deze
 * browser (localStorage), net als de zaken van de digitale assistent.
 */

const SLEUTEL = "moza-afgeronde-aanvragen";

const LEEG: string[] = [];
const luisteraars = new Set<() => void>();
let vorige: { rauw: string | null; ids: string[] } | null = null;

const getSnapshot = (): string[] => {
  let rauw: string | null = null;
  try {
    rauw = window.localStorage.getItem(SLEUTEL);
  } catch {
    // Geen opslag: niets afgerond.
  }
  if (vorige?.rauw === rauw) return vorige.ids;
  let ids: string[] = [];
  try {
    const gelezen: unknown = JSON.parse(rauw ?? "[]");
    if (Array.isArray(gelezen)) ids = gelezen.map(String);
  } catch {
    // Onleesbaar: als leeg behandelen.
  }
  vorige = { rauw, ids };
  return ids;
};

const subscribe = (luisteraar: () => void) => {
  luisteraars.add(luisteraar);
  window.addEventListener("storage", luisteraar);
  return () => {
    luisteraars.delete(luisteraar);
    window.removeEventListener("storage", luisteraar);
  };
};

/** De ids van de afgeronde aanvragen; leeg zolang de opslag nog niet gelezen is. */
export const useAfgerondeAanvragen = () =>
  useSyncExternalStore(subscribe, getSnapshot, () => LEEG);

/** Legt vast dat de aanvraag is afgerond. */
export const rondAanvraagAf = (id: string) => {
  const ids = getSnapshot();
  if (ids.includes(id)) return;
  try {
    window.localStorage.setItem(SLEUTEL, JSON.stringify([...ids, id]));
  } catch {
    return;
  }
  luisteraars.forEach((luisteraar) => luisteraar());
};

/** Zet de aanvraag weer open, bijvoorbeeld als het scenario opnieuw begint. */
export const heropenAanvraag = (id: string) => {
  const ids = getSnapshot();
  if (!ids.includes(id)) return;
  try {
    window.localStorage.setItem(
      SLEUTEL,
      JSON.stringify(ids.filter((x) => x !== id)),
    );
  } catch {
    return;
  }
  luisteraars.forEach((luisteraar) => luisteraar());
};

"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Stand van het scenario "Iemand aannemen" in deze browser: welke bronnen zijn
 * bevestigd, of de aanvraag is verstuurd, op welk moment de zaak staat en de
 * vraag bij het besluit. Het script rekent niets: alle uitkomsten staan in de
 * demo-data en komen uit de regelrecht-engine. Een persona-wissel wist deze
 * sleutel (zie _flags/personaPaneel.tsx).
 */

export const SLEUTEL = "moza-iemand-aannemen";

export const FASEN = [
  "indicatie",
  "ontvangst",
  "meting",
  "loonwaarde",
  "besluit",
  "antwoord",
  "betaling",
] as const;
export type Fase = (typeof FASEN)[number];

export const BRONNEN = [
  "uwv",
  "gemeente",
  "kvk",
  "belastingdienst",
  "eigen",
] as const;
export type BronId = (typeof BRONNEN)[number];

export type AannemenStaat = {
  bronnen: Partial<Record<BronId, boolean>>;
  ingediend: boolean;
  verstuurdOp?: string;
  fase: Fase;
  vraag?: string;
  /** Uren per week uit het kandidaatformulier; de engine rekent ermee. */
  uren?: number;
};

const LEEG: AannemenStaat = {
  bronnen: {},
  ingediend: false,
  fase: "ontvangst",
};

const luisteraars = new Set<() => void>();
let vorige: { rauw: string | null; staat: AannemenStaat } | null = null;

const lees = (): AannemenStaat => {
  let rauw: string | null = null;
  try {
    rauw = window.localStorage.getItem(SLEUTEL);
  } catch {
    // Geen opslag: elke pagina werkt los.
  }
  if (vorige?.rauw === rauw) return vorige.staat;
  let staat = LEEG;
  try {
    const gelezen: unknown = JSON.parse(rauw ?? "null");
    if (gelezen && typeof gelezen === "object")
      staat = { ...LEEG, ...(gelezen as Partial<AannemenStaat>) };
  } catch {
    // Onleesbaar: als leeg behandelen.
  }
  vorige = { rauw, staat };
  return staat;
};

const subscribe = (luisteraar: () => void) => {
  luisteraars.add(luisteraar);
  window.addEventListener("storage", luisteraar);
  return () => {
    luisteraars.delete(luisteraar);
    window.removeEventListener("storage", luisteraar);
  };
};

const schrijf = (staat: AannemenStaat) => {
  try {
    window.localStorage.setItem(SLEUTEL, JSON.stringify(staat));
  } catch {
    return;
  }
  luisteraars.forEach((luisteraar) => luisteraar());
};

export const wisAannemen = () => {
  try {
    window.localStorage.removeItem(SLEUTEL);
  } catch {
    return;
  }
  luisteraars.forEach((luisteraar) => luisteraar());
};

export const faseIndex = (fase: Fase) => Math.max(0, FASEN.indexOf(fase));

export const alleBronnenBevestigd = (staat: AannemenStaat) =>
  BRONNEN.every((id) => staat.bronnen[id]);

export const statusTekst = (staat: AannemenStaat) => {
  if (!staat.ingediend) return "Nog niet verstuurd";
  return (
    [
      "",
      "In behandeling",
      "Loonwaarde gemeten",
      "Loonwaarde vastgesteld",
      "Besluit genomen",
      "Besluit genomen, vraag beantwoord",
      "Betaald",
    ][faseIndex(staat.fase)] ?? "In behandeling"
  );
};

/** null zolang de opslag nog niet gelezen is (op de server). */
export const useAannemen = () => {
  const staat = useSyncExternalStore<AannemenStaat | null>(
    subscribe,
    lees,
    () => null,
  );
  const werkBij = useCallback((wijziging: Partial<AannemenStaat>) => {
    schrijf({ ...lees(), ...wijziging });
  }, []);
  return { staat, werkBij };
};

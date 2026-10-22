"use client";

import { useCallback, useSyncExternalStore } from "react";
import { euro } from "./_werkgever";

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

export const DOELGROEPEN = [
  ["register", "Iemand uit het doelgroepregister (banenafspraak)"],
  ["wajong", "Iemand met een Wajong-uitkering"],
  ["wia", "Iemand met een WIA- of WAO-uitkering"],
  ["bijstand", "Iemand met een bijstandsuitkering"],
  ["geen", "Geen van deze"],
  ["weetniet", "Weet ik nog niet"],
] as const;
export type Doelgroep = (typeof DOELGROEPEN)[number][0];

/** Deze twee sluiten de andere keuzes uit. */
const ALLEEN: Doelgroep[] = ["geen", "weetniet"];

/**
 * Vraag 1 is meerkeuze. Wie Wajong heeft, staat in het doelgroepregister
 * (Wfsv 38b lid 1 onder c), dus Wajong vinkt het register aan en houdt het vast.
 */
export const kiesDoelgroep = (
  huidig: Doelgroep[],
  waarde: Doelgroep,
  aan: boolean,
): Doelgroep[] => {
  if (aan && ALLEEN.includes(waarde)) return [waarde];
  const rest = huidig.filter((d) => d !== waarde && !ALLEEN.includes(d));
  const nieuw = aan ? [...rest, waarde] : rest;
  if (nieuw.includes("wajong") && !nieuw.includes("register"))
    nieuw.push("register");
  return DOELGROEPEN.map(([d]) => d).filter((d) => nieuw.includes(d));
};

/** Het register staat vast aangevinkt zolang Wajong is gekozen. */
export const registerVast = (a: Antwoorden) => a.doelgroepen.includes("wajong");

/** Wettelijk minimumloon per uur per 1 juli 2026, in eurocent. */
export const WML_UUR_EUROCENT = 1499;

/** De vier korte vragen van het eerste scherm. */
export type Antwoorden = {
  /** Meerkeuze; leeg telt als "weet ik nog niet". */
  doelgroepen: Doelgroep[];
  /** Uren per week, 8 tot 40. */
  uren: number;
  /** Geschatte loonwaarde in procent, 30 tot 100; 100 is zelfstandig tegen het minimumloon. */
  loonwaarde: number;
  /** Bruto uurloon in eurocent, niet lager dan het minimumloon. */
  uurloon: number;
};

export const REGELINGEN = ["lks", "lkv", "nrp", "jc", "wpa", "pp"] as const;
export type RegelingId = (typeof REGELINGEN)[number];

export type AannemenStaat = {
  antwoorden: Antwoorden;
  /** Per bron: mag de aanvraag deze gegevens gebruiken. Niet gezet is ja. */
  bronnen: Partial<Record<BronId, boolean>>;
  /** De gekozen kandidaat (BSN-masker, of de naam van een zelf toegevoegde); zonder keuze haalt het portaal niets op. */
  kandidaat?: string;
  /** Zelf toegevoegde kandidaten, in afwachting van hun toestemming. */
  kandidatenNieuw?: {
    naam: string;
    geboortedatum: string;
    gevraagdOp: string;
  }[];
  /** Namens wie de aanvraag wordt ingevuld. */
  rol: "eigenaar" | "namens";
  /** Per regeling in de aanvraag: gecontroleerd. */
  gecontroleerd: Partial<Record<RegelingId, boolean>>;
  /** Keuzes bij de regelingen die niet vanzelf gelden. */
  keuzes: {
    jc?: "ja" | "nee";
    wpa?: "ja" | "later" | "nee";
    pp?: "ja" | "nee";
  };
  ingediend: boolean;
  verstuurdOp?: string;
  fase: Fase;
  vraag?: string;
};

export const STANDAARD_ANTWOORDEN: Antwoorden = {
  doelgroepen: ["register"],
  uren: 32,
  loonwaarde: 60,
  uurloon: WML_UUR_EUROCENT,
};

const LEEG: AannemenStaat = {
  antwoorden: STANDAARD_ANTWOORDEN,
  bronnen: {},
  rol: "eigenaar",
  gecontroleerd: {},
  keuzes: {},
  ingediend: false,
  fase: "ontvangst",
};

/** Het doelgroepregister volgens de antwoorden: ja, nee of onbekend. */
export const inRegister = (a: Antwoorden) =>
  a.doelgroepen.includes("register") || a.doelgroepen.includes("wajong")
    ? "ja"
    : a.doelgroepen.includes("geen")
      ? "nee"
      : "onbekend";

/** Onder 100 procent kan de kandidaat het minimumloon niet zelfstandig verdienen. */
export const onderMinimumloon = (a: Antwoorden) => a.loonwaarde < 100;

export const uurloonTekst = (a: Antwoorden) =>
  a.uurloon === WML_UUR_EUROCENT
    ? `wettelijk minimumloon, ${euro(a.uurloon)} per uur`
    : `${euro(a.uurloon)} per uur`;

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
    if (gelezen && typeof gelezen === "object") {
      const g = gelezen as Partial<AannemenStaat>;
      // Eerdere versies bewaarden één doelgroep.
      const oud = g.antwoorden as { doelgroep?: Doelgroep } | undefined;
      const antwoorden = { ...STANDAARD_ANTWOORDEN, ...(g.antwoorden ?? {}) };
      if (oud?.doelgroep && !g.antwoorden?.doelgroepen)
        antwoorden.doelgroepen = kiesDoelgroep([], oud.doelgroep, true);
      staat = { ...LEEG, ...g, antwoorden };
    }
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

export const bronBevestigd = (staat: AannemenStaat, id: BronId) =>
  staat.bronnen[id] !== false;

export const alleBronnenBevestigd = (staat: AannemenStaat) =>
  BRONNEN.every((id) => bronBevestigd(staat, id));

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

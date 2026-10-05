"use client";

import { useCallback, useState, useSyncExternalStore } from "react";

/**
 * Bewaarde en niet relevante items van Subsidies, Wetten en Berichten over uw
 * buurt. Staat in localStorage, dus alleen in deze browser.
 */

const SLEUTEL = "moza-bewaard";

export type BewaarItem = {
  /** Uniek per item, bijvoorbeeld "subsidie:voucher-duurzaam-ondernemen". */
  sleutel: string;
  categorie: string;
  titel: string;
  samenvatting: string;
  href: string;
};

type Staat = {
  bewaard: Record<string, BewaarItem>;
  nietRelevant: Record<string, BewaarItem>;
};

type Momentopname = { staat: Staat; onleesbaar: boolean };

const leeg = (): Staat => ({ bewaard: {}, nietRelevant: {} });

const isObject = (waarde: unknown): waarde is Record<string, BewaarItem> =>
  typeof waarde === "object" && waarde !== null && !Array.isArray(waarde);

const ontleed = (rauw: string | null): Momentopname => {
  if (!rauw) return { staat: leeg(), onleesbaar: false };
  try {
    const gelezen: unknown = JSON.parse(rauw);
    if (!isObject(gelezen)) throw new Error("Staat is geen object");
    const { bewaard, nietRelevant } = gelezen as Record<string, unknown>;
    return {
      staat: {
        bewaard: isObject(bewaard) ? bewaard : {},
        nietRelevant: isObject(nietRelevant) ? nietRelevant : {},
      },
      onleesbaar: false,
    };
  } catch {
    // Niet overschrijven: dan is wat de gebruiker bewaarde voorgoed weg.
    return { staat: leeg(), onleesbaar: true };
  }
};

const luisteraars = new Set<() => void>();
let vorigeRauw: string | null | undefined;
let vorigeMomentopname: Momentopname | null = null;

const getSnapshot = (): Momentopname => {
  let rauw: string | null = null;
  try {
    rauw = window.localStorage.getItem(SLEUTEL);
  } catch {
    // Geen toegang tot opslag: verder als leeg.
  }
  if (rauw !== vorigeRauw || !vorigeMomentopname) {
    vorigeRauw = rauw;
    vorigeMomentopname = ontleed(rauw);
  }
  return vorigeMomentopname;
};

// Op de server is niet bekend wat de gebruiker bewaarde; null betekent "nog laden".
const getServerSnapshot = () => null;

const subscribe = (luisteraar: () => void) => {
  luisteraars.add(luisteraar);
  window.addEventListener("storage", luisteraar);
  return () => {
    luisteraars.delete(luisteraar);
    window.removeEventListener("storage", luisteraar);
  };
};

const zonder = (lijst: Record<string, BewaarItem>, sleutel: string) => {
  const kopie = { ...lijst };
  delete kopie[sleutel];
  return kopie;
};

export const bewaarFoutTekst =
  "Uw keuze is niet bewaard. Uw browser bewaart nu niets voor deze website. Zet privénavigatie uit of sta opslag toe. Probeer het daarna opnieuw.";

export const useBewaard = () => {
  const momentopname = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const [fout, setFout] = useState(false);

  const wijzig = useCallback((pasToe: (staat: Staat) => Staat) => {
    const huidig = getSnapshot();
    try {
      if (huidig.onleesbaar) throw new Error("Opslag onleesbaar");
      window.localStorage.setItem(
        SLEUTEL,
        JSON.stringify(pasToe(huidig.staat)),
      );
    } catch {
      setFout(true);
      return false;
    }
    setFout(false);
    luisteraars.forEach((luisteraar) => luisteraar());
    return true;
  }, []);

  const zetBewaard = useCallback(
    (item: BewaarItem, aan: boolean) =>
      wijzig((s) => ({
        ...s,
        bewaard: aan
          ? { ...s.bewaard, [item.sleutel]: item }
          : zonder(s.bewaard, item.sleutel),
      })),
    [wijzig],
  );

  const zetNietRelevant = useCallback(
    (item: BewaarItem, aan: boolean) =>
      wijzig((s) => ({
        ...s,
        nietRelevant: aan
          ? { ...s.nietRelevant, [item.sleutel]: item }
          : zonder(s.nietRelevant, item.sleutel),
      })),
    [wijzig],
  );

  return {
    /** null zolang de opgeslagen staat nog niet gelezen is. */
    staat: momentopname?.staat ?? null,
    fout,
    zetBewaard,
    zetNietRelevant,
  };
};

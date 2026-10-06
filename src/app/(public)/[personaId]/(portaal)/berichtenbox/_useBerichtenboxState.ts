"use client";

import { useCallback, useState, useSyncExternalStore } from "react";

/**
 * Wat de gebruiker met zijn berichten heeft gedaan: gelezen, gearchiveerd,
 * verwijderd en gemarkeerd. De demo-data levert de berichten; dit is de laag
 * erbovenop. Het staat in localStorage, dus alleen in deze browser.
 */

const SLEUTEL = "moza-berichtenbox";

export type Weergave = "inbox" | "archief" | "prullenbak";
export type BerichtStatus = Weergave | "weg";
export type BewaarFout = "vol" | "geweigerd" | "onleesbaar";

type Staat = {
  gelezen: Record<string, boolean>;
  gearchiveerd: Record<string, boolean>;
  verwijderd: Record<string, boolean>;
  voorgoedVerwijderd: Record<string, boolean>;
  gemarkeerd: Record<string, boolean>;
};

type Momentopname = { staat: Staat; onleesbaar: boolean };

const leeg = (): Staat => ({
  gelezen: {},
  gearchiveerd: {},
  verwijderd: {},
  voorgoedVerwijderd: {},
  gemarkeerd: {},
});

const isRecord = (waarde: unknown): waarde is Record<string, boolean> =>
  typeof waarde === "object" && waarde !== null && !Array.isArray(waarde);

const ontleed = (rauw: string | null): Momentopname => {
  if (!rauw) return { staat: leeg(), onleesbaar: false };
  try {
    const gelezen: unknown = JSON.parse(rauw);
    if (!isRecord(gelezen)) throw new Error("Staat is geen object");
    const staat = leeg();
    for (const sleutel of Object.keys(staat) as (keyof Staat)[]) {
      const waarde: unknown = gelezen[sleutel];
      if (isRecord(waarde)) staat[sleutel] = waarde;
    }
    return { staat, onleesbaar: false };
  } catch {
    // Niet overschrijven: dan is wat de gebruiker had gearchiveerd voorgoed weg.
    return { staat: leeg(), onleesbaar: true };
  }
};

const luisteraars = new Set<() => void>();
let vorigeRauw: string | null | undefined;
let vorigeMomentopname: Momentopname | null = null;

const leesRauw = () => {
  try {
    return window.localStorage.getItem(SLEUTEL);
  } catch {
    return null;
  }
};

const getSnapshot = (): Momentopname => {
  const rauw = leesRauw();
  if (rauw !== vorigeRauw || !vorigeMomentopname) {
    vorigeRauw = rauw;
    vorigeMomentopname = ontleed(rauw);
  }
  return vorigeMomentopname;
};

// Op de server is niet bekend wat de gebruiker deed; null betekent "nog laden".
const getServerSnapshot = () => null;

const subscribe = (luisteraar: () => void) => {
  luisteraars.add(luisteraar);
  window.addEventListener("storage", luisteraar);
  return () => {
    luisteraars.delete(luisteraar);
    window.removeEventListener("storage", luisteraar);
  };
};

const zonder = (lijst: Record<string, boolean>, id: string) => {
  const kopie = { ...lijst };
  delete kopie[id];
  return kopie;
};

export const statusVan = (staat: Staat, id: string): BerichtStatus => {
  if (staat.voorgoedVerwijderd[id]) return "weg";
  if (staat.verwijderd[id]) return "prullenbak";
  if (staat.gearchiveerd[id]) return "archief";
  return "inbox";
};

export const isOngelezen = (staat: Staat, id: string, origineel: boolean) =>
  staat.gelezen[id] ? false : origineel;

export const isGemarkeerd = (staat: Staat, id: string) =>
  !!staat.gemarkeerd[id];

/** Ongelezen berichten die in de inbox staan. */
export const telOngelezen = (
  staat: Staat,
  berichten: { id: string; isOngelezen: boolean }[],
) =>
  berichten.filter(
    (bericht) =>
      statusVan(staat, bericht.id) === "inbox" &&
      isOngelezen(staat, bericht.id, bericht.isOngelezen),
  ).length;

export const bewaarFoutTekst: Record<BewaarFout, string> = {
  vol: "Uw wijziging is niet bewaard. Uw browser heeft geen ruimte meer. Maak ruimte vrij en probeer het opnieuw.",
  geweigerd:
    "Uw wijziging is niet bewaard. Uw browser bewaart nu niets voor deze website. Zet privénavigatie uit of sta opslag toe. Probeer het daarna opnieuw.",
  onleesbaar:
    "Uw wijziging is niet bewaard. Wat u eerder in uw Berichtenbox heeft gedaan, is niet te lezen. Daarom schrijven wij er niets overheen.",
};

export const useBerichtenboxState = () => {
  const momentopname = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const [fout, setFout] = useState<BewaarFout | null>(null);

  /** Geeft terug of het bewaren lukte. `stil` meldt geen fout aan de gebruiker. */
  const wijzig = useCallback(
    (pasToe: (staat: Staat) => Staat, { stil = false } = {}) => {
      const huidig = getSnapshot();
      if (huidig.onleesbaar) {
        if (!stil) setFout("onleesbaar");
        return false;
      }
      try {
        window.localStorage.setItem(
          SLEUTEL,
          JSON.stringify(pasToe(huidig.staat)),
        );
      } catch (error) {
        if (!stil) {
          setFout(
            error instanceof DOMException && error.name === "QuotaExceededError"
              ? "vol"
              : "geweigerd",
          );
        }
        return false;
      }
      setFout(null);
      luisteraars.forEach((luisteraar) => luisteraar());
      return true;
    },
    [],
  );

  const markeerGelezen = useCallback(
    (id: string) =>
      wijzig((s) => ({ ...s, gelezen: { ...s.gelezen, [id]: true } }), {
        stil: true,
      }),
    [wijzig],
  );

  const zetGemarkeerd = useCallback(
    (id: string, aan: boolean) =>
      wijzig((s) => ({ ...s, gemarkeerd: { ...s.gemarkeerd, [id]: aan } })),
    [wijzig],
  );

  const archiveer = useCallback(
    (id: string) =>
      wijzig((s) => ({
        ...s,
        gearchiveerd: { ...s.gearchiveerd, [id]: true },
        verwijderd: zonder(s.verwijderd, id),
      })),
    [wijzig],
  );

  const verwijder = useCallback(
    (id: string) =>
      wijzig((s) => ({
        ...s,
        verwijderd: { ...s.verwijderd, [id]: true },
        gearchiveerd: zonder(s.gearchiveerd, id),
      })),
    [wijzig],
  );

  const zetTerugInInbox = useCallback(
    (id: string) =>
      wijzig((s) => ({
        ...s,
        gearchiveerd: zonder(s.gearchiveerd, id),
        verwijderd: zonder(s.verwijderd, id),
      })),
    [wijzig],
  );

  const verwijderVoorgoed = useCallback(
    (id: string) =>
      wijzig((s) => ({
        ...s,
        voorgoedVerwijderd: { ...s.voorgoedVerwijderd, [id]: true },
      })),
    [wijzig],
  );

  return {
    /** null zolang de opgeslagen staat nog niet gelezen is. */
    staat: momentopname?.staat ?? null,
    fout,
    markeerGelezen,
    zetGemarkeerd,
    archiveer,
    verwijder,
    zetTerugInInbox,
    verwijderVoorgoed,
  };
};

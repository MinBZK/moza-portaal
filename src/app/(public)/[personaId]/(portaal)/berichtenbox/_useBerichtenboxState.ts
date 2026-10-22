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
  /** Door de gebruiker weer op ongelezen gezet. */
  ongelezen: Record<string, boolean>;
  gearchiveerd: Record<string, boolean>;
  verwijderd: Record<string, boolean>;
  voorgoedVerwijderd: Record<string, boolean>;
  gemarkeerd: Record<string, boolean>;
  /** Map per bericht; een lege naam is "uit de map gehaald". */
  mapVan: Record<string, string>;
  /** Mappen die de gebruiker zelf maakte. */
  eigenMappen: string[];
};

type Momentopname = { staat: Staat; onleesbaar: boolean };

const leeg = (): Staat => ({
  gelezen: {},
  ongelezen: {},
  gearchiveerd: {},
  verwijderd: {},
  voorgoedVerwijderd: {},
  gemarkeerd: {},
  mapVan: {},
  eigenMappen: [],
});

const isRecord = (waarde: unknown): waarde is Record<string, boolean> =>
  typeof waarde === "object" && waarde !== null && !Array.isArray(waarde);

const ontleed = (rauw: string | null): Momentopname => {
  if (!rauw) return { staat: leeg(), onleesbaar: false };
  try {
    const gelezen: unknown = JSON.parse(rauw);
    if (!isRecord(gelezen)) throw new Error("Staat is geen object");
    const staat = leeg();
    for (const sleutel of [
      "gelezen",
      "ongelezen",
      "gearchiveerd",
      "verwijderd",
      "voorgoedVerwijderd",
      "gemarkeerd",
    ] as const) {
      const waarde: unknown = gelezen[sleutel];
      if (isRecord(waarde)) staat[sleutel] = waarde;
    }
    const mapVan: unknown = gelezen.mapVan;
    if (isRecord(mapVan))
      staat.mapVan = Object.fromEntries(
        Object.entries(mapVan as object).filter(
          (paar): paar is [string, string] => typeof paar[1] === "string",
        ),
      );
    const eigenMappen: unknown = gelezen.eigenMappen;
    if (Array.isArray(eigenMappen))
      staat.eigenMappen = eigenMappen.filter(
        (naam) => typeof naam === "string",
      );
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

/**
 * Waar een bericht staat. Bij een bericht uit het stelsel weet het stelsel dat
 * (`plek`); bij demo-berichten deze browser.
 */
export const statusVanBericht = (
  staat: Staat,
  bericht: { id: string; plek?: Weergave },
): BerichtStatus => bericht.plek ?? statusVan(staat, bericht.id);

export const isOngelezen = (staat: Staat, id: string, origineel: boolean) =>
  staat.ongelezen[id] ? true : staat.gelezen[id] ? false : origineel;

/**
 * De map van een bericht. Bij een bericht uit het stelsel staat die daar
 * (`plek` is dan bekend); bij demo-berichten wint wat de gebruiker koos.
 */
export const mapVanBericht = (
  staat: Staat,
  bericht: { id: string; map?: string; plek?: Weergave },
) => {
  if (bericht.plek || !(bericht.id in staat.mapVan)) return bericht.map || null;
  return staat.mapVan[bericht.id] || null;
};

export const isGemarkeerd = (staat: Staat, id: string) =>
  !!staat.gemarkeerd[id];

/** Ongelezen berichten die in de inbox staan. */
export const telOngelezen = (
  staat: Staat,
  berichten: { id: string; isOngelezen: boolean; plek?: Weergave }[],
) =>
  berichten.filter(
    (bericht) =>
      statusVanBericht(staat, bericht) === "inbox" &&
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
      wijzig(
        (s) => ({
          ...s,
          gelezen: { ...s.gelezen, [id]: true },
          ongelezen: zonder(s.ongelezen, id),
        }),
        { stil: true },
      ),
    [wijzig],
  );

  /** "Markeren als ongelezen" en terug. */
  const zetOngelezen = useCallback(
    (id: string, aan: boolean) =>
      wijzig((s) =>
        aan
          ? {
              ...s,
              ongelezen: { ...s.ongelezen, [id]: true },
              gelezen: zonder(s.gelezen, id),
            }
          : {
              ...s,
              gelezen: { ...s.gelezen, [id]: true },
              ongelezen: zonder(s.ongelezen, id),
            },
      ),
    [wijzig],
  );

  /** Zet een demo-bericht in een map; een lege naam haalt het eruit. */
  const zetMap = useCallback(
    (id: string, map: string) =>
      wijzig((s) => ({
        ...s,
        mapVan: { ...s.mapVan, [id]: map },
        eigenMappen:
          !map || s.eigenMappen.includes(map)
            ? s.eigenMappen
            : [...s.eigenMappen, map],
      })),
    [wijzig],
  );

  /** Een map die de gebruiker maakte, ook als er (nog) niets in staat. */
  const bewaarMap = useCallback(
    (map: string) =>
      wijzig((s) =>
        s.eigenMappen.includes(map)
          ? s
          : { ...s, eigenMappen: [...s.eigenMappen, map] },
      ),
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
    zetOngelezen,
    zetMap,
    bewaarMap,
    zetGemarkeerd,
    archiveer,
    verwijder,
    zetTerugInInbox,
    verwijderVoorgoed,
  };
};

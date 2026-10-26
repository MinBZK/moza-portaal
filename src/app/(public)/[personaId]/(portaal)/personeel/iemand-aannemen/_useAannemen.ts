"use client";

import { useCallback, useSyncExternalStore } from "react";
import { DOELGROEPEN, kiesDoelgroep, type Doelgroep } from "./_uitkomsten";
import {
  migreerZaken,
  type PaneelId,
  type Situatie,
  type TaakId,
  type TaakStand,
  type ZaakStand,
  type Zaken,
} from "./_route";
import { euro } from "./_werkgever";

/**
 * Stand van het scenario "Iemand aannemen" in deze browser: welke bronnen zijn
 * bevestigd, of de aanvraag is verstuurd, op welk moment de zaak staat en de
 * vraag bij het besluit. Het script rekent niets: alle uitkomsten staan in de
 * demo-data en komen uit de regelrecht-engine. Een persona-wissel wist deze
 * sleutel (zie _flags/personaPaneel.tsx).
 */

export const SLEUTEL = "moza-iemand-aannemen";

export const BRONNEN = [
  "uwv",
  "gemeente",
  "kvk",
  "belastingdienst",
  "eigen",
] as const;
export type BronId = (typeof BRONNEN)[number];

export { DOELGROEPEN, kiesDoelgroep, type Doelgroep };

/** Het register staat vast aangevinkt zolang Wajong is gekozen. */
export const registerVast = (a: Antwoorden) => a.doelgroepen.includes("wajong");

/** Wettelijk minimumloon per uur per 1 juli 2026, in eurocent. */
export const WML_UUR_EUROCENT = 1499;

/** De vier korte vragen van het eerste scherm. */
export type Antwoorden = {
  /** Meerkeuze; leeg betekent dat er niets is gekozen. */
  doelgroepen: Doelgroep[];
  /** Uren per week, 8 tot 40. */
  uren: number;
  /** Geschatte loonwaarde in procent, 30 tot 100; 100 is zelfstandig tegen het minimumloon. */
  loonwaarde: number;
  /** Bruto uurloon in eurocent, niet lager dan het minimumloon. */
  uurloon: number;
};

/**
 * De regelingen met een paneel in de aanvraag. De opslag kan nog sleutels
 * voor lkv en nrp hebben (eerdere versies); die tellen niet meer mee.
 */
export type RegelingId = PaneelId;

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
  /** Per situatie een eigen zaak: ingediend, fase en vraag. */
  zaken: Zaken;
  /** Per taak van de werknemer waar die staat. */
  taken: Partial<Record<TaakId, TaakStand>>;
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
  zaken: {},
  taken: {},
};

const NIEUWE_ZAAK: ZaakStand = { ingediend: false, fase: "ontvangst" };

/** De zaak van een situatie; zonder zaak is de aanvraag nog niet verstuurd. */
export const zaakVan = (staat: AannemenStaat, situatie: Situatie): ZaakStand =>
  staat.zaken[situatie] ?? NIEUWE_ZAAK;

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
      // Eerdere versies kenden "weet ik nog niet"; die keuze bestaat niet meer.
      antwoorden.doelgroepen = antwoorden.doelgroepen.filter((d) =>
        DOELGROEPEN.some(([id]) => id === d),
      );
      const oudeZaak = g as Parameters<typeof migreerZaken>[0];
      staat = {
        ...LEEG,
        ...g,
        antwoorden,
        zaken: migreerZaken(oudeZaak),
        taken: g.taken ?? {},
      };
      // De losse velden van eerdere versies zijn nu opgegaan in zaken.
      for (const sleutel of ["ingediend", "verstuurdOp", "fase", "vraag"])
        delete (staat as Record<string, unknown>)[sleutel];
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

export const bronBevestigd = (staat: AannemenStaat, id: BronId) =>
  staat.bronnen[id] !== false;

export const alleBronnenBevestigd = (staat: AannemenStaat) =>
  BRONNEN.every((id) => bronBevestigd(staat, id));

/** De status van een zaak in Lopende zaken, per fase-id van de situatie. */
const STATUS: Partial<Record<Situatie, Record<string, string>>> = {
  gemeente: {
    ontvangst: "In behandeling",
    meting: "Loonwaarde gemeten",
    loonwaarde: "Loonwaarde vastgesteld",
    besluit: "Besluit genomen",
    antwoord: "Besluit genomen, vraag beantwoord",
    betaling: "Betaald",
  },
  wajong: {
    ontvangst: "In behandeling",
    onderzoek: "Onderzoek op de werkplek uitgevoerd",
    percentage: "Percentage vastgesteld",
    besluit: "Besluit genomen",
  },
  wia: {
    wacht: "Wacht op de aanvraag van de werknemer",
    aangevraagd: "Doelgroepverklaring aangevraagd",
    verstrekt: "Doelgroepverklaring verstrekt",
  },
};

export const statusTekst = (zaak: ZaakStand, situatie: Situatie) => {
  if (!zaak.ingediend) return "Nog niet verstuurd";
  return STATUS[situatie]?.[zaak.fase] ?? "In behandeling";
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
  const werkZaakBij = useCallback(
    (situatie: Situatie, wijziging: Partial<ZaakStand>) => {
      const nu = lees();
      schrijf({
        ...nu,
        zaken: {
          ...nu.zaken,
          [situatie]: { ...zaakVan(nu, situatie), ...wijziging },
        },
      });
    },
    [],
  );
  return { staat, werkBij, werkZaakBij };
};

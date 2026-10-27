"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import type { DemoBericht } from "@/demo";
import { useFlag } from "@/app/(public)/_flags/flagsContext";

/**
 * Nagebootst federatief gedrag voor de demo-berichten, zoals dataset-bron.js
 * in moza-poc. Twee vlaggen in het Flags-paneel:
 *
 * - "Dynamische berichten": er komen af en toe berichten bij, alsof een
 *   organisatie later antwoordt. Standaard elke minuut, met ?poll=<seconden>
 *   sneller. Ze blijven bewaard tot de vlag weer uitgaat.
 * - "Berichtenbox unhappy flow": per sessie één van drie storingen. Eén
 *   organisatie is onbereikbaar, geen enkele organisatie antwoordt, of er valt
 *   onderweg een organisatie uit.
 *
 * Een organisatie die niet antwoordt levert geen berichten. De lijst laat die
 * dus weg, net als bij een echte storing.
 */

const NIEUW_SLEUTEL = "moza-berichtenbox-nieuw";
const SCENARIO_SLEUTEL = "moza-berichtenbox-scenario";
const UITVAL_SLEUTEL = "moza-berichtenbox-uitval";

const LIMIET = 5;
const POLL_STANDAARD_SEC = 60;
const POLL_MIN_SEC = 5;
const ONDERWERPEN = [
  "Nieuw bericht ontvangen",
  "Bevestiging ontvangst",
  "Bericht beschikbaar",
  "Actie mogelijk vereist",
];

export type Scenario = "een" | "geen" | "later";
const SCENARIOS: Scenario[] = ["een", "geen", "later"];
type Bron = { id: string; naam: string };

// --- Opslag -------------------------------------------------------------------

const luisteraars = new Set<() => void>();
const meld = () => luisteraars.forEach((luisteraar) => luisteraar());
const subscribe = (luisteraar: () => void) => {
  luisteraars.add(luisteraar);
  window.addEventListener("storage", luisteraar);
  return () => {
    luisteraars.delete(luisteraar);
    window.removeEventListener("storage", luisteraar);
  };
};

const lees = (opslag: () => Storage, sleutel: string) => {
  try {
    return opslag().getItem(sleutel);
  } catch {
    return null;
  }
};

const schrijf = (
  opslag: () => Storage,
  sleutel: string,
  waarde: string | null,
) => {
  try {
    if (waarde === null) opslag().removeItem(sleutel);
    else opslag().setItem(sleutel, waarde);
  } catch {
    return false;
  }
  meld();
  return true;
};

const lokaal = () => window.localStorage;
const sessie = () => window.sessionStorage;

let vorigeNieuw: { rauw: string | null; lijst: DemoBericht[] } | null = null;
const leesNieuw = (): DemoBericht[] => {
  const rauw = lees(lokaal, NIEUW_SLEUTEL);
  if (vorigeNieuw?.rauw === rauw) return vorigeNieuw.lijst;
  let lijst: DemoBericht[] = [];
  try {
    const gelezen: unknown = rauw ? JSON.parse(rauw) : [];
    if (Array.isArray(gelezen)) lijst = gelezen as DemoBericht[];
  } catch {
    // Onleesbaar: dan geen binnengekomen berichten.
  }
  vorigeNieuw = { rauw, lijst };
  return lijst;
};

let vorigeSimulatie: {
  rauw: string;
  waarde: { scenario: string | null; uitval: Bron | null };
} | null = null;
const leesSimulatie = () => {
  const scenario = lees(sessie, SCENARIO_SLEUTEL);
  const uitvalRauw = lees(sessie, UITVAL_SLEUTEL);
  const rauw = `${scenario}|${uitvalRauw}`;
  if (vorigeSimulatie?.rauw === rauw) return vorigeSimulatie.waarde;
  let uitval: Bron | null = null;
  try {
    uitval = uitvalRauw ? (JSON.parse(uitvalRauw) as Bron) : null;
  } catch {
    uitval = null;
  }
  vorigeSimulatie = { rauw, waarde: { scenario, uitval } };
  return vorigeSimulatie.waarde;
};

const GEEN_SIMULATIE = { scenario: null, uitval: null };

// --- Dynamische berichten -----------------------------------------------------

/**
 * Berichten die zijn binnengedruppeld, nieuwste eerst. Null zolang de browser
 * nog niet gelezen is. Staat de vlag uit, dan worden ze opgeruimd.
 */
export const useNieuweBerichten = (): DemoBericht[] | null => {
  const aan = useFlag("mox_dynamischeBerichten");
  const lijst = useSyncExternalStore(subscribe, leesNieuw, () => null);

  useEffect(() => {
    if (!aan && lijst?.length) schrijf(lokaal, NIEUW_SLEUTEL, null);
  }, [aan, lijst]);

  if (!lijst) return null;
  return aan ? lijst : [];
};

const tussenpoos = () => {
  const gevraagd = Number(new URLSearchParams(location.search).get("poll"));
  const seconden =
    Number.isFinite(gevraagd) && gevraagd > 0 ? gevraagd : POLL_STANDAARD_SEC;
  return Math.max(seconden, POLL_MIN_SEC) * 1000;
};

let teller = 0;
// Het laatste bericht dat tijdens dit bezoek binnenkwam. Niet bewaard: na
// verversen is het geen nieuws meer.
let laatstBinnengekomen: string | null = null;

/** Id van het bericht dat net binnenkwam, om het te laten oplichten. */
export const useLaatstBinnengekomen = () =>
  useSyncExternalStore(
    subscribe,
    () => laatstBinnengekomen,
    () => null,
  );

const nieuwBericht = (bronnen: Bron[]): DemoBericht => {
  teller++;
  const bron = bronnen[Math.floor(Math.random() * bronnen.length)];
  return {
    id: `live-${Date.now()}-${teller}`,
    afzenderId: bron.id,
    afzender: bron.naam,
    onderwerp: ONDERWERPEN[Math.floor(Math.random() * ONDERWERPEN.length)],
    inhoud: [`Dit is een demo-bericht van ${bron.naam}.`],
    datum: new Date().toISOString().slice(0, 10),
    isOngelezen: true,
    heeftBijlage: Math.random() < 0.3,
  };
};

/**
 * Laat berichten binnendruppelen zolang `actief` aan staat: op de inbox, na
 * het ophalen. Geeft terug of alle demo-berichten binnen zijn.
 */
export const useDruppelen = (actief: boolean, bronnen: Bron[]) => {
  const aan = useFlag("mox_dynamischeBerichten");
  const lijst = useNieuweBerichten();
  const vol = (lijst?.length ?? 0) >= LIMIET;
  const bronSleutel = bronnen.map((bron) => bron.id).join("|");

  useEffect(() => {
    if (!aan || !actief || vol || !bronSleutel) return;
    const klok = setInterval(() => {
      const huidig = leesNieuw();
      if (huidig.length >= LIMIET) return;
      const bericht = nieuwBericht(bronnen);
      laatstBinnengekomen = bericht.id;
      schrijf(lokaal, NIEUW_SLEUTEL, JSON.stringify([bericht, ...huidig]));
    }, tussenpoos());
    return () => clearInterval(klok);
    // De bronnen zelf veranderen per render; de sleutel niet.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aan, actief, vol, bronSleutel]);

  return aan && vol;
};

// --- Unhappy flow -------------------------------------------------------------

/** De organisatie die in het scenario "een" onbereikbaar is, zoals in moza-poc. */
const ONBEREIKBARE_BRON: Bron = { id: "rdw", naam: "RDW" };

export type Uitval = {
  scenario: Scenario | null;
  /** Bij "een": de onbereikbare organisatie. Bij "later": de uitgevallen. */
  bron: Bron | null;
  /** Levert deze organisatie nu niets? */
  blokkeert: (bericht: { afzenderId?: string }) => boolean;
  /** "Opnieuw proberen": de storing is voorbij, tot de vlag weer aangaat. */
  herstel: () => void;
};

/**
 * De storing van deze sessie. Eén keuze per sessie, zodat de inbox en de
 * detailpagina hetzelfde zeggen.
 */
export const useUitval = (): Uitval => {
  const aan = useFlag("mox_berichtenboxUnhappyFlow");
  const stand = useSyncExternalStore(
    subscribe,
    leesSimulatie,
    () => GEEN_SIMULATIE,
  );

  useEffect(() => {
    if (!aan) {
      if (lees(sessie, SCENARIO_SLEUTEL)) {
        schrijf(sessie, SCENARIO_SLEUTEL, null);
        schrijf(sessie, UITVAL_SLEUTEL, null);
      }
      return;
    }
    if (!lees(sessie, SCENARIO_SLEUTEL)) {
      const gekozen = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
      schrijf(sessie, SCENARIO_SLEUTEL, gekozen);
    }
  }, [aan]);

  const herstel = useCallback(() => {
    schrijf(sessie, UITVAL_SLEUTEL, null);
    schrijf(sessie, SCENARIO_SLEUTEL, "hersteld");
  }, []);

  const scenario =
    aan && SCENARIOS.includes(stand.scenario as Scenario)
      ? (stand.scenario as Scenario)
      : null;

  const bron =
    scenario === "een"
      ? ONBEREIKBARE_BRON
      : scenario === "later"
        ? stand.uitval
        : null;

  const blokkeert = (bericht: { afzenderId?: string }) =>
    scenario === "geen" ||
    (!!bron &&
      (scenario === "een" || scenario === "later") &&
      bericht.afzenderId === bron.id);

  return { scenario, bron, blokkeert, herstel };
};

/**
 * Scenario "later": 4 tot 12 seconden na het ophalen valt één van de
 * zichtbare organisaties uit.
 */
export const usePlanUitval = (
  actief: boolean,
  uitval: Uitval,
  kandidaten: Bron[],
) => {
  const plannen = actief && uitval.scenario === "later" && !uitval.bron;
  const sleutel = JSON.stringify(kandidaten);
  useEffect(() => {
    const lijst = JSON.parse(sleutel) as Bron[];
    if (!plannen || !lijst.length) return;
    const klok = setTimeout(
      () => {
        const gekozen = lijst[Math.floor(Math.random() * lijst.length)];
        schrijf(sessie, UITVAL_SLEUTEL, JSON.stringify(gekozen));
      },
      4000 + Math.random() * 8000,
    );
    return () => clearTimeout(klok);
  }, [plannen, sleutel]);
};

/** Unieke organisaties van een lijst berichten. */
export const bronnenVan = (berichten: DemoBericht[]): Bron[] => {
  const gezien = new Map<string, string>();
  for (const bericht of berichten)
    if (!gezien.has(bericht.afzenderId))
      gezien.set(bericht.afzenderId, bericht.afzender);
  return [...gezien].map(([id, naam]) => ({ id, naam }));
};

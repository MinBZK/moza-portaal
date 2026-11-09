"use client";

import { useCallback, useSyncExternalStore } from "react";
import { eigenaarUit, isVanEigenaar } from "./_eigenaar";
import {
  DOELGROEPEN,
  kiesDoelgroep,
  type Doelgroep,
  type InRegister,
  type Uitkering,
} from "./_uitkomsten";
import {
  migreerZaken,
  type PaneelId,
  type Situatie,
  type TaakId,
  type TaakStand,
  type VanzelfId,
  type ZaakStand,
  type Zaken,
} from "./_route";
import { euro } from "./_werkgever";

/**
 * Stand van het scenario "Iemand aannemen" in deze browsersessie
 * (sessionStorage), dus geen bewaard concept: een nieuwe sessie begint
 * opnieuw. Houdt bij welke bronnen zijn bevestigd, of de aanvraag is verstuurd, op welk moment de zaak staat en de
 * vraag bij het besluit. Het script rekent niets: alle uitkomsten staan in de
 * demo-data en komen uit de regelrecht-engine. Een persona-wissel wist deze
 * sleutel (zie _flags/personaPaneel.tsx); de opslag onthoudt ook van welke
 * persona en onderneming hij is (_eigenaar.ts), zodat een wissel buiten het
 * paneel om, of naar een andere onderneming, leeg begint.
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

/** Het register staat vast aangevinkt bij Wajong zonder beschut werk. */
export const registerVast = (a: Antwoorden) =>
  a.doelgroepen.includes("wajong") && !a.doelgroepen.includes("beschut");

/** Wettelijk minimumloon per uur per 1 juli 2026, in eurocent. */
export const WML_UUR_EUROCENT = 1499;

/** De vier korte vragen van het eerste scherm. */
export type Antwoorden = {
  /** Waarmee de engine rekent; volgt uit register, beschut en uitkering. */
  doelgroepen: Doelgroep[];
  /** De vragen naar register, beschut werk en uitkering; zonder waarde afgeleid uit de doelgroepen. */
  register?: InRegister;
  beschut?: boolean;
  uitkering?: Uitkering;
  /** Uren per week, 1 tot 40; de wet kent geen ondergrens. */
  uren: number;
  /** Geschatte loonwaarde in procent, 0 tot 100; 100 is geen verminderde loonwaarde. */
  loonwaarde: number;
  /** Bruto uurloon in eurocent, €4,50 tot €30 (schuifregelaar in _vragen.tsx). */
  uurloon: number;
  /** De eerste werkdag (jjjj-mm-dd), door de werkgever opgegeven in stap 1. */
  aanvang?: string;
  /** Alleen bij WIA: in de zes maanden voor de eerste werkdag al bij de werkgever in dienst (Wtl 2.6 lid 1 b). */
  eerderInDienst?: boolean;
};

/**
 * Elke regeling in de aanvraag: wat de werkgever indient (gecontroleerd), en
 * wat vanzelf gaat of een taak van de werknemer is (gelezen).
 */
export type RegelingId = PaneelId | VanzelfId | TaakId;

export type AannemenStaat = {
  antwoorden: Antwoorden;
  /** Per bron: mag de aanvraag deze gegevens gebruiken. Niet gezet is ja. */
  bronnen: Partial<Record<BronId, boolean>>;
  /** De gekozen kandidaat (BSN-masker, of de naam van een zelf toegevoegde); zonder keuze haalt het portaal niets op. */
  kandidaat?: string;
  /** Zelf toegevoegde kandidaten, in afwachting van hun toestemming. */
  kandidatenNieuw?: {
    naam: string;
    /** Alleen bij kandidaten uit een eerdere versie. */
    geboortedatum?: string;
    /** Het BSN, afgeschermd tot de laatste vier cijfers. */
    bsn?: string;
    gevraagdOp: string;
  }[];
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
  /** The furthest step (1 to 4) the user has reached in this session. */
  verstStap?: number;
  /** Dossier ingediend zonder iets te versturen; de bedankpagina zegt wat er nu gebeurt. */
  afgerond?: boolean;
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
  gecontroleerd: {},
  keuzes: {},
  zaken: {},
  taken: {},
};

const NIEUWE_ZAAK: ZaakStand = { ingediend: false, fase: "ontvangst" };

/** De zaak van een situatie; zonder zaak is de aanvraag nog niet verstuurd. */
export const zaakVan = (staat: AannemenStaat, situatie: Situatie): ZaakStand =>
  staat.zaken[situatie] ?? NIEUWE_ZAAK;

/** Onder 100 procent is de loonwaarde verminderd. */
export const onderMinimumloon = (a: Antwoorden) => a.loonwaarde < 100;

/** Alleen het loonkostenvoordeel bij WIA hangt af van een eerder dienstverband (Wtl 2.6 lid 1 b). */
export const vraagEerderInDienst = (a: Antwoorden) =>
  a.doelgroepen.includes("wia");

/** De eigen opgave in stap 1 is compleet: de eerste werkdag en, bij WIA, het eerdere dienstverband. */
export const eigenOpgaveCompleet = (a: Antwoorden) =>
  !!a.aanvang && (!vraagEerderInDienst(a) || a.eerderInDienst !== undefined);

export const uurloonTekst = (a: Antwoorden) =>
  a.uurloon === WML_UUR_EUROCENT
    ? `wettelijk minimumloon, ${euro(a.uurloon)} per uur`
    : `${euro(a.uurloon)} per uur`;

const luisteraars = new Set<() => void>();
let vorige: {
  rauw: string | null;
  eigenaar: string;
  staat: AannemenStaat;
} | null = null;

const huidigeEigenaar = () => eigenaarUit(document.cookie);

const lees = (): AannemenStaat => {
  let rauw: string | null = null;
  try {
    rauw = window.sessionStorage.getItem(SLEUTEL);
  } catch {
    // Geen opslag: elke pagina werkt los.
  }
  const eigenaar = huidigeEigenaar();
  if (vorige?.rauw === rauw && vorige.eigenaar === eigenaar)
    return vorige.staat;
  let staat = LEEG;
  try {
    const gelezen: unknown = JSON.parse(rauw ?? "null");
    if (
      gelezen &&
      typeof gelezen === "object" &&
      isVanEigenaar(gelezen, eigenaar)
    ) {
      const g = gelezen as Partial<AannemenStaat> & { eigenaar?: string };
      delete g.eigenaar;
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
  vorige = { rauw, eigenaar, staat };
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
    window.sessionStorage.setItem(
      SLEUTEL,
      JSON.stringify({ ...staat, eigenaar: huidigeEigenaar() }),
    );
  } catch {
    return;
  }
  luisteraars.forEach((luisteraar) => luisteraar());
};

export const wisAannemen = () => {
  try {
    window.sessionStorage.removeItem(SLEUTEL);
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
    const nu = lees();
    // Andere antwoorden geven een andere aanvraag: controleer die opnieuw.
    const anders =
      wijziging.antwoorden !== undefined &&
      JSON.stringify(wijziging.antwoorden) !== JSON.stringify(nu.antwoorden);
    schrijf({
      ...nu,
      ...wijziging,
      ...(anders && !wijziging.gecontroleerd ? { gecontroleerd: {} } : {}),
    });
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

"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import type { DemoBericht } from "@/demo";
import {
  berichtSleutel,
  haalInhoud,
  haalLijst,
  haalOp,
  isLeesbaar,
  KetenFout,
  leesSessie,
  plekVanMap,
  startSessie,
  verlengSessie,
  verplaatsBericht,
  verwijderBericht,
  volg,
  zetMap,
  type KetenFoutReden,
  type KetenInhoud,
  type KetenLijst,
  type KetenLijstBericht,
  type KetenVoortgang,
  type Volledigheid,
} from "@/network/keten/client";
import type { Weergave } from "./_useBerichtenboxState";

/**
 * De berichten van een aangesloten persona, uit het Federatief
 * Berichtenstelsel. Eén keer per paginabezoek opgehaald en gedeeld door de
 * lijst, de tabbladen en de teller in het menu. Waar een bericht staat (inbox,
 * archief, prullenbak) bepaalt het stelsel; gelezen en gemarkeerd blijven in
 * deze browser, net als bij de demo-berichten.
 *
 * Het stelsel geeft berichten alleen binnen een sessie. Het portaal is de klok:
 * alleen wat de ondernemer zelf doet, houdt de sessie in leven. Een open
 * berichtenbox op een onbeheerde werkplek laat haar verlopen. Alle tabbladen van
 * deze browser delen één sessie (het cookie); een tabblad start pas een nieuwe
 * als de huidige echt weg is, anders zetten ze elkaar steeds uit.
 */

export type KetenBericht = DemoBericht & {
  /** Het nummer van het bericht bij de organisatie; `id` is de sleutel. */
  berichtId: string;
  magazijnId: string;
  plek: Weergave;
  tijdstip: string;
};

type Fase = "leeg" | "laden" | "ophalen" | "klaar" | "fout";

type KetenStaat = {
  ontvanger: string | null;
  fase: Fase;
  berichten: KetenBericht[];
  voortgang: KetenVoortgang | null;
  fout: KetenFoutReden | null;
  /** Wat het stelsel zegt over organisaties die niet (alles) leverden. */
  volledigheid: Volledigheid | null;
  /** De sessie is verlopen; bij de volgende actie halen wij opnieuw op. */
  verlopen: boolean;
  /** Wij halen na een verlopen sessie of op verzoek opnieuw op. */
  herstelt: boolean;
  /** Wat de laatste ophaalronde opleverde, voor de bevestiging aan schermlezers. */
  opgehaald: { berichten: number; organisaties: number } | null;
  /** Laatst binnengekomen bericht, voor de melding aan schermlezers. */
  nieuw: { id: string; afzender: string } | null;
  /** Nieuwe berichten komen niet meer vanzelf binnen. */
  volgenGestopt: boolean;
};

export const ketenFoutTekst: Record<KetenFoutReden, string> = {
  onbereikbaar:
    "Wij kunnen uw berichten nu niet ophalen. Ververs de pagina om het opnieuw te proberen.",
  bezig:
    "Wij halen uw berichten op dit moment al op. Wacht 2 minuten en ververs dan de pagina.",
  afgebroken:
    "Het ophalen van uw berichten is halverwege gestopt. Daardoor staan hier niet al uw berichten. Ververs de pagina om het opnieuw te proberen.",
  geenSessie:
    "Uw berichten staan niet meer klaar. Ververs de pagina, dan halen wij ze opnieuw op.",
  sessieVerlopen:
    "U was een tijd niet actief. Ververs de pagina, dan halen wij uw berichten opnieuw op.",
  teVeelSessies:
    "De berichtenbox van uw bedrijf is op te veel plekken tegelijk open. Log uit op een ander apparaat of in een andere browser. Ververs daarna deze pagina. Lukt dat niet? Wacht dan 15 minuten en ververs de pagina.",
  tijdelijk:
    "Wij kunnen uw berichten nu niet ophalen. Ververs de pagina over een minuut om het opnieuw te proberen.",
  weg: "Dit bericht bestaat niet meer. Het staat daarom niet meer in de lijst.",
};

const WACHT_OP_RONDE_MS = 45000;
const WACHT_STAP_MS = 1500;
const LEGE_VOORTGANG: KetenVoortgang = {
  bronnen: 0,
  klaar: 0,
  gevonden: 0,
  mappen: {},
};

const LEEG: KetenStaat = {
  ontvanger: null,
  fase: "leeg",
  berichten: [],
  voortgang: null,
  fout: null,
  volledigheid: null,
  verlopen: false,
  herstelt: false,
  opgehaald: null,
  nieuw: null,
  volgenGestopt: false,
};

let staat = LEEG;
let bezig: Promise<void> | null = null;
const luisteraars = new Set<() => void>();

// Elke ontvanger krijgt een eigen generatie. Werk dat nog voor een vorige
// persona onderweg is, schrijft daarna niets meer in de staat.
let generatie = 0;

const zet = (gen: number, wijziging: Partial<KetenStaat>) => {
  if (gen !== generatie) return;
  staat = { ...staat, ...wijziging };
  luisteraars.forEach((luisteraar) => luisteraar());
};

const subscribe = (luisteraar: () => void) => {
  luisteraars.add(luisteraar);
  return () => luisteraars.delete(luisteraar);
};

const redenVan = (fout: unknown): KetenFoutReden =>
  fout instanceof KetenFout ? fout.reden : "onbereikbaar";

// --- Activiteit en sessie ----------------------------------------------------
//
// Activiteit is wat de ondernemer zelf doet: een klik of tik, een toets, scrollen,
// naar dit tabblad terugkeren of naar een andere pagina gaan. Een timer of een
// open stroom telt niet. Verlengen gebeurt hoogstens eens per minuut; viel er in
// die minuut activiteit, dan verlengen wij aan het eind ervan nog één keer.

const ACTIEF_MS = 60000;
const VERLENG_MS = 60000;
// Hoe vaak een verlopen sessie vanzelf terug mag komen, zonder dat de
// ondernemer erom vraagt.
const HERSTEL_LIMIET = 2;

let laatsteActiviteit = 0;
let laatstVerlengd = 0;
let naloop: ReturnType<typeof setTimeout> | undefined;
let sessieLoopt = false;
let herstelPogingen = 0;
let herstelBezig: Promise<void> | null = null;
let luistertNaarActiviteit = false;
const wachtenOpActiviteit = new Set<() => void>();

const isActief = () => Date.now() - laatsteActiviteit < ACTIEF_MS;

const verleng = async () => {
  naloop = undefined;
  laatstVerlengd = Date.now();
  const gen = generatie;
  const stand = await verlengSessie();
  if (gen !== generatie) return;
  if (stand === "verlopen") sessieVerlopen();
  if (stand === "onbekend") {
    console.warn("[Berichtenbox] sessie verlengen niet gelukt");
    // Bij de volgende activiteit meteen opnieuw.
    laatstVerlengd = 0;
  }
};

const opActiviteit = () => {
  laatsteActiviteit = Date.now();
  const wachtenden = [...wachtenOpActiviteit];
  wachtenOpActiviteit.clear();
  wachtenden.forEach((verder) => verder());
  if (!sessieLoopt || naloop) return;
  const wacht = laatstVerlengd + VERLENG_MS - laatsteActiviteit;
  if (wacht <= 0) void verleng();
  else naloop = setTimeout(() => void verleng(), wacht);
};

const opZichtbaar = () => {
  if (document.visibilityState === "visible") opActiviteit();
};

const luisterNaarActiviteit = () => {
  if (luistertNaarActiviteit) return;
  luistertNaarActiviteit = true;
  const opties = { capture: true, passive: true };
  window.addEventListener("pointerdown", opActiviteit, opties);
  window.addEventListener("keydown", opActiviteit, opties);
  window.addEventListener("wheel", opActiviteit, opties);
  window.addEventListener("pageshow", opActiviteit);
  document.addEventListener("visibilitychange", opZichtbaar);
};

/** Wacht tot de ondernemer iets doet, of tot `signal` afbreekt. */
const wachtOpActiviteit = (signal?: AbortSignal) =>
  new Promise<void>((verder) => {
    const klaar = () => {
      wachtenOpActiviteit.delete(klaar);
      verder();
    };
    wachtenOpActiviteit.add(klaar);
    signal?.addEventListener("abort", klaar, { once: true });
  });

const stopSessieklok = () => {
  sessieLoopt = false;
  clearTimeout(naloop);
  naloop = undefined;
};

/**
 * Voert `taak` uit. Kent het stelsel de sessie niet, dan een nieuwe sessie en
 * nog één keer: de vorige was al weg, dus die zet geen ander tabblad uit.
 */
const metSessie = async <T>(taak: () => Promise<T>): Promise<T> => {
  try {
    const uitkomst = await taak();
    sessieLoopt = true;
    return uitkomst;
  } catch (fout) {
    if (redenVan(fout) !== "sessieVerlopen") throw fout;
  }
  // Misschien zette een ander tabblad het cookie al op een nieuwe sessie.
  if ((await leesSessie()) === "geldig") {
    sessieLoopt = true;
    return taak();
  }
  await startSessie();
  sessieLoopt = true;
  laatstVerlengd = Date.now();
  const uitkomst = await taak();
  return uitkomst;
};

// --- Lijst -------------------------------------------------------------------

const naarBericht = (bericht: KetenLijstBericht): KetenBericht => ({
  id: berichtSleutel(bericht),
  berichtId: bericht.berichtId,
  magazijnId: bericht.magazijnId,
  afzenderId: bericht.magazijnId,
  afzender: bericht.afzenderNaam || "Onbekende afzender",
  onderwerp: bericht.onderwerp || "Bericht zonder onderwerp",
  inhoud: [],
  datum: (bericht.publicatietijdstip ?? "").slice(0, 10),
  tijdstip: bericht.publicatietijdstip ?? "",
  isOngelezen: bericht.status !== "gelezen",
  heeftBijlage: (bericht.aantalBijlagen ?? 0) > 0,
  plek: plekVanMap(bericht.map),
  // Archief en prullenbak zijn een plek, geen map in het overzicht.
  map:
    plekVanMap(bericht.map) === "inbox" ? bericht.map || undefined : undefined,
});

const sorteer = (berichten: KetenBericht[]) =>
  berichten.sort((a, b) => b.tijdstip.localeCompare(a.tijdstip));

// Wat `_volgen` meldt terwijl een lijst onderweg is, staat nog niet in die
// lijst. Zulke events bewaren wij en passen wij na het vervangen opnieuw toe;
// ze zijn idempotent.
let lezingen = 0;
let teHerhalen: Record<string, unknown>[] = [];

const leesLijst = async () => {
  lezingen++;
  try {
    return await haalLijst();
  } catch (fout) {
    // Een mislukte lezing vervangt niets; oude events mogen dan niet bij een
    // veel latere lijst opnieuw meetellen.
    if (lezingen === 1) teHerhalen = [];
    throw fout;
  } finally {
    lezingen--;
  }
};

const zetLijst = (gen: number, { berichten, ...volledigheid }: KetenLijst) => {
  zet(gen, {
    fase: "klaar",
    voortgang: null,
    fout: null,
    volledigheid,
    berichten: sorteer(berichten.map(naarBericht)),
  });
  const herhaal = teHerhalen;
  if (lezingen === 0) teHerhalen = [];
  herhaal.forEach((gebeurtenis) => pasToe(gen, gebeurtenis));
};

/** Een andere pagina of een ander tabblad haalt al op; wacht tot de lijst er is. */
const wachtOpLijst = async () => {
  const einde = Date.now() + WACHT_OP_RONDE_MS;
  for (;;) {
    await new Promise((klaar) => setTimeout(klaar, WACHT_STAP_MS));
    try {
      return await leesLijst();
    } catch (fout) {
      // Geen ronde meer, of die van elders strandde: de aanroeper haalt zelf op.
      if (redenVan(fout) !== "bezig") throw fout;
      if (Date.now() >= einde)
        throw new KetenFout("bezig", "ophaalronde niet op tijd klaar");
    }
  }
};

/** Eén ophaalronde; daarna de lijst, en wat de ronde opleverde. */
const ronde = async (gen: number) => {
  let laatste = LEGE_VOORTGANG;
  await haalOp((voortgang) => {
    laatste = voortgang;
    zet(gen, { voortgang });
  });
  zetLijst(gen, await leesLijst());
  zet(gen, {
    opgehaald: { berichten: laatste.gevonden, organisaties: laatste.bronnen },
  });
};

/** De ophaalronde, met voortgang, en daarna de lijst. */
const rondeEnLijst = async (gen: number) => {
  zet(gen, { fase: "ophalen", voortgang: LEGE_VOORTGANG, fout: null });
  try {
    await ronde(gen);
  } catch (fout) {
    if (redenVan(fout) !== "bezig") throw fout;
    try {
      zetLijst(gen, await wachtOpLijst());
    } catch (elders) {
      // De ronde elders strandde; dan één keer zelf.
      if (redenVan(elders) !== "geenSessie") throw elders;
      await ronde(gen);
    }
  }
};

/** De lijst; is er nog geen ronde geweest of loopt die elders, dan die eerst. */
const lijstOfRonde = async (gen: number) => {
  try {
    zetLijst(gen, await leesLijst());
  } catch (fout) {
    const reden = redenVan(fout);
    if (reden === "geenSessie") return rondeEnLijst(gen);
    if (reden === "bezig") {
      try {
        return zetLijst(gen, await wachtOpLijst());
      } catch (elders) {
        if (redenVan(elders) === "geenSessie") return rondeEnLijst(gen);
        throw elders;
      }
    }
    throw fout;
  }
};

const mislukt = (gen: number, fout: unknown) => {
  console.error("[Berichtenbox] stelsel", redenVan(fout), fout);
  if (redenVan(fout) === "sessieVerlopen") stopSessieklok();
  zet(gen, {
    fase: "fout",
    voortgang: null,
    fout: redenVan(fout),
    verlopen: false,
    herstelt: false,
  });
};

/**
 * Leest de lijst. Is er nog geen ophaalronde geweest, dan draait die, maar
 * alleen als `ophalen` aan staat: de teller in het menu laat dat aan de
 * berichtenbox over.
 */
const laad = async (ontvanger: string, ophalen: boolean) => {
  if (staat.ontvanger !== ontvanger) {
    generatie++;
    stopVolgen();
    stopSessieklok();
    staat = { ...LEEG, ontvanger };
    bezig = null;
    herstelBezig = null;
    herstelPogingen = 0;
    teHerhalen = [];
  }
  const gen = generatie;
  if (bezig) await bezig;
  if (gen !== generatie || staat.fase === "klaar" || staat.fase === "fout")
    return;

  const taak = (async () => {
    zet(gen, { fase: "laden", fout: null });
    if (ophalen) return metSessie(() => lijstOfRonde(gen));
    try {
      zetLijst(gen, await metSessie(leesLijst));
    } catch (fout) {
      const reden = redenVan(fout);
      if (reden !== "geenSessie" && reden !== "bezig") throw fout;
      zet(gen, { fase: "leeg" });
    }
  })()
    .catch((fout: unknown) => mislukt(gen, fout))
    .finally(() => {
      if (bezig === taak) bezig = null;
    });
  bezig = taak;
  await taak;
};

/**
 * De lijst weer op orde brengen, in de sessie die er is. Pas als het stelsel
 * die niet kent, komt er een nieuwe. `opnieuwOphalen`: ook als de lijst er
 * is, een nieuwe ronde bij alle organisaties.
 */
const herstel = (opnieuwOphalen = false) => {
  const gen = generatie;
  // Vooraf lezen: tijdens de ronde zakt `volgers` naar 0, en een herhaling in
  // metSessie zou anders de ronde overslaan.
  const metBox = volgers > 0;
  herstelBezig ??= (async () => {
    stopVolgen();
    zet(gen, { volgenGestopt: false, herstelt: true });
    try {
      // Zonder open berichtenbox (alleen de teller) geen ronde bij alle
      // organisaties: dat laat de teller aan de berichtenbox over. Is er nog
      // geen lijst, dan haalt de berichtenbox bij het openen zelf op.
      await metSessie(() =>
        !metBox
          ? leesLijst().then(
              (lijst) => zetLijst(gen, lijst),
              (fout: unknown) => {
                const reden = redenVan(fout);
                if (reden !== "geenSessie" && reden !== "bezig") throw fout;
                zet(gen, { fase: "leeg", berichten: [], volledigheid: null });
              },
            )
          : opnieuwOphalen
            ? rondeEnLijst(gen)
            : lijstOfRonde(gen),
      );
      zet(gen, { verlopen: false, herstelt: false });
      startVolgen();
    } catch (fout) {
      mislukt(gen, fout);
    }
  })().finally(() => {
    if (gen === generatie) herstelBezig = null;
  });
  return herstelBezig;
};

/** Doet `taak` als de ondernemer net iets deed; anders bij zijn volgende actie. */
const bijActiviteit = (taak: () => void) => {
  if (isActief()) return taak();
  const gen = generatie;
  void wachtOpActiviteit().then(() => {
    if (gen === generatie) taak();
  });
};

/**
 * Het stelsel kent de sessie niet meer. Misschien startte een ander tabblad al
 * een nieuwe; die gebruiken wij dan. Anders: deed de ondernemer net nog iets,
 * dan halen wij meteen opnieuw op; zo niet, dan zeggen wij dat, en pas bij zijn
 * volgende actie komt er een nieuwe sessie.
 */
function sessieVerlopen() {
  if (herstelBezig) return;
  const gen = generatie;
  stopSessieklok();
  stopVolgen();
  void leesSessie().then((stand) => {
    if (gen !== generatie) return;
    if (stand === "geldig") {
      sessieLoopt = true;
      startVolgen();
      return;
    }
    if (isActief() && herstelPogingen < HERSTEL_LIMIET) {
      herstelPogingen++;
      void herstel();
      return;
    }
    zet(gen, { verlopen: true });
    // Na de limiet altijd op een nieuwe actie wachten, ook als de laatste
    // nog geen minuut oud is; anders blijft een tegenstrijdig stelsel rondgaan.
    void wachtOpActiviteit().then(() => {
      if (gen !== generatie) return;
      herstelPogingen = 0;
      void herstel();
    });
  });
}

/** Opnieuw ophalen bij alle organisaties, op verzoek van de ondernemer. */
export const haalOpnieuwOp = () => {
  herstelPogingen = 0;
  return herstel(!staat.verlopen);
};

// --- Volgen ------------------------------------------------------------------
//
// Zolang de berichtenbox openstaat, meldt het stelsel zelf een nieuw, gewijzigd
// of verwijderd bericht (`_volgen`). Lukt dat niet, dan vragen we periodiek de
// lijst op. Een lijst lezen verlengt de sessie, dus dat gebeurt alleen als de
// ondernemer de afgelopen minuut iets deed; anders wachten we op hem.

// Blijft het 45 seconden stil (twee gemiste hartslagen), dan is de verbinding weg.
const VOLG_WAAKHOND_MS = 45000;
// Wachttijd voor opnieuw verbinden, oplopend per poging, met wat spreiding.
const VOLG_TUSSENPOZEN_SEC = [1, 2, 5, 10, 30];
const VOLG_FOUT_LIMIET = 3;
const VOLG_MAX_WACHT_MS = 60000;
const POLL_ZICHTBAAR_MS = 15000;
const POLL_VERBORGEN_MS = 60000;
const POLL_FOUT_LIMIET = 3;
// Na een terugval de stroom na vijf minuten opnieuw proberen: drie mislukte
// verbindingen zijn vaker een wifi-wissel dan een stelsel dat niet kan volgen.
const VOLG_HERKANSING_MS = 5 * 60 * 1000;

let volgers = 0;
let volgAfbreker: AbortController | null = null;
let stopKlok: ReturnType<typeof setTimeout> | undefined;
// Er wacht al een herlezing op de volgende actie van de ondernemer.
let herlezingWacht = false;

const slaap = (ms: number, signal: AbortSignal) =>
  new Promise<void>((klaar) => {
    const klok = setTimeout(klaar, ms);
    signal.addEventListener(
      "abort",
      () => {
        clearTimeout(klok);
        klaar();
      },
      { once: true },
    );
  });

const sleutelUit = (gebeurtenis: Record<string, unknown>) => {
  const { magazijnId, berichtId } = gebeurtenis;
  return typeof magazijnId === "string" && typeof berichtId === "string"
    ? berichtSleutel({ magazijnId, berichtId })
    : null;
};

const voegToe = (gen: number, ruw: unknown) => {
  if (!isLeesbaar(ruw)) return;
  const nieuw = naarBericht(ruw);
  if (staat.berichten.some((b) => b.id === nieuw.id)) return;
  zet(gen, {
    berichten: sorteer([nieuw, ...staat.berichten]),
    nieuw: { id: nieuw.id, afzender: nieuw.afzender },
  });
};

/** In dit of een ander tabblad veranderde de map of de leesstatus. */
const werkBij = (gen: number, gebeurtenis: Record<string, unknown>) => {
  const id = sleutelUit(gebeurtenis);
  if (!id) return;
  const map = typeof gebeurtenis.map === "string" ? gebeurtenis.map : undefined;
  const plek = plekVanMap(map);
  zet(gen, {
    berichten: staat.berichten.map((b) =>
      b.id !== id
        ? b
        : {
            ...b,
            plek,
            map: plek === "inbox" ? map : undefined,
            isOngelezen:
              gebeurtenis.status === "gelezen"
                ? false
                : gebeurtenis.status === "ongelezen"
                  ? true
                  : b.isOngelezen,
          },
    ),
  });
};

const haalWeg = (gen: number, gebeurtenis: Record<string, unknown>) => {
  const id = sleutelUit(gebeurtenis);
  if (!id) return;
  zet(gen, { berichten: staat.berichten.filter((b) => b.id !== id) });
};

function pasToe(gen: number, gebeurtenis: Record<string, unknown>) {
  if (gebeurtenis.event === "bericht-bijgekomen")
    voegToe(gen, gebeurtenis.bericht);
  if (gebeurtenis.event === "bericht-gewijzigd") werkBij(gen, gebeurtenis);
  if (gebeurtenis.event === "bericht-verwijderd") haalWeg(gen, gebeurtenis);
}

/** Vervangt de lijst door wat het stelsel nu heeft, en meldt wat er bij kwam. */
const werkLijstBij = (gen: number, lijst: KetenLijst) => {
  const bekend = new Set(staat.berichten.map((b) => b.id));
  const bijgekomen = lijst.berichten.filter(
    (b) => !bekend.has(berichtSleutel(b)),
  );
  zetLijst(gen, lijst);
  const laatste = bijgekomen[0];
  if (laatste)
    zet(gen, {
      nieuw: {
        id: berichtSleutel(laatste),
        afzender: laatste.afzenderNaam || "Onbekende afzender",
      },
    });
};

/**
 * Na (her)verbinden de lijst opnieuw lezen: wat er intussen binnenkwam, staat
 * nog niet in beeld. Deed de ondernemer net niets, dan bij zijn volgende actie.
 * Hoogstens één herlezing wacht; een volgende verbinding voegt er geen toe.
 */
const ververs = async (gen: number, signal: AbortSignal) => {
  if (herlezingWacht) return;
  herlezingWacht = true;
  try {
    if (!isActief()) await wachtOpActiviteit(signal);
    if (signal.aborted || gen !== generatie) return;
    const lijst = await leesLijst();
    if (signal.aborted || herstelBezig) return;
    werkLijstBij(gen, lijst);
  } catch (fout) {
    const reden = redenVan(fout);
    if (reden === "sessieVerlopen") return sessieVerlopen();
    if (reden === "geenSessie") return bijActiviteit(() => void herstel(true));
    // Loopt er elders een ronde, of hapert het stelsel, dan bij de volgende
    // verbinding of actie opnieuw.
    console.warn("[Berichtenbox] lijst bijwerken niet gelukt", reden);
  } finally {
    herlezingWacht = false;
  }
};

/**
 * Terugval: periodiek de lijst opvragen, tot `duurMs` om is. Geeft false als
 * het opgaf; dan komen er geen berichten meer vanzelf binnen.
 */
const poll = async (gen: number, signal: AbortSignal, duurMs = Infinity) => {
  const einde = Date.now() + duurMs;
  let fouten = 0;
  while (!signal.aborted && Date.now() < einde) {
    await slaap(
      document.hidden ? POLL_VERBORGEN_MS : POLL_ZICHTBAAR_MS,
      signal,
    );
    if (!isActief()) await wachtOpActiviteit(signal);
    if (signal.aborted) return;
    try {
      const lijst = await leesLijst();
      if (signal.aborted || herstelBezig) return;
      werkLijstBij(gen, lijst);
      fouten = 0;
    } catch (fout) {
      const reden = redenVan(fout);
      if (reden === "sessieVerlopen") {
        sessieVerlopen();
        return false;
      }
      if (reden === "geenSessie") {
        bijActiviteit(() => void herstel(true));
        return false;
      }
      if (reden === "bezig") continue;
      if (++fouten >= POLL_FOUT_LIMIET) {
        zet(gen, { volgenGestopt: true });
        return false;
      }
    }
  }
  return true;
};

const volgLus = async (gen: number, signal: AbortSignal) => {
  let mislukt = 0;
  let poging = 0;
  while (!signal.aborted) {
    const verbinding = new AbortController();
    const stop = () => verbinding.abort();
    signal.addEventListener("abort", stop);
    let waakhond: ReturnType<typeof setTimeout> | undefined;
    const leeft = () => {
      clearTimeout(waakhond);
      waakhond = setTimeout(stop, VOLG_WAAKHOND_MS);
    };
    leeft();

    const { einde, gezond, wachtMs } = await volg(
      verbinding.signal,
      leeft,
      (gebeurtenis) => {
        if (gebeurtenis.event === "volgen-gestart")
          return void ververs(gen, signal);
        pasToe(gen, gebeurtenis);
        if (lezingen > 0) teHerhalen.push(gebeurtenis);
      },
    );
    clearTimeout(waakhond);
    signal.removeEventListener("abort", stop);
    if (signal.aborted) return;

    // Niet vanzelf opnieuw verbinden: de sessie is weg.
    if (einde === "verlopen") return sessieVerlopen();
    // Er is nog geen ronde in deze sessie.
    if (einde === "conflict") return bijActiviteit(() => void herstel(true));
    // Dit stelsel kent volgen niet: alleen nog navragen.
    if (einde === "ontbreekt") return void (await poll(gen, signal));
    if (gezond) {
      mislukt = 0;
      poging = 0;
      herstelPogingen = 0;
    } else if (einde !== "bezig" && ++mislukt >= VOLG_FOUT_LIMIET) {
      if (!(await poll(gen, signal, VOLG_HERKANSING_MS))) return;
      mislukt = 0;
      poging = 0;
      continue;
    }

    const basis =
      VOLG_TUSSENPOZEN_SEC[
        Math.min(poging++, VOLG_TUSSENPOZEN_SEC.length - 1)
      ] * 1000;
    const spreiding = 1 + (Math.random() * 2 - 1) * 0.2;
    await slaap(
      Math.min(Math.max(basis * spreiding, wachtMs ?? 0), VOLG_MAX_WACHT_MS),
      signal,
    );
  }
};

function startVolgen() {
  clearTimeout(stopKlok);
  if (volgAfbreker || staat.fase !== "klaar" || volgers === 0) return;
  volgAfbreker = new AbortController();
  void volgLus(generatie, volgAfbreker.signal);
}

function stopVolgen() {
  clearTimeout(stopKlok);
  volgAfbreker?.abort();
  volgAfbreker = null;
}

const SERVER: KetenStaat = LEEG;

/**
 * @param ontvanger Null voor een persona die niet is aangesloten.
 * @param ophalen   Zonder ophaalronde er een starten.
 */
export const useKeten = (ontvanger: string | null, ophalen = true) => {
  const huidig = useSyncExternalStore(
    subscribe,
    () => staat,
    () => SERVER,
  );
  const pad = usePathname();

  // Naar een andere pagina gaan is ook iets wat de ondernemer doet.
  useEffect(() => {
    if (!ontvanger) return stopSessieklok();
    luisterNaarActiviteit();
    opActiviteit();
  }, [ontvanger, pad]);

  useEffect(() => {
    if (ontvanger) void laad(ontvanger, ophalen);
  }, [ontvanger, ophalen]);

  const vanDeze = ontvanger && huidig.ontvanger === ontvanger;
  const klaar = vanDeze && huidig.fase === "klaar";

  // Alleen de berichtenbox volgt; de teller in het menu kijkt mee. Even
  // wachten met stoppen, zodat wisselen van tabblad de verbinding niet breekt.
  useEffect(() => {
    if (!klaar || !ophalen) return;
    volgers++;
    startVolgen();
    return () => {
      volgers--;
      clearTimeout(stopKlok);
      stopKlok = setTimeout(() => {
        if (volgers === 0) stopVolgen();
      }, 2000);
    };
  }, [klaar, ophalen]);

  return {
    fase: vanDeze ? huidig.fase : ("laden" as Fase),
    berichten: vanDeze ? huidig.berichten : [],
    voortgang: vanDeze ? huidig.voortgang : null,
    fout: vanDeze ? huidig.fout : null,
    volledigheid: vanDeze ? huidig.volledigheid : null,
    verlopen: vanDeze ? huidig.verlopen : false,
    herstelt: vanDeze ? huidig.herstelt : false,
    opgehaald: vanDeze ? huidig.opgehaald : null,
    nieuw: vanDeze ? huidig.nieuw : null,
    volgenGestopt: vanDeze ? huidig.volgenGestopt : false,
  };
};

const zoek = (id: string) => staat.berichten.find((b) => b.id === id);

/**
 * Een verzoek over één bericht. Kent het stelsel de sessie of de ronde niet
 * meer, dan eerst herstellen en dan nog één keer: de ondernemer vroeg er zelf
 * om. Lukt het herstel niet, dan die fout.
 */
const metHerstel = async <T>(taak: () => Promise<T>): Promise<T> => {
  try {
    return await taak();
  } catch (fout) {
    const reden = redenVan(fout);
    if (reden !== "sessieVerlopen" && reden !== "geenSessie") throw fout;
  }
  herstelPogingen = 0;
  await herstel();
  if (staat.fase === "fout" && staat.fout)
    throw new KetenFout(staat.fout, "herstel mislukt");
  return taak();
};

/** De inhoud en bijlagen van een bericht, bij de organisatie die het stuurde. */
export const haalKetenInhoud = (bericht: KetenBericht): Promise<KetenInhoud> =>
  metHerstel(() => haalInhoud(bericht.berichtId, bericht.magazijnId));

/** Geeft null als het lukte, anders de tekst voor de gebruiker. */
export const verplaatsKetenBericht = async (
  id: string,
  plek: Weergave,
): Promise<string | null> => {
  const bericht = zoek(id);
  if (!bericht) return ketenFoutTekst.weg;
  const gen = generatie;
  try {
    await metHerstel(() =>
      verplaatsBericht(bericht.berichtId, bericht.magazijnId, plek),
    );
  } catch (fout) {
    return wijzigingMislukt(gen, fout, id, WAT_PER_PLEK[plek]);
  }
  zet(gen, {
    berichten: staat.berichten.map((b) => (b.id === id ? { ...b, plek } : b)),
  });
  return null;
};

/** Zet een bericht in een map bij het stelsel; een lege naam haalt het eruit. */
export const zetKetenMap = async (
  id: string,
  map: string,
): Promise<string | null> => {
  const bericht = zoek(id);
  if (!bericht) return ketenFoutTekst.weg;
  const gen = generatie;
  try {
    await metHerstel(() => zetMap(bericht.berichtId, bericht.magazijnId, map));
  } catch (fout) {
    return wijzigingMislukt(
      gen,
      fout,
      id,
      map ? `in de map ${map} zetten` : "uit de map halen",
    );
  }
  zet(gen, {
    berichten: staat.berichten.map((b) =>
      b.id === id ? { ...b, map: map || undefined } : b,
    ),
  });
  return null;
};

export const verwijderKetenBerichtVoorgoed = async (
  id: string,
): Promise<string | null> => {
  const bericht = zoek(id);
  if (!bericht) return ketenFoutTekst.weg;
  const gen = generatie;
  try {
    await metHerstel(() =>
      verwijderBericht(bericht.berichtId, bericht.magazijnId),
    );
  } catch (fout) {
    return wijzigingMislukt(gen, fout, id, "voorgoed verwijderen");
  }
  zet(gen, { berichten: staat.berichten.filter((b) => b.id !== id) });
  return null;
};

const WAT_PER_PLEK: Record<Weergave, string> = {
  inbox: "terugzetten naar Ontvangen",
  archief: "archiveren",
  prullenbak: "naar de prullenbak verplaatsen",
};

const wijzigingMislukt = (
  gen: number,
  fout: unknown,
  id: string,
  wat: string,
) => {
  const reden = redenVan(fout);
  if (reden === "weg") {
    zet(gen, { berichten: staat.berichten.filter((b) => b.id !== id) });
    return ketenFoutTekst.weg;
  }
  if (reden === "tijdelijk")
    return `Wij kunnen dit bericht nu niet ${wat}. Probeer het over een minuut opnieuw.`;
  if (reden === "teVeelSessies" || reden === "sessieVerlopen")
    return ketenFoutTekst[reden];
  return `Wij kunnen dit bericht nu niet ${wat}. Probeer het later opnieuw.`;
};

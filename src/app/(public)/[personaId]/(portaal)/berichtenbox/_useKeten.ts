"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import type { DemoBericht } from "@/demo";
import {
  berichtSleutel,
  haalInhoud,
  haalLijst,
  haalOp,
  KetenFout,
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
 * berichtenbox op een onbeheerde werkplek laat haar verlopen.
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
  /** Laatst binnengekomen bericht, voor de melding aan schermlezers. */
  nieuw: { id: string; afzender: string } | null;
  /** Nieuwe berichten komen niet meer vanzelf binnen. */
  volgenGestopt: boolean;
};

export const ketenFoutTekst: Record<KetenFoutReden, string> = {
  onbereikbaar:
    "Het ophalen van uw berichten is niet gelukt. Ververs de pagina om het opnieuw te proberen.",
  bezig:
    "Wij halen uw berichten op dit moment al op. Wacht 2 minuten en ververs dan de pagina.",
  afgebroken:
    "Het ophalen van uw berichten is halverwege gestopt. Daardoor ziet u niet al uw berichten. Ververs de pagina om het opnieuw te proberen.",
  geenSessie:
    "Uw berichten staan niet meer klaar. Ververs de pagina, dan halen wij ze opnieuw op.",
  sessieVerlopen:
    "Uw sessie is verlopen. Ververs de pagina, dan halen wij uw berichten opnieuw op.",
  teVeelSessies:
    "U bent op te veel plekken tegelijk ingelogd. Log uit in een ander tabblad of venster en ververs dan deze pagina. Of wacht een kwartier: dan vervalt een sessie die u niet meer gebruikt.",
  tijdelijk:
    "Wij kunnen dit nu even niet ophalen. Probeer het over een minuut opnieuw.",
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
  nieuw: null,
  volgenGestopt: false,
};

let staat = LEEG;
let bezig: Promise<void> | null = null;
const luisteraars = new Set<() => void>();

const zet = (wijziging: Partial<KetenStaat>) => {
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
// open stroom telt niet. Verlengen gebeurt hoogstens eens per minuut.

const ACTIEF_MS = 60000;
const VERLENG_MS = 60000;
// Hoe vaak een verlopen sessie vanzelf terug mag komen, zonder dat de
// ondernemer erom vraagt.
const HERSTEL_LIMIET = 2;

let laatsteActiviteit = 0;
let laatstVerlengd = 0;
let sessieLoopt = false;
let herstelPogingen = 0;
let herstelBezig: Promise<void> | null = null;
let luistertNaarActiviteit = false;
const wachtenOpActiviteit = new Set<() => void>();

const isActief = () => Date.now() - laatsteActiviteit < ACTIEF_MS;

const opActiviteit = () => {
  laatsteActiviteit = Date.now();
  const wachtenden = [...wachtenOpActiviteit];
  wachtenOpActiviteit.clear();
  wachtenden.forEach((verder) => verder());
  if (!sessieLoopt || laatsteActiviteit - laatstVerlengd < VERLENG_MS) return;
  laatstVerlengd = laatsteActiviteit;
  void verlengSessie().then((geldig) => {
    if (!geldig) sessieVerlopen();
  });
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

const sessieGestart = () => {
  sessieLoopt = true;
  laatstVerlengd = Date.now();
};

/** Voert `taak` uit; kent het stelsel geen sessie, dan eerst een nieuwe. */
const metSessie = async <T>(taak: () => Promise<T>): Promise<T> => {
  try {
    const uitkomst = await taak();
    sessieLoopt = true;
    return uitkomst;
  } catch (fout) {
    if (redenVan(fout) !== "sessieVerlopen") throw fout;
  }
  await startSessie();
  sessieGestart();
  return taak();
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

const zetLijst = ({ berichten, ...volledigheid }: KetenLijst) =>
  zet({
    fase: "klaar",
    voortgang: null,
    fout: null,
    volledigheid,
    berichten: sorteer(berichten.map(naarBericht)),
  });

/** Een andere pagina haalt al op; wacht tot de lijst er is. */
const wachtOpLijst = async () => {
  const einde = Date.now() + WACHT_OP_RONDE_MS;
  for (;;) {
    await new Promise((klaar) => setTimeout(klaar, WACHT_STAP_MS));
    try {
      return await haalLijst();
    } catch (fout) {
      if (redenVan(fout) !== "geenSessie") throw fout;
      if (Date.now() >= einde)
        throw new KetenFout("bezig", "ophaalronde niet op tijd klaar");
    }
  }
};

/** De ophaalronde, met voortgang, en daarna de lijst. */
const rondeEnLijst = async () => {
  zet({ fase: "ophalen", voortgang: LEGE_VOORTGANG, fout: null });
  try {
    await haalOp((voortgang) => zet({ voortgang }));
    zetLijst(await haalLijst());
  } catch (fout) {
    if (redenVan(fout) !== "bezig") throw fout;
    zetLijst(await wachtOpLijst());
  }
};

const mislukt = (fout: unknown) => {
  console.error("[Berichtenbox] stelsel", redenVan(fout));
  if (redenVan(fout) === "sessieVerlopen") sessieLoopt = false;
  zet({ fase: "fout", voortgang: null, fout: redenVan(fout) });
};

/**
 * Leest de lijst. Is er nog geen ophaalronde geweest, dan draait die, maar
 * alleen als `ophalen` aan staat: de teller in het menu laat dat aan de
 * berichtenbox over.
 */
const laad = async (ontvanger: string, ophalen: boolean) => {
  if (staat.ontvanger !== ontvanger) {
    stopVolgen();
    staat = { ...LEEG, ontvanger };
    bezig = null;
    sessieLoopt = false;
    herstelPogingen = 0;
  }
  if (bezig) await bezig;
  if (staat.fase === "klaar" || staat.fase === "fout") return;

  bezig = (async () => {
    zet({ fase: "laden", fout: null });
    try {
      zetLijst(await metSessie(haalLijst));
      return;
    } catch (fout) {
      if (redenVan(fout) !== "geenSessie") throw fout;
      if (!ophalen) {
        zet({ fase: "leeg" });
        return;
      }
    }
    await rondeEnLijst();
  })()
    .catch(mislukt)
    .finally(() => {
      bezig = null;
    });
  await bezig;
};

/**
 * Een nieuwe sessie en een nieuwe ophaalronde. Een vorige sessie van deze
 * browser stopt eerst; is dat de laatste sessie van deze ondernemer, dan begint
 * het stelsel met een lege lijst.
 */
const herstel = () => {
  herstelBezig ??= (async () => {
    stopVolgen();
    zet({ verlopen: false, volgenGestopt: false });
    try {
      await startSessie();
      sessieGestart();
      await rondeEnLijst();
      startVolgen();
    } catch (fout) {
      mislukt(fout);
    }
  })().finally(() => {
    herstelBezig = null;
  });
  return herstelBezig;
};

/**
 * Het stelsel kent de sessie niet meer. Deed de ondernemer net nog iets, dan
 * halen wij meteen opnieuw op. Anders zeggen wij dat de sessie verlopen is, en
 * pas bij zijn volgende actie komt er een nieuwe sessie.
 */
function sessieVerlopen() {
  if (!sessieLoopt && staat.verlopen) return;
  sessieLoopt = false;
  stopVolgen();
  if (isActief() && herstelPogingen < HERSTEL_LIMIET) {
    herstelPogingen++;
    void herstel();
    return;
  }
  zet({ verlopen: true });
  void wachtOpActiviteit().then(() => {
    if (!staat.verlopen) return;
    herstelPogingen = 0;
    void herstel();
  });
}

/** Opnieuw ophalen op verzoek van de ondernemer. */
export const haalOpnieuwOp = () => {
  herstelPogingen = 0;
  return herstel();
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

const voegToe = (ruw: unknown) => {
  const bericht = ruw as KetenLijstBericht | undefined;
  if (!bericht?.berichtId || !bericht.magazijnId) return;
  const nieuw = naarBericht(bericht);
  if (staat.berichten.some((b) => b.id === nieuw.id)) return;
  zet({
    berichten: sorteer([nieuw, ...staat.berichten]),
    nieuw: { id: nieuw.id, afzender: nieuw.afzender },
  });
};

/** In dit of een ander tabblad veranderde de map of de leesstatus. */
const werkBij = (gebeurtenis: Record<string, unknown>) => {
  const { magazijnId, berichtId } = gebeurtenis;
  if (typeof magazijnId !== "string" || typeof berichtId !== "string") return;
  const id = berichtSleutel({ magazijnId, berichtId });
  const map = typeof gebeurtenis.map === "string" ? gebeurtenis.map : undefined;
  const plek = plekVanMap(map);
  zet({
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

const haalWeg = (gebeurtenis: Record<string, unknown>) => {
  const { magazijnId, berichtId } = gebeurtenis;
  if (typeof magazijnId !== "string" || typeof berichtId !== "string") return;
  const id = berichtSleutel({ magazijnId, berichtId });
  zet({ berichten: staat.berichten.filter((b) => b.id !== id) });
};

/** Vervangt de lijst door wat het stelsel nu heeft, en meldt wat er bij kwam. */
const werkLijstBij = (lijst: KetenLijst) => {
  const bekend = new Set(staat.berichten.map((b) => b.id));
  const bijgekomen = lijst.berichten.filter(
    (b) => !bekend.has(berichtSleutel(b)),
  );
  zetLijst(lijst);
  const laatste = bijgekomen[0];
  if (laatste)
    zet({
      nieuw: {
        id: berichtSleutel(laatste),
        afzender: laatste.afzenderNaam || "Onbekende afzender",
      },
    });
};

/** De lijst opnieuw lezen, als de ondernemer iets deed; anders erop wachten. */
const ververs = async (signal: AbortSignal) => {
  if (!isActief()) await wachtOpActiviteit(signal);
  if (signal.aborted) return;
  try {
    werkLijstBij(await haalLijst());
  } catch (fout) {
    const reden = redenVan(fout);
    if (reden === "sessieVerlopen" || reden === "geenSessie") sessieVerlopen();
  }
};

/**
 * Terugval: periodiek de lijst opvragen, tot `duurMs` om is. Geeft false als
 * het opgaf; dan komen er geen berichten meer vanzelf binnen.
 */
const poll = async (signal: AbortSignal, duurMs = Infinity) => {
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
      werkLijstBij(await haalLijst());
      fouten = 0;
    } catch (fout) {
      const reden = redenVan(fout);
      if (reden === "sessieVerlopen" || reden === "geenSessie") {
        sessieVerlopen();
        return false;
      }
      if (++fouten >= POLL_FOUT_LIMIET) {
        zet({ volgenGestopt: true });
        return false;
      }
    }
  }
  return true;
};

const volgLus = async (signal: AbortSignal) => {
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
        if (gebeurtenis.event === "volgen-gestart") void ververs(signal);
        if (gebeurtenis.event === "bericht-bijgekomen")
          voegToe(gebeurtenis.bericht);
        if (gebeurtenis.event === "bericht-gewijzigd") werkBij(gebeurtenis);
        if (gebeurtenis.event === "bericht-verwijderd") haalWeg(gebeurtenis);
      },
    );
    clearTimeout(waakhond);
    signal.removeEventListener("abort", stop);
    if (signal.aborted) return;

    // Niet vanzelf opnieuw verbinden: de sessie is weg.
    if (einde === "verlopen" || einde === "conflict") return sessieVerlopen();
    // Dit stelsel kent volgen niet: alleen nog navragen.
    if (einde === "ontbreekt") return void (await poll(signal));
    if (gezond) {
      mislukt = 0;
      poging = 0;
      herstelPogingen = 0;
    } else if (++mislukt >= VOLG_FOUT_LIMIET) {
      if (!(await poll(signal, VOLG_HERKANSING_MS))) return;
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
  void volgLus(volgAfbreker.signal);
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
    if (!ontvanger) return;
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
    nieuw: vanDeze ? huidig.nieuw : null,
    volgenGestopt: vanDeze ? huidig.volgenGestopt : false,
  };
};

const zoek = (id: string) => staat.berichten.find((b) => b.id === id);

/**
 * Een verzoek over één bericht. Kent het stelsel de sessie niet meer, dan eerst
 * een nieuwe sessie en ophaalronde, en dan nog één keer: de ondernemer vroeg er
 * zelf om.
 */
const wijzigMetSessie = async (taak: () => Promise<void>) => {
  try {
    await taak();
  } catch (fout) {
    const reden = redenVan(fout);
    if (reden !== "sessieVerlopen" && reden !== "geenSessie") throw fout;
    herstelPogingen = 0;
    await herstel();
    await taak();
  }
};

/** De inhoud en bijlagen van een bericht, bij de organisatie die het stuurde. */
export const haalKetenInhoud = async (
  bericht: KetenBericht,
): Promise<KetenInhoud> => {
  let inhoud: KetenInhoud | undefined;
  await wijzigMetSessie(async () => {
    inhoud = await haalInhoud(bericht.berichtId, bericht.magazijnId);
  });
  return inhoud!;
};

/** Geeft null als het lukte, anders de tekst voor de gebruiker. */
export const verplaatsKetenBericht = async (
  id: string,
  plek: Weergave,
): Promise<string | null> => {
  const bericht = zoek(id);
  if (!bericht) return ketenFoutTekst.weg;
  try {
    await wijzigMetSessie(() =>
      verplaatsBericht(bericht.berichtId, bericht.magazijnId, plek),
    );
  } catch (fout) {
    return wijzigingMislukt(fout, id, WAT_PER_PLEK[plek]);
  }
  zet({
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
  try {
    await wijzigMetSessie(() =>
      zetMap(bericht.berichtId, bericht.magazijnId, map),
    );
  } catch (fout) {
    return wijzigingMislukt(
      fout,
      id,
      map ? "in de map te zetten" : "uit de map te halen",
    );
  }
  zet({
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
  try {
    await wijzigMetSessie(() =>
      verwijderBericht(bericht.berichtId, bericht.magazijnId),
    );
  } catch (fout) {
    return wijzigingMislukt(fout, id, "voorgoed te verwijderen");
  }
  zet({ berichten: staat.berichten.filter((b) => b.id !== id) });
  return null;
};

const WAT_PER_PLEK: Record<Weergave, string> = {
  inbox: "terug te zetten naar Ontvangen",
  archief: "te archiveren",
  prullenbak: "naar de prullenbak te verplaatsen",
};

const wijzigingMislukt = (fout: unknown, id: string, wat: string) => {
  if (redenVan(fout) === "weg") {
    zet({ berichten: staat.berichten.filter((b) => b.id !== id) });
    return ketenFoutTekst.weg;
  }
  if (redenVan(fout) === "tijdelijk")
    return `Het is nu even niet gelukt om dit bericht ${wat}. Probeer het over een minuut opnieuw.`;
  return `Het is niet gelukt om dit bericht ${wat}. Probeer het opnieuw.`;
};

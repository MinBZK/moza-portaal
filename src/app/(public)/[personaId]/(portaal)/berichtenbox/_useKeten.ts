"use client";

import { useEffect, useSyncExternalStore } from "react";
import type { DemoBericht } from "@/demo";
import {
  haalLijst,
  haalOp,
  KetenFout,
  plekVanMap,
  verplaatsBericht,
  verwijderBericht,
  volg,
  type KetenFoutReden,
  type KetenLijstBericht,
  type KetenVoortgang,
} from "@/network/keten/client";
import type { Weergave } from "./_useBerichtenboxState";

/**
 * De berichten van een aangesloten persona, uit het Federatief
 * Berichtenstelsel. Eén keer per paginabezoek opgehaald en gedeeld door de
 * lijst, de tabbladen en de teller in het menu. Waar een bericht staat (inbox,
 * archief, prullenbak) bepaalt het stelsel; gelezen en gemarkeerd blijven in
 * deze browser, net als bij de demo-berichten.
 */

export type KetenBericht = DemoBericht & {
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
  /** Laatst binnengekomen bericht, voor de melding aan schermlezers. */
  nieuw: { id: string; afzender: string } | null;
  /** Nieuwe berichten komen niet meer vanzelf binnen. */
  volgenGestopt: boolean;
};

export const ketenFoutTekst: Record<KetenFoutReden, string> = {
  onbereikbaar:
    "Het ophalen van uw berichten is niet gelukt. Ververs de pagina om het opnieuw te proberen.",
  bezig:
    "Uw berichten worden op dit moment al opgehaald. Wacht 2 minuten en ververs dan de pagina.",
  afgebroken:
    "Het ophalen van uw berichten is halverwege gestopt. Daardoor ziet u niet al uw berichten. Ververs de pagina om het opnieuw te proberen.",
  geenSessie:
    "Uw berichten staan niet meer klaar. Ververs de pagina, dan halen wij ze opnieuw op.",
  weg: "Dit bericht bestaat niet meer. Het staat daarom niet meer in de lijst.",
};

const WACHT_OP_RONDE_MS = 45000;
const WACHT_STAP_MS = 1500;

const LEEG: KetenStaat = {
  ontvanger: null,
  fase: "leeg",
  berichten: [],
  voortgang: null,
  fout: null,
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

const naarBericht = (bericht: KetenLijstBericht): KetenBericht => ({
  id: bericht.berichtId,
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
});

const zetLijst = (lijst: KetenLijstBericht[]) =>
  zet({
    fase: "klaar",
    voortgang: null,
    berichten: lijst
      .map(naarBericht)
      .sort((a, b) => b.tijdstip.localeCompare(a.tijdstip)),
  });

const redenVan = (fout: unknown): KetenFoutReden =>
  fout instanceof KetenFout ? fout.reden : "onbereikbaar";

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

/**
 * Leest de lijst. Is er nog geen sessie, dan draait de ophaalronde, maar
 * alleen als `ophalen` aan staat: de teller in het menu laat dat aan de
 * berichtenbox over.
 */
const laad = async (ontvanger: string, ophalen: boolean) => {
  if (staat.ontvanger !== ontvanger) {
    stopVolgen();
    staat = { ...LEEG, ontvanger };
    bezig = null;
  }
  if (bezig) await bezig;
  if (staat.fase === "klaar" || staat.fase === "fout") return;

  bezig = (async () => {
    zet({ fase: "laden", fout: null });
    try {
      zetLijst(await haalLijst());
      return;
    } catch (fout) {
      if (redenVan(fout) !== "geenSessie") throw fout;
      if (!ophalen) {
        zet({ fase: "leeg" });
        return;
      }
    }
    zet({ fase: "ophalen", voortgang: { bronnen: 0, klaar: 0, gevonden: 0 } });
    try {
      await haalOp((voortgang) => zet({ voortgang }));
      zetLijst(await haalLijst());
    } catch (fout) {
      if (redenVan(fout) !== "bezig") throw fout;
      zetLijst(await wachtOpLijst());
    }
  })()
    .catch((fout: unknown) => {
      console.error("[Berichtenbox] stelsel", fout);
      zet({ fase: "fout", voortgang: null, fout: redenVan(fout) });
    })
    .finally(() => {
      bezig = null;
    });
  await bezig;
};

// --- Volgen ----------------------------------------------------------------
//
// Zolang de berichtenbox openstaat, meldt het stelsel zelf een nieuw bericht
// (`_volgen`). Lukt dat niet, dan vragen we periodiek de lijst op. Allebei
// zonder ophaalronde, en allebei houden ze de sessie bij het stelsel warm.

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
// Hoe vaak een verlopen sessie met een nieuwe ophaalronde terug mag komen.
const HERSTEL_LIMIET = 2;

let volgers = 0;
let volgAfbreker: AbortController | null = null;
let stopKlok: ReturnType<typeof setTimeout> | undefined;
let herstelPogingen = 0;

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
  if (staat.berichten.some((b) => b.id === bericht.berichtId)) return;
  const nieuw = naarBericht(bericht);
  zet({
    berichten: [nieuw, ...staat.berichten].sort((a, b) =>
      b.tijdstip.localeCompare(a.tijdstip),
    ),
    nieuw: { id: nieuw.id, afzender: nieuw.afzender },
  });
};

/** Vervangt de lijst door wat het stelsel nu heeft, en meldt wat er bij kwam. */
const werkLijstBij = (lijst: KetenLijstBericht[]) => {
  const bekend = new Set(staat.berichten.map((b) => b.id));
  const bijgekomen = lijst.filter((b) => !bekend.has(b.berichtId));
  zetLijst(lijst);
  const laatste = bijgekomen[0];
  if (laatste)
    zet({
      nieuw: {
        id: laatste.berichtId,
        afzender: laatste.afzenderNaam || "Onbekende afzender",
      },
    });
};

/** Een verlopen sessie terughalen met een stille ophaalronde. */
const herstel = async () => {
  if (herstelPogingen >= HERSTEL_LIMIET) return false;
  herstelPogingen++;
  try {
    await haalOp(() => {});
    werkLijstBij(await haalLijst());
    return true;
  } catch {
    return false;
  }
};

const ververs = async () => {
  try {
    werkLijstBij(await haalLijst());
  } catch (fout) {
    if (redenVan(fout) === "geenSessie" && !(await herstel()))
      zet({ volgenGestopt: true });
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
    if (signal.aborted) return;
    try {
      werkLijstBij(await haalLijst());
      fouten = 0;
    } catch (fout) {
      if (redenVan(fout) === "geenSessie" && (await herstel())) continue;
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
        if (gebeurtenis.event === "volgen-gestart") void ververs();
        if (gebeurtenis.event === "bericht-bijgekomen")
          voegToe(gebeurtenis.bericht);
      },
    );
    clearTimeout(waakhond);
    signal.removeEventListener("abort", stop);
    if (signal.aborted) return;

    if (einde === "verlopen" || einde === "conflict") {
      if (await herstel()) continue;
      zet({ volgenGestopt: true });
      return;
    }
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

const startVolgen = () => {
  clearTimeout(stopKlok);
  if (volgAfbreker || staat.fase !== "klaar") return;
  volgAfbreker = new AbortController();
  void volgLus(volgAfbreker.signal);
};

function stopVolgen() {
  clearTimeout(stopKlok);
  volgAfbreker?.abort();
  volgAfbreker = null;
}

const SERVER: KetenStaat = LEEG;

/**
 * @param ontvanger Null voor een persona die niet is aangesloten.
 * @param ophalen   Zonder sessie een ophaalronde starten.
 */
export const useKeten = (ontvanger: string | null, ophalen = true) => {
  const huidig = useSyncExternalStore(
    subscribe,
    () => staat,
    () => SERVER,
  );

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
    nieuw: vanDeze ? huidig.nieuw : null,
    volgenGestopt: vanDeze ? huidig.volgenGestopt : false,
  };
};

const zoek = (id: string) => staat.berichten.find((b) => b.id === id);

/** Geeft null als het lukte, anders de tekst voor de gebruiker. */
export const verplaatsKetenBericht = async (
  id: string,
  plek: Weergave,
): Promise<string | null> => {
  const bericht = zoek(id);
  if (!bericht) return ketenFoutTekst.weg;
  try {
    await verplaatsBericht(id, bericht.magazijnId, plek);
  } catch (fout) {
    return wijzigingMislukt(fout, id, WAT_PER_PLEK[plek]);
  }
  zet({
    berichten: staat.berichten.map((b) => (b.id === id ? { ...b, plek } : b)),
  });
  return null;
};

export const verwijderKetenBerichtVoorgoed = async (
  id: string,
): Promise<string | null> => {
  const bericht = zoek(id);
  if (!bericht) return ketenFoutTekst.weg;
  try {
    await verwijderBericht(id, bericht.magazijnId);
  } catch (fout) {
    return wijzigingMislukt(fout, id, "voorgoed te verwijderen");
  }
  zet({ berichten: staat.berichten.filter((b) => b.id !== id) });
  return null;
};

const WAT_PER_PLEK: Record<Weergave, string> = {
  inbox: "terug te zetten in uw inbox",
  archief: "te archiveren",
  prullenbak: "naar de prullenbak te verplaatsen",
};

const wijzigingMislukt = (fout: unknown, id: string, wat: string) => {
  if (redenVan(fout) === "weg") {
    zet({ berichten: staat.berichten.filter((b) => b.id !== id) });
    return ketenFoutTekst.weg;
  }
  return `Het is niet gelukt om dit bericht ${wat}. Probeer het opnieuw.`;
};

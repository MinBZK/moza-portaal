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
  return {
    fase: vanDeze ? huidig.fase : ("laden" as Fase),
    berichten: vanDeze ? huidig.berichten : [],
    voortgang: vanDeze ? huidig.voortgang : null,
    fout: vanDeze ? huidig.fout : null,
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

import type { RegelingId } from "./_useAannemen";

/**
 * Welke gegevens bij een regeling op de kaart staan in stap 2. Puur: Node
 * laadt dit bestand in de test.
 *
 * Een gegeven met `parameter` gaat als die invoer naar de engine (feitenVoor
 * in _uitkomsten.ts); de test controleert dat de wet van de regeling die
 * invoer vraagt. Wie aanvraagt en voor wie (AANVRAGER) staat één keer onder
 * de kaarten, niet op elke kaart. Gegevens over gezondheid en inkomen van de
 * kandidaat staan er niet bij (zie zichtbaarVan in _opgehaald.tsx).
 */
export type GegevenId =
  | "werkgever"
  | "kandidaat"
  | "aanvang"
  | "uren"
  | "loonwaarde"
  | "uurloon"
  | "register"
  | "eerder"
  | "verzoekLkv";

export type Gebruikt = { id: GegevenId; parameter?: string };

/** De wet en uitkomst waarmee de engine een regeling rekent. */
export const DOEL_VAN: Partial<
  Record<RegelingId, { wet: string; output: string }>
> = {
  lks: { wet: "participatiewet", output: "heeft_recht_op_lks" },
  ld: {
    wet: "wet_arbeidsongeschiktheidsvoorziening_jonggehandicapten",
    output: "heeft_recht_op_loondispensatie",
  },
  lkv: { wet: "wet_tegemoetkomingen_loondomein", output: "heeft_recht_op_lkv" },
  nrp: { wet: "ziektewet", output: "heeft_recht_op_no_risk_polis" },
};

/** Wie aanvraagt en voor wie: geldt voor alle regelingen samen. */
export const AANVRAGER: GegevenId[] = ["werkgever", "kandidaat"];

export const GEBRUIKT: Record<RegelingId, Gebruikt[]> = {
  lks: [
    { id: "aanvang" },
    { id: "uren", parameter: "overeengekomen_arbeidsduur_uren_per_week" },
    { id: "loonwaarde", parameter: "loonwaarde_percentage" },
  ],
  ld: [
    { id: "uren" },
    { id: "uurloon" },
    {
      id: "loonwaarde",
      parameter: "vastgesteld_aanspraakpercentage_minimumloon",
    },
  ],
  jc: [],
  wpa: [],
  lkv: [
    { id: "register", parameter: "registratie_nog_niet_geeindigd" },
    { id: "uren", parameter: "verloonde_uren" },
    {
      id: "eerder",
      parameter: "was_in_dienst_bij_werkgever_binnen_zes_maanden",
    },
    { id: "verzoekLkv", parameter: "heeft_loonaangifte_verzoek_ingediend" },
  ],
  nrp: [
    { id: "register", parameter: "registratie_nog_niet_geeindigd" },
    { id: "aanvang" },
  ],
  doelgroepverklaring: [],
  vz_wajong: [],
  vz_wia: [],
  pp: [],
};

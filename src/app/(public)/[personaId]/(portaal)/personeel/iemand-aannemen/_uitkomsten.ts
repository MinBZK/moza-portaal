/**
 * De oriëntatie van "Iemand aannemen" zonder React: van de vier antwoorden
 * naar invoer voor de regelrecht-engine, en van de uitkomsten naar wat het
 * scherm toont. Alleen `import type`, zodat Node dit bestand direct laadt
 * (scripts/iemand-aannemen-uitkomsten.test.mjs). Uitgangssituaties en
 * uitsluitingen volgen de Uitkomstenkaart Financieel CV; zie
 * ontwerp-orientatie-alle-uitkomsten-v1.md.
 */

export const DOELGROEPEN = [
  ["register", "Iemand uit het doelgroepregister (banenafspraak)"],
  ["wajong", "Iemand met een Wajong-uitkering"],
  ["wia", "Iemand met een WIA-uitkering"],
  ["bijstand", "Iemand met een bijstandsuitkering"],
  ["wsw", "Heeft een Wsw-indicatie of werkt in de sociale werkvoorziening"],
  ["beschut", "Is door de gemeente aangewezen op beschut werk"],
  ["geen", "Geen van deze"],
] as const;
export type Doelgroep = (typeof DOELGROEPEN)[number][0];

/** "Geen van deze" sluit de andere keuzes uit. */
const ALLEEN: Doelgroep[] = ["geen"];

/**
 * Vraag 1 is meerkeuze. Wajong vinkt het register aan (Wfsv 38b lid 1 c).
 * Beschut werk sluit het register uit (aanhef 38b lid 1), dus ook Wajong.
 */
export const kiesDoelgroep = (
  huidig: Doelgroep[],
  waarde: Doelgroep,
  aan: boolean,
): Doelgroep[] => {
  if (aan && ALLEEN.includes(waarde)) return [waarde];
  let nieuw = huidig.filter((d) => d !== waarde && !ALLEEN.includes(d));
  if (aan) {
    if (waarde === "beschut")
      nieuw = nieuw.filter((d) => d !== "register" && d !== "wajong");
    if (waarde === "register" || waarde === "wajong")
      nieuw = nieuw.filter((d) => d !== "beschut");
    nieuw.push(waarde);
  }
  if (nieuw.includes("wajong") && !nieuw.includes("register"))
    nieuw.push("register");
  return DOELGROEPEN.map(([d]) => d).filter((d) => nieuw.includes(d));
};

/** De antwoorden op de vier vragen (zie Antwoorden in _useAannemen.ts). */
export type Keuzes = {
  doelgroepen: Doelgroep[];
  uren: number;
  loonwaarde: number;
  /** Bruto uurloon in eurocent. */
  uurloon: number;
};

export type Feiten = Record<string, boolean | number | string | null>;

/** Eén aanroep van de engine, zoals de worker hem verwacht (Invoer in _useRegelrecht.ts). */
export type EngineInvoer = {
  wet: string;
  output: string;
  peildatum: string;
  parameters: Feiten;
  uitleggen?: string[];
};

export const PEILDATUM = "2026-07-01";
/** Wettelijk minimumloon per uur per 1 juli 2026, in eurocent. */
export const WML_UUR_EUROCENT = 1499;

type Doel = Omit<EngineInvoer, "peildatum" | "parameters"> & {
  /** Kan deze uitkomst bij deze keuzes iets opleveren? Zo niet, dan blijft de aanroep weg. */
  nodig: (d: Set<Doelgroep>) => boolean;
};

const viaGemeente = (d: Set<Doelgroep>) =>
  d.has("bijstand") && !d.has("wajong") && !d.has("wia");
const iets = (d: Set<Doelgroep>) => d.size > 0 && !d.has("geen");

/**
 * Wat de oriëntatie rekent, met de bedragen eerst: elke aanroep kost de kern
 * bijna een seconde en de worker werkt ze na elkaar af. Dezelfde wetten en
 * outputs als DOELEN in scripts/regelrecht-node.mjs. WW 76a heeft geen vinkje
 * en blijft dus weg.
 */
export const DOELEN: Doel[] = [
  {
    wet: "participatiewet",
    output: "heeft_recht_op_lks",
    uitleggen: ["hoogte_lks_eurocent_per_maand"],
    nodig: viaGemeente,
  },
  {
    wet: "wet_arbeidsongeschiktheidsvoorziening_jonggehandicapten",
    output: "heeft_recht_op_loondispensatie",
    uitleggen: ["aanspraak_beloning_per_uur_eurocent"],
    nodig: (d) => d.has("wajong"),
  },
  {
    wet: "wet_tegemoetkomingen_loondomein",
    output: "heeft_recht_op_lkv",
    uitleggen: ["hoogte_lkv_per_jaar_eurocent", "categorie_lkv"],
    nodig: iets,
  },
  {
    wet: "ziektewet",
    output: "heeft_recht_op_no_risk_polis",
    uitleggen: ["duur_no_risk_polis_jaren"],
    nodig: iets,
  },
  {
    wet: "participatiewet",
    output: "mag_proefplaatsing_aangaan",
    nodig: viaGemeente,
  },
  {
    wet: "participatiewet",
    output: "heeft_aanspraak_op_begeleiding_op_de_werkplek",
    nodig: viaGemeente,
  },
  {
    wet: "wet_werk_en_inkomen_naar_arbeidsvermogen",
    output: "mag_jobcoaching_toekennen",
    uitleggen: ["mag_werkplekaanpassing_toekennen"],
    nodig: (d) => d.has("wia"),
  },
];

const aan = (...namen: string[]): Feiten =>
  Object.fromEntries(namen.map((n) => [n, true]));

/**
 * De feiten die bij elk vinkje een route in de engine openen, bovenop de
 * neutrale basis (_basisfeiten.json). Waar de kaart twee lezingen toelaat,
 * de zuinigste (ontwerp: "nooit te gunstig").
 */
export const feitenVoor = (a: Keuzes): Feiten => {
  const d = new Set(a.doelgroepen);
  const onderWml = a.loonwaarde < 100;
  const uwvUitkering = d.has("wajong") || d.has("wia");
  const verloond = a.uren * 52;
  let f: Feiten = {
    ...aan(
      "heeft_loonaangifte_verzoek_ingediend",
      "werkgever_is_voornemens_dienstbetrekking_aan_te_gaan",
      "dienstbetrekking_is_tot_stand_gekomen",
      "verricht_arbeid_in_dienstbetrekking",
      "heeft_arbeidsverhouding_of_voorbereiding",
      "dienstbetrekking_aangevangen_na_aanvang_referteperiode",
    ),
    overeengekomen_arbeidsduur_uren_per_week: a.uren,
    loonwaarde_percentage: a.loonwaarde,
    verloonde_uren: verloond,
    verloonde_uren_voorwaarden_2_6: verloond,
    verloonde_uren_voorwaarden_2_10: verloond,
    verloonde_uren_voorwaarden_2_14: verloond,
  };
  if (d.has("register"))
    f = {
      ...f,
      ...aan(
        "was_arbeidsbeperkte_lid_1_of_2",
        "registratie_nog_niet_geeindigd",
      ),
      datum_eerste_opname_doelgroepregister: "2025-11-03",
    };
  // Wie een UWV-uitkering heeft, valt niet onder de Pwet-doelgroep (Pwet 7 lid 3 c).
  if (d.has("bijstand") && !uwvUitkering) {
    f = {
      ...f,
      ...aan(
        "was_persoon_7_lid_1_a_of_7a_in_zes_maanden_voorafgaand",
        "behoort_tot_doelgroep_artikel_7_lid_1_a",
        "ontvangt_algemene_bijstand",
        "college_verleent_toestemming_proefplaatsing",
        "is_pwet_toegeleid_naar_dienstbetrekking",
        "is_pwet_toegeleid_of_lks_lid_2",
      ),
    };
    if (onderWml)
      f = {
        ...f,
        ...aan(
          "behoort_tot_doelgroep_lks",
          "kan_minimumloon_niet_verdienen",
          "college_heeft_loonwaarde_vastgesteld_conform_10d",
        ),
        datum_aanvraag_lks: "2026-02-01",
      };
  }
  if (d.has("wajong"))
    f = {
      ...f,
      ...aan(
        "heeft_wajong_arbeidsondersteuning_of_uitkering",
        "heeft_recht_op_arbeidsondersteuning_wajong",
        "had_of_heeft_wajong_arbeidsongeschiktheidsuitkering",
        "aanvraag_loondispensatie_ingediend",
      ),
      arbeidsprestatie_duidelijk_minder_dan_minimumloon: onderWml,
      gebruikelijke_beloning_per_uur_eurocent: WML_UUR_EUROCENT,
      gerechtvaardigde_beloning_per_uur_eurocent: Math.round(
        (WML_UUR_EUROCENT * a.loonwaarde) / 100,
      ),
      vastgesteld_aanspraakpercentage_minimumloon: a.loonwaarde,
      verwachte_duur_verminderde_prestatie_maanden: 12,
    };
  if (d.has("wia"))
    f = {
      ...f,
      ...aan(
        "had_wia_recht_maand_voor_aanvang",
        "heeft_wia_uitkering_hoofdstuk_6",
        "is_ziek_geworden",
        "is_ziek_geworden_wia",
        "heeft_geldige_doelgroepverklaring_2_7",
        "heeft_structurele_functionele_beperking",
        "aanvraag_jobcoaching_ingediend",
        "aanvraag_werkplekaanpassing_ingediend",
        "ondersteuning_is_noodzakelijk_en_compenseert_beperkingen",
        "voorziening_is_meeneembaar_en_individueel_afgestemd",
      ),
      // WGA: wachttijd van 104 weken doorlopen, verdiencapaciteit ten hoogste 65 procent.
      eerste_dag_wachttijd: "2023-01-02",
      eerste_dag_wachttijd_wia: "2023-01-02",
      verdiencapaciteit_percentage_maatmaninkomen: 50,
      // Boven het drempelbedrag van € 195,16 (Reïntegratiebesluit 3).
      kosten_voorziening_eurocent: 100000,
    };
  if (d.has("wsw"))
    f = {
      ...f,
      ...aan(
        "is_wsw_geindiceerd_of_oude_indicatie",
        "is_wsw_werknemer",
        "is_wsw_dienstbetrekking",
        "is_wsw_of_beschut_werk_dienstbetrekking",
        "had_wsw_dienstbetrekking_of_indicatie_voorafgaand",
        "verricht_wsw_arbeid_artikel_2_zonder_terbeschikkingstelling",
        "verricht_arbeid_in_wsw_dienstbetrekking_artikel_2",
      ),
    };
  if (d.has("beschut"))
    f = {
      ...f,
      ...aan(
        "college_heeft_vastgesteld_uitsluitend_beschut_werk",
        "is_uitgesloten_beschut_werk_pwet_10b",
        "behoort_tot_doelgroep_10b_lid_1",
        "heeft_dienstbetrekking_beschut_werk",
        "is_wsw_of_beschut_werk_dienstbetrekking",
      ),
    };
  return f;
};

/** Eén invoer per doel, met de basis en de feiten van de keuzes. */
export const invoerVoor = (a: Keuzes, basis: Feiten): EngineInvoer[] => {
  const d = new Set(a.doelgroepen);
  const parameters = { ...basis, ...feitenVoor(a) };
  return DOELEN.filter((doel) => doel.nodig(d)).map(
    ({ wet, output, uitleggen }) => ({
      wet,
      output,
      peildatum: PEILDATUM,
      parameters,
      ...(uitleggen ? { uitleggen } : {}),
    }),
  );
};

export type AannameId =
  "lks_lid4" | "ld_cao" | "wia_nieuw" | "wsw_zuinig" | "beschut_lks" | "geen";

export type Regel = {
  id: "lks" | "ld" | "lkv";
  bedragPerJaar: number;
  categorie?: string;
  /** Alleen bij loondispensatie: wat de werkgever per uur betaalt, in eurocent. */
  aanspraakPerUur?: number;
  aanname?: AannameId;
};

export type Overig = {
  id: "nrp" | "pp_pwet" | "pp_ww" | "begeleiding" | "vz_wia" | "vz_wajong";
  geldt: boolean;
  duurJaren?: number;
};

export type Uitkomsten = {
  regels: Regel[];
  overige: Overig[];
  aannames: AannameId[];
};

export type BalansRegel = {
  id: Regel["id"];
  regel?: Regel;
  /** Wat de regeling in de balans aftrekt, in eurocent per jaar. */
  bedrag: number;
  status: "bedrag" | "geldt_niet" | "niet_meegeteld";
};

/**
 * De drie regelingen met een bedrag, altijd in dezelfde volgorde, zodat de
 * balans ze ook toont als ze niet gelden. Nooit meer terug dan de loonkosten;
 * per regeling afgetopt in volgorde.
 */
export const balansRegels = (u: Uitkomsten, kosten: number): BalansRegel[] => {
  let over = Math.max(0, kosten);
  return (["lks", "ld", "lkv"] as const).map((id) => {
    const regel = u.regels.find((r) => r.id === id);
    if (!regel)
      return {
        id,
        bedrag: 0,
        status:
          id === "ld" && u.aannames.includes("ld_cao")
            ? "niet_meegeteld"
            : "geldt_niet",
      };
    const bedrag = Math.min(regel.bedragPerJaar, over);
    over -= bedrag;
    return { id, regel, bedrag, status: "bedrag" };
  });
};

type Outputs = Record<string, unknown>;

/** Loonkosten-vuistregel: plus 8 procent vakantiebijslag en 20 procent werkgeverslasten. */
const OPSLAG = 1.08 * 1.2;

/** Van de engine-uitkomsten (sleutel "<wet>:<output>") naar wat het scherm toont. */
export const uitkomstenUit = (
  a: Keuzes,
  uit: Record<string, Outputs | undefined>,
): Uitkomsten => {
  const d = new Set(a.doelgroepen);
  const van = (wet: string, output: string) => uit[`${wet}:${output}`] ?? {};
  const lks = van("participatiewet", "heeft_recht_op_lks");
  const ld = van(
    "wet_arbeidsongeschiktheidsvoorziening_jonggehandicapten",
    "heeft_recht_op_loondispensatie",
  );
  const lkv = van("wet_tegemoetkomingen_loondomein", "heeft_recht_op_lkv");
  const nrp = van("ziektewet", "heeft_recht_op_no_risk_polis");
  const vz = van(
    "wet_werk_en_inkomen_naar_arbeidsvermogen",
    "mag_jobcoaching_toekennen",
  );

  const regels: Regel[] = [];
  if (lks.heeft_recht_op_lks === true)
    regels.push({
      id: "lks",
      bedragPerJaar: Math.round(Number(lks.hoogte_lks_eurocent_per_maand) * 12),
      aanname: "lks_lid4",
    });
  // Boven het minimumloon hangt het van de cao af of loondispensatie het loon verlaagt.
  const ldBovenWml =
    ld.heeft_recht_op_loondispensatie === true && a.uurloon > WML_UUR_EUROCENT;
  if (ld.heeft_recht_op_loondispensatie === true && !ldBovenWml) {
    const perUur = Number(ld.aanspraak_beloning_per_uur_eurocent);
    regels.push({
      id: "ld",
      aanspraakPerUur: perUur,
      bedragPerJaar: Math.round(
        (WML_UUR_EUROCENT - perUur) * a.uren * 52 * OPSLAG,
      ),
    });
  }
  const lkvJaar = Number(lkv.hoogte_lkv_per_jaar_eurocent ?? 0);
  if (lkv.heeft_recht_op_lkv === true && lkvJaar > 0) {
    const categorie = String(lkv.categorie_lkv);
    regels.push({
      id: "lkv",
      bedragPerJaar: lkvJaar,
      categorie,
      aanname:
        categorie === "arbeidsgehandicapte_werknemer" ? "wia_nieuw" : undefined,
    });
  }

  const overige: Overig[] = [
    {
      id: "nrp",
      geldt: nrp.heeft_recht_op_no_risk_polis === true,
      duurJaren: Number(nrp.duur_no_risk_polis_jaren ?? 0),
    },
    {
      id: "pp_pwet",
      geldt:
        van("participatiewet", "mag_proefplaatsing_aangaan")
          .mag_proefplaatsing_aangaan === true,
    },
    {
      id: "pp_ww",
      geldt:
        van("werkloosheidswet", "uwv_mag_toestemming_verlenen")
          .uwv_mag_toestemming_verlenen === true,
    },
    {
      id: "begeleiding",
      geldt:
        van("participatiewet", "heeft_aanspraak_op_begeleiding_op_de_werkplek")
          .heeft_aanspraak_op_begeleiding_op_de_werkplek === true,
    },
    {
      id: "vz_wia",
      geldt:
        vz.mag_jobcoaching_toekennen === true ||
        vz.mag_werkplekaanpassing_toekennen === true,
    },
    // Wajong 2:22 zit niet in de bundel als doel; de kaart noemt het bij elk Wajong-recht.
    { id: "vz_wajong", geldt: d.has("wajong") },
  ];

  const aannames: AannameId[] = [];
  if (ldBovenWml) aannames.push("ld_cao");
  if (d.has("wsw")) aannames.push("wsw_zuinig");
  if (d.has("beschut") && !d.has("bijstand")) aannames.push("beschut_lks");
  if (d.has("geen")) aannames.push("geen");
  return { regels, overige, aannames };
};

type Uit = Record<string, Outputs>;

/**
 * Wat de hook teruggeeft: de uitkomsten van nu, aangevuld met de laatste van
 * dezelfde aanroep zodat het scherm niet verspringt. Alleen als alles van nu
 * is, telt het als bekend: een oud bedrag mag niet als geldig op het scherm.
 */
export const samenvoegen = (ids: string[], nu: Uit, alle: Uit) => {
  const uit: Uit = {};
  for (const id of ids) {
    const waarde = nu[id] ?? alle[id];
    if (waarde) uit[id] = waarde;
  }
  return {
    uit,
    bekend: ids.every((id) => id in nu),
    bezig: ids.some((id) => !(id in nu)),
  };
};

import type { Doelgroep, Keuzes, Uitkomsten } from "./_uitkomsten";

/**
 * Wat er na de oriëntatie volgt, per situatie van de werkgever.
 * Puur: alleen types uit _uitkomsten, zodat Node dit bestand direct laadt.
 */

export type Situatie = "gemeente" | "wajong" | "wia" | "register" | "uitleg";

/** De stand van één zaak; de fase is een id uit de fasen van die situatie. */
export type ZaakStand = {
  ingediend: boolean;
  verstuurdOp?: string;
  fase: string;
  vraag?: string;
  /** De antwoorden bij het indienen (of bij "Klaar"); de zaak rekent daarmee. */
  antwoorden?: Keuzes;
  /** Het onderwerp zoals de zaak het bij het indienen kreeg. */
  onderwerp?: string;
};
export type Zaken = Partial<Record<Situatie, ZaakStand>>;
export type TaakStand = "open" | "aangevraagd" | "verstrekt";

export type PaneelId = "lks" | "jc" | "wpa" | "ld";
export type TaakId = "doelgroepverklaring" | "vz_wajong" | "vz_wia" | "pp";
export type VanzelfId = "lkv" | "nrp";

export type Route = {
  situatie: Situatie;
  panelen: { organisatie: "gemeente" | "uwv"; ids: PaneelId[] }[];
  taken: TaakId[];
  vanzelf: VanzelfId[];
  /** De zaak die de werkgever kan starten; null als er niets aan te vragen is. */
  zaak: Situatie | null;
  overzicht: boolean;
};

/** Volgorde: wajong, wia, bijstand, register, anders uitleg (beschut, geen of niets gekozen). */
export const situatieVan = (doelgroepen: Doelgroep[]): Situatie => {
  const heeft = (d: Doelgroep) => doelgroepen.includes(d);
  if (heeft("wajong")) return "wajong";
  if (heeft("wia")) return "wia";
  if (heeft("bijstand")) return "gemeente";
  if (heeft("register")) return "register";
  return "uitleg";
};

export const routeVoor = (doelgroepen: Doelgroep[], u: Uitkomsten): Route => {
  const situatie = situatieVan(doelgroepen);
  const regel = (id: string) => u.regels.find((r) => r.id === id);
  const geldt = (id: string) => u.overige.some((o) => o.id === id && o.geldt);

  const panelen: Route["panelen"] = [];
  const taken: TaakId[] = [];

  // Het loonkostenvoordeel arbeidsgehandicapte vraagt om een doelgroepverklaring
  // van de werknemer, in elke situatie (ook Wajong + WIA).
  if (regel("lkv")?.categorie === "arbeidsgehandicapte_werknemer")
    taken.push("doelgroepverklaring");

  if (situatie === "gemeente") {
    const ids: PaneelId[] = [];
    if (regel("lks")) ids.push("lks");
    if (geldt("begeleiding")) ids.push("jc");
    ids.push("wpa");
    // Werkplekaanpassing alleen is geen aanvraag (de keuze kan "later" of
    // "nee" zijn): zonder lks of jc volgt de route het overzicht.
    if (ids.some((id) => id !== "wpa"))
      panelen.push({ organisatie: "gemeente", ids });
    // De proefplaats ligt vóór de eerste werkdag (Pwet 6 h) en de toestemming
    // gaat naar de kandidaat (8a lid 2 d): een taak, geen deel van de aanvraag.
    if (geldt("pp_pwet")) taken.push("pp");
  } else if (situatie === "wajong") {
    if (regel("ld")) panelen.push({ organisatie: "uwv", ids: ["ld"] });
    if (geldt("vz_wajong")) taken.push("vz_wajong");
  } else if (situatie === "wia") {
    if (geldt("vz_wia")) taken.push("vz_wia");
  }

  const vanzelf: VanzelfId[] = [];
  if (regel("lkv")) vanzelf.push("lkv");
  if (geldt("nrp")) vanzelf.push("nrp");

  // De taak doelgroepverklaring is alleen bij WIA een eigen zaak; bij Wajong
  // hoort hij bij de zaak van de loondispensatie.
  const heeftZaak =
    panelen.length > 0 ||
    (situatie === "wia" && taken.includes("doelgroepverklaring"));
  const zaak = heeftZaak ? situatie : null;

  return { situatie, panelen, taken, vanzelf, zaak, overzicht: zaak === null };
};

/**
 * Zaken uit de opslag. Eerdere versies bewaarden één zaak bovenaan
 * (ingediend, verstuurdOp, fase, vraag); die hoort bij de gemeente.
 */
export const migreerZaken = (oud: {
  ingediend?: boolean;
  verstuurdOp?: string;
  fase?: string;
  vraag?: string;
  zaken?: Zaken;
}): Zaken => {
  if (oud.zaken && typeof oud.zaken === "object") return oud.zaken;
  const { ingediend, verstuurdOp, fase, vraag } = oud;
  if (
    ingediend === undefined &&
    verstuurdOp === undefined &&
    fase === undefined &&
    vraag === undefined
  )
    return {};
  const zaak: ZaakStand = {
    ingediend: ingediend === true,
    fase: fase ?? "ontvangst",
  };
  if (verstuurdOp !== undefined) zaak.verstuurdOp = verstuurdOp;
  if (vraag !== undefined) zaak.vraag = vraag;
  return { gemeente: zaak };
};

/** De antwoorden waarmee een zaak rekent: de kopie van het indienen, anders (oude opslag) die van nu. */
export const antwoordenVoorZaak = (
  zaak: ZaakStand | undefined,
  nu: Keuzes,
): Keuzes => zaak?.antwoorden ?? nu;

/**
 * Het onderwerp van de zaak. Een gemeente-zaak zonder loonkostensubsidie gaat
 * over de andere aanvragen bij de gemeente.
 */
export const onderwerpVoor = (
  situatie: Situatie,
  onderwerp: string,
  kandidaat: string,
  u: Uitkomsten,
): string =>
  situatie === "gemeente" && !u.regels.some((r) => r.id === "lks")
    ? `Aanvraag bij de gemeente voor ${kandidaat}`
    : onderwerp;

/** Plaats van de fase in de fasen van de situatie; onbekend telt als de eerste. */
export const faseIndex = (fase: string, fasen: { id: string }[]): number =>
  Math.max(
    0,
    fasen.findIndex((f) => f.id === fase),
  );

/** Vult {plaatshouders} in een tekst; een onbekende plaatshouder blijft staan. */
export const vulSjabloon = (tekst: string, w: Record<string, string>): string =>
  tekst.replace(/\{(\w+)\}/g, (heel, naam: string) =>
    Object.hasOwn(w, naam) ? w[naam] : heel,
  );

/** Eurocenten als bedrag ("€ 897,41"); zelfde weergave als euro() in _werkgever.ts, dat Node niet direct laadt. */
const bedrag = (eurocent: number) =>
  `€ ${(Math.round(eurocent) / 100).toLocaleString("nl-NL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/**
 * De waarden voor de plaatshouders in de demo-teksten, uit de antwoorden en de
 * uitkomsten van de engine. Een uitkomst die de engine niet geeft, blijft leeg
 * ("—"): nooit een oud of verzonnen bedrag.
 */
export const waardenVoor = (
  a: Keuzes,
  u: Uitkomsten,
): Record<string, string> => {
  const regel = (id: string) => u.regels.find((r) => r.id === id);
  const lks = regel("lks");
  const ld = regel("ld");
  const lkv = regel("lkv");
  // De opslag in Uitkomsten is round(maand x 12): terug naar hele centen.
  const maand = lks ? Math.round(lks.bedragPerJaar / 12) : undefined;
  return {
    uren: String(a.uren),
    loonwaarde: `${a.loonwaarde} procent`,
    lksPerMaand: maand === undefined ? "—" : bedrag(maand),
    lksTweeMaanden: maand === undefined ? "—" : bedrag(2 * maand),
    aanspraakPerUur:
      ld?.aanspraakPerUur === undefined ? "—" : bedrag(ld.aanspraakPerUur),
    lkvPerJaar: lkv ? bedrag(lkv.bedragPerJaar) : "—",
  };
};

/**
 * De eerste dag van de maand van de aanvraag: dan gaat de loondispensatie in
 * (Besluit loondispensatie Wajong 4). Datums als "2026-10-05".
 */
export const ingangLoondispensatie = (aanvraag: string): string =>
  `${aanvraag.slice(0, 7)}-01`;

/**
 * Een besluit (en wat erover in de zaak staat) hoort er alleen als de engine
 * bij de antwoorden de regel van de situatie geeft: lks bij de gemeente, ld bij
 * Wajong. Zonder die regel toont de zaak geen toekenning.
 */
export const besluitGeldt = (situatie: Situatie, u: Uitkomsten): boolean => {
  const id =
    situatie === "gemeente" ? "lks" : situatie === "wajong" ? "ld" : null;
  return id === null || u.regels.some((r) => r.id === id);
};

/**
 * De eerste zin van het overzicht. Heeft de werknemer een taak (zoals de
 * doelgroepverklaring), dan is er wel iets aan te vragen, alleen niet door de
 * werkgever.
 */
export const overzichtTekst = (route: Route): string =>
  route.taken.length > 0
    ? "U hoeft niets in te dienen. Hieronder staat wat de werknemer aanvraagt en wat vanzelf gaat."
    : ["gemeente", "wajong", "wia"].includes(route.situatie)
      ? "Bij deze antwoorden is er niets aan te vragen."
      : "Voor deze situatie dient u niets in. Dit is wat er wel geldt.";

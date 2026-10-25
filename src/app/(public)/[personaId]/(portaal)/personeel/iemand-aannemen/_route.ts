import type { Doelgroep, Keuzes, Uitkomsten } from "./_uitkomsten";

/**
 * Wat er na de oriëntatie volgt, per situatie van de werkgever.
 * Puur: alleen types uit _uitkomsten, zodat Node dit bestand direct laadt.
 */

export type Situatie =
  "gemeente" | "wajong" | "wia" | "register" | "uitleg" | "weetniet";

/** De stand van één zaak; de fase is een id uit de fasen van die situatie. */
export type ZaakStand = {
  ingediend: boolean;
  verstuurdOp?: string;
  fase: string;
  vraag?: string;
};
export type Zaken = Partial<Record<Situatie, ZaakStand>>;
export type TaakStand = "open" | "aangevraagd" | "verstrekt";

export type PaneelId = "lks" | "jc" | "wpa" | "pp" | "ld";
export type TaakId = "doelgroepverklaring" | "vz_wajong" | "vz_wia";
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

/** Volgorde: wajong, wia, bijstand, register, beschut/wsw/geen, anders weet niet. */
export const situatieVan = (doelgroepen: Doelgroep[]): Situatie => {
  const heeft = (d: Doelgroep) => doelgroepen.includes(d);
  if (heeft("wajong")) return "wajong";
  if (heeft("wia")) return "wia";
  if (heeft("bijstand")) return "gemeente";
  if (heeft("register")) return "register";
  if (heeft("beschut") || heeft("wsw") || heeft("geen")) return "uitleg";
  return "weetniet";
};

export const routeVoor = (doelgroepen: Doelgroep[], u: Uitkomsten): Route => {
  const situatie = situatieVan(doelgroepen);
  const regel = (id: string) => u.regels.find((r) => r.id === id);
  const geldt = (id: string) => u.overige.some((o) => o.id === id && o.geldt);

  const panelen: Route["panelen"] = [];
  const taken: TaakId[] = [];

  if (situatie === "gemeente") {
    const ids: PaneelId[] = [];
    if (regel("lks")) ids.push("lks");
    if (geldt("begeleiding")) ids.push("jc");
    ids.push("wpa");
    if (geldt("pp_pwet")) ids.push("pp");
    panelen.push({ organisatie: "gemeente", ids });
  } else if (situatie === "wajong") {
    if (regel("ld")) panelen.push({ organisatie: "uwv", ids: ["ld"] });
    if (geldt("vz_wajong")) taken.push("vz_wajong");
  } else if (situatie === "wia") {
    if (regel("lkv")?.categorie === "arbeidsgehandicapte_werknemer")
      taken.push("doelgroepverklaring");
    if (geldt("vz_wia")) taken.push("vz_wia");
  }

  const vanzelf: VanzelfId[] = [];
  if (regel("lkv")) vanzelf.push("lkv");
  if (geldt("nrp")) vanzelf.push("nrp");

  const heeftZaak = panelen.length > 0 || taken.includes("doelgroepverklaring");
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

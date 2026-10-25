import type { Doelgroep, Uitkomsten } from "./_uitkomsten";

/**
 * Wat er na de oriëntatie volgt, per situatie van de werkgever.
 * Puur: alleen types uit _uitkomsten, zodat Node dit bestand direct laadt.
 */

export type Situatie =
  "gemeente" | "wajong" | "wia" | "register" | "uitleg" | "weetniet";

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

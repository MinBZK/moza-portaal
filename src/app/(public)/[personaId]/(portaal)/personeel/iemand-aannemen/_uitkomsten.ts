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
  ["weetniet", "Weet ik nog niet"],
] as const;
export type Doelgroep = (typeof DOELGROEPEN)[number][0];

/** Deze twee sluiten de andere keuzes uit. */
const ALLEEN: Doelgroep[] = ["geen", "weetniet"];

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

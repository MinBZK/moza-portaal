import type { DemoBedrijfsorganisatie } from "@/demo";

/** Wat van de werkgever in de teksten en formulieren komt, uit de actieve persona. */
export type Werkgever = {
  onderneming: string;
  rechtsvorm: string;
  kvkNummer: string;
  vestiging: string;
  loonheffingennummer: string;
  iban: string;
  fulltime: string;
  parttime: string;
};

export const werkgeverVan = (
  organisatie?: DemoBedrijfsorganisatie,
): Werkgever => ({
  onderneming: organisatie?.handelsnaam ?? "uw onderneming",
  rechtsvorm: organisatie?.rechtsvorm ?? "",
  kvkNummer: organisatie?.kvkNummer ?? "",
  vestiging:
    organisatie?.vestigingsadresVolledig ?? organisatie?.vestigingsadres ?? "",
  loonheffingennummer: organisatie?.loonheffingennummer ?? "",
  iban: organisatie?.iban ?? "",
  fulltime: String(organisatie?.werkzamePersonenFulltime ?? 0),
  parttime: String(organisatie?.werkzamePersonenParttime ?? 0),
});

/** Vult {onderneming}, {kvkNummer}, {vestiging}, {iban}, {fulltime}, {parttime} in een tekst. */
export const vul = (tekst: string, werkgever: Werkgever) =>
  tekst.replace(/\{(\w+)\}/g, (heel, naam: string) =>
    naam in werkgever ? werkgever[naam as keyof Werkgever] : heel,
  );

const MAANDEN = [
  "januari",
  "februari",
  "maart",
  "april",
  "mei",
  "juni",
  "juli",
  "augustus",
  "september",
  "oktober",
  "november",
  "december",
];

/** "2026-11-03" wordt "3 november 2026". */
export const datumNL = (iso: string) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  return `${Number(m[3])} ${MAANDEN[Number(m[2]) - 1]} ${Number(m[1])}`;
};

/** Eurocenten uit de engine als bedrag: 89740.8 wordt "€ 897,41". */
export const euro = (eurocent: unknown) => {
  const n = Math.round(Number(eurocent)) / 100;
  return Number.isNaN(n)
    ? ""
    : `€ ${n.toLocaleString("nl-NL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/** Een engine-waarde leesbaar: bedragen, ja/nee, of de tekst. */
export const waarde = (naam: string, w: unknown) => {
  if (w === true) return "ja";
  if (w === false) return "nee";
  if (w === null || w === undefined) return "niet van toepassing";
  if (naam.includes("eurocent")) return euro(w);
  return String(w);
};

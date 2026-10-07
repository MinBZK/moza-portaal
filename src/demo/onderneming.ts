import type { DemoVraag } from "./binnenkort";
import type { DemoPersona } from "./personas";

export type DemoGegeven = { label: string; waarde: string; href?: string };

export type DemoOnderdeelLink = {
  id: string;
  titel: string;
  beschrijving: string;
  href: string;
};

const gegevens: DemoGegeven[] = [
  { label: "Handelsnaam", waarde: "Kwekerij De Bloesem" },
  { label: "KVK-nummer", waarde: "62345681" },
  { label: "Vestigingsnummer", waarde: "000062345681" },
  { label: "RSIN-nummer", waarde: "62345681" },
  { label: "Btw-identificatienummer", waarde: "NL00062345681" },
  { label: "Omzetbelastingnummer", waarde: "062345681B01" },
  { label: "Loonheffingennummer", waarde: "062345681L01" },
  { label: "Startdatum", waarde: "12 februari 2011" },
  { label: "Rechtsvorm", waarde: "Vennootschap onder firma" },
  { label: "Zakelijke IBAN", waarde: "NL62 RABO 0006 2345 68" },
  { label: "Werkzame personen (fulltime)", waarde: "5" },
  { label: "Werkzame personen (parttime)", waarde: "2" },
  {
    label: "Website",
    waarde: "www.kwekerijdebloesem.nl",
    href: "https://www.kwekerijdebloesem.nl",
  },
];

const onderdelen: DemoOnderdeelLink[] = [
  {
    id: "bedrijfsactiviteiten",
    titel: "Bedrijfsactiviteiten",
    beschrijving:
      "De SBI-codes en omschrijvingen van de activiteiten die bij uw onderneming staan geregistreerd.",
    href: "/bedrijfsgegevens/bedrijfsactiviteiten",
  },
  {
    id: "adresgegevens",
    titel: "Adresgegevens",
    beschrijving:
      "Uw vestigingsadres en postadres, zoals geregistreerd bij de Kamer van Koophandel.",
    href: "/bedrijfsgegevens/adresgegevens",
  },
  {
    id: "vestigingen",
    titel: "Vestigingen",
    beschrijving:
      "Alle vestigingen die aan uw onderneming zijn gekoppeld, inclusief nevenvestigingen.",
    href: "/bedrijfsgegevens/vestigingen",
  },
  {
    id: "ubo-register",
    titel: "UBO-register",
    beschrijving:
      "De uiteindelijk belanghebbenden die voor uw organisatie zijn geregistreerd.",
    href: "/bedrijfsgegevens/ubo-register",
  },
  {
    id: "jaarrekeningen",
    titel: "Jaarrekeningen",
    beschrijving:
      "De jaarrekeningen en financiële overzichten die uw onderneming bij de KVK heeft gedeponeerd.",
    href: "/bedrijfsgegevens/jaarrekeningen",
  },
];

const vragen: DemoVraag[] = [
  {
    vraag: "Waar komen deze gegevens vandaan?",
    antwoord:
      "Uit het Handelsregister van de KVK en uit de registratie van de Belastingdienst. MijnOverheid Zakelijk toont ze alleen.",
  },
  {
    vraag: "Een gegeven klopt niet. Hoe laat ik het wijzigen?",
    antwoord:
      "Wijzig het bij de bron. Handelsnaam, adres en rechtsvorm wijzigt u bij de KVK. Belastingnummers wijzigt u bij de Belastingdienst.",
  },
];

/**
 * Gegevens van het bedrijf van de persona. Ontbreekt een gegeven, dan staat het
 * er niet, net als in moza-poc. Zonder persona: de vaste demo-gegevens.
 */
export const getDemoOndernemingsgegevens = async (
  bedrijf?: DemoPersona["bedrijf"],
): Promise<DemoGegeven[]> => {
  if (!bedrijf) return gegevens;
  const rijen: [string, string | number | undefined][] = [
    ["Handelsnaam", bedrijf.handelsnaam],
    ["KVK-nummer", bedrijf.kvkNummer],
    ["Vestigingsnummer", bedrijf.vestigingsnummer],
    ["RSIN-nummer", bedrijf.rsinNummer],
    ["Btw-identificatienummer", bedrijf.btwNummer],
    ["Omzetbelastingnummer", bedrijf.omzetbelastingnummer],
    [
      "Loonheffingennummer",
      "loonheffingennummer" in bedrijf
        ? bedrijf.loonheffingennummer
        : undefined,
    ],
    ["Startdatum", bedrijf.startdatum],
    ["Rechtsvorm", bedrijf.rechtsvorm],
    ["Zakelijke IBAN", "iban" in bedrijf ? bedrijf.iban : undefined],
    ["Werkzame personen (fulltime)", bedrijf.werkzamePersonenFulltime],
    ["Werkzame personen (parttime)", bedrijf.werkzamePersonenParttime],
  ];
  const website = "website" in bedrijf ? bedrijf.website : undefined;
  return [
    ...rijen.flatMap(([label, waarde]) =>
      waarde === undefined || waarde === ""
        ? []
        : [{ label, waarde: String(waarde) }],
    ),
    ...(website
      ? [
          {
            label: "Website",
            waarde: website.replace(/^https?:\/\//, ""),
            href: website,
          },
        ]
      : []),
  ];
};

export const getDemoOndernemingsonderdelen = async (): Promise<
  DemoOnderdeelLink[]
> => onderdelen;

export const getDemoOndernemingsvragen = async (): Promise<DemoVraag[]> =>
  vragen;

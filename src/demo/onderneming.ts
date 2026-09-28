import type { DemoVraag } from "./binnenkort";

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
    href: "#",
  },
  {
    id: "adresgegevens",
    titel: "Adresgegevens",
    beschrijving:
      "Uw vestigingsadres en postadres, zoals geregistreerd bij de Kamer van Koophandel.",
    href: "#",
  },
  {
    id: "vestigingen",
    titel: "Vestigingen",
    beschrijving:
      "Alle vestigingen die aan uw onderneming zijn gekoppeld, inclusief nevenvestigingen.",
    href: "#",
  },
  {
    id: "ubo-register",
    titel: "UBO-register",
    beschrijving:
      "De uiteindelijk belanghebbenden die voor uw organisatie zijn geregistreerd.",
    href: "#",
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

export const getDemoOndernemingsgegevens = async (): Promise<DemoGegeven[]> =>
  gegevens;

export const getDemoOndernemingsonderdelen = async (): Promise<
  DemoOnderdeelLink[]
> => onderdelen;

export const getDemoOndernemingsvragen = async (): Promise<DemoVraag[]> =>
  vragen;

import type { DemoVraag } from "./binnenkort";
import type { DemoPersona } from "./personas";

/** Onderdelen van Bedrijfsgegevens, met teksten uit moza-poc. */
export type DemoBedrijfsonderdeel = {
  id: string;
  titel: string;
  kop: string;
  intro: string;
  vragen: DemoVraag[];
};

const onderdelen: DemoBedrijfsonderdeel[] = [
  {
    id: "bedrijfsactiviteiten",
    titel: "Bedrijfsactiviteiten",
    kop: "Geregistreerde activiteiten",
    intro:
      "Dit zijn de SBI-codes en omschrijvingen van de activiteiten die voor uw onderneming zijn geregistreerd.",
    vragen: [
      {
        vraag: "Wat is een SBI-code?",
        antwoord:
          "SBI staat voor Standaard Bedrijfsindeling. Het is een code waarmee de Kamer van Koophandel aangeeft wat uw onderneming doet. De code wordt gebruikt door overheidsinstanties, statistiekbureaus en subsidieverstrekkers om uw activiteiten te herkennen. Veel ondernemingen hebben één of meerdere SBI-codes.",
      },
      {
        vraag: "Waarom staan er meerdere SBI-codes voor mijn onderneming?",
        antwoord:
          "Veel ondernemingen verrichten meer dan één type activiteit. De eerste SBI-code is uw hoofdactiviteit; eventuele volgende codes zijn nevenactiviteiten. Voor sommige aanvragen of vergunningen wordt alleen naar de hoofdactiviteit gekeken, voor andere juist naar de combinatie van alle geregistreerde codes.",
      },
      {
        vraag: "Hoe wijzig ik mijn bedrijfsactiviteiten?",
        antwoord:
          "Voegt u nieuwe activiteiten toe, stopt u met bepaalde activiteiten, of klopt een SBI-code niet meer met wat u doet? Geef de wijziging door aan de Kamer van Koophandel via kvk.nl of bij een KVK-kantoor. Na verwerking is de bijgewerkte registratie automatisch zichtbaar op MijnOverheid Zakelijk.",
      },
    ],
  },
  {
    id: "adresgegevens",
    titel: "Adresgegevens",
    kop: "Vestigings- en postadres",
    intro:
      "Uw vestigingsadres en postadres zoals geregistreerd bij de Kamer van Koophandel.",
    vragen: [
      {
        vraag: "Wat is het verschil tussen een vestigings- en postadres?",
        antwoord:
          "Het vestigingsadres is de fysieke locatie van uw onderneming. Het postadres is het adres waarop u post wilt ontvangen. Dit kan hetzelfde zijn als het vestigingsadres, maar bijvoorbeeld ook een postbus of een ander correspondentieadres.",
      },
      {
        vraag: "Hoe wijzig ik mijn adresgegevens?",
        antwoord:
          "Adresgegevens worden bijgehouden door de Kamer van Koophandel. U kunt een adreswijziging doorgeven via kvk.nl of bij een KVK-kantoor. Na verwerking zijn de gewijzigde gegevens automatisch zichtbaar op MijnOverheid Zakelijk.",
      },
      {
        vraag: "Wie kan mijn adresgegevens inzien?",
        antwoord:
          "Vestigingsadressen van ondernemingen zijn openbaar via het KVK Handelsregister. Postadressen zijn alleen openbaar als ze afwijken van het vestigingsadres en u dit zo heeft opgegeven. Voor eenmanszaken aan huis kunt u uw vestigingsadres laten afschermen via de KVK.",
      },
    ],
  },
  {
    id: "vestigingen",
    titel: "Vestigingen",
    kop: "Geregistreerde vestigingen",
    intro:
      "Overzicht van alle vestigingen die gekoppeld zijn aan uw onderneming, inclusief nevenvestigingen.",
    vragen: [
      {
        vraag: "Wat is het verschil tussen een hoofd- en nevenvestiging?",
        antwoord:
          "Een onderneming heeft altijd één hoofdvestiging. Daarnaast kan een onderneming één of meerdere nevenvestigingen hebben, bijvoorbeeld een filiaal, werkplaats of magazijn op een ander adres. Elke vestiging heeft een eigen vestigingsnummer.",
      },
      {
        vraag: "Hoe registreer ik een nieuwe vestiging?",
        antwoord:
          "U registreert een nieuwe vestiging bij de Kamer van Koophandel via kvk.nl of bij een KVK-kantoor. Na inschrijving wordt de vestiging automatisch zichtbaar op MijnOverheid Zakelijk.",
      },
      {
        vraag: "Moet ik een nevenvestiging apart belasting laten doen?",
        antwoord:
          "Nee. Een nevenvestiging hoort fiscaal bij dezelfde onderneming. U doet één gezamenlijke aangifte voor uw hele onderneming. Wel kan een nevenvestiging gevolgen hebben voor lokale belastingen en vergunningen bij de gemeente waar de vestiging is gevestigd.",
      },
    ],
  },
  {
    id: "ubo-register",
    titel: "UBO-register",
    kop: "Uiteindelijk belanghebbenden",
    intro:
      "Inzicht in de uiteindelijk belanghebbenden (UBO’s) die voor uw organisatie zijn geregistreerd in het UBO-register van de Kamer van Koophandel.",
    vragen: [
      {
        vraag: "Wat is een UBO?",
        antwoord:
          "UBO staat voor ultimate beneficial owner, de uiteindelijk belanghebbende. Dit is de persoon die meer dan 25% van de aandelen, stemrechten of zeggenschap heeft in een organisatie. Het UBO-register draagt bij aan het voorkomen van witwassen en financiering van terrorisme.",
      },
      {
        vraag: "Welke gegevens van UBO’s zijn openbaar?",
        antwoord:
          "Een beperkt deel van de UBO-gegevens is openbaar voor partijen met een aantoonbaar legitiem belang, zoals journalisten en maatschappelijke organisaties. Het gaat om de voor- en achternaam, geboortemaand en -jaar, nationaliteit, woonland en de aard en omvang van het belang. Adres- en BSN-gegevens zijn niet openbaar.",
      },
      {
        vraag: "Hoe wijzig ik de UBO-registratie?",
        antwoord:
          "Wijzigingen in de UBO-registratie geeft u door aan de Kamer van Koophandel via kvk.nl. U bent verplicht wijzigingen binnen een week door te geven. Na verwerking zijn de bijgewerkte gegevens zichtbaar op MijnOverheid Zakelijk.",
      },
    ],
  },
  {
    id: "jaarrekeningen",
    titel: "Jaarrekeningen",
    kop: "Gedeponeerde jaarrekeningen",
    intro:
      "De bij de Kamer van Koophandel gedeponeerde jaarrekeningen en financiële overzichten van uw onderneming.",
    vragen: [
      {
        vraag: "Wanneer moet ik mijn jaarrekening deponeren?",
        antwoord:
          "U moet de jaarrekening binnen twaalf maanden na afloop van het boekjaar deponeren bij de Kamer van Koophandel. Voor kleine ondernemingen volstaat een verkorte balans en toelichting. Niet tijdig deponeren kan leiden tot een boete en, bij faillissement, aansprakelijkheid van bestuurders.",
      },
      {
        vraag: "Wie kan mijn jaarrekening inzien?",
        antwoord:
          "Gedeponeerde jaarrekeningen zijn openbaar via het KVK Handelsregister. Iedereen kan deze tegen betaling opvragen. Welke gegevens openbaar zijn, hangt af van de grootte van uw onderneming: voor micro- en kleine ondernemingen geldt een beperkte publicatieplicht.",
      },
      {
        vraag: "Hoe deponeer ik mijn jaarrekening?",
        antwoord:
          "U deponeert de jaarrekening digitaal via Standard Business Reporting (SBR) bij de Kamer van Koophandel. Uw boekhouder of accountant kan u hierbij ondersteunen. Meer informatie vindt u op kvk.nl.",
      },
    ],
  },
];

export type DemoBedrijfsdetails = {
  handelsnaam: string;
  rechtsvorm: string;
  kvkNummer: string;
  vestigingsadres?: string;
  postadres?: string;
  sbi: { code: string; omschrijving: string }[];
  vestigingen: { nummer: string; type: string; adres: string }[];
  ubo: { naam: string; aardVanBelang: string; grootteVanBelang: string }[];
  jaarrekeningen: { jaar: string; gedeponeerd: string }[];
  /** Eenmanszaken hoeven geen UBO's te registreren. */
  uboPlichtig: boolean;
  /** Alleen bv's en nv's moeten hun jaarrekening deponeren bij de KVK. */
  deponeerPlichtig: boolean;
};

const lijst = <T>(waarde: unknown): T[] =>
  Array.isArray(waarde) ? (waarde as T[]) : [];

const tekst = (waarde: unknown) =>
  typeof waarde === "string" && waarde !== "" ? waarde : undefined;

/** Gegevens van het bedrijf van een persona, zoals moza-poc ze toont. */
export const getDemoBedrijfsdetails = async (
  persona: DemoPersona,
): Promise<DemoBedrijfsdetails> => {
  const bedrijf: Record<string, unknown> = persona.bedrijf;
  const rechtsvorm = tekst(bedrijf.rechtsvorm) ?? "";
  return {
    handelsnaam: persona.bedrijf.handelsnaam,
    rechtsvorm,
    kvkNummer: persona.bedrijf.kvkNummer,
    vestigingsadres: tekst(bedrijf.vestigingsadresVolledig),
    postadres: tekst(bedrijf.postadres),
    sbi: lijst(bedrijf.sbi),
    vestigingen: lijst(bedrijf.vestigingen),
    // In moza-poc heet het veld groottevanBelang.
    ubo: lijst<{
      naam: string;
      aardVanBelang: string;
      groottevanBelang: string;
    }>(bedrijf.ubo).map(({ naam, aardVanBelang, groottevanBelang }) => ({
      naam,
      aardVanBelang,
      grootteVanBelang: groottevanBelang,
    })),
    jaarrekeningen: lijst(bedrijf.jaarrekeningen),
    uboPlichtig: rechtsvorm !== "Eenmanszaak",
    deponeerPlichtig: [
      "Besloten vennootschap",
      "Naamloze vennootschap",
    ].includes(rechtsvorm),
  };
};

export const getDemoBedrijfsonderdeel = async (
  id: string,
): Promise<DemoBedrijfsonderdeel | undefined> =>
  onderdelen.find((onderdeel) => onderdeel.id === id);

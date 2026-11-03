import proefZaken from "./proef-zaken.json";
import type { DemoVraag } from "./binnenkort";

/** Stap in de voortgang van een zaak, zoals in moza-poc. */
export type DemoZaakStap = {
  titel: string;
  /** Afgerond = laatste stap van een afgehandelde zaak. */
  soort: "voltooid" | "huidig" | "volgende" | "later" | "afgerond";
  /** Datum als tekst, soms met "sinds" of "verwacht voor". */
  datum?: string;
  /** Standaard uitgeklapt. */
  open?: boolean;
  tekst?: string[];
  /** Er wordt iets van de ondernemer verwacht. */
  waarschuwing?: string;
  /** Gegevens die de ondernemer nog moet aanleveren. */
  aanleveren?: { intro: string; items: string[]; knop: string };
};

export type DemoZaak = {
  id: string;
  soort: "lopend" | "afgehandeld";
  titel: string;
  organisatie: string;
  /** Laatste wijziging, of de datum van afhandeling. */
  datum: string;
  /** Status in het overzicht. Alleen bij lopende zaken. */
  status?: string;
  /** Toon een waarschuwing als er iets van u wordt verwacht. */
  actieNodig?: boolean;
  /** Ontstaat pas via de Digitale assistent; staat niet vast in het overzicht. */
  viaAssistent?: boolean;
  /** Toon "Over deze zaak" boven de voortgang (zoals bij de subsidie). */
  gegevensBovenaan?: boolean;
  gegevens: { label: string; waarde: string }[];
  stappen: DemoZaakStap[];
};

// Uit moza-poc (moza/lopende-zaken/*.html). Zaaknummers en data zijn fictief.
const zaken = proefZaken as DemoZaak[];

const vragen: DemoVraag[] = [
  {
    vraag: "Wat zijn lopende zaken?",
    antwoord:
      "Aanvragen, vergunningen en meldingen die u naar de overheid verstuurde en die nog in behandeling zijn. Per zaak ziet u hoe ver het staat.",
  },
  {
    vraag: "Hoe lang duurt de behandeling van mijn zaak?",
    antwoord:
      "Dat verschilt per zaak en per organisatie. Bij elke zaak ziet u de verwachte tijd en de huidige status. Duurt het langer dan wettelijk mag, dan krijgt u vanzelf bericht.",
  },
  {
    vraag: "Kan ik documenten toevoegen aan een lopende zaak?",
    antwoord:
      "Soms. Kan het bij uw zaak, dan ziet u daar een knop om bestanden toe te voegen. Staat die er niet, neem dan contact op met de organisatie die uw zaak behandelt.",
  },
];

export const getDemoZaken = async (
  soort: DemoZaak["soort"] = "lopend",
): Promise<DemoZaak[]> =>
  zaken.filter((zaak) => zaak.soort === soort && !zaak.viaAssistent);

export const getDemoZaakById = async (
  id: string,
): Promise<DemoZaak | undefined> => zaken.find((zaak) => zaak.id === id);

export const getDemoZakenVragen = async (): Promise<DemoVraag[]> => vragen;

/** Een aanvraag die is opgeslagen maar nog niet verstuurd. */
export type DemoConceptAanvraag = {
  id: string;
  titel: string;
  organisatie: string;
  /** Voor welke onderneming van de persona; zonder: de actieve onderneming. */
  onderneming?: string;
  /** Hoe lang het invullen nog duurt, als tekst. */
  tijdsduur: string;
  /** Uiterste datum om in te dienen; alleen als de wet of de organisatie er een noemt. */
  indienenVoor?: string;
  /** Waar de antwoorden vandaan komen, zoals Ondernemersplein. */
  bewaardVan?: string;
  /** Wat er van daar is overgenomen, voor de melding op de detailpagina. */
  overgenomen?: string;
  /** Alinea's onder die melding. */
  toelichting?: string[];
  /** Startwaarden voor "Wat kost het?": uren per week en brutoloon. */
  berekening?: { urenPerWeek: number; brutoPerMaand: number };
  /** Flow in het portaal die deze aanvraag uitwerkt met de regelrecht-engine; zonder flow alleen de kostenschatting. */
  flow?: "iemand-aannemen";
};

/**
 * De fictieve, nog niet verstuurde aanvraag "Iemand aannemen". Elke persona
 * heeft hem, voor de onderneming die op dat moment actief is; daarom noemt de
 * tekst geen onderneming.
 */
const iemandAannemen: DemoConceptAanvraag = {
  id: "iemand-aannemen-met-afstand-tot-de-arbeidsmarkt",
  titel: "Iemand aannemen met afstand tot de arbeidsmarkt",
  organisatie: "UWV, Belastingdienst en gemeente",
  tijdsduur: "Ongeveer 15 minuten",
  bewaardVan: "Ondernemersplein",
  overgenomen:
    "Kandidaat uit het doelgroepregister, 32 uur per week, geschatte loonwaarde 60 procent. Controleer hieronder of deze antwoorden nog kloppen. De berekening gaat ervan uit.",
  toelichting: [
    "Welke regelingen gelden, hangt af van de kandidaat. UWV, de Belastingdienst en de gemeente voeren ze uit. U hoeft niet te weten welke organisatie waarover gaat.",
    "Let op de termijnen. Is de werknemer al begonnen? Vraag loonkostensubsidie dan aan binnen zes maanden na de eerste werkdag. Loondispensatie geldt pas vanaf de maand waarin die is aangevraagd. Een doelgroepverklaring vraagt de werknemer aan binnen drie maanden na de start.",
  ],
  flow: "iemand-aannemen",
};

export const getDemoConceptAanvragen = async (
  personaId?: string,
): Promise<DemoConceptAanvraag[]> => (personaId ? [iemandAannemen] : []);

export const getDemoConceptAanvraagById = async (
  personaId: string | undefined,
  id: string,
): Promise<DemoConceptAanvraag | undefined> =>
  (await getDemoConceptAanvragen(personaId)).find(
    (aanvraag) => aanvraag.id === id,
  );

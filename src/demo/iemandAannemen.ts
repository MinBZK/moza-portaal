import koen from "./iemand-aannemen-koen.json";
import wajong from "./iemand-aannemen-wajong.json";
import wia from "./iemand-aannemen-wia.json";
import traces from "./iemand-aannemen-traces.json";

/**
 * Iemand aannemen met een afstand tot de arbeidsmarkt (Digitale assistent 2.0,
 * usecase Financieel CV). De kandidaat is Koen de Wit; de werkgever is de
 * actieve persona. Bedragen en uitkomsten komen uit de regelrecht-engine en
 * staan hier als data; de pagina's rekenen niets. Zie
 * docs/iemand-aannemen/verhaallijn-koen-v1.md.
 */

export type DemoAannemenGegeven = {
  /** De vraag in gewone taal. */
  vraag: string;
  /** Dezelfde vraag zoals de wet hem stelt. */
  wetsvraag: string;
  /** Naam van het gegeven in het wetmodel van de engine. */
  parameter: string;
  /** Kan plaatshouders bevatten: {onderneming} {kvkNummer} {vestiging} {fulltime} {parttime} {uren}. */
  waarde: string;
  grond: string;
};

export type DemoAannemenBron = {
  id: "uwv" | "gemeente" | "kvk" | "belastingdienst" | "eigen";
  organisatie: string;
  register: string;
  /** ISO-datum waarop de gegevens zijn opgehaald. */
  opgehaald: string;
  gegevens: DemoAannemenGegeven[];
};

export type DemoAannemenRegeling = {
  id: string;
  naam: string;
  organisatie: string;
  soort:
    | "concept-aanvraag"
    | "loonaangifte"
    | "overheid-zelf"
    | "optioneel"
    | "niet";
  soortLabel: string;
  uitkomst: string;
  bedragLabel: string;
  bedragToelichting: string;
  bedragEurocent: number | null;
  tekst: string;
  /** Zonder naam van de kandidaat, voor het scherm vóór de aanvraag. */
  tekstAlgemeen?: string;
  grond: string;
  /** Sleutel in de traces: "<wet>:<output>". */
  trace: string;
  actie: { label: string; url: string } | null;
};

export type DemoAannemenGebeurtenis = {
  id: string;
  /** ISO-datum. */
  datum: string;
  tijd: string;
  actor: string;
  soort: "regelgeving" | "besluit" | "uitvoering";
  titel: string;
  /**
   * Kan plaatshouders bevatten: {onderneming} {iban} {uren} (aantal uur per
   * week) {loonwaarde} (percentage, "60 procent") {lksPerMaand}
   * {lksTweeMaanden} {aanspraakPerUur} {lkvPerJaar} (bedragen, "€ 897,41").
   */
  tekst: string;
  grond: string;
  /** Vanaf welke stand van de zaak de gebeurtenis zichtbaar is. */
  /** "vooraf" of het id van een fase van de situatie. */
  stap: string;
  url?: string;
  /** Deze gebeurtenis corrigeert een eerdere (die blijft staan als "gecorrigeerd"). */
  herstelt?: string;
  gecorrigeerdDoor?: string;
  verwijstNaar?: string;
};

export type DemoAannemenFase = {
  id: string;
  label: string;
  datum: string;
};

export type DemoAannemen = {
  toelichting: string;
  kandidaat: {
    voornaam: string;
    achternaam: string;
    geboortedatum: string;
    leeftijd: number;
    woonplaats: string;
    gemeente: string;
    bsnMasker: string;
    toestemmingOp: string;
  };
  dienstverband: {
    functie: string;
    urenPerWeek: number;
    aanvang: string;
    uurloonEurocent: number;
    uurloonLabel: string;
    verloondeUrenPerJaar: number;
    soort: string;
  };
  zaak: {
    nummer: string;
    organisatie: string;
    onderwerp: string;
    regel: string;
    url: string;
  };
  /** Beslissing van de uitvoerder, voor de situaties met een besluit voor de werkgever. */
  besluit?: { organisatie: string; datum: string; bezwaar: string };
  bronnen: DemoAannemenBron[];
  /** Alleen in de situatie gemeente; de andere situaties halen dit uit de engine. */
  regelingen?: DemoAannemenRegeling[];
  berekeningLks?: {
    toelichting: string;
    stappen: {
      label: string;
      waarde: string;
      grond: string;
      parameter: string;
    }[];
  };
  fasen: DemoAannemenFase[];
  gebeurtenissen: DemoAannemenGebeurtenis[];
  komtHierna: {
    datum: string;
    actor: string;
    titel: string;
    tekst: string;
    grond: string;
  }[];
  /** Nederlandse labels voor de tussenuitkomsten van de engine. */
  labels: Record<string, string>;
};

/** Eén trace van de regelrecht-engine: gegevens erin, tussenuitkomsten en resultaat eruit. */
export type DemoAannemenTrace = {
  wet: string;
  uitkomst: string;
  peildatum: string;
  scenario: string;
  gegevens: Record<string, unknown>;
  tussenuitkomsten: Record<string, unknown>;
  /** Het resultaat van de gevraagde output(s): een waarde of een map per output. */
  resultaat: unknown;
  stappen: { tekst: string; artikel: string | null }[];
  /** [wet, artikel, lid] per geraakt artikel. */
  ankers: string[][];
};

export type DemoAannemenSituatie = "gemeente" | "wajong" | "wia";

const situaties: Record<DemoAannemenSituatie, DemoAannemen> = {
  gemeente: koen as DemoAannemen,
  wajong: wajong as DemoAannemen,
  wia: wia as DemoAannemen,
};
const alleTraces = traces as unknown as Record<string, DemoAannemenTrace>;

export const getDemoIemandAannemen = async (): Promise<DemoAannemen> =>
  situaties.gemeente;

export const getDemoIemandAannemenSituaties = async (): Promise<
  Record<DemoAannemenSituatie, DemoAannemen>
> => situaties;

export const getDemoIemandAannemenTraces = async (): Promise<
  Record<string, DemoAannemenTrace>
> => alleTraces;

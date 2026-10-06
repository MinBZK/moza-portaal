export type DemoBericht = {
  id: string;
  afzenderId: string;
  afzender: string;
  onderwerp: string;
  /** Alinea's van het bericht. */
  inhoud: string[];
  /** Datum als JJJJ-MM-DD. */
  datum: string;
  isOngelezen: boolean;
  heeftBijlage: boolean;
};

const AANTAL_BERICHTEN = 120;
const AANTAL_ONGELEZEN = 12;

const AFZENDERS = [
  { id: "belastingdienst", naam: "Belastingdienst" },
  { id: "kvk", naam: "Kamer van Koophandel" },
  { id: "rvo", naam: "Rijksdienst voor Ondernemend Nederland" },
  { id: "svb", naam: "Sociale Verzekeringsbank" },
  { id: "uwv", naam: "UWV" },
  { id: "rdw", naam: "RDW" },
  { id: "cbs", naam: "Centraal Bureau voor de Statistiek" },
  { id: "ind", naam: "IND" },
  { id: "ap", naam: "Autoriteit Persoonsgegevens" },
  { id: "kadaster", naam: "Kadaster" },
  { id: "nla", naam: "Nederlandse Arbeidsinspectie" },
  { id: "gem-s-gravenhage", naam: "Gemeente 's-Gravenhage" },
  { id: "gem-voorburg", naam: "Gemeente Voorburg" },
  { id: "gem-rotterdam", naam: "Gemeente Rotterdam" },
];

const ONDERWERPEN: Record<string, string[]> = {
  belastingdienst: [
    "Voorlopige aanslag inkomstenbelasting 2025",
    "Btw-aangifte eerste kwartaal beschikbaar",
    "Beschikking kleineondernemersregeling",
    "Vooraankondiging btw-controle",
    "Bevestiging aangifte omzetbelasting",
  ],
  kvk: [
    "Bevestiging inschrijving handelsregister",
    "Wijziging bestuurder geregistreerd",
    "Herinnering jaarstukken deponeren",
    "Bevestiging uittreksel aangevraagd",
  ],
  rvo: [
    "Subsidie SLIM toegekend",
    "Aanvraag MIT-regeling in behandeling",
    "Beschikking WBSO 2025",
    "Betaalspecificatie subsidie",
  ],
  svb: ["Bevestiging AOW-aanvraag", "Wijziging uitkering doorgegeven"],
  uwv: ["Aanvraag WW verwerkt", "Loonheffingskorting gewijzigd"],
  rdw: ["Kenteken overgeschreven", "APK-herinnering bedrijfsauto"],
  cbs: ["Verzoek productie-enquête", "Herinnering statistiek-opgave"],
  ind: ["Besluit aanvraag kennismigrant"],
  ap: ["Melding datalek ontvangen"],
  kadaster: ["Inschrijving eigendomsoverdracht"],
  nla: ["Aangekondigde controle arbeidsomstandigheden"],
  gemeente: [
    "Aanslag toeristenbelasting",
    "Aanslag reclamebelasting",
    "Vergunning evenement verleend",
    "Bevestiging melding openbare ruimte",
    "Aanslag onroerendezaakbelasting",
    "Besluit ontheffing venstertijden",
    "Besluit terrasvergunning",
    "Parkeervergunning verleend",
    "Handhavingsbesluit reclame-uiting",
    "Melding werkzaamheden openbare weg",
  ],
};

// Vaste seed: elke build levert dezelfde berichten, dus ook dezelfde links.
let seed = 42;
const rnd = () => {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
};
const kies = <T>(lijst: T[]): T => lijst[Math.floor(rnd() * lijst.length)];

const standaardInhoud = (afzender: string, onderwerp: string) => [
  "Geachte ondernemer,",
  `Dit bericht van ${afzender} gaat over "${onderwerp}".`,
  `Heeft u vragen over dit bericht? Neem dan contact op met ${afzender}.`,
];

const datumVoorIndex = (index: number) => {
  const dagenTerug =
    Math.floor((index / AANTAL_BERICHTEN) * 180) + Math.floor(rnd() * 4);
  const datum = new Date(Date.UTC(2026, 3, 10 - dagenTerug));
  return datum.toISOString().slice(0, 10);
};

const gegenereerd: DemoBericht[] = Array.from(
  { length: AANTAL_BERICHTEN },
  (_, index) => {
    const afzender = kies(AFZENDERS);
    const onderwerp = kies(ONDERWERPEN[afzender.id] ?? ONDERWERPEN.gemeente);
    return {
      id: `bericht-${String(index + 1).padStart(4, "0")}`,
      afzenderId: afzender.id,
      afzender: afzender.naam,
      onderwerp,
      inhoud: standaardInhoud(afzender.naam, onderwerp),
      datum: datumVoorIndex(index),
      isOngelezen: index < AANTAL_ONGELEZEN,
      heeftBijlage: rnd() < 0.4,
    };
  },
);

const belastingdienst: DemoBericht[] = [
  {
    onderwerp: "Aangifte vennootschapsbelasting 2025 beschikbaar",
    datum: "2026-04-22",
    isOngelezen: true,
    heeftBijlage: true,
    inhoud: [
      "U kunt nu aangifte vennootschapsbelasting over 2025 doen. In deze aangifte geeft u de winst van uw onderneming over het afgelopen jaar op.",
      "Doe de aangifte voor 1 juni 2026. Heeft u meer tijd nodig? Dan kunt u uitstel aanvragen.",
    ],
  },
  {
    onderwerp: "Naheffingsaanslag omzetbelasting eerste kwartaal 2026",
    datum: "2026-04-18",
    isOngelezen: true,
    heeftBijlage: true,
    inhoud: [
      "U heeft over het eerste kwartaal van 2026 te weinig btw betaald. Daarom legt de Belastingdienst een naheffingsaanslag op van € 1.284,00.",
      "Betaal dit bedrag voor 15 mei 2026. Betaalt u niet op tijd? Dan komt er rente bij en kunt u een boete krijgen.",
      "Bent u het niet eens met deze aanslag? Dan kunt u binnen 6 weken na de datum van dit bericht bezwaar maken.",
    ],
  },
  {
    onderwerp: "Beschikking uitstel van betaling",
    datum: "2026-04-12",
    isOngelezen: false,
    heeftBijlage: false,
    inhoud: [
      "Uw verzoek om uitstel van betaling is toegekend. U krijgt langer de tijd om uw openstaande aanslag te betalen.",
      "U betaalt volgens de betalingsregeling die voor u is vastgesteld. Bekijk de regeling om te zien welke bedragen u wanneer betaalt.",
    ],
  },
  {
    onderwerp: "Herinnering aangifte loonheffingen",
    datum: "2026-04-05",
    isOngelezen: false,
    heeftBijlage: true,
    inhoud: [
      "U heeft de aangifte loonheffingen over de laatste periode nog niet gedaan. Doe deze aangifte zo snel mogelijk.",
      "Doe de aangifte voor 30 april 2026. Doet u dit niet op tijd? Dan kunt u een boete krijgen.",
    ],
  },
].map((bericht, index) => ({
  ...bericht,
  id: `bericht-${String(AANTAL_BERICHTEN + index + 1).padStart(4, "0")}`,
  afzenderId: "belastingdienst",
  afzender: "Belastingdienst",
}));

/**
 * Nieuwste eerst, maar de afzenders om de beurt. Anders staat de eerste pagina
 * vol met berichten van een organisatie, en lijkt het alsof u in de
 * berichtenbox van die organisatie zit.
 */
const spreidOverAfzenders = (lijst: DemoBericht[]) => {
  const opDatum = [...lijst].sort((a, b) => b.datum.localeCompare(a.datum));
  const perAfzender = new Map<string, DemoBericht[]>();
  for (const bericht of opDatum) {
    const bak = perAfzender.get(bericht.afzenderId) ?? [];
    bak.push(bericht);
    perAfzender.set(bericht.afzenderId, bak);
  }
  const bakken = [...perAfzender.values()];
  const resultaat: DemoBericht[] = [];
  while (resultaat.length < opDatum.length) {
    for (const bak of bakken) {
      const volgende = bak.shift();
      if (volgende) resultaat.push(volgende);
    }
  }
  return resultaat;
};

const berichten = spreidOverAfzenders([...gegenereerd, ...belastingdienst]);

/** Fictieve berichten voor de Berichtenbox. Zie ./README.md */
export const getDemoBerichten = async (): Promise<DemoBericht[]> => berichten;

export const getDemoBerichtById = async (
  id: string,
): Promise<DemoBericht | undefined> =>
  berichten.find((bericht) => bericht.id === id);

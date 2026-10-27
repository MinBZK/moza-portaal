import type {
  AssistentPersona,
  Bron,
  ServerStatus,
  WalletData,
} from "./_types";
import { getal } from "./_logica";

/**
 * Het draaiboek van de demo-modus, uit moza-poc
 * (assets/javascript/digitale-assistent-demo.js). Het levert dezelfde events
 * als de backend (status, tool, case, answer, error), dus de chat toont ze via
 * hetzelfde renderpad. Geen model en geen willekeur: elke keer hetzelfde, zodat
 * het bruikbaar is in onderzoek en presentaties.
 */

export type DemoStap = {
  wacht: number;
  event: "status" | "tool" | "case" | "answer" | "error";
  data: Record<string, unknown>;
};

/** Waar het gesprek in het draaiboek staat. Wordt gewist bij een nieuw gesprek. */
export type DemoStand = { scenario: string | null; beurt: number };

// Dezelfde KVK-nummers als de allowlist van de backend (TEST_KVK_NUMMERS).
const KVK_TOEGESTAAN = ["85234567", "62345681", "56789012"];

/** Zonder backend zijn alle bronnen "bereikbaar"; anders leest het als storing. */
export const DEMO_STATUS: ServerStatus = {
  servers: {
    regelrecht: "verbonden",
    rvo: "verbonden",
    netbeheerder: "verbonden",
    kvk: "verbonden",
    koop: "verbonden",
  },
  cli: {
    regelrecht: "verbonden",
    rvo: "verbonden",
    netbeheerder: "verbonden",
    kvk: "verbonden",
    koop: "verbonden",
  },
};

/** Normaal uit RegelRecht (/regelrecht/definities). */
export const DEMO_DREMPEL = { kwh: 50000, gas: 25000 };

// Bewust boven de drempel: anders loopt de hoofdroute dood.
const VERBRUIK_STANDAARD = { elektriciteitKwh: 61250, gasM3: 9800 };

type Verbruik = {
  jaarlijks_elektriciteitsverbruik_kwh: number;
  jaarlijks_gasverbruik_m3: number;
};

export const walletData = (
  bedrijf?: AssistentPersona["bedrijf"],
): WalletData & { verbruik: { totaal: Verbruik } } => {
  const energie = bedrijf?.energie ?? VERBRUIK_STANDAARD;
  return {
    credential: { uitgegeven_door: "Stedin (demo)", peiljaar: 2025 },
    toestemming: { met_toestemming_ondernemer: true },
    verbruik: {
      totaal: {
        jaarlijks_elektriciteitsverbruik_kwh:
          Number(energie.elektriciteitKwh) || 0,
        jaarlijks_gasverbruik_m3: Number(energie.gasM3) || 0,
      },
    },
  };
};

const BRONNEN_ENERGIE: Bron[] = [
  {
    label: "KOOP Regelingenbank",
    titel: "Besluit activiteiten leefomgeving, artikel 5.15",
    url: "https://wetten.overheid.nl/BWBR0041330/",
  },
  {
    label: "RVO",
    titel: "Informatieplicht energiebesparing: rapportagetermijn",
    url: "https://www.rvo.nl/onderwerpen/informatieplicht-energiebesparing",
  },
];

const BRONNEN_WALLET: Bron[] = [
  {
    label: "Business Wallet",
    titel: "Energieverbruik-attestatie, afgegeven door uw netbeheerder",
  },
];

const BRONNEN_KVK: Bron[] = [
  {
    label: "KVK Handelsregister",
    titel: "Uittreksel onderneming: rechtsvorm, SBI-code en vestiging",
    url: "https://www.kvk.nl/handelsregister/",
  },
];

const stap = (
  wacht: number,
  event: DemoStap["event"],
  data: Record<string, unknown>,
): DemoStap => ({ wacht, event, data });

// Een antwoord zonder bronnen is een keuze: dat antwoord raadpleegde geen bron.
const antwoord = (
  wacht: number,
  message: string,
  extra: Record<string, unknown> = {},
) => stap(wacht, "answer", { message, session_id: "demo-sessie", ...extra });

const energieDeelverzoekBeurt = () => [
  stap(700, "status", { message: "koop__zoek_regeling" }),
  stap(1100, "status", { message: "regelrecht__toets" }),
  antwoord(
    900,
    `De energiebesparingsinformatieplicht geldt voor bedrijven die per jaar meer dan ${getal(DEMO_DREMPEL.kwh)} kWh elektriciteit of ${getal(DEMO_DREMPEL.gas)} m³ aardgas gebruiken. Om dat voor u uit te rekenen heb ik uw energieverbruik nodig.\n\nUw netbeheerder heeft dat verbruik als verklaring in uw Business Wallet gezet. Ik haal het pas op nadat u daar toestemming voor geeft.`,
    {
      bronnen: BRONNEN_ENERGIE,
      toestemming_nodig: {
        bron: "uw Business Wallet",
        omschrijving:
          "De assistent wil uw energieverbruik-attestatie gebruiken, afgegeven door uw netbeheerder. Er wordt niets opgehaald voordat u akkoord geeft.",
      },
    },
  ),
];

const energieToolStap = (wallet: WalletData) =>
  stap(1000, "tool", {
    tool: "netbeheerder__verbruik",
    message: "netbeheerder__verbruik",
    data: wallet,
    provenance: {
      source: "EU Business Wallet (demo)",
      issuer: "Stedin (demo, uitgever)",
    },
  });

const energieBeurten = (bedrijf?: AssistentPersona["bedrijf"]) => {
  const wallet = walletData(bedrijf);
  const kwh = wallet.verbruik.totaal.jaarlijks_elektriciteitsverbruik_kwh;
  const m3 = wallet.verbruik.totaal.jaarlijks_gasverbruik_m3;
  const boven = kwh > DEMO_DREMPEL.kwh || m3 > DEMO_DREMPEL.gas;
  const verbruik = `U gebruikt ${getal(kwh)} kWh elektriciteit en ${getal(m3)} m³ aardgas per jaar.`;

  if (!boven) {
    return [
      energieDeelverzoekBeurt(),
      [
        stap(600, "status", { message: "netbeheerder__zoek_aansluiting" }),
        energieToolStap(wallet),
        stap(900, "status", { message: "regelrecht__toets" }),
        antwoord(
          1100,
          `${verbruik} Daarmee blijft u onder beide grenzen, dus de informatieplicht geldt niet voor uw bedrijf. U hoeft niets te rapporteren.\n\nGaat u meer verbruiken, dan kan de plicht alsnog gaan gelden.`,
          { bronnen: [...BRONNEN_WALLET, ...BRONNEN_ENERGIE] },
        ),
      ],
      [
        antwoord(
          900,
          "Wilt u weten welke energiebesparende maatregelen u vrijwillig kunt nemen?",
        ),
      ],
    ];
  }

  return [
    energieDeelverzoekBeurt(),
    [
      stap(600, "status", { message: "netbeheerder__zoek_aansluiting" }),
      energieToolStap(wallet),
      stap(900, "status", { message: "regelrecht__toets" }),
      antwoord(
        1100,
        `${verbruik} Daarmee komt u boven de grens, dus de informatieplicht geldt voor uw bedrijf. U rapporteert uiterlijk 1 december 2026 bij de RVO.\n\nWelke maatregelen voor u gelden, hangt af van wat er in uw bedrijf aanwezig is. Kies hieronder de onderdelen die bij u voorkomen.`,
        {
          bronnen: [...BRONNEN_WALLET, ...BRONNEN_ENERGIE],
          vraag: {
            titel: "Wat is er in uw bedrijf aanwezig?",
            intro:
              "De erkende maatregelenlijst kent achtentwintig categorieën. U ziet alleen de categorieën die bij uw keuze horen.",
            bron: "RegelRecht",
            velden: [
              {
                naam: "AANWEZIGE_CATEGORIEEN",
                label: "Onderdelen in uw bedrijf",
                type: "categorieen",
                groepen: [
                  {
                    onderdeel: "Gebouwen",
                    opties: [
                      "Ruimteverwarming",
                      "Verlichting",
                      "Isolatie van de schil",
                      "Warm tapwater",
                    ],
                  },
                  {
                    onderdeel: "Faciliteiten",
                    opties: [
                      "Koeling en vriezen",
                      "Ventilatie",
                      "Liften en roltrappen",
                    ],
                  },
                  {
                    onderdeel: "Processen",
                    opties: ["Perslucht", "Pompen", "Warmteterugwinning"],
                  },
                ],
              },
            ],
          },
        },
      ),
    ],
    [
      stap(700, "status", { message: "regelrecht__maatregelen" }),
      antwoord(
        1200,
        "Op basis van uw antwoorden gelden 5 erkende maatregelen voor uw bedrijf. Geef per maatregel aan of u die al heeft uitgevoerd.",
        {
          bronnen: BRONNEN_ENERGIE,
          vraag: {
            titel: "Erkende Maatregelenlijst (EML 2023)",
            intro: "Deze maatregelen horen bij de categorieën die u koos.",
            tekst: "Geef per maatregel aan of deze is uitgevoerd.",
            bron: "RegelRecht",
            velden: [
              {
                naam: "GC1",
                label:
                  "GC1 – Pas een klokregeling toe en regel deze in (ruimteverwarming)",
                type: "radio",
                opties: ["Uitgevoerd", "Niet uitgevoerd"],
              },
              {
                naam: "GC3",
                label: "GC3 – Pas een weersafhankelijke regeling toe",
                type: "radio",
                opties: ["Uitgevoerd", "Niet uitgevoerd"],
              },
              {
                naam: "GF4",
                label:
                  "GF4 – Vervang gloei-, halogeen- en spaarlampen door LED-lampen",
                type: "radio",
                opties: ["Uitgevoerd", "Niet uitgevoerd"],
                waarde: "Uitgevoerd",
                toelichting:
                  "Alvast ingevuld op basis van uw subsidieaanvraag van 4 maart 2026. Klopt dit niet, wijzig het dan.",
              },
              {
                naam: "FD3",
                label:
                  "FD3 – Pas nachtafdekking toe bij semi-verticale koelmeubels",
                type: "radio",
                opties: ["Uitgevoerd", "Niet uitgevoerd"],
              },
              {
                naam: "FD7",
                label:
                  "FD7 – Isoleer de wanden van koelcellen om warmte buiten te houden",
                type: "radio",
                opties: ["Uitgevoerd", "Niet uitgevoerd"],
              },
            ],
          },
        },
      ),
    ],
    [
      stap(700, "status", { message: "rvo__rapportage_indienen" }),
      stap(1200, "case", {
        data: {
          organisatie: "Rijksdienst voor Ondernemend Nederland",
          onderwerp: "Rapportage informatieplicht energiebesparing",
          referentienummer: "RVO-2026-DEMO-0041",
          status: "In behandeling",
          ingediend_op: "2026-08-20",
          zaak_type: "Rapportage",
        },
      }),
      antwoord(
        800,
        "Uw rapportage is ingediend bij de RVO onder referentienummer RVO-2026-DEMO-0041. U hoort binnen vijf werkdagen of de rapportage compleet is.\n\nDe maatregelen die u nog niet heeft uitgevoerd, blijven verplicht. Uw omgevingsdienst houdt daar toezicht op.",
        { bronnen: BRONNEN_ENERGIE },
      ),
    ],
    [
      antwoord(
        900,
        "De rapportage staat klaar in Lopende zaken. Wilt u nog iets weten over de maatregelen die nog openstaan, of over de termijn?",
      ),
    ],
  ];
};

const bedrijfsgegevensBeurten = (bedrijf: AssistentPersona["bedrijf"] = {}) => {
  const sbi = bedrijf.sbi;
  const regels = [
    ["Naam", bedrijf.handelsnaam],
    ["KVK-nummer", bedrijf.kvkNummer],
    ["Rechtsvorm", bedrijf.rechtsvorm],
    ["SBI-code", sbi ? `${sbi.code} – ${sbi.omschrijving}` : ""],
    ["Vestiging", bedrijf.vestiging],
    ["Datum inschrijving", bedrijf.startdatum],
  ]
    .filter(([, waarde]) => waarde)
    .map(([label, waarde]) => `- **${label}:** ${waarde}`)
    .join("\n");

  return [
    [
      antwoord(
        900,
        "Uw bedrijfsgegevens staan in het Handelsregister van de KVK. Ik kan ze voor u ophalen, maar doe dat pas nadat u toestemming geeft.",
        {
          toestemming_nodig: {
            bron: "het KVK Handelsregister",
            omschrijving:
              "De assistent wil uw naam, rechtsvorm, SBI-code en vestigingsadres ophalen uit het Handelsregister. Er wordt niets opgehaald voordat u akkoord geeft.",
          },
        },
      ),
    ],
    [
      stap(700, "status", { message: "kvk__zoek_onderneming" }),
      antwoord(
        1100,
        `Dit staat er over uw onderneming in het Handelsregister:\n\n${regels}\n\nKloppen deze gegevens niet, dan wijzigt u ze bij de KVK.`,
        { bronnen: BRONNEN_KVK },
      ),
    ],
    [
      antwoord(
        900,
        "Wilt u dat ik nog iets anders opzoek over uw onderneming?",
      ),
    ],
  ];
};

const belastingBeurten = (bedrijf: AssistentPersona["bedrijf"] = {}) => {
  const btwRegel = `\n- uw omzetbelastingnummer${bedrijf.omzetbelastingnummer ? ` ${bedrijf.omzetbelastingnummer}` : ""}`;
  return [
    [
      antwoord(
        1000,
        "Ik help u de aangifte omzetbelasting voorbereiden. Daarvoor heb ik twee dingen van u nodig.",
        {
          vraag: {
            titel: "Aangifte omzetbelasting voorbereiden",
            intro:
              "Uw antwoorden bepalen welke termijn en welke velden voor u gelden.",
            bron: "RegelRecht",
            velden: [
              {
                naam: "KWARTAALAANGIFTE",
                label: "Doet u aangifte per kwartaal?",
                type: "radio",
                opties: ["Ja", "Nee"],
              },
              {
                naam: "BUITENLANDSE_OMZET",
                label:
                  "Levert u goederen of diensten aan klanten buiten Nederland?",
                type: "radio",
                opties: ["Ja", "Nee"],
              },
              {
                naam: "omzet",
                label: "Wat was uw omzet over het laatste kwartaal (in euro)?",
                type: "tekst",
              },
            ],
          },
        },
      ),
    ],
    [
      stap(700, "status", { message: "regelrecht__toets" }),
      antwoord(
        1100,
        `Dank u. Uw aangifte over het derde kwartaal van 2026 moet uiterlijk **31 oktober 2026** binnen zijn bij de Belastingdienst.\n\nWat u klaarzet:\n\n- het overzicht van uw omzet en de btw die u in rekening bracht\n- de btw die u zelf betaalde over inkopen${btwRegel}\n\nDe aangifte zelf doet u in Mijn Belastingdienst Zakelijk. Ik kan er niet namens u een indienen.`,
      ),
    ],
    [
      antwoord(
        900,
        "Wilt u dat ik de termijn als herinnering in uw Lopende zaken zet?",
      ),
    ],
  ];
};

const foutmelding = () => [
  stap(900, "error", {
    message:
      "De assistent kan RegelRecht op dit moment niet bereiken. Probeer het over een paar minuten opnieuw.",
  }),
];

const nietIngelogd = () => [
  antwoord(
    900,
    "Ik kan uw gegevens nog niet ophalen, omdat u niet bent ingelogd. Log eerst in met eHerkenning. Daarna kan ik uw bedrijfsgegevens en uw verbruik voor u opzoeken.",
  ),
];

// "Niet delen" schuift het draaiboek niet vooruit: anders toont de demo alsnog
// de gegevens die de gebruiker net weigerde.
const geweigerd = () => [
  antwoord(
    900,
    "Begrijpelijk. Ik raadpleeg die bron niet. Zonder die gegevens kan ik niet voor u uitrekenen of de regel geldt.\n\nU kunt de gegevens zelf opzoeken bij de organisatie die ze beheert, of het deelverzoek alsnog goedkeuren door uw vraag opnieuw te stellen.",
  ),
];

const uitleg = () => [
  antwoord(
    1100,
    "In gewone woorden: de vragen hierboven komen uit de erkende maatregelenlijst. Op die lijst staan maatregelen waarvan de overheid al heeft vastgesteld dat ze zich binnen vijf jaar terugverdienen.\n\nPer maatregel geeft u aan of u die al heeft uitgevoerd. Twijfelt u? Kies dan “Niet uitgevoerd”. U mag later melden dat u de maatregel alsnog heeft genomen.\n\nHet formulier blijft staan, dus u kunt het nu invullen.",
  ),
];

const algemeen = () => [
  stap(700, "status", { message: "koop__zoek_regeling" }),
  antwoord(
    1100,
    "In de demo-modus praat de assistent niet met een model, maar speelt die een vast draaiboek af. Probeer een van deze vragen om een volledige route te zien:\n\n- Geldt de energiebesparingsinformatieplicht voor mij?\n- Hoe kan ik mijn bedrijfsgegevens bekijken?\n- Hoe bereid ik mijn belastingaangifte voor?\n\nTyp “fout” om te zien wat er gebeurt als een bron niet bereikbaar is.",
  ),
];

const SCENARIOS: Record<
  string,
  (bedrijf?: AssistentPersona["bedrijf"]) => DemoStap[][]
> = {
  energie: energieBeurten,
  bedrijfsgegevens: bedrijfsgegevensBeurten,
  belasting: belastingBeurten,
};

const herkenScenario = (bericht: string) => {
  if (
    /energie|informatieplicht|besparing|verbruik|eml|maatregel/i.test(bericht)
  )
    return "energie";
  if (/bedrijfsgegeven|handelsregister|\bkvk\b|inschrijving|sbi/i.test(bericht))
    return "bedrijfsgegevens";
  if (/belasting|aangifte|\bbtw\b|omzetbelasting|fiscaal/i.test(bericht))
    return "belasting";
  return null;
};

/** De events van deze beurt. Schuift `stand` een beurt op. */
export const kiesDemoBeurt = (
  bericht: string,
  stand: DemoStand,
  context: { kvkNummer: string; bedrijf?: AssistentPersona["bedrijf"] },
): DemoStap[] => {
  if (context.kvkNummer && !KVK_TOEGESTAAN.includes(context.kvkNummer))
    return nietIngelogd();
  if (/^leg mij dit uit/i.test(bericht)) return uitleg();
  if (/geen toestemming/i.test(bericht)) return geweigerd();
  if (/\b(fout|storing|error|onbereikbaar)\b/i.test(bericht))
    return foutmelding();

  const herkend = herkenScenario(bericht);
  if (herkend && herkend !== stand.scenario) {
    stand.scenario = herkend;
    stand.beurt = 0;
  }
  if (!stand.scenario) return algemeen();

  const beurten = SCENARIOS[stand.scenario](context.bedrijf);
  const index = Math.min(stand.beurt, beurten.length - 1);
  stand.beurt = index + 1;
  return beurten[index];
};

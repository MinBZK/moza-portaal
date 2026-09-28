import type { DemoOnderdeel } from "./types";

export type DemoSubsidie = DemoOnderdeel & {
  verstrekker: string;
  type: string;
  aanvraagperiode: string;
  maximaalBedrag: string;
  alinea: string[];
  websiteLabel: string;
  href: string;
};

const subsidies: DemoSubsidie[] = [
  {
    id: "voucher-duurzaam-ondernemen",
    titel: "Voucher Duurzaam Ondernemen voor Adviesbureaus",
    samenvatting:
      "Advies- en consultancybureaus kunnen een voucher aanvragen voor het verduurzamen van hun dienstverlening en kantoorvoering. Maximaal 10.000 euro per onderneming.",
    verstrekker: "RVO",
    type: "Voucher",
    aanvraagperiode: "Opengesteld sinds 14 april 2026",
    maximaalBedrag: "10.000 euro",
    alinea: [
      "De Voucher Duurzaam Ondernemen is specifiek gericht op de advies- en consultancybranche. Met deze voucher kunt u extern advies inhuren voor het verduurzamen van uw bedrijfsvoering, of investeren in maatregelen die uw CO2-voetafdruk verkleinen.",
      "Denk aan energiebesparende maatregelen op kantoor, het overstappen op duurzaam vervoer voor zakelijke reizen, of het ontwikkelen van een duurzaamheidsstrategie voor uw dienstverlening aan klanten. Ook digitale oplossingen die reizen overbodig maken komen in aanmerking.",
      "De voucher heeft een waarde van maximaal 10.000 euro en dekt 75% van de gemaakte kosten. U vraagt de voucher aan via RVO. De regeling is sinds 14 april 2026 opengesteld en loopt tot het budget op is.",
    ],
    websiteLabel: "Bekijk op de website van RVO",
    href: "#",
  },
  {
    id: "wbso-innovatie",
    titel: "WBSO voor kleine ondernemingen",
    samenvatting:
      "Werkt u aan een nieuw product of een nieuwe dienst? Met de WBSO betaalt u minder loonheffing over de uren die u aan onderzoek besteedt.",
    verstrekker: "RVO",
    type: "Belastingvoordeel",
    aanvraagperiode: "Het hele jaar aan te vragen",
    maximaalBedrag: "Afhankelijk van uw uren",
    alinea: [
      "De WBSO verlaagt de loonkosten voor onderzoek en ontwikkeling. U houdt een urenadministratie bij van het werk aan uw project.",
      "U vraagt de WBSO minstens een maand voor de start van uw project aan. Doet u dat later, dan telt alleen de periode na uw aanvraag mee.",
    ],
    websiteLabel: "Bekijk op de website van RVO",
    href: "#",
  },
  {
    id: "praktijkleren",
    titel: "Subsidieregeling praktijkleren",
    samenvatting:
      "Leidt u een student of leerling op in uw bedrijf? Dan krijgt u een tegemoetkoming in de begeleidingskosten.",
    verstrekker: "DUS-I",
    type: "Subsidie",
    aanvraagperiode: "Aanvragen kan tot 16 september 2026",
    maximaalBedrag: "2.700 euro per leerplaats",
    alinea: [
      "De regeling geldt voor leerplaatsen in het mbo, hbo en voor promovendi. U vraagt de subsidie aan na afloop van het studiejaar.",
      "Houd een aanwezigheidsregistratie en een begeleidingsplan bij. Die gegevens heeft u nodig bij uw aanvraag.",
    ],
    websiteLabel: "Bekijk op de website van DUS-I",
    href: "#",
  },
  {
    id: "scholing-medewerkers",
    titel: "Scholing van uw medewerkers",
    samenvatting:
      "Laat uw medewerkers een cursus of opleiding volgen. U krijgt een deel van de kosten terug, tot 24.999 euro per aanvraag.",
    verstrekker: "Ministerie van Sociale Zaken en Werkgelegenheid",
    type: "Subsidie",
    aanvraagperiode: "Aanvragen kan van 1 juni tot en met 31 juli 2026",
    maximaalBedrag: "24.999 euro",
    alinea: [
      "Heeft u personeel dat nieuwe vaardigheden nodig heeft? Denk aan een cursus voor een nieuw systeem, een taaltraining of een vakopleiding. Deze regeling betaalt 60% van de kosten. Voor een klein bedrijf kan dat oplopen tot 80%.",
      "U maakt een opleidingsplan voor uw bedrijf. Daarin beschrijft u wie welke scholing volgt en waarom. Dat plan stuurt u mee met uw aanvraag.",
      "Er is een vast budget. Is dat op, dan loot het ministerie tussen de aanvragen. Dien uw aanvraag daarom in de eerste week van de periode in.",
    ],
    websiteLabel: "Bekijk de voorwaarden",
    href: "#",
  },
  {
    id: "verduurzamen-bedrijfspand",
    titel: "Verduurzamen van uw bedrijfspand",
    samenvatting:
      "Isolatie, een warmtepomp of zonnepanelen voor uw pand. U krijgt ongeveer 30% van de aanschafkosten terug.",
    verstrekker: "RVO",
    type: "Investeringssubsidie",
    aanvraagperiode: "Het hele jaar aan te vragen",
    maximaalBedrag: "Ongeveer 30% van de kosten",
    alinea: [
      "Deze regeling geldt voor isolatie van dak, muur en vloer, voor een warmtepomp en voor een zonneboiler. Zonnepanelen vallen onder een aparte regeling.",
      "Belangrijk: vraag de subsidie aan voordat u de opdracht geeft. Heeft u de installatie al laten plaatsen, dan krijgt u niets meer terug.",
      "Huurt u het pand? Dan heeft u schriftelijke toestemming van de eigenaar nodig. Vaak wil de verhuurder meebetalen, want het pand wordt er meer waard van.",
    ],
    websiteLabel: "Bekijk op de website van RVO",
    href: "#",
  },
  {
    id: "digitale-veiligheid",
    titel: "Advies over digitale veiligheid",
    samenvatting:
      "Laat een expert uitzoeken hoe veilig uw systemen zijn. U betaalt de helft, tot 2.500 euro.",
    verstrekker: "Ministerie van Economische Zaken",
    type: "Voucher",
    aanvraagperiode: "Opengesteld tot en met 31 december 2026",
    maximaalBedrag: "2.500 euro",
    alinea: [
      "Een expert bekijkt uw systemen en uw manier van werken. U krijgt een rapport met concrete stappen: wat is er nu niet veilig, en wat doet u eraan?",
      "U kiest zelf een adviseur uit de lijst van erkende bedrijven. De voucher dekt de helft van de rekening, u betaalt de rest.",
      "Na het advies kunt u een tweede voucher aanvragen voor de uitvoering. Bijvoorbeeld voor tweestapsaanmelding of een betere back-up.",
    ],
    websiteLabel: "Vraag een voucher aan",
    href: "#",
  },
  {
    id: "elektrische-bedrijfsauto",
    titel: "Elektrische bedrijfsauto kopen of leasen",
    samenvatting:
      "Vervangt u een bestelbus of bedrijfsauto door een elektrische? U krijgt tot 5.000 euro per voertuig.",
    verstrekker: "RVO",
    type: "Subsidie",
    aanvraagperiode: "Aanvragen kan zolang er budget is",
    maximaalBedrag: "5.000 euro per voertuig",
    alinea: [
      "Het bedrag hangt af van het type voertuig. Voor een kleine bestelbus is het 3.000 euro, voor een grote 5.000 euro. Per jaar kunt u voor meerdere voertuigen aanvragen.",
      "Leasen mag ook. Bij een leasecontract van minstens drie jaar verrekent de leasemaatschappij het bedrag in uw maandprijs.",
      "U houdt het voertuig minimaal drie jaar op naam van uw bedrijf. Verkoopt u het eerder, dan betaalt u een deel terug.",
    ],
    websiteLabel: "Bekijk op de website van RVO",
    href: "#",
  },
];

/** Fictieve subsidies voor demo-doeleinden. Zie ./README.md */
export const getDemoSubsidies = async (): Promise<DemoSubsidie[]> => subsidies;

export const getDemoSubsidieById = async (
  id: string,
): Promise<DemoSubsidie | undefined> =>
  subsidies.find((subsidie) => subsidie.id === id);

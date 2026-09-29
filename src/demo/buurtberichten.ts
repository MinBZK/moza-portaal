import type { DemoOnderdeel } from "./types";

export type DemoBuurtbericht = DemoOnderdeel & {
  bron: string;
  datum: string;
  locatie: string;
  href: string;
};

const berichten: DemoBuurtbericht[] = [
  {
    id: "wegafsluiting-stationsweg",
    titel: "Wegafsluiting Hoefweg vanaf 10 maart",
    samenvatting:
      "De Hoefweg is afgesloten van 10 tot en met 28 maart vanwege werkzaamheden aan het riool. Verkeer wordt omgeleid.",
    bron: "Gemeente Lansingerland",
    datum: "19 februari 2026",
    locatie: "Hoefweg, nabij uw vestigingsadres",
    href: "#",
  },
  {
    id: "parkeerregels-laadzones",
    titel: "Aanpassing parkeerregels en laad-/loszones",
    samenvatting:
      "De gemeente past de parkeerregels aan in uw buurt. De tijden voor laden en lossen veranderen per 1 april.",
    bron: "Gemeente Lansingerland",
    datum: "19 februari 2026",
    locatie: "Omgeving vestigingsadres",
    href: "#",
  },
  {
    id: "bestemmingsplan-gewijzigd",
    titel: "Bestemmingsplan gewijzigd nabij uw vestigingsadres",
    samenvatting:
      "Het bestemmingsplan voor het gebied rond uw bedrijf is aangepast. U kunt zes weken lang bezwaar maken.",
    bron: "Gemeente Lansingerland",
    datum: "19 februari 2026",
    locatie: "Omgeving vestigingsadres",
    href: "#",
  },
  {
    id: "vergunning-bouwwerkzaamheden-industrieweg",
    titel: "Vergunning verleend: bouwwerkzaamheden Merenweg 12",
    samenvatting:
      "Er is een omgevingsvergunning verleend voor verbouwing van het pand aan de Merenweg 12, nabij uw vestigingsadres.",
    bron: "Gemeente Lansingerland",
    datum: "12 februari 2026",
    locatie: "Merenweg 12",
    href: "#",
  },
  {
    id: "snelheidsverlaging-havenweg",
    titel: "Tijdelijke snelheidsverlaging Overbuurtseweg",
    samenvatting:
      "Op de Overbuurtseweg geldt tijdelijk een snelheidslimiet van 30 km/u vanwege werkzaamheden aan de brug. Verwachte duur: 6 weken.",
    bron: "Gemeente Lansingerland",
    datum: "5 februari 2026",
    locatie: "Overbuurtseweg",
    href: "#",
  },
  {
    id: "evenementenvergunning-buurtmarkt",
    titel: "Evenementenvergunning buurtmarkt 15 maart",
    samenvatting:
      "Op 15 maart vindt de jaarlijkse buurtmarkt plaats. Er gelden tijdelijke verkeersmaatregelen rondom het marktplein.",
    bron: "Gemeente Lansingerland",
    datum: "29 januari 2026",
    locatie: "Dorpsstraat",
    href: "#",
  },
];

/** Fictieve berichten over de omgeving van het bedrijfsadres. Zie ./README.md */
export const getDemoBuurtberichten = async (): Promise<DemoBuurtbericht[]> =>
  berichten;

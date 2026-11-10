import type { Source } from "@/components/SourceLinks";

/**
 * De wetsartikelen achter de termijnen in Iemand aannemen, als link naar
 * wetten.overheid.nl. Zonder datum in de link: dan opent de geldende versie.
 */
const WET = "https://wetten.overheid.nl/";

export const BRON = {
  awb: {
    label: "Algemene wet bestuursrecht, artikelen 4:13 en 4:14",
    url: `${WET}BWBR0005537#Artikel4:13`,
  },
  pwet10c: {
    label: "Participatiewet, artikel 10c",
    url: `${WET}BWBR0015703#Artikel10c`,
  },
  pwet10dLid2en12: {
    label: "Participatiewet, artikel 10d lid 2 en lid 12",
    url: `${WET}BWBR0015703#Artikel10d`,
  },
  pwet10dLid12: {
    label: "Participatiewet, artikel 10d lid 12",
    url: `${WET}BWBR0015703#Artikel10d`,
  },
  besluitLks3: {
    label:
      "Besluit loonkostensubsidie en minimumbedragen studietoeslag Participatiewet 2021, artikel 3",
    url: `${WET}BWBR0044894#Artikel3`,
  },
  besluitLd4: {
    label: "Besluit loondispensatie Wajong, artikel 4",
    url: `${WET}BWBR0020119#Artikel4`,
  },
  wajong61: {
    label: "Wajong, artikel 6:1",
    url: `${WET}BWBR0008657#Artikel6:1`,
  },
  wtl27: {
    label: "Wet tegemoetkomingen loondomein, artikel 2.7",
    url: `${WET}BWBR0037522#Artikel2.7`,
  },
  wtl42en44: {
    label: "Wet tegemoetkomingen loondomein, artikelen 4.2 en 4.4",
    url: `${WET}BWBR0037522#Artikel4.2`,
  },
} satisfies Record<string, Source>;

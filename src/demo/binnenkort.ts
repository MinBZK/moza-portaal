import type { DemoOnderdeel } from "./types";

export type DemoVraag = { vraag: string; antwoord: string };

export type DemoBinnenkort = DemoOnderdeel & {
  /** Wanneer het onderdeel er komt, bijvoorbeeld "januari 2028" */
  beschikbaarVanaf: string;
  verwachtingen: string[];
  vragen: DemoVraag[];
};

const binnenkort: Record<string, DemoBinnenkort> = {
  belastingen: {
    id: "belastingen",
    titel: "Belastingen",
    samenvatting:
      "Straks vindt u hier uw belastingzaken overzichtelijk bij elkaar.",
    beschikbaarVanaf: "januari 2028",
    verwachtingen: [
      "Zie welke aangiften u heeft ingediend en wanneer",
      "Bekijk ontvangen aanslagen en beschikkingen",
      "Houd bij of er nog iets openstaat",
    ],
    vragen: [
      {
        vraag: "Welke belastingzaken kan ik hier inzien?",
        antwoord:
          "U vindt hier een overzicht van uw zakelijke aangiften, aanslagen en beschikkingen van de Belastingdienst. Denk aan omzetbelasting (btw), inkomstenbelasting en loonheffingen.",
      },
      {
        vraag: "Kan ik hier ook aangifte doen?",
        antwoord:
          "Nee. MijnOverheid Zakelijk laat alleen uw belastingzaken zien. Aangifte doet u op belastingdienst.nl of in uw eigen aangiftesoftware.",
      },
      {
        vraag: "Ik ben het niet eens met een aanslag. Wat kan ik doen?",
        antwoord:
          "U maakt binnen zes weken na de datum op de aanslag bezwaar bij de Belastingdienst. Dat doet u op belastingdienst.nl of per post. De datum van elke aanslag vindt u in uw overzicht.",
      },
    ],
  },
  "zakelijk-vervoer": {
    id: "zakelijk-vervoer",
    titel: "Zakelijk vervoer",
    samenvatting:
      "Straks vindt u hier alles over de voertuigen van uw bedrijf.",
    beschikbaarVanaf: "medio 2028",
    verwachtingen: [
      "Zie welke voertuigen op naam van uw bedrijf staan",
      "Bekijk wanneer de APK verloopt",
      "Ontvang bericht bij terugroepacties",
    ],
    vragen: [
      {
        vraag: "Wat valt er onder zakelijk vervoer?",
        antwoord:
          "Kentekens op naam van uw onderneming, ontheffingen voor zwaar transport, vergunningen voor goederenvervoer en ontheffingen voor milieuzones.",
      },
      {
        vraag: "Kan ik hier mijn wagenpark beheren?",
        antwoord:
          "U ziet hier welke voertuigen bij de RDW op naam van uw organisatie staan, met de APK-datum en eventuele terugroepacties. Wilt u de tenaamstelling wijzigen, ga dan naar rdw.nl.",
      },
      {
        vraag: "Hoe vraag ik een ontheffing aan voor zwaar transport?",
        antwoord:
          "Die vraagt u aan bij de RDW op rdw.nl. De status van uw aanvraag ziet u daarna terug bij uw lopende zaken.",
      },
    ],
  },
  medewerkers: {
    id: "medewerkers",
    titel: "Personeel en rollen",
    samenvatting:
      "Straks vindt u hier uw personeelszaken overzichtelijk bij elkaar.",
    beschikbaarVanaf: "2029",
    verwachtingen: [
      "Bekijk uw werknemers en hun dienstverbanden",
      "Zie de status van verzuimmeldingen en verlof",
      "Houd bij welke wijzigingen u doorgaf aan UWV en Belastingdienst",
    ],
    vragen: [
      {
        vraag: "Welke personeelsgegevens kan ik hier inzien?",
        antwoord:
          "Uw werknemers, hun dienstverbanden en de meldingen die u deed bij UWV en de Belastingdienst. Denk aan loonheffingsgegevens, verzuimmeldingen en contracten.",
      },
      {
        vraag: "Kan ik hier ook wijzigingen doorgeven?",
        antwoord:
          "Nee. MijnOverheid Zakelijk laat alleen uw personeelszaken zien. Wijzigingen geeft u door via uw loonadministratie of op uwv.nl.",
      },
      {
        vraag: "Ik zie een werknemer die niet meer in dienst is. Wat nu?",
        antwoord:
          "Controleer eerst of de uitdienstmelding goed is doorgegeven via uw loonadministratie. Blijft de fout staan, neem dan contact op met UWV of de Belastingdienst.",
      },
    ],
  },
  "verzuim-en-verlof": {
    id: "verzuim-en-verlof",
    titel: "Ziekte en verlof",
    samenvatting:
      "Straks ziet u hier de ziekte- en verlofzaken van uw onderneming: meldingen bij UWV, de voortgang van re-integratie en belangrijke termijnen.",
    beschikbaarVanaf: "medio 2029",
    verwachtingen: [
      "Zie welke ziekmeldingen lopen bij UWV",
      "Houd termijnen bij, zoals de melding in week 42",
      "Volg de voortgang van re-integratie",
    ],
    vragen: [
      {
        vraag: "Wat kan ik hier regelen rond ziekte en verlof?",
        antwoord:
          "U vindt hier uw plichten als werkgever bij ziekte van een medewerker, zoals de Wet verbetering poortwachter, en een overzicht van lopende zaken bij UWV.",
      },
      {
        vraag: "Hoe meld ik langdurige ziekte van een medewerker?",
        antwoord:
          "Is iemand langer dan 42 weken ziek, dan moet u dat melden bij UWV. Dat doet u op uwv.nl. Na de melding ziet u de zaak terug bij uw lopende zaken.",
      },
      {
        vraag: "Waar vind ik informatie over re-integratie?",
        antwoord:
          "U bent samen met uw medewerker verantwoordelijk voor re-integratie. Uitleg over uw plichten staat op uwv.nl en op rijksoverheid.nl.",
      },
    ],
  },
};

export const getDemoBinnenkort = async (
  id: string,
): Promise<DemoBinnenkort | undefined> => binnenkort[id];

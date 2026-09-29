import type { DemoOnderdeel } from "./types";

export type DemoWet = DemoOnderdeel & {
  status: "Nieuw" | "Gewijzigd" | "Vervalt";
  ingangsdatum: string;
  voorWie: string;
  alinea: string[];
  stappen: string[];
  websiteLabel: string;
  href: string;
};

const wetten: DemoWet[] = [
  {
    id: "zero-emissiezone",
    titel: "Zero-emissiezones in steden",
    samenvatting:
      "Steeds meer steden laten alleen nog uitstootvrije bestelbussen en vrachtauto's toe in het centrum.",
    status: "Nieuw",
    ingangsdatum: "1 januari 2027",
    voorWie: "Bedrijven die met bestelbussen of vrachtauto's de stad in gaan",
    alinea: [
      "Rijdt u met een bestelbus naar klanten in de binnenstad? Dan krijgt u met deze regels te maken. In de zone mogen alleen voertuigen zonder uitstoot rijden.",
      "Voor bestaande voertuigen geldt een overgangsperiode. Hoe lang die duurt, hangt af van het bouwjaar van uw bus. Elke gemeente maakt daarnaast eigen afspraken over ontheffingen.",
      "Rijdt u er toch in met een vervuilend voertuig, dan krijgt u een boete van 100 euro per keer.",
    ],
    stappen: [
      "Zoek op welke steden een zone invoeren en of u daar komt.",
      "Kijk in uw kentekenbewijs wat het bouwjaar van uw voertuig is.",
      "Vraag een ontheffing aan als u nog niet kunt overstappen.",
    ],
    websiteLabel: "Bekijk welke steden een zone hebben",
    href: "#",
  },
  {
    id: "schijnzelfstandigheid",
    titel: "Strenger toezicht op het inhuren van zzp'ers",
    samenvatting:
      "De Belastingdienst controleert weer of een zzp'er bij u eigenlijk in loondienst werkt. Is dat zo, dan betaalt u alsnog loonheffing.",
    status: "Gewijzigd",
    ingangsdatum: "1 januari 2026",
    voorWie: "Ondernemers die zelfstandigen inhuren",
    alinea: [
      "Huurt u een zzp'er in die hetzelfde werk doet als uw eigen personeel, op vaste tijden en onder uw leiding? Dan ziet de Belastingdienst dat als een dienstverband.",
      "U betaalt dan alsnog loonheffing en premies over de betaalde facturen. Dat kan met terugwerkende kracht tot vijf jaar.",
      "Het gaat om hoe het werk in de praktijk gaat, niet om wat er in het contract staat. Een modelovereenkomst beschermt u dus niet als de praktijk anders is.",
    ],
    stappen: [
      "Zet op een rij welke zelfstandigen u nu inhuurt en wat zij doen.",
      "Vergelijk hun werk met dat van uw eigen medewerkers.",
      "Pas de afspraken aan of neem de persoon in dienst.",
    ],
    websiteLabel: "Doe de check van de Belastingdienst",
    href: "#",
  },
  {
    id: "energielabel-kantoor",
    titel: "Uw kantoor heeft minimaal energielabel C nodig",
    samenvatting:
      "Kantoren vanaf 100 vierkante meter moeten label C of beter hebben. Zonder geldig label mag u het pand niet gebruiken.",
    status: "Gewijzigd",
    ingangsdatum: "Geldt nu al, handhaving start 1 juli 2026",
    voorWie: "Eigenaren en huurders van een kantoorpand",
    alinea: [
      "De gemeente controleert of uw pand een geldig label heeft. Is het label D of lager, dan krijgt u eerst een waarschuwing en daarna een dwangsom.",
      "Huurt u het pand? Dan is de eigenaar verantwoordelijk voor het label. U merkt het wel, want zonder label mag u er niet werken. Vraag uw verhuurder om het label en zet die vraag op papier.",
      "Vaak zijn kleine maatregelen genoeg: ledverlichting, een nieuwe cv-ketel of tochtstrips. Voor grotere ingrepen bestaat een subsidie.",
    ],
    stappen: [
      "Zoek het energielabel van uw pand op in het openbare register.",
      "Is er geen label of is het D of lager? Neem contact op met de eigenaar.",
      "Laat een adviseur berekenen welke maatregelen u naar label C brengen.",
    ],
    websiteLabel: "Zoek het label van uw pand op",
    href: "#",
  },
  {
    id: "cyberbeveiligingswet",
    titel: "Nieuwe regels voor digitale veiligheid",
    samenvatting:
      "Levert u aan de zorg, de overheid of de energiesector? Dan moet u uw digitale veiligheid op orde hebben en incidenten melden.",
    status: "Nieuw",
    ingangsdatum: "1 maart 2026",
    voorWie: "Toeleveranciers van bedrijven in belangrijke sectoren",
    alinea: [
      "De wet geldt rechtstreeks voor grote bedrijven in sectoren als energie, zorg en vervoer. Levert u aan zo'n bedrijf, dan stellen zij dezelfde eisen aan u in het contract.",
      "U moet een overzicht hebben van uw risico's, uw systemen bijhouden en uw medewerkers voorlichten. Bij een groot incident meldt u dat binnen 24 uur.",
      "De bestuurder van het bedrijf is persoonlijk aansprakelijk. Dit is dus geen taak die u alleen bij uw ICT-leverancier kunt neerleggen.",
    ],
    stappen: [
      "Vraag uw grootste klanten of zij onder deze wet vallen.",
      "Maak een overzicht van uw systemen en wie er toegang heeft.",
      "Spreek met uw ICT-leverancier af wie wat meldt bij een incident.",
    ],
    websiteLabel: "Doe de zelfscan",
    href: "#",
  },
  {
    id: "pensioenregeling",
    titel: "Uw pensioenregeling moet worden aangepast",
    samenvatting:
      "Alle pensioenregelingen gaan over op nieuwe regels. Heeft u personeel, dan moet uw regeling voor 1 januari 2028 zijn aangepast.",
    status: "Gewijzigd",
    ingangsdatum: "Uiterlijk 1 januari 2028",
    voorWie: "Werkgevers met een eigen pensioenregeling",
    alinea: [
      "In de nieuwe opzet legt iedereen hetzelfde percentage in. Nu betaalt u voor oudere medewerkers vaak een hogere premie dan voor jongere.",
      "Valt u onder een bedrijfstakpensioenfonds? Dan regelt dat fonds de omzetting en hoeft u zelf weinig te doen. Heeft u een regeling bij een verzekeraar, dan moet u zelf in actie komen.",
      "U bespreekt de wijziging met uw medewerkers of met de ondernemingsraad. Zij moeten instemmen met de nieuwe regeling.",
    ],
    stappen: [
      "Zoek uit of u onder een bedrijfstakpensioenfonds valt.",
      "Vraag uw adviseur wat de nieuwe premie voor uw bedrijf betekent.",
      "Bespreek het voorstel op tijd met uw medewerkers.",
    ],
    websiteLabel: "Lees wat er verandert",
    href: "#",
  },
];

/** Fictieve wetten en regels voor demo-doeleinden. Zie ./README.md */
export const getDemoWetten = async (): Promise<DemoWet[]> => wetten;

export const getDemoWetById = async (
  id: string,
): Promise<DemoWet | undefined> => wetten.find((wet) => wet.id === id);

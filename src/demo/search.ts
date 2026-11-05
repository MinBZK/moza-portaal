import { format, parseISO } from "date-fns";
import { nl } from "date-fns/locale";
import { getDemoBerichten } from "./berichten";
import { getDemoSubsidies } from "./subsidies";
import { getDemoWetten } from "./wetten";
import { getDemoZaken } from "./zaken";

export type DemoSearchKind = "page" | "subsidy" | "law" | "message" | "case";

export type DemoSearchResult = {
  kind: DemoSearchKind;
  title: string;
  summary: string;
  href: string;
};

type Searchable = DemoSearchResult & { keywords?: string };

/** Pages of the portal, with words users search for that are not in the title. */
const PAGES: Searchable[] = [
  {
    title: "Home",
    summary: "Overzicht van wat er nu speelt voor uw onderneming.",
    href: "/",
  },
  {
    title: "Bedrijfsgegevens",
    summary:
      "Uw gegevens bij de Kamer van Koophandel (KVK), zoals uw KVK-nummer, adres en vestigingen.",
    href: "/bedrijfsgegevens",
    keywords: "kvk-nummer vestigingen adres ubo-register wijzigen",
  },
  {
    title: "Berichtenbox",
    summary: "Berichten van de overheid aan uw onderneming.",
    href: "/berichtenbox",
    keywords: "post brieven",
  },
  {
    title: "Lopende zaken",
    summary: "Aanvragen die u hebt gedaan en hoe ver die zijn.",
    href: "/lopendezaken",
    keywords: "aanvraag status",
  },
  {
    title: "Subsidies en financiering",
    summary: "Subsidies en financiering die passen bij uw onderneming.",
    href: "/subsidies",
    keywords: "subsidie aanvragen lening",
  },
  {
    title: "Wetten en regelgeving",
    summary: "Regels voor uw onderneming en wat daarin verandert.",
    href: "/wetten",
    keywords: "wet regels",
  },
  {
    title: "Berichten over uw buurt",
    summary: "Werk aan de weg, vergunningen en nieuws bij uw vestiging.",
    href: "/buurtberichten",
    keywords: "buurtberichten gemeente",
  },
  {
    title: "Bewaarde items",
    summary: "Subsidies, regels en berichten die u hebt bewaard.",
    href: "/bewaard",
  },
  {
    title: "Digitale assistent",
    summary: "Stel een vraag over uw onderneming en de overheid.",
    href: "/digitale-assistent",
    keywords: "hulp vraag chat",
  },
  {
    title: "Belastingen",
    summary: "Btw, loonheffing en andere belastingen voor uw onderneming.",
    href: "/belastingen",
    keywords: "btw-aangifte btw-nummer loonaangifte belastingdienst",
  },
  {
    title: "Zakelijk vervoer",
    summary: "Voertuigen en vervoer van uw onderneming.",
    href: "/zakelijk-vervoer",
    keywords: "auto bus kenteken",
  },
  {
    title: "Personeel en rollen",
    summary:
      "Wie namens uw onderneming mag handelen, en iemand aannemen met hulp van de overheid.",
    href: "/personeel",
    keywords: "personeel aannemen loonkostensubsidie loondispensatie machtigen",
  },
  {
    title: "Ziekte en verlof",
    summary: "Ziekte en verlof van uw personeel.",
    href: "/verzuim-en-verlof",
    keywords: "verzuim ziekmelding",
  },
  {
    title: "Gegevensdeling en dataverwerking",
    summary: "Welke organisaties uw gegevens gebruiken, en waarvoor.",
    href: "/dataverwerking",
    keywords: "privacy",
  },
  {
    title: "Contactvoorkeuren",
    summary: "Hoe organisaties contact met u opnemen.",
    href: "/contactvoorkeuren",
    keywords: "e-mailadres telefoonnummer",
  },
].map((page) => ({ ...page, kind: "page" as const }));

const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

/** Higher is better; 0 means not every word of the query was found. */
const score = (item: Searchable, words: string[], query: string) => {
  const title = normalize(item.title);
  const text = normalize(
    `${item.title} ${item.summary} ${item.keywords ?? ""}`,
  );
  if (!words.every((word) => text.includes(word))) return 0;
  if (title.includes(query)) return 3;
  if (words.every((word) => title.includes(word))) return 2;
  return 1;
};

/**
 * Searches the demo data of a persona: pages, subsidies, laws, messages and
 * cases. Stands in for a search API.
 */
export const searchDemo = async (
  query: string,
  personaId?: string,
): Promise<DemoSearchResult[]> => {
  const normalized = normalize(query.trim());
  const words = normalized.split(/\s+/).filter(Boolean);
  if (!words.length) return [];

  const [subsidies, laws, messages, open, closed] = await Promise.all([
    getDemoSubsidies(),
    getDemoWetten(),
    getDemoBerichten(personaId),
    getDemoZaken("lopend"),
    getDemoZaken("afgehandeld"),
  ]);

  const items: Searchable[] = [
    ...PAGES,
    ...subsidies.map((subsidy) => ({
      kind: "subsidy" as const,
      title: subsidy.titel,
      summary: subsidy.samenvatting,
      href: `/subsidies/${subsidy.id}`,
      keywords: subsidy.verstrekker,
    })),
    ...laws.map((law) => ({
      kind: "law" as const,
      title: law.titel,
      summary: law.samenvatting,
      href: `/wetten/${law.id}`,
      keywords: law.bron,
    })),
    ...messages.map((message) => ({
      kind: "message" as const,
      title: message.onderwerp,
      summary: `${message.afzender}, ${format(parseISO(message.datum), "d MMMM yyyy", { locale: nl })}`,
      href: `/berichtenbox/${message.id}`,
      keywords: message.inhoud.join(" "),
    })),
    ...[...open, ...closed].map((zaak) => ({
      kind: "case" as const,
      title: zaak.titel,
      summary: zaak.status
        ? `${zaak.organisatie}. Status: ${zaak.status}`
        : zaak.organisatie,
      href: `/lopendezaken/${zaak.id}`,
    })),
  ];

  return items
    .map((item) => ({ item, score: score(item, words, normalized) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ item: { kind, title, summary, href } }) => ({
      kind,
      title,
      summary,
      href,
    }));
};

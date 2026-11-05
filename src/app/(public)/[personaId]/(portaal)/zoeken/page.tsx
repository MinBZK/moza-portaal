import type { Metadata } from "next";
import Link from "next/link";
import {
  Heading,
  Paragraph,
  UnorderedList,
  UnorderedListItem,
} from "@/components/rhc";
import { searchDemo, type DemoSearchKind } from "@/demo";
import { getActievePersona } from "@/app/(public)/_persona";
import PageSearch from "@/layouts/search";

type SearchParams = Promise<{ q?: string | string[] }>;

const GROUPS: { kind: DemoSearchKind; label: string }[] = [
  { kind: "page", label: "Pagina’s" },
  { kind: "case", label: "Lopende zaken" },
  { kind: "message", label: "Berichten" },
  { kind: "subsidy", label: "Subsidies en financiering" },
  { kind: "law", label: "Wetten en regelgeving" },
];

const readQuery = async (searchParams: SearchParams) => {
  const { q } = await searchParams;
  return (Array.isArray(q) ? q[0] : q)?.trim() ?? "";
};

const search = async (query: string) =>
  searchDemo(query, (await getActievePersona())?.id);

const countText = (count: number) =>
  `${count} ${count === 1 ? "resultaat" : "resultaten"}`;

export const generateMetadata = async ({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> => {
  const query = await readQuery(searchParams);
  if (!query) return { title: "Zoeken" };
  const results = await search(query);
  return { title: `${countText(results.length)} voor “${query}” - Zoeken` };
};

const SearchPage = async ({ searchParams }: { searchParams: SearchParams }) => {
  const query = await readQuery(searchParams);
  const results = query ? await search(query) : [];
  const assistantHref = `/digitale-assistent?vraag=${encodeURIComponent(query)}`;

  return (
    <>
      <Heading level={1}>Zoeken</Heading>
      <PageSearch key={query} defaultValue={query} />

      <div className="rhc-mox-card">
        {!query && (
          <Paragraph>
            Typ in het zoekveld waar u naar zoekt en kies{" "}
            <strong>Zoeken</strong>. U kunt ook een vraag stellen aan de
            digitale assistent.
          </Paragraph>
        )}

        {query && results.length > 0 && (
          <>
            <Paragraph>
              {countText(results.length)} voor “{query}”
            </Paragraph>
            {GROUPS.map(({ kind, label }) => {
              const group = results.filter((result) => result.kind === kind);
              if (!group.length) return null;
              return (
                <section
                  key={kind}
                  className="rhc-mox-stack rhc-mox-stack--md"
                  aria-labelledby={`zoeken-${kind}`}
                >
                  <Heading level={2} id={`zoeken-${kind}`}>
                    {label} ({group.length})
                  </Heading>
                  <ul className="rhc-mox-result-list">
                    {group.map((result) => (
                      <li key={result.href}>
                        <Link
                          href={result.href}
                          className="utrecht-link utrecht-link--html-a"
                        >
                          {result.title}
                        </Link>
                        <Paragraph>{result.summary}</Paragraph>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </>
        )}

        {query && results.length === 0 && (
          <section className="rhc-mox-stack rhc-mox-stack--md">
            <Paragraph>
              Wij hebben niets gevonden voor “{query}”. U kunt:
            </Paragraph>
            <UnorderedList>
              <UnorderedListItem>
                kijken of alles goed gespeld is
              </UnorderedListItem>
              <UnorderedListItem>
                een ander of korter woord proberen
              </UnorderedListItem>
              <UnorderedListItem>
                uw vraag stellen aan de digitale assistent
              </UnorderedListItem>
            </UnorderedList>
          </section>
        )}

        {query && (
          <section
            className="rhc-mox-stack rhc-mox-stack--md"
            aria-labelledby="zoeken-assistent"
          >
            <Heading level={2} id="zoeken-assistent">
              Hulp van de digitale assistent
            </Heading>
            <Paragraph>
              Staat het antwoord er niet bij? Stel uw vraag in uw eigen woorden.
            </Paragraph>
            <Paragraph>
              <Link
                href={assistantHref}
                className="utrecht-link utrecht-link--html-a"
              >
                Vraag het de digitale assistent: “{query}”
              </Link>
            </Paragraph>
          </section>
        )}
      </div>
    </>
  );
};

export default SearchPage;

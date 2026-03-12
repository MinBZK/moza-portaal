import { redirect } from "next/navigation";
import Card from "@/components/card";
import Link from "next/link";
import dopOpenDataClient from "@/network/dop/opendata";
import { getKvkFromCookie } from "@/utils/kvknummer";
import { TYPE_LABELS } from "../_articleTypes";

const ArtikelDetailPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const kvk = await getKvkFromCookie();
  if (!kvk) redirect("/");

  const { id } = await params;

  const { data: article, error } = await dopOpenDataClient.GET(
    "/api/v1/articles/{id}",
    {
      params: { path: { id } },
    },
  );

  if (error || !article) {
    return (
      <>
        <h1 className="text-4xl">
          {error ? "Fout bij ophalen artikel" : "Artikel niet gevonden"}
        </h1>
        <Card>
          <p className="text-neutral-600">
            {error
              ? "Er is een fout opgetreden bij het ophalen van dit artikel. Probeer het later opnieuw."
              : "Dit artikel kon niet worden gevonden."}
          </p>
          <Link
            href="/actualiteiten"
            className="mt-4 inline-block text-[#01689b] underline"
          >
            &larr; Terug naar actualiteiten
          </Link>
        </Card>
      </>
    );
  }

  const date = article.dateModified
    ? new Date(article.dateModified).toLocaleDateString("nl-NL", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  const typeLabel = TYPE_LABELS[article.additionalType ?? ""] ?? article.additionalType;

  return (
    <>
      <Link
        href="/actualiteiten"
        className="text-sm text-[#01689b] underline"
      >
        &larr; Terug naar actualiteiten
      </Link>

      <h1 className="text-4xl">{article.headLine ?? "Onbekend artikel"}</h1>

      <Card className="space-y-5">
        {/* Metadata row */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-600">
          {typeLabel && (
            <span className="rounded bg-[#d9ebf7] px-2 py-0.5 text-xs font-semibold text-[#154273]">
              {typeLabel}
            </span>
          )}
          {article.author?.map((a) => (
            <span key={a.name}>{a.name}</span>
          ))}
          {date && <span>{date}</span>}
        </div>

        {/* Description */}
        {article.about && (
          <p className="text-base font-medium">{article.about}</p>
        )}

        {/* Subjects */}
        {article.subjects && article.subjects.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {article.subjects.map((subject) => (
              <span
                key={subject}
                className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600"
              >
                {subject}
              </span>
            ))}
          </div>
        )}

        {/* Article body */}
        {article.articleBody && (
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: article.articleBody }}
          />
        )}

        {/* Related articles */}
        {article.hasPart && article.hasPart.length > 0 && (
          <div>
            <h3 className="mb-2 text-lg font-semibold">Gerelateerde artikelen</h3>
            <ul className="list-inside list-disc space-y-1">
              {article.hasPart.map((part) => (
                <li key={part.url}>
                  <a
                    href={part.url ?? "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#01689b] underline"
                  >
                    {part.headLine ?? part.url}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* External link */}
        {article.url && (
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded bg-[#154273] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0e2f54]"
          >
            Bekijk op ondernemersplein.nl
            <span>&uarr;</span>
          </a>
        )}
      </Card>
    </>
  );
};

export default ArtikelDetailPage;

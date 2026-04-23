"use client";

import Link from "next/link";
import { TYPE_LABELS, TYPE_COLORS } from "./_articleTypes";
import PaginatedList, { type QueryStatus } from "./_paginatedList";
import type { components } from "@/network/actualiteiten/generated";

type ArticleSummary = components["schemas"]["EnrichedArticle"];

const ArtikelenOverzicht = ({
  articles,
  status,
}: {
  articles: ArticleSummary[];
  status: QueryStatus;
}) => (
  <PaginatedList
    items={articles}
    status={status}
    emptyMessage="Geen resultaten gevonden."
    getKey={(a) => a.identifier}
    renderItem={(a) => <ArticleRow article={a} />}
  />
);

function ArticleRow({ article }: { article: ArticleSummary }) {
  const date = article.dateModified
    ? new Date(article.dateModified).toLocaleDateString("nl-NL", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  const type = article.additionalType ?? "";
  const typeLabel = TYPE_LABELS[type] ?? type;
  const typeColor = TYPE_COLORS[type] ?? "bg-neutral-100 text-neutral-600";

  return (
    <div className="flex items-start justify-between gap-3 py-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          {typeLabel && (
            <span
              className={`rounded px-2 py-0.5 text-xs font-semibold ${typeColor}`}
            >
              {typeLabel}
            </span>
          )}
          <h4 className="text-base font-semibold">
            <Link
              href={`/actualiteiten/${article.identifier}`}
              className="text-[#01689b] underline decoration-1 underline-offset-2 hover:decoration-2"
            >
              {article.headLine ?? "Onbekend artikel"}
            </Link>
          </h4>
        </div>
        {date && <p className="mt-0.5 text-sm text-neutral-600">{date}</p>}
      </div>
    </div>
  );
}

export default ArtikelenOverzicht;

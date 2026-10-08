"use client";

import Link from "next/link";
import { Heading, Paragraph } from "@/components/rhc";
import { TYPE_LABELS, TYPE_BADGES } from "./_articleTypes";
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
  const typeBadge = TYPE_BADGES[type] ?? "";

  return (
    <>
      <Heading level={3}>
        <Link
          href={`/actualiteiten/${article.identifier}`}
          className="utrecht-link utrecht-link--html-a"
        >
          {article.headLine ?? "Onbekend artikel"}
        </Link>
      </Heading>
      {(typeLabel || date) && (
        <Paragraph>
          {typeLabel && (
            <span className={`mox-badge ${typeBadge}`}>{typeLabel}</span>
          )}{" "}
          {date}
        </Paragraph>
      )}
    </>
  );
}

export default ArtikelenOverzicht;

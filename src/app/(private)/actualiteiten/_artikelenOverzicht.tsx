"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TYPE_LABELS, TYPE_COLORS } from "./_articleTypes";
import type { components } from "@/network/dop/opendata/generated";

type ArticleSummary = components["schemas"]["ArticleSummary"];

const PAGE_SIZE = 10;

const ArtikelenOverzicht = ({
  articles,
  status,
}: {
  articles: ArticleSummary[];
  status: "pending" | "error" | "success";
}) => {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [articles]);

  const visible = articles.slice(0, visibleCount);

  return (
    <div className="space-y-6">
      {status === "pending" ? (
        <p className="text-sm text-neutral-600">Laden...</p>
      ) : status === "error" ? (
        <p className="text-sm text-red-600">
          Er ging iets mis bij het laden. Probeer het later opnieuw.
        </p>
      ) : articles.length === 0 ? (
        <p className="text-sm text-neutral-600">
          Geen resultaten gevonden.
        </p>
      ) : (
        <>
          <div className="divide-y divide-neutral-200">
            {visible.map((article) => (
              <ArticleRow key={article.identifier} article={article} />
            ))}
          </div>
          {visibleCount < articles.length && (
            <button
              onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
              className="rounded bg-[#154273] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0e2f54]"
            >
              Meer laden
            </button>
          )}
        </>
      )}
    </div>
  );
};

function ArticleRow({
  article,
}: {
  article: {
    identifier?: string | null;
    headLine?: string | null;
    additionalType?: string | null;
    dateModified?: string | null;
  };
}) {
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
        {date && (
          <p className="mt-0.5 text-sm text-neutral-600">{date}</p>
        )}
      </div>
    </div>
  );
}

export default ArtikelenOverzicht;

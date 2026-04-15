"use client";

import Link from "next/link";
import PaginatedList, { type QueryStatus } from "./_paginatedList";
import type { components } from "@/network/actualiteiten/generated";

type SruPublicatie = components["schemas"]["SruPublicatie"];

const BerichtenOverzicht = ({
  berichten,
  status,
  hasPostcodes,
  postcodes,
}: {
  berichten: SruPublicatie[];
  status: QueryStatus;
  hasPostcodes: boolean;
  postcodes: string[];
}) => {
  if (!hasPostcodes) {
    return (
      <p className="text-sm text-neutral-600">
        Voeg postcodes toe via{" "}
        <Link
          href="/berichteninuwbuurt"
          className="text-[#01689b] underline underline-offset-2"
        >
          Berichten in uw buurt
        </Link>{" "}
        om hier lokale berichten te zien.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <PaginatedList
        items={berichten}
        status={status}
        pageSize={5}
        emptyMessage="Geen berichten gevonden."
        getKey={(p, i) => p.id || p.preferredUrl || String(i)}
        renderItem={(p) => <PublicatieRow publicatie={p} />}
        containerClassName="space-y-4"
      />
      <p className="text-xs text-neutral-400">
        Op basis van uw postcodes: {postcodes.join(", ")}
      </p>
    </div>
  );
};

function PublicatieRow({ publicatie }: { publicatie: SruPublicatie }) {
  const date = publicatie.modified
    ? new Date(publicatie.modified).toLocaleDateString("nl-NL", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  const description = publicatie.abstract || "";
  const detailHref = `/berichteninuwbuurt/${encodeURIComponent(publicatie.id ?? "")}`;

  return (
    <div className="py-3">
      <h4 className="text-base font-semibold">
        <Link
          href={detailHref}
          className="text-[#01689b] underline decoration-1 underline-offset-2 hover:decoration-2"
        >
          {publicatie.title || "Onbekende titel"}
        </Link>
      </h4>
      {(date || description) && (
        <p className="mt-0.5 line-clamp-2 text-sm text-neutral-600">
          {date}
          {date && description ? " — " : ""}
          {description}
        </p>
      )}
    </div>
  );
}

export default BerichtenOverzicht;

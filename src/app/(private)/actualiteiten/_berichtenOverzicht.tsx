"use client";

import { useState } from "react";
import Link from "next/link";
import type { components } from "@/network/actualiteiten/generated";

type SruPublicatie = components["schemas"]["SruPublicatie"];

const PAGE_SIZE = 5;

const BerichtenOverzicht = ({
  berichten,
  status,
  hasPostcodes,
  postcodes,
}: {
  berichten: SruPublicatie[];
  status: "pending" | "error" | "success";
  hasPostcodes: boolean;
  postcodes: string[];
}) => {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [prevBerichten, setPrevBerichten] = useState(berichten);
  if (berichten !== prevBerichten) {
    setPrevBerichten(berichten);
    setVisibleCount(PAGE_SIZE);
  }

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

  const visible = berichten.slice(0, visibleCount);

  return (
    <div className="space-y-4">
      {status === "pending" ? (
        <p className="text-sm text-neutral-600">Berichten laden...</p>
      ) : status === "error" ? (
        <p className="text-sm text-red-600">
          Er ging iets mis bij het laden. Probeer het later opnieuw.
        </p>
      ) : berichten.length === 0 ? (
        <p className="text-sm text-neutral-600">
          Geen berichten gevonden.
        </p>
      ) : (
        <>
          <div className="divide-y divide-neutral-200">
            {visible.map((pub) => (
              <PublicatieRow key={pub.id || pub.preferredUrl} publicatie={pub} />
            ))}
          </div>
          {visibleCount < berichten.length && (
            <button
              onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
              className="rounded bg-[#154273] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0e2f54]"
            >
              Meer laden
            </button>
          )}
        </>
      )}

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

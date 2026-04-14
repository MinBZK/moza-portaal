"use client";

import { useState } from "react";
import { TYPE_COLORS } from "./_articleTypes";
import type { components } from "@/network/actualiteiten/generated";

type SubsidieSummary = components["schemas"]["EnrichedSubsidie"];

const PAGE_SIZE = 10;

const SubsidiesOverzicht = ({
  subsidies,
  status,
}: {
  subsidies: SubsidieSummary[];
  status: "pending" | "error" | "success";
}) => {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [prevSubsidies, setPrevSubsidies] = useState(subsidies);
  if (subsidies !== prevSubsidies) {
    setPrevSubsidies(subsidies);
    setVisibleCount(PAGE_SIZE);
  }

  const visible = subsidies.slice(0, visibleCount);

  return (
    <div className="space-y-6">
      {status === "pending" ? (
        <p className="text-sm text-neutral-600">Laden...</p>
      ) : status === "error" ? (
        <p className="text-sm text-red-600">
          Er ging iets mis bij het laden. Probeer het later opnieuw.
        </p>
      ) : subsidies.length === 0 ? (
        <p className="text-sm text-neutral-600">Geen subsidies gevonden.</p>
      ) : (
        <>
          <div className="divide-y divide-neutral-200">
            {visible.map((subsidie) => (
              <div
                key={subsidie.identifier}
                className="flex items-start justify-between gap-3 py-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-semibold ${TYPE_COLORS["subsidie-nl"]}`}
                    >
                      Subsidie
                    </span>
                    <h4 className="text-base font-semibold">
                      {subsidie.url ? (
                        <a
                          href={subsidie.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#01689b] underline decoration-1 underline-offset-2 hover:decoration-2"
                        >
                          {subsidie.title ?? "Onbekende subsidie"}
                        </a>
                      ) : (
                        subsidie.title ?? "Onbekende subsidie"
                      )}
                    </h4>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {visibleCount < subsidies.length && (
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

export default SubsidiesOverzicht;

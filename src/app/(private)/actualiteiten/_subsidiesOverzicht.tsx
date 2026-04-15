"use client";

import { TYPE_COLORS } from "./_articleTypes";
import PaginatedList, { type QueryStatus } from "./_paginatedList";
import type { components } from "@/network/actualiteiten/generated";

type SubsidieSummary = components["schemas"]["EnrichedSubsidie"];

const SubsidiesOverzicht = ({
  subsidies,
  status,
}: {
  subsidies: SubsidieSummary[];
  status: QueryStatus;
}) => (
  <PaginatedList
    items={subsidies}
    status={status}
    emptyMessage="Geen subsidies gevonden."
    getKey={(s) => s.identifier ?? ""}
    renderItem={(s) => <SubsidieRow subsidie={s} />}
  />
);

function SubsidieRow({ subsidie }: { subsidie: SubsidieSummary }) {
  const title = subsidie.title ?? "Onbekende subsidie";
  return (
    <div className="flex items-start justify-between gap-3 py-3">
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
                {title}
              </a>
            ) : (
              title
            )}
          </h4>
        </div>
      </div>
    </div>
  );
}

export default SubsidiesOverzicht;

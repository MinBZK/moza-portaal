"use client";

import { Heading, Link } from "@/components/rhc";
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
    getKey={(s) => s.identifier}
    renderItem={(s) => <SubsidieRow subsidie={s} />}
  />
);

function SubsidieRow({ subsidie }: { subsidie: SubsidieSummary }) {
  const title = subsidie.title ?? "Onbekende subsidie";
  return (
    <>
      <Heading level={3}>
        {subsidie.url ? (
          <Link href={subsidie.url} target="_blank" rel="noopener noreferrer">
            {title}
          </Link>
        ) : (
          title
        )}
      </Heading>
    </>
  );
}

export default SubsidiesOverzicht;

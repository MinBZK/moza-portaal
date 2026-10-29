"use client";

import { Heading, Link, VisuallyHidden } from "@/components/rhc";
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
    emptyMessage="Er zijn geen subsidies bij uw onderwerpen. Kies andere onderwerpen."
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
          <Link
            href={subsidie.url}
            target="_blank"
            rel="external noopener noreferrer"
          >
            {title}
            <VisuallyHidden> (opent in een nieuw tabblad)</VisuallyHidden>
          </Link>
        ) : (
          title
        )}
      </Heading>
    </>
  );
}

export default SubsidiesOverzicht;

"use client";

import Link from "next/link";
import { Heading, Paragraph } from "@/components/rhc";
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
      <Paragraph>
        Voeg postcodes toe via{" "}
        <Link
          href="/berichteninuwbuurt"
          className="utrecht-link utrecht-link--html-a"
        >
          Berichten in uw buurt
        </Link>{" "}
        om hier lokale berichten te zien.
      </Paragraph>
    );
  }

  return (
    <div className="mox-row-gap">
      <PaginatedList
        items={berichten}
        status={status}
        pageSize={5}
        emptyMessage="Geen berichten gevonden."
        getKey={(p) => p.id}
        renderItem={(p) => <PublicatieRow publicatie={p} />}
      />
      <Paragraph>Op basis van uw postcodes: {postcodes.join(", ")}</Paragraph>
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
  const detailHref = `/berichteninuwbuurt/${encodeURIComponent(publicatie.id)}`;

  return (
    <>
      <Heading level={3}>
        <Link href={detailHref} className="utrecht-link utrecht-link--html-a">
          {publicatie.title}
        </Link>
      </Heading>
      {(date || description) && (
        <Paragraph className="mox-line-clamp">
          {date}
          {date && description ? " — " : ""}
          {description}
        </Paragraph>
      )}
    </>
  );
}

export default BerichtenOverzicht;

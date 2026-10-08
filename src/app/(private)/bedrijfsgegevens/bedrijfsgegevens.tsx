"use client";

import { useQuery } from "@tanstack/react-query";
import {
  DataSummary,
  DataSummaryItem,
  Heading,
  Paragraph,
} from "@/components/rhc";
import { GetBasisprofielByKvkNummer } from "@/network/kvk/basisprofiel/fetchers/getBasisprofielByKvkNummer";
import { format, isValid, parse } from "date-fns";

const formatDateString = (dateString: string | null | undefined): string => {
  if (!dateString) return "-";
  const date = parse(dateString, "yyyyMMdd", new Date());
  return isValid(date) ? format(date, "dd-MM-yyyy") : dateString;
};

const Bedrijfsgegevens = ({ kvk }: { kvk: string }) => {
  const { data: profiel, isFetching } = useQuery({
    queryKey: ["basisprofiel", kvk],
    queryFn: () => GetBasisprofielByKvkNummer(kvk),
  });

  if (isFetching) {
    return (
      <>
        <Heading level={1}>Mijn bedrijfsgegevens</Heading>
        <div className="mox-card">
          <Heading level={2}>Algemeen</Heading>
          <Paragraph>
            Dit zijn de gegevens die bij de overheid bekend zijn over jouw
            organisatie.
          </Paragraph>
          <Paragraph role="status">
            Uw bedrijfsgegevens worden geladen.
          </Paragraph>
        </div>
      </>
    );
  }

  if (!profiel) {
    throw new Error("Server-side error occurred");
  }

  const gegevens = [
    { label: "Handelsnaam", waarde: profiel.naam },
    { label: "KVK-nummer", waarde: profiel.kvkNummer },
    {
      label: "RSIN-nummer",
      waarde: profiel._embedded?.eigenaar?.rsin ?? "-",
    },
    { label: "BTW-nummer", waarde: "-" },
    {
      label: "Startdatum",
      waarde: formatDateString(profiel.formeleRegistratiedatum),
    },
    {
      label: "Rechtsvorm",
      waarde: profiel._embedded?.eigenaar?.rechtsvorm ?? "-",
    },
    {
      label: "Aantal werkzame personen",
      waarde: profiel.totaalWerkzamePersonen,
    },
  ];

  return (
    <>
      <Heading level={1}>Mijn bedrijfsgegevens</Heading>
      <div className="mox-card">
        <Heading level={2}>Algemene gegevens</Heading>
        <Paragraph>
          Dit zijn de gegevens die bij de overheid bekend zijn over jouw
          organisatie.
        </Paragraph>
        <DataSummary appearance="column" className="mox-data-summary--columns">
          {gegevens.map(({ label, waarde }) => (
            <DataSummaryItem
              key={label}
              itemKey={label}
              itemValue={String(waarde ?? "")}
            />
          ))}
        </DataSummary>
        <Paragraph>Bron: KVK</Paragraph>
      </div>
    </>
  );
};

export default Bedrijfsgegevens;

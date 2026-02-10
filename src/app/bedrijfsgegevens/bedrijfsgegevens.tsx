"use client";

import Card from "@/components/card";
import { useQuery } from "@tanstack/react-query";
import { GetBasisprofielByKvkNummer } from "@/network/kvk/basisprofiel/fetchers/getBasisprofielByKvkNummer";

const DetailSkeleton = () => (
  <div className="grid grid-cols-[2fr_3fr_100px] items-center gap-2">
    <h4 className="text-sm font-medium text-gray-700">
      <div className="h-5 w-24 animate-pulse rounded bg-gray-200" />
    </h4>
    <div className="text-gray-900">
      <div className="mt-1 h-5 w-32 animate-pulse rounded bg-gray-200" />
    </div>
  </div>
);

const Detail = ({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) => (
  <div className="grid grid-cols-[2fr_3fr_100px] items-center gap-2">
    <span className="font-bold">{label}</span>
    <div>{value}</div>
  </div>
);

const Bedrijfsgegevens = ({ kvk }: { kvk: string }) => {
  const { data: profiel, isFetching } = useQuery({
    queryKey: ["basisprofiel", kvk],
    queryFn: () => GetBasisprofielByKvkNummer(kvk),
  });

  if (isFetching) {
    return (
      <>
        <h1 className="text-3xl">Mijn bedrijfsgegevens</h1>
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 w-full space-y-5 md:col-span-8">
            <Card className="space-y-5">
              <h2 className="text-2xl">Algemene gegevens</h2>
              <p>
                Dit zijn de gegevens die bij de overheid bekend zijn over jouw
                organisatie.
              </p>
              <div className="flex w-full flex-col gap-4 overflow-x-auto">
                <div className="flex flex-col gap-0 divide-y divide-neutral-300 bg-neutral-100 px-4 *:py-3">
                  {[...Array(6)].map((_, index) => (
                    <DetailSkeleton key={index} />
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </>
    );
  }

  if (!profiel) {
    throw new Error("Server-side error occurred");
  }

  return (
    <>
      <h1 className="text-3xl">Mijn bedrijfsgegevens</h1>
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 w-full space-y-5 md:col-span-8">
          <Card className="space-y-5">
            <h2 className="text-2xl">Algemene gegevens</h2>
            <p>
              Dit zijn de gegevens die bij de overheid bekend zijn over jouw
              organisatie.
            </p>
            <div className="flex w-full flex-col gap-4 overflow-x-auto">
              <div className="flex flex-col gap-0 divide-y divide-neutral-300 bg-neutral-100 px-4 *:py-3">
                <Detail label="Naam" value={profiel.naam} />
                <Detail
                  label="Formele registratie datum"
                  value={profiel.formeleRegistratiedatum}
                />
                <Detail
                  label="Statutaire naam"
                  value={profiel.statutaireNaam}
                />
                <Detail
                  label="Vestigingsnummer"
                  value={profiel._embedded?.hoofdvestiging?.vestigingsnummer}
                />
                <Detail
                  label="Totaal werkzame personen"
                  value={profiel.totaalWerkzamePersonen}
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Bedrijfsgegevens;

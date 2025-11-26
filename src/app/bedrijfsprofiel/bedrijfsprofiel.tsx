"use client";

import Card from "@/components/card";
import { useQuery } from "@tanstack/react-query";
import { GetBasisprofielByKvkNummer } from "@/network/kvk/basisprofiel/fetchers/getBasisprofielByKvkNummer";

const DetailSkeleton = () => (
  <div>
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
  <div>
    <h4 className="text-sm font-medium text-gray-700">{label}</h4>
    <p className="text-gray-900">
      {value || <span className="text-gray-400">-</span>}
    </p>
  </div>
);

const Bedrijfsprofiel = ({ kvk }: { kvk: string }) => {
  const { data: profiel, isFetching } = useQuery({
    queryKey: ["basisprofiel", kvk],
    queryFn: () => GetBasisprofielByKvkNummer(kvk),
  });

  if (isFetching) {
    return (
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 w-full space-y-5 md:col-span-8">
          <h1 className="text-h1">Mijn bedrijfsprofiel</h1>
          <Card>
            <div className="grid grid-cols-1 gap-4 divide-y-1 divide-neutral-300 *:py-4">
              <h2 className="text-h2">Algemeen</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {[...Array(6)].map((_, index) => (
                  <DetailSkeleton key={index} />
                ))}
              </div>
              <div className="divide-y-1 divide-neutral-300 *:py-4">
                <h2 className="text-h2">Adressen</h2>
                {[...Array(1)].map((_, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 gap-4 border-b border-neutral-300 pb-4 md:grid-cols-2"
                  >
                    {[...Array(6)].map((_, detailIndex) => (
                      <DetailSkeleton key={detailIndex} />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!profiel) {
    throw new Error("Server-side error occurred");
  }

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-12 w-full space-y-5 md:col-span-8">
        <h1 className="text-h1">Mijn bedrijfsprofiel</h1>
        <Card>
          <div className="grid grid-cols-1 gap-4 divide-y-1 divide-neutral-300 *:py-4">
            <h2 className="text-h2">Algemeen</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Detail label="Naam" value={profiel.naam} />

              <Detail
                label="formeleRegistratiedatum"
                value={profiel.formeleRegistratiedatum}
              />
              <Detail label="indNonMailing" value={profiel.indNonMailing} />
              <Detail
                label="statutaireNaaReactm"
                value={profiel.statutaireNaam}
              />
              <Detail
                label="vestigingsnummer"
                value={profiel._embedded?.hoofdvestiging?.vestigingsnummer}
              />
              <Detail
                label="totaalWerkzamePersonen"
                value={profiel.totaalWerkzamePersonen}
              />
            </div>

            {profiel._embedded?.hoofdvestiging?.adressen &&
              profiel._embedded.hoofdvestiging.adressen.length > 0 && (
                <div className="divide-y-1 divide-neutral-300 *:py-4">
                  <h2 className="text-h2">Adressen</h2>
                  {profiel._embedded?.hoofdvestiging?.adressen?.map((adres) => {
                    return (
                      <div
                        key={adres.volledigAdres}
                        className={`grid grid-cols-1 gap-4 border-b border-neutral-300 pb-4 md:grid-cols-2`}
                      >
                        <Detail
                          label="volledigAdres"
                          value={adres.volledigAdres}
                        />
                        <Detail label="postcode" value={adres.postcode} />
                        <Detail label="plaats" value={adres.plaats} />
                        <Detail label="land" value={adres.land} />
                        <Detail label="type" value={adres.type} />
                        <Detail
                          label="indAfgeschermd"
                          value={adres.indAfgeschermd}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Bedrijfsprofiel;

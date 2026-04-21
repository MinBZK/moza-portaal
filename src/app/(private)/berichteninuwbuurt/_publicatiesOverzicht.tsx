"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getKvkFromCookie } from "@/utils/kvknummer";
import { useGetVoorkeuren } from "@/network/actualiteiten/hooks/getVoorkeuren/useGetVoorkeuren";
import { getBerichten } from "@/network/actualiteiten/fetchers/getBerichten";
import PublicatieCard from "./_publicatieCard";

const PAGE_SIZE = 5;

const PublicatiesOverzicht = () => {
  const [kvkNummer, setKvkNummer] = useState<string | undefined | null>(null);
  useEffect(() => {
    getKvkFromCookie().then(setKvkNummer);
  }, []);

  const { data: voorkeuren, status: voorkeurenStatus } = useGetVoorkeuren();

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const postcodes = (voorkeuren?.postcodes ?? []).map((v) => v.postcode);

  const { data: publicaties = [], status: pubStatus } = useQuery({
    queryKey: ["actualiteiten", "berichten", postcodes],
    queryFn: () => getBerichten(),
    enabled: postcodes.length > 0,
  });

  if (kvkNummer == null || voorkeurenStatus === "pending") return null;

  const visible = publicaties.slice(0, visibleCount);

  return postcodes.length === 0 ? (
    <p className="text-sm text-neutral-600">
      Voeg een postcode toe om publicaties te zien.
    </p>
  ) : pubStatus === "pending" ? (
    <p className="text-sm text-neutral-600">Publicaties laden...</p>
  ) : pubStatus === "error" ? (
    <p className="text-sm text-neutral-600">
      Er is een fout opgetreden bij het ophalen van publicaties.
    </p>
  ) : publicaties.length === 0 ? (
    <p className="text-sm text-neutral-600">
      Geen publicaties gevonden voor uw postcodes.
    </p>
  ) : (
    <>
      <div className="divide-y divide-neutral-200">
        {visible.map((pub) => (
          <PublicatieCard key={pub.preferredUrl} publicatie={pub} />
        ))}
      </div>
      {visibleCount < publicaties.length && (
        <button
          onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
          className="mt-4 rounded bg-[#154273] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0e2f54]"
        >
          Meer Berichten over uw buurt &rarr;
        </button>
      )}
    </>
  );
};

export default PublicatiesOverzicht;

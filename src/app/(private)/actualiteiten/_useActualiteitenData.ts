"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useGetVoorkeuren } from "@/network/actualiteiten/hooks/getVoorkeuren/useGetVoorkeuren";
import { getArticles } from "@/network/actualiteiten/fetchers/getArticles";
import { getSubsidies } from "@/network/actualiteiten/fetchers/getSubsidies";
import { getBerichten } from "@/network/actualiteiten/fetchers/getBerichten";
import type { components } from "@/network/actualiteiten/generated";
import { type SectionKey } from "./_subjectGroups";

type EnrichedArticle = components["schemas"]["EnrichedArticle"];
type EnrichedSubsidie = components["schemas"]["EnrichedSubsidie"];
type SruPublicatie = components["schemas"]["SruPublicatie"];

const INFORMATIE_TYPES = new Set(["artikel-nl", "stepbystep", "video"]);
const REGELGEVING_TYPES = new Set(["regel-nl", "wetswijziging-nl"]);

export interface ActualiteitenData {
  informatieArticles: EnrichedArticle[];
  regelgevingArticles: EnrichedArticle[];
  subsidies: EnrichedSubsidie[];
  subsidiesTotal: number;
  berichten: SruPublicatie[];
  articlesStatus: "pending" | "error" | "success";
  subsidiesStatus: "pending" | "error" | "success";
  berichtenStatus: "pending" | "error" | "success";
  sectionCounts: Record<SectionKey, number | null>;
  hasPostcodes: boolean;
  postcodes: string[];
  selectedSubjects: string[];
}

export function useActualiteitenData(): ActualiteitenData {
  const { data: voorkeuren, status: voorkeurenStatus } = useGetVoorkeuren();

  const selectedSubjects = (voorkeuren?.onderwerpen ?? []).map(
    (v) => v.onderwerp,
  );

  const postcodes = (voorkeuren?.postcodes ?? []).map((v) => v.postcode);

  const { data: articlesData, status: articlesStatus } = useQuery({
    queryKey: ["actualiteiten", "articles", selectedSubjects],
    queryFn: () =>
      getArticles({
        subjects: selectedSubjects.length > 0 ? selectedSubjects : undefined,
      }),
    staleTime: 1000 * 60 * 60,
    enabled: voorkeurenStatus !== "pending",
  });

  const { data: subsidieData, status: subsidiesStatus } = useQuery({
    queryKey: ["actualiteiten", "subsidies", selectedSubjects],
    queryFn: () =>
      getSubsidies({
        subjects: selectedSubjects.length > 0 ? selectedSubjects : undefined,
      }),
    staleTime: 1000 * 60 * 60,
    enabled: voorkeurenStatus !== "pending",
  });

  const { data: berichtenData, status: berichtenStatus } = useQuery({
    queryKey: ["actualiteiten", "berichten"],
    queryFn: () => getBerichten(),
    staleTime: 1000 * 60 * 60,
    enabled: postcodes.length > 0,
  });

  return useMemo(() => {
    const articles = articlesData?.articles ?? [];

    const informatieArticles = articles.filter((a) =>
      INFORMATIE_TYPES.has(a.additionalType ?? ""),
    );
    const regelgevingArticles = articles.filter((a) =>
      REGELGEVING_TYPES.has(a.additionalType ?? ""),
    );

    const subsidies = subsidieData?.subsidies ?? [];
    const subsidiesTotal = subsidieData?.total ?? 0;
    const berichten = berichtenData ?? [];

    const sectionCounts: Record<SectionKey, number | null> = {
      berichten:
        postcodes.length > 0 ? (berichtenData ? berichten.length : null) : 0,
      informatie: articlesData ? informatieArticles.length : null,
      regelgeving: articlesData ? regelgevingArticles.length : null,
      subsidies: subsidieData ? subsidiesTotal : null,
    };

    return {
      informatieArticles,
      regelgevingArticles,
      subsidies,
      subsidiesTotal,
      berichten,
      articlesStatus:
        voorkeurenStatus === "pending" ? "pending" : articlesStatus,
      subsidiesStatus:
        voorkeurenStatus === "pending" ? "pending" : subsidiesStatus,
      berichtenStatus:
        postcodes.length === 0
          ? "success"
          : voorkeurenStatus === "pending"
            ? "pending"
            : berichtenStatus,
      sectionCounts,
      hasPostcodes: postcodes.length > 0,
      postcodes,
      selectedSubjects,
    };
  }, [
    articlesData,
    subsidieData,
    berichtenData,
    selectedSubjects,
    postcodes,
    voorkeurenStatus,
    articlesStatus,
    subsidiesStatus,
    berichtenStatus,
  ]);
}

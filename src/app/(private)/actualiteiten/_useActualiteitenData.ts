"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useGetProfielInformation } from "@/network/profiel/hooks/getProfielInformation/useGetProfielInformation";
import { getArticles } from "@/network/ondernemersplein/fetchers/getArticles";
import { getSubsidies } from "@/network/ondernemersplein/fetchers/getSubsidies";
import { getPublicatiesByPostcodes } from "@/network/sru/fetchers/getPublicatiesByPostcodes";
import type { components } from "@/network/dop/opendata/generated";
import type { SruPublicatie } from "@/network/sru/types";
import { VOORKEUR_TYPE_ONDERWERP, type SectionKey } from "./_voorkeurenBeheer";

type ArticleSummary = components["schemas"]["ArticleSummary"];
type SubsidieSummary = components["schemas"]["SubsidieSummary"];

const INFORMATIE_TYPES = new Set(["artikel-nl", "stepbystep", "video"]);
const REGELGEVING_TYPES = new Set(["regel-nl", "wetswijziging-nl"]);

export interface ActualiteitenData {
  // Filtered article lists
  informatieArticles: ArticleSummary[];
  regelgevingArticles: ArticleSummary[];
  subsidies: SubsidieSummary[];
  subsidiesTotal: number;
  berichten: SruPublicatie[];
  // Loading states
  articlesStatus: "pending" | "error" | "success";
  subsidiesStatus: "pending" | "error" | "success";
  berichtenStatus: "pending" | "error" | "success";
  // Counts
  sectionCounts: Record<SectionKey, number | null>;
  // Postcodes info
  hasPostcodes: boolean;
  postcodes: string[];
  // Whether subject filters are active
  hasSubjectFilter: boolean;
  // Currently selected subjects
  selectedSubjects: string[];
}

export function useActualiteitenData(kvkNummer: string): ActualiteitenData {
  const { data: profielData, status: profielStatus } =
    useGetProfielInformation("KVK", kvkNummer);

  const voorkeuren = profielData?.data?.voorkeuren ?? [];

  const selectedSubjects = voorkeuren
    .filter((v) => v.voorkeurType === VOORKEUR_TYPE_ONDERWERP)
    .map((v) => v.waarde!)
    .filter(Boolean);

  const postcodes = voorkeuren
    .filter((v) => v.voorkeurType === "PostcodeInUwBuurt")
    .map((v) => v.waarde!)
    .filter(Boolean);

  // Single articles fetch — no type filter, split client-side
  const { data: allArticles, status: articlesStatus } = useQuery({
    queryKey: ["articles", "all", selectedSubjects],
    queryFn: () =>
      getArticles({
        subjects: selectedSubjects.length > 0 ? selectedSubjects : undefined,
        limit: 200,
      }),
    staleTime: 1000 * 60 * 60,
    enabled: profielStatus !== "pending",
  });

  // Single subsidies fetch
  const { data: subsidieData, status: subsidiesStatus } = useQuery({
    queryKey: ["subsidies", selectedSubjects],
    queryFn: () =>
      getSubsidies({
        subjects: selectedSubjects.length > 0 ? selectedSubjects : undefined,
        limit: 200,
      }),
    staleTime: 1000 * 60 * 60,
    enabled: profielStatus !== "pending",
  });

  // Berichten fetch — only depends on postcodes, not subjects
  const { data: allPublicaties, status: berichtenStatus } = useQuery({
    queryKey: ["publicaties", "postcodes", postcodes],
    queryFn: () => getPublicatiesByPostcodes(postcodes),
    staleTime: 1000 * 60 * 60,
    enabled: postcodes.length > 0,
  });

  return useMemo(() => {
    const articles = allArticles?.articles ?? [];

    const informatieArticles = articles.filter((a) =>
      INFORMATIE_TYPES.has(a.additionalType ?? ""),
    );
    const regelgevingArticles = articles.filter((a) =>
      REGELGEVING_TYPES.has(a.additionalType ?? ""),
    );

    const subsidies = subsidieData?.subsidies ?? [];
    const subsidiesTotal = subsidieData?.total ?? 0;

    // Filter berichten by subject keywords client-side
    const allBerichten = allPublicaties ?? [];
    let berichten: SruPublicatie[];
    if (selectedSubjects.length === 0) {
      berichten = allBerichten;
    } else {
      const keywords = selectedSubjects.map((s) => s.toLowerCase());
      berichten = allBerichten.filter((pub) => {
        const haystack =
          `${pub.title} ${pub.subject} ${pub.abstract}`.toLowerCase();
        return keywords.some((kw) => haystack.includes(kw));
      });
    }

    // Section counts derived from the same data
    const sectionCounts: Record<SectionKey, number | null> = {
      berichten: postcodes.length > 0 ? (allPublicaties ? berichten.length : null) : 0,
      informatie: allArticles ? informatieArticles.length : null,
      regelgeving: allArticles ? regelgevingArticles.length : null,
      subsidies: subsidieData ? subsidiesTotal : null,
    };

    return {
      informatieArticles,
      regelgevingArticles,
      subsidies,
      subsidiesTotal,
      berichten,
      articlesStatus: profielStatus === "pending" ? "pending" : articlesStatus,
      subsidiesStatus: profielStatus === "pending" ? "pending" : subsidiesStatus,
      berichtenStatus:
        postcodes.length === 0
          ? "success"
          : profielStatus === "pending"
            ? "pending"
            : berichtenStatus,
      sectionCounts,
      hasPostcodes: postcodes.length > 0,
      postcodes,
      hasSubjectFilter: selectedSubjects.length > 0,
      selectedSubjects,
    };
  }, [
    allArticles,
    subsidieData,
    allPublicaties,
    selectedSubjects,
    postcodes,
    profielStatus,
    articlesStatus,
    subsidiesStatus,
    berichtenStatus,
  ]);
}

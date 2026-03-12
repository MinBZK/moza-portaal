"use server";

import dopOpenDataClient from "@/network/dop/opendata";
import type { components } from "@/network/dop/opendata/generated";

type SubsidieSummary = components["schemas"]["SubsidieSummary"];

export const getSubsidies = async (options: {
  subjects?: string[];
  regions?: string[];
  offset?: number;
  limit?: number;
}): Promise<{
  subsidies: SubsidieSummary[];
  total: number;
}> => {
  const { subjects, regions, offset = 0, limit = 20 } = options;

  const { data } = await dopOpenDataClient.GET("/api/v1/subsidies", {
    params: {
      query: {
        subjects,
        regions,
        offset,
        limit,
      },
    },
  });

  return {
    subsidies: data?.subsidies ?? [],
    total: data?.pagination?.total ?? 0,
  };
};

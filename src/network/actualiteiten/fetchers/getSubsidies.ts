"use server";

import actualiteitenClient from "@/network/actualiteiten";
import type { components } from "@/network/actualiteiten/generated";

type EnrichedSubsidie = components["schemas"]["EnrichedSubsidie"];

export const getSubsidies = async (options: {
  subjects?: string[];
  regions?: string[];
  offset?: number;
  limit?: number;
}): Promise<{ subsidies: EnrichedSubsidie[]; total: number }> => {
  const { subjects, regions, offset, limit } = options;

  const { data } = await actualiteitenClient.GET(
    "/api/actualiteitenservice/v1/subsidies",
    {
      params: {
        query: {
          subject: subjects,
          region: regions,
          offset,
          limit,
        },
      },
    },
  );

  return {
    subsidies: data?.subsidies ?? [],
    total: data?.total ?? 0,
  };
};

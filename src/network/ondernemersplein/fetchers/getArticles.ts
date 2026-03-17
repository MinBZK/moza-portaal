"use server";

import dopOpenDataClient from "@/network/dop/opendata";
import type { components } from "@/network/dop/opendata/generated";

type ArticleSummary = components["schemas"]["ArticleSummary"];

export const getArticles = async (options: {
  search?: string;
  subjects?: string[];
  types?: string[];
  offset?: number;
  limit?: number;
}): Promise<{
  articles: ArticleSummary[];
  total: number;
}> => {
  const { search, subjects, types, offset = 0, limit = 20 } = options;

  const { data } = await dopOpenDataClient.GET("/api/v1/articles", {
    params: {
      query: {
        search,
        subject: subjects,
        type: types,
        offset,
        limit,
        order: "modified:desc",
      },
    },
  });

  return {
    articles: data?.articles ?? [],
    total: data?.pagination?.total ?? 0,
  };
};

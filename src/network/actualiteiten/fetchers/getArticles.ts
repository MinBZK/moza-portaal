"use server";

import actualiteitenClient from "@/network/actualiteiten";
import type { components } from "@/network/actualiteiten/generated";

type EnrichedArticle = components["schemas"]["EnrichedArticle"];

export const getArticles = async (options: {
  search?: string;
  subjects?: string[];
  types?: string[];
  offset?: number;
  limit?: number;
}): Promise<{ articles: EnrichedArticle[]; total: number }> => {
  const { search, subjects, types, offset, limit } = options;

  const { data } = await actualiteitenClient.GET(
    "/api/actualiteitenservice/v1/articles",
    {
      params: {
        query: {
          search,
          subject: subjects,
          type: types,
          offset,
          limit,
        },
      },
    },
  );

  return {
    articles: data?.articles ?? [],
    total: data?.total ?? 0,
  };
};

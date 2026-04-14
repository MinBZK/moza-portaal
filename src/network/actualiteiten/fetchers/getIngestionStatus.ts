"use server";

import actualiteitenClient from "@/network/actualiteiten";

export const getIngestionStatus = async (): Promise<Record<string, string>> => {
  const { data } = await actualiteitenClient.GET(
    "/api/actualiteitenservice/v1/ingestion-status",
  );

  return (data ?? {}) as Record<string, string>;
};

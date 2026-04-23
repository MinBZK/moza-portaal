"use server";

import actualiteitenClient from "@/network/actualiteiten";
import type { components } from "@/network/actualiteiten/generated";
import { getAuthHeaders } from "@/network/authHeaders";

type SruPublicatie = components["schemas"]["SruPublicatie"];

export const getBerichten = async (): Promise<SruPublicatie[]> => {
  const headers = await getAuthHeaders();
  const { data } = await actualiteitenClient.GET(
    "/api/actualiteitenservice/v1/berichten",
    { headers },
  );

  return data ?? [];
};

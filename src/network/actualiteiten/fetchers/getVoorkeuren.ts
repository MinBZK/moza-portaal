"use server";

import actualiteitenClient from "@/network/actualiteiten";
import type { components } from "@/network/actualiteiten/generated";
import { getAuthHeaders } from "@/network/authHeaders";

type VoorkeurenResponse = components["schemas"]["VoorkeurenResponse"];

export const getVoorkeuren = async (): Promise<VoorkeurenResponse> => {
  const headers = await getAuthHeaders();
  const { data } = await actualiteitenClient.GET(
    "/api/actualiteitenservice/v1/voorkeuren",
    { headers },
  );

  return data ?? { postcodes: [], onderwerpen: [], favorieten: [] };
};

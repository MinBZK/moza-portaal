"use server";

import actualiteitenClient from "@/network/actualiteiten";
import type { components } from "@/network/actualiteiten/generated";

type VoorkeurenResponse = components["schemas"]["VoorkeurenResponse"];

export const getVoorkeuren = async (
  identificatieType: string,
  identificatieNummer: string,
): Promise<VoorkeurenResponse> => {
  const { data } = await actualiteitenClient.GET(
    "/api/actualiteitenservice/v1/voorkeuren/{identificatieType}/{identificatieNummer}",
    {
      params: {
        path: { identificatieType, identificatieNummer },
      },
    },
  );

  return data ?? { postcodes: [], onderwerpen: [], favorieten: [] };
};

"use server";

import actualiteitenClient from "@/network/actualiteiten";
import type { components } from "@/network/actualiteiten/generated";

type SruPublicatie = components["schemas"]["SruPublicatie"];

export const getBerichten = async (
  identificatieType: string,
  identificatieNummer: string,
): Promise<SruPublicatie[]> => {
  const { data } = await actualiteitenClient.GET(
    "/api/actualiteitenservice/v1/berichten/{identificatieType}/{identificatieNummer}",
    {
      params: {
        path: { identificatieType, identificatieNummer },
      },
    },
  );

  return data ?? [];
};

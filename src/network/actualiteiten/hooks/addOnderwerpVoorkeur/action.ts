"use server";

import actualiteitenClient from "@/network/actualiteiten";

export const addOnderwerpVoorkeur = async (
  identificatieType: string,
  identificatieNummer: string,
  onderwerp: string,
) => {
  const response = await actualiteitenClient.POST(
    "/api/actualiteitenservice/v1/voorkeuren/onderwerp/{identificatieType}/{identificatieNummer}",
    {
      params: { path: { identificatieType, identificatieNummer } },
      body: { onderwerp },
    },
  );
  return response.response.status;
};

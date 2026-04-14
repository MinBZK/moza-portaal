"use server";

import actualiteitenClient from "@/network/actualiteiten";

export const deleteOnderwerpVoorkeur = async (
  identificatieType: string,
  identificatieNummer: string,
  id: number,
) => {
  const response = await actualiteitenClient.DELETE(
    "/api/actualiteitenservice/v1/voorkeuren/onderwerp/{identificatieType}/{identificatieNummer}/{id}",
    {
      params: { path: { identificatieType, identificatieNummer, id } },
    },
  );
  return response.response.status;
};

"use server";

import actualiteitenClient from "@/network/actualiteiten";

export const addPostcodeVoorkeur = async (
  identificatieType: string,
  identificatieNummer: string,
  postcode: string,
) => {
  const response = await actualiteitenClient.POST(
    "/api/actualiteitenservice/v1/voorkeuren/postcode/{identificatieType}/{identificatieNummer}",
    {
      params: { path: { identificatieType, identificatieNummer } },
      body: { postcode: postcode.toUpperCase().replace(/\s/g, "") },
    },
  );
  return response.response.status;
};

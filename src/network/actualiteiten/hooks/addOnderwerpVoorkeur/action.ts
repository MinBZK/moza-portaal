"use server";

import actualiteitenClient from "@/network/actualiteiten";
import { getAuthHeaders } from "@/network/authHeaders";

export const addOnderwerpVoorkeur = async (onderwerp: string) => {
  const headers = await getAuthHeaders();
  const response = await actualiteitenClient.POST(
    "/api/actualiteitenservice/v1/voorkeuren/onderwerp",
    {
      headers,
      body: { onderwerp },
    },
  );
  return response.response.status;
};

"use server";

import actualiteitenClient from "@/network/actualiteiten";
import { getAuthHeaders } from "@/network/authHeaders";

export const deleteOnderwerpVoorkeur = async (id: number) => {
  const headers = await getAuthHeaders();
  const response = await actualiteitenClient.DELETE(
    "/api/actualiteitenservice/v1/voorkeuren/onderwerp/{id}",
    {
      headers,
      params: { path: { id } },
    },
  );
  return response.response.status;
};

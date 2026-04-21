"use server";

import actualiteitenClient from "@/network/actualiteiten";
import { getAuthHeaders } from "@/network/authHeaders";

export const addPostcodeVoorkeur = async (postcode: string) => {
  const headers = await getAuthHeaders();
  const response = await actualiteitenClient.POST(
    "/api/actualiteitenservice/v1/voorkeuren/postcode",
    {
      headers,
      body: { postcode: postcode.toUpperCase().replace(/\s/g, "") },
    },
  );
  return response.response.status;
};

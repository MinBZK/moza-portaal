"use server";

import profielClient from "@/network/profiel";
import { components } from "@/network/profiel/generated";

export const updateVoorkeur = async (
  identificatieNummer: string,
  identificatieType: components["schemas"]["IdentificatieType"],
  voorkeurType: components["schemas"]["VoorkeurType"],
  waarde: string,
  id?: string,
  scope?: components["schemas"]["ScopeRequest"],
) => {
  if (id) {
    const response = await profielClient.PUT("/api/profielservice/v1/voorkeur", {
      body: {
        id,
        voorkeurType,
        waarde,
        identificatieNummer,
        identificatieType,
        scope,
      },
    });
    return response.response.status;
  } else {
    const response = await profielClient.POST("/api/profielservice/v1/voorkeur", {
      body: {
        voorkeurType,
        waarde,
        identificatieNummer,
        identificatieType,
        scope,
      },
    });
    return response.response.status;
  }
};

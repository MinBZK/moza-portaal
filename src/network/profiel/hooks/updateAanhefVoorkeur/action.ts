"use server";

import profielClient from "@/network/profiel";
import { components } from "@/network/profiel/generated";

export const updateVoorkeur = async (
  identificatieNummer: string,
  identificatieType: components["schemas"]["IdentificatieType"],
  voorkeurType: components["schemas"]["VoorkeurType"],
  waarde: string,
  id?: number,
) => {
  if (id) {
    const response = await profielClient.PUT(
      "/api/profielservice/v1/voorkeur/{identificatieType}/{identificatieNummer}",
      {
        body: {
          id,
          voorkeurType,
          waarde,
        },
        params: {
          path: { identificatieNummer, identificatieType },
        },
      },
    );
    return response.response.status;
  } else {
    const response = await profielClient.POST(
      "/api/profielservice/v1/voorkeur/{identificatieType}/{identificatieNummer}",
      {
        body: {
          voorkeurType,
          waarde,
        },
        params: {
          path: { identificatieNummer, identificatieType },
        },
      },
    );
    return response.response.status;
  }
};

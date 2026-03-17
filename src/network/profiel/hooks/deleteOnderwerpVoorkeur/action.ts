"use server";

import profielClient from "@/network/profiel";
import { components } from "@/network/profiel/generated";

export const deleteOnderwerpVoorkeur = async (
  identificatieNummer: string,
  identificatieType: components["schemas"]["IdentificatieType"],
  voorkeurId: number,
) => {
  const response = await profielClient.DELETE(
    "/api/profielservice/v1/voorkeur/{identificatieType}/{identificatieNummer}/{voorkeurId}",
    {
      params: {
        path: {
          identificatieNummer,
          identificatieType,
          voorkeurId,
        },
      },
    },
  );

  return response.response.status;
};

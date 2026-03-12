"use server";

import profielClient from "@/network/profiel";
import { components } from "@/network/profiel/generated";

export const addOnderwerpVoorkeur = async (
  identificatieNummer: string,
  identificatieType: components["schemas"]["IdentificatieType"],
  onderwerp: string,
) => {
  const body: components["schemas"]["VoorkeurRequest"] = {
    voorkeurType: "ActueleOnderwerpVoorkeur",
    waarde: onderwerp,
  };

  const response = await profielClient.POST(
    "/api/profielservice/v1/voorkeur/{identificatieType}/{identificatieNummer}",
    {
      body,
      params: {
        path: {
          identificatieNummer,
          identificatieType,
        },
      },
    },
  );

  return response.response.status;
};

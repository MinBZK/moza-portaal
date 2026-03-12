"use server";

import profielClient from "@/network/profiel";
import { components } from "@/network/profiel/generated";

export const addPostcodeVoorkeur = async (
  identificatieNummer: string,
  identificatieType: components["schemas"]["IdentificatieType"],
  postcode: string,
) => {
  const body: components["schemas"]["VoorkeurRequest"] = {
    voorkeurType: "PostcodeInUwBuurt",
    waarde: postcode.toUpperCase().replace(/\s/g, ""),
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

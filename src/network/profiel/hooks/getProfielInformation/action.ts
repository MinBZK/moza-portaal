"use server";

import profielClient from "@/network/profiel";
import { components } from "@/network/profiel/generated";

type TParams = {
  identificatieNummer: string;
  identificatieType: components["schemas"]["IdentificatieType"];
  dienstverlener?: string;
  dienstNaam?: string;
};

export const getProfielInformation = async ({
  identificatieNummer,
  identificatieType,
  dienstverlener,
  dienstNaam,
}: TParams) => {
  const { data, response } = await profielClient.POST(
    "/api/profielservice/v1/partij",
    {
      body: {
        identificatieNummer,
        identificatieType,
        dienstverlener,
        dienstNaam,
      },
    },
  );
  return { data: data, status: response.status };
};

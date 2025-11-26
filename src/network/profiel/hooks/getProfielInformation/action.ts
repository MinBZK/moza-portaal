"use server";

import profielClient from "@/network/profiel";
import { components } from "@/network/profiel/generated";

type TParams = {
  identificatieNummer: string;
  identificatieType: components["schemas"]["IdentificatieType"];
};

export const getProfielInformation = async ({
  identificatieNummer,
  identificatieType,
}: TParams) => {
  const { data, response } = await profielClient.GET(
    "/api/profielservice/v1/{identificatieType}/{identificatieNummer}",
    {
      params: {
        path: {
          identificatieType,
          identificatieNummer,
        },
      },
    },
  );
  return { data: data, status: response.status };
};

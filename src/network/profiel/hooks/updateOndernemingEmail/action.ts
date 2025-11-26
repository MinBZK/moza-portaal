"use server";

import profielClient from "@/network/profiel";
import { components } from "@/network/profiel/generated";

export const updateEmail = async (
  identificatieNummer: string,
  identificatieType: components["schemas"]["IdentificatieType"],
  body: components["schemas"]["ContactgegevenUpdateRequest"],
) => {
  if (body.id) {
    const response = await profielClient.PUT(
      "/api/profielservice/v1/contactgegeven/{identificatieType}/{identificatieNummer}",
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
  } else {
    const response = await profielClient.POST(
      "/api/profielservice/v1/contactgegeven/{identificatieType}/{identificatieNummer}",
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
  }
};

"use server";

import profielClient from "@/network/profiel";
import { components } from "@/network/profiel/generated";

export const updateEmail = async (
  identificatieNummer: string,
  identificatieType: components["schemas"]["IdentificatieType"],
  body: components["schemas"]["ContactgegevenUpdateRequest"],
  isDefault: boolean = true, // TODO: caller should decide once multiple emails are supported
) => {
  if (body.id) {
    const response = await profielClient.PUT("/api/profielservice/v1/contactgegeven", {
      body: {
        ...body,
        identificatieNummer,
        identificatieType,
        isDefault,
      },
    });
    return response.response.status;
  } else {
    const { id: _id, ...postBody } = body;
    const response = await profielClient.POST(
      "/api/profielservice/v1/contactgegeven",
      {
        body: {
          ...postBody,
          identificatieNummer,
          identificatieType,
          isDefault,
        },
      },
    );
    return response.response.status;
  }
};

export const verifyEmail = async (
  body: components["schemas"]["EmailVerificatieRequest"],
) => {
  const response = await profielClient.POST(
    "/api/profielservice/v1/emailverificatie",
    { body },
  );
  console.log(response);
  return response.response.status;
};

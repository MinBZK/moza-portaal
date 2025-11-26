"use server";

import kvkOrganisatieRegisterClient from "../index";

export const GetKvknummersByBsn = async (bsn: string) => {
  const response = await kvkOrganisatieRegisterClient.POST(
    "/mijnoverheid/mijnorganisaties",
    {
      body: {
        bsn,
      },
    },
  );

  if (response.data) {
    return response.data;
  } else {
    return {};
  }
};

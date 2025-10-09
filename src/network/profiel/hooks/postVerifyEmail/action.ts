"use server";

import profielClient from "@/network/profiel";

type TParams = {
  kvkNummer: string;
  code: string;
};

export const postVerifyEmail = async (params: TParams) => {
  const response = await profielClient.POST(
    "/ondernemingen/{kvkNummer}/verify",
    {
      params: {
        path: { kvkNummer: params.kvkNummer },
        query: { code: params.code },
      },
    },
  );

  return response.response.status;
};

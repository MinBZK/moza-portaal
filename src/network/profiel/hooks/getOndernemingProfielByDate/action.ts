"use server";

import profielClient from "@/network/profiel";

type TParams = {
  kvkNummer: string;
  datetime: string;
};

export const getOndernemingByDate = async (params: TParams) => {
  const { data, response } = await profielClient.GET(
    "/ondernemingen/{kvkNummer}/{timestamp}",
    {
      params: {
        path: { kvkNummer: params.kvkNummer, timestamp: params.datetime },
      },
    },
  );

  return { data: data, status: response.status };
};

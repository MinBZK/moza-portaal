"use server";

import kvkBasisprofielClient from "../index";

export const GetBasisprofielByKvkNummer = async (kvkNummer: string) => {
  const response = await kvkBasisprofielClient.GET(
    "/basisprofielen/{kvkNummer}",
    {
      params: {
        path: {
          kvkNummer,
        },
      },
    },
  );

  if (response.data) {
    return response.data;
  } else {
    return {};
  }
};

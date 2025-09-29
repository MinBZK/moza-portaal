"use server";

import kvkClient from "..";

export const GetKvknummersByBsn = async (bsn: string) => {
  const response = await kvkClient.POST("/mijnoverheid/mijnorganisaties", {
    body: {
      bsn,
    },
  });

  if (response.data) {
    return response.data;
  } else {
    return {};
  }
};

"use server";

import { auth } from "@/auth";

export const getAuthHeaders = async (): Promise<
  Record<string, string>
> => {
  const session = await auth();
  return session?.accessToken
    ? { Authorization: `Bearer ${session.accessToken}` }
    : {};
};

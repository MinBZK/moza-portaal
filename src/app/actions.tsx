"use server";

import {
  defaultFlags,
  FeatureFlags,
  featureFlagsSchema,
} from "@/app/(private)/instellingen/_featureFlags";
import { cookies } from "next/headers";

// We can't use the useCookie hook here, because it's meant for client-side usage. Instead, we directly interact with the cookies API provided by Next.js in server actions.
export async function setFeatureFlagsCookie(flags: FeatureFlags) {
  // Validate with Zod
  const result = featureFlagsSchema.safeParse(flags);
  if (!result.success) {
    throw new Error(
      "Invalid feature flags: " + JSON.stringify(result.error.format()),
    );
  }

  const cookiesStore = await cookies();
  cookiesStore.set("flags", JSON.stringify(flags), {
    path: "/",
    httpOnly: true,
  });
}

export const getFlagsFromServerCookie = async () => {
  const cookieStore = await cookies();
  const flagsCookie = cookieStore.get("flags")?.value;

  let flags = {} as FeatureFlags;
  if (flagsCookie) {
    try {
      flags = JSON.parse(decodeURIComponent(flagsCookie));
      const result = featureFlagsSchema.safeParse(flags);
      if (!result.success) {
        flags = defaultFlags;
      }
    } catch {
      flags = defaultFlags;
    }
  }
  return flags;
};

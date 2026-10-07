"use server";

import {
  defaultFlags,
  FeatureFlagKey,
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

export const getFlagsFromServerCookie = async (): Promise<FeatureFlags> => {
  const cookieStore = await cookies();
  const flagsCookie = cookieStore.get("flags")?.value;
  if (!flagsCookie) return defaultFlags;

  try {
    // Een cookie van voor een nieuwe flag mist die sleutel: vul aan met de standaard.
    const result = featureFlagsSchema
      .partial()
      .safeParse(JSON.parse(decodeURIComponent(flagsCookie)));
    return result.success ? { ...defaultFlags, ...result.data } : defaultFlags;
  } catch {
    return defaultFlags;
  }
};

export async function setFeatureFlag(key: FeatureFlagKey, value: boolean) {
  const flags = await getFlagsFromServerCookie();
  await setFeatureFlagsCookie({ ...flags, [key]: value });
}

export async function resetFeatureFlags() {
  const cookiesStore = await cookies();
  cookiesStore.delete("flags");
}

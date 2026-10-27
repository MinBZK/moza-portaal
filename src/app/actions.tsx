"use server";

import {
  BERICHTENBOX_VARIANT_COOKIE,
  type BerichtenboxVariant,
  defaultFlags,
  FeatureFlagKey,
  FeatureFlags,
  featureFlagsSchema,
  isBerichtenboxVariant,
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
  cookiesStore.delete(BERICHTENBOX_VARIANT_COOKIE);
}

/** De gekozen variant van de Berichtenbox A/B/C-test; standaard A. */
export const getBerichtenboxVariant =
  async (): Promise<BerichtenboxVariant> => {
    const waarde = (await cookies()).get(BERICHTENBOX_VARIANT_COOKIE)?.value;
    return isBerichtenboxVariant(waarde) ? waarde : "a";
  };

export async function setBerichtenboxVariant(variant: BerichtenboxVariant) {
  if (!isBerichtenboxVariant(variant)) throw new Error("Onbekende variant");
  (await cookies()).set(BERICHTENBOX_VARIANT_COOKIE, variant, {
    path: "/",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30,
  });
}

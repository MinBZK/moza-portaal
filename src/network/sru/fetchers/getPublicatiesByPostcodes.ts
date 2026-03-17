"use server";

import type { SruPublicatie } from "../types";
import { getPublicatiesByPostcode } from "./getPublicatiesByPostcode";

export const getPublicatiesByPostcodes = async (
  postcodes: string[],
  maximumRecords = 50,
): Promise<SruPublicatie[]> => {
  if (postcodes.length === 0) return [];

  const results = await Promise.all(
    postcodes.map((pc) => getPublicatiesByPostcode(pc, maximumRecords)),
  );

  const allPublicaties = results.flatMap((r) => r.publicaties);

  // Deduplicate by id
  const seen = new Set<string>();
  const unique = allPublicaties.filter((pub) => {
    const key = pub.id || pub.preferredUrl;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Sort by date descending
  unique.sort((a, b) => b.modified.localeCompare(a.modified));

  return unique;
};

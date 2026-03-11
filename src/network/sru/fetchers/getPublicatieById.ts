"use server";

import { XMLParser } from "fast-xml-parser";
import type { SruPublicatie } from "../types";
import { textOf, extractArray } from "../xml-helpers";

const parser = new XMLParser({
  ignoreAttributes: false,
  removeNSPrefix: true,
});

const SRU_BASE_URL = "https://repository.overheid.nl/sru";

export const getPublicatieById = async (
  id: string,
): Promise<SruPublicatie | null> => {
  const query = `dt.identifier = "${id}"`;
  const url = `${SRU_BASE_URL}?query=${encodeURIComponent(query)}&maximumRecords=1`;

  const response = await fetch(url, {
    next: { revalidate: 3600 },
  });

  if (!response.ok) return null;

  const xml = await response.text();
  const parsed = parser.parse(xml);

  const searchRetrieveResponse = parsed?.searchRetrieveResponse;
  const totalResults = searchRetrieveResponse?.numberOfRecords ?? 0;

  if (totalResults === 0) return null;

  const records = searchRetrieveResponse?.records?.record;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const record: any = Array.isArray(records) ? records[0] : records;
  if (!record) return null;

  const gzd = record?.recordData?.gzd;
  const originalData = gzd?.originalData;
  const meta = originalData?.meta;
  const owmskern = meta?.owmskern;
  const owmsmantel = meta?.owmsmantel;
  const tpmeta = meta?.tpmeta;
  const enrichedData = gzd?.enrichedData;

  const spatialValues = extractArray(owmskern?.spatial).map(textOf);
  const postcodeFromTpmeta = String(tpmeta?.postcodeHuisnummer ?? "").split(" ")[0];
  const postcodes = [
    ...spatialValues.filter((s) => /^[1-9][0-9]{3}\s?[A-Za-z]{2}$/.test(s)),
    ...(postcodeFromTpmeta && /^[1-9][0-9]{3}[A-Za-z]{2}$/.test(postcodeFromTpmeta)
      ? [postcodeFromTpmeta]
      : []),
  ];

  const preferredUrl = enrichedData?.preferredUrl ?? enrichedData?.url ?? "";

  return {
    id: String(textOf(owmskern?.identifier) || id),
    title: String(owmskern?.title ?? ""),
    type: textOf(owmskern?.type),
    creator: textOf(owmskern?.creator),
    modified: String(owmskern?.modified ?? ""),
    abstract: String(
      textOf(owmsmantel?.abstract) ||
      textOf(owmsmantel?.alternative) ||
      textOf(owmsmantel?.description) ||
      "",
    ),
    preferredUrl: String(preferredUrl),
    bronUrl: String(tpmeta?.bronIdentifier ?? ""),
    postcodes: [...new Set(postcodes)],
    productArea: String(tpmeta?.["product-area"] ?? ""),
    audience: textOf(owmsmantel?.audience),
    subject: textOf(owmsmantel?.subject),
    publicatienaam: String(tpmeta?.publicatienaam ?? ""),
  };
};


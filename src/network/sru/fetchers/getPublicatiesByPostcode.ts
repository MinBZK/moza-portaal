"use server";

import { XMLParser } from "fast-xml-parser";
import type { SruPublicatie, SruResponse } from "../types";
import { textOf, extractArray } from "../xml-helpers";

const parser = new XMLParser({
  ignoreAttributes: false,
  removeNSPrefix: true,
});

const SRU_BASE_URL = "https://repository.overheid.nl/sru";

export const getPublicatiesByPostcode = async (
  postcode: string,
  maximumRecords = 50,
): Promise<SruResponse> => {
  const query = `dt.spatial within /postcode "${postcode}"`;
  const url = `${SRU_BASE_URL}?query=${encodeURIComponent(query)}&maximumRecords=${maximumRecords}`;

  const response = await fetch(url, {
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    return { publicaties: [], totalResults: 0 };
  }

  const xml = await response.text();
  const parsed = parser.parse(xml);

  const searchRetrieveResponse = parsed?.searchRetrieveResponse;
  const totalResults = searchRetrieveResponse?.numberOfRecords ?? 0;

  if (totalResults === 0) {
    return { publicaties: [], totalResults: 0 };
  }

  const records = searchRetrieveResponse?.records?.record;
  const recordArray = Array.isArray(records) ? records : records ? [records] : [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const publicaties: SruPublicatie[] = recordArray.map((record: any) => {
    const gzd = record?.recordData?.gzd;
    const originalData = gzd?.originalData;
    const meta = originalData?.meta;
    const owmskern = meta?.owmskern;
    const owmsmantel = meta?.owmsmantel;
    const tpmeta = meta?.tpmeta;
    const enrichedData = gzd?.enrichedData;

    // Fields with scheme attributes are parsed as { "#text": "value", "@_scheme": "..." }
    const typeValue = textOf(owmskern?.type);
    const creatorValue = textOf(owmskern?.creator);

    // dcterms:spatial can also be multiple values
    const spatialRaw = owmskern?.spatial;
    const spatialValues = extractArray(spatialRaw).map(textOf);
    const postcodeFromTpmeta = String(tpmeta?.postcodeHuisnummer ?? "").split(" ")[0];
    const postcodes = [
      ...spatialValues.filter((s) => /^[1-9][0-9]{3}\s?[A-Za-z]{2}$/.test(s)),
      ...(postcodeFromTpmeta && /^[1-9][0-9]{3}[A-Za-z]{2}$/.test(postcodeFromTpmeta)
        ? [postcodeFromTpmeta]
        : []),
    ];
    const uniquePostcodes = [...new Set(postcodes)];

    // preferredUrl may not exist; fall back to the first itemUrl or gzd:url
    const preferredUrl =
      enrichedData?.preferredUrl ?? enrichedData?.url ?? "";

    const identifier = String(textOf(owmskern?.identifier) || "");

    return {
      id: identifier,
      title: String(owmskern?.title ?? ""),
      type: typeValue,
      creator: creatorValue,
      modified: String(owmskern?.modified ?? ""),
      abstract: String(
        textOf(owmsmantel?.abstract) ||
        textOf(owmsmantel?.alternative) ||
        textOf(owmsmantel?.description) ||
        "",
      ),
      preferredUrl: String(preferredUrl),
      bronUrl: String(tpmeta?.bronIdentifier ?? ""),
      postcodes: uniquePostcodes,
      productArea: String(tpmeta?.["product-area"] ?? ""),
      audience: textOf(owmsmantel?.audience),
      subject: textOf(owmsmantel?.subject),
      publicatienaam: String(tpmeta?.publicatienaam ?? ""),
    };
  });

  return { publicaties, totalResults };
};


import type { components } from "./generated";

export type DopArtikel = components["schemas"]["ArticleContract"];

const DOP_OPEN_DATA =
  process.env.API_URL_DOP_OPEN_DATA ?? "https://opendata.ondernemersplein.nl";

/**
 * Een artikel van het Digitaal Ondernemersplein, of null als het ophalen niet
 * lukt. De tekst verandert zelden; een dag in de cache is genoeg.
 */
export const getDopArtikel = async (id: string): Promise<DopArtikel | null> => {
  try {
    const response = await fetch(
      `${DOP_OPEN_DATA}/api/v1/articles/${encodeURIComponent(id)}`,
      {
        headers: { Accept: "application/json" },
        next: { revalidate: 86400 },
      },
    );
    if (!response.ok) return null;
    return (await response.json()) as DopArtikel;
  } catch {
    return null;
  }
};

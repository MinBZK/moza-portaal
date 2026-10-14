/**
 * Browserkant van het Federatief Berichtenstelsel, via /api/keten. Overgenomen
 * uit berichtenbox-keten.js in moza-poc. Alleen transport: wat er op het scherm
 * komt, bepaalt de berichtenbox.
 */

const BASIS = "/api/keten/berichten";

// De lijst komt per pagina; het stelsel geeft er hoogstens honderd per keer.
const PAGINA_GROOTTE = 100;
const MAX_PAGINAS = 100;
const LIJST_LIMIET_MS = 30000;
const INHOUD_LIMIET_MS = 10000;
// Geen harde limiet voor de ophaalronde, wel een stiltebewaking.
const STILTE_LIMIET_MS = 30000;

/** Archief en prullenbak zijn bij het stelsel gewone mappen. */
const PLEK_MAPPEN = { archief: "Archief", prullenbak: "Prullenbak" } as const;

export type KetenPlek = "inbox" | "archief" | "prullenbak";

export type KetenFoutReden =
  /** Er is (nog) geen sessie met opgehaalde berichten: eerst ophalen. */
  | "geenSessie"
  /** Er loopt al een ophaalronde voor deze ontvanger. */
  | "bezig"
  | "afgebroken"
  | "weg"
  | "onbereikbaar";

export class KetenFout extends Error {
  constructor(
    readonly reden: KetenFoutReden,
    bericht: string,
  ) {
    super(bericht);
  }
}

/** Een bericht uit de lijst. De inhoud komt pas bij openen. */
export type KetenLijstBericht = {
  berichtId: string;
  magazijnId: string;
  afzenderNaam?: string;
  onderwerp?: string;
  publicatietijdstip?: string;
  aantalBijlagen?: number;
  status?: string;
  map?: string;
};

type LijstPagina = {
  berichten?: KetenLijstBericht[];
  _links?: { next?: { href?: string } };
};

export type KetenVoortgang = {
  bronnen: number;
  klaar: number;
  gevonden: number;
};

export type KetenInhoud = {
  inhoud: string;
  bijlagen: { bijlageId: string; naam: string }[];
};

export const plekVanMap = (map?: string): KetenPlek =>
  map === PLEK_MAPPEN.archief
    ? "archief"
    : map === PLEK_MAPPEN.prullenbak
      ? "prullenbak"
      : "inbox";

const metLimiet = (adres: string, opties: RequestInit, limiet: number) =>
  fetch(adres, { ...opties, signal: AbortSignal.timeout(limiet) });

/** De hele berichtenlijst, pagina voor pagina. */
export const haalLijst = async (): Promise<KetenLijstBericht[]> => {
  const berichten: KetenLijstBericht[] = [];
  const gezien = new Set<string>();
  for (let pagina = 0; pagina < MAX_PAGINAS; pagina++) {
    let antwoord: Response;
    try {
      antwoord = await metLimiet(
        `${BASIS}?pagina=${pagina}&paginaGrootte=${PAGINA_GROOTTE}`,
        {},
        LIJST_LIMIET_MS,
      );
    } catch {
      throw new KetenFout("onbereikbaar", "berichtenlijst niet bereikbaar");
    }
    if (antwoord.status === 409)
      throw new KetenFout("geenSessie", "geen sessie met berichten");
    if (!antwoord.ok)
      throw new KetenFout("onbereikbaar", `lijst ${antwoord.status}`);
    const deel = (await antwoord.json()) as LijstPagina;
    if (!Array.isArray(deel.berichten))
      throw new KetenFout("onbereikbaar", "lijst zonder berichten");

    // De lijst kan groeien tijdens het bladeren; dubbele berichten overslaan.
    for (const bericht of deel.berichten) {
      if (!bericht?.berichtId || gezien.has(bericht.berichtId)) continue;
      gezien.add(bericht.berichtId);
      berichten.push(bericht);
    }
    if (deel.berichten.length === 0 || !deel._links?.next?.href) break;
  }
  return berichten;
};

/**
 * Leest een Server-Sent-Events-stroom. EventSource kan geen headers sturen,
 * daarom zelf lezen. `opGebeurtenis` geeft true terug om te stoppen.
 */
export const leesSse = async (
  body: ReadableStream<Uint8Array>,
  opLeven: () => void,
  opGebeurtenis: (gebeurtenis: Record<string, unknown>) => boolean | void,
) => {
  const lezer = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    for (;;) {
      const blok = await lezer.read();
      if (blok.done) return;
      opLeven();
      buffer = (buffer + decoder.decode(blok.value, { stream: true })).replace(
        /\r\n/g,
        "\n",
      );
      let scheiding;
      while ((scheiding = buffer.indexOf("\n\n")) >= 0) {
        const frame = buffer.slice(0, scheiding);
        buffer = buffer.slice(scheiding + 2);
        const data = frame
          .split("\n")
          .filter((regel) => regel.startsWith("data:"))
          .map((regel) => regel.slice(5).replace(/^ /, ""))
          .join("\n");
        if (!data.trim()) continue;
        if (opGebeurtenis(JSON.parse(data)) === true) return;
      }
    }
  } finally {
    lezer.cancel().catch(() => {});
  }
};

/**
 * De ophaalronde: het stelsel vraagt elke organisatie om berichten en meldt
 * de voortgang. Daarna staat de lijst klaar in een sessie.
 */
export const haalOp = async (
  opVoortgang: (voortgang: KetenVoortgang) => void,
) => {
  const afbreker = new AbortController();
  let klok: ReturnType<typeof setTimeout> | undefined;
  const herstartKlok = () => {
    clearTimeout(klok);
    klok = setTimeout(() => afbreker.abort(), STILTE_LIMIET_MS);
  };
  herstartKlok();

  try {
    let antwoord: Response;
    try {
      antwoord = await fetch(`${BASIS}/_ophalen`, {
        headers: { Accept: "text/event-stream" },
        signal: afbreker.signal,
      });
    } catch {
      throw new KetenFout("onbereikbaar", "ophalen niet bereikbaar");
    }
    if (antwoord.status === 409)
      throw new KetenFout("bezig", "er loopt al een ophaalronde");
    if (!antwoord.ok || !antwoord.body)
      throw new KetenFout("onbereikbaar", `ophalen ${antwoord.status}`);

    const organisaties = new Set<string>();
    let klaar = 0;
    let gevonden = 0;
    let gereed = false;
    try {
      await leesSse(antwoord.body, herstartKlok, (gebeurtenis) => {
        if (typeof gebeurtenis.magazijnId === "string")
          organisaties.add(gebeurtenis.magazijnId);
        if (gebeurtenis.event === "magazijn-bevraging-voltooid") {
          klaar++;
          gevonden += Number(gebeurtenis.aantalBerichten) || 0;
        }
        if (gebeurtenis.event === "ophalen-fout")
          throw new KetenFout("onbereikbaar", "fout tijdens ophalen");
        opVoortgang({ bronnen: organisaties.size, klaar, gevonden });
        if (gebeurtenis.event === "ophalen-gereed") gereed = true;
        return gereed;
      });
    } catch (fout) {
      if (fout instanceof KetenFout) throw fout;
      throw new KetenFout("afgebroken", "ophaalronde afgebroken");
    }
    // Zonder "ophalen-gereed" is de lijst onvolledig; die tonen we niet.
    if (!gereed) throw new KetenFout("afgebroken", "ophaalronde afgebroken");
  } finally {
    clearTimeout(klok);
  }
};

/** De inhoud en bijlagen van één bericht. */
export const haalInhoud = async (berichtId: string): Promise<KetenInhoud> => {
  let antwoord: Response;
  try {
    antwoord = await metLimiet(
      `${BASIS}/${encodeURIComponent(berichtId)}`,
      {},
      INHOUD_LIMIET_MS,
    );
  } catch {
    throw new KetenFout("onbereikbaar", "inhoud niet bereikbaar");
  }
  if (antwoord.status === 404)
    throw new KetenFout("weg", "bericht niet gevonden");
  if (antwoord.status === 409)
    throw new KetenFout("geenSessie", "geen sessie met berichten");
  if (!antwoord.ok)
    throw new KetenFout("onbereikbaar", `inhoud ${antwoord.status}`);
  const bericht = (await antwoord.json()) as Partial<KetenInhoud>;
  return {
    inhoud: typeof bericht.inhoud === "string" ? bericht.inhoud : "",
    bijlagen: Array.isArray(bericht.bijlagen) ? bericht.bijlagen : [],
  };
};

export const bijlageAdres = (berichtId: string, bijlageId: string) =>
  `${BASIS}/${encodeURIComponent(berichtId)}/bijlagen/${encodeURIComponent(bijlageId)}`;

const wijzig = async (
  berichtId: string,
  magazijnId: string,
  opties: RequestInit,
) => {
  let antwoord: Response;
  try {
    antwoord = await metLimiet(
      `${BASIS}/${encodeURIComponent(berichtId)}?magazijnId=${encodeURIComponent(magazijnId)}`,
      opties,
      INHOUD_LIMIET_MS,
    );
  } catch {
    throw new KetenFout("onbereikbaar", "wijziging niet bereikbaar");
  }
  if (antwoord.status === 404 || antwoord.status === 410)
    throw new KetenFout("weg", "bericht bestaat niet meer");
  if (!antwoord.ok)
    throw new KetenFout("onbereikbaar", `wijziging ${antwoord.status}`);
};

/**
 * Zet een bericht op een andere plek. De map staat bij de organisatie die het
 * stuurde. Terug naar de inbox is een lege map, niet null: null betekent in
 * een merge-patch "niet wijzigen".
 */
export const verplaatsBericht = (
  berichtId: string,
  magazijnId: string,
  plek: KetenPlek,
) =>
  wijzig(berichtId, magazijnId, {
    method: "PATCH",
    headers: { "Content-Type": "application/merge-patch+json" },
    body: JSON.stringify({ map: plek === "inbox" ? "" : PLEK_MAPPEN[plek] }),
  });

/** Verwijdert een bericht voorgoed bij de organisatie. */
export const verwijderBericht = (berichtId: string, magazijnId: string) =>
  wijzig(berichtId, magazijnId, { method: "DELETE" });

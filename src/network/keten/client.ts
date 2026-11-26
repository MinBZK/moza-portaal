/**
 * Browserkant van het Federatief Berichtenstelsel, via /api/keten. Overgenomen
 * uit berichtenbox-keten.js in moza-poc. Alleen transport: wat er op het scherm
 * komt, bepaalt de berichtenbox. Het sessie-id ziet de browser niet; de route
 * houdt het bij zich.
 */

const KETEN = "/api/keten";
const BASIS = `${KETEN}/berichten`;

// De lijst komt per pagina; het stelsel geeft er hoogstens honderd per keer.
const PAGINA_GROOTTE = 100;
const MAX_PAGINAS = 100;
const LIJST_LIMIET_MS = 30000;
const INHOUD_LIMIET_MS = 10000;
const SESSIE_LIMIET_MS = 10000;
// Geen harde limiet voor de ophaalronde, wel een stiltebewaking.
const STILTE_LIMIET_MS = 30000;

/** Archief en prullenbak zijn bij het stelsel gewone mappen. */
const PLEK_MAPPEN = { archief: "Archief", prullenbak: "Prullenbak" } as const;

export type KetenPlek = "inbox" | "archief" | "prullenbak";

export type KetenFoutReden =
  /** Er is (nog) geen ophaalronde geweest: eerst ophalen. */
  | "geenSessie"
  /** Er loopt al een ophaalronde voor deze ontvanger. */
  | "bezig"
  | "afgebroken"
  | "weg"
  /** De sessie bij het stelsel is verlopen of bestaat niet. */
  | "sessieVerlopen"
  /** Deze ondernemer heeft te veel sessies tegelijk. */
  | "teVeelSessies"
  /** Het stelsel kan het nu even niet; over een minuut opnieuw. */
  | "tijdelijk"
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

/** Een organisatie die in de laatste ophaalronde niets leverde. */
export type NietGeleverd = { magazijnId: string; naam: string; status: string };

/** Een organisatie die in de laatste ophaalronde niet alles leverde. */
export type Afgekapt = {
  magazijnId: string;
  naam: string;
  aantalOpgehaald?: number;
  totaalBeschikbaar?: number;
};

/** Wat het stelsel over de volledigheid van de hele lijst zegt. */
export type Volledigheid = {
  aantalNietGeleverd: number;
  nietGeleverd: NietGeleverd[];
  afgekapt: Afgekapt[];
  /** De lijst was langer dan wij in één keer lezen. */
  teLang: boolean;
};

export type KetenLijst = { berichten: KetenLijstBericht[] } & Volledigheid;

type LijstPagina = {
  berichten?: KetenLijstBericht[];
  aantalNietGeleverd?: number;
  nietGeleverd?: Partial<NietGeleverd>[];
  afgekapt?: Partial<Afgekapt>[];
  _links?: { next?: { href?: string } };
};

export type KetenVoortgang = {
  bronnen: number;
  klaar: number;
  gevonden: number;
  /** Berichten per map, zoals de organisaties ze tot nu toe meldden. */
  mappen: Record<string, number>;
};

export type KetenBijlage = {
  bijlageId: string;
  naam: string;
  /** Waar de bijlage op te halen is, of null als het stelsel geen bruikbaar adres gaf. */
  adres: string | null;
};

export type KetenInhoud = {
  inhoud: string;
  bijlagen: KetenBijlage[];
};

/** De sleutel van een bericht: elke organisatie deelt haar eigen nummers uit. */
export const berichtSleutel = (bericht: {
  magazijnId: string;
  berichtId: string;
}) => `${bericht.magazijnId}:${bericht.berichtId}`;

export const plekVanMap = (map?: string): KetenPlek =>
  map === PLEK_MAPPEN.archief
    ? "archief"
    : map === PLEK_MAPPEN.prullenbak
      ? "prullenbak"
      : "inbox";

const metLimiet = (adres: string, opties: RequestInit, limiet: number) =>
  fetch(adres, { ...opties, signal: AbortSignal.timeout(limiet) });

const naam = (organisatie: { naam?: unknown; magazijnId?: unknown }) =>
  typeof organisatie.naam === "string" && organisatie.naam
    ? organisatie.naam
    : String(organisatie.magazijnId ?? "");

const verlopen = (wat: string) =>
  new KetenFout("sessieVerlopen", `${wat}: sessie verlopen`);

// --- Sessie ----------------------------------------------------------------

/** Start een sessie bij het stelsel. Een vorige sessie van deze browser stopt. */
export const startSessie = async () => {
  let antwoord: Response;
  try {
    antwoord = await metLimiet(
      `${KETEN}/sessies`,
      { method: "POST" },
      SESSIE_LIMIET_MS,
    );
  } catch {
    throw new KetenFout("onbereikbaar", "sessie niet te starten");
  }
  if (antwoord.status === 429)
    throw new KetenFout("teVeelSessies", "te veel sessies");
  if (antwoord.status !== 201)
    throw new KetenFout("onbereikbaar", `sessie ${antwoord.status}`);
};

/** Verlengt de sessie; false als het stelsel haar niet meer kent. */
export const verlengSessie = async () => {
  try {
    const antwoord = await metLimiet(
      `${KETEN}/sessies/huidige/_verlengen`,
      { method: "POST" },
      SESSIE_LIMIET_MS,
    );
    return antwoord.status !== 401;
  } catch {
    // Niet bereikbaar zegt niets over de sessie; de volgende keer opnieuw.
    return true;
  }
};

/** Beëindigt de sessie, ook als de pagina intussen sluit. */
export const beeindigSessie = () =>
  fetch(`${KETEN}/sessies/huidige`, { method: "DELETE", keepalive: true })
    .then(() => undefined)
    .catch(() => undefined);

// --- Lijst -----------------------------------------------------------------

const leesVolledigheid = (
  pagina: LijstPagina,
): Omit<Volledigheid, "teLang"> => ({
  aantalNietGeleverd: Math.max(0, Number(pagina.aantalNietGeleverd) || 0),
  nietGeleverd: (pagina.nietGeleverd ?? []).map((organisatie) => ({
    magazijnId: String(organisatie.magazijnId ?? ""),
    naam: naam(organisatie),
    status: String(organisatie.status ?? ""),
  })),
  afgekapt: (pagina.afgekapt ?? []).map((organisatie) => ({
    magazijnId: String(organisatie.magazijnId ?? ""),
    naam: naam(organisatie),
    aantalOpgehaald: organisatie.aantalOpgehaald,
    totaalBeschikbaar: organisatie.totaalBeschikbaar,
  })),
});

/** De hele berichtenlijst, pagina voor pagina, met wat er ontbreekt. */
export const haalLijst = async (): Promise<KetenLijst> => {
  const berichten: KetenLijstBericht[] = [];
  const gezien = new Set<string>();
  let volledigheid: Omit<Volledigheid, "teLang"> | null = null;
  let teLang = true;
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
    if (antwoord.status === 401) throw verlopen("lijst");
    if (antwoord.status === 409)
      throw new KetenFout("geenSessie", "nog geen ophaalronde");
    if (!antwoord.ok)
      throw new KetenFout("onbereikbaar", `lijst ${antwoord.status}`);
    const deel = (await antwoord.json()) as LijstPagina;
    if (!Array.isArray(deel.berichten))
      throw new KetenFout("onbereikbaar", "lijst zonder berichten");
    // Geldt voor de hele lijst en staat op elke pagina; de eerste volstaat.
    volledigheid ??= leesVolledigheid(deel);

    // De lijst kan groeien tijdens het bladeren; dubbele berichten overslaan.
    for (const bericht of deel.berichten) {
      if (!bericht?.berichtId || !bericht.magazijnId) continue;
      const sleutel = berichtSleutel(bericht);
      if (gezien.has(sleutel)) continue;
      gezien.add(sleutel);
      berichten.push(bericht);
    }
    if (deel.berichten.length === 0 || !deel._links?.next?.href) {
      teLang = false;
      break;
    }
  }
  return {
    berichten,
    ...(volledigheid ?? leesVolledigheid({})),
    teLang,
  };
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
 * de voortgang. Daarna staat de lijst klaar in de sessie.
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
    if (antwoord.status === 401) throw verlopen("ophalen");
    if (antwoord.status === 409)
      throw new KetenFout("bezig", "er loopt al een ophaalronde");
    if (!antwoord.ok || !antwoord.body)
      throw new KetenFout("onbereikbaar", `ophalen ${antwoord.status}`);

    const namen = new Map<string, string>();
    const voltooid = new Set<string>();
    const mappen: Record<string, number> = {};
    let gevonden = 0;
    let gereed = false;
    try {
      await leesSse(antwoord.body, herstartKlok, (gebeurtenis) => {
        const magazijnId = gebeurtenis.magazijnId;
        if (typeof magazijnId === "string") {
          if (!namen.has(magazijnId) || typeof gebeurtenis.naam === "string")
            namen.set(magazijnId, naam(gebeurtenis));
        }
        if (
          gebeurtenis.event === "magazijn-bevraging-voltooid" &&
          typeof magazijnId === "string"
        ) {
          voltooid.add(magazijnId);
          if (gebeurtenis.status === "OK") {
            gevonden += Number(gebeurtenis.aantalBerichten) || 0;
            for (const map of Array.isArray(gebeurtenis.mappen)
              ? (gebeurtenis.mappen as {
                  naam?: unknown;
                  aantalBerichten?: unknown;
                }[])
              : []) {
              if (typeof map?.naam !== "string") continue;
              mappen[map.naam] =
                (mappen[map.naam] ?? 0) + (Number(map.aantalBerichten) || 0);
            }
          }
        }
        if (gebeurtenis.event === "ophalen-fout")
          throw new KetenFout("onbereikbaar", "fout tijdens ophalen");
        opVoortgang({
          bronnen: namen.size,
          klaar: voltooid.size,
          gevonden,
          mappen: { ...mappen },
        });
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

// --- Eén bericht -----------------------------------------------------------

const eenBericht = (berichtId: string, magazijnId: string) =>
  `${BASIS}/${encodeURIComponent(berichtId)}?magazijnId=${encodeURIComponent(magazijnId)}`;

/**
 * Het adres van een bijlage, uit `_links.self.href` van het stelsel. Dat adres
 * volgen we via de route, in plaats van het zelf samen te stellen: zo blijft
 * een bijlage te openen als het stelsel haar elders aanbiedt. Een adres buiten
 * de berichten van het stelsel volgen we niet.
 */
export const bijlageAdres = (href: unknown): string | null => {
  if (typeof href !== "string") return null;
  let adres: URL;
  try {
    adres = new URL(href, "http://stelsel.invalid");
  } catch {
    return null;
  }
  const pad = adres.pathname.match(/^\/api\/v1\/(berichten\/.+)$/)?.[1];
  return pad ? `${KETEN}/${pad}${adres.search}` : null;
};

/**
 * De inhoud en bijlagen van één bericht. Het stelsel wil weten bij welk
 * magazijn het bericht staat (magazijnId), net als bij wijzigen.
 */
export const haalInhoud = async (
  berichtId: string,
  magazijnId: string,
): Promise<KetenInhoud> => {
  let antwoord: Response;
  try {
    antwoord = await metLimiet(
      eenBericht(berichtId, magazijnId),
      {},
      INHOUD_LIMIET_MS,
    );
  } catch {
    throw new KetenFout("onbereikbaar", "inhoud niet bereikbaar");
  }
  if (antwoord.status === 401) throw verlopen("inhoud");
  if (antwoord.status === 404 || antwoord.status === 410)
    throw new KetenFout("weg", "bericht niet gevonden");
  if (antwoord.status === 409)
    throw new KetenFout("geenSessie", "nog geen ophaalronde");
  if (antwoord.status === 503)
    throw new KetenFout("tijdelijk", "inhoud even niet beschikbaar");
  if (!antwoord.ok)
    throw new KetenFout("onbereikbaar", `inhoud ${antwoord.status}`);
  const bericht = (await antwoord.json()) as {
    inhoud?: unknown;
    bijlagen?: {
      bijlageId?: unknown;
      naam?: unknown;
      _links?: { self?: { href?: unknown } };
    }[];
  };
  return {
    inhoud: typeof bericht.inhoud === "string" ? bericht.inhoud : "",
    bijlagen: Array.isArray(bericht.bijlagen)
      ? bericht.bijlagen.map((bijlage) => ({
          bijlageId: String(bijlage.bijlageId ?? ""),
          naam:
            typeof bijlage.naam === "string" && bijlage.naam
              ? bijlage.naam
              : "Bijlage zonder naam",
          adres: bijlageAdres(bijlage._links?.self?.href),
        }))
      : [],
  };
};

const wijzig = async (
  berichtId: string,
  magazijnId: string,
  opties: RequestInit,
) => {
  let antwoord: Response;
  try {
    antwoord = await metLimiet(
      eenBericht(berichtId, magazijnId),
      opties,
      INHOUD_LIMIET_MS,
    );
  } catch {
    throw new KetenFout("onbereikbaar", "wijziging niet bereikbaar");
  }
  if (antwoord.status === 401) throw verlopen("wijziging");
  if (antwoord.status === 404 || antwoord.status === 410)
    throw new KetenFout("weg", "bericht bestaat niet meer");
  if (antwoord.status === 409)
    throw new KetenFout("geenSessie", "nog geen ophaalronde");
  if (antwoord.status === 503)
    throw new KetenFout("tijdelijk", "wijziging even niet mogelijk");
  if (!antwoord.ok)
    throw new KetenFout("onbereikbaar", `wijziging ${antwoord.status}`);
};

/**
 * Zet een bericht in een map bij de organisatie die het stuurde. Een lege naam
 * haalt het eruit: null betekent in een merge-patch "niet wijzigen".
 */
export const zetMap = (berichtId: string, magazijnId: string, map: string) =>
  wijzig(berichtId, magazijnId, {
    method: "PATCH",
    headers: { "Content-Type": "application/merge-patch+json" },
    body: JSON.stringify({ map }),
  });

/** Archief en prullenbak zijn bij het stelsel ook mappen. */
export const verplaatsBericht = (
  berichtId: string,
  magazijnId: string,
  plek: KetenPlek,
) => zetMap(berichtId, magazijnId, plek === "inbox" ? "" : PLEK_MAPPEN[plek]);

/** Verwijdert een bericht voorgoed bij de organisatie. */
export const verwijderBericht = (berichtId: string, magazijnId: string) =>
  wijzig(berichtId, magazijnId, { method: "DELETE" });

// --- Volgen ----------------------------------------------------------------

export type VolgEinde =
  /** De stroom is gewoon gestopt; opnieuw verbinden. */
  | "einde"
  /** Het stelsel meldt dat de sessie verlopen is. */
  | "verlopen"
  /** 409: nog geen ophaalronde. Eerst opnieuw ophalen. */
  | "conflict"
  /** Dit stelsel kent volgen niet. */
  | "ontbreekt"
  | "fout";

/**
 * Volgt wat er binnenkomt: het stelsel meldt zelf een nieuw, gewijzigd of
 * verwijderd bericht, en stuurt elke 20 seconden een hartslag. Loopt tot de
 * stroom stopt of `signal` afbreekt. `gezond` zegt of er iets van het stelsel
 * binnenkwam. Volgen en de hartslag verlengen de sessie niet.
 */
export const volg = async (
  signal: AbortSignal,
  opLeven: () => void,
  opGebeurtenis: (gebeurtenis: Record<string, unknown>) => void,
): Promise<{ einde: VolgEinde; gezond: boolean; wachtMs?: number }> => {
  let antwoord: Response;
  try {
    antwoord = await fetch(`${BASIS}/_volgen`, {
      headers: { Accept: "text/event-stream" },
      signal,
    });
  } catch {
    return { einde: "fout", gezond: false };
  }
  if (antwoord.status === 401) return { einde: "verlopen", gezond: false };
  if (antwoord.status === 409) return { einde: "conflict", gezond: false };
  if ([404, 405, 406].includes(antwoord.status))
    return { einde: "ontbreekt", gezond: false };
  const soort = antwoord.headers.get("content-type") ?? "";
  if (
    !antwoord.ok ||
    !antwoord.body ||
    !soort.startsWith("text/event-stream")
  ) {
    const wacht = Number(antwoord.headers.get("retry-after"));
    return {
      einde: "fout",
      gezond: false,
      wachtMs: Number.isFinite(wacht) && wacht > 0 ? wacht * 1000 : undefined,
    };
  }

  let gezond = false;
  let isVerlopen = false;
  try {
    await leesSse(antwoord.body, opLeven, (gebeurtenis) => {
      gezond = true;
      if (gebeurtenis.event === "sessie-verlopen") {
        isVerlopen = true;
        return true;
      }
      opGebeurtenis(gebeurtenis);
    });
  } catch {
    // Afgebroken of onleesbaar: de aanroeper verbindt opnieuw.
  }
  return { einde: isVerlopen ? "verlopen" : "einde", gezond };
};

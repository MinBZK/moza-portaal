/**
 * Praat met de verification_server van NL Wallet: een disclosure-sessie
 * starten, de status volgen en na afloop de gedeelde gegevens ophalen. Uit
 * moza-poc (server/nl-wallet/verifier.js); zie die README voor de opzet.
 *
 * Inloggen vraagt voornaam en achternaam uit de PID en de bevoegdheid voor een
 * onderneming (demo-attestatie van "KVK Demo"). Beide verplicht en allebei
 * SD-JWT: NL Wallet kent geen optionele onderdelen en geen mix van formaten.
 */

export const PID_DOCTYPE = "urn:eudi:pid:nl:1";
export const BEVOEGDHEID_VCT = "com.example.kvk_bevoegdheid";
const RETURN_PAD = "/inloggen/nl-wallet/terug?session_token={session_token}";

export type NlWalletConfig = {
  intern: string;
  publiek: string;
  usecase: string;
  apiKey: string;
};

export type SessieStatus =
  | "CREATED"
  | "WAITING_FOR_RESPONSE"
  | "DONE"
  | "FAILED"
  | "CANCELLED"
  | "EXPIRED";

export type Inlog = {
  voornaam: string;
  achternaam: string;
  bevoegdheid: {
    kvkNummer: string;
    handelsnaam: string;
    functie: string;
    bevoegdheid: string;
  } | null;
};

const zonderSlash = (adres: string) => adres.replace(/\/$/, "");

export const nlWalletConfig = (): NlWalletConfig => ({
  intern: zonderSlash(
    process.env.NL_WALLET_VS_INTERNAL || "http://localhost:3012",
  ),
  publiek: zonderSlash(
    process.env.NL_WALLET_VS_PUBLIC || "http://localhost:3011",
  ),
  usecase: process.env.NL_WALLET_USECASE || "moza_inloggen",
  apiKey: process.env.NL_WALLET_API_KEY || "",
});

const inlogQuery = () => ({
  credentials: [
    {
      id: "pid",
      format: "dc+sd-jwt",
      meta: { vct_values: [PID_DOCTYPE] },
      claims: [{ path: ["given_name"] }, { path: ["family_name"] }],
    },
    {
      id: "bevoegdheid",
      format: "dc+sd-jwt",
      meta: { vct_values: [BEVOEGDHEID_VCT] },
      claims: [
        { path: ["kvk_nummer"] },
        { path: ["handelsnaam"] },
        { path: ["functie"] },
        { path: ["bevoegdheid"] },
      ],
    },
  ],
});

const headers = (
  config: NlWalletConfig,
  extra: Record<string, string> = {},
) => ({
  Accept: "application/json",
  ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}),
  ...extra,
});

/**
 * Een sessietoken komt in een URL-pad terecht. Alleen letters en cijfers, zodat
 * een aangepast token geen ander pad op de verification_server kan raken.
 */
export const geldigToken = (token: unknown): token is string =>
  typeof token === "string" && /^[A-Za-z0-9]{16,128}$/.test(token);

/** @param publiek Het adres waarop de bezoeker MOZa ziet, voor de terugkeer. */
export const startSessie = async (config: NlWalletConfig, publiek: string) => {
  const antwoord = await fetch(`${config.intern}/disclosure/sessions`, {
    method: "POST",
    headers: headers(config, { "Content-Type": "application/json" }),
    body: JSON.stringify({
      usecase: config.usecase,
      dcql_query: inlogQuery(),
      return_url_template: zonderSlash(publiek) + RETURN_PAD,
    }),
  });
  if (!antwoord.ok)
    throw new Error(`Sessie starten mislukt: HTTP ${antwoord.status}`);

  const { session_token } = (await antwoord.json()) as {
    session_token?: unknown;
  };
  if (!geldigToken(session_token))
    throw new Error("Sessie starten mislukt: onverwacht sessietoken");

  return {
    status_url: `${config.publiek}/disclosure/sessions/${session_token}`,
    session_token,
  };
};

export const haalStatusOp = async (
  config: NlWalletConfig,
  token: string,
): Promise<SessieStatus> => {
  if (!geldigToken(token)) throw new Error("Ongeldig sessietoken");
  const antwoord = await fetch(
    `${config.publiek}/disclosure/sessions/${token}?session_type=cross_device`,
    { headers: headers(config) },
  );
  if (!antwoord.ok)
    throw new Error(`Status ophalen mislukt: HTTP ${antwoord.status}`);
  return ((await antwoord.json()) as { status: SessieStatus }).status;
};

export const haalGegevensOp = async (
  config: NlWalletConfig,
  token: string,
  nonce?: string | null,
): Promise<unknown> => {
  if (!geldigToken(token)) throw new Error("Ongeldig sessietoken");
  const url = new URL(
    `${config.intern}/disclosure/sessions/${token}/disclosed_attributes`,
  );
  if (nonce) url.searchParams.set("nonce", nonce);
  const antwoord = await fetch(url, { headers: headers(config) });
  if (!antwoord.ok)
    throw new Error(`Gegevens ophalen mislukt: HTTP ${antwoord.status}`);
  return antwoord.json();
};

/**
 * Zoekt een attribuut op naam, ongeacht hoe diep het zit: bij een mdoc staan
 * de attributen onder de namespace, bij SD-JWT direct.
 */
const zoekWaarde = (object: unknown, sleutel: string): string | undefined => {
  if (!object || typeof object !== "object") return undefined;
  const record = object as Record<string, unknown>;
  const kandidaat = record[sleutel];
  if (typeof kandidaat === "string") return kandidaat;
  if (
    kandidaat &&
    typeof kandidaat === "object" &&
    typeof (kandidaat as { value?: unknown }).value === "string"
  )
    return (kandidaat as { value: string }).value;
  for (const waarde of Object.values(record)) {
    const gevonden = zoekWaarde(waarde, sleutel);
    if (gevonden !== undefined) return gevonden;
  }
  return undefined;
};

type Attestatie = { attestation_type?: string; attributes?: unknown };

const attestaties = (gedeeld: unknown, type: string): Attestatie[] =>
  (Array.isArray(gedeeld) ? gedeeld : [])
    .flatMap(
      (lijst: { attestations?: Attestatie[] } | null) =>
        lijst?.attestations ?? [],
    )
    .filter((attestatie) => attestatie.attestation_type === type);

/** Naam en bevoegdheid uit de gedeelde gegevens; null zonder naam. */
export const inlogUitGegevens = (gedeeld: unknown): Inlog | null => {
  const pid = attestaties(gedeeld, PID_DOCTYPE).find(
    (a) =>
      zoekWaarde(a.attributes, "given_name") &&
      zoekWaarde(a.attributes, "family_name"),
  );
  if (!pid) return null;

  const bron = attestaties(gedeeld, BEVOEGDHEID_VCT).find((a) =>
    zoekWaarde(a.attributes, "kvk_nummer"),
  );
  return {
    voornaam: zoekWaarde(pid.attributes, "given_name") ?? "",
    achternaam: zoekWaarde(pid.attributes, "family_name") ?? "",
    bevoegdheid: bron
      ? {
          kvkNummer: zoekWaarde(bron.attributes, "kvk_nummer") ?? "",
          handelsnaam: zoekWaarde(bron.attributes, "handelsnaam") ?? "",
          functie: zoekWaarde(bron.attributes, "functie") ?? "",
          bevoegdheid: zoekWaarde(bron.attributes, "bevoegdheid") ?? "",
        }
      : null,
  };
};

type OmgevingBevoegdheid = {
  id: string;
  handelsnaam: string;
  kvkNummer: string;
  same_device_ul?: string;
  cross_device_ul?: string;
};
type Omgeving = {
  bevoegdheden?: OmgevingBevoegdheid[];
  app?: { apk?: string };
};

const CONFIG_CACHE_MS = 60 * 1000;
let omgevingCache: { tot: number; omgeving: Omgeving } = {
  tot: 0,
  omgeving: {},
};

/**
 * Per onderneming de links om de bevoegdheid in de wallet te zetten. De
 * testomgeving serveert dit als /moza.json (NL_WALLET_CONFIG_URL); kort
 * gecachet, want de links veranderen zelden.
 */
export const leesOmgeving = async (): Promise<Omgeving> => {
  const adres = process.env.NL_WALLET_CONFIG_URL;
  if (!adres) return {};
  if (Date.now() < omgevingCache.tot) return omgevingCache.omgeving;
  const config = nlWalletConfig();
  try {
    const antwoord = await fetch(adres, { headers: headers(config) });
    if (!antwoord.ok) throw new Error(`HTTP ${antwoord.status} van ${adres}`);
    omgevingCache = {
      tot: Date.now() + CONFIG_CACHE_MS,
      omgeving: (await antwoord.json()) as Omgeving,
    };
  } catch (fout) {
    console.error("[nl-wallet] omgevingsconfiguratie:", fout);
    omgevingCache = {
      tot: Date.now() + 5000,
      omgeving: omgevingCache.omgeving,
    };
  }
  return omgevingCache.omgeving;
};

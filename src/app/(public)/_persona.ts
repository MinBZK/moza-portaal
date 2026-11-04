import { cookies } from "next/headers";
import { getDemoOrganisatieId, getDemoPersona, type DemoPersona } from "@/demo";

/** De persona uit het cookie dat de proxy zet, of undefined zonder (geldige) persona. */
export const getActievePersona = async () => {
  const cookieJar = await cookies();
  return getDemoPersona(cookieJar.get("personaId")?.value);
};

/** De gekozen organisatie van de persona, of de eerste organisatie als fallback. */
export const getActieveOrganisatie = async (persona?: DemoPersona) => {
  const [actievePersona, cookieJar] = await Promise.all([
    persona ?? getActievePersona(),
    cookies(),
  ]);
  if (!actievePersona) return undefined;

  // Alleen een organisatie waarvoor iemand ingelogd is, ook als het cookie
  // organisatieId (dat de browser zelf zet) een andere noemt.
  const organisaties = await getIngelogdeOrganisaties(actievePersona);
  const organisatieId = cookieJar.get("organisatieId")?.value;
  return (
    organisaties.find(
      (organisatie) => getDemoOrganisatieId(organisatie) === organisatieId,
    ) ?? organisaties[0]
  );
};

/** Wat het Federatief Berichtenstelsel van de actieve persona moet weten. */
export const getKetenAccount = async () => {
  const persona = await getActievePersona();
  const organisatie = await getActieveOrganisatie(persona);
  return { stelsel: !!persona?.stelsel, kvkNummer: organisatie?.kvkNummer };
};

/** Naam uit NL Wallet na "Inloggen met een wallet"; zie api/nl-wallet. */
export const NL_WALLET_INLOG_COOKIE = "nl-wallet-inlog";

/**
 * Wat er na "Inloggen met een wallet" bewaard is: de persona, de naam uit de
 * wallet en de KVK-nummers van de bevoegdheden die in deze sessie gedeeld
 * zijn. Null zonder (geldig) cookie.
 */
export type WalletInlog = {
  personaId: string;
  naam: string;
  kvkNummers?: string[];
};

export const leesWalletInlog = async (): Promise<WalletInlog | null> => {
  const cookieJar = await cookies();
  try {
    const inlog = JSON.parse(
      cookieJar.get(NL_WALLET_INLOG_COOKIE)?.value ?? "null",
    ) as Partial<WalletInlog> | null;
    if (!inlog?.personaId || !inlog.naam) return null;
    return {
      personaId: inlog.personaId,
      naam: inlog.naam,
      kvkNummers: Array.isArray(inlog.kvkNummers)
        ? inlog.kvkNummers.filter((k) => typeof k === "string")
        : undefined,
    };
  } catch {
    // Een kapot cookie telt als geen wallet-inlog.
    return null;
  }
};

/**
 * De organisaties van de persona waarvoor iemand ingelogd is. Na inloggen met
 * een wallet alleen de ondernemingen waarvan de bevoegdheid gedeeld is; voor
 * een andere onderneming logt iemand apart in. Zonder wallet-inlog (de
 * persona uit het demo-paneel) alle organisaties van de persona.
 */
export const getIngelogdeOrganisaties = async (persona?: DemoPersona) => {
  if (!persona) return [];
  const inlog = await leesWalletInlog();
  if (inlog?.personaId !== persona.id || !inlog.kvkNummers?.length)
    return persona.organisaties;
  const ingelogd = persona.organisaties.filter(
    (organisatie) =>
      !!organisatie.kvkNummer &&
      inlog.kvkNummers!.includes(organisatie.kvkNummer),
  );
  return ingelogd.length ? ingelogd : persona.organisaties;
};

/**
 * De naam waarmee iemand ingelogd is: uit NL Wallet als die bij deze persona
 * hoort, anders de naam van de persona. Wisselt iemand van persona, dan geldt
 * de naam uit de wallet niet meer.
 */
export const getIngelogdeNaam = async (persona?: DemoPersona) => {
  if (!persona) return undefined;
  const inlog = await leesWalletInlog();
  if (inlog?.personaId === persona.id) return inlog.naam;
  return `${persona.persoon.voornaam} ${persona.persoon.achternaam}`;
};

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

  const organisatieId = cookieJar.get("organisatieId")?.value;
  return (
    actievePersona.organisaties.find(
      (organisatie) => getDemoOrganisatieId(organisatie) === organisatieId,
    ) ?? actievePersona.organisaties[0]
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
 * De naam waarmee iemand ingelogd is: uit NL Wallet als die bij deze persona
 * hoort, anders de naam van de persona. Wisselt iemand van persona, dan geldt
 * de naam uit de wallet niet meer.
 */
export const getIngelogdeNaam = async (persona?: DemoPersona) => {
  if (!persona) return undefined;
  const cookieJar = await cookies();
  try {
    const inlog = JSON.parse(
      cookieJar.get(NL_WALLET_INLOG_COOKIE)?.value ?? "null",
    ) as { personaId?: string; naam?: string } | null;
    if (inlog?.personaId === persona.id && inlog.naam) return inlog.naam;
  } catch {
    // Een kapot cookie: dan gewoon de naam van de persona.
  }
  return `${persona.persoon.voornaam} ${persona.persoon.achternaam}`;
};

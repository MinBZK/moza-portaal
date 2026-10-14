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

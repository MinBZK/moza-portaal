/**
 * Van wie de opgeslagen antwoorden zijn: de persona en de actieve onderneming
 * uit de cookies. Zo neemt niemand na een wissel de antwoorden van een ander
 * mee. Puur, zodat Node dit bestand direct laadt.
 */
export const eigenaarUit = (cookies: string) => {
  const waarde = (naam: string) => {
    const paar = cookies
      .split(/;\s*/)
      .find((deel) => deel.startsWith(`${naam}=`));
    return paar ? decodeURIComponent(paar.slice(naam.length + 1)) : "";
  };
  return `${waarde("personaId")}:${waarde("organisatieId")}`;
};

/** Opslag zonder eigenaar komt uit een eerdere versie en telt als eigen. */
export const isVanEigenaar = (
  opgeslagen: { eigenaar?: string },
  eigenaar: string,
) => !opgeslagen.eigenaar || opgeslagen.eigenaar === eigenaar;

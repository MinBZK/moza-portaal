"use client";

import { useCookie } from "@/utils/useCookie";

/** Een organisatie in de organisatiekeuze van de header en het menu. */
export type KeuzeOrganisatie = {
  id: string;
  handelsnaam: string;
  /**
   * Of iemand voor deze organisatie ingelogd is. Na inloggen met een wallet
   * alleen voor de onderneming uit de gedeelde bevoegdheid; voor een andere
   * logt iemand apart in. Zonder waarde: ingelogd.
   */
  ingelogd?: boolean;
};

/** Inloggen met een wallet voor nog een onderneming, en daarna terug. */
const inlogAdres = () =>
  `/inloggen/zakelijk?onderneming=toevoegen&vervolg=${encodeURIComponent(
    window.location.pathname + window.location.search,
  )}`;

/**
 * Wisselt van organisatie (de context): zet het cookie en laadt de pagina
 * opnieuw, zodat alles de gegevens van die organisatie toont. Is iemand voor
 * die organisatie niet ingelogd, dan eerst naar inloggen. Gedeeld door de
 * header en het menu op een smal scherm.
 */
export const useKiesOrganisatie = (actieveOrganisatieId?: string) => {
  const { set } = useCookie("organisatieId");
  return (organisatie: KeuzeOrganisatie) => {
    if (organisatie.id === actieveOrganisatieId) return false;
    if (organisatie.ingelogd === false) {
      window.location.assign(inlogAdres());
      return true;
    }
    set(organisatie.id, { path: "/", maxAge: 60 * 60 * 24 * 30 });
    window.location.reload();
    return true;
  };
};

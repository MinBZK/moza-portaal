"use client";

import { useCookie } from "@/utils/useCookie";

/**
 * Wisselt van organisatie (de context): zet het cookie en laadt de pagina
 * opnieuw, zodat alles de gegevens van die organisatie toont. Gedeeld door de
 * header en het menu op een smal scherm.
 */
export const useKiesOrganisatie = (actieveOrganisatieId?: string) => {
  const { set } = useCookie("organisatieId");
  return (id: string) => {
    if (id === actieveOrganisatieId) return false;
    set(id, { path: "/", maxAge: 60 * 60 * 24 * 30 });
    window.location.reload();
    return true;
  };
};

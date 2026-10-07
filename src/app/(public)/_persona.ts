import { cookies } from "next/headers";
import { getDemoPersona } from "@/demo";

/** De persona uit het cookie dat de proxy zet, of undefined zonder (geldige) persona. */
export const getActievePersona = async () =>
  getDemoPersona((await cookies()).get("personaId")?.value);

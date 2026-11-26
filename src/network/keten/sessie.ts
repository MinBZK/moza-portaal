import { KETEN_URL } from "@/network/keten";

/**
 * De sessie bij het Federatief Berichtenstelsel. Het sessie-id is een geheim:
 * het staat alleen in een httpOnly-cookie, zodat scripts in de browser het niet
 * kunnen lezen, en het komt nooit in een URL of een log. Het cookie onthoudt
 * ook de ontvanger: na een wissel van persona hoort de sessie niet meer bij
 * wie er nu is.
 */

export const SESSIE_COOKIE = "keten-sessie";

const SESSIE_ID = /^[A-Za-z0-9_-]{22}$/;
const STELSEL_LIMIET_MS = 10000;

export type KetenSessie = { ontvanger: string; sessieId: string };

export const isSessieId = (waarde: unknown): waarde is string =>
  typeof waarde === "string" && SESSIE_ID.test(waarde);

export const leesSessie = (waarde?: string): KetenSessie | null => {
  if (!waarde) return null;
  try {
    const sessie = JSON.parse(decodeURIComponent(waarde)) as Partial<{
      o: string;
      s: string;
    }>;
    return typeof sessie.o === "string" && isSessieId(sessie.s)
      ? { ontvanger: sessie.o, sessieId: sessie.s }
      : null;
  } catch {
    return null;
  }
};

/** Set-Cookie voor de sessie; zonder sessie wist het de cookie. */
export const sessieCookie = (sessie: KetenSessie | null) => {
  const waarde = sessie
    ? encodeURIComponent(
        JSON.stringify({ o: sessie.ontvanger, s: sessie.sessieId }),
      )
    : "";
  const veilig = process.env.NODE_ENV === "production" ? "; Secure" : "";
  // Path=/api: de keten-route en het uitloggen moeten hem allebei lezen.
  return `${SESSIE_COOKIE}=${waarde}; Path=/api; HttpOnly; SameSite=Strict${sessie ? "" : "; Max-Age=0"}${veilig}`;
};

export const sessieHeaders = (sessie: KetenSessie) =>
  new Headers({ "X-Ontvanger": sessie.ontvanger, "X-Sessie": sessie.sessieId });

/** Beëindigt de sessie bij het stelsel. Mislukt dat, dan verloopt ze vanzelf. */
export const beeindigBijStelsel = async (sessie: KetenSessie) => {
  try {
    await fetch(`${KETEN_URL}/api/v1/sessies/huidige`, {
      method: "DELETE",
      headers: sessieHeaders(sessie),
      cache: "no-store",
      signal: AbortSignal.timeout(STELSEL_LIMIET_MS),
    });
  } catch {
    // Het stelsel ruimt een sessie zonder activiteit zelf op.
  }
};

/** Start een sessie bij het stelsel; geeft het antwoord terug als het niet lukte. */
export const startBijStelsel = async (
  ontvanger: string,
): Promise<{ sessie: KetenSessie } | { antwoord: Response }> => {
  const antwoord = await fetch(`${KETEN_URL}/api/v1/sessies`, {
    method: "POST",
    headers: new Headers({ "X-Ontvanger": ontvanger }),
    cache: "no-store",
    signal: AbortSignal.timeout(STELSEL_LIMIET_MS),
  });
  if (antwoord.status !== 201) return { antwoord };
  const lichaam = (await antwoord.json().catch(() => null)) as {
    sessieId?: unknown;
  } | null;
  if (!isSessieId(lichaam?.sessieId))
    return { antwoord: new Response(null, { status: 502 }) };
  return { sessie: { ontvanger, sessieId: lichaam.sessieId } };
};

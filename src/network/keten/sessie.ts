import { KETEN_URL } from "@/network/keten";

/**
 * De sessie bij het Federatief Berichtenstelsel. Het sessie-id is een geheim:
 * het staat alleen in een httpOnly-cookie, zodat scripts in de browser het niet
 * kunnen lezen, en het komt nooit in een URL, een antwoord of een log. Het
 * cookie onthoudt ook de ontvanger: na een wissel van persona hoort de sessie
 * niet meer bij wie er nu is.
 */

const PRODUCTIE = process.env.NODE_ENV === "production";

// Geen `__Host-`: dat vraagt een https-origin, en de demo draait het productie-image
// ook lokaal over http. Path=/api houdt het cookie weg bij de rest van het portaal.
export const SESSIE_COOKIE = "keten-sessie";

const SESSIE_ID = /^[A-Za-z0-9_-]{22}$/;
const ONTVANGER = /^(BSN|RSIN|KVK|OIN):[0-9]{8,20}$/;
// Korter dan de limiet van de browser (10 s), zodat de route altijd antwoordt.
const STELSEL_LIMIET_MS = 8000;

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
    return typeof sessie.o === "string" &&
      ONTVANGER.test(sessie.o) &&
      isSessieId(sessie.s)
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
  return `${SESSIE_COOKIE}=${waarde}; Path=/api; HttpOnly; SameSite=Strict${sessie ? "" : "; Max-Age=0"}${PRODUCTIE ? "; Secure" : ""}`;
};

export const sessieHeaders = (sessie: KetenSessie) =>
  new Headers({ "X-Ontvanger": sessie.ontvanger, "X-Sessie": sessie.sessieId });

/** Wat er misging bij het stelsel, zonder headers, ontvanger of sessie-id. */
export const logStelselFout = (wat: string, fout: unknown) => {
  const { name, cause } = (fout ?? {}) as {
    name?: string;
    cause?: { code?: string };
  };
  console.error("[keten]", wat, name ?? String(fout), cause?.code ?? "");
};

/**
 * Beëindigt de sessie bij het stelsel. Mislukt dat, dan verloopt ze vanzelf na
 * de inactiviteitstermijn van het stelsel; daarom loggen wij het alleen.
 */
export const beeindigBijStelsel = async (sessie: KetenSessie) => {
  try {
    const antwoord = await fetch(`${KETEN_URL}/api/v1/sessies/huidige`, {
      method: "DELETE",
      headers: sessieHeaders(sessie),
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(STELSEL_LIMIET_MS),
    });
    await antwoord.body?.cancel();
    // 204, ook voor een sessie die al weg was; 401 wijst geen sessie aan.
    if (antwoord.status !== 204 && antwoord.status !== 401)
      console.error("[keten] beëindigen mislukt", antwoord.status);
  } catch (fout) {
    logStelselFout("beëindigen", fout);
  }
};

/** Start een sessie bij het stelsel; geeft de status terug als het niet lukte. */
export const startBijStelsel = async (
  ontvanger: string,
): Promise<{ sessie: KetenSessie } | { status: number; wacht?: string }> => {
  const antwoord = await fetch(`${KETEN_URL}/api/v1/sessies`, {
    method: "POST",
    headers: new Headers({ "X-Ontvanger": ontvanger }),
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.timeout(STELSEL_LIMIET_MS),
  });
  // Het lichaam gaat nooit door naar de browser: het kan het geheim bevatten.
  const lichaam = (await antwoord.json().catch(() => null)) as {
    sessieId?: unknown;
  } | null;
  if (antwoord.status !== 201)
    return {
      status: antwoord.status,
      wacht: antwoord.headers.get("retry-after") ?? undefined,
    };
  if (!isSessieId(lichaam?.sessieId)) {
    console.error(
      "[keten] sessie gestart zonder bruikbaar sessie-id",
      typeof lichaam?.sessieId,
    );
    return { status: 502 };
  }
  return { sessie: { ontvanger, sessieId: lichaam.sessieId } };
};

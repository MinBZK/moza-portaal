/**
 * Het Federatief Berichtenstelsel ("de keten"), zoals in moza-poc. Aangesloten
 * persona's (`stelsel: true`) krijgen hun berichten daaruit in plaats van uit
 * de demo-data. De browser praat alleen met /api/keten; die route zet de
 * ontvanger erbij.
 */

/** De berichtenuitvraag. Standaard de testomgeving die moza-poc ook gebruikt. */
export const KETEN_URL = (
  process.env.KETEN_BACKEND_URL ||
  "https://uitvraag-test-mpfb-8wh.rig.prd1.gn2.quattro.rijksapps.nl"
).replace(/\/$/, "");

/** De demo-omgeving die zegt welke testaccounts het stelsel kent. */
const PERSONAS_URL = (
  process.env.KETEN_PERSONAS_URL ||
  "https://demopersonas-test-mpfm-w3h.rig.prd1.gn2.quattro.rijksapps.nl"
).replace(/\/$/, "");

export type KetenAccount = {
  /** De persona is aangesloten op het stelsel. */
  stelsel?: boolean;
  /** KVK-nummer van de actieve organisatie. */
  kvkNummer?: string;
};

/** De ontvanger zoals het stelsel die kent, of null voor een gewone persona. */
export const ketenOntvanger = ({ stelsel, kvkNummer }: KetenAccount) =>
  stelsel && kvkNummer ? `KVK:${kvkNummer}` : null;

export type KetenStatus =
  /** Gewone persona: de demo-berichten. */
  | { soort: "demo" }
  | { soort: "keten"; ontvanger: string }
  /** Aangesloten persona, maar het stelsel kent dit testaccount niet. */
  | { soort: "nietBekend" }
  /** De demo-omgeving van het stelsel antwoordt niet. */
  | { soort: "onbereikbaar" };

type Testaccount = { ontvanger?: string; bron?: string };

/**
 * Haalt de berichten van deze persona uit het stelsel? Geen stille terugval op
 * demo-data: voor een aangesloten persona zouden dat verzonnen berichten zijn.
 */
export const getKetenStatus = async (
  account: KetenAccount,
): Promise<KetenStatus> => {
  if (!account.stelsel) return { soort: "demo" };
  const ontvanger = ketenOntvanger(account);
  if (!ontvanger) return { soort: "nietBekend" };

  try {
    const antwoord = await fetch(`${PERSONAS_URL}/api/demo/personas`, {
      signal: AbortSignal.timeout(3000),
      next: { revalidate: 300 },
    });
    if (!antwoord.ok) return { soort: "onbereikbaar" };
    const lijst: unknown = await antwoord.json();
    if (!Array.isArray(lijst)) return { soort: "onbereikbaar" };
    const bekend = (lijst as Testaccount[]).some(
      (account) => account?.bron === "keten" && account.ontvanger === ontvanger,
    );
    return bekend ? { soort: "keten", ontvanger } : { soort: "nietBekend" };
  } catch {
    return { soort: "onbereikbaar" };
  }
};

import type { DemoAannemen } from "@/demo";
import { voegZaakToe } from "../../lopendezaken/_assistentZaken";
import type { Situatie, ZaakStand } from "./_route";
import type { Antwoorden } from "./_useAannemen";

/**
 * De dag waarop deze proef de aanvraag laat indienen: vast, zodat de
 * aanvraag klopt met de rest van de demo (de engine rekent met 18 november
 * 2026, zie AANVRAAG in _uitkomsten.ts, en de besluiten hebben vaste datums).
 */
export const INGEDIEND_OP = "2026-11-18";

const REGELING: Partial<Record<Situatie, string>> = {
  gemeente: "loonkostensubsidie",
  wajong: "loondispensatie",
  wia: "doelgroepverklaring",
};

/**
 * De stand van een nieuwe zaak, met een kopie van de antwoorden: de zaak en het
 * besluit rekenen daarmee, ook als de oriëntatie later andere antwoorden krijgt.
 */
export const nieuweZaakStand = (
  fase: string,
  antwoorden: Antwoorden,
  onderwerp: string,
  verstuurdOp?: string,
): ZaakStand => ({
  ingediend: true,
  fase,
  antwoorden,
  onderwerp,
  ...(verstuurdOp === undefined ? {} : { verstuurdOp }),
});

/**
 * Zet de zaak van de situatie in Lopende zaken (dezelfde zaak komt er maar één
 * keer in). Flow en situatie laten Lopende zaken naar de juiste pagina linken.
 */
export const zaakAanmaken = (
  situatie: Situatie,
  zaak: DemoAannemen["zaak"],
  status: string,
  onderwerp: string = zaak.onderwerp,
) =>
  voegZaakToe({
    referentienummer: zaak.nummer,
    onderwerp,
    organisatie: zaak.organisatie,
    status,
    ingediend_op: INGEDIEND_OP,
    regeling: REGELING[situatie],
    flow: "iemand-aannemen",
    situatie,
  });

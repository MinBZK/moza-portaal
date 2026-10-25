import type { DemoAannemen } from "@/demo";
import { voegZaakToe } from "../../lopendezaken/_assistentZaken";
import type { Situatie } from "./_route";

/** De dag waarop het prototype de aanvraag laat indienen. */
export const INGEDIEND_OP = "2026-10-05";

const REGELING: Partial<Record<Situatie, string>> = {
  gemeente: "loonkostensubsidie",
  wajong: "loondispensatie",
  wia: "doelgroepverklaring",
};

/** Zet de zaak van de situatie in Lopende zaken (dezelfde zaak komt er maar één keer in). */
export const zaakAanmaken = (
  situatie: Situatie,
  zaak: DemoAannemen["zaak"],
  status: string,
) =>
  voegZaakToe({
    referentienummer: zaak.nummer,
    onderwerp: zaak.onderwerp,
    organisatie: zaak.organisatie,
    status,
    ingediend_op: INGEDIEND_OP,
    regeling: REGELING[situatie],
  });

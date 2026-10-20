"use client";

import { useSyncExternalStore } from "react";

/**
 * Zaken die de Digitale assistent aanmaakte (het case-event van de backend),
 * zoals in moza-poc (assets/javascript/lopende-zaken.js). Ze staan in
 * localStorage, dus alleen in deze browser, en komen bovenaan Lopende zaken.
 */

const SLEUTEL = "moza-zaken";

/** De velden komen uit de backend; de namen verschillen per versie. */
export type AssistentZaak = Record<string, unknown> & {
  id: string;
  aangemaaktOp: number;
};

const luisteraars = new Set<() => void>();
let vorige: { rauw: string | null; zaken: AssistentZaak[] } | null = null;

const getSnapshot = (): AssistentZaak[] => {
  let rauw: string | null = null;
  try {
    rauw = window.localStorage.getItem(SLEUTEL);
  } catch {
    // Geen opslag: geen zaken.
  }
  if (vorige?.rauw === rauw) return vorige.zaken;
  let zaken: AssistentZaak[] = [];
  try {
    const gelezen: unknown = JSON.parse(rauw ?? "[]");
    if (Array.isArray(gelezen)) zaken = gelezen as AssistentZaak[];
  } catch {
    // Onleesbaar: als leeg behandelen.
  }
  vorige = { rauw, zaken };
  return zaken;
};

const subscribe = (luisteraar: () => void) => {
  luisteraars.add(luisteraar);
  window.addEventListener("storage", luisteraar);
  return () => {
    luisteraars.delete(luisteraar);
    window.removeEventListener("storage", luisteraar);
  };
};

/** null zolang de opslag nog niet gelezen is (op de server). */
export const useAssistentZaken = () =>
  useSyncExternalStore<AssistentZaak[] | null>(
    subscribe,
    getSnapshot,
    () => null,
  );

/** Eerste niet-lege waarde uit een lijst mogelijke veldnamen. */
export const veld = (zaak: AssistentZaak, namen: string[]) => {
  for (const naam of namen) {
    const waarde = zaak[naam];
    if (waarde !== undefined && waarde !== null && waarde !== "")
      return String(waarde);
  }
  return "";
};

const sleutelVan = (zaak: Record<string, unknown>) =>
  String(
    zaak.referentienummer ?? zaak.id ?? zaak.case_id ?? zaak.zaaknummer ?? "",
  );

/** Voegt een zaak toe. Dezelfde zaak twee keer levert geen dubbele op. */
export const voegZaakToe = (gegevens: Record<string, unknown>) => {
  const zaken = getSnapshot();
  const sleutel = sleutelVan(gegevens);
  if (sleutel && zaken.some((zaak) => sleutelVan(zaak) === sleutel)) return;
  const aangemaaktOp = Date.now();
  const zaak: AssistentZaak = {
    ...gegevens,
    aangemaaktOp,
    id: sleutel || `zaak-${aangemaaktOp}`,
  };
  try {
    window.localStorage.setItem(SLEUTEL, JSON.stringify([...zaken, zaak]));
  } catch {
    return;
  }
  luisteraars.forEach((luisteraar) => luisteraar());
};

/** Bekende zaak-typen hebben een detailpagina (alleen frontend-routing). */
export const zaakRoute = (zaak: AssistentZaak) => {
  const tekst = [
    veld(zaak, ["onderwerp", "titel"]),
    veld(zaak, ["zaak_type"]),
    veld(zaak, ["regeling"]),
    veld(zaak, ["referentienummer"]),
  ].join(" ");
  if (/loonkostensubsidie/i.test(tekst))
    return "/lopendezaken/loonkostensubsidie-koen";
  return /energiebespar|informatieplicht/i.test(tekst)
    ? "/lopendezaken/informatieplicht-energiebesparing"
    : "";
};

export const zaakDatum = (zaak: AssistentZaak) => {
  const waarde =
    veld(zaak, [
      "ingediend_op",
      "datum",
      "laatsteWijziging",
      "ingediend",
      "date",
      "submitted_date",
    ]) || zaak.aangemaaktOp;
  const datum =
    typeof waarde === "string" && /^\d{4}-\d{2}-\d{2}/.test(waarde)
      ? new Date(`${waarde.slice(0, 10)}T12:00:00`)
      : new Date(waarde);
  return Number.isNaN(datum.getTime())
    ? ""
    : datum.toLocaleDateString("nl-NL", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
};

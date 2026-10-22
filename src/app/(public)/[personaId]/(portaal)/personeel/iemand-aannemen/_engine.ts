"use client";

import type { DemoAannemenTrace } from "@/demo";
import type { Antwoorden } from "./_useAannemen";
import { onderMinimumloon } from "./_useAannemen";
import type { Invoer } from "./_useRegelrecht";

/**
 * Van de antwoorden op het eerste scherm naar invoer voor de regelrecht-engine.
 * Basis is het scenario van Koen (doelgroepregister, Participatiewet); de
 * antwoorden zetten de uren en de loonwaarde. Een kandidaat met Wajong of WIA
 * rekent dit prototype ook uit als doelgroepregister (gemeld op het scherm).
 */

const UREN: Record<string, string[]> = {
  participatiewet: ["overeengekomen_arbeidsduur_uren_per_week"],
  wet_tegemoetkomingen_loondomein: [
    "verloonde_uren",
    "verloonde_uren_voorwaarden_2_10",
  ],
};

export const invoerVan = (
  trace: DemoAannemenTrace,
  a: Antwoorden,
  uitleggen: string[],
): Invoer => {
  const parameters: Record<string, unknown> = { ...trace.gegevens };
  for (const naam of UREN[trace.wet] ?? []) {
    if (naam in parameters)
      parameters[naam] = naam.startsWith("verloonde") ? a.uren * 52 : a.uren;
  }
  if ("loonwaarde_percentage" in parameters)
    parameters.loonwaarde_percentage = a.loonwaarde;
  if ("kan_minimumloon_niet_verdienen" in parameters)
    parameters.kan_minimumloon_niet_verdienen = onderMinimumloon(a);
  return {
    wet: trace.wet,
    output: trace.uitkomst,
    peildatum: trace.peildatum,
    parameters,
    uitleggen,
  };
};

/**
 * Loonkosten per jaar als benadering: uurloon maal uren maal 52 weken,
 * plus 8 procent vakantiebijslag en 20 procent werkgeverslasten. Geen
 * wet, een vuistregel; de engine rekent de subsidie en het voordeel, en die
 * gaan uit van het minimumloon, niet van het uurloon.
 */
export const loonkostenPerJaar = (a: Antwoorden) =>
  Math.round(a.uurloon * a.uren * 52 * 1.08 * 1.2);

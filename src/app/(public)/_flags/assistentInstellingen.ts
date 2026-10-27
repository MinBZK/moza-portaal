"use client";

import { useSyncExternalStore } from "react";

/**
 * Instellingen van de Digitale assistent, zoals in het Flags-paneel van
 * moza-poc. Ze staan in localStorage (sleutel "setting:<naam>"), dus alleen in
 * deze browser. De API-sleutels gaan als header mee naar de backend.
 */

export type AssistentInstellingen = {
  llm: "claude" | "vlam";
  transport: "mcp" | "cli";
  /** null = niet gekozen; dan bepaalt de pagina de standaard. */
  demoModus: boolean | null;
  /** KVK-nummer dat het nummer van de persona overschrijft. */
  testKvk: string;
  vlamSleutel: string;
  claudeSleutel: string;
};

const SLEUTELS: Record<keyof AssistentInstellingen, string> = {
  llm: "setting:llm",
  transport: "setting:transport",
  demoModus: "setting:demo-mode",
  testKvk: "setting:test-user-kvk",
  vlamSleutel: "setting:vlam-api-key",
  claudeSleutel: "setting:claude-api-key",
};

const lees = (sleutel: string) => {
  try {
    return window.localStorage.getItem(sleutel);
  } catch {
    return null;
  }
};

const luisteraars = new Set<() => void>();
let vorige: { rauw: string; waarde: AssistentInstellingen } | null = null;

const SERVER: AssistentInstellingen = {
  llm: "claude",
  transport: "mcp",
  demoModus: null,
  testKvk: "",
  vlamSleutel: "",
  claudeSleutel: "",
};

const getSnapshot = (): AssistentInstellingen => {
  const rauw = Object.values(SLEUTELS).map(lees).join("\u0000");
  if (vorige?.rauw === rauw) return vorige.waarde;
  const demo = lees(SLEUTELS.demoModus);
  const waarde: AssistentInstellingen = {
    llm: lees(SLEUTELS.llm) === "vlam" ? "vlam" : "claude",
    transport: lees(SLEUTELS.transport) === "cli" ? "cli" : "mcp",
    demoModus: demo === null ? null : demo === "true",
    testKvk: lees(SLEUTELS.testKvk) ?? "",
    vlamSleutel: lees(SLEUTELS.vlamSleutel) ?? "",
    claudeSleutel: lees(SLEUTELS.claudeSleutel) ?? "",
  };
  vorige = { rauw, waarde };
  return waarde;
};

const subscribe = (luisteraar: () => void) => {
  luisteraars.add(luisteraar);
  window.addEventListener("storage", luisteraar);
  return () => {
    luisteraars.delete(luisteraar);
    window.removeEventListener("storage", luisteraar);
  };
};

export const useAssistentInstellingen = () =>
  useSyncExternalStore(subscribe, getSnapshot, () => SERVER);

/** Leest de instellingen buiten React, bijvoorbeeld tijdens een beurt. */
export const leesAssistentInstellingen = getSnapshot;

export const zetAssistentInstelling = <K extends keyof AssistentInstellingen>(
  naam: K,
  waarde: AssistentInstellingen[K],
) => {
  try {
    window.localStorage.setItem(SLEUTELS[naam], String(waarde));
  } catch {
    // Geen opslag: de instelling geldt dan niet.
  }
  luisteraars.forEach((luisteraar) => luisteraar());
};

/** Losse onderdelen van de chat tonen, vanuit het Flags-paneel. */
export type AssistentDemo = "testantwoord" | "wallet" | "eml" | "janee";
export const ASSISTENT_DEMO_EVENT = "assistent-demo";

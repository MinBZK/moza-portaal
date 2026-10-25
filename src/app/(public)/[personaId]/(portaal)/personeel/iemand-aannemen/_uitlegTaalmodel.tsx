"use client";

import { useState } from "react";
import { Button, Paragraph } from "@/components/rhc";
import { leesAssistentInstellingen } from "@/app/(public)/_flags/assistentInstellingen";
import type { Berekening } from "./_useRegelrecht";

/**
 * "Leg dit uit in gewone taal": de beslisgraaf van de engine gaat naar de
 * dienst /uitleg van de Digitale assistent (PDR-016 in
 * moza-poc-digitale-assistent). Die dienst houdt het prompt, roept het
 * taalmodel aan zonder tools en toetst het antwoord tegen de graaf: elk
 * bedrag en percentage moet erin staan, het wetsartikel moet genoemd zijn.
 * Dit is de Graph-variant uit Bos, Schuth en Chen, "From Rules as Executed to
 * Citizen Explanation" (JURIX 2026). De deterministische afleiding erboven
 * blijft de toetssteen; begrijpelijk is niet hetzelfde als juridisch juist.
 */

type Toets = {
  geslaagd: boolean;
  onbekende_bedragen: string[];
  onbekende_percentages: string[];
  artikel_genoemd: boolean;
  woorden: number;
  opmerkingen: string[];
};

type Stand =
  | { status: "rust" }
  | { status: "bezig" }
  | { status: "klaar"; tekst: string; toets: Toets; mode: string }
  | { status: "fout"; tekst: string };

/** Wat de dienst nodig heeft: de graaf van de laatste output en de korte samenvatting. */
export const uitlegVerzoek = (
  berekening: Berekening,
  outputs: string[],
  regeling: string,
) => {
  // Het bedrag (de laatste output) is de interessantste graaf; anders het recht.
  const gekozen = outputs
    .map((o) => berekening.afleidingen[o])
    .filter(Boolean)
    .at(-1);
  const graaf = (gekozen?.afleiding as { uitkomst?: unknown } | undefined)
    ?.uitkomst;
  if (!graaf) return null;
  const samenvatting = outputs.flatMap((o) =>
    (berekening.afleidingen[o]?.tekst.kort ?? [])
      .filter((r) => !r.technisch)
      .map((r) => r.tekst),
  );
  return { regeling, graaf, samenvatting };
};

const foutTekst = (status: number, json: unknown) => {
  const veld = (naam: string) =>
    json && typeof json === "object" && naam in json
      ? String((json as Record<string, unknown>)[naam])
      : "";
  if (status === 503 || status === 502)
    return `${veld("fout") || "De Digitale assistent is niet bereikbaar."} Vraag de beheerder van de proeftuin om de Digitale assistent aan te zetten.`;
  if (status === 404)
    return "Deze versie van de Digitale assistent kent de uitleg-dienst nog niet.";
  // De catalogusfout van de backend: wat er misging en wat u kunt doen.
  const bericht = veld("message") || veld("fout") || veld("detail");
  return (
    bericht ||
    `Geen uitleg gekregen (HTTP ${status}). Controleer de API-sleutel in het Flags-paneel.`
  );
};

const UitlegTaalmodel = ({
  berekening,
  outputs,
  regeling,
  kvk,
}: {
  berekening: Berekening;
  outputs: string[];
  regeling: string;
  kvk: string;
}) => {
  const [stand, setStand] = useState<Stand>({ status: "rust" });
  const verzoek = uitlegVerzoek(berekening, outputs, regeling);
  if (!verzoek) return null;

  const vraag = async () => {
    const ingesteld = leesAssistentInstellingen();
    setStand({ status: "bezig" });
    try {
      const antwoord = await fetch("/api/assistent/uitleg", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-VLAM-API-Key": ingesteld.vlamSleutel,
          "X-Claude-API-Key": ingesteld.claudeSleutel,
          "X-Test-User": ingesteld.testKvk.trim() || kvk,
        },
        body: JSON.stringify({
          ...verzoek,
          mode: ingesteld.llm === "vlam" ? "vlam" : "claude",
        }),
      });
      const json: unknown = await antwoord.json().catch(() => null);
      const tekst =
        json && typeof json === "object" && "tekst" in json
          ? String((json as { tekst: unknown }).tekst)
          : "";
      if (!antwoord.ok || !tekst) {
        setStand({ status: "fout", tekst: foutTekst(antwoord.status, json) });
        return;
      }
      const { toets, mode } = json as { toets: Toets; mode: string };
      setStand({ status: "klaar", tekst, toets, mode });
    } catch {
      setStand({
        status: "fout",
        tekst: "De Digitale assistent is niet bereikbaar.",
      });
    }
  };

  return (
    <div className="mox-hiring-llm rhc-mox-row-gap">
      {stand.status !== "klaar" && (
        <Button
          appearance="secondary-action-button"
          onClick={vraag}
          aria-disabled={stand.status === "bezig"}
        >
          {stand.status === "bezig"
            ? "Het taalmodel schrijft…"
            : "Leg dit uit in gewone taal"}
        </Button>
      )}
      {stand.status === "fout" && (
        <Paragraph className="mox-hiring-note" role="status">
          {stand.tekst}
        </Paragraph>
      )}
      {stand.status === "klaar" && (
        <>
          <Paragraph>{stand.tekst}</Paragraph>
          {!stand.toets.geslaagd && (
            <Paragraph className="mox-hiring-note" role="status">
              Let op: deze tekst wijkt af van de afleiding.{" "}
              {stand.toets.opmerkingen.join(" ")} Ga uit van de afleiding
              hierboven.
            </Paragraph>
          )}
          <Paragraph className="mox-hiring-note">
            Geschreven door het taalmodel van de Digitale assistent (
            {stand.mode === "vlam" ? "VLAM" : "Claude"}), alleen uit de
            beslisgraaf van de engine
            {stand.toets.geslaagd &&
              "; bedragen en wetsartikel zijn gecontroleerd tegen die graaf"}
            . Dit is een hulp bij het lezen, geen besluit; bij twijfel geldt de
            afleiding stap voor stap.
          </Paragraph>
        </>
      )}
    </div>
  );
};

export default UitlegTaalmodel;

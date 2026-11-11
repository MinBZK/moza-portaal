"use client";

import { useState } from "react";
import { Button, Paragraph, Separator } from "@/components/rhc";
import { leesAssistentInstellingen } from "@/app/(public)/_flags/assistentInstellingen";
import { useFlag } from "@/app/(public)/_flags/flagsContext";
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
  | { status: "fout"; tekst: string }
  /** De dienst bestaat hier niet: geen knop meer, alleen de melding. */
  | { status: "onbeschikbaar"; tekst: string };

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

const NIET_BEREIKBAAR =
  "De digitale assistent is nu niet bereikbaar. Probeer het later opnieuw.";

const foutTekst = (status: number, json: unknown) => {
  const veld = (naam: string) =>
    json && typeof json === "object" && naam in json
      ? String((json as Record<string, unknown>)[naam])
      : "";
  if (status === 503 || status === 502) return NIET_BEREIKBAAR;
  if (status === 404)
    return "Uitleg in gewone taal is nu niet beschikbaar. Gebruik de uitleg stap voor stap hierboven.";
  // De catalogusfout van de backend: wat er misging en wat u kunt doen.
  const bericht = veld("message") || veld("fout") || veld("detail");
  return bericht || NIET_BEREIKBAAR;
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
  // Net als de zoekbalk: zonder de digitale assistent geen knop (#201).
  const assistent = useFlag("mox_digitaleAssistent");
  const verzoek = uitlegVerzoek(berekening, outputs, regeling);
  if (!verzoek || !assistent) return null;

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
        setStand({
          status: antwoord.status === 404 ? "onbeschikbaar" : "fout",
          tekst: foutTekst(antwoord.status, json),
        });
        return;
      }
      const { toets, mode } = json as { toets: Toets; mode: string };
      setStand({ status: "klaar", tekst, toets, mode });
    } catch {
      setStand({
        status: "fout",
        tekst: NIET_BEREIKBAAR,
      });
    }
  };

  return (
    <div className="rhc-mox-stack">
      <Separator />
      {(stand.status === "rust" ||
        stand.status === "bezig" ||
        stand.status === "fout") && (
        <Button
          appearance="secondary-action-button"
          onClick={vraag}
          aria-disabled={stand.status === "bezig"}
          busy={stand.status === "bezig"}
        >
          {stand.status === "bezig"
            ? "De digitale assistent schrijft…"
            : "Leg dit uit in gewone taal"}
        </Button>
      )}
      {(stand.status === "rust" || stand.status === "bezig") && (
        <Paragraph className="rhc-mox-small-text">
          Kiest u <strong>Leg dit uit in gewone taal</strong>? Dan gaan de
          gegevens van deze uitkomst en uw KVK-nummer naar de digitale
          assistent. Die schrijft daarmee de uitleg.
        </Paragraph>
      )}
      {(stand.status === "fout" || stand.status === "onbeschikbaar") && (
        <Paragraph className="rhc-mox-small-text" role="status">
          {stand.tekst}
        </Paragraph>
      )}
      {stand.status === "klaar" && (
        <>
          <Paragraph>{stand.tekst}</Paragraph>
          {!stand.toets.geslaagd && (
            <Paragraph className="rhc-mox-small-text" role="status">
              Let op: deze tekst wijkt af van de uitleg uit de wet.{" "}
              {stand.toets.opmerkingen.join(" ")} Ga uit van de uitleg uit de
              wet hierboven.
            </Paragraph>
          )}
          <Paragraph className="rhc-mox-small-text">
            Geschreven door de digitale assistent (
            {stand.mode === "vlam" ? "VLAM" : "Claude"}), alleen op basis van de
            berekening hierboven.
            {stand.toets.geslaagd &&
              " Wij hebben de bedragen en het wetsartikel gecontroleerd."}{" "}
            Dit is een hulp bij het lezen, geen besluit. Bij twijfel geldt de
            uitleg uit de wet.
          </Paragraph>
        </>
      )}
    </div>
  );
};

export default UitlegTaalmodel;

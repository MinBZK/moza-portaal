"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Alert } from "@/components/rhc";

/** Hoe lang de melding te zien is, en hoe lang hij uitfadet (rhc.css). */
const ZICHTBAAR_MS = 3000;
const VERVAAG_MS = 500;

/**
 * Een melding die na 3 seconden uitfadet en dan verdwijnt, voor een kleine
 * bevestiging. Geef een andere key om hem opnieuw te tonen. Zet hem in een
 * role="status", zodat schermlezers hem meteen voorlezen.
 */
const TijdelijkeMelding = ({
  type = "ok",
  children,
}: {
  type?: "info" | "ok" | "warning" | "error";
  children: ReactNode;
}) => {
  const [fase, setFase] = useState<"zichtbaar" | "vervaagt" | "weg">(
    "zichtbaar",
  );

  useEffect(() => {
    const vervaag = setTimeout(() => setFase("vervaagt"), ZICHTBAAR_MS);
    const weg = setTimeout(() => setFase("weg"), ZICHTBAAR_MS + VERVAAG_MS);
    return () => {
      clearTimeout(vervaag);
      clearTimeout(weg);
    };
  }, []);

  if (fase === "weg") return null;
  return (
    <div
      className={`rhc-fade-out${fase === "vervaagt" ? " rhc-fade-out--hidden" : ""}`}
    >
      <Alert type={type}>{children}</Alert>
    </div>
  );
};

export default TijdelijkeMelding;

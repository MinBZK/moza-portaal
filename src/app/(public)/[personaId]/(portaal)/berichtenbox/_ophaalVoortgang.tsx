"use client";

import { useEffect, useState } from "react";
import { Paragraph } from "@rijkshuisstijl-community/components-react";

/**
 * Bootst na hoe de inbox berichten ophaalt bij de organisaties, zoals in
 * moza-poc. Elke organisatie antwoordt op een eigen moment. De meeste snel,
 * een paar laat (een verdeling met een zware staart, x^4).
 */

const DUUR_MS = 4000;
const DUUR_EEN_BRON_MS = 1200;

export type Voortgang = { bronnen: number; klaar: number; gevonden: number };

const aankomsttijden = (aantal: number) =>
  Array.from({ length: aantal }, () => Math.random() ** 4).sort(
    (a, b) => a - b,
  );

const aantalVoor = (tijden: number[], t: number) =>
  tijden.filter((tijd) => tijd <= t).length;

/**
 * @param actief  Alleen de inbox haalt op; archief en prullenbak niet.
 * @param bronnen Aantal organisaties, of null zolang dat nog niet bekend is.
 * @param berichten Aantal berichten dat straks gevonden is.
 */
export const useNagebootstOphalen = (
  actief: boolean,
  bronnen: number | null,
  berichten: number,
) => {
  const [klaar, setKlaar] = useState(!actief);
  const [voortgang, setVoortgang] = useState<Voortgang | null>(null);

  useEffect(() => {
    if (klaar || bronnen === null) return;

    const bronTijden = aankomsttijden(bronnen);
    const berichtTijden = aankomsttijden(berichten);
    const duur = bronnen <= 1 ? DUUR_EEN_BRON_MS : DUUR_MS;
    const begin = performance.now();
    let frame = 0;

    const stap = () => {
      const t = Math.min(1, (performance.now() - begin) / duur);
      setVoortgang({
        bronnen,
        klaar: aantalVoor(bronTijden, t),
        gevonden: aantalVoor(berichtTijden, t),
      });
      if (t < 1) frame = requestAnimationFrame(stap);
      else setKlaar(true);
    };
    frame = requestAnimationFrame(stap);

    return () => cancelAnimationFrame(frame);
  }, [klaar, bronnen, berichten]);

  return { bezig: !klaar, voortgang };
};

const OphaalVoortgang = ({ voortgang }: { voortgang: Voortgang | null }) => {
  const { bronnen = 0, klaar = 0, gevonden = 0 } = voortgang ?? {};
  const procent = bronnen ? Math.round((klaar / bronnen) * 100) : 0;

  return (
    <div className="mox-feedback-notice space-y-2 rounded border border-[var(--utrecht-alert-ok-border-color)] bg-[var(--utrecht-alert-ok-background-color)] p-4">
      <Paragraph>We halen uw berichten op bij de organisaties.</Paragraph>
      <Paragraph>
        <b>{klaar}</b> van <b>{bronnen}</b>{" "}
        {bronnen === 1 ? "organisatie" : "organisaties"}, <b>{gevonden}</b>{" "}
        {gevonden === 1 ? "bericht" : "berichten"} gevonden
      </Paragraph>
      <div
        role="progressbar"
        aria-label="Berichten ophalen"
        aria-valuemin={0}
        aria-valuemax={bronnen}
        aria-valuenow={klaar}
        aria-valuetext={`${klaar} van ${bronnen} organisaties`}
        className="h-2 overflow-hidden rounded-full border border-[var(--utrecht-alert-ok-border-color)] bg-[var(--rhc-color-wit)]"
      >
        <div
          className="h-full bg-[var(--utrecht-alert-icon-ok-color)]"
          style={{ inlineSize: `${procent}%` }}
        />
      </div>
    </div>
  );
};

export default OphaalVoortgang;

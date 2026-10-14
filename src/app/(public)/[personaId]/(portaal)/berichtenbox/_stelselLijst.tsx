"use client";

import { Alert, Paragraph } from "@rijkshuisstijl-community/components-react";
import BerichtenboxNav from "./_berichtenboxNav";
import BerichtenLijst from "./_berichtenLijst";
import { ketenFoutTekst, useKeten, verplaatsKetenBericht } from "./_useKeten";
import type { Weergave } from "./_useBerichtenboxState";

/** De berichtenbox van een aangesloten persona: berichten uit het stelsel. */
const StelselLijst = ({
  ontvanger,
  weergave,
  pagina,
}: {
  ontvanger: string;
  weergave: Weergave;
  pagina: number;
}) => {
  const { fase, berichten, voortgang, fout, nieuw, volgenGestopt } =
    useKeten(ontvanger);

  return (
    <>
      <BerichtenboxNav
        berichten={berichten}
        actief={weergave}
        metNieuwe={false}
      />
      {/* Nieuwe berichten komen vanzelf binnen; zeg het ook tegen schermlezers. */}
      <div aria-live="polite" className="rhc-visually-hidden">
        {nieuw && `Nieuw bericht van ${nieuw.afzender}.`}
      </div>
      {volgenGestopt && (
        <Alert type="info">
          <Paragraph>
            Nieuwe berichten verschijnen niet meer vanzelf. Ververs de pagina om
            ze op te halen.
          </Paragraph>
        </Alert>
      )}
      <BerichtenLijst
        berichten={berichten}
        weergave={weergave}
        pagina={pagina}
        stelsel={{
          bezig: fase !== "klaar" && fase !== "fout",
          voortgang,
          fout: fout ? ketenFoutTekst[fout] : null,
          verplaats: verplaatsKetenBericht,
        }}
      />
    </>
  );
};

export default StelselLijst;

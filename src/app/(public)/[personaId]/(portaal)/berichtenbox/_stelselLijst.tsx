"use client";

import { Alert, Paragraph } from "@/components/rhc";
import BerichtenboxNav from "./_berichtenboxNav";
import BerichtenLijst from "./_berichtenLijst";
import Volledigheidsmelding, {
  MeldingenRegio,
  SessieVerlopen,
} from "./_ketenMeldingen";
import {
  ketenFoutTekst,
  useKeten,
  verplaatsKetenBericht,
  zetKetenMap,
} from "./_useKeten";
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
  const {
    fase,
    berichten,
    voortgang,
    fout,
    volledigheid,
    verlopen,
    nieuw,
    volgenGestopt,
  } = useKeten(ontvanger);
  // Tijdens de ophaalronde groeit het mappenoverzicht mee met wat de
  // organisaties melden. Archief en prullenbak zijn tabbladen, geen map.
  const mappenTijdensOphalen = Object.keys(voortgang?.mappen ?? {}).filter(
    (map) => map !== "Archief" && map !== "Prullenbak",
  );

  return (
    <>
      <BerichtenboxNav
        berichten={berichten}
        actief={weergave}
        metNieuwe={false}
        extraMappen={mappenTijdensOphalen}
      />
      {/* Nieuwe berichten komen vanzelf binnen; zeg het ook tegen schermlezers. */}
      <div aria-live="polite" className="rhc-visually-hidden">
        {nieuw && `Nieuw bericht van ${nieuw.afzender}.`}
      </div>
      <MeldingenRegio>
        {verlopen && <SessieVerlopen />}
        {fase === "klaar" && volledigheid && (
          <Volledigheidsmelding
            volledigheid={volledigheid}
            aantal={berichten.length}
          />
        )}
      </MeldingenRegio>
      {volgenGestopt && !verlopen && (
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
          zetMap: zetKetenMap,
        }}
      />
    </>
  );
};

export default StelselLijst;

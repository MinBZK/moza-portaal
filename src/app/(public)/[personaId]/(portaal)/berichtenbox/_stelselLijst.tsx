"use client";

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
  const { fase, berichten, voortgang, fout } = useKeten(ontvanger);

  return (
    <>
      <BerichtenboxNav berichten={berichten} actief={weergave} />
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

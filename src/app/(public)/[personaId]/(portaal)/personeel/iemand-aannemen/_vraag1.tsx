"use client";

import { Fieldset, FormFieldCheckboxOption } from "@/components/rhc";
import {
  DOELGROEPEN,
  aangevinktVan,
  vinkVraag1,
  type Antwoorden,
  type Doelgroep,
} from "./_useAannemen";

/**
 * Wat een vinkje voor de berekening betekent. De vinkjes zelf staan los van
 * elkaar; de wet koppelt ze pas in doelgroepenUit (_uitkomsten.ts).
 */
const UITLEG: Partial<Record<Doelgroep, string>> = {
  // Wfsv 38b lid 1 c: ook zonder arbeidsvermogen, zodra in dienstbetrekking; 38d: de registratie.
  wajong:
    "Wie een Wajong-uitkering heeft en bij u in dienst komt, hoort in het doelgroepregister. Dat geldt niet bij beschut werk.",
  // Wfsv 38b lid 1 aanhef; Wtl 2.10 met 2.13, 2.6 lid 3 b en 2.14 lid 2 b.
  beschut:
    "Wie de gemeente op beschut werk aanwijst, hoort niet in het doelgroepregister. U krijgt dan geen loonkostenvoordeel.",
};

/** Vraag 1: keuzevakjes die elk alleen zichzelf aan- of uitzetten. */
const Vraag1 = ({
  a,
  zet,
}: {
  a: Antwoorden;
  zet: (deel: Partial<Antwoorden>) => void;
}) => {
  const aangevinkt = aangevinktVan(a);
  return (
    <Fieldset legend="1. Wie wilt u aannemen? Kies wat past.">
      {DOELGROEPEN.map(([waarde, label]) => (
        <FormFieldCheckboxOption
          key={waarde}
          name="doelgroepen"
          value={waarde}
          label={label}
          checked={aangevinkt.includes(waarde)}
          description={UITLEG[waarde]}
          onChange={(event) => zet(vinkVraag1(a, waarde, event.target.checked))}
        />
      ))}
    </Fieldset>
  );
};

export default Vraag1;

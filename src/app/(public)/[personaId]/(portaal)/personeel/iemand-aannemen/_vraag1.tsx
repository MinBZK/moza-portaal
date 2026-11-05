"use client";

import { Fragment } from "react";
import {
  Fieldset,
  FormFieldCheckboxOption,
  FormFieldErrorMessage,
  Paragraph,
} from "@/components/rhc";
import {
  DOELGROEPEN,
  aangevinktVan,
  vinkVraag1,
  vraag1Botst,
  type Antwoorden,
  type Doelgroep,
} from "./_useAannemen";

/**
 * Wat een vinkje voor de berekening betekent. De vinkjes zelf staan los van
 * elkaar; de wet koppelt ze pas in doelgroepenUit (_uitkomsten.ts).
 */
const UITLEG: Partial<Record<Doelgroep, string>> = {
  wajong:
    "Iemand met een Wajong-uitkering staat ook in het doelgroepregister. Dat hoeft u niet apart te kiezen.",
  beschut:
    "Beschut werk telt niet mee voor de banenafspraak. De berekening houdt dan geen rekening met het doelgroepregister.",
};

/**
 * Vraag 1: keuzevakjes die elk alleen zichzelf aan- of uitzetten. Kiest de
 * gebruiker "Geen van deze" samen met iets anders, dan volgt een melding en
 * blijven de bedragen bij het vorige antwoord.
 */
const Vraag1 = ({
  a,
  zet,
}: {
  a: Antwoorden;
  zet: (deel: Partial<Antwoorden>) => void;
}) => {
  const aangevinkt = aangevinktVan(a);
  const botst = vraag1Botst(aangevinkt);
  return (
    <Fieldset
      legend="1. Wie wilt u aannemen? Kies wat past."
      invalid={botst}
      aria-describedby={botst ? "vraag1-fout" : undefined}
    >
      {DOELGROEPEN.map(([waarde, label]) => (
        <Fragment key={waarde}>
          {waarde === "geen" && <Paragraph>of</Paragraph>}
          <FormFieldCheckboxOption
            name="doelgroepen"
            value={waarde}
            label={label}
            checked={aangevinkt.includes(waarde)}
            description={UITLEG[waarde]}
            onChange={(event) =>
              zet(vinkVraag1(a, waarde, event.target.checked))
            }
          />
        </Fragment>
      ))}
      {botst && (
        <FormFieldErrorMessage id="vraag1-fout" role="alert">
          <strong>Geen van deze</strong> kan niet samen met een andere keuze.
          Haal een vinkje weg. Tot dan gaan de bedragen uit van uw vorige
          antwoord.
        </FormFieldErrorMessage>
      )}
    </Fieldset>
  );
};

export default Vraag1;

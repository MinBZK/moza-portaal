"use client";

import { Fieldset, FormFieldRadio, Paragraph } from "@/components/rhc";
import InfoToggletip from "@/components/InfoToggletip";
import { BegripInfo } from "./_begrippen";
import {
  doelgroepenUit,
  UITKERINGEN,
  vragenUit,
  type InRegister,
  type Uitkering,
} from "./_uitkomsten";
import type { Antwoorden } from "./_useAannemen";

/** De check bij UWV of iemand in het doelgroepregister staat. */
const UWV_REGISTER =
  "https://www.uwv.nl/nl/doelgroepregister/staat-werknemer-in-doelgroepregister";

/**
 * Register, beschut werk en uitkering uit de antwoorden. Oudere opslag kent
 * alleen de doelgroepen, of nog de uitkering "andere" (die rekende als geen).
 */
export const doelgroepVragenVan = (a: Antwoorden) => {
  const afgeleid = vragenUit(a.doelgroepen);
  return {
    register: a.register ?? afgeleid.register,
    beschut: a.beschut ?? afgeleid.beschut,
    uitkering:
      UITKERINGEN.find(([w]) => w === a.uitkering)?.[0] ?? afgeleid.uitkering,
  };
};

/**
 * Beschut werk en het register sluiten elkaar uit (Wfsv 38b lid 1 aanhef): de
 * vraag naar beschut werk staat er niet bij Ja.
 */
export const vraagBeschut = (a: Antwoorden) =>
  doelgroepVragenVan(a).register !== "ja";

/**
 * De vragen die bepalen welke regelingen gelden: doelgroepregister, beschut
 * werk en uitkering. In de voorbeeldberekening genummerd, bij Kandidaat
 * kiezen met de voornaam van de kandidaat.
 */
const DoelgroepVragen = ({
  a,
  zet,
  wie = "de kandidaat",
  nummer,
}: {
  a: Antwoorden;
  zet: (deel: Partial<Antwoorden>) => void;
  wie?: string;
  /** Het nummer voor vraag n, zoals "1. "; zonder nummer geen nummering. */
  nummer?: (n: number) => string;
}) => {
  const { register, beschut, uitkering } = doelgroepVragenVan(a);
  const metBeschut = register !== "ja";
  const nr = (n: number) => nummer?.(metBeschut || n < 2 ? n : n - 1) ?? "";
  const zetVraag = (deel: {
    register?: InRegister;
    beschut?: boolean;
    uitkering?: Uitkering;
  }) => {
    const r = deel.register ?? register;
    const b = (deel.beschut ?? beschut) && r !== "ja";
    const u = deel.uitkering ?? uitkering;
    zet({
      register: r,
      beschut: b,
      uitkering: u,
      doelgroepen: doelgroepenUit(r, b, u),
    });
  };
  return (
    <>
      <div className="rhc-mox-stack rhc-mox-stack--sm">
        <Fieldset
          legend={`${nr(1)}Staat ${wie} in het doelgroepregister?`}
          info={<BegripInfo id="doelgroepregister" />}
        >
          {(
            [
              ["ja", "Ja"],
              ["nee", "Nee"],
              ["onbekend", "Weet ik niet"],
            ] as const
          ).map(([waarde, label]) => (
            <FormFieldRadio
              key={waarde}
              name="register"
              value={waarde}
              label={label}
              checked={register === waarde}
              onChange={() => zetVraag({ register: waarde })}
            />
          ))}
        </Fieldset>
        {register === "onbekend" && (
          <Paragraph className="rhc-mox-small-text">
            <a
              href={UWV_REGISTER}
              className="utrecht-link utrecht-link--html-a"
              target="_blank"
              rel="external noopener noreferrer"
            >
              Controleer bij UWV of {wie} in het doelgroepregister staat (opent
              in een nieuw tabblad)
            </a>
            .{/* Wajong zet het register aan (kiesDoelgroep), dus dan niet. */}
            {uitkering !== "wajong" &&
              ` Tot dan rekenen wij alsof ${wie} er niet in staat.`}
          </Paragraph>
        )}
      </div>
      {metBeschut && (
        <Fieldset
          legend={`${nr(2)}Is ${wie} door de gemeente aangewezen op beschut werk?`}
          info={
            <InfoToggletip label="Toelichting bij beschut werk">
              <Paragraph>
                Beschut werk is werk in een beschutte omgeving, onder aangepaste
                omstandigheden. Het is voor iemand die alleen zo kan werken.
              </Paragraph>
              <Paragraph>
                De gemeente beslist of iemand beschut werk nodig heeft. UWV
                geeft daarover advies (Participatiewet, artikel 10b).
              </Paragraph>
              <Paragraph>
                Wie beschut werkt, telt niet mee voor de banenafspraak (Wet
                financiering sociale verzekeringen, artikel 38b lid 1).
              </Paragraph>
            </InfoToggletip>
          }
        >
          <FormFieldRadio
            name="beschut"
            value="ja"
            label="Ja"
            checked={beschut}
            onChange={() => zetVraag({ beschut: true })}
          />
          <FormFieldRadio
            name="beschut"
            value="nee"
            label="Nee"
            checked={!beschut}
            onChange={() => zetVraag({ beschut: false })}
          />
        </Fieldset>
      )}
      <Fieldset legend={`${nr(3)}Heeft ${wie} een uitkering?`}>
        {UITKERINGEN.map(([waarde, label]) => (
          <FormFieldRadio
            key={waarde}
            name="uitkering"
            value={waarde}
            label={label}
            checked={uitkering === waarde}
            description={
              waarde === "wajong" && register !== "ja" && !beschut
                ? "Iemand met een Wajong-uitkering staat in het doelgroepregister."
                : undefined
            }
            onChange={() => zetVraag({ uitkering: waarde })}
          />
        ))}
      </Fieldset>
    </>
  );
};

export default DoelgroepVragen;

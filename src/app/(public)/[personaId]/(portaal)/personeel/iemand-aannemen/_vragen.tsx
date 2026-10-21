"use client";

import Link from "next/link";
import {
  ActionGroup,
  Alert,
  Fieldset,
  FormFieldRadio,
  Heading,
  Paragraph,
  UnorderedList,
  UnorderedListItem,
} from "@/components/rhc";
import type { DemoAannemenRegeling, DemoAannemenTrace } from "@/demo";
import NumberInput from "@/components/NumberInput";
import Balans from "./_balans";
import {
  DOELGROEPEN,
  ZELFSTANDIG,
  inRegister,
  useAannemen,
  type Antwoorden,
} from "./_useAannemen";

/**
 * Scherm 1: drie korte vragen met getalvelden, en rechts live wat de
 * regelingen opleveren. De berekening blijft op het scherm; er gaat niets naar een
 * overheidsorganisatie.
 */
const Vragen = ({
  onderneming,
  traces,
  regelingen,
}: {
  onderneming: string;
  traces: Record<string, DemoAannemenTrace>;
  regelingen: DemoAannemenRegeling[];
}) => {
  const { staat, werkBij } = useAannemen();
  if (!staat) return null;
  const a = staat.antwoorden;
  const zet = (deel: Partial<Antwoorden>) =>
    werkBij({ antwoorden: { ...a, ...deel } });
  const register = inRegister(a);
  const anders = a.doelgroep === "wajong" || a.doelgroep === "wia";
  const overige = regelingen.filter((r) => r.id !== "lks" && r.id !== "lkv");

  return (
    <>
      <Heading level={2}>Wat betekent dit voor {onderneming}?</Heading>
      <Paragraph className="mox-hiring-note">
        Deze berekening blijft op uw scherm. Er gaat niets naar een
        overheidsorganisatie.
      </Paragraph>
      <div className="rhc-grid">
        <div className="rhc-grid__cell rhc-grid__cell-t-7 rhc-row-gap">
          <Fieldset legend="1. Wie wilt u aannemen?">
            {DOELGROEPEN.map(([waarde, label]) => (
              <FormFieldRadio
                key={waarde}
                name="doelgroep"
                value={waarde}
                label={label}
                checked={a.doelgroep === waarde}
                onChange={() => zet({ doelgroep: waarde })}
              />
            ))}
          </Fieldset>
          <NumberInput
            label="2. Hoeveel uur per week gaat de kandidaat werken?"
            min={8}
            max={40}
            step={1}
            value={a.uren}
            onChange={(event) => {
              const uren = Number(event.target.value);
              if (uren >= 8 && uren <= 40) zet({ uren });
            }}
          />
          <Fieldset legend="3. Kan de kandidaat het werk zelfstandig doen tegen het minimumloon?">
            {ZELFSTANDIG.map(([waarde, label]) => (
              <FormFieldRadio
                key={waarde}
                name="zelfstandig"
                value={waarde}
                label={label}
                checked={a.zelfstandig === waarde}
                onChange={() => zet({ zelfstandig: waarde })}
              />
            ))}
          </Fieldset>
          {a.zelfstandig !== "ja" && (
            <div>
              <NumberInput
                label="Geschatte loonwaarde, in procent"
                min={30}
                max={90}
                step={5}
                value={a.loonwaarde}
                onChange={(event) => {
                  const loonwaarde = Number(event.target.value);
                  if (loonwaarde >= 30 && loonwaarde <= 90) zet({ loonwaarde });
                }}
              />
              <Paragraph className="mox-hiring-note">
                Hoeveel iemand kan in vergelijking met een collega zonder
                beperking. De gemeente meet dit later op de werkplek.
              </Paragraph>
            </div>
          )}
          {anders && (
            <Alert type="info">
              <Paragraph>
                Dit prototype werkt de aanvraag uit voor een kandidaat uit het
                doelgroepregister. Voor een Wajong-, WIA- of WAO-uitkering
                volgen de bedragen hieronder dat uitgangspunt.
              </Paragraph>
            </Alert>
          )}
        </div>
        <aside
          className="mox-card rhc-grid__cell rhc-grid__cell-t-5"
          aria-label="Wat het kost en oplevert"
        >
          <Balans antwoorden={a} traces={traces} />
        </aside>
      </div>

      {register !== "nee" && (
        <section className="mox-card rhc-row-gap" aria-labelledby="overige">
          <Heading level={2} id="overige">
            Regelingen die verder kunnen gelden
          </Heading>
          <UnorderedList>
            {overige.map((r) => (
              <UnorderedListItem key={r.id}>
                <strong>{r.naam}</strong>
                <span
                  className={`mox-hiring-label${r.soort === "niet" ? " mox-hiring-label--not-applicable" : ""}`}
                >
                  {r.soortLabel}
                </span>
                <br />
                {r.tekstAlgemeen ?? r.tekst}
              </UnorderedListItem>
            ))}
          </UnorderedList>
          <Paragraph className="mox-hiring-note">
            Of een regeling geldt, hangt af van de kandidaat. Dit zijn de
            uitkomsten van de regelrecht-engine voor iemand uit het
            doelgroepregister.
          </Paragraph>
        </section>
      )}

      <section className="mox-card rhc-row-gap" aria-labelledby="aanvragen">
        <Heading level={2} id="aanvragen">
          Wilt u deze regelingen aanvragen?
        </Heading>
        <Paragraph>
          Wij vullen de aanvragen voor u in met gegevens die al bij de overheid
          bekend zijn. U controleert alles, vult aan wat nog ontbreekt en
          beslist zelf of u indient. Tussendoor opslaan kan.
        </Paragraph>
        <ActionGroup>
          <Link
            href="/personeel/iemand-aannemen/gegevens"
            className="utrecht-button-link utrecht-button-link--html-a utrecht-button-link--primary-action"
          >
            Aanvraag laten invullen
          </Link>
        </ActionGroup>
      </section>
    </>
  );
};

export default Vragen;

"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ActionGroup,
  Fieldset,
  FormFieldCheckboxOption,
  FormFieldRadio,
  FormFieldTextInput,
  Heading,
  Paragraph,
  UnorderedList,
  UnorderedListItem,
  Separator,
} from "@/components/rhc";
import InfoToggletip from "@/components/InfoToggletip";
import RangeSlider from "@/components/RangeSlider";
import StickyInfoBox from "@/components/StickyInfoBox";
import Balans, { Uitvoerder, type UitvoerderId } from "./_balans";
import { type Overig } from "./_uitkomsten";
import { useUitkomsten } from "./_useUitkomsten";
import { euro } from "./_werkgever";
import {
  DOELGROEPEN,
  WML_UUR_EUROCENT,
  kiesDoelgroep,
  registerVast,
  useAannemen,
  type Antwoorden,
} from "./_useAannemen";

/** Bovengrens van "anders, namelijk" bij het uurloon: € 200 per uur. */
const MAX_UURLOON_EUROCENT = 20000;

/** "15,50" of "15.50" naar eurocent; null als het geen bedrag is. */
const naarEurocent = (tekst: string) => {
  const schoon = tekst.trim().replace(/^€\s*/, "").replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(schoon)) return null;
  return Math.round(Number(schoon) * 100);
};

const alsTekst = (cent: number) => (cent / 100).toFixed(2).replace(".", ",");

/** "Regelingen die verder kunnen gelden": naam en uitleg per uitkomst van de engine. */
const OVERIG: Record<
  Overig["id"],
  { naam: string; uitvoerder: UitvoerderId; tekst: (o: Overig) => string }
> = {
  nrp: {
    naam: "No-riskpolis",
    uitvoerder: "uwv",
    // ZW 29b lid 1, 2, 5 en 6; de loondoorbetaling blijft.
    tekst: (o) =>
      `Wordt uw werknemer ziek? Dan betaalt u het loon door. UWV betaalt u dan ziekengeld: 70 procent van het dagloon. In de eerste 52 weken van de ziekte kunt u UWV vragen om het hele dagloon, maar niet meer dan het loon. ${o.duurJaren === 5 ? "Dit geldt bij ziekte die begint in de eerste vijf jaar na de start van het dienstverband." : "Er is geen einddatum."}`,
  },
  pp_pwet: {
    naam: "Proefplaatsing",
    uitvoerder: "gemeente",
    // Pwet 6 h en 8a lid 2 d: onbeloond, vóór de dienstbetrekking, toestemming aan de kandidaat.
    tekst: () =>
      "Een proefplaats is onbetaald werk bij u, vóór de eerste werkdag. De proefplaats duurt twee maanden. Verlengen kan met ten hoogste vier maanden. De kandidaat vraagt de gemeente om toestemming.",
  },
  pp_ww: {
    naam: "Proefplaatsing met behoud van WW",
    uitvoerder: "uwv",
    tekst: () =>
      "De kandidaat werkt zes maanden bij u terwijl de WW-uitkering doorloopt, als UWV toestemming geeft.",
  },
  begeleiding: {
    naam: "Begeleiding op de werkplek (jobcoach)",
    uitvoerder: "gemeente",
    // Pwet 10da: een aanspraak van de werknemer.
    tekst: () =>
      "Uw werknemer heeft recht op begeleiding op de werkplek, bijvoorbeeld door een jobcoach. Dit loopt via de gemeente.",
  },
  vz_wia: {
    naam: "Jobcoaching en werkplekaanpassing",
    uitvoerder: "uwv",
    // Wet WIA 35 (werknemer vraagt aan) en 36 (subsidie meerkosten voor de werkgever).
    tekst: () =>
      "UWV kan uw werknemer een voorziening geven, zoals een jobcoach of een aangepaste werkplek. Uw werknemer vraagt dit zelf aan bij UWV. Maakt u zelf extra kosten voor een aangepaste werkplek? En duurt het dienstverband ten minste zes maanden? Dan kunt u bij UWV subsidie vragen voor die extra kosten. Daarvoor gelden meer voorwaarden. De kosten moeten bijvoorbeeld hoger zijn dan een drempelbedrag. UWV beslist of u de subsidie krijgt.",
  },
  vz_wajong: {
    naam: "Jobcoaching en werkplekaanpassing",
    uitvoerder: "uwv",
    // Wajong 2:22: de werknemer vraagt aan.
    tekst: () =>
      "Via de Wajong kan UWV uw werknemer een voorziening geven, zoals een jobcoach of een aangepaste werkplek. Uw werknemer vraagt dit zelf aan bij UWV.",
  },
};

/**
 * Scherm 1: vier korte vragen met schuifregelaars, en rechts live wat de
 * regelingen opleveren. De berekening blijft op het scherm; er gaat niets naar een
 * overheidsorganisatie.
 */
const Vragen = ({ onderneming }: { onderneming: string }) => {
  const { staat, werkBij } = useAannemen();
  if (!staat) return null;
  return (
    <VragenMetStaat
      onderneming={onderneming}
      a={staat.antwoorden}
      zet={(deel) => werkBij({ antwoorden: { ...staat.antwoorden, ...deel } })}
    />
  );
};

const VragenMetStaat = ({
  onderneming,
  a,
  zet,
}: {
  onderneming: string;
  a: Antwoorden;
  zet: (deel: Partial<Antwoorden>) => void;
}) => {
  const resultaat = useUitkomsten(a);
  const vast = registerVast(a);
  const wajong = a.doelgroepen.includes("wajong");
  const overige = resultaat.uitkomsten.overige.filter((o) => o.geldt);
  // Vraag 4: het minimumloon, of een eigen bedrag dat pas telt als het klopt.
  const [anders, setAnders] = useState(a.uurloon !== WML_UUR_EUROCENT);
  const [loonTekst, setLoonTekst] = useState(
    a.uurloon !== WML_UUR_EUROCENT ? alsTekst(a.uurloon) : "",
  );
  const loonCent = naarEurocent(loonTekst);
  const loonFout =
    !anders || loonTekst.trim() === ""
      ? undefined
      : loonCent === null
        ? "Vul een bedrag in, bijvoorbeeld 16,50."
        : loonCent < WML_UUR_EUROCENT
          ? `Vul ten minste het minimumloon in: ${euro(WML_UUR_EUROCENT)}.`
          : loonCent > MAX_UURLOON_EUROCENT
            ? `Vul een bedrag in tot ${euro(MAX_UURLOON_EUROCENT)}.`
            : undefined;
  const zetLoon = (tekst: string) => {
    setLoonTekst(tekst);
    const cent = naarEurocent(tekst);
    if (
      cent !== null &&
      cent >= WML_UUR_EUROCENT &&
      cent <= MAX_UURLOON_EUROCENT
    )
      zet({ uurloon: cent });
  };

  return (
    <>
      <Separator></Separator>

      <section className="rhc-mox-stack" aria-labelledby="gevolgen">
        <Heading level={2} id="gevolgen">
          Gevolgen voor {onderneming}
        </Heading>
        <Paragraph className="rhc-mox-small-text">
          Deze berekening blijft op uw scherm. Er gaat niets naar een
          overheidsorganisatie.
        </Paragraph>
        <div className="rhc-grid">
          <div className="rhc-grid__cell rhc-grid__cell-t-7 rhc-mox-row-gap rhc-mox-stack--3xl">
            <Fieldset legend="1. Wie wilt u aannemen? (doelgroep) Kies wat past.">
              {DOELGROEPEN.map(([waarde, label]) => (
                <FormFieldCheckboxOption
                  key={waarde}
                  name="doelgroepen"
                  value={waarde}
                  label={label}
                  checked={a.doelgroepen.includes(waarde)}
                  disabled={waarde === "register" && vast}
                  description={
                    waarde === "register" && vast
                      ? "Iemand met een Wajong-uitkering staat in het doelgroepregister."
                      : undefined
                  }
                  onChange={(event) =>
                    zet({
                      doelgroepen: kiesDoelgroep(
                        a.doelgroepen,
                        waarde,
                        event.target.checked,
                      ),
                    })
                  }
                />
              ))}
            </Fieldset>
            <RangeSlider
              label="2. Hoeveel uur per week gaat de kandidaat werken? (arbeidsduur)"
              min={8}
              max={40}
              step={1}
              value={a.uren}
              onChange={(uren) => zet({ uren })}
              formatValue={(uren) => `${uren} uur`}
              filled
            />
            <div className="rhc-mox-stack rhc-mox-stack--sm">
              <RangeSlider
                label="3. Heeft de kandidaat naar verwachting een verminderde loonwaarde? Zo ja, hoeveel? (loonwaarde)"
                min={30}
                max={100}
                step={5}
                value={a.loonwaarde}
                onChange={(loonwaarde) => zet({ loonwaarde })}
                formatValue={(loonwaarde) => `${loonwaarde} procent`}
                formatValueText={(loonwaarde) =>
                  loonwaarde === 100
                    ? "100 procent: geen verminderde loonwaarde"
                    : `${loonwaarde} procent`
                }
                filled
                info={
                  <InfoToggletip label="Toelichting bij de loonwaarde">
                    <Paragraph>
                      De loonwaarde is wat de kandidaat in het werk presteert,
                      in vergelijking met een collega zonder beperking in
                      dezelfde functie.
                    </Paragraph>
                    <Paragraph>
                      Onder 100 procent is de loonwaarde verminderd. Bij 100
                      procent is er geen loonkostensubsidie. Ook dan kan de
                      kandidaat begeleiding nodig hebben, zoals een jobcoach.
                    </Paragraph>
                    <Paragraph>
                      De gemeente meet de loonwaarde later op de werkplek.
                    </Paragraph>
                    <Paragraph>
                      Volgens de wet is de loonkostensubsidie altijd het
                      verschil tussen het minimumloon en de loonwaarde. Betaalt
                      u meer dan het minimumloon, dan krijgt u dus niet meer
                      subsidie. Het loonkostenvoordeel is een vast bedrag per
                      verloond uur. Een hoger uurloon maakt alleen uw loonkosten
                      hoger.
                    </Paragraph>
                  </InfoToggletip>
                }
              />
              {wajong && (
                <Paragraph className="rhc-mox-small-text">
                  Bij een Wajong-uitkering: het percentage van het minimumloon
                  dat de kandidaat aankan. UWV stelt dit vast voor de
                  loondispensatie.
                </Paragraph>
              )}
            </div>
            <Fieldset legend="4. Wat wordt het bruto uurloon? (loon)">
              <FormFieldRadio
                name="uurloon"
                value="wml"
                label={`Wettelijk minimumloon: ${euro(WML_UUR_EUROCENT)} per uur`}
                description="Voor iemand van 21 jaar of ouder. Voor jongere werknemers geldt een lager minimumloon; daarmee rekent deze berekening niet."
                checked={!anders}
                onChange={() => {
                  setAnders(false);
                  zet({ uurloon: WML_UUR_EUROCENT });
                }}
              />
              <FormFieldRadio
                name="uurloon"
                value="anders"
                label="Anders, namelijk:"
                checked={anders}
                onChange={() => {
                  setAnders(true);
                  zetLoon(loonTekst);
                }}
              />
              {anders && (
                <FormFieldTextInput
                  name="uurloon-anders"
                  label="Bruto uurloon in euro"
                  inputMode="decimal"
                  autoComplete="off"
                  description="Bijvoorbeeld 16,50"
                  value={loonTekst}
                  invalid={loonFout !== undefined}
                  errorMessage={loonFout}
                  // Het event komt van de input, maar is getypt op de wrapper-div.
                  onChange={(e) =>
                    zetLoon((e.target as HTMLInputElement).value)
                  }
                />
              )}
            </Fieldset>
          </div>
          <div className="rhc-grid__cell rhc-grid__cell-t-5">
            <StickyInfoBox title="Wat het kost en oplevert">
              <Balans antwoorden={a} resultaat={resultaat} />
            </StickyInfoBox>
          </div>
        </div>
      </section>

      <Separator></Separator>

      {overige.length > 0 && (
        <section className="rhc-mox-stack" aria-labelledby="overige">
          <Heading level={2} id="overige">
            Regelingen die verder kunnen gelden
          </Heading>
          <UnorderedList>
            {overige.map((o) => (
              <UnorderedListItem key={o.id}>
                <strong>{OVERIG[o.id].naam}</strong>{" "}
                <InfoToggletip
                  label={`Toelichting bij ${OVERIG[o.id].naam.toLowerCase()}`}
                >
                  Uitkomst van de regelrecht-engine bij uw antwoorden. Of de
                  regeling geldt, beslist de organisatie die haar uitvoert.
                </InfoToggletip>{" "}
                <Uitvoerder id={OVERIG[o.id].uitvoerder} />
                <br />
                {OVERIG[o.id].tekst(o)}
              </UnorderedListItem>
            ))}
          </UnorderedList>
        </section>
      )}

      <Separator></Separator>

      <section className="rhc-mox-stack" aria-labelledby="aanvragen">
        <Heading level={2} id="aanvragen">
          Regelingen aanvragen
        </Heading>
        <Paragraph>
          Wij vullen de aanvragen voor u in met gegevens die al bij de overheid
          bekend zijn. U controleert alles, vult aan wat nog ontbreekt en
          beslist zelf of u de aanvraag verstuurt. Tussendoor opslaan kan.
        </Paragraph>
        <ActionGroup>
          {/* Elke route begint bij de gegevens: toestemming en wat de overheid al weet. */}
          <Link
            href="/personeel/iemand-aannemen/gegevens"
            className="utrecht-button-link utrecht-button-link--html-a utrecht-button-link--primary-action"
            aria-disabled={resultaat.bekend ? undefined : true}
            aria-describedby={resultaat.bekend ? undefined : "aanvragen-bezig"}
            onClick={(event) => {
              if (!resultaat.bekend) event.preventDefault();
            }}
          >
            Aanvraag laten invullen
          </Link>
        </ActionGroup>
        <Paragraph role="status" id="aanvragen-bezig">
          {resultaat.bekend
            ? ""
            : resultaat.fout
              ? "De berekening is niet gelukt. Laad de pagina opnieuw."
              : "De berekening is nog bezig."}
        </Paragraph>
      </section>
    </>
  );
};

export default Vragen;

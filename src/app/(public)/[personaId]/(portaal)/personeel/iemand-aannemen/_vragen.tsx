"use client";

import Link from "next/link";
import {
  ActionGroup,
  Fieldset,
  FormFieldCheckboxOption,
  Heading,
  Paragraph,
  UnorderedList,
  UnorderedListItem,
} from "@/components/rhc";
import RangeSlider from "@/components/RangeSlider";
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

/** Bovengrens van de schuifregelaar voor het uurloon: € 30 per uur. */
const MAX_UURLOON_EUROCENT = 3000;

/** "Regelingen die verder kunnen gelden": naam en uitleg per uitkomst van de engine. */
const OVERIG: Record<
  Overig["id"],
  { naam: string; uitvoerder: UitvoerderId; tekst: (o: Overig) => string }
> = {
  nrp: {
    naam: "No-riskpolis",
    uitvoerder: "uwv",
    tekst: (o) =>
      `Wordt uw werknemer ziek, dan betaalt UWV ziekengeld in plaats van dat u het loon doorbetaalt. ${o.duurJaren === 5 ? "Vijf jaar vanaf de start." : "Zonder einddatum."}`,
  },
  pp_pwet: {
    naam: "Proefplaatsing",
    uitvoerder: "gemeente",
    tekst: () =>
      "De kandidaat werkt eerst twee maanden bij u terwijl de bijstand doorloopt, te verlengen tot zes maanden, als de gemeente instemt.",
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
    tekst: () =>
      "Een jobcoach helpt uw werknemer en u op de werkvloer. U vraagt dit aan bij de gemeente.",
  },
  vz_wia: {
    naam: "Jobcoaching en werkplekaanpassing",
    uitvoerder: "uwv",
    tekst: () =>
      "UWV kan een jobcoach of een aanpassing van de werkplek vergoeden. U vraagt dit aan bij UWV.",
  },
  vz_wajong: {
    naam: "Jobcoaching en werkplekaanpassing",
    uitvoerder: "uwv",
    tekst: () =>
      "Via de Wajong kan UWV een jobcoach of een aanpassing van de werkplek vergoeden. U vraagt dit aan bij UWV.",
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

  return (
    <>
      <Heading level={2}>Wat betekent dit voor {onderneming}?</Heading>
      <Paragraph className="mox-hiring-note">
        Deze berekening blijft op uw scherm. Er gaat niets naar een
        overheidsorganisatie.
      </Paragraph>
      <div className="rhc-grid">
        <div className="rhc-grid__cell rhc-grid__cell-t-7 rhc-mox-row-gap">
          <Fieldset
            legend="1. Wie wilt u aannemen? Kies wat past."
            className="mox-hiring-choices"
          >
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
            label="2. Hoeveel uur per week gaat de kandidaat werken?"
            min={8}
            max={40}
            step={1}
            value={a.uren}
            onChange={(uren) => zet({ uren })}
            formatValue={(uren) => `${uren} uur`}
            filled
          />
          <div>
            <RangeSlider
              label="3. Hoeveel kan de kandidaat?"
              min={30}
              max={100}
              step={5}
              value={a.loonwaarde}
              onChange={(loonwaarde) => zet({ loonwaarde })}
              formatValue={(loonwaarde) => `${loonwaarde} procent`}
              filled
            />
            <Paragraph className="mox-hiring-note">
              {wajong
                ? "Bij een Wajong-uitkering: het percentage van het minimumloon dat de kandidaat aankan. UWV stelt dit vast voor de loondispensatie."
                : "In vergelijking met een collega zonder beperking. Bij 100 procent kan de kandidaat het werk zelfstandig doen en is er geen loonkostensubsidie. De gemeente meet dit later op de werkplek."}
            </Paragraph>
          </div>
          <div>
            <RangeSlider
              label="4. Wat wordt het bruto uurloon?"
              min={WML_UUR_EUROCENT}
              max={MAX_UURLOON_EUROCENT}
              step={1}
              value={Math.min(a.uurloon, MAX_UURLOON_EUROCENT)}
              onChange={(uurloon) => zet({ uurloon })}
              formatValue={euro}
              filled
            />
            <Paragraph className="mox-hiring-note">
              Het wettelijk minimumloon is {euro(WML_UUR_EUROCENT)} per uur. De
              subsidie en het voordeel gaan uit van het minimumloon; een hoger
              uurloon maakt alleen de loonkosten hoger.
            </Paragraph>
          </div>
        </div>
        <aside
          className="rhc-mox-card rhc-grid__cell rhc-grid__cell-t-5"
          aria-label="Wat het kost en oplevert"
        >
          <Balans antwoorden={a} resultaat={resultaat} />
        </aside>
      </div>

      {overige.length > 0 && (
        <section
          className="rhc-mox-card rhc-mox-row-gap"
          aria-labelledby="overige"
        >
          <Heading level={2} id="overige">
            Regelingen die verder kunnen gelden
          </Heading>
          <UnorderedList>
            {overige.map((o) => (
              <UnorderedListItem key={o.id}>
                <strong>{OVERIG[o.id].naam}</strong>{" "}
                <Uitvoerder id={OVERIG[o.id].uitvoerder} />
                <br />
                {OVERIG[o.id].tekst(o)}
              </UnorderedListItem>
            ))}
          </UnorderedList>
          <Paragraph className="mox-hiring-note">
            Uitkomsten van de regelrecht-engine bij uw antwoorden. Of een
            regeling geldt, beslist de organisatie die haar uitvoert.
          </Paragraph>
        </section>
      )}

      <section
        className="rhc-mox-card rhc-mox-row-gap"
        aria-labelledby="aanvragen"
      >
        <Heading level={2} id="aanvragen">
          Wilt u deze regelingen aanvragen?
        </Heading>
        <Paragraph>
          Wij vullen de aanvragen voor u in met gegevens die al bij de overheid
          bekend zijn. U controleert alles, vult aan wat nog ontbreekt en
          beslist zelf of u indient. Tussendoor opslaan kan.
        </Paragraph>
        <ActionGroup>
          {/* Elke route begint bij de gegevens: toestemming en wat de overheid al weet. */}
          <Link
            href="/personeel/iemand-aannemen/gegevens"
            className="utrecht-button-link utrecht-button-link--html-a utrecht-button-link--primary-action mox-hiring-button-link"
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

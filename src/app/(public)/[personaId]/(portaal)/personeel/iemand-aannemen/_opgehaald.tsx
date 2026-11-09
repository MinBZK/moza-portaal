"use client";

import { useState } from "react";
import InfoToggletip from "@/components/InfoToggletip";
import {
  Accordion,
  AccordionSection,
  Heading,
  Paragraph,
} from "@/components/rhc";
import type { DemoAannemen } from "@/demo";
import { Begrip } from "./_begrippen";
import { datumNL } from "./_werkgever";

type Bron = DemoAannemen["bronnen"][number];

/** Bronnen met gegevens over de kandidaat; de rest gaat over de werkgever. */
const OVER_KANDIDAAT: readonly string[] = ["uwv", "gemeente"];

/**
 * Over de kandidaat ziet de werkgever alleen het doelgroepregister: staat
 * erin, ja of nee, en loopt de registratie nog. Zo geeft UWV het ook in het
 * werkgeversportaal. Uitkering, bijstand en de grond van registratie zijn
 * gegevens over gezondheid en inkomen; die gebruiken de gemeente en UWV zelf
 * bij de beoordeling (AVG art. 5, 6 en 9).
 */
const REGISTER: readonly string[] = [
  "is_arbeidsbeperkte",
  "registratie_nog_niet_geeindigd",
];

export const zichtbaarVan = (bron: Bron) =>
  OVER_KANDIDAAT.includes(bron.id)
    ? bron.gegevens.filter((g) => REGISTER.includes(g.parameter))
    : bron.gegevens;

/** "UWV", "UWV en de gemeente": wie gegevens over de kandidaat heeft. */
const opsomming = (namen: string[]) =>
  namen.length < 2
    ? (namen[0] ?? "")
    : `${namen.slice(0, -1).join(", ")} en ${namen[namen.length - 1]}`;

/**
 * Wie in deze situatie gegevens over de kandidaat heeft, en hoe je dat
 * zegt: "UWV" of "UWV en de gemeente", met "kijkt" of "kijken".
 */
export const overKandidaat = (bronnen: Bron[], situatie: string) => {
  const lijst = bronnen.filter(
    (b) =>
      OVER_KANDIDAAT.includes(b.id) &&
      // Zonder aanvraag bij de gemeente kijkt de gemeente nergens naar.
      !(b.id === "gemeente" && situatie === "register"),
  );
  const meer = lijst.length > 1;
  return {
    meer,
    wie: opsomming(
      lijst.map((b) => (b.id === "gemeente" ? "de gemeente" : b.organisatie)),
    ),
    eigen: meer ? "hun eigen gegevens" : "de eigen gegevens",
    zietRegister: lijst.some((b) => zichtbaarVan(b).length > 0),
  };
};

/**
 * Wat de overheid al weet, per organisatie, om te lezen. Controleren gebeurt
 * per regeling, in de panelen eronder; hier staat geen eigen vinkje.
 */
const Opgehaald = ({
  bronnen,
  situatie,
  voornaam,
  uren,
  aanvraag,
}: {
  bronnen: Bron[];
  situatie: string;
  voornaam: string;
  /** De uren uit de antwoorden van de voorbeeldberekening, voor gegevens met "{uren}". */
  uren: number;
  /** Er gaat een aanvraag naar een organisatie (niet alleen uitleg). */
  aanvraag: boolean;
}) => {
  const getoond = bronnen.filter(
    (bron) => bron.id !== "eigen" && zichtbaarVan(bron).length > 0,
  );
  const [open, setOpen] = useState<string[]>([]);
  const { wie, meer, zietRegister } = overKandidaat(bronnen, situatie);
  if (getoond.length === 0) return null;

  return (
    <section className="rhc-mox-row-gap" aria-labelledby="opgehaald">
      <Heading level={2} id="opgehaald">
        Gegevens die de overheid heeft opgehaald
      </Heading>
      <Paragraph>
        {zietRegister
          ? `Over ${voornaam} ziet u alleen of die in het doelgroepregister staat, en sinds wanneer.`
          : `Over ${voornaam} ziet u hier geen gegevens.`}{" "}
        {aanvraag && (
          <>
            {wie.charAt(0).toUpperCase() + wie.slice(1)}{" "}
            {meer ? "gebruiken hun" : "gebruikt de"} eigen gegevens over{" "}
            {voornaam} bij de beoordeling; die ziet u niet. U krijgt wel het
            besluit.
          </>
        )}
      </Paragraph>
      {zietRegister && <Begrip id="doelgroepregister" />}
      <Accordion>
        {getoond.map((bron) => {
          const aantal = zichtbaarVan(bron).length;
          return (
            <AccordionSection
              key={bron.id}
              id={`bron-${bron.id}`}
              headingLevel={3}
              label={`${bron.organisatie}: ${aantal} ${aantal === 1 ? "gegeven" : "gegevens"}`}
              // Het type eist `body`, de component rendert alleen `children`.
              body={null}
              expanded={open.includes(bron.id)}
              onActivate={() =>
                setOpen(
                  open.includes(bron.id)
                    ? open.filter((id) => id !== bron.id)
                    : [...open, bron.id],
                )
              }
            >
              <div className="rhc-mox-row-gap">
                <Paragraph className="rhc-mox-small-text">
                  {bron.register}, opgehaald op {datumNL(bron.opgehaald)}
                </Paragraph>
                {/* The markup of the RHC DataSummary: its component only
                takes text as value, and the toggletip with the law
                question belongs in the value. */}
                <dl className="rhc-data-summary rhc-data-summary--column">
                  {zichtbaarVan(bron).map((g) => (
                    <div key={g.parameter} className="rhc-data-summary__item">
                      <dt className="rhc-data-summary__item-key">{g.vraag}</dt>
                      <dd className="rhc-data-summary__item-value">
                        {g.waarde.replace("{uren}", String(uren))}{" "}
                        <InfoToggletip
                          label={`Zo vraagt de wet het: ${g.vraag}`}
                        >
                          {`Zo vraagt de wet het: “${g.wetsvraag}” (${g.grond})`}
                        </InfoToggletip>
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </AccordionSection>
          );
        })}
      </Accordion>
    </section>
  );
};

export default Opgehaald;

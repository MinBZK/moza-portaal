"use client";

import { useState, type ReactNode } from "react";
import {
  Accordion,
  AccordionSection,
  DataSummary,
  DataSummaryItem,
  Paragraph,
} from "@/components/rhc";
import type { DemoAannemenTrace } from "@/demo";
import { invoerVan } from "./_engine";
import type { Antwoorden } from "./_useAannemen";
import UitlegTaalmodel from "./_uitlegTaalmodel";
import { useBerekening, type Invoer } from "./_useRegelrecht";
import { datumNL, waarde } from "./_werkgever";

/**
 * "Waarom deze uitkomst?" live uit de kern van regelrecht-uitleg, in twee
 * lagen: kort (de beslissende voorwaarden en de berekening in gewone
 * woorden) en de volledige afleiding met per stap de bron. Deterministisch uit de trace, zonder taalmodel; zie
 * Bos, Schuth en Chen, "From Rules as Executed to Citizen Explanation"
 * (JURIX 2026): expliciete beslissende voorwaarden houden de uitleg trouw
 * aan de uitvoering. Met `invoer` (uit invoerVoor) rekent hij die invoer
 * direct, met de antwoorden van de oriëntatie; de `uitleggen` van die invoer
 * bepaalt de afleidingen. Met `trace` rekent hij de trace met overschrijvingen
 * uit de antwoorden. Lukt de engine niet, dan de vooraf berekende
 * tussenstappen (alleen met `trace`).
 */
const Waarom = ({
  trace,
  antwoorden,
  invoer,
  labels,
  bedragOutput,
  regeling,
  kvk,
  headingLevel = 4,
  voorAf,
}: {
  trace?: DemoAannemenTrace;
  /** Nodig bij `trace`, voor de overschrijvingen. */
  antwoorden?: Antwoorden;
  /** Invoer voor de engine; gaat voor op `trace`. */
  invoer?: Invoer;
  labels: Record<string, string>;
  /** De output met het bedrag, als de regeling er een heeft. */
  bedragOutput?: string;
  /** Naam van de regeling, voor het prompt aan het taalmodel. */
  regeling: string;
  /** KVK-nummer van de werkgever: de sessie van de Digitale assistent. */
  kvk: string;
  /** Kopniveau van "Waarom deze uitkomst?". */
  headingLevel?: number;
  /** Bovenaan in de uitklap, zoals hoe de organisatie beslist. */
  voorAf?: ReactNode;
}) => {
  const outputs = invoer
    ? [invoer.output, ...(invoer.uitleggen ?? [])]
    : trace
      ? [trace.uitkomst, ...(bedragOutput ? [bedragOutput] : [])]
      : [];
  // Rekenen pas na het openklappen; daarna blijft de uitkomst staan.
  const [geopend, setGeopend] = useState(false);
  const [open, setOpen] = useState<string[]>([]);
  const wissel = (id: string) => {
    setOpen((nu) =>
      nu.includes(id) ? nu.filter((x) => x !== id) : [...nu, id],
    );
    if (id === "waarom") setGeopend(true);
  };
  const stand = useBerekening(
    !geopend
      ? null
      : (invoer ??
          (trace && antwoorden ? invoerVan(trace, antwoorden, outputs) : null)),
  );
  if (!invoer && !trace) return null;

  const vooraf = trace ? (
    <>
      <Paragraph className="rhc-mox-small-text">
        Vooraf berekend met RegelRecht op peildatum {datumNL(trace.peildatum)},
        wetsversie 1 juli 2026
        {stand.status === "fout" &&
          ` (de berekening in uw browser lukt nu niet: ${stand.fout})`}
        . Tussenstappen:
      </Paragraph>
      <DataSummary appearance="column">
        {Object.entries(trace.tussenuitkomsten).map(([naam, w]) => (
          <DataSummaryItem
            key={naam}
            itemKey={labels[naam] ?? naam}
            itemValue={waarde(naam, w)}
          />
        ))}
      </DataSummary>
    </>
  ) : (
    <Paragraph className="rhc-mox-small-text">
      De berekening in uw browser lukt nu niet
      {stand.status === "fout" && `: ${stand.fout}`}. Laad de pagina opnieuw.
    </Paragraph>
  );

  const heeftKort =
    stand.status === "klaar" &&
    outputs.some((o) =>
      (stand.waarde.afleidingen[o]?.tekst.kort ?? []).some((r) => !r.technisch),
    );

  return (
    <Accordion>
      <AccordionSection
        headingLevel={headingLevel}
        label="Waarom deze uitkomst?"
        // Het type eist `body`, de component rendert alleen `children`.
        body={null}
        expanded={open.includes("waarom")}
        onActivate={() => wissel("waarom")}
      >
        <div className="rhc-mox-stack">
          {voorAf}
          {stand.status === "laden" && (
            <Paragraph role="status">Wij rekenen de wet na…</Paragraph>
          )}
          {stand.status === "fout" && vooraf}
          {stand.status === "klaar" && heeftKort && (
            <>
              {outputs.map((o) => {
                const a = stand.waarde.afleidingen[o];
                if (!a) return null;
                const kort = a.tekst.kort.filter((r) => !r.technisch);
                return (
                  <div key={o} className="rhc-mox-row-gap">
                    {kort.map((r) => (
                      <Paragraph key={r.tekst}>{r.tekst}</Paragraph>
                    ))}
                  </div>
                );
              })}
              <Paragraph className="rhc-mox-small-text">
                Deze uitleg volgt uit de wet, zoals die geldt op 1 juli 2026.
                Elke zin komt uit een stap van de wet, niet van een taalmodel.
              </Paragraph>
              <UitlegTaalmodel
                berekening={stand.waarde}
                outputs={outputs}
                regeling={regeling}
                kvk={kvk}
              />
            </>
          )}
          {/* De afleiding stap voor stap is voor de ondernemer niet leesbaar;
              zonder korte uitleg verwijzen we naar het artikel bij de regeling. */}
          {stand.status === "klaar" && !heeftKort && !voorAf && (
            <Paragraph>
              Voor deze regeling is er nog geen korte uitleg. Het wetsartikel
              staat hierboven bij de regeling.
            </Paragraph>
          )}
        </div>
      </AccordionSection>
    </Accordion>
  );
};

export default Waarom;

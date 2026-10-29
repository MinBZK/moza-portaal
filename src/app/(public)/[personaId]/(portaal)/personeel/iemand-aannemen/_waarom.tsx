"use client";

import { useState } from "react";
import {
  Accordion,
  AccordionSection,
  DataSummary,
  DataSummaryItem,
  Paragraph,
  UnorderedList,
  UnorderedListItem,
} from "@/components/rhc";
import type { DemoAannemenTrace } from "@/demo";
import { invoerVan } from "./_engine";
import type { Antwoorden } from "./_useAannemen";
import UitlegTaalmodel from "./_uitlegTaalmodel";
import { useBerekening, type Invoer } from "./_useRegelrecht";
import { datumNL, waarde } from "./_werkgever";

/**
 * "Waarom deze uitkomst?" live uit de kern van regelrecht-uitleg, in drie
 * lagen: kort (de beslissende voorwaarden en de berekening in gewone
 * woorden), de motivering per artikel ("… want …") en de volledige afleiding
 * met per stap de bron. Deterministisch uit de trace, zonder taalmodel; zie
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
  /** Kopniveau van "Waarom deze uitkomst?"; de lagen eronder een niveau dieper. */
  headingLevel?: number;
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
        Vooraf berekend door de regelrecht-engine op peildatum{" "}
        {datumNL(trace.peildatum)}, wetsversie 1 juli 2026
        {stand.status === "fout" &&
          ` (de engine in de browser is niet beschikbaar: ${stand.fout})`}
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
      De engine in de browser is niet beschikbaar
      {stand.status === "fout" && `: ${stand.fout}`}. Probeer de pagina opnieuw
      te laden.
    </Paragraph>
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
          {stand.status === "laden" && (
            <Paragraph role="status">De regelrecht-engine rekent…</Paragraph>
          )}
          {stand.status === "fout" && vooraf}
          {stand.status === "klaar" && (
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
              <Accordion>
                <AccordionSection
                  headingLevel={headingLevel + 1}
                  label="Motivering per artikel"
                  body={null}
                  expanded={open.includes("motivering")}
                  onActivate={() => wissel("motivering")}
                >
                  <UnorderedList>
                    {outputs.flatMap((o) =>
                      (stand.waarde.afleidingen[o]?.tekst.motivering ?? [])
                        .filter((r) => !r.technisch)
                        .map((r) => (
                          <UnorderedListItem key={`${o}-${r.tekst}`}>
                            {r.tekst}
                          </UnorderedListItem>
                        )),
                    )}
                  </UnorderedList>
                </AccordionSection>
                <AccordionSection
                  headingLevel={headingLevel + 1}
                  label="Volledige afleiding, stap voor stap"
                  body={null}
                  expanded={open.includes("afleiding")}
                  onActivate={() => wissel("afleiding")}
                >
                  <ol className="rhc-mox-stack rhc-mox-stack--sm rhc-mox-small-text">
                    {outputs.flatMap((o) =>
                      (stand.waarde.afleidingen[o]?.tekst.volledig ?? [])
                        .filter((r) => !r.technisch)
                        .map((r, n) => (
                          <li
                            key={`${o}-${n}`}
                            style={{
                              paddingInlineStart: `${r.diepte * 1.25}rem`,
                            }}
                          >
                            {r.tekst}
                            {r.bron && (
                              <small className="rhc-mox-small-text">
                                {" "}
                                · {r.bron}
                              </small>
                            )}
                          </li>
                        )),
                    )}
                  </ol>
                </AccordionSection>
              </Accordion>
              <Paragraph className="rhc-mox-small-text">
                Afgeleid uit de uitvoering door de regelrecht-engine in uw
                browser, wetsversie 1 juli 2026. De tekst hierboven komt niet
                van een taalmodel: elke zin komt uit een stap van de wet.
              </Paragraph>
              <UitlegTaalmodel
                berekening={stand.waarde}
                outputs={outputs}
                regeling={regeling}
                kvk={kvk}
              />
            </>
          )}
        </div>
      </AccordionSection>
    </Accordion>
  );
};

export default Waarom;

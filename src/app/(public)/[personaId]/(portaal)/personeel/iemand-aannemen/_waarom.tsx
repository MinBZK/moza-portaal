"use client";

import { DataSummary, DataSummaryItem, Paragraph } from "@/components/rhc";
import type { DemoAannemenTrace } from "@/demo";
import { invoerVan } from "./_engine";
import type { Antwoorden } from "./_useAannemen";
import UitlegTaalmodel from "./_uitlegTaalmodel";
import { useBerekening } from "./_useRegelrecht";
import { datumNL, waarde } from "./_werkgever";

/**
 * "Waarom deze uitkomst?" live uit de kern van regelrecht-uitleg, in drie
 * lagen: kort (de beslissende voorwaarden en de berekening in gewone
 * woorden), de motivering per artikel ("… want …") en de volledige afleiding
 * met per stap de bron. Deterministisch uit de trace, zonder taalmodel; zie
 * Bos, Schuth en Chen, "From Rules as Executed to Citizen Explanation"
 * (JURIX 2026): expliciete beslissende voorwaarden houden de uitleg trouw
 * aan de uitvoering. Lukt de engine niet, dan de vooraf berekende
 * tussenstappen.
 */
const Waarom = ({
  trace,
  antwoorden,
  labels,
  bedragOutput,
  regeling,
  kvk,
}: {
  trace: DemoAannemenTrace | undefined;
  antwoorden: Antwoorden;
  labels: Record<string, string>;
  /** De output met het bedrag, als de regeling er een heeft. */
  bedragOutput?: string;
  /** Naam van de regeling, voor het prompt aan het taalmodel. */
  regeling: string;
  /** KVK-nummer van de werkgever: de sessie van de Digitale assistent. */
  kvk: string;
}) => {
  const outputs = trace
    ? [trace.uitkomst, ...(bedragOutput ? [bedragOutput] : [])]
    : [];
  const stand = useBerekening(
    trace ? invoerVan(trace, antwoorden, outputs) : null,
  );
  if (!trace) return null;

  const vooraf = (
    <>
      <Paragraph className="mox-hiring-note">
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
  );

  return (
    <details className="mox-hiring-why">
      <summary>Waarom deze uitkomst?</summary>
      <div>
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
            <details>
              <summary>Motivering per artikel</summary>
              <ul className="mox-hiring-reasoning">
                {outputs.flatMap((o) =>
                  (stand.waarde.afleidingen[o]?.tekst.motivering ?? [])
                    .filter((r) => !r.technisch)
                    .map((r) => <li key={`${o}-${r.tekst}`}>{r.tekst}</li>),
                )}
              </ul>
            </details>
            <details>
              <summary>Volledige afleiding, stap voor stap</summary>
              <ol className="mox-hiring-derivation">
                {outputs.flatMap((o) =>
                  (stand.waarde.afleidingen[o]?.tekst.volledig ?? [])
                    .filter((r) => !r.technisch)
                    .map((r, n) => (
                      <li
                        key={`${o}-${n}`}
                        style={{ paddingInlineStart: `${r.diepte * 1.25}rem` }}
                      >
                        {r.tekst}
                        {r.bron && (
                          <span className="mox-hiring-note"> · {r.bron}</span>
                        )}
                      </li>
                    )),
                )}
              </ol>
            </details>
            <Paragraph className="mox-hiring-note">
              Afgeleid uit de uitvoering door de regelrecht-engine in uw
              browser, wetsversie 1 juli 2026. Geen taalmodel: elke zin komt uit
              een stap van de wet.
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
    </details>
  );
};

export default Waarom;

"use client";

import Link from "next/link";
import {
  ActionGroup,
  Alert,
  DataSummary,
  DataSummaryItem,
  Heading,
  Paragraph,
} from "@/components/rhc";
import type { DemoAannemenRegeling, DemoAannemenTrace } from "@/demo";
import { alleBronnenBevestigd, useAannemen } from "../_useAannemen";
import LiveBedrag from "./_liveBedrag";
import { datumNL, waarde } from "../_werkgever";

/** Regelingen met een bedrag dat de engine live in de browser uitrekent. */
const LIVE: Record<string, { output: string; per: string }> = {
  lks: { output: "hoogte_lks_eurocent_per_maand", per: "per maand" },
  lkv: { output: "hoogte_lkv_per_jaar_eurocent", per: "per jaar" },
};

/** Eén kaart per regeling, met "Waarom dit geldt" uit de engine-trace. */
const Regelingen = ({
  regelingen,
  traces,
  labels,
}: {
  regelingen: DemoAannemenRegeling[];
  traces: Record<string, DemoAannemenTrace>;
  labels: Record<string, string>;
}) => {
  const { staat } = useAannemen();
  return (
    <>
      {staat && !alleBronnenBevestigd(staat) && (
        <Alert type="warning">
          <Paragraph>
            U heeft nog niet alle bronnen bevestigd.{" "}
            <Link
              href="/personeel/iemand-aannemen/gegevens"
              className="utrecht-link utrecht-link--html-a"
            >
              Ga terug naar de gegevens per bron
            </Link>
            .
          </Paragraph>
        </Alert>
      )}
      {regelingen.map((r) => {
        const t = traces[r.trace];
        return (
          <section
            key={r.id}
            className="mox-card rhc-row-gap"
            aria-labelledby={`regeling-${r.id}`}
          >
            <Heading level={2} id={`regeling-${r.id}`}>
              {r.naam}
              <span
                className={`mox-hiring-label${r.soort === "niet" ? " mox-hiring-label--not-applicable" : ""}`}
              >
                {r.soortLabel}
              </span>
            </Heading>
            <Paragraph>{r.organisatie}</Paragraph>
            <DataSummary appearance="column">
              <DataSummaryItem itemKey="Uitkomst" itemValue={r.uitkomst} />
              {r.bedragLabel && (
                <DataSummaryItem
                  itemKey="Wat het oplevert"
                  itemValue={[r.bedragLabel, r.bedragToelichting]
                    .filter(Boolean)
                    .join(". ")}
                />
              )}
            </DataSummary>
            {t && LIVE[r.id] && (
              <LiveBedrag
                trace={t}
                bedragOutput={LIVE[r.id].output}
                perTekst={LIVE[r.id].per}
                labels={labels}
              />
            )}
            <Paragraph>{r.tekst}</Paragraph>
            <details className="mox-hiring-why">
              <summary>Waarom dit geldt</summary>
              <div>
                <Paragraph>
                  <strong>Grond:</strong> {r.grond}.
                </Paragraph>
                {t && (
                  <>
                    <Paragraph>
                      Berekend door de regelrecht-engine op peildatum{" "}
                      {datumNL(t.peildatum)}, wetsversie 1 juli 2026.
                      Tussenstappen:
                    </Paragraph>
                    <DataSummary appearance="column">
                      {Object.entries(t.tussenuitkomsten).map(([naam, w]) => (
                        <DataSummaryItem
                          key={naam}
                          itemKey={labels[naam] ?? naam}
                          itemValue={waarde(naam, w)}
                        />
                      ))}
                    </DataSummary>
                  </>
                )}
              </div>
            </details>
            {r.actie && (
              <ActionGroup>
                <Link
                  href={r.actie.url}
                  className="utrecht-button-link utrecht-button-link--html-a utrecht-button-link--primary-action"
                >
                  {r.actie.label}
                </Link>
              </ActionGroup>
            )}
          </section>
        );
      })}
    </>
  );
};

export default Regelingen;

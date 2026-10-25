"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import {
  ActionGroup,
  Alert,
  Button,
  DataSummary,
  DataSummaryItem,
  Heading,
  OrderedList,
  OrderedListItem,
  Paragraph,
} from "@/components/rhc";
import type { DemoAannemen, DemoAannemenBron, DemoAannemenTrace } from "@/demo";
import {
  faseIndex,
  zaakVan,
  useAannemen,
} from "../../../personeel/iemand-aannemen/_useAannemen";
import { datumNL, waarde } from "../../../personeel/iemand-aannemen/_werkgever";

const Besluit = ({
  zaak,
  kandidaat,
  berekening,
  bronnen,
  trace,
  labels,
}: {
  zaak: DemoAannemen["zaak"];
  kandidaat: DemoAannemen["kandidaat"];
  berekening: NonNullable<DemoAannemen["berekeningLks"]>;
  bronnen: DemoAannemenBron[];
  trace: DemoAannemenTrace | undefined;
  labels: Record<string, string>;
}) => {
  const { staat, werkZaakBij } = useAannemen();
  const [melding, setMelding] = useState("");
  const [tekst, setTekst] = useState("");
  if (!staat) return null;
  const zaakStand = zaakVan(staat, "gemeente");

  if (!zaakStand.ingediend || faseIndex(zaakStand.fase) < 4)
    return (
      <Alert type="info">
        <Paragraph>
          Er is nog geen besluit op deze aanvraag.{" "}
          <Link href={zaak.url} className="utrecht-link utrecht-link--html-a">
            Bekijk de voortgang van de zaak
          </Link>
          .
        </Paragraph>
      </Alert>
    );

  const verstuurVraag = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const vraag = (tekst || zaakStand.vraag || "").trim();
    if (!vraag) {
      setMelding("Typ eerst uw vraag.");
      return;
    }
    werkZaakBij("gemeente", {
      vraag,
      fase: faseIndex(zaakStand.fase) < 4 ? "besluit" : zaakStand.fase,
    });
    setMelding(
      "Uw vraag is verstuurd en staat in de zaak. De gemeente antwoordt binnen vijf werkdagen.",
    );
  };

  return (
    <div className="rhc-mox-card rhc-mox-row-gap">
      <Link href={zaak.url} className="utrecht-link utrecht-link--html-a">
        Terug naar de zaak
      </Link>
      <Heading level={1}>
        Besluit: loonkostensubsidie voor {kandidaat.voornaam}{" "}
        {kandidaat.achternaam}
      </Heading>

      <DataSummary appearance="column">
        <DataSummaryItem
          itemKey="Genomen door"
          itemValue="College van burgemeester en wethouders van Lansingerland"
        />
        <DataSummaryItem itemKey="Datum" itemValue="3 november 2026" />
        <DataSummaryItem itemKey="Kenmerk" itemValue={zaak.nummer} />
        <DataSummaryItem itemKey="Regel" itemValue={zaak.regel} />
        <DataSummaryItem
          itemKey="Loonwaarde"
          itemValue="60 procent van het wettelijk minimumloon, vastgesteld op 27 oktober 2026"
        />
      </DataSummary>

      <section aria-labelledby="besluit-tekst">
        <Heading level={2} id="besluit-tekst">
          Besluit
        </Heading>
        <Paragraph>
          Het college kent u loonkostensubsidie toe voor {kandidaat.voornaam}{" "}
          {kandidaat.achternaam}: <strong>€ 897,41 per maand</strong>, vanaf 1
          oktober 2026, bij een dienstbetrekking van 32 uur per week tegen het
          wettelijk minimumloon. De subsidie wordt maandelijks betaald en per 1
          januari opnieuw berekend bij wijziging van het minimumloon.
        </Paragraph>
      </section>

      <section aria-labelledby="besluit-berekening">
        <Heading level={2} id="besluit-berekening">
          Berekening
        </Heading>
        <Paragraph>
          Dezelfde berekening als u vooraf zag, nu met de vastgestelde
          loonwaarde.
        </Paragraph>
        <DataSummary appearance="column">
          {berekening.stappen.map((s) => (
            <DataSummaryItem
              key={s.parameter}
              itemKey={`${s.label} (${s.grond})`}
              itemValue={s.waarde}
            />
          ))}
        </DataSummary>
        <details className="mox-hiring-why">
          <summary>Waarom: de gegevens en de stappen van de berekening</summary>
          <div>
            <Heading level={3}>Gegevens die zijn gebruikt</Heading>
            <DataSummary appearance="column">
              {bronnen.flatMap((b) =>
                b.gegevens.map((g) => (
                  <DataSummaryItem
                    key={`${b.id}-${g.parameter}`}
                    itemKey={g.vraag}
                    itemValue={`${g.waarde} · ${b.organisatie}, ${datumNL(b.opgehaald)}`}
                  />
                )),
              )}
            </DataSummary>
            {trace && (
              <>
                <Heading level={3}>Stappen van de regelrecht-engine</Heading>
                <Paragraph>
                  Artikel 10d van de Participatiewet, wetsversie{" "}
                  {datumNL(trace.peildatum)}; minimumloon uit artikel 8 en 15
                  van de Wet minimumloon. Elke stap is een uitkomst van de wet,
                  in de volgorde van het artikel.
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
                <details>
                  <summary>
                    Volledige trace ({trace.stappen.length} stappen)
                  </summary>
                  <OrderedList className="mox-hiring-trace">
                    {trace.stappen.map((s, n) => (
                      <OrderedListItem key={n}>
                        {s.tekst}
                        {s.artikel && ` (artikel ${s.artikel})`}
                      </OrderedListItem>
                    ))}
                  </OrderedList>
                </details>
              </>
            )}
          </div>
        </details>
      </section>

      <section aria-labelledby="besluit-bezwaar">
        <Heading level={2} id="besluit-bezwaar">
          Niet eens met dit besluit?
        </Heading>
        <Paragraph>
          U kunt binnen zes weken na 3 november 2026 bezwaar maken bij het
          college van burgemeester en wethouders van Lansingerland (Algemene wet
          bestuursrecht, artikel 6:7). Heeft u eerst een vraag? Stel die
          hieronder; de gemeente antwoordt in deze zaak.
        </Paragraph>
        <form onSubmit={verstuurVraag} className="rhc-mox-row-gap">
          <label className="utrecht-form-label" htmlFor="da-vraag">
            Klopt dit niet? Stel uw vraag
          </label>
          <textarea
            id="da-vraag"
            className="utrecht-textarea utrecht-textarea--html-textarea mox-hiring-control"
            rows={3}
            placeholder="Bijvoorbeeld: telt de vergoeding voor werkgeverslasten niet mee in het bedrag?"
            defaultValue={zaakStand.vraag ?? ""}
            onChange={(event) => setTekst(event.target.value)}
          />
          <ActionGroup>
            <Button type="submit" appearance="primary-action-button">
              Verstuur uw vraag
            </Button>
          </ActionGroup>
          <Paragraph role="status">
            {melding ||
              (zaakStand.vraag
                ? "Uw vraag is verstuurd op 3 november 2026 en staat in de zaak. De gemeente antwoordt binnen vijf werkdagen."
                : "")}
          </Paragraph>
        </form>
      </section>
    </div>
  );
};

export default Besluit;

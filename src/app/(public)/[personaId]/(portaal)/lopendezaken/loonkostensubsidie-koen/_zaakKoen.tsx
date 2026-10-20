"use client";

import Link from "next/link";
import {
  Alert,
  Button,
  DataSummary,
  DataSummaryItem,
  Heading,
  Paragraph,
  UnorderedList,
  UnorderedListItem,
} from "@/components/rhc";
import type {
  DemoAannemen,
  DemoAannemenFase,
  DemoAannemenGebeurtenis,
  DemoZaakStap,
} from "@/demo";
import StatusTrack from "../_statusTrack";
import ZakenTabs from "../_zakenTabs";
import {
  FASEN,
  faseIndex,
  statusTekst,
  useAannemen,
  wisAannemen,
  type Fase,
} from "../../personeel/iemand-aannemen/_useAannemen";
import { datumNL } from "../../personeel/iemand-aannemen/_werkgever";

const STAP_INDEX: Record<DemoAannemenGebeurtenis["stap"], number> = {
  vooraf: 0,
  indicatie: 0,
  ontvangst: 1,
  meting: 2,
  loonwaarde: 3,
  besluit: 4,
  antwoord: 5,
  betaling: 6,
};

const EVENT_KIND: Record<DemoAannemenGebeurtenis["soort"], string> = {
  regelgeving: "regulation",
  besluit: "decision",
  uitvoering: "execution",
};

const SOORT: Record<DemoAannemenGebeurtenis["soort"], string> = {
  regelgeving: "Regelgeving",
  besluit: "Besluit",
  uitvoering: "Uitvoering",
};

/** De voortgang als stappen voor StatusTrack, afhankelijk van de stand. */
const voortgang = (fase: Fase, zaakUrl: string): DemoZaakStap[] => {
  const i = faseIndex(fase);
  const stappen: { fase: Fase; titel: string; datum: string; tekst: string }[] =
    [
      {
        fase: "ontvangst",
        titel: "Verstuurd en ontvangen",
        datum: "5 en 6 oktober 2026",
        tekst:
          "U heeft de aanvraag verstuurd. De gemeente heeft hem ontvangen en in behandeling genomen onder zaaknummer LLD-LKS-2026-0417.",
      },
      {
        fase: "meting",
        titel: "Loonwaarde gemeten",
        datum: "20 oktober 2026",
        tekst:
          "Een arbeidsdeskundige van de gemeente heeft de loonwaarde van Koen gemeten op de werkplek.",
      },
      {
        fase: "loonwaarde",
        titel: "Loonwaarde vastgesteld",
        datum: "27 oktober 2026",
        tekst:
          "Het college heeft de loonwaarde vastgesteld op 60 procent van het wettelijk minimumloon.",
      },
      {
        fase: "besluit",
        titel: "Besluit genomen",
        datum: "3 november 2026",
        tekst: `Loonkostensubsidie toegekend: € 897,41 per maand vanaf 1 oktober 2026. Bekijk het besluit via de link onder de voortgang.`,
      },
      {
        fase: "betaling",
        titel: "Eerste betaling",
        datum: "27 november 2026",
        tekst: "Oktober en november zijn betaald: € 1.794,82.",
      },
    ];
  void zaakUrl;
  return stappen.map((s) => {
    const fi = faseIndex(s.fase);
    const huidig = fi === i || (i === 5 && fi === 4);
    return {
      titel: s.titel,
      soort: fi < i ? "voltooid" : huidig ? "huidig" : "later",
      datum: s.datum,
      open: huidig,
      tekst: [s.tekst],
    };
  });
};

const ZaakKoen = ({
  zaak,
  kandidaat,
  fasen,
  gebeurtenissen,
  komtHierna,
}: {
  zaak: DemoAannemen["zaak"];
  kandidaat: DemoAannemen["kandidaat"];
  fasen: DemoAannemenFase[];
  gebeurtenissen: DemoAannemenGebeurtenis[];
  komtHierna: DemoAannemen["komtHierna"];
}) => {
  const { staat, werkBij } = useAannemen();
  if (!staat) return null;
  const i = faseIndex(staat.fase);

  const onderzoeker = (
    <section
      className="mox-card mox-hiring-research rhc-row-gap"
      aria-labelledby="onderzoeker"
    >
      <Heading level={2} id="onderzoeker">
        Voor de onderzoeker
      </Heading>
      <label className="utrecht-form-label" htmlFor="da-fase">
        Toon de zaak op het moment
      </label>
      <select
        id="da-fase"
        className="utrecht-select utrecht-select--html-select mox-hiring-control"
        value={FASEN[i]}
        onChange={(event) =>
          werkBij({
            fase: event.target.value as Fase,
            ingediend: true,
            verstuurdOp: staat.verstuurdOp ?? "2026-10-05",
          })
        }
      >
        {fasen
          .filter((f) => f.id !== "indicatie")
          .map((f) => (
            <option key={f.id} value={f.id}>
              {f.label}
            </option>
          ))}
      </select>
      <Button appearance="secondary-action-button" onClick={wisAannemen}>
        Begin het scenario opnieuw
      </Button>
    </section>
  );

  if (!staat.ingediend)
    return (
      <>
        <Alert type="info">
          <Paragraph>
            Deze zaak bestaat nog niet: de aanvraag is nog niet verstuurd.{" "}
            <Link
              href="/personeel/iemand-aannemen/concept-aanvraag"
              className="utrecht-link utrecht-link--html-a"
            >
              Bekijk de concept-aanvraag
            </Link>
            .
          </Paragraph>
        </Alert>
        {onderzoeker}
      </>
    );

  return (
    <>
      <div className="mox-card rhc-row-gap">
        <ZakenTabs actief="lopend" />
        <Heading level={1}>{zaak.onderwerp}</Heading>

        <section aria-labelledby="zaak-gegevens">
          <Heading level={2} id="zaak-gegevens">
            Over deze zaak
          </Heading>
          <DataSummary appearance="column">
            <DataSummaryItem
              itemKey="Organisatie"
              itemValue={zaak.organisatie}
            />
            <DataSummaryItem itemKey="Zaaknummer" itemValue={zaak.nummer} />
            <DataSummaryItem itemKey="Verstuurd" itemValue="5 oktober 2026" />
            <DataSummaryItem itemKey="Regel" itemValue={zaak.regel} />
            <DataSummaryItem itemKey="Status" itemValue={statusTekst(staat)} />
          </DataSummary>
        </section>

        <section aria-labelledby="zaak-voortgang">
          <Heading level={2} id="zaak-voortgang">
            Voortgang
          </Heading>
          <StatusTrack stappen={voortgang(staat.fase, zaak.url)} />
          {i >= 4 && (
            <Paragraph>
              <Link
                href={`${zaak.url}/besluit`}
                className="utrecht-link utrecht-link--html-a"
              >
                Bekijk het besluit van 3 november 2026
              </Link>
            </Paragraph>
          )}
        </section>

        <section aria-labelledby="zaak-tijdlijn">
          <Heading level={2} id="zaak-tijdlijn">
            Alles wat is vastgelegd
          </Heading>
          <Paragraph>
            Nieuwste bovenaan. Elke regel is een vastlegging: regelgeving, een
            besluit of een stap in de uitvoering, met wie het vastlegde en
            wanneer. Een correctie vervangt niets; de oude regel blijft staan
            met de nieuwe erboven.
          </Paragraph>
          <ol className="mox-hiring-timeline">
            {[...gebeurtenissen]
              .reverse()
              .filter((g) => STAP_INDEX[g.stap] <= i)
              .map((g) => (
                <li
                  key={g.id}
                  className={`mox-hiring-event mox-hiring-event--${EVENT_KIND[g.soort]}${g.gecorrigeerdDoor ? " mox-hiring-event--corrected" : ""}`}
                >
                  <p className="mox-hiring-event-kind">
                    {SOORT[g.soort]}
                    {g.herstelt && (
                      <span className="mox-hiring-label mox-hiring-label--correction">
                        Correctie
                      </span>
                    )}
                    {g.gecorrigeerdDoor && (
                      <span className="mox-hiring-label mox-hiring-label--not-applicable">
                        Gecorrigeerd
                      </span>
                    )}
                  </p>
                  <Heading level={3}>
                    {g.url ? (
                      <Link
                        href={g.url}
                        className="utrecht-link utrecht-link--html-a"
                      >
                        {g.titel}
                      </Link>
                    ) : (
                      g.titel
                    )}
                  </Heading>
                  {g.tekst && (
                    <Paragraph>
                      {g.id === "g13" && staat.vraag
                        ? `“${staat.vraag}”`
                        : g.tekst}
                    </Paragraph>
                  )}
                  <p className="mox-hiring-event-meta">
                    Vastgelegd door {g.actor} op {datumNL(g.datum)} om {g.tijd}
                    {g.grond && ` · ${g.grond}`}
                    {g.herstelt && " · vervangt de afspraak hieronder"}
                    {g.gecorrigeerdDoor && " · gecorrigeerd, zie hierboven"}
                  </p>
                </li>
              ))}
          </ol>
        </section>

        <section aria-labelledby="zaak-hierna">
          <Heading level={2} id="zaak-hierna">
            Komt hierna
          </Heading>
          <UnorderedList>
            {komtHierna.map((k) => (
              <UnorderedListItem key={k.datum}>
                <strong>{datumNL(k.datum)}</strong>, {k.actor}: {k.titel}
                {k.tekst && ` ${k.tekst}`} ({k.grond})
              </UnorderedListItem>
            ))}
          </UnorderedList>
        </section>
        <Paragraph>
          Kandidaat: {kandidaat.voornaam} {kandidaat.achternaam},{" "}
          {kandidaat.woonplaats}.
        </Paragraph>
      </div>
      {onderzoeker}
    </>
  );
};

export default ZaakKoen;

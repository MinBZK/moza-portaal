"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import InfoToggletip from "@/components/InfoToggletip";
import {
  ActionGroup,
  Alert,
  Button,
  DataSummary,
  DataSummaryItem,
  Heading,
  Paragraph,
} from "@/components/rhc";
import type { DemoAannemen, DemoAannemenSituatie } from "@/demo";
import basis from "../../../../personeel/iemand-aannemen/_basisfeiten.json";
import {
  antwoordenVoorZaak,
  besluitGeldt,
  faseIndex,
  ingangLoondispensatie,
  waardenVoor,
} from "../../../../personeel/iemand-aannemen/_route";
import {
  invoerVoor,
  type Feiten,
} from "../../../../personeel/iemand-aannemen/_uitkomsten";
import {
  STANDAARD_ANTWOORDEN,
  uurloonTekst,
  useAannemen,
  zaakVan,
} from "../../../../personeel/iemand-aannemen/_useAannemen";
import { useUitkomsten } from "../../../../personeel/iemand-aannemen/_useUitkomsten";
import Waarom from "../../../../personeel/iemand-aannemen/_waarom";
import { INGEDIEND_OP } from "../../../../personeel/iemand-aannemen/_zaakStart";
import { datumNL } from "../../../../personeel/iemand-aannemen/_werkgever";

/** Waar het besluit over gaat: de engine-uitkomst van de regeling en de fase met de vaststelling. */
const REGELING = {
  gemeente: {
    naam: "Loonkostensubsidie",
    wet: "participatiewet",
    output: "heeft_recht_op_lks",
    vaststelling: "loonwaarde",
    vraagVoorbeeld:
      "Bijvoorbeeld: telt de vergoeding voor werkgeverslasten niet mee in het bedrag?",
  },
  wajong: {
    naam: "Loondispensatie",
    wet: "wet_arbeidsongeschiktheidsvoorziening_jonggehandicapten",
    output: "heeft_recht_op_loondispensatie",
    vaststelling: "percentage",
    vraagVoorbeeld: "Bijvoorbeeld: hoe is het percentage vastgesteld?",
  },
} as const;

const Besluit = ({
  situatie,
  demo,
  kvk,
}: {
  situatie: Exclude<DemoAannemenSituatie, "wia">;
  demo: DemoAannemen;
  kvk: string;
}) => {
  const { staat, werkZaakBij } = useAannemen();
  // Het besluit rekent met de antwoorden van het indienen, niet met die van nu.
  const antwoorden = staat
    ? antwoordenVoorZaak(staat.zaken[situatie], staat.antwoorden)
    : STANDAARD_ANTWOORDEN;
  const { uitkomsten, bekend, fout } = useUitkomsten(antwoorden);
  const invoer = useMemo(
    () =>
      invoerVoor(antwoorden, basis as Feiten).find(
        (i) =>
          i.wet === REGELING[situatie].wet &&
          i.output === REGELING[situatie].output,
      ),
    [antwoorden, situatie],
  );
  const [melding, setMelding] = useState("");
  const [tekst, setTekst] = useState("");
  const { zaak, kandidaat, besluit, fasen, dienstverband } = demo;
  const kop = (
    <Heading level={1}>
      Besluit: {REGELING[situatie].naam.toLowerCase()} voor {kandidaat.voornaam}{" "}
      {kandidaat.achternaam}
    </Heading>
  );
  // Ook voordat de opgeslagen staat er is, heeft de pagina een kop.
  if (!staat || !besluit) return kop;

  const regeling = REGELING[situatie];
  const zaakStand = zaakVan(staat, situatie);
  const w = waardenVoor(antwoorden, uitkomsten);
  const vastgesteldOp = fasen.find((f) => f.id === regeling.vaststelling);
  const heeftRegel = besluitGeldt(situatie, uitkomsten);

  if (
    !zaakStand.ingediend ||
    faseIndex(zaakStand.fase, fasen) < faseIndex("besluit", fasen)
  )
    return (
      <>
        {kop}
        <Alert type="info">
          <Paragraph>
            Er is nog geen besluit op deze aanvraag.{" "}
            <Link href={zaak.url} className="utrecht-link utrecht-link--html-a">
              Bekijk de voortgang van de zaak
            </Link>
            .
          </Paragraph>
        </Alert>
      </>
    );

  const verstuurVraag = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const vraag = (tekst || zaakStand.vraag || "").trim();
    if (!vraag) {
      setMelding("Typ eerst uw vraag.");
      return;
    }
    werkZaakBij(situatie, { vraag });
    setMelding("Uw vraag is verstuurd en staat in de zaak.");
  };

  const ingangLd = datumNL(
    ingangLoondispensatie(zaakStand.verstuurdOp ?? INGEDIEND_OP),
  );
  const dienstverbandTekst = `een dienstbetrekking van ${w.uren} uur per week (uurloon: ${uurloonTekst(antwoorden)})`;

  return (
    <div className="rhc-mox-card rhc-mox-row-gap">
      <Link href={zaak.url} className="utrecht-link utrecht-link--html-a">
        Terug naar de zaak
      </Link>
      {kop}

      <DataSummary appearance="column">
        <DataSummaryItem
          itemKey="Genomen door"
          itemValue={besluit.organisatie}
        />
        <DataSummaryItem itemKey="Datum" itemValue={datumNL(besluit.datum)} />
        <DataSummaryItem itemKey="Kenmerk" itemValue={zaak.nummer} />
        <DataSummaryItem itemKey="Regel" itemValue={zaak.regel} />
        <DataSummaryItem
          itemKey={situatie === "gemeente" ? "Loonwaarde" : "Percentage"}
          itemValue={`${w.loonwaarde} van het wettelijk minimumloon${vastgesteldOp ? `, vastgesteld op ${datumNL(vastgesteldOp.datum)}` : ""}`}
        />
      </DataSummary>

      {!bekend ? (
        <Paragraph role="status">
          {fout
            ? "Wij kunnen de bedragen nu niet berekenen. Laad de pagina opnieuw."
            : "Wij berekenen de bedragen…"}
        </Paragraph>
      ) : !heeftRegel ? (
        <Alert type="warning">
          <Paragraph>
            Bij de antwoorden in de aanvraag geeft de berekening geen{" "}
            {regeling.naam.toLowerCase()}. Daarom is er geen besluit. Denkt u
            dat dit niet klopt? Stel hieronder uw vraag.
          </Paragraph>
        </Alert>
      ) : (
        <section className="rhc-mox-stack" aria-labelledby="besluit-tekst">
          <Heading level={2} id="besluit-tekst">
            Besluit
          </Heading>
          {situatie === "gemeente" ? (
            <Paragraph>
              Het college kent u loonkostensubsidie toe voor{" "}
              {kandidaat.voornaam} {kandidaat.achternaam}:{" "}
              <strong>{w.lksPerMaand} per maand</strong>, vanaf{" "}
              {datumNL(dienstverband.aanvang)}, bij {dienstverbandTekst}. Het
              college stelt de hoogte elk jaar per 1 januari opnieuw vast. Dat
              volgt de ontwikkeling van het minimumloon. Het college kan de
              loonwaarde ook later opnieuw vaststellen. Verandert de loonwaarde,
              dan past het college de subsidie aan.
            </Paragraph>
          ) : (
            <>
              <Paragraph>
                UWV verleent loondispensatie voor {kandidaat.voornaam}{" "}
                {kandidaat.achternaam}, bij {dienstverbandTekst}. U mag dan
                minder betalen dan het minimumloon. Het percentage is{" "}
                <strong>{w.loonwaarde}</strong> van het wettelijk minimumloon.{" "}
                {kandidaat.voornaam} heeft recht op ten minste{" "}
                <strong>{w.aanspraakPerUur} per uur</strong>.
              </Paragraph>
              <div className="mox-hiring-note">
                {/* Besluit loondispensatie Wajong 4: eerste dag van de maand van de aanvraag. */}
                De loondispensatie geldt vanaf {ingangLd}. Dat is de eerste dag
                van de maand van de aanvraag. Ze geldt voor de periode die naar
                verwachting nodig is, ten hoogste vijf jaar. Verlenging is
                mogelijk.{" "}
                <InfoToggletip label="Toelichting bij de termijn van het besluit">
                  UWV beslist binnen een redelijke termijn. Die termijn is ten
                  hoogste acht weken. Lukt dat niet, dan laat UWV weten wanneer
                  het besluit komt. De datum van dit besluit is voor het
                  prototype aangenomen.
                </InfoToggletip>
              </div>
            </>
          )}
        </section>
      )}

      <section className="rhc-mox-stack" aria-labelledby="besluit-berekening">
        <Heading level={2} id="besluit-berekening">
          Berekening
        </Heading>
        <Paragraph>
          Dezelfde berekening als u vooraf zag, nu met{" "}
          {situatie === "gemeente"
            ? "de vastgestelde loonwaarde"
            : "het vastgestelde percentage"}
          .
        </Paragraph>
        <Waarom
          invoer={invoer}
          antwoorden={antwoorden}
          regeling={regeling.naam}
          kvk={kvk}
          labels={demo.labels}
        />
      </section>

      <section className="rhc-mox-stack" aria-labelledby="besluit-bezwaar">
        {/* Bezwaar kan alleen tegen een besluit; zonder besluit blijft de vraag.
            Tijdens het rekenen blijft de kop staan, zoals de zaak (geldt). */}
        {!bekend || heeftRegel ? (
          <>
            <Heading level={2} id="besluit-bezwaar">
              Niet eens met dit besluit?
            </Heading>
            <Paragraph>
              Dan kunt u bezwaar maken bij {besluit.organisatie}. Doe dat binnen{" "}
              {besluit.bezwaar} na {datumNL(besluit.datum)} (Algemene wet
              bestuursrecht, artikel 6:7). Heeft u eerst een vraag? Stel die
              hieronder. Uw vraag komt dan in deze zaak.
            </Paragraph>
          </>
        ) : (
          <Heading level={2} id="besluit-bezwaar">
            Een vraag over deze aanvraag?
          </Heading>
        )}
        <form
          onSubmit={verstuurVraag}
          className="rhc-mox-stack rhc-mox-stack--2xl"
        >
          <label className="utrecht-form-label" htmlFor="da-vraag">
            Klopt dit niet? Stel uw vraag
          </label>
          <textarea
            id="da-vraag"
            className="utrecht-textarea utrecht-textarea--html-textarea mox-hiring-control"
            rows={3}
            placeholder={regeling.vraagVoorbeeld}
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
                ? "Uw vraag is verstuurd en staat in de zaak."
                : "")}
          </Paragraph>
        </form>
      </section>
    </div>
  );
};

export default Besluit;

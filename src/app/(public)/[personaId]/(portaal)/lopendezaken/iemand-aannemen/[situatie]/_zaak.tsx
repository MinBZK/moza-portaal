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
  DemoAannemenGebeurtenis,
  DemoAannemenSituatie,
  DemoZaakStap,
} from "@/demo";
import InfoToggletip from "@/components/InfoToggletip";
import StatusTrack from "../../_statusTrack";
import ZakenTabs from "../../_zakenTabs";
import {
  faseIndex,
  vulSjabloon,
  waardenVoor,
} from "../../../personeel/iemand-aannemen/_route";
import type { TaakStand } from "../../../personeel/iemand-aannemen/_route";
import { INGEDIEND_OP } from "../../../personeel/iemand-aannemen/_zaakStart";
import {
  STANDAARD_ANTWOORDEN,
  statusTekst,
  useAannemen,
  wisAannemen,
  zaakVan,
} from "../../../personeel/iemand-aannemen/_useAannemen";
import { useUitkomsten } from "../../../personeel/iemand-aannemen/_useUitkomsten";
import { datumNL } from "../../../personeel/iemand-aannemen/_werkgever";

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

/**
 * Fasen die geen eigen stap in de voortgang zijn: de stand vóór de aanvraag
 * en het antwoord op een vraag bij het besluit (dat hoort bij de stap ervoor).
 */
const NEVENFASEN = ["indicatie", "antwoord"];

/** De taak van de werknemer (doelgroepverklaring) hoort bij een fase van de WIA-zaak. */
const TAAK_BIJ_FASE: Record<string, TaakStand> = {
  wacht: "open",
  aangevraagd: "aangevraagd",
  verstrekt: "verstrekt",
};
const FASE_BIJ_TAAK: Record<TaakStand, string> = {
  open: "wacht",
  aangevraagd: "aangevraagd",
  verstrekt: "verstrekt",
};
const TAAK_LABEL: Record<TaakStand, string> = {
  open: "Open: de werknemer heeft nog niet aangevraagd",
  aangevraagd: "Aangevraagd: UWV behandelt de aanvraag",
  verstrekt: "Verstrekt: UWV heeft de doelgroepverklaring afgegeven",
};

const Zaak = ({
  situatie,
  demo,
}: {
  situatie: DemoAannemenSituatie;
  demo: DemoAannemen;
}) => {
  const { staat, werkBij, werkZaakBij } = useAannemen();
  const antwoorden = staat?.antwoorden ?? STANDAARD_ANTWOORDEN;
  const { uitkomsten, bekend, fout } = useUitkomsten(antwoorden);
  if (!staat) return null;

  const { zaak, kandidaat, fasen, gebeurtenissen, komtHierna, besluit } = demo;
  const zaakStand = zaakVan(staat, situatie);
  const i = faseIndex(zaakStand.fase, fasen);
  const w = waardenVoor(antwoorden, uitkomsten);
  const vulIn = (tekst: string) => vulSjabloon(tekst, w);
  const taak = staat.taken.doelgroepverklaring ?? "open";

  const zetFase = (fase: string) => {
    werkZaakBij(situatie, {
      fase,
      ingediend: true,
      verstuurdOp: zaakStand.verstuurdOp ?? INGEDIEND_OP,
    });
    if (situatie === "wia" && fase in TAAK_BIJ_FASE)
      werkBij({
        taken: { ...staat.taken, doelgroepverklaring: TAAK_BIJ_FASE[fase] },
      });
  };

  const onderzoeker = (
    <section
      className="rhc-mox-card mox-hiring-research rhc-mox-row-gap"
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
        value={fasen[i].id}
        onChange={(event) => zetFase(event.target.value)}
      >
        {fasen
          .filter((f) => f.id !== "indicatie")
          .map((f) => (
            <option key={f.id} value={f.id}>
              {f.label}
            </option>
          ))}
      </select>
      {situatie === "wia" && (
        <>
          <label className="utrecht-form-label" htmlFor="da-taak">
            Taak van de werknemer: doelgroepverklaring
          </label>
          <select
            id="da-taak"
            className="utrecht-select utrecht-select--html-select mox-hiring-control"
            value={taak}
            onChange={(event) =>
              zetFase(FASE_BIJ_TAAK[event.target.value as TaakStand])
            }
          >
            {(Object.keys(TAAK_LABEL) as TaakStand[]).map((t) => (
              <option key={t} value={t}>
                {TAAK_LABEL[t]}
              </option>
            ))}
          </select>
        </>
      )}
      <Button appearance="secondary-action-button" onClick={wisAannemen}>
        Begin het scenario opnieuw
      </Button>
    </section>
  );

  if (!zaakStand.ingediend)
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

  // Elke gebeurtenis na "vooraf" hoort bij een fase; zichtbaar zodra de zaak er is.
  const zichtbaar = gebeurtenissen.filter(
    (g) => g.stap === "vooraf" || faseIndex(g.stap, fasen) <= i,
  );

  // De stappen van de voortgang: elke fase die een eigen stap is.
  const stapFasen = fasen.filter((f) => !NEVENFASEN.includes(f.id));
  const stapVan = (faseId: string) => {
    const nr = faseIndex(faseId, fasen);
    let k = -1;
    stapFasen.forEach((f, n) => {
      if (faseIndex(f.id, fasen) <= nr) k = n;
    });
    return k;
  };
  const huidig = stapVan(zaakStand.fase);
  const stappen: DemoZaakStap[] = stapFasen.map((f, k) => {
    const soort = k < huidig ? "voltooid" : k === huidig ? "huidig" : "later";
    const tekst = zichtbaar
      .filter((g) => g.stap !== "vooraf" && stapVan(g.stap) === k)
      .map((g) => vulIn(g.titel));
    return {
      titel: f.label.replace(/\s*\(.*\)\s*$/, ""),
      soort,
      datum: soort === "later" ? undefined : datumNL(f.datum),
      open: soort === "huidig",
      tekst,
    };
  });

  const besluitBereikt =
    besluit !== undefined && i >= faseIndex("besluit", fasen);

  return (
    <>
      <div className="rhc-mox-card rhc-mox-row-gap">
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
            {situatie === "wia" ? (
              <DataSummaryItem
                itemKey="Aangevraagd door"
                itemValue="De werknemer"
              />
            ) : (
              <DataSummaryItem
                itemKey="Verstuurd"
                itemValue={datumNL(zaakStand.verstuurdOp ?? INGEDIEND_OP)}
              />
            )}
            <DataSummaryItem itemKey="Regel" itemValue={zaak.regel} />
            <DataSummaryItem
              itemKey="Status"
              itemValue={statusTekst(zaakStand, situatie)}
            />
          </DataSummary>
        </section>

        {fout && (
          <Alert type="warning">
            <Paragraph>
              De bedragen konden niet worden berekend. Laad de pagina opnieuw.
            </Paragraph>
          </Alert>
        )}
        {!bekend && !fout ? (
          <Paragraph role="status">De bedragen worden berekend…</Paragraph>
        ) : (
          <>
            <section aria-labelledby="zaak-voortgang">
              <Heading level={2} id="zaak-voortgang">
                Voortgang
              </Heading>
              <StatusTrack stappen={stappen} />
              {fasen.some((f) => f.label.includes("aanname")) && (
                // Een div: de Toggletip is een <details> en mag niet in een <p>.
                <div className="mox-hiring-note">
                  Een deel van de momenten is een aanname.{" "}
                  <InfoToggletip label="Toelichting bij de aanname over de termijn">
                    De wet noemt geen termijn waarbinnen UWV beslist. De
                    momenten met &ldquo;aanname&rdquo; zijn voor dit prototype
                    aangenomen.
                  </InfoToggletip>
                </div>
              )}
              {besluitBereikt && (
                <Paragraph>
                  <Link
                    href={`${zaak.url}/besluit`}
                    className="utrecht-link utrecht-link--html-a"
                  >
                    Bekijk het besluit van {datumNL(besluit.datum)}
                  </Link>
                </Paragraph>
              )}
            </section>

            <section aria-labelledby="zaak-tijdlijn">
              <Heading level={2} id="zaak-tijdlijn">
                Alles wat is vastgelegd
              </Heading>
              <Paragraph>
                Nieuwste bovenaan. Elke regel is een vastlegging: regelgeving,
                een besluit of een stap in de uitvoering, met wie het vastlegde
                en wanneer. Een correctie vervangt niets; de oude regel blijft
                staan met de nieuwe erboven.
              </Paragraph>
              <ol className="mox-hiring-timeline">
                {[...zichtbaar].reverse().map((g) => (
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
                          {vulIn(g.titel)}
                        </Link>
                      ) : (
                        vulIn(g.titel)
                      )}
                    </Heading>
                    {g.tekst && (
                      <Paragraph>
                        {/* De vraag bij het besluit staat in de zaak als de werkgever hem stelde. */}
                        {g.id === "g13" && zaakStand.vraag
                          ? `“${zaakStand.vraag}”`
                          : vulIn(g.tekst)}
                      </Paragraph>
                    )}
                    <p className="mox-hiring-event-meta">
                      Vastgelegd door {g.actor} op {datumNL(g.datum)} om{" "}
                      {g.tijd}
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
                    <strong>{datumNL(k.datum)}</strong>, {k.actor}:{" "}
                    {vulIn(k.titel)}
                    {k.tekst && ` ${vulIn(k.tekst)}`} ({k.grond})
                  </UnorderedListItem>
                ))}
              </UnorderedList>
            </section>
          </>
        )}
        <Paragraph>
          Kandidaat: {kandidaat.voornaam} {kandidaat.achternaam},{" "}
          {kandidaat.woonplaats}.
        </Paragraph>
      </div>
      {onderzoeker}
    </>
  );
};

export default Zaak;

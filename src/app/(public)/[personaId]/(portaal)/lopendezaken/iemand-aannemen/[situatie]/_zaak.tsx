"use client";

import LoadingStatus from "@/components/LoadingStatus";
import { PageTools } from "@/app/(public)/_flags/pageTools";
import Link from "next/link";
import {
  Alert,
  DataSummary,
  DataSummaryItem,
  FormFieldSelect,
  Heading,
  Paragraph,
  SelectOption,
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
import StatusTrack from "@/components/StatusTrack";
import TextBadge from "@/components/TextBadge";
import TimelineItem, { type TimelineStatus } from "@/components/TimelineItem";
import ZakenTabs from "../../_zakenTabs";
import {
  antwoordenVoorZaak,
  besluitGeldt,
  faseIndex,
  ingangLoondispensatie,
  onderwerpVoor,
  vulSjabloon,
  waardenVoor,
} from "../../../personeel/iemand-aannemen/_route";
import type { TaakStand } from "../../../personeel/iemand-aannemen/_route";
import { INGEDIEND_OP } from "../../../personeel/iemand-aannemen/_zaakStart";
import {
  STANDAARD_ANTWOORDEN,
  statusTekst,
  useAannemen,
  zaakVan,
} from "../../../personeel/iemand-aannemen/_useAannemen";
import { useUitkomsten } from "../../../personeel/iemand-aannemen/_useUitkomsten";
import { datumNL } from "../../../personeel/iemand-aannemen/_werkgever";

/** State on the timeline per kind of event; a correction is a warning. */
const EVENT_KIND: Record<DemoAannemenGebeurtenis["soort"], TimelineStatus> = {
  regelgeving: "neutral",
  besluit: "ok",
  uitvoering: "info",
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

/** De gebeurtenis in het gemeente-bestand die de vraag bij het besluit toont. */
const VRAAG_ID = "g13";

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
  // De zaak rekent met de antwoorden van het indienen, niet met die van nu.
  const antwoorden = staat
    ? antwoordenVoorZaak(staat.zaken[situatie], staat.antwoorden)
    : STANDAARD_ANTWOORDEN;
  const { uitkomsten, bekend, fout } = useUitkomsten(antwoorden);
  // Ook voordat de opgeslagen staat er is, heeft de pagina een kop.
  if (!staat)
    return (
      <>
        <Heading level={1}>{demo.zaak.onderwerp}</Heading>
      </>
    );

  const { zaak, kandidaat, fasen, gebeurtenissen, komtHierna, besluit } = demo;
  const zaakStand = zaakVan(staat, situatie);
  const i = faseIndex(zaakStand.fase, fasen);
  const w = {
    ...waardenVoor(antwoorden, uitkomsten),
    ingangLoondispensatie: datumNL(
      ingangLoondispensatie(zaakStand.verstuurdOp ?? INGEDIEND_OP),
    ),
  };
  const vulIn = (tekst: string) => vulSjabloon(tekst, w);
  const taak = staat.taken.doelgroepverklaring ?? "open";
  const onderwerp = bekend
    ? onderwerpVoor(
        situatie,
        zaak.onderwerp,
        `${kandidaat.voornaam} ${kandidaat.achternaam}`,
        uitkomsten,
      )
    : (zaakStand.onderwerp ?? zaak.onderwerp);

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

  // For the team: in the Flags panel, not on the page itself.
  const onderzoeker = (
    <PageTools title="zaak">
      <FormFieldSelect
        label="Toon de zaak op het moment"
        value={fasen[i].id}
        onChange={(event) => zetFase(event.target.value)}
      >
        {fasen
          .filter((f) => f.id !== "indicatie")
          .map((f) => (
            <SelectOption key={f.id} value={f.id}>
              {f.label}
            </SelectOption>
          ))}
      </FormFieldSelect>
      {situatie === "wia" && (
        <FormFieldSelect
          label="Taak van de werknemer: doelgroepverklaring"
          value={taak}
          onChange={(event) =>
            zetFase(FASE_BIJ_TAAK[event.target.value as TaakStand])
          }
        >
          {(Object.keys(TAAK_LABEL) as TaakStand[]).map((t) => (
            <SelectOption key={t} value={t}>
              {TAAK_LABEL[t]}
            </SelectOption>
          ))}
        </FormFieldSelect>
      )}
    </PageTools>
  );

  if (!zaakStand.ingediend)
    return (
      <>
        <Heading level={1}>{onderwerp}</Heading>
        <Alert type="info">
          <Paragraph>
            Dit dossier bestaat nog niet: u heeft de aanvraag nog niet
            verstuurd.{" "}
            <Link
              href="/personeel/iemand-aannemen/concept-aanvraag"
              className="utrecht-link utrecht-link--html-a"
            >
              Ga naar Controleren en versturen
            </Link>
            .
          </Paragraph>
        </Alert>
        {onderzoeker}
      </>
    );

  // Zonder de regel van de situatie in de uitkomsten (bijvoorbeeld loonwaarde
  // 100 bij de gemeente) toont de zaak geen besluit en niets daarna.
  const geldt = !bekend || besluitGeldt(situatie, uitkomsten);
  const besluitNr = faseIndex("besluit", fasen);
  const grens = geldt || !besluit ? fasen.length : besluitNr;
  const toonFase = (faseId: string) => faseIndex(faseId, fasen) < grens;

  // Geeft de engine geen loonkostenvoordeel (zoals bij beschut werk, Wtl 2.2
  // lid 2 b), dan noemt de zaak het ook niet.
  const heeftLkv = !bekend || uitkomsten.regels.some((r) => r.id === "lkv");
  const isWtl = (grond: string) => grond.startsWith("Wtl");
  const zonderLkv = (g: DemoAannemenGebeurtenis): DemoAannemenGebeurtenis =>
    heeftLkv || !isWtl(g.grond)
      ? g
      : {
          ...g,
          tekst: g.tekst
            .split(/(?<=\.)\s+/)
            .filter((zin) => !zin.includes("loonkostenvoordeel"))
            .join(" "),
          grond: "",
        };
  const hierna = komtHierna.filter((k) => heeftLkv || !isWtl(k.grond));

  // Elke gebeurtenis na "vooraf" hoort bij een fase; zichtbaar zodra de zaak er is.
  const zichtbaar = gebeurtenissen
    .filter(
      (g) =>
        g.stap === "vooraf" ||
        (faseIndex(g.stap, fasen) <= i && toonFase(g.stap)),
    )
    .map(zonderLkv);
  // De vraag bij het besluit staat ook in de tijdlijn als het demo-bestand
  // er geen eigen gebeurtenis voor heeft (alleen bij een zichtbaar besluit).
  if (
    zaakStand.vraag &&
    besluit &&
    geldt &&
    i >= besluitNr &&
    !gebeurtenissen.some((g) => g.id === VRAAG_ID)
  ) {
    const na = zichtbaar.findLastIndex((g) => g.stap === "besluit");
    zichtbaar.splice(na + 1, 0, {
      id: "vraag",
      datum: "",
      tijd: "",
      actor: "U",
      soort: "uitvoering",
      titel: "Uw vraag bij het besluit",
      tekst: `“${zaakStand.vraag}”`,
      grond: "",
      stap: "besluit",
    });
  }

  // De stappen van de voortgang: elke fase die een eigen stap is.
  const stapFasen = fasen.filter(
    (f) => !NEVENFASEN.includes(f.id) && toonFase(f.id),
  );
  const stapVan = (faseId: string) => {
    const nr = faseIndex(faseId, fasen);
    let k = -1;
    stapFasen.forEach((f, n) => {
      if (faseIndex(f.id, fasen) <= nr) k = n;
    });
    return k;
  };
  const huidig = Math.min(stapVan(zaakStand.fase), stapFasen.length - 1);
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

  const besluitBereikt = besluit !== undefined && geldt && i >= besluitNr;

  return (
    <>
      <div className="rhc-mox-card rhc-mox-row-gap">
        <ZakenTabs actief="lopend" />
        <Heading level={1}>{onderwerp}</Heading>

        <section className="rhc-mox-stack" aria-labelledby="zaak-gegevens">
          <Heading level={2} id="zaak-gegevens">
            Over dit dossier
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
            <DataSummaryItem itemKey="Wet en artikel" itemValue={zaak.regel} />
            <DataSummaryItem
              itemKey="Status"
              itemValue={statusTekst(
                geldt || !toonFase(zaakStand.fase)
                  ? {
                      ...zaakStand,
                      fase: geldt ? zaakStand.fase : fasen[besluitNr - 1].id,
                    }
                  : zaakStand,
                situatie,
              )}
            />
          </DataSummary>
        </section>

        {!geldt && (
          <Alert type="warning">
            <Paragraph>
              Met uw antwoorden krijgt u geen{" "}
              {situatie === "gemeente"
                ? "loonkostensubsidie"
                : "loondispensatie"}
              . Daarom neemt {situatie === "gemeente" ? "de gemeente" : "UWV"}{" "}
              geen besluit. Denkt u dat dit niet klopt? Stel dan een vraag over
              deze aanvraag.
            </Paragraph>
          </Alert>
        )}
        {fout && (
          <Alert type="warning">
            <Paragraph>
              Wij kunnen de bedragen nu niet berekenen. Laad de pagina opnieuw.
            </Paragraph>
          </Alert>
        )}
        {!bekend && !fout ? (
          <LoadingStatus>Wij berekenen de bedragen…</LoadingStatus>
        ) : (
          <>
            <section className="rhc-mox-stack" aria-labelledby="zaak-voortgang">
              <Heading level={2} id="zaak-voortgang">
                Voortgang
              </Heading>
              <StatusTrack stappen={stappen} />
              {fasen.some((f) => f.label.includes("aanname")) && (
                // Een div: de Toggletip is een <details> en mag niet in een <p>.
                <div className="rhc-mox-small-text">
                  Een deel van de momenten is een aanname.{" "}
                  <InfoToggletip label="Toelichting bij de aanname over de termijn">
                    {situatie === "wajong"
                      ? "UWV beslist binnen een redelijke termijn. Die termijn is hoogstens 14 weken (Wajong, artikel 6:1)."
                      : `${situatie === "gemeente" ? "De gemeente" : "UWV"} beslist binnen een redelijke termijn. Na 8 weken is die voorbij (Algemene wet bestuursrecht, artikel 4:13).`}{" "}
                    Lukt dat niet, dan krijgt u bericht wanneer het besluit
                    komt. De momenten met &ldquo;aanname&rdquo; zijn voor deze
                    proef aangenomen.
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

            <section className="rhc-mox-stack" aria-labelledby="zaak-tijdlijn">
              <Heading level={2} id="zaak-tijdlijn">
                Alles wat is vastgelegd
              </Heading>
              <Paragraph>
                Nieuwste bovenaan. Elke regel is een stap die iemand heeft
                vastgelegd: regelgeving, een besluit of een stap in de
                uitvoering, met wie het vastlegde en wanneer. Een correctie
                vervangt niets; de oude regel blijft staan met de nieuwe
                erboven.
              </Paragraph>
              <ol className="rhc-mox-timeline">
                {[...zichtbaar].reverse().map((g, index) => (
                  <TimelineItem
                    key={g.id}
                    title={vulIn(g.titel)}
                    date={
                      g.datum ? `${datumNL(g.datum)} om ${g.tijd}` : undefined
                    }
                    status={g.herstelt ? "warning" : EVENT_KIND[g.soort]}
                    open={index === 0}
                    replaced={Boolean(g.gecorrigeerdDoor)}
                  >
                    <p className="rhc-mox-cluster rhc-mox-small-text">
                      {SOORT[g.soort]}
                      {g.herstelt && (
                        <TextBadge variant="warning">Correctie</TextBadge>
                      )}
                      {g.gecorrigeerdDoor && (
                        <TextBadge>Gecorrigeerd</TextBadge>
                      )}
                    </p>
                    {g.tekst && (
                      <Paragraph>
                        {/* De vraag bij het besluit staat in de zaak als de werkgever hem stelde. */}
                        {g.id === VRAAG_ID && zaakStand.vraag
                          ? `“${zaakStand.vraag}”`
                          : vulIn(g.tekst)}
                      </Paragraph>
                    )}
                    {g.url && (
                      <Paragraph>
                        <Link
                          href={g.url}
                          className="utrecht-link utrecht-link--html-a"
                        >
                          Bekijk het besluit
                        </Link>
                      </Paragraph>
                    )}
                    <p className="rhc-mox-small-text">
                      Vastgelegd door {g.actor}
                      {g.grond && `; ${g.grond}`}
                      {g.herstelt && "; vervangt de afspraak hieronder"}
                      {g.gecorrigeerdDoor && "; gecorrigeerd, zie hierboven"}
                    </p>
                  </TimelineItem>
                ))}
              </ol>
            </section>

            {hierna.length > 0 && (
              <section className="rhc-mox-stack" aria-labelledby="zaak-hierna">
                <Heading level={2} id="zaak-hierna">
                  Komt hierna
                </Heading>
                <UnorderedList>
                  {hierna.map((k) => (
                    <UnorderedListItem key={k.datum}>
                      {/* De Wtl noemt uiterste data: vóór 15 maart, vóór 1 augustus. */}
                      <strong>Vóór {datumNL(k.datum)}</strong>, {k.actor}:{" "}
                      {vulIn(k.titel)}
                      {k.tekst && ` ${vulIn(k.tekst)}`} ({k.grond})
                    </UnorderedListItem>
                  ))}
                </UnorderedList>
              </section>
            )}
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

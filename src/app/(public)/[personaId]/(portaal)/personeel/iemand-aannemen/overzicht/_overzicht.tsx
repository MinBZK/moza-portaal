"use client";

import Link from "next/link";
import { useMemo, type ReactNode } from "react";
import {
  ActionGroup,
  DataSummary,
  DataSummaryItem,
  Heading,
  Paragraph,
} from "@/components/rhc";
import InfoToggletip from "@/components/InfoToggletip";
import basis from "../_basisfeiten.json";
import {
  AANNAMES,
  Aanname,
  duurTekst,
  lkvDuurTekst,
  Uitvoerder,
  VOORBEHOUD,
  type UitvoerderId,
} from "../_balans";
import { overzichtTekst, routeVoor, type TaakId } from "../_route";
import {
  DOELGROEPEN,
  invoerVoor,
  lkvVoorbehoud,
  type Doelgroep,
  type Feiten,
} from "../_uitkomsten";
import {
  bronBevestigd,
  BRONNEN,
  useAannemen,
  type AannemenStaat,
  type BronId,
} from "../_useAannemen";
import { useUitkomsten } from "../_useUitkomsten";
import Waarom from "../_waarom";
import { euro } from "../_werkgever";

/** Naam van de organisatie achter elke bron die de ondernemer kan delen. */
const BRON_NAAM: Record<BronId, string> = {
  uwv: "UWV",
  gemeente: "Gemeente",
  kvk: "KVK",
  belastingdienst: "Belastingdienst",
  eigen: "Uw eigen gegevens",
};

const TAAK: Record<TaakId, { kop: string; tekst: string }> = {
  doelgroepverklaring: {
    kop: "Doelgroepverklaring aanvragen",
    tekst:
      "De werknemer vraagt de doelgroepverklaring zelf aan bij UWV, binnen drie maanden na de start. U bewaart de verklaring bij de loonadministratie. Zonder verklaring kunt u het loonkostenvoordeel niet krijgen (Wet tegemoetkomingen loondomein 2.7).",
  },
  vz_wajong: {
    kop: "Jobcoach of werkplekaanpassing aanvragen",
    tekst:
      "De werknemer vraagt een jobcoach of een aanpassing van de werkplek zelf aan bij UWV, als dat nodig is (Wajong 2:22). U kunt dit niet namens de werknemer aanvragen in dit portaal.",
  },
  vz_wia: {
    kop: "Jobcoach of werkplekaanpassing aanvragen",
    tekst:
      "De werknemer vraagt een jobcoach of een aanpassing van de werkplek zelf aan bij UWV, als dat nodig is (Wet WIA 35). U kunt dit niet namens de werknemer aanvragen in dit portaal. Duurt het dienstverband ten minste zes maanden, dan kunt u bij UWV zelf subsidie vragen voor de extra kosten van voorzieningen (Wet WIA 36). Daarvoor gelden meer voorwaarden. De kosten moeten bijvoorbeeld hoger zijn dan een drempelbedrag. UWV beslist of u de subsidie krijgt.",
  },
  // Pwet 6 h en 8a lid 2 d: vóór de eerste werkdag, toestemming aan de kandidaat.
  pp: {
    kop: "Proefplaats: toestemming vragen aan de gemeente",
    tekst:
      "Een proefplaats is onbetaald werk bij u, vóór de eerste werkdag. De proefplaats duurt twee maanden. Verlengen kan met ten hoogste vier maanden. De kandidaat vraagt de gemeente om toestemming. Dat gaat buiten de aanvraag om.",
  },
};

/** Uitleg per doelgroep zonder aanvraag, met de teksten van de (i) in de oriëntatie. */
const UITLEG: Partial<Record<Doelgroep, { kop: string; tekst: string }>> = {
  beschut: {
    kop: "Beschut werk",
    tekst: `${AANNAMES.beschut_lks.uitleg} De gemeente regelt de beschutte werkplek. Neem contact op met de gemeente. In het portaal is er geen aanvraag.`,
  },
  geen: { kop: "Geen van deze", tekst: AANNAMES.geen.uitleg },
};

const Kaart = ({
  id,
  kop,
  uitvoerder,
  children,
}: {
  id: string;
  kop: string;
  /** Wie de regeling uitvoert: het label naast de kop. */
  uitvoerder?: UitvoerderId;
  children: ReactNode;
}) => (
  <section className="rhc-mox-card rhc-mox-row-gap" aria-labelledby={id}>
    <Heading level={3} id={id}>
      {kop} {uitvoerder && <Uitvoerder id={uitvoerder} />}
    </Heading>
    {children}
  </section>
);

type Props = { labels: Record<string, string>; kvk: string };

const Overzicht = (props: Props) => {
  const { staat } = useAannemen();
  // De inhoud rekent met de engine; dat mag pas als de opslag gelezen is.
  if (!staat) return null;
  return <OverzichtInhoud staat={staat} {...props} />;
};

/**
 * Routes zonder aanvraag van de werkgever: alleen het doelgroepregister,
 * een uitleg (beschut werk, geen van deze of niets gekozen) of
 * antwoorden waarbij de engine niets meer laat aanvragen.
 */
const OverzichtInhoud = ({
  staat,
  labels,
  kvk,
}: Props & { staat: AannemenStaat }) => {
  const a = staat.antwoorden;
  const invoeren = useMemo(() => invoerVoor(a, basis as Feiten), [a]);
  const lkvInvoer = invoeren.find(
    (i) => i.wet === "wet_tegemoetkomingen_loondomein",
  );
  const gedeeld = BRONNEN.filter((id) => bronBevestigd(staat, id));
  const resultaat = useUitkomsten(a);
  const { uitkomsten, bekend } = resultaat;
  const route = useMemo(
    () => routeVoor(a.doelgroepen, uitkomsten),
    [a.doelgroepen, uitkomsten],
  );
  const { situatie } = route;
  const lkv = uitkomsten.regels.find((r) => r.id === "lkv");
  const nrp = uitkomsten.overige.find((o) => o.id === "nrp");
  const uitleg = a.doelgroepen.flatMap((d) => {
    const u = UITLEG[d];
    return u ? [{ ...u, id: d }] : [];
  });

  return (
    <>
      {/* Volgens de engine is er wel iets aan te vragen: verwijs naar de aanvraag. */}
      {bekend && !route.overzicht ? (
        <Paragraph>
          Bij deze antwoorden kunt u een aanvraag versturen.{" "}
          <Link
            href="/personeel/iemand-aannemen/gegevens"
            className="utrecht-link utrecht-link--html-a"
          >
            Vul de aanvraag in
          </Link>
        </Paragraph>
      ) : (
        <Paragraph role={bekend ? undefined : "status"}>
          {resultaat.fout
            ? "De engine in de browser kan nu niet rekenen. Laad de pagina opnieuw."
            : !bekend
              ? "De regelrecht-engine rekent uit wat voor u geldt…"
              : overzichtTekst(route)}
        </Paragraph>
      )}

      {bekend && uitleg.length > 0 && (
        <section className="rhc-mox-row-gap" aria-labelledby="uitleg">
          <Heading level={2} id="uitleg">
            Wat voor deze situatie geldt
          </Heading>
          {uitleg.map((u) => (
            <Kaart key={u.id} id={`uitleg-${u.id}`} kop={u.kop}>
              <Paragraph>{u.tekst}</Paragraph>
            </Kaart>
          ))}
        </section>
      )}

      {bekend && route.taken.length > 0 && (
        <section className="rhc-mox-row-gap" aria-labelledby="taken-werknemer">
          <Heading level={2} id="taken-werknemer">
            Taken voor de werknemer
          </Heading>
          {route.taken.map((t) => (
            <Kaart key={t} id={`taak-${t}`} kop={TAAK[t].kop}>
              <Paragraph>{TAAK[t].tekst}</Paragraph>
            </Kaart>
          ))}
        </section>
      )}

      {bekend && route.vanzelf.length > 0 && (
        <section className="rhc-mox-row-gap" aria-labelledby="vanzelf">
          <Heading level={2} id="vanzelf">
            Gaat vanzelf of via de loonaangifte
          </Heading>
          {route.vanzelf.includes("lkv") && (
            <Kaart
              id="vanzelf-lkv"
              kop="Loonkostenvoordeel"
              uitvoerder="loonaangifte"
            >
              {lkv && (
                <p className="mox-hiring-amount">
                  {euro(lkv.bedragPerJaar)}{" "}
                  <span className="mox-hiring-note">per jaar</span>
                </p>
              )}
              {lkv?.aanname && <Aanname id={lkv.aanname} />}
              <Paragraph>
                {lkvDuurTekst(lkv?.categorie)}{" "}
                <InfoToggletip label="Toelichting bij het loonkostenvoordeel">
                  {lkvVoorbehoud(lkv?.categorie)
                    .map((id) => VOORBEHOUD[id])
                    .join(" ")}
                </InfoToggletip>
              </Paragraph>
              <Paragraph>
                U vraagt het loonkostenvoordeel aan door in de loonaangifte het
                vakje loonkostenvoordeel aan te zetten; een aparte aanvraag is
                niet nodig.
                {lkv?.categorie === "arbeidsgehandicapte_werknemer" &&
                  " Dat kan zodra u de doelgroepverklaring van de werknemer hebt."}{" "}
                De Belastingdienst rekent het na afloop van het jaar uit.
              </Paragraph>
              {lkvInvoer && (
                <Waarom
                  invoer={lkvInvoer}
                  antwoorden={a}
                  regeling="Loonkostenvoordeel"
                  kvk={kvk}
                  labels={labels}
                />
              )}
              {situatie === "register" && (
                <div>
                  Via de gemeente kan ook loonkostensubsidie gelden.{" "}
                  <InfoToggletip label="Toelichting bij loonkostensubsidie">
                    Of de gemeente loonkostensubsidie geeft, hangt af van de
                    gemeente. Daarom staat er geen bedrag voor in. Neem contact
                    op met de gemeente waar de kandidaat woont.
                  </InfoToggletip>
                </div>
              )}
            </Kaart>
          )}
          {route.vanzelf.includes("nrp") && (
            <Kaart id="vanzelf-nrp" kop="No-riskpolis" uitvoerder="uwv">
              <Paragraph>
                Wordt de werknemer ziek? Dan betaalt u het loon door. UWV
                betaalt u ziekengeld voor de werknemer: 70 procent van het
                dagloon (Ziektewet 29b). In de eerste 52 weken van de ziekte
                kunt u UWV vragen om het hele dagloon. Het ziekengeld is dan
                niet hoger dan het loon. U hoeft de no-riskpolis niet aan te
                vragen. {duurTekst(nrp?.duurJaren)} Bij ziekte meldt u de
                werknemer ziek bij UWV.
              </Paragraph>
            </Kaart>
          )}
        </section>
      )}

      {bekend && (
        <section className="rhc-mox-card rhc-mox-row-gap" aria-labelledby="zo">
          <Heading level={2} id="zo">
            Zo is dit berekend
          </Heading>
          <DataSummary appearance="column">
            <DataSummaryItem
              itemKey="Uw antwoorden"
              itemValue={`${
                DOELGROEPEN.filter(([d]) => a.doelgroepen.includes(d))
                  .map(([, label]) => label)
                  .join(", ") || "Niets gekozen"
              }; ${a.uren} uur per week; loonwaarde ${a.loonwaarde} procent; ${euro(a.uurloon)} per uur`}
            />
            <DataSummaryItem
              itemKey="Gegevens die u deelde"
              itemValue={
                gedeeld.length
                  ? gedeeld.map((id) => BRON_NAAM[id]).join(", ")
                  : "Geen"
              }
            />
            <DataSummaryItem
              itemKey="Wat er is gebeurd"
              itemValue="De regelrecht-engine heeft in uw browser berekend welke regelingen gelden, volgens de wetten die nu gelden. Er is niets naar een overheidsorganisatie verstuurd."
            />
            <DataSummaryItem
              itemKey="Wat er nu gebeurt"
              itemValue="U hoeft niets aan te vragen. Zet in de loonaangifte het vakje loonkostenvoordeel aan. Wordt de werknemer ziek, dan meldt u dat bij UWV."
            />
          </DataSummary>
        </section>
      )}

      <ActionGroup>
        {/* Er valt niets te versturen; de ondernemer rondt hier af. */}
        <Link
          href="/lopendezaken"
          className="utrecht-button-link utrecht-button-link--html-a utrecht-button-link--primary-action"
        >
          Klaar
        </Link>
        <Link
          href="/lopendezaken/aanvragen/iemand-aannemen-met-afstand-tot-de-arbeidsmarkt"
          className="utrecht-button-link utrecht-button-link--html-a utrecht-button-link--secondary-action"
        >
          Antwoorden wijzigen
        </Link>
      </ActionGroup>
    </>
  );
};

export default Overzicht;

"use client";

import Link from "next/link";
import { useMemo, type ReactNode } from "react";
import { ActionGroup, Heading, Paragraph } from "@/components/rhc";
import InfoToggletip from "@/components/InfoToggletip";
import { AANNAMES, Aanname, duurTekst } from "../_balans";
import { routeVoor, type TaakId } from "../_route";
import type { Doelgroep } from "../_uitkomsten";
import { useAannemen, type AannemenStaat } from "../_useAannemen";
import { useUitkomsten } from "../_useUitkomsten";
import { euro } from "../_werkgever";

const TAAK: Record<TaakId, { kop: string; tekst: string }> = {
  doelgroepverklaring: {
    kop: "Doelgroepverklaring aanvragen",
    tekst:
      "De werknemer vraagt de doelgroepverklaring zelf aan bij UWV, binnen drie maanden na de start. U bewaart de verklaring bij de loonadministratie. Zonder verklaring kunt u het loonkostenvoordeel niet krijgen (Wet tegemoetkomingen loondomein 2.7).",
  },
  vz_wajong: {
    kop: "Jobcoach of werkplekaanpassing aanvragen",
    tekst:
      "De werknemer vraagt dit zelf aan bij UWV, als dat nodig is (Wajong 2:22). U kunt niet namens de werknemer aanvragen in dit portaal.",
  },
  vz_wia: {
    kop: "Jobcoach of werkplekaanpassing aanvragen",
    tekst:
      "De werknemer vraagt dit zelf aan bij UWV, als dat nodig is (Wet WIA 35). U kunt niet namens de werknemer aanvragen in dit portaal.",
  },
};

/** Uitleg per doelgroep zonder aanvraag, met de teksten van de (i) in de oriëntatie. */
const UITLEG: Partial<Record<Doelgroep, { kop: string; tekst: string }>> = {
  beschut: {
    kop: "Beschut werk",
    tekst: `${AANNAMES.beschut_lks.uitleg} De gemeente regelt de beschutte werkplek. Neem contact op met de gemeente. In het portaal is er geen aanvraag.`,
  },
  wsw: { kop: "Wsw", tekst: AANNAMES.wsw_zuinig.uitleg },
  geen: { kop: "Geen van deze", tekst: AANNAMES.geen.uitleg },
};

const Kaart = ({
  id,
  kop,
  children,
}: {
  id: string;
  kop: string;
  children: ReactNode;
}) => (
  <section className="rhc-mox-card rhc-mox-row-gap" aria-labelledby={id}>
    <Heading level={3} id={id}>
      {kop}
    </Heading>
    {children}
  </section>
);

const Overzicht = () => {
  const { staat } = useAannemen();
  // De inhoud rekent met de engine; dat mag pas als de opslag gelezen is.
  if (!staat) return null;
  return <OverzichtInhoud staat={staat} />;
};

/**
 * Routes zonder aanvraag van de werkgever: alleen het doelgroepregister,
 * een uitleg (beschut werk, Wsw, geen van deze, weet ik nog niet) of
 * antwoorden waarbij de engine niets meer laat aanvragen.
 */
const OverzichtInhoud = ({ staat }: { staat: AannemenStaat }) => {
  const a = staat.antwoorden;
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
  const nietsAan = ["gemeente", "wajong", "wia"].includes(situatie);

  return (
    <>
      {/* Volgens de engine is er wel iets aan te vragen: verwijs naar de aanvraag. */}
      {bekend && !route.overzicht ? (
        <Paragraph>
          Bij deze antwoorden kunt u een aanvraag indienen.{" "}
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
              : nietsAan
                ? "Bij deze antwoorden is er niets aan te vragen."
                : "Voor deze situatie dient u niets in. Dit is wat er wel geldt."}
        </Paragraph>
      )}

      {bekend && situatie === "weetniet" && (
        <Kaart id="uitleg-weetniet" kop="Weet ik nog niet">
          <Paragraph>{AANNAMES.weetniet.uitleg}</Paragraph>
          <Paragraph>
            <Link
              href="/personeel/iemand-aannemen/gegevens"
              className="utrecht-link utrecht-link--html-a"
            >
              Gegevens van de kandidaat ophalen
            </Link>
          </Paragraph>
        </Kaart>
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
            <Kaart id="vanzelf-lkv" kop="Loonkostenvoordeel">
              {lkv && (
                <p className="mox-hiring-amount">
                  {euro(lkv.bedragPerJaar)}{" "}
                  <span className="mox-hiring-note">per jaar</span>
                </p>
              )}
              {lkv?.aanname && <Aanname id={lkv.aanname} />}
              <Paragraph>
                U vraagt het loonkostenvoordeel aan door in de loonaangifte het
                vakje loonkostenvoordeel aan te zetten; een aparte aanvraag is
                niet nodig.
                {lkv?.categorie === "arbeidsgehandicapte_werknemer" &&
                  " Dat kan zodra u de doelgroepverklaring van de werknemer hebt."}{" "}
                De Belastingdienst rekent het na afloop van het jaar uit.
              </Paragraph>
              {situatie === "register" && (
                <div className="mox-hiring-note">
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
            <Kaart id="vanzelf-nrp" kop="No-riskpolis">
              <Paragraph>
                Wordt de werknemer ziek, dan betaalt UWV ziekengeld (70 procent
                van het dagloon) in plaats van dat u het loon doorbetaalt. Dit
                geldt vanzelf: u hoeft niets aan te vragen.{" "}
                {duurTekst(nrp?.duurJaren)} Bij ziekte meldt u de werknemer ziek
                bij UWV.
              </Paragraph>
            </Kaart>
          )}
        </section>
      )}

      <ActionGroup>
        <Link
          href="/lopendezaken/aanvragen/iemand-aannemen-met-afstand-tot-de-arbeidsmarkt"
          className="utrecht-button-link utrecht-button-link--html-a utrecht-button-link--secondary-action"
        >
          Antwoorden wijzigen
        </Link>
        <Link href="/personeel" className="utrecht-link utrecht-link--html-a">
          Terug naar Personeel
        </Link>
      </ActionGroup>
    </>
  );
};

export default Overzicht;

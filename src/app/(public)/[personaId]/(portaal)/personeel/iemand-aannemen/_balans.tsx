"use client";

import { Alert, Heading, Paragraph } from "@/components/rhc";
import InfoToggletip from "@/components/InfoToggletip";
import Spinner from "@/components/Spinner";
import TextBadge, { type TextBadgeVariant } from "@/components/TextBadge";
import { loonkostenPerJaar } from "./_engine";
import type { Antwoorden } from "./_useAannemen";
import {
  balansRegels,
  lkvVoorbehoud,
  type AannameId,
  type BalansRegel,
  type VoorbehoudId,
} from "./_uitkomsten";
import type { Resultaat } from "./_useUitkomsten";
import { useManifest } from "./_useRegelrecht";
import { euro } from "./_werkgever";

/** Wat bij een aanname in de (i) staat (ontwerp-orientatie-alle-uitkomsten-v1.md). */
export const AANNAMES: Record<AannameId, { kort: string; uitleg: string }> = {
  // Pwet 10d lid 1 onder b en lid 5; de werkgeverslasten staan nog open, dus geen bedrag.
  lks_lid4: {
    kort: "Gerekend met een loonwaarde die de gemeente vaststelt.",
    uitleg:
      "Gerekend met een loonwaarde die de gemeente vaststelt. De gemeente kan ook met u afspreken dat zij de loonwaarde eerst niet vaststelt. Dan krijgt u ten hoogste de eerste zes maanden 50 procent van het minimumloon met vakantiebijslag, plus een vergoeding voor werkgeverslasten. Werkt de kandidaat minder dan 36 uur, dan is het bedrag naar rato lager. Daarna stelt de gemeente de loonwaarde alsnog vast. Hoe de vergoeding voor werkgeverslasten wordt berekend, staat nog niet vast.",
  },
  ld_cao: {
    kort: "Loondispensatie niet meegeteld.",
    uitleg:
      "U betaalt meer dan het minimumloon. Of loondispensatie dan uw loonkosten verlaagt, hangt af van uw cao. Daarom staat het bedrag er niet in.",
  },
  wia_nieuw: {
    kort: "Gerekend als nieuwe werkgever.",
    uitleg:
      "Gerekend alsof de kandidaat bij u nieuw in dienst komt. Het loonkostenvoordeel geldt dan ten hoogste drie jaar vanaf de start. Werkt de kandidaat al bij u en heeft die een WIA-uitkering? En gaat die weer aan het werk in het eigen werk of in een andere functie? Dan geldt een ander loonkostenvoordeel, ten hoogste één jaar.",
  },
  // Wajong 2:20 met Pwet 10b lid 9: de samenloop is niet getoetst.
  ld_beschut: {
    kort: "Loondispensatie bij beschut werk onder voorbehoud.",
    uitleg:
      "Bij beschut werk kan de gemeente ook loonkostensubsidie geven. Of loondispensatie en loonkostensubsidie samen kunnen, staat nog niet vast. Het bedrag voor loondispensatie is daarom onder voorbehoud.",
  },
  beschut_lks: {
    kort: "Loonkostensubsidie bij beschut werk niet meegeteld.",
    uitleg:
      "Bij beschut werk verstrekt de gemeente loonkostensubsidie als dat nodig is. Of dat zo is, beoordeelt de gemeente. Daarom staat het bedrag er niet in.",
  },
  geen: {
    kort: "Geen regeling met een bedrag.",
    uitleg:
      "Is de kandidaat gekeurd voor de WIA, of heeft de kandidaat een WAO- of WW-uitkering? Dan kunnen een no-riskpolis, loonkostenvoordeel of een proefplaatsing gelden.",
  },
};

/** De disclaimers bij het loonkostenvoordeel (lkvVoorbehoud in _uitkomsten.ts). */
export const VOORBEHOUD: Record<VoorbehoudId, string> = {
  zes_maanden:
    "Was de kandidaat in de zes maanden voor de start al bij u in dienst? Dan geldt het loonkostenvoordeel niet.",
  samenloop:
    "Het loonkostenvoordeel kan samengaan met de no-riskpolis, loonkostensubsidie en loondispensatie. Hoe ze samen uitpakken, rekenen we hier niet uit.",
};

/**
 * Hoe lang het loonkostenvoordeel loopt: arbeidsgehandicapte ten hoogste drie
 * jaar (Wtl 2.8), banenafspraak zolang de dienstbetrekking en de voorwaarden
 * duren (Wtl 2.12).
 */
export const lkvDuurTekst = (categorie: string | undefined) =>
  !categorie
    ? ""
    : categorie === "arbeidsgehandicapte_werknemer"
      ? "Het loonkostenvoordeel geldt ten hoogste drie jaar vanaf de start."
      : "Het loonkostenvoordeel geldt zolang de werknemer bij u in dienst is en aan de voorwaarden voldoet.";

/** De duur en het voorbehoud bij het loonkostenvoordeel, als losse zinnen. */
const lkvToelichting = (categorie: string | undefined) => [
  ...(categorie ? [lkvDuurTekst(categorie)] : []),
  ...lkvVoorbehoud(categorie).map((id) => VOORBEHOUD[id]),
];

/** De duur en het voorbehoud bij het loonkostenvoordeel, als korte notities. */
export const LkvVoorbehoud = ({ categorie }: { categorie?: string }) => (
  <>
    {lkvToelichting(categorie).map((zin) => (
      <Paragraph key={zin} className="rhc-mox-small-text">
        {zin}
      </Paragraph>
    ))}
  </>
);

/** Wie een regeling uitvoert; het label heeft tekst, niet alleen een kleur. */
export const UITVOERDER = {
  gemeente: { tekst: "Gemeente", variant: "info" },
  uwv: { tekst: "UWV", variant: "info" },
  loonaangifte: { tekst: "Loonaangifte", variant: "neutral" },
} as const satisfies Record<
  string,
  { tekst: string; variant: TextBadgeVariant }
>;

export type UitvoerderId = keyof typeof UITVOERDER;

const UITVOERDER_VAN: Record<BalansRegel["id"], UitvoerderId> = {
  lks: "gemeente",
  ld: "uwv",
  lkv: "loonaangifte",
};

export const Uitvoerder = ({ id }: { id: UitvoerderId }) => (
  <TextBadge variant={UITVOERDER[id].variant} icon={false}>
    {UITVOERDER[id].tekst}
  </TextBadge>
);

const naam = (r: BalansRegel) =>
  r.id === "lks"
    ? "Loonkostensubsidie"
    : r.id === "ld"
      ? "Lagere loonkosten door loondispensatie"
      : r.regel?.categorie === "arbeidsgehandicapte_werknemer"
        ? "Loonkostenvoordeel arbeidsgehandicapte"
        : "Loonkostenvoordeel";

/** Hoe lang de no-riskpolis loopt (ZW 29b); negatief is zonder einddatum. */
export const duurTekst = (jaren: number | undefined) =>
  jaren === undefined || jaren === 0
    ? ""
    : jaren < 0
      ? "De no-riskpolis heeft geen einddatum."
      : jaren === 5
        ? "De no-riskpolis geldt bij ziekte die begint in de eerste vijf jaar na de start van het dienstverband."
        : `De no-riskpolis geldt bij ziekte die begint in de eerste ${jaren} jaar na de start van het dienstverband.`;

/** Loondispensatie is geen betaling (Wajong 2:20); het bedrag schat het portaal. */
const LdNotitie = ({ kort }: { kort?: boolean }) => (
  <Paragraph className="rhc-mox-small-text">
    Met loondispensatie mag u uw werknemer minder loon betalen. UWV bepaalt
    hoeveel minder. U krijgt dit bedrag niet uitbetaald. Het is een schatting
    van wat u minder betaalt aan loon, vakantiegeld en werkgeverslasten.
    {kort && " Het bedrag samen bevat dus ook deze lagere loonkosten."}
  </Paragraph>
);

/** Een korte zin met de uitleg achter een (i). */
export const Aanname = ({ id }: { id: AannameId }) => (
  // Een div: de Toggletip is een <details> en mag niet in een <p>.
  <div className="rhc-mox-small-text">
    {AANNAMES[id].kort}{" "}
    <InfoToggletip label={`Toelichting: ${AANNAMES[id].kort}`}>
      {AANNAMES[id].uitleg}
    </InfoToggletip>
  </div>
);

/**
 * "Wat het kost en oplevert": loonkosten (benadering) min wat de
 * regelingen opleveren, live uit de regelrecht-engine (useUitkomsten).
 * Compact (`kort`) voor de zijkolom van de aanvraag.
 */
const Balans = ({
  antwoorden,
  resultaat,
  kort,
}: {
  antwoorden: Antwoorden;
  resultaat: Resultaat;
  kort?: boolean;
}) => {
  const manifest = useManifest();
  const { uitkomsten, bekend, bezig, fout } = resultaat;
  const kosten = loonkostenPerJaar(antwoorden);
  const regels = balansRegels(uitkomsten, kosten);
  const terug = regels.reduce((som, r) => som + r.bedrag, 0);
  const netto = Math.max(0, kosten - terug);
  const ldBedrag =
    bekend && !fout && regels.some((r) => r.id === "ld" && r.bedrag > 0);
  const lkvBedrag =
    bekend && !fout
      ? regels.find((r) => r.id === "lkv" && r.bedrag > 0)
      : undefined;
  // Tijdens het rekenen staan alle regelingen er al, met een spinner; na een
  // fout met "…".
  const bezigOfFout = fout ? "…" : <Spinner />;
  const bedrag = (cent: number) => (bekend && !fout ? euro(cent) : bezigOfFout);
  const waarde = (r: BalansRegel, min = "") =>
    !bekend || fout
      ? bezigOfFout
      : r.status === "bedrag"
        ? `${min}${euro(r.bedrag)}`
        : r.status === "niet_meegeteld"
          ? "niet meegeteld"
          : "geldt niet";

  // Rekenen en fouten blijven zichtbaar; de herkomst staat in de toggletip.
  const bron =
    bezig || fout ? (
      <Paragraph
        className="rhc-mox-small-text"
        role={bezig ? "status" : undefined}
      >
        {fout
          ? `De berekening lukt nu niet (${fout}). Laad de pagina opnieuw. Dit is een berekening vooraf. Na uw aanvraag beslist de organisatie die de regeling uitvoert over het bedrag.`
          : "Wij rekenen uit…"}
      </Paragraph>
    ) : null;

  /**
   * Kop van het totaal, met de herkomst van de berekening in een toggletip.
   * De toggletip staat naast de kop, niet erin: een kop mag geen <details>
   * bevatten, en de naam van de knop zou dan in de kop komen.
   */
  const totaalKop = (tekst: string) => (
    <div className="rhc-mox-with-info rhc-mox-with-info--end">
      <Heading level={3} appearanceLevel={5}>
        {tekst}
      </Heading>
      {!fout && (
        <>
          <InfoToggletip label="Toelichting bij de berekening">
            <Paragraph>
              Berekend in uw browser door de regelrecht-engine
              {manifest.status === "klaar" &&
                ` (engine ${manifest.waarde.regelrecht.slice(0, 8)}, corpus ${manifest.waarde.corpus.revisie.slice(0, 8)})`}
              .
            </Paragraph>
            <Paragraph>
              Dit is een berekening vooraf. Na uw aanvraag beslist de
              organisatie die de regeling uitvoert over het bedrag. De
              loonkosten zijn een schatting.
            </Paragraph>
          </InfoToggletip>
        </>
      )}
    </div>
  );

  if (kort)
    return (
      <>
        <dl className="rhc-data-summary rhc-data-summary--row">
          {regels.map((r) => (
            <div key={r.id} className="rhc-data-summary__item">
              <dt className="rhc-data-summary__item-key">
                <span>{naam(r)}</span>
                <Uitvoerder id={UITVOERDER_VAN[r.id]} />
              </dt>
              <dd className="rhc-data-summary__item-value">{waarde(r)}</dd>
            </div>
          ))}
        </dl>
        <div className="rhc-mox-highlight">
          {totaalKop("Samen ongeveer per jaar")}
          <Paragraph purpose="lead">
            <strong>{bedrag(terug)}</strong>
          </Paragraph>
        </div>
        {ldBedrag && <LdNotitie kort />}
        {lkvBedrag && (
          <Paragraph className="rhc-mox-small-text">
            {lkvDuurTekst(lkvBedrag.regel?.categorie)}
          </Paragraph>
        )}
        <Paragraph className="rhc-mox-small-text">
          Bij {antwoorden.uren} uur per week en {euro(antwoorden.uurloon)} per
          uur. De loonkosten zijn dan {euro(kosten)} per jaar.
        </Paragraph>
        {bron}
      </>
    );

  return (
    <>
      {uitkomsten.aannames.map((id) => (
        <Aanname key={id} id={id} />
      ))}
      <dl className="rhc-data-summary rhc-data-summary--column">
        <div className="rhc-data-summary__item">
          <dt className="rhc-data-summary__item-key">Loonkosten</dt>
          <dd className="rhc-data-summary__item-value">{euro(kosten)}</dd>
        </div>
        {regels.map((r) => {
          // De aanname en, bij het loonkostenvoordeel, de duur en het voorbehoud.
          const toelichting = [
            ...(r.regel?.aanname ? [AANNAMES[r.regel.aanname].uitleg] : []),
            ...(r.id === "lkv" && bekend && !fout
              ? lkvToelichting(r.regel?.categorie)
              : []),
          ];
          return (
            <div key={r.id} className="rhc-data-summary__item">
              <dt className="rhc-data-summary__item-key">
                <span>
                  {naam(r)}
                  {toelichting.length > 0 && (
                    <>
                      {" "}
                      <InfoToggletip
                        label={`Toelichting bij ${naam(r).toLowerCase()}`}
                      >
                        {toelichting.map((zin) => (
                          <Paragraph key={zin}>{zin}</Paragraph>
                        ))}
                      </InfoToggletip>
                    </>
                  )}
                </span>
                <Uitvoerder id={UITVOERDER_VAN[r.id]} />
              </dt>
              <dd className="rhc-data-summary__item-value">
                {waarde(r, "− ")}
              </dd>
            </div>
          );
        })}
      </dl>
      {ldBedrag && <LdNotitie />}
      {/* Pwet 7 lid 3 c: een UWV-uitkering sluit de Pwet-doelgroep uit; loondispensatie is alleen Wajong (2:20). */}
      {bekend &&
        !fout &&
        antwoorden.doelgroepen.includes("wia") &&
        !antwoorden.doelgroepen.includes("wajong") && (
          <Paragraph className="rhc-mox-small-text">
            Bij een WIA-uitkering zijn loonkostensubsidie en loondispensatie
            niet mogelijk.
          </Paragraph>
        )}
      {bekend && !fout && terug === 0 && (
        <Alert type="info">
          <Paragraph>
            Bij deze keuze gelden geen regelingen met een bedrag.
          </Paragraph>
        </Alert>
      )}
      {/* Positief geformuleerd: wat de loonkosten met de regelingen zijn, en het verschil. */}
      <div className="rhc-mox-highlight">
        {totaalKop("Uw loonkosten met deze regelingen, ongeveer per jaar")}
        <Paragraph purpose="lead">
          <strong>{bedrag(netto)}</strong>
        </Paragraph>
        {bekend && !fout && terug > 0 && (
          <Paragraph>
            Dat is ongeveer {euro(terug)} per jaar minder dan zonder regelingen.
          </Paragraph>
        )}
      </div>
      {bron}
    </>
  );
};

/**
 * De korte balans van de concept-aanvraag: rekent met de antwoorden van de
 * oriëntatie. De aanvraag geeft de uitkomsten mee die ze zelf al heeft, zodat
 * de engine niet dubbel rekent.
 */
export const KorteBalans = ({
  antwoorden,
  resultaat,
}: {
  antwoorden: Antwoorden;
  resultaat: Resultaat;
}) => <Balans antwoorden={antwoorden} resultaat={resultaat} kort />;

export default Balans;

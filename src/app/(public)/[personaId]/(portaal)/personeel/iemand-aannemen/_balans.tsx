"use client";

import LoadingStatus from "@/components/LoadingStatus";
import type { ReactNode } from "react";
import { useState } from "react";
import ChangedValue, { ChangedValueGroup } from "@/components/ChangedValue";
import { useSliderDragging } from "@/components/RangeSlider";
import {
  Accordion,
  AccordionSection,
  Alert,
  Heading,
  Paragraph,
} from "@/components/rhc";
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
import { euro, euroHeel, opHeleEuros } from "./_werkgever";

/** Wat bij een aanname in de (i) staat (ontwerp-orientatie-alle-uitkomsten-v1.md). */
export const AANNAMES: Record<AannameId, { kort: string; uitleg: string }> = {
  // Pwet 10d lid 1 onder b en lid 5. De vergoeding voor werkgeverslasten komt
  // bovenop de loonkostensubsidie en valt buiten het maximum van 70 procent
  // (jurist, 10 november 2026); 25 procent volgens de Regeling
  // loonkostensubsidie Participatiewet 2021, artikel 1. De gebundelde engine
  // rekent haar niet als eigen bedrag, dus de voorbeeldberekening telt haar niet mee.
  lks_lid4: {
    kort: "Gerekend met een loonwaarde die de gemeente vaststelt.",
    uitleg:
      "Gerekend met een loonwaarde die de gemeente vaststelt. De vergoeding voor werkgeverslasten (25 procent) komt erbovenop en is niet meegeteld.",
  },
  ld_cao: {
    kort: "Loondispensatie niet meegeteld.",
    uitleg:
      "U betaalt meer dan het minimumloon. Of loondispensatie dan uw loonkosten verlaagt, hangt af van uw cao. Daarom staat het bedrag er niet in.",
  },
  wia_nieuw: {
    kort: "Gerekend alsof de kandidaat nieuw bij u in dienst komt.",
    uitleg:
      "Gerekend alsof de kandidaat nieuw bij u in dienst komt. Komt een eigen werknemer met een WIA-uitkering terug in het werk? Dan geldt een ander loonkostenvoordeel, hoogstens 1 jaar.",
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
    "Was de kandidaat in de 6 maanden voor de start al bij u in dienst? Dan geldt het loonkostenvoordeel niet.",
  samenloop:
    "U krijgt het loonkostenvoordeel naast de andere regelingen. In deze voorbeeldberekening zijn ze samen nooit meer dan de loonkosten.",
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
      ? "Het loonkostenvoordeel geldt hoogstens 3 jaar vanaf de start."
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
  loonaangifte: { tekst: "Belastingdienst", variant: "neutral" },
} as const satisfies Record<
  string,
  { tekst: string; variant: TextBadgeVariant }
>;

export type UitvoerderId = keyof typeof UITVOERDER;

export const Uitvoerder = ({ id }: { id: UitvoerderId }) => (
  <TextBadge variant={UITVOERDER[id].variant} icon={false}>
    {UITVOERDER[id].tekst}
  </TextBadge>
);

/** De naam van de regeling, overal dezelfde. */
const naam = (r: BalansRegel) =>
  r.id === "lks"
    ? "Loonkostensubsidie"
    : r.id === "ld"
      ? "Loondispensatie"
      : "Loonkostenvoordeel";

/** Hoe lang de no-riskpolis loopt (ZW 29b); negatief is zonder einddatum. */
export const duurTekst = (jaren: number | undefined) =>
  jaren === undefined || jaren === 0
    ? ""
    : jaren < 0
      ? "De no-riskpolis geldt zolang de werknemer bij u in dienst is."
      : `De no-riskpolis geldt bij ziekte die begint in de eerste ${jaren} jaar na de start van het dienstverband.`;

/**
 * Wanneer een regeling geldt, in het kort. Staat altijd achter de (i), ook als
 * de regeling bij deze antwoorden niet geldt, zodat de ondernemer ziet waarom.
 */
const WANNEER: Record<BalansRegel["id"], string> = {
  lks: "Voor een werknemer die bij de gemeente hoort en het minimumloon niet kan verdienen. De gemeente betaalt het verschil met de loonwaarde, hoogstens 70 procent van het minimumloon met vakantiegeld (Participatiewet, artikel 10d).",
  ld: "Voor een werknemer met een Wajong-uitkering die ten minste 25 procent minder kan dan gebruikelijk, voor ten minste 6 maanden. U betaalt minder loon; UWV stelt vast hoeveel (Wajong, artikel 2:20; Besluit loondispensatie Wajong, artikelen 1 en 2).",
  lkv: "Voor een werknemer uit de doelgroep banenafspraak of met een doelgroepverklaring (Wet tegemoetkomingen loondomein, artikelen 2.6 en 2.10). Iemand die bij de gemeente hoort, hoort bij de banenafspraak als de gemeente een loonwaarde onder het minimumloon vaststelt (Wet financiering sociale verzekeringen, artikel 38b).",
};

/** Loondispensatie is geen betaling (Wajong 2:20); het bedrag schat het portaal. */
const LD_UITLEG =
  "U krijgt dit bedrag niet uitbetaald: het is een schatting van wat u minder betaalt aan loon.";

const LdNotitie = ({ kort }: { kort?: boolean }) => (
  <Paragraph className="rhc-mox-small-text">
    {LD_UITLEG}
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
 * "Voorbeeldberekening: wat het u kan opleveren": loonkosten (benadering) min wat de
 * regelingen opleveren, live uit de regelrecht-engine (useUitkomsten).
 * Compact (`kort`) voor de zijkolom van de aanvraag.
 */
const Balans = ({
  antwoorden,
  resultaat,
  kort,
  meer,
}: {
  antwoorden: Antwoorden;
  resultaat: Resultaat;
  kort?: boolean;
  /** Extra uitleg in de (i) van een regeling, na wanneer die geldt. */
  meer?: (regel: BalansRegel) => ReactNode;
}) => {
  const { uitkomsten, bekend, bezig, fout } = resultaat;
  // Values that follow a slider light up when the user lets go of it.
  const slepen = useSliderDragging();
  // De open uitklap van de regelingen: hoogstens één tegelijk (exclusive).
  const [open, setOpen] = useState<string>();
  const wissel = (id: string) => setOpen((nu) => (nu === id ? undefined : id));
  // Een schatting: in hele euro's, en de som klopt met de bedragen erboven.
  const kosten = opHeleEuros(loonkostenPerJaar(antwoorden));
  const regels = balansRegels(uitkomsten, kosten).map((r) => ({
    ...r,
    bedrag: opHeleEuros(r.bedrag),
  }));
  const terug = regels.reduce((som, r) => som + r.bedrag, 0);
  const netto = Math.max(0, kosten - terug);

  // For a screen reader: the new total once the calculation is done after a
  // change. Not on the first result, so loading the page stays quiet.
  const totaal =
    bekend && !bezig && !fout
      ? kort
        ? `Samen ongeveer ${euroHeel(terug)} per jaar.`
        : `Uw loonkosten met deze regelingen: ongeveer ${euroHeel(netto)} per jaar.`
      : undefined;
  const [vorigTotaal, setVorigTotaal] = useState(totaal);
  const [melding, setMelding] = useState("");
  if (totaal !== undefined && totaal !== vorigTotaal) {
    setVorigTotaal(totaal);
    if (vorigTotaal !== undefined) setMelding(totaal);
  }
  const statusmelding = (
    <div role="status" className="rhc-visually-hidden">
      {melding}
    </div>
  );
  const ldBedrag =
    bekend && !fout && regels.some((r) => r.id === "ld" && r.bedrag > 0);
  const lkvBedrag =
    bekend && !fout
      ? regels.find((r) => r.id === "lkv" && r.bedrag > 0)
      : undefined;
  // Tijdens het rekenen staan alle regelingen er al, met een spinner; na een
  // fout met "…".
  const bezigOfFout = fout ? "…" : <Spinner />;
  // ChangedValue stays mounted during the spinner, so it still sees the change.
  const bedrag = (cent: number) => (
    <ChangedValue>
      {bekend && !fout ? euroHeel(cent) : bezigOfFout}
    </ChangedValue>
  );
  const waarde = (r: BalansRegel, min = "") => (
    <ChangedValue>
      {!bekend || fout
        ? bezigOfFout
        : r.status === "bedrag"
          ? `${min}${euroHeel(r.bedrag)}`
          : r.status === "niet_meegeteld"
            ? "niet meegeteld"
            : `${min}${euroHeel(0)}`}
    </ChangedValue>
  );

  // Rekenen en fouten blijven zichtbaar; de herkomst staat in de toggletip.
  const bron = fout ? (
    <Paragraph className="rhc-mox-small-text">
      Wij kunnen de bedragen nu niet berekenen. Laad de pagina opnieuw.
    </Paragraph>
  ) : bezig ? (
    <LoadingStatus className="rhc-mox-small-text">
      Wij berekenen de bedragen…
    </LoadingStatus>
  ) : null;

  /**
   * Kop van het totaal, met de herkomst van de berekening in een toggletip.
   * De toggletip staat naast de kop, niet erin: een kop mag geen <details>
   * bevatten, en de naam van de knop zou dan in de kop komen.
   */
  const totaalKop = (tekst: string) => (
    <Heading level={3} appearanceLevel={5}>
      {tekst}
    </Heading>
  );

  if (kort)
    return (
      <ChangedValueGroup settled={!slepen}>
        <dl className="rhc-data-summary rhc-data-summary--column">
          {regels.map((r) => (
            <div key={r.id} className="rhc-data-summary__item">
              <dt className="rhc-data-summary__item-key">
                <span>
                  {naam(r)}{" "}
                  <InfoToggletip
                    label={`Toelichting bij ${naam(r).toLowerCase()}`}
                  >
                    <Paragraph>{WANNEER[r.id]}</Paragraph>
                    {bekend && !fout && r.status === "geldt_niet" && (
                      <Paragraph>
                        Bij uw antwoorden geldt deze regeling niet.
                      </Paragraph>
                    )}
                  </InfoToggletip>
                </span>
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
          Bij <ChangedValue>{`${antwoorden.uren} uur`}</ChangedValue> per week
          en ongeveer <ChangedValue>{euroHeel(kosten)}</ChangedValue> loonkosten
          per jaar.
        </Paragraph>
        {bron}
        {statusmelding}
      </ChangedValueGroup>
    );

  return (
    <ChangedValueGroup settled={!slepen}>
      {uitkomsten.aannames.map((id) => (
        <Aanname key={id} id={id} />
      ))}
      {/* Een optelsom: loonkosten, min elke regeling, en onder de streep de uitkomst. */}
      <dl className="rhc-data-summary rhc-data-summary--column rhc-mox-sum">
        <div className="rhc-data-summary__item">
          <dt className="rhc-data-summary__item-key">
            <span>
              Loonkosten{" "}
              {/* Zo volgt het bedrag uit de uren en het uurloon (loonkostenPerJaar). */}
              <InfoToggletip label="Toelichting bij de loonkosten">
                <Paragraph>
                  {antwoorden.uren} uur × {euro(antwoorden.uurloon)} × 52 weken,
                  plus 8 procent vakantiegeld en ongeveer 20 procent
                  werkgeverslasten.
                </Paragraph>
              </InfoToggletip>
            </span>
          </dt>
          <dd className="rhc-data-summary__item-value">
            <ChangedValue>{euroHeel(kosten)}</ChangedValue>
          </dd>
        </div>
        {/* De regelingen samen op één regel; per regeling de uitleg in een uitklap eronder. */}
        <div className="rhc-data-summary__item">
          <dt className="rhc-data-summary__item-key">Regelingen</dt>
          <dd className="rhc-data-summary__item-value">
            <ChangedValue>
              {bekend && !fout ? `− ${euroHeel(terug)}` : bezigOfFout}
            </ChangedValue>
          </dd>
        </div>
        <div className="rhc-data-summary__item rhc-mox-sum__total">
          <dt className="rhc-data-summary__item-key">
            Geschatte loonkosten per jaar
          </dt>
          <dd className="rhc-data-summary__item-value">{bedrag(netto)}</dd>
        </div>
      </dl>
      {/* Een uitklap per regeling: de uitleg staat in de kolom, niet in een laag
          erover, zodat die altijd helemaal leesbaar is. */}
      <Accordion>
        {regels.map((r) => {
          // Kop met het bedrag; daarin wanneer de regeling geldt, de aanname,
          // en bij een bedrag de uitleg bij loondispensatie of de duur en het
          // voorbehoud bij het loonkostenvoordeel.
          const klaar = bekend && !fout;
          const metBedrag = klaar && r.bedrag > 0;
          const uitkomst = !klaar
            ? ""
            : r.status === "bedrag"
              ? `: ${euroHeel(r.bedrag)}`
              : r.status === "niet_meegeteld"
                ? ": niet meegeteld"
                : ": geldt niet";
          const toelichting = [
            ...(r.regel?.aanname ? [AANNAMES[r.regel.aanname].uitleg] : []),
            ...(metBedrag && r.id === "ld" ? [LD_UITLEG] : []),
            ...(metBedrag && r.id === "lkv"
              ? lkvToelichting(r.regel?.categorie)
              : []),
          ];
          return (
            <AccordionSection
              key={r.id}
              headingLevel={3}
              label={`${naam(r)}${uitkomst}`}
              // Het type eist `body`, de component rendert alleen `children`.
              body={null}
              expanded={open === r.id}
              onActivate={() => wissel(r.id)}
            >
              <div className="rhc-mox-stack">
                <Paragraph>{WANNEER[r.id]}</Paragraph>
                {klaar && r.status === "geldt_niet" && (
                  <Paragraph>
                    Bij uw antwoorden geldt deze regeling niet.
                  </Paragraph>
                )}
                {toelichting.map((zin) => (
                  <Paragraph key={zin}>{zin}</Paragraph>
                ))}
                {klaar && meer?.(r)}
              </div>
            </AccordionSection>
          );
        })}
      </Accordion>
      {/* Loondispensatie is alleen Wajong (2:20); loonkostensubsidie alleen via Pwet 7 lid 3 c of 10d lid 2. */}
      {bekend &&
        !fout &&
        antwoorden.doelgroepen.includes("wia") &&
        !antwoorden.doelgroepen.includes("wajong") && (
          <Paragraph className="rhc-mox-small-text">
            Bij een WIA-uitkering is loondispensatie niet mogelijk; die bestaat
            alleen bij de Wajong (Wajong, artikel 2:20). Loonkostensubsidie kan
            alleen als de gemeente al eerder loonkostensubsidie voor de
            kandidaat verleende, of als de kandidaat in de 6 maanden voor de
            start praktijkonderwijs, voortgezet speciaal onderwijs of een
            entreeopleiding volgde (Participatiewet, artikelen 7 lid 3 onder c
            en 10d lid 2).
          </Paragraph>
        )}
      {bekend && !fout && terug === 0 && (
        <Alert type="info">
          <Paragraph>
            Bij deze keuze gelden geen regelingen met een bedrag.
          </Paragraph>
        </Alert>
      )}
      {bron}
      {statusmelding}
    </ChangedValueGroup>
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

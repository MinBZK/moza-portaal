"use client";

import { Alert, Heading, Paragraph } from "@/components/rhc";
import InfoToggletip from "@/components/InfoToggletip";
import { loonkostenPerJaar } from "./_engine";
import type { Antwoorden } from "./_useAannemen";
import type { AannameId, Regel } from "./_uitkomsten";
import { useUitkomsten, type Resultaat } from "./_useUitkomsten";
import { useManifest } from "./_useRegelrecht";
import { euro } from "./_werkgever";

/** Wat bij een aanname in de (i) staat (ontwerp-orientatie-alle-uitkomsten-v1.md). */
export const AANNAMES: Record<AannameId, { kort: string; uitleg: string }> = {
  lks_lid4: {
    kort: "Gerekend met een loonwaarde die vooraf vaststaat.",
    uitleg:
      "Gerekend met een loonwaarde die de gemeente vooraf vaststelt. Stelt de gemeente die pas na de start vast, dan krijgt u de eerste zes maanden 50 procent: € 1.577,48 per maand bij 36 uur, naar rato van de uren.",
  },
  ld_cao: {
    kort: "Loondispensatie niet meegeteld.",
    uitleg:
      "U betaalt meer dan het minimumloon. Of loondispensatie dan uw loonkosten verlaagt, hangt af van uw cao. Daarom staat het bedrag er niet in.",
  },
  wia_nieuw: {
    kort: "Gerekend als nieuwe werkgever.",
    uitleg:
      "Gerekend alsof de kandidaat bij u nieuw in dienst komt. Gaat iemand met een WIA-uitkering bij u weer aan het werk, dan geldt het loonkostenvoordeel één jaar.",
  },
  wsw_zuinig: {
    kort: "Gerekend met werk in de sociale werkvoorziening.",
    uitleg:
      "Gerekend met werk in de sociale werkvoorziening. Heeft de kandidaat alleen een Wsw-indicatie, dan kunnen het loonkostenvoordeel en de no-riskpolis wel gelden.",
  },
  beschut_lks: {
    kort: "Zonder loonkostensubsidie van de gemeente.",
    uitleg:
      "De gemeente kan bij beschut werk loonkostensubsidie geven. Dat staat er niet in, omdat het van de gemeente afhangt.",
  },
  weetniet: {
    kort: "Als de kandidaat in het doelgroepregister staat.",
    uitleg:
      "Gerekend alsof de kandidaat in het doelgroepregister staat. Helpt de gemeente de kandidaat aan werk, dan kan er ook loonkostensubsidie gelden.",
  },
  geen: {
    kort: "Geen regeling met een bedrag.",
    uitleg:
      "Is de kandidaat gekeurd voor de WIA, heeft de kandidaat een WAO- of een WW-uitkering? Dan kunnen een no-riskpolis, loonkostenvoordeel of een proefplaatsing gelden.",
  },
};

const naam = (r: Regel) =>
  r.id === "lks"
    ? "Loonkostensubsidie"
    : r.id === "ld"
      ? "Loondispensatie"
      : r.categorie === "arbeidsgehandicapte_werknemer"
        ? "Loonkostenvoordeel arbeidsgehandicapte"
        : "Loonkostenvoordeel";

/** Een korte zin met de uitleg achter een (i). */
export const Aanname = ({ id }: { id: AannameId }) => (
  // Een div: de Toggletip is een <details> en mag niet in een <p>.
  <div className="mox-hiring-note">
    {AANNAMES[id].kort}{" "}
    <InfoToggletip label={`Toelichting: ${AANNAMES[id].kort}`}>
      {AANNAMES[id].uitleg}
    </InfoToggletip>
  </div>
);

/**
 * "Wat de regelingen opleveren": loonkosten (benadering) min wat de
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
  // Nooit meer terug dan de loonkosten; per regel afgetopt in volgorde.
  const regels = uitkomsten.regels.reduce<(Regel & { bedrag: number })[]>(
    (lijst, r) => {
      const al = lijst.reduce((som, x) => som + x.bedrag, 0);
      const bedrag = Math.min(r.bedragPerJaar, Math.max(0, kosten - al));
      return [...lijst, { ...r, bedrag }];
    },
    [],
  );
  const terug = regels.reduce((som, r) => som + r.bedrag, 0);
  const netto = Math.max(0, kosten - terug);
  const bedrag = (cent: number) => (bekend && !fout ? euro(cent) : "…");
  const pct = (v: number) =>
    kosten > 0 ? Math.min(100, Math.max(1, Math.round((v / kosten) * 100))) : 0;

  const bron = (
    <Paragraph className="mox-hiring-note" role={bezig ? "status" : undefined}>
      {bezig && !fout && "De regelrecht-engine rekent… "}
      {fout
        ? `De engine in de browser kan nu niet rekenen (${fout}). Probeer de pagina opnieuw te laden. `
        : "Berekend in uw browser door de regelrecht-engine"}
      {!fout &&
        manifest.status === "klaar" &&
        ` (engine ${manifest.waarde.regelrecht.slice(0, 8)}, corpus ${manifest.waarde.corpus.revisie.slice(0, 8)})`}
      {!fout && ". "}
      De bedragen gelden als u de regelingen aanvraagt. De loonkosten zijn een
      benadering.
    </Paragraph>
  );

  if (kort)
    return (
      <>
        <Heading level={2}>Wat dit u oplevert</Heading>
        <p className="mox-hiring-amount">{bedrag(terug)}</p>
        <Paragraph className="mox-hiring-note">
          per jaar
          {regels.length > 0 &&
            `: ${regels.map((r) => `${naam(r).toLowerCase()} ${bedrag(r.bedrag)}`).join(" en ")}`}
          , bij {antwoorden.uren} uur per week en {euro(antwoorden.uurloon)} per
          uur.
        </Paragraph>
        {bron}
      </>
    );

  return (
    <>
      <Heading level={3}>Wat de regelingen opleveren</Heading>
      {uitkomsten.aannames.map((id) => (
        <Aanname key={id} id={id} />
      ))}
      <dl className="mox-hiring-balance">
        <div>
          <dt>Loonkosten</dt>
          <dd>{euro(kosten)}</dd>
          <span className="mox-hiring-bar">
            <span style={{ inlineSize: "100%" }} />
          </span>
        </div>
        {regels.map((r) => (
          <div key={r.id}>
            <dt>
              {naam(r)}
              {r.aanname && (
                <>
                  {" "}
                  <InfoToggletip
                    label={`Toelichting bij ${naam(r).toLowerCase()}`}
                  >
                    {AANNAMES[r.aanname].uitleg}
                  </InfoToggletip>
                </>
              )}
            </dt>
            <dd>− {bedrag(r.bedrag)}</dd>
            <span className="mox-hiring-bar">
              <span
                className="mox-hiring-bar--plus"
                style={{ inlineSize: `${pct(r.bedrag)}%` }}
              />
            </span>
          </div>
        ))}
      </dl>
      {bekend && !fout && regels.length === 0 && (
        <Alert type="info">
          <Paragraph>
            Bij deze keuze gelden geen regelingen met een bedrag.
          </Paragraph>
        </Alert>
      )}
      <div className="mox-hiring-net">
        <Paragraph>
          <strong>Blijft voor uw rekening per jaar</strong>
        </Paragraph>
        <p className="mox-hiring-amount">{bedrag(netto)}</p>
      </div>
      {bron}
    </>
  );
};

/**
 * De korte balans van de concept-aanvraag. Fase 2 is uitgewerkt voor een
 * kandidaat via de gemeente; die rekent dus met bijstand, en met de uren,
 * loonwaarde en het uurloon uit de oriëntatie.
 */
export const KorteBalans = ({ antwoorden }: { antwoorden: Antwoorden }) => {
  const a = { ...antwoorden, doelgroepen: ["bijstand" as const] };
  return <Balans antwoorden={a} resultaat={useUitkomsten(a)} kort />;
};

export default Balans;

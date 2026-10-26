"use client";

import { Alert, Paragraph } from "@/components/rhc";
import InfoToggletip from "@/components/InfoToggletip";
import { loonkostenPerJaar } from "./_engine";
import type { Antwoorden } from "./_useAannemen";
import { balansRegels, type AannameId, type BalansRegel } from "./_uitkomsten";
import type { Resultaat } from "./_useUitkomsten";
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

/** Wie een regeling uitvoert; het label heeft tekst, niet alleen een kleur. */
export const UITVOERDER = {
  gemeente: { tekst: "Gemeente", klasse: "mox-badge--municipality" },
  uwv: { tekst: "UWV", klasse: "mox-badge--uwv" },
  loonaangifte: { tekst: "Loonaangifte", klasse: "mox-badge--payroll" },
} as const;

export type UitvoerderId = keyof typeof UITVOERDER;

const UITVOERDER_VAN: Record<BalansRegel["id"], UitvoerderId> = {
  lks: "gemeente",
  ld: "uwv",
  lkv: "loonaangifte",
};

export const Uitvoerder = ({ id }: { id: UitvoerderId }) => (
  <span className={`mox-badge mox-hiring-org ${UITVOERDER[id].klasse}`}>
    {UITVOERDER[id].tekst}
  </span>
);

const naam = (r: BalansRegel) =>
  r.id === "lks"
    ? "Loonkostensubsidie"
    : r.id === "ld"
      ? "Loondispensatie"
      : r.regel?.categorie === "arbeidsgehandicapte_werknemer"
        ? "Loonkostenvoordeel arbeidsgehandicapte"
        : "Loonkostenvoordeel";

/** Hoe lang de no-riskpolis loopt; negatief is zonder einddatum. */
export const duurTekst = (jaren: number | undefined) =>
  jaren === undefined || jaren === 0
    ? ""
    : jaren < 0
      ? "De no-riskpolis loopt zonder einddatum."
      : jaren === 5
        ? "De no-riskpolis loopt vijf jaar."
        : `De no-riskpolis loopt ${jaren} jaar.`;

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
  const bedrag = (cent: number) => (bekend && !fout ? euro(cent) : "…");
  // Tijdens het rekenen staan alle drie de regelingen er al, met "…".
  const waarde = (r: BalansRegel, min = "") =>
    !bekend || fout
      ? "…"
      : r.status === "bedrag"
        ? `${min}${euro(r.bedrag)}`
        : r.status === "niet_meegeteld"
          ? "niet meegeteld"
          : "geldt niet";
  const klasse = (r: BalansRegel) =>
    bekend && !fout && r.status !== "bedrag" ? "mox-hiring-none" : undefined;
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
        <dl className="mox-hiring-balance">
          {regels.map((r) => (
            <div key={r.id}>
              <dt>
                {naam(r)}
                <Uitvoerder id={UITVOERDER_VAN[r.id]} />
              </dt>
              <dd className={klasse(r)}>{waarde(r)}</dd>
            </div>
          ))}
        </dl>
        <div className="mox-hiring-net">
          <Paragraph>
            <strong>Samen per jaar</strong>
          </Paragraph>
          <p className="mox-hiring-amount">{bedrag(terug)}</p>
        </div>
        <Paragraph className="mox-hiring-note">
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
      <dl className="mox-hiring-balance">
        <div>
          <dt>Loonkosten</dt>
          <dd>{euro(kosten)}</dd>
          {/* De balk is een eigen dd: in een dl mag een div alleen dt en dd bevatten. */}
          <dd className="mox-hiring-bar" aria-hidden="true">
            <span style={{ inlineSize: "100%" }} />
          </dd>
        </div>
        {regels.map((r) => (
          <div key={r.id}>
            <dt>
              {naam(r)}
              {r.regel?.aanname && (
                <>
                  {" "}
                  <InfoToggletip
                    label={`Toelichting bij ${naam(r).toLowerCase()}`}
                  >
                    {AANNAMES[r.regel.aanname].uitleg}
                  </InfoToggletip>
                </>
              )}
              <Uitvoerder id={UITVOERDER_VAN[r.id]} />
            </dt>
            <dd className={klasse(r)}>{waarde(r, "− ")}</dd>
            {/* Alleen een balk bij een bedrag; een lege balk zegt niets. */}
            {bekend && !fout && r.bedrag > 0 && (
              <dd className="mox-hiring-bar" aria-hidden="true">
                <span
                  className="mox-hiring-bar--plus"
                  style={{ inlineSize: `${pct(r.bedrag)}%` }}
                />
              </dd>
            )}
          </div>
        ))}
      </dl>
      {bekend && !fout && terug === 0 && (
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

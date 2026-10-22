"use client";

import { Alert, Heading, Paragraph } from "@/components/rhc";
import type { DemoAannemenTrace } from "@/demo";
import { invoerVan, loonkostenPerJaar } from "./_engine";
import { inRegister, onderMinimumloon, type Antwoorden } from "./_useAannemen";
import {
  type Berekening,
  type Stand,
  useBerekening,
  useManifest,
} from "./_useRegelrecht";
import { euro } from "./_werkgever";

/**
 * "Wat de regelingen opleveren": loonkosten (benadering) min loonkostensubsidie en
 * loonkostenvoordeel uit de regelrecht-engine, live bij elke wijziging van de
 * antwoorden. Compact (`kort`) voor de zijkolom van de aanvraag.
 */
const Balans = ({
  antwoorden,
  traces,
  kort,
}: {
  antwoorden: Antwoorden;
  traces: Record<string, DemoAannemenTrace>;
  kort?: boolean;
}) => {
  const register = inRegister(antwoorden);
  const lksTrace = traces["participatiewet:heeft_recht_op_lks"];
  const lkvTrace = traces["wet_tegemoetkomingen_loondomein:heeft_recht_op_lkv"];
  const rekent = register !== "nee";
  const lks = useBerekening(
    rekent && lksTrace
      ? invoerVan(lksTrace, antwoorden, ["hoogte_lks_eurocent_per_maand"])
      : null,
  );
  const lkv = useBerekening(
    rekent && lkvTrace
      ? invoerVan(lkvTrace, antwoorden, ["hoogte_lkv_per_jaar_eurocent"])
      : null,
  );
  const manifest = useManifest();

  const kosten = loonkostenPerJaar(antwoorden);
  // Tijdens het rekenen blijven de vorige bedragen staan; een nul zou als uitkomst lezen.
  const uitkomsten = (stand: Stand<Berekening>) =>
    stand.status === "klaar"
      ? stand.waarde.outputs
      : stand.status === "laden"
        ? stand.vorige?.outputs
        : undefined;
  const lksUit = uitkomsten(lks);
  const lkvUit = uitkomsten(lkv);
  const bekend = !rekent || (lksUit !== undefined && lkvUit !== undefined);
  const perMaand = Number(lksUit?.hoogte_lks_eurocent_per_maand ?? 0);
  const lksJaar = Math.round(perMaand * 12);
  const lkvJaar = Math.min(
    Number(lkvUit?.hoogte_lkv_per_jaar_eurocent ?? 0),
    Math.max(0, kosten - lksJaar),
  );
  const netto = Math.max(0, kosten - lksJaar - lkvJaar);
  const bedrag = (cent: number) => (bekend ? euro(cent) : "\u2026");
  const bezig = rekent && (lks.status === "laden" || lkv.status === "laden");
  const fout = [lks, lkv].find((s) => s.status === "fout");
  const pct = (v: number) =>
    kosten > 0 ? Math.min(100, Math.max(1, Math.round((v / kosten) * 100))) : 0;

  const bron = (
    <Paragraph className="mox-hiring-note" role={bezig ? "status" : undefined}>
      {bezig && "De regelrecht-engine rekent… "}
      {fout && fout.status === "fout"
        ? `Vooraf berekende bedragen (de engine in de browser is niet beschikbaar: ${fout.fout}). `
        : "Subsidie en voordeel berekend in uw browser door de regelrecht-engine"}
      {!fout &&
        manifest.status === "klaar" &&
        ` (engine ${manifest.waarde.regelrecht.slice(0, 8)}, corpus ${manifest.waarde.corpus.revisie.slice(0, 8)})`}
      {!fout && ". "}
      De loonkosten zijn een benadering. De gemeente stelt de loonwaarde vast.
    </Paragraph>
  );

  if (kort)
    return (
      <>
        <Heading level={2}>Wat dit u oplevert</Heading>
        <p className="mox-hiring-amount">{bedrag(lksJaar + lkvJaar)}</p>
        <Paragraph className="mox-hiring-note">
          per jaar: loonkostensubsidie {bedrag(lksJaar)} en loonkostenvoordeel{" "}
          {bedrag(lkvJaar)}, bij {antwoorden.uren} uur per week en{" "}
          {euro(antwoorden.uurloon)} per uur.
        </Paragraph>
        {bron}
      </>
    );

  if (register === "nee")
    return (
      <>
        <Heading level={3}>Loonkosten per jaar</Heading>
        <dl className="mox-hiring-balance">
          <div>
            <dt>Loonkosten</dt>
            <dd>{euro(kosten)}</dd>
            <span className="mox-hiring-bar">
              <span style={{ inlineSize: "100%" }} />
            </span>
          </div>
        </dl>
        <Alert type="warning">
          <Paragraph>
            Deze regelingen gelden waarschijnlijk niet. Staat de kandidaat niet
            in het doelgroepregister, dan kunnen andere regelingen gelden,
            bijvoorbeeld voor iemand met een WW- of WIA-uitkering. Die zijn in
            dit prototype niet uitgewerkt.
          </Paragraph>
        </Alert>
      </>
    );

  return (
    <>
      <Heading level={3}>Wat de regelingen opleveren</Heading>
      {register === "onbekend" && (
        <Paragraph className="mox-hiring-note">
          Als de kandidaat in het doelgroepregister staat.
        </Paragraph>
      )}
      <dl className="mox-hiring-balance">
        <div>
          <dt>Loonkosten</dt>
          <dd>{euro(kosten)}</dd>
          <span className="mox-hiring-bar">
            <span style={{ inlineSize: "100%" }} />
          </span>
        </div>
        {onderMinimumloon(antwoorden) && (
          <div>
            <dt>Loonkostensubsidie</dt>
            <dd>− {bedrag(lksJaar)}</dd>
            <span className="mox-hiring-bar">
              <span
                className="mox-hiring-bar--plus"
                style={{ inlineSize: `${pct(lksJaar)}%` }}
              />
            </span>
          </div>
        )}
        <div>
          <dt>Loonkostenvoordeel</dt>
          <dd>− {bedrag(lkvJaar)}</dd>
          <span className="mox-hiring-bar">
            <span
              className="mox-hiring-bar--plus"
              style={{ inlineSize: `${pct(lkvJaar)}%` }}
            />
          </span>
        </div>
      </dl>
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

export default Balans;

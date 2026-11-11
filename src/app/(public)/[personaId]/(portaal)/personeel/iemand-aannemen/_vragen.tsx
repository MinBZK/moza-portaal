"use client";

import StepNavigation from "@/components/StepNavigation";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import {
  Alert,
  Paragraph,
  UnorderedList,
  UnorderedListItem,
} from "@/components/rhc";
import InfoToggletip from "@/components/InfoToggletip";
import { BEGRIP, BegripInfo, NAAM } from "./_begrippen";
import RangeSlider from "@/components/RangeSlider";
import StickyInfoBox from "@/components/StickyInfoBox";
import SourceLinks, { type Source } from "@/components/SourceLinks";
import { BRON } from "./_wetsbronnen";
import Balans from "./_balans";
import { loonkostenPerJaar } from "./_engine";
import { balansRegels, type BalansRegel, type Regel } from "./_uitkomsten";
import { routeVoor } from "./_route";
import { useUitkomsten } from "./_useUitkomsten";
import { euro, euroHeel } from "./_werkgever";
import {
  WML_UUR_EUROCENT,
  isIngediend,
  nieuweAanvraag,
  useAannemen,
  type Antwoorden,
} from "./_useAannemen";
import AlIngediend from "./_alIngediend";
import DoelgroepVragen, {
  doelgroepVragenVan,
  vraagBeschut,
} from "./_doelgroepVragen";

/**
 * De standen van de schuifregelaar voor het uurloon, in eurocent: van €4,50
 * (het minimumjeugdloon voor 15 jaar, 30 procent van het minimumloon) tot
 * €30, per 50 cent. De stand het dichtst bij het minimumloon is het
 * minimumloon zelf, zodat de vooringevulde waarde een stand is.
 */
const UURLONEN = Array.from({ length: (3000 - 450) / 50 + 1 }, (_, i) => {
  const cent = 450 + i * 50;
  return Math.abs(cent - WML_UUR_EUROCENT) < 25 ? WML_UUR_EUROCENT : cent;
});

/** De stand van de schuifregelaar die het dichtst bij een uurloon ligt. */
const standVan = (cent: number) =>
  UURLONEN.reduce(
    (beste, waarde, i) =>
      Math.abs(waarde - cent) < Math.abs(UURLONEN[beste] - cent) ? i : beste,
    0,
  );

/**
 * Per regeling, voor het blok Termijn in de uitklap: wat de werkgever zelf op
 * tijd doet, en wanneer er een besluit is. Elk met de eigen bronnen.
 */
type Termijn = {
  id: Regel["id"];
  /** Wanneer er een besluit is, in één zin, na wat de werkgever zelf doet. */
  kort: string;
  bronnenKort: Source[];
  /** In de uitklap: de aanvraagtermijn of wat de werkgever zelf doet. */
  tekst: string;
  bronnen: Source[];
};

/**
 * De termijnen die bij de uitkomsten horen. Elke zin volgt uit de genoemde
 * bron: de wet, of de werkwijze van UWV ("Volgens UWV").
 */
const termijnenVoor = (regels: Regel[]): Termijn[] => {
  const geldt = (id: Regel["id"]) =>
    regels.find((r) => r.id === id && r.bedragPerJaar > 0);
  const lkv = geldt("lkv");
  const arbeidsgehandicapt = lkv?.categorie === "arbeidsgehandicapte_werknemer";
  return [
    ...(geldt("lks")
      ? [
          {
            id: "lks" as const,
            kort: "De gemeente beslist binnen 5 weken nadat zij de loonwaarde heeft vastgesteld. Voor het meten van de loonwaarde geldt geen termijn.",
            bronnenKort: [BRON.pwet10dLid12],
            // Pwet 10d lid 2 onder b: wie in de 6 maanden voor de start bij de
            // gemeente hoorde (art. 7 lid 1 onder a: bijstand, geen uitkering).
            tekst:
              "Is de werknemer al begonnen? Vraag dan aan binnen 6 maanden na de start. Dat kan als de werknemer in de 6 maanden daarvoor bij de gemeente hoorde, bijvoorbeeld met bijstand of zonder uitkering.",
            bronnen: [BRON.pwet10dLid2],
          },
        ]
      : []),
    ...(geldt("ld")
      ? [
          {
            id: "ld" as const,
            kort: "UWV beslist binnen 14 weken. Volgens UWV krijgt u meestal binnen 8 weken een brief.",
            bronnenKort: [BRON.wajong61],
            tekst:
              "Loondispensatie geldt vanaf de eerste dag van de maand waarin u die aanvraagt.",
            bronnen: [BRON.besluitLd4],
          },
        ]
      : []),
    ...(lkv
      ? [
          {
            id: "lkv" as const,
            kort: "U krijgt het bedrag in het jaar na de start. De Belastingdienst beslist vóór 1 augustus en betaalt binnen 6 weken daarna.",
            bronnenKort: [BRON.wtl42en44],
            tekst: arbeidsgehandicapt
              ? "De werknemer vraagt de doelgroepverklaring aan binnen 3 maanden na de start. U vraagt het loonkostenvoordeel aan in de loonaangifte."
              : "U vraagt het loonkostenvoordeel aan in de loonaangifte.",
            bronnen: arbeidsgehandicapt ? [BRON.wtl27] : [],
          },
        ]
      : []),
  ];
};

/** Wat de werkgever doet bij een regeling met een bedrag; het geld komt niet zonder iets. */
const WAT_U_DOET: Record<Regel["id"], (regel: Regel) => string | undefined> = {
  lks: () =>
    "De gemeente bepaalt in overleg met u wanneer zij de loonwaarde opnieuw vaststelt (Participatiewet, artikel 10d lid 6). Welke wijzigingen u doorgeeft, staat in de verordening van uw gemeente.",
  ld: () =>
    "U betaalt ten minste het loon dat UWV vaststelt; een lager loon afspreken mag niet. UWV bepaalt hoe lang de loondispensatie geldt, hoogstens 5 jaar. Daarna kan UWV die verlengen.",
  lkv: (regel) =>
    regel.categorie === "arbeidsgehandicapte_werknemer"
      ? "U bewaart de doelgroepverklaring van de werknemer bij uw loonadministratie."
      : undefined,
};

/**
 * De stap van de uitkomst uit de wet naar het bedrag per jaar op het scherm,
 * in gewone woorden. De wet rekent per maand of per uur; het portaal rekent
 * om naar een jaar.
 */
const naarJaar = (r: Regel, bedrag: number, a: Antwoorden) => {
  if (r.id === "lks")
    return `De gemeente betaalt per maand ongeveer ${euroHeel(r.bedragPerJaar / 12)}. Per jaar is dat ongeveer ${euroHeel(bedrag)}.`;
  if (r.id === "ld")
    return r.aanspraakPerUur === undefined
      ? `Per jaar betaalt u ongeveer ${euroHeel(bedrag)} minder aan loon.`
      : `U betaalt ${euro(r.aanspraakPerUur)} per uur in plaats van ${euro(WML_UUR_EUROCENT)}. Over een jaar is dat ongeveer ${euroHeel(bedrag)} minder, met vakantiegeld en werkgeverslasten.`;
  const arbeidsgehandicapt = r.categorie === "arbeidsgehandicapte_werknemer";
  return `${arbeidsgehandicapt ? "€3,05" : "€1,01"} per verloond uur keer ${a.uren * 52} uur per jaar, hoogstens ${arbeidsgehandicapt ? "€6.000" : "€2.000"}: ongeveer ${euroHeel(bedrag)} per jaar.`;
};

/**
 * Wat in de (i) van een regeling met een bedrag komt, na wanneer die geldt:
 * hoe het bedrag is berekend, wat de werkgever ervoor doet en de termijn met
 * de bron. De uitleg staat zo bij het bedrag, en alleen als de ondernemer
 * erom vraagt.
 */
const meerBij = (a: Antwoorden, regels: Regel[], r: BalansRegel): ReactNode => {
  if (!r.regel || r.bedrag <= 0) return null;
  const doet = WAT_U_DOET[r.id](r.regel);
  const termijn = termijnenVoor(regels).find((t) => t.id === r.id);
  return (
    <>
      <Paragraph>
        <strong>Zo berekend.</strong> {naarJaar(r.regel, r.bedrag, a)}
      </Paragraph>
      {doet && (
        <Paragraph>
          <strong>Wat u ervoor doet.</strong> {doet}
        </Paragraph>
      )}
      {termijn && (
        <>
          <Paragraph>
            <strong>Termijn.</strong> {termijn.tekst} {termijn.kort}
          </Paragraph>
          <SourceLinks sources={[...termijn.bronnen, ...termijn.bronnenKort]} />
        </>
      )}
    </>
  );
};

/**
 * Scherm 1: vier korte vragen met schuifregelaars, en rechts live wat de
 * regelingen opleveren. De berekening blijft op het scherm; er gaat niets naar een
 * overheidsorganisatie.
 */
const Vragen = () => {
  const { staat, werkBij } = useAannemen();
  if (!staat) return null;
  // Na het indienen blijft rekenen mogen; doorgaan start een nieuwe aanvraag
  // met deze antwoorden. De ingediende aanvraag verandert niet.
  const ingediend = isIngediend(staat);
  return (
    <>
      {ingediend && <AlIngediend knop={false} />}
      <VragenMetStaat
        nieuw={ingediend}
        a={staat.antwoorden}
        zet={(deel) =>
          werkBij({ antwoorden: { ...staat.antwoorden, ...deel } })
        }
      />
    </>
  );
};

const VragenMetStaat = ({
  a,
  zet,
  nieuw = false,
}: {
  a: Antwoorden;
  zet: (deel: Partial<Antwoorden>) => void;
  /** De aanvraag is al ingediend: doorgaan start een nieuwe. */
  nieuw?: boolean;
}) => {
  const router = useRouter();
  const { werkBij } = useAannemen();
  const resultaat = useUitkomsten(a);
  // Geen bedrag: de voorbeeldberekening levert niets op, ook geen regeling die
  // we niet meetellen (loonkostensubsidie bij beschut werk, die de gemeente
  // beoordeelt, en loondispensatie boven het minimumloon).
  const nietMeegeteld = resultaat.uitkomsten.aannames.some(
    (id) => id === "beschut_lks" || id === "ld_cao",
  );
  const geenBedrag =
    resultaat.bekend &&
    !resultaat.fout &&
    !nietMeegeteld &&
    balansRegels(resultaat.uitkomsten, loonkostenPerJaar(a)).every(
      (r) => r.bedrag <= 0,
    );
  // Verder kan als er een bedrag uitkomt of als er iets aan te vragen is.
  // Anders staat onder de berekening wat zonder aanvraag wel geldt (zoals de
  // no-riskpolis), en kan de ondernemer terug naar Personeel en rollen.
  const route = routeVoor(a.doelgroepen, resultaat.uitkomsten);
  const nietsAanTeVragen = geenBedrag && route.panelen.length === 0;
  const watGeldt = nietsAanTeVragen ? [...route.vanzelf, ...route.taken] : [];
  const kanVerder = resultaat.bekend && !resultaat.fout && !nietsAanTeVragen;
  // Beschut werk en het register sluiten elkaar uit (Wfsv 38b lid 1 aanhef):
  // zonder de vraag naar beschut werk schuiven de nummers erna een op.
  const { uitkering } = doelgroepVragenVan(a);
  const nr = (n: number) => (vraagBeschut(a) ? n + 1 : n);
  const wajong = uitkering === "wajong";
  // Werkgevers denken in uurloon of maandloon: de vraag gaat over het uurloon,
  // het maandloon en de loonkosten staan eronder.
  const maandloon = (a.uurloon * a.uren * 52) / 12;
  const onderWml = a.uurloon < WML_UUR_EUROCENT;

  return (
    <>
      <div className="rhc-grid">
        <div className="rhc-grid__cell rhc-grid__cell-t-7 rhc-mox-row-gap rhc-mox-stack--3xl">
          <DoelgroepVragen a={a} zet={zet} nummer={(n) => `${n}. `} />
          <RangeSlider
            label={`${nr(3)}. Hoeveel uur per week gaat de kandidaat werken?`}
            min={1}
            max={40}
            step={1}
            value={a.uren}
            onChange={(uren) => zet({ uren })}
            formatValue={(uren) => `${uren} uur`}
            filled
          />
          <div className="rhc-mox-stack rhc-mox-stack--sm">
            <RangeSlider
              label={`${nr(4)}. Hoeveel procent van het werk van een collega in dezelfde functie kan de kandidaat doen?`}
              min={0}
              max={100}
              step={5}
              value={a.loonwaarde}
              onChange={(loonwaarde) => zet({ loonwaarde })}
              formatValue={(loonwaarde) => `${loonwaarde} procent`}
              formatValueText={(loonwaarde) =>
                loonwaarde === 100
                  ? "100 procent: evenveel als een collega"
                  : `${loonwaarde} procent`
              }
              filled
              info={
                <InfoToggletip label="Toelichting bij hoeveel werk de kandidaat kan doen">
                  <Paragraph>
                    Dit heet de loonwaarde: hoeveel de kandidaat kan doen,
                    vergeleken met een collega in dezelfde functie. De gemeente
                    of UWV meet de loonwaarde later op de werkplek.
                  </Paragraph>
                  <Paragraph>
                    Wij rekenen met het percentage dat u kiest. Het echte bedrag
                    kan hoger of lager zijn.
                  </Paragraph>
                </InfoToggletip>
              }
            />
            {wajong && (
              <Paragraph className="rhc-mox-small-text">
                Bij een Wajong-uitkering stelt UWV vast welk deel van het
                minimumloon de kandidaat aankan.
              </Paragraph>
            )}
          </div>
          <div className="rhc-mox-stack rhc-mox-stack--sm">
            <RangeSlider
              label={`${nr(5)}. Wat wordt het bruto uurloon?`}
              min={0}
              max={UURLONEN.length - 1}
              step={1}
              value={standVan(a.uurloon)}
              onChange={(stand) => zet({ uurloon: UURLONEN[stand] })}
              formatValue={(stand) => euro(UURLONEN[stand])}
              formatValueText={(stand) =>
                UURLONEN[stand] === WML_UUR_EUROCENT
                  ? `${euro(UURLONEN[stand])} per uur: het wettelijk minimumloon`
                  : `${euro(UURLONEN[stand])} per uur`
              }
              filled
              info={
                <InfoToggletip label="Toelichting bij het uurloon">
                  <Paragraph>
                    Het bruto uurloon is het loon per uur vóór belasting, zonder
                    vakantiegeld.
                  </Paragraph>
                  <Paragraph>
                    Het wettelijk minimumloon is {euro(WML_UUR_EUROCENT)} per
                    uur, voor iemand van 21 jaar of ouder. Voor een jongere
                    kandidaat is het minimumloon lager.
                  </Paragraph>
                  <Paragraph>
                    Loonkosten zijn het brutoloon, plus 8 procent vakantiegeld
                    en ongeveer 20 procent werkgeverslasten.
                  </Paragraph>
                </InfoToggletip>
              }
            />
            <Paragraph className="rhc-mox-small-text">
              {a.uurloon === WML_UUR_EUROCENT &&
                "Dit is het wettelijk minimumloon voor iemand van 21 jaar of ouder. "}
              Bij {a.uren} uur per week is dat ongeveer {euroHeel(maandloon)}{" "}
              bruto per maand. De loonkosten zijn ongeveer{" "}
              {euroHeel(loonkostenPerJaar(a))} per jaar.
            </Paragraph>
            {onderWml && (
              <Alert type="warning">
                <Paragraph>
                  Dit uurloon is lager dan het wettelijk minimumloon van{" "}
                  {euro(WML_UUR_EUROCENT)} voor iemand van 21 jaar of ouder. Is
                  de kandidaat jonger? Dan geldt een lager minimumloon.
                  {wajong
                    ? " Bij loondispensatie stelt UWV vast hoeveel u minder mag betalen."
                    : " Anders mag u niet minder betalen dan het minimumloon."}
                </Paragraph>
              </Alert>
            )}
          </div>
        </div>
        <div className="rhc-grid__cell rhc-grid__cell-t-5">
          <StickyInfoBox title="Voorbeeldberekening">
            <Balans
              antwoorden={a}
              resultaat={resultaat}
              meer={(r) => meerBij(a, resultaat.uitkomsten.regels, r)}
            />
          </StickyInfoBox>
        </div>
      </div>

      <div className="rhc-mox-stack">
        <Paragraph role="status" id="aanvragen-bezig" tabIndex={-1}>
          {resultaat.fout
            ? "Wij kunnen de bedragen nu niet berekenen. Laad de pagina opnieuw."
            : !resultaat.bekend
              ? "Wij berekenen de bedragen…"
              : nietsAanTeVragen
                ? "Bij deze antwoorden komt er geen bedrag uit. U hoeft niets aan te vragen."
                : ""}
        </Paragraph>
        {watGeldt.length > 0 && (
          <>
            <Paragraph>Wel gelden deze regelingen:</Paragraph>
            <UnorderedList>
              {watGeldt.map((id) => (
                <UnorderedListItem key={id}>
                  {NAAM[id]}{" "}
                  {BEGRIP[id].map((b) => (
                    <BegripInfo key={b} id={b} />
                  ))}
                </UnorderedListItem>
              ))}
            </UnorderedList>
          </>
        )}
      </div>

      {/* Elke route begint bij de gegevens: toestemming en wat de overheid al
          weet. Zonder iets aan te vragen kan de ondernemer hier stoppen; dan
          is er geen knop om door te gaan. Kan het nog niet, dan zegt de
          statusmelding waarom. */}
      <StepNavigation
        back={nietsAanTeVragen ? "/personeel" : undefined}
        backLabel="Terug naar Personeel en rollen"
        next={
          nietsAanTeVragen
            ? undefined
            : {
                label: nieuw
                  ? "Nieuwe aanvraag starten"
                  : "Ja, ik wil regelingen aanvragen",
                busy: !resultaat.bekend && !resultaat.fout,
                describedBy: kanVerder ? undefined : "aanvragen-bezig",
                onClick: () => {
                  if (!kanVerder) {
                    document.getElementById("aanvragen-bezig")?.focus();
                    return;
                  }
                  if (nieuw) nieuweAanvraag(a);
                  werkBij({ voorbeeldBerekend: true });
                  router.push("/personeel/iemand-aannemen/gegevens");
                },
              }
        }
      />
    </>
  );
};

export default Vragen;

"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import {
  ActionGroup,
  Fieldset,
  FormFieldCheckboxOption,
  FormFieldRadio,
  FormFieldTextInput,
  Heading,
  Paragraph,
  UnorderedList,
  UnorderedListItem,
  Separator,
} from "@/components/rhc";
import InfoToggletip from "@/components/InfoToggletip";
import RangeSlider from "@/components/RangeSlider";
import StickyInfoBox from "@/components/StickyInfoBox";
import Balans, { Uitvoerder, type UitvoerderId } from "./_balans";
import type { BalansRegel, Overig, Regel } from "./_uitkomsten";
import { useUitkomsten } from "./_useUitkomsten";
import { euro } from "./_werkgever";
import {
  DOELGROEPEN,
  WML_UUR_EUROCENT,
  kiesDoelgroep,
  registerVast,
  useAannemen,
  type Antwoorden,
} from "./_useAannemen";

/** Bovengrens van "anders, namelijk" bij het uurloon: € 200 per uur. */
const MAX_UURLOON_EUROCENT = 20000;

/** "15,50" of "15.50" naar eurocent; null als het geen bedrag is. */
const naarEurocent = (tekst: string) => {
  const schoon = tekst.trim().replace(/^€\s*/, "").replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(schoon)) return null;
  return Math.round(Number(schoon) * 100);
};

const alsTekst = (cent: number) => (cent / 100).toFixed(2).replace(".", ",");

/** "Regelingen die verder kunnen gelden": naam en uitleg per uitkomst van de engine. */
const OVERIG: Record<
  Overig["id"],
  { naam: string; uitvoerder: UitvoerderId; tekst: (o: Overig) => string }
> = {
  nrp: {
    naam: "No-riskpolis",
    uitvoerder: "uwv",
    // ZW 29b lid 1, 2, 5 en 6; de loondoorbetaling blijft.
    tekst: (o) =>
      `Wordt uw werknemer ziek? Dan betaalt u het loon door. UWV betaalt u dan ziekengeld: 70 procent van het dagloon. In de eerste 52 weken van de ziekte kunt u UWV vragen om het hele dagloon, maar niet meer dan het loon. ${o.duurJaren === 5 ? "Dit geldt bij ziekte die begint in de eerste vijf jaar na de start van het dienstverband." : "Er is geen einddatum."}`,
  },
  pp_pwet: {
    naam: "Proefplaatsing",
    uitvoerder: "gemeente",
    // Pwet 6 h en 8a lid 2 d: onbeloond, vóór de dienstbetrekking, toestemming aan de kandidaat.
    tekst: () =>
      "Een proefplaats is onbetaald werk bij u, vóór de eerste werkdag. De proefplaats duurt twee maanden. Verlengen kan met ten hoogste vier maanden. De kandidaat vraagt de gemeente om toestemming.",
  },
  pp_ww: {
    naam: "Proefplaatsing met behoud van WW",
    uitvoerder: "uwv",
    tekst: () =>
      "De kandidaat werkt zes maanden bij u terwijl de WW-uitkering doorloopt, als UWV toestemming geeft.",
  },
  begeleiding: {
    naam: "Begeleiding op de werkplek (jobcoach)",
    uitvoerder: "gemeente",
    // Pwet 10da: een aanspraak van de werknemer.
    tekst: () =>
      "Uw werknemer heeft recht op begeleiding op de werkplek, bijvoorbeeld door een jobcoach. Dit loopt via de gemeente.",
  },
  vz_wia: {
    naam: "Jobcoaching en werkplekaanpassing",
    uitvoerder: "uwv",
    // Wet WIA 35 (werknemer vraagt aan) en 36 (subsidie meerkosten voor de werkgever).
    tekst: () =>
      "UWV kan uw werknemer een voorziening geven, zoals een jobcoach of een aangepaste werkplek. Uw werknemer vraagt dit zelf aan bij UWV. Maakt u zelf extra kosten voor een aangepaste werkplek? En duurt het dienstverband ten minste zes maanden? Dan kunt u bij UWV subsidie vragen voor die extra kosten. Daarvoor gelden meer voorwaarden. De kosten moeten bijvoorbeeld hoger zijn dan een drempelbedrag. UWV beslist of u de subsidie krijgt.",
  },
  vz_wajong: {
    naam: "Jobcoaching en werkplekaanpassing",
    uitvoerder: "uwv",
    // Wajong 2:22: de werknemer vraagt aan.
    tekst: () =>
      "Via de Wajong kan UWV uw werknemer een voorziening geven, zoals een jobcoach of een aangepaste werkplek. Uw werknemer vraagt dit zelf aan bij UWV.",
  },
};

/** Een termijn uit de wet, met het artikel waar hij staat. */
type Bron = { tekst: string; url: string };

/** Per regeling: de termijn voor de werkgever, wanneer die weet waar die aan toe is, en waar het staat. */
type Termijn = {
  id: string;
  regeling: string;
  tekst: string;
  wanneer: string;
  bronnen: Bron[];
  /** Uitleg over de regeling op het Digitaal Ondernemersplein. */
  meer: Bron;
};

const DOP = "https://ondernemersplein.overheid.nl";
const PWET = "https://wetten.overheid.nl/BWBR0015703/2026-07-01#Artikel10d";
const WTL = "https://wetten.overheid.nl/BWBR0037522/2026-01-01";

/**
 * De termijnen die bij de uitkomsten horen. Elke zin volgt uit de genoemde
 * bron: wet, verordening of de werkwijze van UWV.
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
            id: "lks",
            regeling: "Loonkostensubsidie",
            tekst:
              "Is de werknemer al begonnen? Vraag loonkostensubsidie dan aan binnen zes maanden na de eerste werkdag.",
            wanneer:
              "De gemeente beslist binnen vijf weken nadat zij de loonwaarde heeft vastgesteld.",
            bronnen: [
              {
                tekst: "Participatieverordening Rotterdam 2015, artikel 14",
                url: "https://zoek.officielebekendmakingen.nl/gmb-2023-286652.html",
              },
              {
                tekst: "Participatiewet, artikel 10d lid 2 en lid 12",
                url: PWET,
              },
            ],
            meer: {
              tekst: "Meer over loonkostensubsidie op Ondernemersplein",
              url: `${DOP}/personeel/personeelskosten-en-loon/verlaag-uw-loonkosten-met-subsidies-en-tegemoetkomingen/`,
            },
          },
        ]
      : []),
    ...(geldt("ld")
      ? [
          {
            id: "ld",
            regeling: "Loondispensatie",
            tekst:
              "Loondispensatie geldt vanaf de eerste dag van de maand waarin u die aanvraagt.",
            wanneer: "UWV beslist binnen acht weken na uw aanvraag.",
            bronnen: [
              {
                tekst: "Besluit loondispensatie Wajong, artikel 4",
                url: "https://wetten.overheid.nl/BWBR0020119/2010-08-19#Artikel4",
              },
              {
                tekst: "Algemene wet bestuursrecht, artikel 4:13",
                url: "https://wetten.overheid.nl/BWBR0005537/2024-01-01#Artikel4:13",
              },
            ],
            meer: {
              tekst: "Meer over loondispensatie op Ondernemersplein",
              url: `${DOP}/subsidies-en-regelingen/loondispensatie-wajong/`,
            },
          },
        ]
      : []),
    ...(lkv
      ? [
          {
            id: "lkv",
            regeling: "Loonkostenvoordeel",
            tekst: arbeidsgehandicapt
              ? "De werknemer vraagt de doelgroepverklaring aan binnen drie maanden na de start. U vraagt het loonkostenvoordeel aan in de loonaangifte."
              : "U vraagt het loonkostenvoordeel aan in de loonaangifte.",
            wanneer: arbeidsgehandicapt
              ? "UWV beslist binnen acht weken over de doelgroepverklaring. Het loonkostenvoordeel zelf krijgt u het jaar daarna: de Belastingdienst beslist vóór 1 augustus."
              : "U krijgt het loonkostenvoordeel het jaar daarna: de Belastingdienst beslist vóór 1 augustus.",
            bronnen: [
              ...(arbeidsgehandicapt
                ? [
                    {
                      tekst: "Wet tegemoetkomingen loondomein, artikel 2.7",
                      url: `${WTL}#Artikel2.7`,
                    },
                  ]
                : []),
              {
                tekst: "Wet tegemoetkomingen loondomein, artikel 4.2",
                url: `${WTL}#Artikel4.2`,
              },
            ],
            meer: {
              tekst: "Meer over het loonkostenvoordeel op Ondernemersplein",
              url: `${DOP}/subsidies-en-regelingen/loonkostenvoordeel-voor-werkgevers/`,
            },
          },
        ]
      : []),
  ];
};

const Extern = ({ bron, wat }: { bron: Bron; wat: string }) => (
  <a
    href={bron.url}
    className="utrecht-link utrecht-link--html-a"
    target="_blank"
    rel="external noopener noreferrer"
  >
    {bron.tekst} ({wat})
  </a>
);

/** Wat de werkgever doet bij een regeling met een bedrag; het geld komt niet zonder iets. */
const WAT_U_DOET: Record<Regel["id"], (regel: Regel) => string | undefined> = {
  lks: () =>
    "De gemeente spreekt met u en de werknemer af wanneer zij de loonwaarde opnieuw meet. Welke wijzigingen u doorgeeft, staat in de verordening van uw gemeente.",
  ld: () =>
    "U betaalt ten minste het loon dat UWV vaststelt; een lager loon afspreken mag niet. UWV bepaalt hoe lang de loondispensatie geldt, ten hoogste vijf jaar. Daarna kan UWV die verlengen.",
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
    return `De gemeente betaalt per maand ${euro(Math.round(r.bedragPerJaar / 12))}. Per jaar is dat ${euro(bedrag)}.`;
  if (r.id === "ld")
    return r.aanspraakPerUur === undefined
      ? `Per jaar betaalt u ongeveer ${euro(bedrag)} minder aan loon.`
      : `U betaalt ${euro(r.aanspraakPerUur)} per uur in plaats van ${euro(WML_UUR_EUROCENT)}. Het verschil keer ${a.uren} uur per week keer 52 weken, plus vakantiegeld en werkgeverslasten, is ongeveer ${euro(bedrag)} per jaar. Die laatste stap is een schatting.`;
  const arbeidsgehandicapt = r.categorie === "arbeidsgehandicapte_werknemer";
  return `${arbeidsgehandicapt ? "€3,05" : "€1,01"} per verloond uur keer ${a.uren * 52} uur per jaar, ten hoogste ${arbeidsgehandicapt ? "€6.000" : "€2.000"}: ${euro(bedrag)} per jaar.`;
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
            <strong>Termijn.</strong> {termijn.tekst} {termijn.wanneer}
          </Paragraph>
          <UnorderedList>
            {[...termijn.bronnen, termijn.meer].map((b) => (
              <UnorderedListItem key={b.url + b.tekst}>
                <Extern bron={b} wat="opent in een nieuw tabblad" />
              </UnorderedListItem>
            ))}
          </UnorderedList>
        </>
      )}
    </>
  );
};

/** De knop naar stap 2; werkt pas als de engine klaar is met rekenen. */
const AanvraagKnop = ({ bekend }: { bekend: boolean }) => (
  <ActionGroup>
    {/* Elke route begint bij de gegevens: toestemming en wat de overheid al weet. */}
    <Link
      href="/personeel/iemand-aannemen/gegevens"
      className="utrecht-button-link utrecht-button-link--html-a utrecht-button-link--primary-action"
      aria-disabled={bekend ? undefined : true}
      aria-describedby={bekend ? undefined : "aanvragen-bezig"}
      onClick={(event) => {
        if (!bekend) event.preventDefault();
      }}
    >
      Aanvraag invullen
    </Link>
  </ActionGroup>
);

/**
 * Scherm 1: vier korte vragen met schuifregelaars, en rechts live wat de
 * regelingen opleveren. De berekening blijft op het scherm; er gaat niets naar een
 * overheidsorganisatie.
 */
const Vragen = ({ onderneming }: { onderneming: string }) => {
  const { staat, werkBij } = useAannemen();
  if (!staat) return null;
  return (
    <VragenMetStaat
      onderneming={onderneming}
      a={staat.antwoorden}
      zet={(deel) => werkBij({ antwoorden: { ...staat.antwoorden, ...deel } })}
    />
  );
};

const VragenMetStaat = ({
  onderneming,
  a,
  zet,
}: {
  onderneming: string;
  a: Antwoorden;
  zet: (deel: Partial<Antwoorden>) => void;
}) => {
  const resultaat = useUitkomsten(a);
  const vast = registerVast(a);
  const wajong = a.doelgroepen.includes("wajong");
  const overige = resultaat.uitkomsten.overige.filter((o) => o.geldt);
  // Vraag 4: het minimumloon, of een eigen bedrag dat pas telt als het klopt.
  const [anders, setAnders] = useState(a.uurloon !== WML_UUR_EUROCENT);
  const [loonTekst, setLoonTekst] = useState(
    a.uurloon !== WML_UUR_EUROCENT ? alsTekst(a.uurloon) : "",
  );
  const loonCent = naarEurocent(loonTekst);
  const loonFout =
    !anders || loonTekst.trim() === ""
      ? undefined
      : loonCent === null
        ? "Vul een bedrag in, bijvoorbeeld 16,50."
        : loonCent < WML_UUR_EUROCENT
          ? `Vul ten minste het minimumloon in: ${euro(WML_UUR_EUROCENT)}.`
          : loonCent > MAX_UURLOON_EUROCENT
            ? `Vul een bedrag in tot ${euro(MAX_UURLOON_EUROCENT)}.`
            : undefined;
  const zetLoon = (tekst: string) => {
    setLoonTekst(tekst);
    const cent = naarEurocent(tekst);
    if (
      cent !== null &&
      cent >= WML_UUR_EUROCENT &&
      cent <= MAX_UURLOON_EUROCENT
    )
      zet({ uurloon: cent });
  };

  return (
    <>
      <Separator></Separator>

      <section className="rhc-mox-stack" aria-labelledby="gevolgen">
        <Heading level={2} id="gevolgen">
          Gevolgen voor {onderneming}
        </Heading>
        <div className="rhc-grid">
          <div className="rhc-grid__cell rhc-grid__cell-t-7 rhc-mox-row-gap rhc-mox-stack--3xl">
            <Fieldset legend="1. Wie wilt u aannemen? Kies wat past.">
              {DOELGROEPEN.map(([waarde, label]) => (
                <FormFieldCheckboxOption
                  key={waarde}
                  name="doelgroepen"
                  value={waarde}
                  label={label}
                  checked={a.doelgroepen.includes(waarde)}
                  disabled={waarde === "register" && vast}
                  description={
                    waarde === "register" && vast
                      ? "Iemand met een Wajong-uitkering staat in het doelgroepregister."
                      : undefined
                  }
                  onChange={(event) =>
                    zet({
                      doelgroepen: kiesDoelgroep(
                        a.doelgroepen,
                        waarde,
                        event.target.checked,
                      ),
                    })
                  }
                />
              ))}
            </Fieldset>
            <RangeSlider
              label="2. Hoeveel uur per week gaat de kandidaat werken?"
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
                label="3. Welke verminderde loonwaarde verwacht u?"
                min={30}
                max={100}
                step={5}
                value={a.loonwaarde}
                onChange={(loonwaarde) => zet({ loonwaarde })}
                formatValue={(loonwaarde) => `${loonwaarde} procent`}
                formatValueText={(loonwaarde) =>
                  loonwaarde === 100
                    ? "100 procent: geen verminderde loonwaarde"
                    : `${loonwaarde} procent`
                }
                filled
                info={
                  <InfoToggletip label="Toelichting bij de loonwaarde">
                    <Paragraph>
                      De loonwaarde is wat de kandidaat in het werk presteert,
                      in vergelijking met een collega zonder beperking in
                      dezelfde functie.
                    </Paragraph>
                    <Paragraph>
                      Onder 100 procent is de loonwaarde verminderd. Bij 100
                      procent is er geen loonkostensubsidie. Ook dan kan de
                      kandidaat begeleiding nodig hebben, zoals een jobcoach.
                    </Paragraph>
                    <Paragraph>
                      De gemeente meet de loonwaarde later op de werkplek.
                    </Paragraph>
                    <Paragraph>
                      Volgens de wet is de loonkostensubsidie altijd het
                      verschil tussen het minimumloon en de loonwaarde. Betaalt
                      u meer dan het minimumloon, dan krijgt u dus niet meer
                      subsidie. Het loonkostenvoordeel is een vast bedrag per
                      verloond uur. Een hoger uurloon maakt alleen uw loonkosten
                      hoger.
                    </Paragraph>
                  </InfoToggletip>
                }
              />
              {wajong && (
                <Paragraph className="rhc-mox-small-text">
                  Het percentage van het minimumloon dat de kandidaat aankan.
                  UWV stelt dit vast.
                </Paragraph>
              )}
            </div>
            <Fieldset legend="4. Wat wordt het bruto uurloon?">
              <FormFieldRadio
                name="uurloon"
                value="wml"
                label={`Wettelijk minimumloon: ${euro(WML_UUR_EUROCENT)} per uur`}
                description="Voor iemand van 21 jaar of ouder."
                checked={!anders}
                onChange={() => {
                  setAnders(false);
                  zet({ uurloon: WML_UUR_EUROCENT });
                }}
              />
              <FormFieldRadio
                name="uurloon"
                value="anders"
                label="Anders, namelijk:"
                checked={anders}
                onChange={() => {
                  setAnders(true);
                  zetLoon(loonTekst);
                }}
              />
              {anders && (
                <FormFieldTextInput
                  name="uurloon-anders"
                  label="Bruto uurloon in euro"
                  inputMode="decimal"
                  autoComplete="off"
                  description="Bijvoorbeeld 16,50"
                  value={loonTekst}
                  invalid={loonFout !== undefined}
                  errorMessage={loonFout}
                  // Het event komt van de input, maar is getypt op de wrapper-div.
                  onChange={(e) =>
                    zetLoon((e.target as HTMLInputElement).value)
                  }
                />
              )}
            </Fieldset>
          </div>
          <div className="rhc-grid__cell rhc-grid__cell-t-5">
            <StickyInfoBox title="Voorbeeldberekening: wat het u kan opleveren">
              <Paragraph className="rhc-mox-small-text">
                Een berekening vooraf met uw antwoorden. De beslissing neemt de
                organisatie die de regeling uitvoert.
              </Paragraph>
              <Balans
                antwoorden={a}
                resultaat={resultaat}
                meer={(r) => meerBij(a, resultaat.uitkomsten.regels, r)}
              />
              <AanvraagKnop bekend={resultaat.bekend} />
              <Paragraph className="rhc-mox-small-text">
                Wij vullen de aanvraag voor u in. U controleert en verstuurt
                zelf.
              </Paragraph>
              <Paragraph
                role="status"
                id="aanvragen-bezig"
                className="rhc-mox-small-text"
              >
                {resultaat.bekend
                  ? ""
                  : resultaat.fout
                    ? "De berekening is niet gelukt. Laad de pagina opnieuw."
                    : "De berekening is nog bezig."}
              </Paragraph>
            </StickyInfoBox>
          </div>
        </div>
      </section>

      <Separator></Separator>

      {overige.length > 0 && (
        <section className="rhc-mox-stack" aria-labelledby="overige">
          <Heading level={2} id="overige">
            Regelingen die verder kunnen gelden
          </Heading>
          <UnorderedList>
            {overige.map((o) => (
              <UnorderedListItem key={o.id}>
                <strong>{OVERIG[o.id].naam}</strong>{" "}
                <InfoToggletip
                  label={`Toelichting bij ${OVERIG[o.id].naam.toLowerCase()}`}
                >
                  <Paragraph>{OVERIG[o.id].tekst(o)}</Paragraph>
                  <Paragraph>
                    Of de regeling geldt, beslist de organisatie die haar
                    uitvoert.
                  </Paragraph>
                </InfoToggletip>{" "}
                <Uitvoerder id={OVERIG[o.id].uitvoerder} />
              </UnorderedListItem>
            ))}
          </UnorderedList>
        </section>
      )}
    </>
  );
};

export default Vragen;

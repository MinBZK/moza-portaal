"use client";

import StepNavigation from "@/components/StepNavigation";
import type { ReactNode } from "react";
import { Fieldset, FormFieldRadio, Paragraph } from "@/components/rhc";
import InfoToggletip from "@/components/InfoToggletip";
import { BegripInfo } from "./_begrippen";
import RangeSlider from "@/components/RangeSlider";
import StickyInfoBox from "@/components/StickyInfoBox";
import Balans from "./_balans";
import { loonkostenPerJaar } from "./_engine";
import {
  balansRegels,
  doelgroepenUit,
  UITKERINGEN,
  vragenUit,
  type BalansRegel,
  type InRegister,
  type Regel,
  type Uitkering,
} from "./_uitkomsten";
import { useUitkomsten } from "./_useUitkomsten";
import { euro, euroHeel } from "./_werkgever";
import { WML_UUR_EUROCENT, useAannemen, type Antwoorden } from "./_useAannemen";

/** De check bij UWV of iemand in het doelgroepregister staat. */
const UWV_REGISTER =
  "https://www.uwv.nl/nl/doelgroepregister/staat-werknemer-in-doelgroepregister";

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

/** Een termijn uit de wet, met het artikel waar hij staat. */
type Bron = { tekst: string; url: string };

/** Per regeling: de termijn voor de werkgever, wanneer die weet waar die aan toe is, en waar het staat. */
type Termijn = {
  id: string;
  regeling: string;
  tekst: string;
  wanneer: string;
  bronnen: Bron[];
};

const PWET = "https://wetten.overheid.nl/BWBR0015703/2026-07-01#Artikel10d";
const WTL = "https://wetten.overheid.nl/BWBR0037522/2026-01-01";
/** De beslistermijn van acht weken als de wet zelf geen termijn noemt. */
const AWB_4_13: Bron = {
  tekst: "Algemene wet bestuursrecht, artikel 4:13",
  url: "https://wetten.overheid.nl/BWBR0005537/2024-01-01#Artikel4:13",
};

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
              "Is de werknemer nog niet begonnen? Dan beslist de gemeente binnen vijf weken nadat zij de loonwaarde heeft vastgesteld. Is de werknemer al begonnen? Dan beslist de gemeente uiterlijk acht weken na uw aanvraag.",
            bronnen: [
              {
                tekst: "Participatiewet, artikel 10d lid 2 en lid 12",
                url: PWET,
              },
              AWB_4_13,
            ],
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
              AWB_4_13,
            ],
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
                    AWB_4_13,
                  ]
                : []),
              {
                tekst: "Wet tegemoetkomingen loondomein, artikel 4.2",
                url: `${WTL}#Artikel4.2`,
              },
            ],
          },
        ]
      : []),
  ];
};

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
    return `De gemeente betaalt per maand ongeveer ${euroHeel(r.bedragPerJaar / 12)}. Per jaar is dat ongeveer ${euroHeel(bedrag)}.`;
  if (r.id === "ld")
    return r.aanspraakPerUur === undefined
      ? `Per jaar betaalt u ongeveer ${euroHeel(bedrag)} minder aan loon.`
      : `U betaalt ${euro(r.aanspraakPerUur)} per uur in plaats van ${euro(WML_UUR_EUROCENT)}. Over een jaar is dat ongeveer ${euroHeel(bedrag)} minder, met vakantiegeld en werkgeverslasten.`;
  const arbeidsgehandicapt = r.categorie === "arbeidsgehandicapte_werknemer";
  return `${arbeidsgehandicapt ? "€3,05" : "€1,01"} per verloond uur keer ${a.uren * 52} uur per jaar, ten hoogste ${arbeidsgehandicapt ? "€6.000" : "€2.000"}: ongeveer ${euroHeel(bedrag)} per jaar.`;
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
            <strong>Termijn.</strong> {termijn.tekst} {termijn.wanneer} (
            {termijn.bronnen.map((b) => b.tekst).join("; ")})
          </Paragraph>
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
  return (
    <VragenMetStaat
      a={staat.antwoorden}
      zet={(deel) => werkBij({ antwoorden: { ...staat.antwoorden, ...deel } })}
    />
  );
};

const VragenMetStaat = ({
  a,
  zet,
}: {
  a: Antwoorden;
  zet: (deel: Partial<Antwoorden>) => void;
}) => {
  const resultaat = useUitkomsten(a);
  // Verder kan pas als de voorbeeldberekening een bedrag oplevert, of als een
  // regeling geldt die we niet meetellen: loonkostensubsidie bij beschut werk
  // (de gemeente beoordeelt die) en loondispensatie boven het minimumloon.
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
  const kanVerder = resultaat.bekend && !resultaat.fout && !geenBedrag;
  // Register, beschut werk en uitkering; oudere opslag kent alleen de
  // doelgroepen, of nog de uitkering "andere" (die rekende als geen).
  const afgeleid = vragenUit(a.doelgroepen);
  const register = a.register ?? afgeleid.register;
  const beschut = a.beschut ?? afgeleid.beschut;
  const uitkering =
    UITKERINGEN.find(([w]) => w === a.uitkering)?.[0] ?? afgeleid.uitkering;
  // De vraag naar beschut werk staat er alleen bij Ja; de nummers erna schuiven mee.
  const metBeschut = register === "ja";
  const nr = (n: number) => (metBeschut ? n + 1 : n);
  const zetVraag = (deel: {
    register?: InRegister;
    beschut?: boolean;
    uitkering?: Uitkering;
  }) => {
    const r = deel.register ?? register;
    const b = (deel.beschut ?? beschut) && r === "ja";
    const u = deel.uitkering ?? uitkering;
    zet({
      register: r,
      beschut: b,
      uitkering: u,
      doelgroepen: doelgroepenUit(r, b, u),
    });
  };
  const wajong = uitkering === "wajong";
  // De laatste vraag toont loonkosten; daaronder ligt het uurloon (UURLONEN).
  const loonkostenBij = (stand: number) =>
    loonkostenPerJaar({ ...a, uurloon: UURLONEN[stand] });

  return (
    <>
      <div className="rhc-grid">
        <div className="rhc-grid__cell rhc-grid__cell-t-7 rhc-mox-row-gap rhc-mox-stack--3xl">
          <div className="rhc-mox-stack rhc-mox-stack--sm">
            <Fieldset
              legend="1. Staat de persoon in het doelgroepregister?"
              info={<BegripInfo id="doelgroepregister" />}
            >
              {(
                [
                  ["ja", "Ja"],
                  ["nee", "Nee"],
                  ["onbekend", "Weet ik niet"],
                ] as const
              ).map(([waarde, label]) => (
                <FormFieldRadio
                  key={waarde}
                  name="register"
                  value={waarde}
                  label={label}
                  checked={register === waarde}
                  onChange={() => zetVraag({ register: waarde })}
                />
              ))}
            </Fieldset>
            {register === "onbekend" && (
              <Paragraph className="rhc-mox-small-text">
                <a
                  href={UWV_REGISTER}
                  className="utrecht-link utrecht-link--html-a"
                  target="_blank"
                  rel="external noopener noreferrer"
                >
                  Controleer bij UWV of de persoon in het doelgroepregister
                  staat (opent in een nieuw tabblad)
                </a>
                .
                {/* Wajong zet het register aan (kiesDoelgroep), dus dan niet. */}
                {uitkering !== "wajong" &&
                  " Tot dan rekenen wij alsof de persoon er niet in staat."}
              </Paragraph>
            )}
          </div>
          {metBeschut && (
            <Fieldset
              legend="2. Is de persoon door de gemeente aangewezen op beschut werk?"
              info={
                <InfoToggletip label="Toelichting bij beschut werk">
                  <Paragraph>
                    Beschut werk is werk met veel begeleiding en aangepaste
                    omstandigheden. Het is voor iemand die alleen zo kan werken.
                  </Paragraph>
                  <Paragraph>
                    De gemeente beslist of iemand beschut werk nodig heeft. UWV
                    geeft daarover advies (Participatiewet, artikel 10b).
                  </Paragraph>
                </InfoToggletip>
              }
            >
              <FormFieldRadio
                name="beschut"
                value="ja"
                label="Ja"
                checked={beschut}
                onChange={() => zetVraag({ beschut: true })}
              />
              <FormFieldRadio
                name="beschut"
                value="nee"
                label="Nee"
                checked={!beschut}
                onChange={() => zetVraag({ beschut: false })}
              />
            </Fieldset>
          )}
          <Fieldset legend={`${nr(2)}. Heeft de persoon een uitkering?`}>
            {UITKERINGEN.map(([waarde, label]) => (
              <FormFieldRadio
                key={waarde}
                name="uitkering"
                value={waarde}
                label={label}
                checked={uitkering === waarde}
                description={
                  waarde === "wajong" && register !== "ja"
                    ? "Iemand met een Wajong-uitkering staat in het doelgroepregister."
                    : undefined
                }
                onChange={() => zetVraag({ uitkering: waarde })}
              />
            ))}
          </Fieldset>
          <RangeSlider
            label={`${nr(3)}. Hoeveel uur per week gaat de persoon werken?`}
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
              label={`${nr(4)}. Hoeveel procent van het werk van een collega in dezelfde functie kan de persoon doen?`}
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
                <InfoToggletip label="Toelichting bij hoeveel werk uw werknemer kan doen">
                  <Paragraph>
                    Dit heet de loonwaarde: hoeveel de persoon kan doen,
                    vergeleken met een collega in dezelfde functie. De gemeente
                    of UWV meet de loonwaarde later op de werkplek.
                  </Paragraph>
                  <Paragraph>
                    Wij rekenen met het percentage dat u kiest. Het echte bedrag
                    kan hoger of lager zijn.
                  </Paragraph>
                  <Paragraph>
                    De gemeente betaalt u het verschil tussen het minimumloon en
                    de loonwaarde. Dat heet loonkostensubsidie. U krijgt
                    hoogstens 70 procent van het minimumloon, plus een
                    vergoeding voor werkgeverslasten. Betaalt u meer dan het
                    minimumloon? Dan wordt de subsidie niet hoger.
                  </Paragraph>
                </InfoToggletip>
              }
            />
            {wajong && (
              <Paragraph className="rhc-mox-small-text">
                Bij een Wajong-uitkering stelt UWV vast welk deel van het
                minimumloon de werknemer aankan.
              </Paragraph>
            )}
          </div>
          <div className="rhc-mox-stack rhc-mox-stack--sm">
            <RangeSlider
              label={`${nr(5)}. Wat worden de loonkosten per jaar?`}
              min={0}
              max={UURLONEN.length - 1}
              step={1}
              value={standVan(a.uurloon)}
              onChange={(stand) => zet({ uurloon: UURLONEN[stand] })}
              formatValue={(stand) => euroHeel(loonkostenBij(stand))}
              formatValueText={(stand) =>
                UURLONEN[stand] === WML_UUR_EUROCENT
                  ? `${euroHeel(loonkostenBij(stand))} per jaar: loonkosten bij het wettelijk minimumloon`
                  : `${euroHeel(loonkostenBij(stand))} per jaar`
              }
              filled
              info={
                <InfoToggletip label="Toelichting bij de loonkosten">
                  <Paragraph>
                    Loonkosten zijn het brutoloon, plus 8 procent vakantiegeld
                    en ongeveer 20 procent werkgeverslasten.
                  </Paragraph>
                  <Paragraph>
                    Het wettelijk minimumloon is {euro(WML_UUR_EUROCENT)} per
                    uur, voor iemand van 21 jaar of ouder. Voor een jongere
                    werknemer is het minimumloon lager.
                  </Paragraph>
                </InfoToggletip>
              }
            />
            <Paragraph className="rhc-mox-small-text">
              Bij {a.uren} uur per week is dat een bruto uurloon van{" "}
              {euro(a.uurloon)}
              {a.uurloon === WML_UUR_EUROCENT && ": het wettelijk minimumloon"}.
            </Paragraph>
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
        <Paragraph role="status" id="aanvragen-bezig">
          {resultaat.fout
            ? "De berekening is niet gelukt. Laad de pagina opnieuw."
            : !resultaat.bekend
              ? "De berekening is nog bezig."
              : geenBedrag
                ? "Bij deze antwoorden komt er geen bedrag uit. Pas uw antwoorden aan om verder te gaan."
                : ""}
        </Paragraph>
      </div>

      {/* Elke route begint bij de gegevens: toestemming en wat de overheid al weet. */}
      <StepNavigation
        next={{
          label: "Ja, ik wil doorgaan",
          href: "/personeel/iemand-aannemen/gegevens",
          disabled: !kanVerder,
          describedBy: kanVerder ? undefined : "aanvragen-bezig",
        }}
      />
    </>
  );
};

export default Vragen;

"use client";

import StepNavigation from "@/components/StepNavigation";
import { useState, type ReactNode } from "react";
import {
  Fieldset,
  FormFieldRadio,
  FormFieldTextInput,
  Paragraph,
  Separator,
} from "@/components/rhc";
import InfoToggletip from "@/components/InfoToggletip";
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
import { euro } from "./_werkgever";
import { terugNaar, verderNaar } from "./_stappen";
import { WML_UUR_EUROCENT, useAannemen, type Antwoorden } from "./_useAannemen";

/** De check bij UWV of iemand in het doelgroepregister staat. */
const UWV_REGISTER =
  "https://www.uwv.nl/nl/doelgroepregister/staat-werknemer-in-doelgroepregister";

/** Bovengrens van "anders, namelijk" bij het uurloon: € 200 per uur. */
const MAX_UURLOON_EUROCENT = 20000;

/** "15,50" of "15.50" naar eurocent; null als het geen bedrag is. */
const naarEurocent = (tekst: string) => {
  const schoon = tekst.trim().replace(/^€\s*/, "").replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(schoon)) return null;
  return Math.round(Number(schoon) * 100);
};

const alsTekst = (cent: number) => (cent / 100).toFixed(2).replace(".", ",");

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
                tekst: "Participatiewet, artikel 10d lid 2 en lid 12",
                url: PWET,
              },
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
              {
                tekst: "Algemene wet bestuursrecht, artikel 4:13",
                url: "https://wetten.overheid.nl/BWBR0005537/2024-01-01#Artikel4:13",
              },
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
    return `De gemeente betaalt per maand ${euro(Math.round(r.bedragPerJaar / 12))}. Per jaar is dat ${euro(bedrag)}.`;
  if (r.id === "ld")
    return r.aanspraakPerUur === undefined
      ? `Per jaar betaalt u ongeveer ${euro(bedrag)} minder aan loon.`
      : `U betaalt ${euro(r.aanspraakPerUur)} per uur in plaats van ${euro(WML_UUR_EUROCENT)}. Over een jaar is dat ongeveer ${euro(bedrag)} minder, met vakantiegeld en werkgeverslasten.`;
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
  // Vraag 1, 1a en 2; oudere opslag kent alleen de doelgroepen.
  const afgeleid = vragenUit(a.doelgroepen);
  const register = a.register ?? afgeleid.register;
  const beschut = a.beschut ?? afgeleid.beschut;
  const uitkering = a.uitkering ?? afgeleid.uitkering;
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
  // Vraag 5: vooringevuld met het minimumloon; een eigen bedrag telt pas als het klopt.
  const [loonTekst, setLoonTekst] = useState(alsTekst(a.uurloon));
  const loonCent = naarEurocent(loonTekst);
  const loonFout =
    loonTekst.trim() === ""
      ? "Vul het bruto uurloon in, bijvoorbeeld 16,50."
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

      <div className="rhc-grid">
        <div className="rhc-grid__cell rhc-grid__cell-t-7 rhc-mox-row-gap rhc-mox-stack--3xl">
          <div className="rhc-mox-stack rhc-mox-stack--sm">
            <Fieldset legend="1. Staat de persoon in het doelgroepregister?">
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
          {register === "ja" && (
            <Fieldset legend="1a. Is de persoon door de gemeente aangewezen op beschut werk?">
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
          <Fieldset legend="2. Heeft de persoon een uitkering?">
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
            label="3. Hoeveel uur per week gaat de persoon werken?"
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
              label="4. Hoeveel werk kan uw werknemer doen, vergeleken met een collega die volledig inzetbaar is?"
              min={30}
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
                    Dit heet de loonwaarde: wat de werknemer presteert,
                    vergeleken met een collega zonder beperking in dezelfde
                    functie. De gemeente of UWV meet die later op de werkplek.
                  </Paragraph>
                  <Paragraph>
                    Wij rekenen met het midden van wat u kiest. Het echte bedrag
                    kan daardoor hoger of lager uitvallen.
                  </Paragraph>
                  <Paragraph>
                    De loonkostensubsidie is het verschil tussen het minimumloon
                    en de loonwaarde, ten hoogste 70 procent van het
                    minimumloon. Een hoger uurloon geeft geen hogere subsidie.
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
          <FormFieldTextInput
            name="uurloon"
            label="5. Wat wordt het bruto uurloon in euro?"
            inputMode="decimal"
            autoComplete="off"
            description={`Vooringevuld met het wettelijk minimumloon: ${euro(WML_UUR_EUROCENT)} per uur, voor iemand van 21 jaar of ouder. Betaalt u meer? Vul dan uw bedrag in, bijvoorbeeld 16,50.`}
            value={loonTekst}
            invalid={loonFout !== undefined}
            errorMessage={loonFout}
            // Het event komt van de input, maar is getypt op de wrapper-div.
            onChange={(e) => zetLoon((e.target as HTMLInputElement).value)}
          />
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
        <Paragraph>
          Deze voorbeeldberekening laat niet alle mogelijkheden zien. Er kunnen
          meer regelingen gelden dan hier staan.
        </Paragraph>
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
        back="/personeel/iemand-aannemen"
        backLabel={terugNaar(1)}
        next={{
          label: verderNaar(3),
          href: "/personeel/iemand-aannemen/gegevens",
          disabled: !kanVerder,
          describedBy: kanVerder ? undefined : "aanvragen-bezig",
        }}
      />
    </>
  );
};

export default Vragen;

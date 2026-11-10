"use client";

import StepNavigation from "@/components/StepNavigation";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import {
  Alert,
  Fieldset,
  FormFieldRadio,
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
import { routeVoor } from "./_route";
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

/** Per regeling: de termijn voor de werkgever, wanneer die weet waar die aan toe is, en waar het staat. */
type Termijn = {
  id: Regel["id"];
  /** Eén zin voor de lijst onder de berekening: wanneer er een besluit is. */
  kort: string;
  tekst: string;
  wanneer: string;
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
            kort: "Loonkostensubsidie: de gemeente beslist binnen vijf weken nadat zij de loonwaarde heeft vastgesteld. Voor het meten van de loonwaarde geldt geen termijn.",
            tekst:
              "Is de werknemer al begonnen? Vraag loonkostensubsidie dan aan binnen zes maanden na de start van het dienstverband.",
            wanneer:
              "Is de werknemer nog niet begonnen? Dan beslist de gemeente binnen vijf weken nadat zij de loonwaarde heeft vastgesteld, of nadat zij heeft besloten die later vast te stellen. Is de werknemer al begonnen? Dan beslist de gemeente binnen acht weken na uw aanvraag, tenzij zij u laat weten dat het langer duurt.",
            bronnen: [BRON.pwet10dLid2en12, BRON.awb],
          },
        ]
      : []),
    ...(geldt("ld")
      ? [
          {
            id: "ld" as const,
            kort: "Loondispensatie: UWV beslist binnen 14 weken. Volgens UWV krijgt u meestal binnen acht weken een brief.",
            tekst:
              "Loondispensatie geldt vanaf de eerste dag van de maand waarin u die aanvraagt.",
            wanneer:
              "UWV beslist binnen 14 weken na uw aanvraag, tenzij UWV u laat weten dat het langer duurt. Volgens UWV krijgt u meestal binnen acht weken een brief.",
            bronnen: [BRON.besluitLd4, BRON.wajong61],
          },
        ]
      : []),
    ...(lkv
      ? [
          {
            id: "lkv" as const,
            kort: "Loonkostenvoordeel: u krijgt het het jaar na de start. De Belastingdienst beslist vóór 1 augustus.",
            tekst: arbeidsgehandicapt
              ? "De werknemer vraagt de doelgroepverklaring aan binnen drie maanden na de start. U vraagt het loonkostenvoordeel aan in de loonaangifte."
              : "U vraagt het loonkostenvoordeel aan in de loonaangifte.",
            wanneer: arbeidsgehandicapt
              ? "UWV beslist binnen acht weken over de doelgroepverklaring, tenzij UWV laat weten dat het langer duurt. Het loonkostenvoordeel zelf krijgt u het jaar daarna: de Belastingdienst beslist vóór 1 augustus en betaalt binnen zes weken na dat besluit."
              : "U krijgt het loonkostenvoordeel het jaar daarna: de Belastingdienst beslist vóór 1 augustus en betaalt binnen zes weken na dat besluit.",
            bronnen: [
              ...(arbeidsgehandicapt ? [BRON.wtl27, BRON.awb] : []),
              BRON.wtl42en44,
            ],
          },
        ]
      : []),
  ];
};

/** Wat de werkgever doet bij een regeling met een bedrag; het geld komt niet zonder iets. */
const WAT_U_DOET: Record<Regel["id"], (regel: Regel) => string | undefined> = {
  lks: () =>
    "De gemeente bepaalt in overleg met u en de werknemer wanneer zij de loonwaarde opnieuw vaststelt (Participatiewet, artikel 10d lid 6). Welke wijzigingen u doorgeeft, staat in de verordening van uw gemeente.",
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
            <strong>Termijn.</strong> {termijn.tekst} {termijn.wanneer}
          </Paragraph>
          <SourceLinks sources={termijn.bronnen} />
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
  const router = useRouter();
  const resultaat = useUitkomsten(a);
  const termijnen = termijnenVoor(resultaat.uitkomsten.regels);
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
  // Register, beschut werk en uitkering; oudere opslag kent alleen de
  // doelgroepen, of nog de uitkering "andere" (die rekende als geen).
  const afgeleid = vragenUit(a.doelgroepen);
  const register = a.register ?? afgeleid.register;
  const beschut = a.beschut ?? afgeleid.beschut;
  const uitkering =
    UITKERINGEN.find(([w]) => w === a.uitkering)?.[0] ?? afgeleid.uitkering;
  // Beschut werk en het register sluiten elkaar uit (Wfsv 38b lid 1 aanhef):
  // de vraag naar beschut werk staat er niet bij Ja. De nummers erna schuiven mee.
  const metBeschut = register !== "ja";
  const nr = (n: number) => (metBeschut ? n + 1 : n);
  const zetVraag = (deel: {
    register?: InRegister;
    beschut?: boolean;
    uitkering?: Uitkering;
  }) => {
    const r = deel.register ?? register;
    const b = (deel.beschut ?? beschut) && r !== "ja";
    const u = deel.uitkering ?? uitkering;
    zet({
      register: r,
      beschut: b,
      uitkering: u,
      doelgroepen: doelgroepenUit(r, b, u),
    });
  };
  const wajong = uitkering === "wajong";
  // Werkgevers denken in uurloon of maandloon: de vraag gaat over het uurloon,
  // het maandloon en de loonkosten staan eronder.
  const maandloon = (a.uurloon * a.uren * 52) / 12;
  const onderWml = a.uurloon < WML_UUR_EUROCENT;

  return (
    <>
      <div className="rhc-grid">
        <div className="rhc-grid__cell rhc-grid__cell-t-7 rhc-mox-row-gap rhc-mox-stack--3xl">
          <div className="rhc-mox-stack rhc-mox-stack--sm">
            <Fieldset
              legend="1. Staat de kandidaat in het doelgroepregister?"
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
                  Controleer bij UWV of de kandidaat in het doelgroepregister
                  staat (opent in een nieuw tabblad)
                </a>
                .
                {/* Wajong zet het register aan (kiesDoelgroep), dus dan niet. */}
                {uitkering !== "wajong" &&
                  " Tot dan rekenen wij alsof de kandidaat er niet in staat."}
              </Paragraph>
            )}
          </div>
          {metBeschut && (
            <Fieldset
              legend="2. Is de kandidaat door de gemeente aangewezen op beschut werk?"
              info={
                <InfoToggletip label="Toelichting bij beschut werk">
                  <Paragraph>
                    Beschut werk is werk in een beschutte omgeving, onder
                    aangepaste omstandigheden. Het is voor iemand die alleen zo
                    kan werken.
                  </Paragraph>
                  <Paragraph>
                    De gemeente beslist of iemand beschut werk nodig heeft. UWV
                    geeft daarover advies (Participatiewet, artikel 10b).
                  </Paragraph>
                  <Paragraph>
                    Wie beschut werkt, telt niet mee voor de banenafspraak (Wet
                    financiering sociale verzekeringen, artikel 38b lid 1).
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
          <Fieldset legend={`${nr(2)}. Heeft de kandidaat een uitkering?`}>
            {UITKERINGEN.map(([waarde, label]) => (
              <FormFieldRadio
                key={waarde}
                name="uitkering"
                value={waarde}
                label={label}
                checked={uitkering === waarde}
                description={
                  waarde === "wajong" && register !== "ja" && !beschut
                    ? "Iemand met een Wajong-uitkering staat in het doelgroepregister."
                    : undefined
                }
                onChange={() => zetVraag({ uitkering: waarde })}
              />
            ))}
          </Fieldset>
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
                  <Paragraph>
                    De gemeente betaalt u het verschil tussen het minimumloon en
                    de loonwaarde. Dat heet loonkostensubsidie. U krijgt
                    hoogstens 70 procent van het minimumloon met vakantiegeld.
                    Daarbovenop krijgt u een vergoeding voor werkgeverslasten.
                    Betaalt u meer dan het minimumloon? Dan wordt de subsidie
                    niet hoger.
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
                "Dit is het wettelijk minimumloon. "}
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
            {/* Wanneer er een besluit is, ook zonder uitklappen: alleen termijnen uit de wet of van UWV. */}
            {resultaat.bekend && !resultaat.fout && termijnen.length > 0 && (
              <div className="rhc-mox-stack rhc-mox-stack--sm">
                <Paragraph>
                  <strong>Wanneer u een besluit krijgt</strong>
                </Paragraph>
                <UnorderedList className="rhc-mox-small-text">
                  {termijnen.map((t) => (
                    <UnorderedListItem key={t.id}>{t.kort}</UnorderedListItem>
                  ))}
                </UnorderedList>
              </div>
            )}
          </StickyInfoBox>
        </div>
      </div>

      <div className="rhc-mox-stack">
        <Paragraph role="status" id="aanvragen-bezig" tabIndex={-1}>
          {resultaat.fout
            ? "De berekening is niet gelukt. Laad de pagina opnieuw."
            : !resultaat.bekend
              ? "De berekening is nog bezig."
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
                label: "Ja, ik wil doorgaan",
                busy: !resultaat.bekend && !resultaat.fout,
                describedBy: kanVerder ? undefined : "aanvragen-bezig",
                onClick: () => {
                  if (kanVerder)
                    router.push("/personeel/iemand-aannemen/gegevens");
                  else document.getElementById("aanvragen-bezig")?.focus();
                },
              }
        }
      />
    </>
  );
};

export default Vragen;

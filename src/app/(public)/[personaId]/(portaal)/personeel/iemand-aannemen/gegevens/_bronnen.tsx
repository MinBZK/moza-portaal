"use client";

import LoadingStatus from "@/components/LoadingStatus";
import StepNavigation from "@/components/StepNavigation";
import RangeSlider from "@/components/RangeSlider";
import InfoToggletip from "@/components/InfoToggletip";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useAssistentZaken,
  veld as zaakVeld,
  zaakRoute,
} from "../../../lopendezaken/_assistentZaken";
import { Fragment, useEffect, useState } from "react";
import { BegripInfo } from "../_begrippen";
import { overKandidaat } from "../_opgehaald";
import {
  ActionGroup,
  Alert,
  Button,
  Fieldset,
  FormFieldErrorMessage,
  FormFieldRadio,
  FormFieldTextInput,
  Heading,
  Paragraph,
  UnorderedList,
  UnorderedListItem,
} from "@/components/rhc";
import type { DemoAannemen } from "@/demo";
import {
  isIngediend,
  eigenOpgaveCompleet,
  STANDAARD_ANTWOORDEN,
  useAannemen,
  vraagEerderInDienst,
  type AannemenStaat,
  type Antwoorden,
} from "../_useAannemen";
import AlIngediend from "../_alIngediend";
import DoelgroepVragen from "../_doelgroepVragen";
import { routeVoor, situatieVan } from "../_route";
import { useUitkomsten } from "../_useUitkomsten";
import Stappen, { verderNaar } from "../_stappen";
import SourceLinks, { type Source } from "@/components/SourceLinks";
import { BRON } from "../_wetsbronnen";

const NIEUW = "nieuw";

/** Negen cijfers en de elfproef van het BSN. */
const elfproef = (bsn: string) => {
  if (!/^\d{9}$/.test(bsn)) return false;
  const som = [...bsn].reduce(
    (t, c, i) => t + Number(c) * (i === 8 ? -1 : 9 - i),
    0,
  );
  return som % 11 === 0;
};

/**
 * Wat alleen de werkgever weet: de eerste werkdag, de functie, de uren, het
 * loon en, bij WIA, of de kandidaat al eerder bij de werkgever werkte. Vooringevuld met de antwoorden van de voorbeeldberekening waar die er zijn; nu
 * definitief. De loonwaarde staat hier niet: die stelt de gemeente of UWV
 * vast, niet de werkgever.
 */
const EigenOpgave = ({
  voornaam,
  a,
  zet,
  keuzes,
  kies,
  vraagJc,
  vraagWpa,
  aanvangFout,
  eerderFout,
  overgenomen,
  jcFout,
  wpaFout,
  bezig,
}: {
  voornaam: string;
  a: Antwoorden;
  zet: (deel: Partial<Antwoorden>) => void;
  keuzes: AannemenStaat["keuzes"];
  kies: (deel: AannemenStaat["keuzes"]) => void;
  /** Alleen als jobcoaching of werkplekaanpassing bij de aanvraag hoort. */
  vraagJc: boolean;
  vraagWpa: boolean;
  aanvangFout?: string;
  eerderFout?: string;
  /** De uren komen uit de voorbeeldberekening (niet bij Regelingen aanvragen). */
  overgenomen: boolean;
  jcFout?: string;
  wpaFout?: string;
  /** The calculation is still running: the questions for the request follow. */
  bezig: boolean;
}) => {
  // Zonder ingevulde naam heet de kandidaat "de kandidaat".
  // Die variant is in de huidige flow niet te zien.
  const wie = voornaam.trim() || "de kandidaat";
  return (
    // Onder de gekozen kandidaat: deze vragen gaan over die persoon.
    <div
      id="eigen-opgave"
      role="group"
      aria-label={`Over ${wie}`}
      className="rhc-mox-stack"
    >
      <FormFieldTextInput
        id="eerste-werkdag"
        name="aanvang"
        type="date"
        label={`Wat is de eerste werkdag van ${wie}?`}
        invalid={!!aanvangFout}
        errorMessage={aanvangFout}
        value={a.aanvang ?? ""}
        onChange={(event) =>
          zet({
            aanvang: (event.target as HTMLInputElement).value || undefined,
          })
        }
      />
      {/* Dezelfde vraag als in de voorbeeldberekening, nu definitief: de
        waarde komt uit dezelfde antwoorden (a.uren). */}
      <RangeSlider
        label={`Hoeveel uur per week gaat ${wie} werken?`}
        description={
          overgenomen
            ? "Overgenomen uit de voorbeeldberekening. U kunt het hier aanpassen."
            : undefined
        }
        min={1}
        max={40}
        step={1}
        value={a.uren}
        onChange={(uren) => zet({ uren })}
        formatValue={(uren) => `${uren} uur`}
        filled
      />
      {vraagEerderInDienst(a) && (
        <Fieldset
          id="eerder-in-dienst"
          legend={`Was ${wie} in de 6 maanden voor de eerste werkdag al bij u in dienst?`}
          info={
            <InfoToggletip label="Toelichting bij eerder in dienst">
              <Paragraph>
                Werkte {wie} in de 6 maanden voor de eerste werkdag bij u? Dan
                krijgt u geen loonkostenvoordeel voor een arbeidsgehandicapte
                werknemer (Wet tegemoetkomingen loondomein, artikel 2.6).
              </Paragraph>
            </InfoToggletip>
          }
          invalid={!!eerderFout}
          aria-describedby={eerderFout ? "eerder-in-dienst-fout" : undefined}
        >
          {eerderFout && (
            <FormFieldErrorMessage id="eerder-in-dienst-fout">
              {eerderFout}
            </FormFieldErrorMessage>
          )}
          <FormFieldRadio
            name="eerder-in-dienst"
            value="ja"
            label="Ja"
            checked={a.eerderInDienst === true}
            onChange={() => zet({ eerderInDienst: true })}
          />
          <FormFieldRadio
            name="eerder-in-dienst"
            value="nee"
            label="Nee"
            checked={a.eerderInDienst === false}
            onChange={() => zet({ eerderInDienst: false })}
          />
        </Fieldset>
      )}
      {/* Keuzes voor de aanvraag horen hier; stap 2 controleert alleen. */}
      {bezig && (
        <LoadingStatus>Wij zoeken uit welke regelingen gelden…</LoadingStatus>
      )}
      {vraagJc && (
        <Fieldset
          id="jobcoaching-vraag"
          legend="Wilt u jobcoaching aanvragen?"
          info={<BegripInfo id="jobcoaching" />}
          invalid={!!jcFout}
          aria-describedby={jcFout ? "jobcoaching-fout" : undefined}
        >
          {jcFout && (
            <FormFieldErrorMessage id="jobcoaching-fout">
              {jcFout}
            </FormFieldErrorMessage>
          )}
          <FormFieldRadio
            name="jc"
            value="ja"
            label="Ja, via de gemeente"
            checked={keuzes.jc === "ja"}
            onChange={() => kies({ jc: "ja" })}
          />
          <FormFieldRadio
            name="jc"
            value="nee"
            label="Nee, niet nodig"
            checked={keuzes.jc === "nee"}
            onChange={() => kies({ jc: "nee" })}
          />
        </Fieldset>
      )}
      {vraagWpa && (
        <Fieldset
          id="werkplek-vraag"
          legend="Is er een aanpassing van de werkplek nodig?"
          info={<BegripInfo id="werkplekaanpassing" />}
          invalid={!!wpaFout}
          aria-describedby={wpaFout ? "werkplek-fout" : undefined}
        >
          {wpaFout && (
            <FormFieldErrorMessage id="werkplek-fout">
              {wpaFout}
            </FormFieldErrorMessage>
          )}
          <FormFieldRadio
            name="wpa"
            value="ja"
            label="Ja, ik weet wat er nodig is"
            checked={keuzes.wpa === "ja"}
            onChange={() => kies({ wpa: "ja" })}
          />
          <FormFieldRadio
            name="wpa"
            value="later"
            label="Weet ik nog niet, ik vraag het later aan"
            checked={keuzes.wpa === "later"}
            onChange={() => kies({ wpa: "later" })}
          />
          <FormFieldRadio
            name="wpa"
            value="nee"
            label="Nee"
            checked={keuzes.wpa === "nee"}
            onChange={() => kies({ wpa: "nee" })}
          />
        </Fieldset>
      )}
    </div>
  );
};

/**
 * De kandidaat kiezen of toevoegen, en het omgekeerde formulier:
 * alles wat de overheid al weet in een tabel, per bron een vinkje dat
 * standaard aan staat. De werkgever geeft de werknemer op met naam en BSN, zoals
 * nu bij de gemeente en UWV; de organisaties kijken met het BSN in hun eigen
 * gegevens. De grond van registratie in het doelgroepregister ziet de
 * werkgever niet: UWV geeft alleen ja of nee.
 */
const Bronnen = ({
  perSituatie,
}: {
  perSituatie: Record<"gemeente" | "wajong" | "wia", DemoAannemen>;
}) => {
  const router = useRouter();
  const { staat, werkBij } = useAannemen();
  const situatie = situatieVan(staat?.antwoorden.doelgroepen ?? []);
  // Zonder iets om aan te vragen gaat de route na de gegevens naar het overzicht.
  const antwoorden = staat?.antwoorden ?? STANDAARD_ANTWOORDEN;
  const resultaat = useUitkomsten(antwoorden);
  // Zonder aanvraag (alleen register of uitleg) gaat het BSN nergens mee.
  const route = resultaat.bekend
    ? routeVoor(antwoorden.doelgroepen, resultaat.uitkomsten)
    : undefined;
  const geenAanvraag = !!route?.overzicht;
  const paneelIds = route?.panelen.flatMap((p) => p.ids) ?? [];
  const situatieSleutel =
    situatie === "wajong" || situatie === "wia" ? situatie : "gemeente";
  const { bronnen, kandidaat } = perSituatie[situatieSleutel];
  const zaken = useAssistentZaken();
  const [nieuw, setNieuw] = useState({ naam: "", bsn: "" });
  // Een BSN heeft negen cijfers en voldoet aan de elfproef.
  const bsn = nieuw.bsn.trim();
  const bsnGoed = elfproef(bsn);
  // De melding pas na het verlaten van het veld, niet tijdens het typen.
  const [bsnGezien, setBsnGezien] = useState(false);
  const bsnFout =
    bsn === "" || bsnGoed
      ? undefined
      : /^\d{9}$/.test(bsn)
        ? "Dit BSN klopt niet. Controleer het nummer."
        : "Een BSN heeft 9 cijfers. Controleer het nummer.";
  const keuze = staat?.kandidaat;
  const nieuwe = staat?.kandidatenNieuw ?? [];
  const gekozen = keuze === kandidaat.bsnMasker;
  // Loopt er voor deze kandidaat al een aanvraag? Oudere zaken zonder
  // kandidaat herkennen we aan de situatie: die hoort bij één kandidaat.
  const lopend = gekozen
    ? zaken?.find(
        (zaak) =>
          zaak.flow === "iemand-aannemen" &&
          (zaak.kandidaat
            ? zaak.kandidaat === kandidaat.bsnMasker
            : zaakVeld(zaak, ["situatie"]) === situatieSleutel),
      )
    : undefined;
  const [dubbelOk, setDubbelOk] = useState<string>();
  const dubbel = !!lopend && dubbelOk !== kandidaat.bsnMasker;
  const wachtend = nieuwe.find((k) => k.naam === keuze);
  // De loonwaarde is nog niet gemeten als de gemeente dat zo opgeeft.
  const loonwaardeNogNiet = bronnen.some((b) =>
    b.gegevens.some(
      (g) =>
        g.parameter === "college_heeft_loonwaarde_vastgesteld" &&
        g.waarde.startsWith("Nog niet"),
    ),
  );
  // Hoe lang het kan duren voordat de werkgever weet waar die aan toe is:
  // termijnen uit de wet of van UWV. Voor het meten van de loonwaarde noemt
  // de wet geen termijn; daarom alleen "vaak een paar maanden".
  const duur: { zin: string; bronnen: Source[] }[] = [
    ...(situatie === "gemeente" && loonwaardeNogNiet
      ? [
          {
            zin: `Een aanvraag duurt vaak een paar maanden. Eerst komt een loonwaardedeskundige kijken naar het werk van ${kandidaat.voornaam} op de werkplek. Daarna beslist de gemeente.`,
            bronnen: [BRON.besluitLks3, BRON.awb],
          },
        ]
      : []),
    ...(situatie === "wajong"
      ? [
          {
            zin: "Voor loondispensatie komt een arbeidsdeskundige van UWV meestal op de werkplek. UWV beslist binnen 14 weken na uw aanvraag. Volgens UWV krijgt u meestal binnen 8 weken een brief.",
            bronnen: [BRON.wajong61],
          },
        ]
      : []),
    ...(situatie === "wia"
      ? [
          {
            zin: "De werknemer vraagt de doelgroepverklaring aan bij UWV. UWV beslist meestal binnen 8 weken. Ontbreekt er informatie? Dan beslist UWV binnen 13 weken.",
            bronnen: [],
          },
        ]
      : []),
  ];
  const opgave = eigenOpgaveCompleet(antwoorden);
  const naam = `${kandidaat.voornaam} ${kandidaat.achternaam}`;
  const { wie, meer, eigen } = overKandidaat(bronnen, situatie);

  // Everything that still stops Verder, in the order of the form.
  type Veld =
    | "dubbel"
    | "kandidaat"
    | "naam"
    | "bsn"
    | "toestemming"
    | "aanvang"
    | "eerder"
    | "jc"
    | "wpa";
  const keuzes = staat?.keuzes ?? {};
  const ontbrekend: Veld[] = gekozen
    ? [
        ...(dubbel ? (["dubbel"] as const) : []),
        ...(antwoorden.aanvang ? [] : (["aanvang"] as const)),
        ...(vraagEerderInDienst(antwoorden) &&
        antwoorden.eerderInDienst === undefined
          ? (["eerder"] as const)
          : []),
        ...(paneelIds.includes("jc") && !keuzes.jc ? (["jc"] as const) : []),
        ...(paneelIds.includes("wpa") && !keuzes.wpa ? (["wpa"] as const) : []),
      ]
    : keuze !== NIEUW
      ? ["kandidaat"]
      : !nieuw.naam.trim() || !bsnGoed
        ? [
            ...(nieuw.naam.trim() ? [] : (["naam"] as const)),
            ...(bsnGoed ? [] : (["bsn"] as const)),
          ]
        : ["toestemming"];
  const ontbreekt = ontbrekend[0];
  // Set when Verder is clicked: every field missing then gets its message,
  // until it is filled in. A new message only comes with the next click.
  const [foutBij, setFoutBij] = useState<Veld[]>([]);
  const fout = (veld: Veld) =>
    foutBij.includes(veld) && ontbrekend.includes(veld);
  const dubbelFout = fout("dubbel")
    ? "Kies of u toch een nieuwe aanvraag wilt doen."
    : undefined;
  const kandidaatFout = fout("kandidaat")
    ? wachtend
      ? "Deze kandidaat heeft nog geen toestemming gegeven. Kies een kandidaat met toestemming."
      : "U heeft nog geen kandidaat gekozen."
    : undefined;
  const naamFout = fout("naam")
    ? "U heeft nog geen naam van de kandidaat ingevuld."
    : undefined;
  const aanvangFout = fout("aanvang")
    ? "U heeft nog geen eerste werkdag ingevuld."
    : undefined;
  const eerderFout = fout("eerder")
    ? `Kies of ${kandidaat.voornaam} in de 6 maanden voor de eerste werkdag al bij u in dienst was.`
    : undefined;
  const jcFout = fout("jc")
    ? "Kies of u jobcoaching wilt aanvragen."
    : undefined;
  const wpaFout = fout("wpa")
    ? "Kies of er een aanpassing van de werkplek nodig is."
    : undefined;
  const bsnVeldFout =
    fout("bsn") && bsn === ""
      ? "U heeft nog geen BSN ingevuld."
      : fout("bsn") || bsnGezien
        ? bsnFout
        : undefined;

  const ANKER: Record<Veld, string> = {
    dubbel: "dubbel-doorgaan",
    kandidaat: "kandidaat",
    naam: "kandidaat-naam",
    bsn: "kandidaat-bsn",
    toestemming: "toestemming-vragen",
    aanvang: "eerste-werkdag",
    eerder: "eerder-in-dienst",
    jc: "jobcoaching-vraag",
    wpa: "werkplek-vraag",
  };
  const veldVan = (veld: Veld) =>
    veld === "dubbel"
      ? document.getElementById("dubbel-doorgaan")
      : veld === "naam"
        ? document.querySelector<HTMLElement>("#kandidaat-naam input")
        : veld === "bsn"
          ? document.querySelector<HTMLElement>("#kandidaat-bsn input")
          : veld === "toestemming"
            ? document.getElementById("toestemming-vragen")
            : veld === "aanvang"
              ? document.querySelector<HTMLElement>("#eerste-werkdag input")
              : veld === "eerder" || veld === "jc" || veld === "wpa"
                ? document.querySelector<HTMLElement>(
                    `input[name="${veld === "eerder" ? "eerder-in-dienst" : veld}"]`,
                  )
                : (document.querySelector<HTMLElement>(
                    'input[name="kandidaat"]:checked',
                  ) ??
                  document.querySelector<HTMLElement>(
                    'input[name="kandidaat"]',
                  ));

  // Something is still missing: show every message, and put the focus on
  // the first link in the summary at the top. Each try moves the focus again.
  const [poging, setPoging] = useState(0);
  const naarInvoer = () => {
    if (!ontbreekt) return;
    setFoutBij(ontbrekend);
    setPoging((keer) => keer + 1);
  };
  useEffect(() => {
    if (poging)
      document.querySelector<HTMLElement>("#fout-samenvatting a")?.focus();
  }, [poging]);

  // The messages, in the order of the form, for the summary at the top.
  const meldingen = ontbrekend.filter(fout).map((veld) => ({
    veld,
    tekst:
      veld === "dubbel"
        ? dubbelFout
        : veld === "kandidaat"
          ? kandidaatFout
          : veld === "naam"
            ? naamFout
            : veld === "bsn"
              ? (bsnVeldFout ?? "U heeft nog geen geldig BSN ingevuld.")
              : veld === "toestemming"
                ? "U heeft nog geen toestemming gevraagd."
                : veld === "aanvang"
                  ? aanvangFout
                  : veld === "eerder"
                    ? eerderFout
                    : veld === "jc"
                      ? jcFout
                      : wpaFout,
  }));

  const voegToe = () => {
    const n = nieuw.naam.trim();
    // Nog niet compleet: zeg wat ontbreekt en ga naar dat veld.
    if (!n || !bsnGoed) {
      naarInvoer();
      return;
    }
    werkBij({
      kandidatenNieuw: [
        ...nieuwe.filter((k) => k.naam !== n),
        {
          naam: n,
          bsn: `•••••${nieuw.bsn.trim().slice(-4)}`,
          gevraagdOp: new Date().toISOString().slice(0, 10),
        },
      ],
      kandidaat: n,
    });
    setNieuw({ naam: "", bsn: "" });
    setBsnGezien(false);
  };

  if (staat && isIngediend(staat))
    return (
      <>
        <Stappen huidige={1} volgendeBereikbaar={false} />
        <AlIngediend />
      </>
    );

  return (
    <>
      <Stappen
        huidige={1}
        volgendeBereikbaar={gekozen && opgave && resultaat.bekend}
      />
      {meldingen.length > 0 && (
        <div id="fout-samenvatting">
          <Alert type="error">
            <Paragraph>Er ontbreekt nog iets:</Paragraph>
            <UnorderedList>
              {meldingen.map(({ veld, tekst }) => (
                <UnorderedListItem key={veld}>
                  <a
                    href={`#${ANKER[veld]}`}
                    onClick={(event) => {
                      event.preventDefault();
                      veldVan(veld)?.focus();
                    }}
                  >
                    {tekst}
                  </a>
                </UnorderedListItem>
              ))}
            </UnorderedList>
          </Alert>
        </div>
      )}
      {/* Direct via Regelingen aanvragen: de werkgever geeft zelf op wat
          bepaalt welke regelingen gelden. Het portaal leidt dat niet af uit
          gegevens over de gezondheid van de kandidaat (AVG, artikel 9). */}
      {staat?.voorbeeldBerekend === false && (
        <section className="rhc-mox-stack" aria-labelledby="over-kandidaat">
          <Heading level={2} id="over-kandidaat">
            Over de kandidaat
          </Heading>
          <DoelgroepVragen
            a={antwoorden}
            zet={(deel) => werkBij({ antwoorden: { ...antwoorden, ...deel } })}
          />
        </section>
      )}
      <section className="rhc-mox-stack" aria-labelledby="kandidaat">
        <Heading level={2} id="kandidaat">
          Wie wilt u aannemen?
        </Heading>
        <Paragraph>
          Wij vragen de kandidaat eerst om toestemming.{" "}
          {wie.charAt(0).toUpperCase() + wie.slice(1)}{" "}
          {meer ? "zoeken" : "zoekt"} de kandidaat op met het
          burgerservicenummer (BSN).
        </Paragraph>
        <Fieldset
          legend="Kandidaat"
          invalid={!!kandidaatFout}
          aria-describedby={kandidaatFout ? "kandidaat-fout" : undefined}
        >
          {kandidaatFout && (
            <FormFieldErrorMessage id="kandidaat-fout">
              {kandidaatFout}
            </FormFieldErrorMessage>
          )}
          <FormFieldRadio
            name="kandidaat"
            value={kandidaat.bsnMasker}
            label={
              <>
                {naam}
                <span className="rhc-mox-regular">
                  , BSN eindigt op {kandidaat.bsnMasker.slice(-4)}
                </span>
              </>
            }
            checked={gekozen}
            onChange={() => werkBij({ kandidaat: kandidaat.bsnMasker })}
          />
          {nieuwe.map((k) => (
            <FormFieldRadio
              key={k.naam}
              name="kandidaat"
              value={k.naam}
              label={
                <>
                  {k.naam}
                  <span className="rhc-mox-regular">
                    {k.bsn && `, BSN eindigt op ${k.bsn.slice(-4)}`}
                  </span>
                </>
              }
              checked={keuze === k.naam}
              onChange={() => werkBij({ kandidaat: k.naam })}
            />
          ))}
          <FormFieldRadio
            name="kandidaat"
            value={NIEUW}
            label="Andere kandidaat toevoegen"
            checked={keuze === NIEUW}
            onChange={() => werkBij({ kandidaat: NIEUW })}
          />
        </Fieldset>
        {gekozen && dubbel && lopend && (
          <Alert type="warning">
            <Paragraph>
              Voor {naam} loopt al een aanvraag
              {zaakVeld(lopend, ["onderwerp"])
                ? `: ${zaakVeld(lopend, ["onderwerp"])}`
                : ""}
              . Weet u zeker dat u een nieuwe aanvraag wilt doen?
            </Paragraph>
            {dubbelFout && (
              <FormFieldErrorMessage id="dubbel-fout">
                {dubbelFout}
              </FormFieldErrorMessage>
            )}
            <ActionGroup>
              <Button
                id="dubbel-doorgaan"
                appearance="secondary-action-button"
                aria-describedby={dubbelFout ? "dubbel-fout" : undefined}
                onClick={() => setDubbelOk(kandidaat.bsnMasker)}
              >
                Ja, toch een nieuwe aanvraag doen
              </Button>
              {zaakRoute(lopend) && (
                <Link
                  href={zaakRoute(lopend)}
                  className="utrecht-link utrecht-link--html-a"
                >
                  Bekijk de aanvraag die al loopt
                </Link>
              )}
            </ActionGroup>
          </Alert>
        )}
        {keuze === NIEUW && (
          <div className="rhc-mox-row-gap">
            <FormFieldTextInput
              id="kandidaat-naam"
              label="Voor- en achternaam"
              invalid={!!naamFout}
              errorMessage={naamFout}
              // Not the user's own data: the browser must not fill in the
              // user's name or date of birth here (WCAG 1.3.5).
              autoComplete="off"
              value={nieuw.naam}
              onChange={(event) =>
                setNieuw({
                  ...nieuw,
                  naam: (event.target as HTMLInputElement).value,
                })
              }
            />
            <FormFieldTextInput
              id="kandidaat-bsn"
              label="Burgerservicenummer (BSN)"
              inputMode="numeric"
              autoComplete="off"
              value={nieuw.bsn}
              invalid={bsnVeldFout !== undefined}
              errorMessage={bsnVeldFout}
              onChange={(event) =>
                setNieuw({
                  ...nieuw,
                  bsn: (event.target as HTMLInputElement).value,
                })
              }
              onBlur={() => setBsnGezien(true)}
            />
            <Paragraph className="rhc-mox-small-text">
              Vraag het BSN pas als u de kandidaat wilt aannemen. Werkt de
              kandidaat al bij u? Dan staat het BSN in uw loonadministratie.
              Gebruik het alleen voor deze aanvraag.
            </Paragraph>
            {fout("toestemming") && (
              <FormFieldErrorMessage id="toestemming-fout">
                U heeft nog geen toestemming gevraagd. Kies{" "}
                <strong>Toestemming vragen aan kandidaat</strong>.
              </FormFieldErrorMessage>
            )}
            {/* TODO: uitleggen hoe en waar de kandidaat het toestemmingsverzoek
                krijgt. Tekst nog te bepalen door het team. */}
            <ActionGroup>
              <Button
                id="toestemming-vragen"
                appearance="secondary-action-button"
                aria-describedby={
                  fout("toestemming")
                    ? "toestemming-fout toestemming-melding"
                    : "toestemming-melding"
                }
                onClick={voegToe}
              >
                Toestemming vragen aan kandidaat
              </Button>
            </ActionGroup>
            {/* TODO: het kanaal van de melding noemen (bijvoorbeeld de
                berichtenbox). Nog te bevestigen door het team. */}
            <Paragraph id="toestemming-melding" className="rhc-mox-small-text">
              U krijgt een melding zodra de kandidaat toestemming heeft gegeven.
            </Paragraph>
          </div>
        )}
        {gekozen && !geenAanvraag && (
          <Paragraph className="rhc-mox-small-text">
            Het BSN gaat mee met de aanvraag.
          </Paragraph>
        )}
        {gekozen && (
          <EigenOpgave
            voornaam={kandidaat.voornaam}
            a={antwoorden}
            zet={(deel) => werkBij({ antwoorden: { ...antwoorden, ...deel } })}
            keuzes={staat?.keuzes ?? {}}
            kies={(deel) =>
              werkBij({
                keuzes: { ...(staat?.keuzes ?? {}), ...deel },
                // Een andere keuze is een andere aanvraag: controleer die opnieuw.
                gecontroleerd: {
                  ...(staat?.gecontroleerd ?? {}),
                  ...Object.fromEntries(
                    Object.keys(deel).map((id) => [id, false]),
                  ),
                },
              })
            }
            vraagJc={paneelIds.includes("jc")}
            vraagWpa={paneelIds.includes("wpa")}
            aanvangFout={aanvangFout}
            eerderFout={eerderFout}
            overgenomen={staat?.voorbeeldBerekend !== false}
            jcFout={jcFout}
            wpaFout={wpaFout}
            bezig={!resultaat.bekend && !resultaat.fout}
          />
        )}
      </section>

      {wachtend && (
        <section className="rhc-mox-stack" aria-labelledby="overheid-weet">
          <Heading level={2} id="overheid-weet">
            Gegevens die de overheid kan ophalen voor de berekening
          </Heading>
          <Paragraph>
            Wij vragen {wachtend.naam} eerst om toestemming. Daarna{" "}
            {meer ? "kijken" : "kijkt"} {wie} met het BSN in {eigen}.
          </Paragraph>
          <Paragraph>
            Tot {wachtend.naam} toestemming geeft, kunt u hier niet verder. Wij
            onthouden uw antwoorden tot u dit tabblad sluit.
          </Paragraph>
        </section>
      )}

      {gekozen && duur.length > 0 && (
        <section className="rhc-mox-stack" aria-labelledby="hoe-lang">
          <Heading level={2} id="hoe-lang">
            Hoe lang het kan duren
          </Heading>
          {duur.map(({ zin, bronnen }) => (
            <Fragment key={zin}>
              <Paragraph>{zin}</Paragraph>
              <SourceLinks sources={bronnen} />
            </Fragment>
          ))}
        </section>
      )}

      <div className="rhc-mox-stack">
        <Paragraph role="status">
          {wachtend
            ? `Wacht op toestemming van ${wachtend.naam}.`
            : keuze === NIEUW
              ? "U kunt verder als de kandidaat toestemming heeft gegeven."
              : !gekozen
                ? ""
                : !opgave
                  ? vraagEerderInDienst(antwoorden)
                    ? `Vul de eerste werkdag van ${kandidaat.voornaam} in. Kies ook of ${kandidaat.voornaam} al eerder bij u werkte.`
                    : `Vul de eerste werkdag van ${kandidaat.voornaam} in.`
                  : "Wij vullen de aanvraag voor u in. In de volgende stap controleert u die."}
        </Paragraph>
        <StepNavigation
          back="/personeel/iemand-aannemen/voorbeeldberekening"
          backLabel="Terug naar Voorbeeldberekening"
          later="/personeel"
          next={{
            label: verderNaar(2),
            // Verder werkt altijd: ontbreekt er iets, dan wijst de stap het
            // veld aan. Is alles ingevuld maar rekent de stap nog (welke
            // regelingen er vragen nodig hebben), dan wacht Verder zichtbaar.
            // Stap 2 heeft één vorm, ook als er niets te versturen is.
            busy: !ontbreekt && !resultaat.bekend && !resultaat.fout,
            onClick: () => {
              if (ontbreekt) naarInvoer();
              else if (resultaat.bekend || resultaat.fout)
                router.push("/personeel/iemand-aannemen/concept-aanvraag");
            },
          }}
        />
      </div>
    </>
  );
};

export default Bronnen;

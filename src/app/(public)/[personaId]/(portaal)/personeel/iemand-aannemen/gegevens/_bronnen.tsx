"use client";

import { focusAtTop } from "@/utils/focusAtTop";
import StepNavigation from "@/components/StepNavigation";
import RangeSlider from "@/components/RangeSlider";
import { useRouter } from "next/navigation";
import { useState } from "react";
import InfoToggletip from "@/components/InfoToggletip";
import {
  Accordion,
  AccordionSection,
  ActionGroup,
  Button,
  Fieldset,
  FormFieldCheckboxOption,
  FormFieldErrorMessage,
  FormFieldRadio,
  FormFieldTextInput,
  Heading,
  Paragraph,
} from "@/components/rhc";
import type { DemoAannemen } from "@/demo";
import {
  bronBevestigd,
  eigenOpgaveCompleet,
  STANDAARD_ANTWOORDEN,
  useAannemen,
  type AannemenStaat,
  type Antwoorden,
  type BronId,
} from "../_useAannemen";
import { routeVoor, situatieVan } from "../_route";
import { useUitkomsten } from "../_useUitkomsten";
import { datumNL } from "../_werkgever";
import { terugNaar, verderNaar } from "../_stappen";

const NIEUW = "nieuw";

/** Bronnen met gegevens over de kandidaat; de rest gaat over de werkgever. */
const OVER_KANDIDAAT: readonly string[] = ["uwv", "gemeente"];

/**
 * Over de kandidaat ziet de werkgever alleen het doelgroepregister: staat
 * erin, ja of nee, en loopt de registratie nog. Zo geeft UWV het ook in het
 * werkgeversportaal. Uitkering, bijstand en de grond van registratie zijn
 * gegevens over gezondheid en inkomen; die gebruiken de gemeente en UWV zelf
 * bij de beoordeling (AVG art. 5, 6 en 9).
 */
const REGISTER: readonly string[] = [
  "is_arbeidsbeperkte",
  "registratie_nog_niet_geeindigd",
];

const zichtbaarVan = (bron: DemoAannemen["bronnen"][number]) =>
  OVER_KANDIDAAT.includes(bron.id)
    ? bron.gegevens.filter((g) => REGISTER.includes(g.parameter))
    : bron.gegevens;

/** "UWV", "UWV en de gemeente": wie gegevens over de kandidaat heeft. */
const opsomming = (namen: string[]) =>
  namen.length < 2
    ? (namen[0] ?? "")
    : `${namen.slice(0, -1).join(", ")} en ${namen[namen.length - 1]}`;

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
 * Wat alleen de werkgever weet: de eerste werkdag, de functie, de uren en het
 * loon. Vooringevuld met de antwoorden van stap 1 waar die er zijn; nu
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
}) => (
  <section className="rhc-mox-stack" aria-labelledby="eigen-opgave">
    <Heading level={2} id="eigen-opgave">
      Uw eigen opgave
    </Heading>
    <Paragraph>Dit weet alleen u, en het gaat mee in de aanvraag.</Paragraph>
    <FormFieldTextInput
      id="eerste-werkdag"
      name="aanvang"
      type="date"
      label={`Wat is de eerste werkdag van ${voornaam}?`}
      invalid={!!aanvangFout}
      errorMessage={aanvangFout}
      value={a.aanvang ?? ""}
      onChange={(event) =>
        zet({
          aanvang: (event.target as HTMLInputElement).value || undefined,
        })
      }
    />
    {/* Dezelfde vraag als in stap 1, nu definitief. */}
    <RangeSlider
      label={`Hoeveel uur per week gaat ${voornaam} werken?`}
      min={1}
      max={40}
      step={1}
      value={a.uren}
      onChange={(uren) => zet({ uren })}
      formatValue={(uren) => `${uren} uur`}
      filled
    />
    {/* Keuzes voor de aanvraag horen hier; stap 3 controleert alleen. */}
    {vraagJc && (
      <Fieldset legend="Wilt u jobcoaching aanvragen?">
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
      <Fieldset legend="Is er een aanpassing van de werkplek nodig?">
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
  </section>
);

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
  const { bronnen, kandidaat } =
    perSituatie[
      situatie === "wajong" || situatie === "wia" ? situatie : "gemeente"
    ];
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
        : "Een BSN heeft negen cijfers. Controleer het nummer.";
  // Which organisations are open. Until the user opens or closes one, the
  // first is open.
  const [openGekozen, setOpen] = useState<BronId[] | null>(null);
  const keuze = staat?.kandidaat;
  const nieuwe = staat?.kandidatenNieuw ?? [];
  const gekozen = keuze === kandidaat.bsnMasker;
  const wachtend = nieuwe.find((k) => k.naam === keuze);
  // Bevestigen gaat over wat de werkgever ziet: niet de eigen opgave (een
  // formulier) en geen bron zonder zichtbare gegevens, zoals de gemeente.
  const getoond = bronnen.filter(
    (bron) => bron.id !== "eigen" && zichtbaarVan(bron).length > 0,
  );
  const teBevestigen = getoond.map((bron) => bron.id);
  const open: BronId[] = openGekozen ?? (getoond[0] ? [getoond[0].id] : []);
  // De loonwaarde is nog niet gemeten als de gemeente dat zo opgeeft.
  const loonwaardeNogNiet = bronnen.some((b) =>
    b.gegevens.some(
      (g) =>
        g.parameter === "college_heeft_loonwaarde_vastgesteld" &&
        g.waarde.startsWith("Nog niet"),
    ),
  );
  // Hoe lang het kan duren voordat de werkgever weet waar die aan toe is:
  // alleen termijnen uit de wet of van UWV, geen gemiddelde.
  const duur = [
    ...(situatie === "gemeente" && loonwaardeNogNiet
      ? [
          `De loonwaarde van ${kandidaat.voornaam} is nog niet gemeten. Een deskundige van de gemeente meet die op de werkplek, als ${kandidaat.voornaam} is ingewerkt. Een vaste wachttijd daarvoor is er niet. Daarna beslist de gemeente uiterlijk acht weken na uw aanvraag (Algemene wet bestuursrecht, artikel 4:13).`,
        ]
      : []),
    ...(situatie === "wajong"
      ? [
          "Voor loondispensatie komt een arbeidsdeskundige van UWV meestal op de werkplek. UWV beslist binnen acht weken na uw aanvraag.",
        ]
      : []),
    ...(situatie === "wia"
      ? [
          "De werknemer vraagt de doelgroepverklaring aan bij UWV. UWV beslist binnen acht weken, of binnen dertien weken als er informatie ontbreekt.",
        ]
      : []),
  ];
  const aantal = staat
    ? teBevestigen.filter((id) => bronBevestigd(staat, id)).length
    : 0;
  const klaar =
    gekozen && !!staat && teBevestigen.every((id) => bronBevestigd(staat, id));
  const opgave = eigenOpgaveCompleet(antwoorden);
  const naam = `${kandidaat.voornaam} ${kandidaat.achternaam}`;
  // Wie in deze situatie gegevens over de kandidaat heeft, uit dezelfde
  // bronnen als de lijst hieronder; zo klopt de tekst met wat er gebeurt.
  const overKandidaat = bronnen.filter(
    (b) =>
      OVER_KANDIDAAT.includes(b.id) &&
      // Zonder aanvraag bij de gemeente kijkt de gemeente nergens naar.
      !(b.id === "gemeente" && situatie === "register"),
  );
  const meer = overKandidaat.length > 1;
  const wie = opsomming(
    overKandidaat.map((b) =>
      b.id === "gemeente" ? "de gemeente" : b.organisatie,
    ),
  );
  const eigen = meer ? "hun eigen gegevens" : "de eigen gegevens";
  const zietRegister = overKandidaat.some((b) => zichtbaarVan(b).length > 0);

  // The first thing that still stops Verder, in the order of the form.
  const ontbreekt:
    "kandidaat" | "naam" | "bsn" | "toestemming" | "aanvang" | undefined =
    gekozen
      ? opgave
        ? undefined
        : "aanvang"
      : keuze !== NIEUW
        ? "kandidaat"
        : !nieuw.naam.trim()
          ? "naam"
          : !bsnGoed
            ? "bsn"
            : "toestemming";
  // Set when Verder is clicked; the message shows while that part is missing.
  const [foutBij, setFoutBij] = useState<typeof ontbreekt>();
  const fout = foutBij && foutBij === ontbreekt ? foutBij : undefined;
  const kandidaatFout =
    fout === "kandidaat"
      ? wachtend
        ? "Deze kandidaat heeft nog geen toestemming gegeven. Kies een kandidaat met toestemming."
        : "U hebt nog geen kandidaat gekozen."
      : undefined;
  const naamFout =
    fout === "naam"
      ? "U hebt nog geen naam van de kandidaat ingevuld."
      : undefined;
  const aanvangFout =
    fout === "aanvang" ? "U hebt nog geen eerste werkdag ingevuld." : undefined;
  const bsnVeldFout =
    fout === "bsn" && bsn === ""
      ? "U hebt nog geen BSN ingevuld."
      : fout === "bsn" || bsnGezien
        ? bsnFout
        : undefined;

  // Verder does not work yet: show why, and go to what is still missing.
  const naarInvoer = () => {
    if (!ontbreekt) return;
    setFoutBij(ontbreekt);
    const veld =
      ontbreekt === "naam"
        ? document.querySelector<HTMLElement>("#kandidaat-naam input")
        : ontbreekt === "bsn"
          ? document.querySelector<HTMLElement>("#kandidaat-bsn input")
          : ontbreekt === "toestemming"
            ? document.getElementById("toestemming-vragen")
            : ontbreekt === "aanvang"
              ? document.querySelector<HTMLElement>("#eerste-werkdag input")
              : (document.querySelector<HTMLElement>(
                  'input[name="kandidaat"]:checked',
                ) ??
                document.querySelector<HTMLElement>('input[name="kandidaat"]'));
    veld?.focus();
  };

  // Ticking an organisation closes it and opens the next one. The focus goes
  // to the heading of that next one, so it is not lost in a closed panel, and scrolls it to the top so its content can be read; the
  // text above the list says this will happen (WCAG 3.2.2).
  const vink = (id: BronId, aan: boolean) => {
    const volgende = aan
      ? teBevestigen[teBevestigen.indexOf(id) + 1]
      : undefined;
    werkBij({ bronnen: { ...(staat?.bronnen ?? {}), [id]: aan } });
    if (!volgende) return;
    setOpen([volgende]);
    requestAnimationFrame(() =>
      focusAtTop(
        document.querySelector<HTMLElement>(
          `#bron-${volgende} .utrecht-accordion__button`,
        ),
        // The panels open and close in 250 ms (rhc.css).
        { waitMs: 260 },
      ),
    );
  };

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

  return (
    <>
      <section className="rhc-mox-stack" aria-labelledby="kandidaat">
        <Heading level={2} id="kandidaat">
          Wie wilt u aannemen?
        </Heading>
        <Paragraph>
          Wij vragen de kandidaat eerst om toestemming; dat is de werkwijze van
          dit portaal. {wie.charAt(0).toUpperCase() + wie.slice(1)}{" "}
          {meer ? "zoeken" : "zoekt"} de kandidaat op met het
          burgerservicenummer (BSN).
        </Paragraph>
        <Paragraph>
          Werkt de kandidaat al bij u? Dan staat het BSN in uw
          loonadministratie. Anders vraagt u het aan de kandidaat.
        </Paragraph>
        <Fieldset
          legend="Kandidaten"
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
            label={`${naam}, geboren ${datumNL(kandidaat.geboortedatum)}, BSN ${kandidaat.bsnMasker}`}
            checked={gekozen}
            onChange={() => werkBij({ kandidaat: kandidaat.bsnMasker })}
          />
          {nieuwe.map((k) => (
            <FormFieldRadio
              key={k.naam}
              name="kandidaat"
              value={k.naam}
              label={`${k.naam}${k.geboortedatum ? `, geboren ${k.geboortedatum}` : ""}${k.bsn ? `, BSN ${k.bsn}` : ""}`}
              checked={keuze === k.naam}
              onChange={() => werkBij({ kandidaat: k.naam })}
            />
          ))}
          <FormFieldRadio
            name="kandidaat"
            value={NIEUW}
            label="Iemand anders: werknemer toevoegen"
            checked={keuze === NIEUW}
            onChange={() => werkBij({ kandidaat: NIEUW })}
          />
        </Fieldset>
        {keuze === NIEUW && (
          <div className="rhc-mox-row-gap">
            <FormFieldTextInput
              id="kandidaat-naam"
              label="Naam van de kandidaat"
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
              Vraag het BSN pas als u de kandidaat wilt aannemen. Gebruik het
              alleen voor deze aanvraag.
            </Paragraph>
            {fout === "toestemming" && (
              <FormFieldErrorMessage id="toestemming-fout">
                U hebt nog geen toestemming gevraagd. Kies{" "}
                <strong>Toestemming vragen</strong>.
              </FormFieldErrorMessage>
            )}
            <ActionGroup>
              <Button
                id="toestemming-vragen"
                appearance="secondary-action-button"
                aria-disabled={!nieuw.naam.trim() || !bsnGoed}
                aria-describedby={
                  fout === "toestemming"
                    ? "toestemming-fout toestemming-melding"
                    : "toestemming-melding"
                }
                onClick={voegToe}
              >
                Toestemming vragen
              </Button>
            </ActionGroup>
            <Paragraph id="toestemming-melding" className="rhc-mox-small-text">
              U krijgt een melding zodra de kandidaat toestemming heeft gegeven.
            </Paragraph>
          </div>
        )}
        {gekozen && (
          <Paragraph className="rhc-mox-small-text">
            {geenAanvraag
              ? "U ziet alleen de laatste vier cijfers van het BSN."
              : "Het BSN gaat mee met de aanvraag. U ziet alleen de laatste vier cijfers."}
          </Paragraph>
        )}
      </section>

      {(gekozen || wachtend) && (
        <section className="rhc-mox-stack" aria-labelledby="overheid-weet">
          <Heading level={2} id="overheid-weet">
            Gegevens die de overheid kan ophalen voor de berekening
          </Heading>
          {wachtend ? (
            <>
              <Paragraph>
                Wij vragen {wachtend.naam} eerst om toestemming. Daarna{" "}
                {meer ? "kijken" : "kijkt"} {wie} met het BSN in {eigen}.
              </Paragraph>
              <Paragraph>
                Tot {wachtend.naam} toestemming geeft, kunt u hier niet verder.
                Uw antwoorden blijven bewaard tot u dit tabblad sluit.
              </Paragraph>
            </>
          ) : (
            <>
              <Paragraph>
                {zietRegister
                  ? `Over ${kandidaat.voornaam} ziet u alleen of die in het doelgroepregister staat, en sinds wanneer.`
                  : `Over ${kandidaat.voornaam} ziet u hier geen gegevens.`}{" "}
                {/* Zonder aanvraag is er geen beoordeling; bij WIA gaat het
                    besluit (de doelgroepverklaring) naar de werknemer. */}
                {!geenAanvraag && (
                  <>
                    {wie.charAt(0).toUpperCase() + wie.slice(1)}{" "}
                    {meer ? "gebruiken hun" : "gebruikt de"} eigen gegevens over{" "}
                    {kandidaat.voornaam} bij de beoordeling; die ziet u niet.
                    {paneelIds.length > 0 && " U krijgt wel het besluit."}
                  </>
                )}
              </Paragraph>
              <Paragraph>
                Per organisatie staat aangevinkt dat de gegevens kloppen. Open
                een organisatie om ze te bekijken. Vinkt u een organisatie aan,
                dan gaat de volgende open.
              </Paragraph>
              <Accordion>
                {getoond.map((bron) => {
                  const aan = !!staat && bronBevestigd(staat, bron.id);
                  return (
                    <AccordionSection
                      key={bron.id}
                      id={`bron-${bron.id}`}
                      // Het niveau op Accordion geldt alleen voor diens eigen kop.
                      headingLevel={3}
                      label={`${bron.organisatie}: ${zichtbaarVan(bron).length} ${zichtbaarVan(bron).length === 1 ? "gegeven" : "gegevens"}, ${aan ? "bevestigd" : "niet bevestigd"}`}
                      // Het type eist `body`, de component rendert alleen `children`.
                      body={null}
                      expanded={open.includes(bron.id)}
                      onActivate={() =>
                        setOpen(
                          open.includes(bron.id)
                            ? open.filter((id) => id !== bron.id)
                            : [...open, bron.id],
                        )
                      }
                    >
                      <div className="rhc-mox-row-gap">
                        <Paragraph className="rhc-mox-small-text">
                          {bron.register}, opgehaald op{" "}
                          {datumNL(bron.opgehaald)}
                        </Paragraph>
                        {/* The markup of the RHC DataSummary: its component only
                        takes text as value, and the toggletip with the law
                        question belongs in the value. */}
                        <dl className="rhc-data-summary rhc-data-summary--column">
                          {zichtbaarVan(bron).map((g) => (
                            <div
                              key={g.parameter}
                              className="rhc-data-summary__item"
                            >
                              <dt className="rhc-data-summary__item-key">
                                {g.vraag}
                              </dt>
                              <dd className="rhc-data-summary__item-value">
                                {/* De uren komen uit de antwoorden van stap 1. */}
                                {g.waarde.replace(
                                  "{uren}",
                                  String(antwoorden.uren),
                                )}{" "}
                                <InfoToggletip
                                  label={`Zo vraagt de wet het: ${g.vraag}`}
                                >
                                  {`Zo vraagt de wet het: “${g.wetsvraag}” (${g.grond})`}
                                </InfoToggletip>
                              </dd>
                            </div>
                          ))}
                        </dl>
                        <FormFieldCheckboxOption
                          label={
                            bron.id === "eigen"
                              ? "Klopt, gebruik mijn opgave"
                              : `Klopt, gebruik deze gegevens van ${bron.organisatie}`
                          }
                          name={`vinkje-${bron.id}`}
                          checked={aan}
                          onChange={(event) =>
                            vink(bron.id, event.target.checked)
                          }
                        />
                      </div>
                    </AccordionSection>
                  );
                })}
              </Accordion>
            </>
          )}
        </section>
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
        />
      )}

      {gekozen && duur.length > 0 && (
        <section className="rhc-mox-stack" aria-labelledby="hoe-lang">
          <Heading level={2} id="hoe-lang">
            Hoe lang het kan duren
          </Heading>
          {duur.map((zin) => (
            <Paragraph key={zin}>{zin}</Paragraph>
          ))}
        </section>
      )}

      <div className="rhc-mox-stack">
        <Paragraph role="status">
          {wachtend
            ? `Wacht op toestemming van ${wachtend.naam}.`
            : !gekozen
              ? ""
              : !opgave
                ? "Vul uw eigen opgave in: de eerste werkdag."
                : klaar
                  ? "Alle bronnen bevestigd. Wij kunnen de aanvraag voor u invullen."
                  : `${aantal} van ${teBevestigen.length} bronnen bevestigd. Wat u niet bevestigt, vult u zelf aan in de aanvraag.`}
        </Paragraph>
        <StepNavigation
          back="/personeel/iemand-aannemen/voorbeeldberekening"
          backLabel={terugNaar(1)}
          later={wachtend ? "/personeel" : undefined}
          next={{
            label: verderNaar(3),
            disabled: !gekozen || !opgave || !resultaat.bekend,
            onBlocked: naarInvoer,
            // Stap 3 heeft één vorm, ook als er niets te versturen is.
            onClick: () =>
              router.push("/personeel/iemand-aannemen/concept-aanvraag"),
          }}
        />
      </div>
    </>
  );
};

export default Bronnen;

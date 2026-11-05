"use client";

import Link from "next/link";
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
  FormFieldRadio,
  FormFieldTextInput,
  Heading,
  Paragraph,
  UnorderedList,
  UnorderedListItem,
} from "@/components/rhc";
import type { DemoAannemen } from "@/demo";
import {
  BRONNEN,
  alleBronnenBevestigd,
  bronBevestigd,
  eigenOpgaveCompleet,
  STANDAARD_ANTWOORDEN,
  useAannemen,
  type Antwoorden,
  type BronId,
} from "../_useAannemen";
import { routeVoor, situatieVan } from "../_route";
import { useUitkomsten } from "../_useUitkomsten";
import { datumNL } from "../_werkgever";

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

/** Negen cijfers en de elfproef van het BSN. */
const elfproef = (bsn: string) => {
  if (!/^\d{9}$/.test(bsn)) return false;
  const som = [...bsn].reduce(
    (t, c, i) => t + Number(c) * (i === 8 ? -1 : 9 - i),
    0,
  );
  return som % 11 === 0;
};

const VRAGEN =
  "/lopendezaken/aanvragen/iemand-aannemen-met-afstand-tot-de-arbeidsmarkt";

/**
 * Wat alleen de werkgever weet: de eerste werkdag, de functie, de uren en het
 * loon. Vooringevuld met de antwoorden van stap 1 waar die er zijn; nu
 * definitief. De loonwaarde blijft een schatting: die stelt de gemeente of
 * UWV vast.
 */
const EigenOpgave = ({
  voornaam,
  a,
  zet,
}: {
  voornaam: string;
  a: Antwoorden;
  zet: (deel: Partial<Antwoorden>) => void;
}) => (
  <section className="rhc-mox-stack" aria-labelledby="eigen-opgave">
    <Heading level={3} id="eigen-opgave">
      Uw eigen opgave
    </Heading>
    <Paragraph>Dit weet alleen u, en het gaat mee in de aanvraag.</Paragraph>
    <FormFieldTextInput
      name="aanvang"
      type="date"
      label={`Wat is de eerste werkdag van ${voornaam}?`}
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
    <Paragraph>
      Loonwaarde: uw schatting is {a.loonwaarde} procent. Die stelt de gemeente
      of UWV vast op de werkplek.{" "}
      <Link href={VRAGEN} className="utrecht-link utrecht-link--html-a">
        Schatting wijzigen
      </Link>
    </Paragraph>
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
  const naarOverzicht =
    resultaat.bekend &&
    routeVoor(antwoorden.doelgroepen, resultaat.uitkomsten).overzicht;
  const { bronnen, kandidaat } =
    perSituatie[
      situatie === "wajong" || situatie === "wia" ? situatie : "gemeente"
    ];
  const [nieuw, setNieuw] = useState({ naam: "", bsn: "" });
  // Een BSN heeft negen cijfers en voldoet aan de elfproef.
  const bsnGoed = elfproef(nieuw.bsn.trim());
  const bsnFout =
    nieuw.bsn.trim() === "" || bsnGoed
      ? undefined
      : "Een BSN heeft negen cijfers. Controleer het nummer.";
  const [open, setOpen] = useState<BronId[]>([]);
  const keuze = staat?.kandidaat;
  const nieuwe = staat?.kandidatenNieuw ?? [];
  const gekozen = keuze === kandidaat.bsnMasker;
  const wachtend = nieuwe.find((k) => k.naam === keuze);
  // Bevestigen gaat over wat de werkgever ziet: niet de eigen opgave (een
  // formulier) en niet de gemeente (die gegevens ziet de werkgever niet).
  const teBevestigen = BRONNEN.filter(
    (id) => id !== "eigen" && id !== "gemeente",
  );
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
          `De loonwaarde van ${kandidaat.voornaam} is nog niet gemeten. Een deskundige van de gemeente meet die op de werkplek, als ${kandidaat.voornaam} is ingewerkt. Een vaste wachttijd daarvoor is er niet. Daarna beslist de gemeente binnen vijf weken (Participatiewet, artikel 10d lid 12).`,
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
  const klaar = gekozen && !!staat && alleBronnenBevestigd(staat);
  const opgave = eigenOpgaveCompleet(antwoorden);
  const naam = `${kandidaat.voornaam} ${kandidaat.achternaam}`;

  const vink = (id: BronId, aan: boolean) =>
    werkBij({ bronnen: { ...(staat?.bronnen ?? {}), [id]: aan } });

  const voegToe = () => {
    const n = nieuw.naam.trim();
    if (!n || !bsnGoed) return;
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
  };

  return (
    <>
      <section className="rhc-mox-stack" aria-labelledby="kandidaat">
        <Heading level={2} id="kandidaat">
          Wie wilt u aannemen?
        </Heading>
        <Paragraph>
          Wij gebruiken het burgerservicenummer (BSN) van de werknemer. U hebt
          het uit uw loonadministratie, of de kandidaat geeft het u. De
          gemeente, UWV en de Belastingdienst kijken met het BSN in hun eigen
          gegevens.
        </Paragraph>
        <Fieldset legend="Kandidaten">
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
              label="Naam van de kandidaat"
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
              label="Burgerservicenummer (BSN)"
              inputMode="numeric"
              autoComplete="off"
              value={nieuw.bsn}
              invalid={bsnFout !== undefined}
              errorMessage={bsnFout}
              onChange={(event) =>
                setNieuw({
                  ...nieuw,
                  bsn: (event.target as HTMLInputElement).value,
                })
              }
            />
            <Paragraph className="rhc-mox-small-text">
              Neemt u de kandidaat nog niet aan? Vraag het BSN dan pas na de
              selectie, en gebruik het alleen om na te gaan of de kandidaat in
              het doelgroepregister staat.
            </Paragraph>
            <ActionGroup>
              <Button
                appearance="secondary-action-button"
                aria-disabled={!nieuw.naam.trim() || !bsnGoed}
                onClick={voegToe}
              >
                Toevoegen
              </Button>
            </ActionGroup>
          </div>
        )}
        {gekozen && (
          <Paragraph className="rhc-mox-small-text">
            BSN {kandidaat.bsnMasker} gaat mee met de aanvraag en staat niet op
            het scherm.
          </Paragraph>
        )}
      </section>

      <section className="rhc-mox-stack" aria-labelledby="overheid-weet">
        <Heading level={2} id="overheid-weet">
          Gegevens die de overheid kan ophalen voor de berekening
        </Heading>
        {wachtend ? (
          <Paragraph>
            Voor {wachtend.naam} haalt dit prototype geen gegevens op. In het
            echt vragen wij ze met het BSN op bij UWV, de gemeente en de
            Belastingdienst.
          </Paragraph>
        ) : !gekozen ? (
          <Paragraph>
            Kies eerst de kandidaat. Daarna halen wij de gegevens op die nodig
            zijn voor de berekening en ziet u ze hier.
          </Paragraph>
        ) : (
          <>
            <Paragraph>
              Over {kandidaat.voornaam} ziet u alleen of die in het
              doelgroepregister staat. De gemeente en UWV gebruiken hun eigen
              gegevens over {kandidaat.voornaam} als u aanvraagt; die ziet u
              niet.
            </Paragraph>
            <Paragraph>
              Per organisatie staat aangevinkt dat de gegevens kloppen en
              gebruikt mogen worden. Open een organisatie om te zien wat wij
              ophalen. Klopt iets niet, haal het vinkje weg; die gegevens vult u
              dan zelf aan in de aanvraag.
            </Paragraph>
            <Accordion>
              {bronnen
                .filter(
                  (bron) =>
                    bron.id !== "eigen" && zichtbaarVan(bron).length > 0,
                )
                .map((bron) => {
                  const aan = !!staat && bronBevestigd(staat, bron.id);
                  return (
                    <AccordionSection
                      key={bron.id}
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

      {gekozen && (
        <EigenOpgave
          voornaam={kandidaat.voornaam}
          a={antwoorden}
          zet={(deel) => werkBij({ antwoorden: { ...antwoorden, ...deel } })}
        />
      )}

      {gekozen && duur.length > 0 && (
        <section className="rhc-mox-stack" aria-labelledby="hoe-lang">
          <Heading level={2} id="hoe-lang">
            Hoe lang het kan duren
          </Heading>
          <UnorderedList>
            {duur.map((zin) => (
              <UnorderedListItem key={zin}>{zin}</UnorderedListItem>
            ))}
          </UnorderedList>
        </section>
      )}

      <div className="rhc-mox-stack">
        <Paragraph role="status">
          {wachtend
            ? "Voor deze werknemer zijn in dit prototype geen gegevens."
            : !gekozen
              ? "Nog geen kandidaat gekozen."
              : !opgave
                ? "Vul uw eigen opgave in: de eerste werkdag."
                : klaar
                  ? "Alle bronnen bevestigd. Wij kunnen de aanvraag voor u invullen."
                  : `${aantal} van ${teBevestigen.length} bronnen bevestigd. Wat u niet bevestigt, vult u zelf aan in de aanvraag.`}
        </Paragraph>
        <ActionGroup>
          <Button
            appearance="primary-action-button"
            aria-disabled={!gekozen || !opgave || !resultaat.bekend}
            onClick={() => {
              if (gekozen && opgave && resultaat.bekend)
                router.push(
                  naarOverzicht
                    ? "/personeel/iemand-aannemen/overzicht"
                    : "/personeel/iemand-aannemen/concept-aanvraag",
                );
            }}
          >
            {naarOverzicht
              ? "Bekijk wat voor u geldt"
              : "Controleren en versturen"}
          </Button>
        </ActionGroup>
      </div>
    </>
  );
};

export default Bronnen;

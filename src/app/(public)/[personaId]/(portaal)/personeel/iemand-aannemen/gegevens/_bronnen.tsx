"use client";

import StepNavigation from "@/components/StepNavigation";
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
  BRONNEN,
  alleBronnenBevestigd,
  bronBevestigd,
  STANDAARD_ANTWOORDEN,
  useAannemen,
  type BronId,
} from "../_useAannemen";
import { routeVoor, situatieVan } from "../_route";
import { useUitkomsten } from "../_useUitkomsten";
import { datumNL } from "../_werkgever";
import { formatDayMonthYear, parseDayMonthYear } from "@/utils/date";
import { terugNaar, verderNaar } from "../_stappen";

const NIEUW = "nieuw";

/**
 * De kandidaat kiezen of toevoegen, en het omgekeerde formulier:
 * alles wat de overheid al weet in een tabel, per bron een vinkje dat
 * standaard aan staat. Een zelf toegevoegde kandidaat wacht op toestemming;
 * zonder toestemming haalt het portaal niets op.
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
  const [nieuw, setNieuw] = useState({ naam: "", geboortedatum: "" });
  const [open, setOpen] = useState<BronId[]>([]);
  const keuze = staat?.kandidaat;
  const nieuwe = staat?.kandidatenNieuw ?? [];
  const gekozen = keuze === kandidaat.bsnMasker;
  const wachtend = nieuwe.find((k) => k.naam === keuze);
  const aantal = staat
    ? BRONNEN.filter((id) => bronBevestigd(staat, id)).length
    : 0;
  const klaar = gekozen && !!staat && alleBronnenBevestigd(staat);
  const naam = `${kandidaat.voornaam} ${kandidaat.achternaam}`;

  const datum = parseDayMonthYear(nieuw.geboortedatum);
  const datumProbleem = !nieuw.geboortedatum.trim()
    ? "leeg"
    : !datum
      ? "ongeldig"
      : datum > new Date()
        ? "toekomst"
        : undefined;
  // Checked when the user leaves the field, not while typing.
  const [datumGecontroleerd, setDatumGecontroleerd] = useState(false);

  // The first thing that still stops Verder, in the order of the form.
  const ontbreekt:
    | "kandidaat"
    | "naam"
    | "geboortedatum"
    | "toestemming"
    | undefined = gekozen
    ? undefined
    : keuze !== NIEUW
      ? "kandidaat"
      : !nieuw.naam.trim()
        ? "naam"
        : datumProbleem
          ? "geboortedatum"
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
  const geboortedatumFout =
    datumProbleem === "leeg"
      ? fout === "geboortedatum"
        ? "U hebt nog geen geboortedatum ingevuld."
        : undefined
      : datumProbleem && (datumGecontroleerd || fout === "geboortedatum")
        ? datumProbleem === "toekomst"
          ? "De geboortedatum ligt in de toekomst. Vul de geboortedatum van de kandidaat in."
          : "Vul een bestaande datum in, met dag, maand en jaar. Bijvoorbeeld 15-3-1984 of 15 maart 1984."
        : undefined;

  // Verder does not work yet: show why, and go to what is still missing.
  const naarInvoer = () => {
    if (!ontbreekt) return;
    setFoutBij(ontbreekt);
    const veld =
      ontbreekt === "naam"
        ? document.querySelector<HTMLElement>("#kandidaat-naam input")
        : ontbreekt === "geboortedatum"
          ? document.querySelector<HTMLElement>(
              "#kandidaat-geboortedatum input",
            )
          : ontbreekt === "toestemming"
            ? document.getElementById("toestemming-vragen")
            : (document.querySelector<HTMLElement>(
                'input[name="kandidaat"]:checked',
              ) ??
              document.querySelector<HTMLElement>('input[name="kandidaat"]'));
    veld?.focus();
  };

  const vink = (id: BronId, aan: boolean) =>
    werkBij({ bronnen: { ...(staat?.bronnen ?? {}), [id]: aan } });

  const voegToe = () => {
    const n = nieuw.naam.trim();
    if (!n || datumProbleem || !datum) return;
    werkBij({
      kandidatenNieuw: [
        ...nieuwe.filter((k) => k.naam !== n),
        {
          naam: n,
          geboortedatum: formatDayMonthYear(datum),
          gevraagdOp: new Date().toISOString().slice(0, 10),
        },
      ],
      kandidaat: n,
    });
    setNieuw({ naam: "", geboortedatum: "" });
    setDatumGecontroleerd(false);
  };

  return (
    <>
      <section className="rhc-mox-stack" aria-labelledby="kandidaat">
        <Heading level={2} id="kandidaat">
          Wie wilt u aannemen?
        </Heading>
        <Paragraph>
          Gegevens over de kandidaat halen we alleen op met diens toestemming.
          De kandidaat geeft die via de eigen MijnOverheid.
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
            label={`${naam}, geboren ${datumNL(kandidaat.geboortedatum)}, toestemming gegeven op ${datumNL(kandidaat.toestemmingOp)}`}
            checked={gekozen}
            onChange={() => werkBij({ kandidaat: kandidaat.bsnMasker })}
          />
          {nieuwe.map((k) => (
            <FormFieldRadio
              key={k.naam}
              name="kandidaat"
              value={k.naam}
              label={`${k.naam}${k.geboortedatum ? `, geboren ${k.geboortedatum}` : ""}, toestemming gevraagd op ${datumNL(k.gevraagdOp)}`}
              checked={keuze === k.naam}
              onChange={() => werkBij({ kandidaat: k.naam })}
            />
          ))}
          <FormFieldRadio
            name="kandidaat"
            value={NIEUW}
            label="Iemand anders: nieuwe kandidaat toevoegen"
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
              id="kandidaat-geboortedatum"
              label="Geboortedatum"
              description="Dag, maand en jaar. Bijvoorbeeld 15-3-1984 of 15 maart 1984."
              invalid={!!geboortedatumFout}
              errorMessage={geboortedatumFout}
              autoComplete="off"
              spellCheck={false}
              value={nieuw.geboortedatum}
              onChange={(event) =>
                setNieuw({
                  ...nieuw,
                  geboortedatum: (event.target as HTMLInputElement).value,
                })
              }
              onBlur={() => {
                setDatumGecontroleerd(true);
                // Accept every usual form, then show it as 03-06-2001.
                if (datum) {
                  setNieuw({
                    ...nieuw,
                    geboortedatum: formatDayMonthYear(datum),
                  });
                }
              }}
            />
            <Paragraph className="rhc-mox-small-text">
              De kandidaat krijgt een verzoek om toestemming in MijnOverheid.
              Zodra die er is, halen we de gegevens op. Het BSN vragen we niet
              aan u; dat komt mee met de toestemming.
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
                aria-disabled={!nieuw.naam.trim() || !!datumProbleem}
                aria-describedby={
                  fout === "toestemming" ? "toestemming-fout" : undefined
                }
                onClick={voegToe}
              >
                Toestemming vragen
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
            Wij hebben {wachtend.naam} op {datumNL(wachtend.gevraagdOp)} om
            toestemming gevraagd. Zodra die er is, halen wij de gegevens op die
            nodig zijn voor de berekening en ziet u ze hier. In dit prototype
            komt die toestemming niet.
          </Paragraph>
        ) : !gekozen ? (
          <Paragraph>
            Kies eerst de kandidaat. Daarna halen wij de gegevens op die nodig
            zijn voor de berekening en ziet u ze hier.
          </Paragraph>
        ) : (
          <>
            <Paragraph>
              Per organisatie staat aangevinkt dat de gegevens kloppen en
              gebruikt mogen worden. Open een organisatie om te zien wat wij
              ophalen. Klopt iets niet, haal het vinkje weg; die gegevens vult u
              dan zelf aan in de aanvraag.
            </Paragraph>
            <Accordion>
              {bronnen.map((bron) => {
                const aan = !!staat && bronBevestigd(staat, bron.id);
                return (
                  <AccordionSection
                    key={bron.id}
                    // Het niveau op Accordion geldt alleen voor diens eigen kop.
                    headingLevel={3}
                    label={`${bron.organisatie}: ${bron.gegevens.length} ${bron.gegevens.length === 1 ? "gegeven" : "gegevens"}, ${aan ? "bevestigd" : "niet bevestigd"}`}
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
                        {bron.register}, opgehaald op {datumNL(bron.opgehaald)}
                      </Paragraph>
                      {/* The markup of the RHC DataSummary: its component only
                        takes text as value, and the toggletip with the law
                        question belongs in the value. */}
                      <dl className="rhc-data-summary rhc-data-summary--column">
                        {bron.gegevens.map((g) => (
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

      <div className="rhc-mox-stack">
        <Paragraph role="status">
          {wachtend
            ? "Wachten op toestemming van de kandidaat."
            : !gekozen
              ? "Nog geen kandidaat gekozen."
              : klaar
                ? "Alle bronnen bevestigd. Wij kunnen de aanvraag voor u invullen."
                : `${aantal} van ${BRONNEN.length} bronnen bevestigd. Wat u niet bevestigt, vult u zelf aan in de aanvraag.`}
        </Paragraph>
        <StepNavigation
          back="/lopendezaken/aanvragen/iemand-aannemen-met-afstand-tot-de-arbeidsmarkt"
          backLabel={terugNaar(1)}
          next={{
            label: verderNaar(3),
            disabled: !gekozen || !resultaat.bekend,
            onBlocked: naarInvoer,
            onClick: () =>
              router.push(
                naarOverzicht
                  ? "/personeel/iemand-aannemen/overzicht"
                  : "/personeel/iemand-aannemen/concept-aanvraag",
              ),
          }}
        />
      </div>
    </>
  );
};

export default Bronnen;

"use client";

import Link from "next/link";
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
} from "@/components/rhc";
import type { DemoAannemen } from "@/demo";
import {
  BRONNEN,
  alleBronnenBevestigd,
  bronBevestigd,
  eigenOpgaveCompleet,
  STANDAARD_ANTWOORDEN,
  useAannemen,
  WML_UUR_EUROCENT,
  type Antwoorden,
  type BronId,
} from "../_useAannemen";
import { routeVoor, situatieVan } from "../_route";
import { useUitkomsten } from "../_useUitkomsten";
import { datumNL } from "../_werkgever";

const NIEUW = "nieuw";

const VRAGEN =
  "/lopendezaken/aanvragen/iemand-aannemen-met-afstand-tot-de-arbeidsmarkt";

/** "16,50" naar 1650; null als het geen bedrag is. */
const naarEurocent = (tekst: string) => {
  const t = tekst.trim().replace(/^€\s*/, "").replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(t)) return null;
  return Math.round(Number(t) * 100);
};
const alsTekst = (cent: number) => (cent / 100).toFixed(2).replace(".", ",");

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
}) => {
  const [uren, setUren] = useState(String(a.uren));
  const [loon, setLoon] = useState(alsTekst(a.uurloon));
  const urenGetal = Number(uren);
  const urenFout =
    /^\d+$/.test(uren.trim()) && urenGetal >= 8 && urenGetal <= 40
      ? undefined
      : "Vul een aantal uren in van 8 tot en met 40.";
  const loonCent = naarEurocent(loon);
  const loonFout =
    loonCent === null
      ? "Vul een bedrag in, bijvoorbeeld 16,50."
      : loonCent < WML_UUR_EUROCENT
        ? `Het uurloon is ten minste het minimumloon, ${alsTekst(WML_UUR_EUROCENT)} euro.`
        : undefined;
  return (
    <section className="rhc-mox-stack" aria-labelledby="eigen-opgave">
      <Heading level={3} id="eigen-opgave">
        Uw eigen opgave
      </Heading>
      <Paragraph>
        Dit weet alleen u. In de voorbeeldberekening waren het schattingen; nu
        gaan ze in de aanvraag.
      </Paragraph>
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
      <FormFieldTextInput
        name="functie"
        label={`Welke functie krijgt ${voornaam}?`}
        autoComplete="off"
        value={a.functie ?? ""}
        onChange={(event) =>
          zet({ functie: (event.target as HTMLInputElement).value })
        }
      />
      <FormFieldTextInput
        name="uren"
        label={`Hoeveel uur per week gaat ${voornaam} werken?`}
        inputMode="numeric"
        autoComplete="off"
        value={uren}
        invalid={urenFout !== undefined}
        errorMessage={urenFout}
        onChange={(event) => {
          const t = (event.target as HTMLInputElement).value;
          setUren(t);
          const n = Number(t);
          if (/^\d+$/.test(t.trim()) && n >= 8 && n <= 40) zet({ uren: n });
        }}
      />
      <FormFieldTextInput
        name="uurloon"
        label="Bruto uurloon in euro"
        description="Het minimumloon is 14,99 euro per uur"
        inputMode="decimal"
        autoComplete="off"
        value={loon}
        invalid={loonFout !== undefined}
        errorMessage={loonFout}
        onChange={(event) => {
          const t = (event.target as HTMLInputElement).value;
          setLoon(t);
          const c = naarEurocent(t);
          if (c !== null && c >= WML_UUR_EUROCENT) zet({ uurloon: c });
        }}
      />
      <Paragraph>
        Loonwaarde: uw schatting is {a.loonwaarde} procent. Die stelt de
        gemeente of UWV vast.{" "}
        <Link href={VRAGEN} className="utrecht-link utrecht-link--html-a">
          Schatting wijzigen
        </Link>
      </Paragraph>
    </section>
  );
};

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
  // De eigen opgave is een formulier, geen bron om te bevestigen.
  const teBevestigen = BRONNEN.filter((id) => id !== "eigen");
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
    if (!n) return;
    werkBij({
      kandidatenNieuw: [
        ...nieuwe.filter((k) => k.naam !== n),
        {
          naam: n,
          geboortedatum: nieuw.geboortedatum.trim(),
          gevraagdOp: new Date().toISOString().slice(0, 10),
        },
      ],
      kandidaat: n,
    });
    setNieuw({ naam: "", geboortedatum: "" });
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
        <Fieldset legend="Kandidaten">
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
              label="Geboortedatum (dag-maand-jaar)"
              autoComplete="off"
              value={nieuw.geboortedatum}
              onChange={(event) =>
                setNieuw({
                  ...nieuw,
                  geboortedatum: (event.target as HTMLInputElement).value,
                })
              }
            />
            <Paragraph className="rhc-mox-small-text">
              De kandidaat krijgt een verzoek om toestemming in MijnOverheid.
              Zodra die er is, halen we de gegevens op. Het BSN vragen we niet
              aan u; dat komt mee met de toestemming.
            </Paragraph>
            <ActionGroup>
              <Button
                appearance="secondary-action-button"
                aria-disabled={!nieuw.naam.trim()}
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
              {bronnen
                .filter((bron) => bron.id !== "eigen")
                .map((bron) => {
                  const aan = !!staat && bronBevestigd(staat, bron.id);
                  return (
                    <AccordionSection
                      key={bron.id}
                      // Het niveau op Accordion geldt alleen voor diens eigen kop.
                      headingLevel={3}
                      label={`${bron.organisatie} · ${bron.gegevens.length} ${bron.gegevens.length === 1 ? "gegeven" : "gegevens"} · ${aan ? "bevestigd" : "niet bevestigd"}`}
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
                          {bron.register} · opgehaald op{" "}
                          {datumNL(bron.opgehaald)}
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

      {gekozen && (
        <EigenOpgave
          voornaam={kandidaat.voornaam}
          a={antwoorden}
          zet={(deel) => werkBij({ antwoorden: { ...antwoorden, ...deel } })}
        />
      )}

      <div className="rhc-mox-stack">
        <Paragraph role="status">
          {wachtend
            ? "Wachten op toestemming van de kandidaat."
            : !gekozen
              ? "Nog geen kandidaat gekozen."
              : !opgave
                ? "Vul uw eigen opgave in: de eerste werkdag en de functie."
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
            {naarOverzicht ? "Bekijk wat voor u geldt" : "Vul de aanvraag in"}
          </Button>
        </ActionGroup>
      </div>
    </>
  );
};

export default Bronnen;

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
  STANDAARD_ANTWOORDEN,
  useAannemen,
  type BronId,
} from "../_useAannemen";
import { routeVoor, situatieVan } from "../_route";
import { useUitkomsten } from "../_useUitkomsten";
import { datumNL, type Werkgever } from "../_werkgever";

const NIEUW = "nieuw";

/**
 * Namens wie, de kandidaat kiezen of toevoegen, en het omgekeerde formulier:
 * alles wat de overheid al weet in een tabel, per bron een vinkje dat
 * standaard aan staat. Een zelf toegevoegde kandidaat wacht op toestemming;
 * zonder toestemming haalt het portaal niets op.
 */
const Bronnen = ({
  perSituatie,
  werkgever,
}: {
  perSituatie: Record<"gemeente" | "wajong" | "wia", DemoAannemen>;
  werkgever: Werkgever;
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
      <section
        className="rhc-mox-card rhc-mox-row-gap"
        aria-labelledby="namens"
      >
        <Heading level={2} id="namens">
          Namens wie vult u in?
        </Heading>
        <Fieldset legend="Rol">
          <FormFieldRadio
            name="rol"
            value="eigenaar"
            label={`Ik ben eigenaar of vennoot van ${werkgever.onderneming}`}
            checked={(staat?.rol ?? "eigenaar") === "eigenaar"}
            onChange={() => werkBij({ rol: "eigenaar" })}
          />
          <FormFieldRadio
            name="rol"
            value="namens"
            label={`Ik vul in namens ${werkgever.onderneming}, bijvoorbeeld als salarisadministrateur`}
            checked={staat?.rol === "namens"}
            onChange={() => werkBij({ rol: "namens" })}
          />
        </Fieldset>
        {staat?.rol === "namens" && (
          <Paragraph className="mox-hiring-note">
            U kunt de aanvraag invullen. De eigenaar moet hem ondertekenen
            voordat hij wordt ingediend.
          </Paragraph>
        )}
      </section>

      <section
        className="rhc-mox-card rhc-mox-row-gap"
        aria-labelledby="kandidaat"
      >
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
              value={nieuw.geboortedatum}
              onChange={(event) =>
                setNieuw({
                  ...nieuw,
                  geboortedatum: (event.target as HTMLInputElement).value,
                })
              }
            />
            <Paragraph className="mox-hiring-note">
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
          <Paragraph className="mox-hiring-note">
            BSN {kandidaat.bsnMasker} gaat mee met de aanvraag en staat niet op
            het scherm.
          </Paragraph>
        )}
      </section>

      <Heading level={2}>Wat de overheid al weet</Heading>
      {wachtend ? (
        <Paragraph>
          We hebben {wachtend.naam} op {datumNL(wachtend.gevraagdOp)} om
          toestemming gevraagd. Zodra die er is, halen we op wat de overheid al
          weet en ziet u het hier. In dit prototype komt die toestemming niet.
        </Paragraph>
      ) : !gekozen ? (
        <Paragraph>
          Kies eerst de kandidaat. Daarna halen we op wat de overheid al weet en
          ziet u het hier.
        </Paragraph>
      ) : (
        <>
          <Paragraph>
            Per organisatie staat aangevinkt dat de gegevens kloppen en gebruikt
            mogen worden. Open een organisatie om te zien wat we ophalen. Klopt
            iets niet, haal het vinkje weg; die gegevens vult u dan zelf aan in
            de aanvraag.
          </Paragraph>
          <Accordion>
            {bronnen.map((bron) => {
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
                    <Paragraph className="mox-hiring-note">
                      {bron.register} · opgehaald op {datumNL(bron.opgehaald)}
                    </Paragraph>
                    <dl className="mox-hiring-facts">
                      {bron.gegevens.map((g) => (
                        <div key={g.parameter}>
                          <dt>{g.vraag}</dt>
                          <dd>{g.waarde}</dd>
                          <details className="mox-hiring-legal-question">
                            <summary>Zo vraagt de wet het</summary>
                            <Paragraph>
                              “{g.wetsvraag}” ({g.grond})
                            </Paragraph>
                          </details>
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
                      onChange={(event) => vink(bron.id, event.target.checked)}
                    />
                  </div>
                </AccordionSection>
              );
            })}
          </Accordion>
        </>
      )}

      <section className="rhc-mox-card rhc-mox-row-gap">
        <Paragraph role="status">
          {wachtend
            ? "Wachten op toestemming van de kandidaat."
            : !gekozen
              ? "Nog geen kandidaat gekozen."
              : klaar
                ? "Alle bronnen bevestigd. We kunnen de aanvraag voor u invullen."
                : `${aantal} van ${BRONNEN.length} bronnen bevestigd. Wat u niet bevestigt, vult u zelf aan in de aanvraag.`}
        </Paragraph>
        <ActionGroup>
          <Button
            appearance="primary-action-button"
            aria-disabled={!gekozen || !resultaat.bekend}
            onClick={() => {
              if (gekozen && resultaat.bekend)
                router.push(
                  naarOverzicht
                    ? "/personeel/iemand-aannemen/overzicht"
                    : "/personeel/iemand-aannemen/concept-aanvraag",
                );
            }}
          >
            {naarOverzicht ? "Bekijk wat voor u geldt" : "Vul de aanvraag in"}
          </Button>
          <Link
            href="/personeel/iemand-aannemen"
            className="utrecht-link utrecht-link--html-a"
          >
            Terug naar de vragen
          </Link>
        </ActionGroup>
      </section>
    </>
  );
};

export default Bronnen;

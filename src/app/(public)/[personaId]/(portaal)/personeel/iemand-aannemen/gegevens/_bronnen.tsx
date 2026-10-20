"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ActionGroup,
  Button,
  DataSummary,
  DataSummaryItem,
  Fieldset,
  FormFieldCheckboxOption,
  FormFieldRadio,
  Heading,
  Paragraph,
  UnorderedList,
  UnorderedListItem,
} from "@/components/rhc";
import type { DemoAannemen, DemoAannemenBron } from "@/demo";
import {
  BRONNEN,
  alleBronnenBevestigd,
  useAannemen,
  type BronId,
} from "../_useAannemen";
import { datumNL, type Werkgever } from "../_werkgever";

/** Namens wie, de kandidaat met toestemming, en het omgekeerde formulier: per bron bevestigen. */
const Bronnen = ({
  bronnen,
  kandidaat,
  werkgever,
}: {
  bronnen: DemoAannemenBron[];
  kandidaat: DemoAannemen["kandidaat"];
  werkgever: Werkgever;
}) => {
  const router = useRouter();
  const { staat, werkBij } = useAannemen();
  const bevestigd = staat?.bronnen ?? {};
  const aantal = BRONNEN.filter((id) => bevestigd[id]).length;
  const klaar = !!staat && alleBronnenBevestigd(staat);

  const vink = (id: BronId, aan: boolean) =>
    werkBij({ bronnen: { ...bevestigd, [id]: aan } });

  return (
    <>
      <section className="mox-card rhc-row-gap" aria-labelledby="namens">
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

      <section className="mox-card rhc-row-gap" aria-labelledby="kandidaat">
        <Heading level={2} id="kandidaat">
          De kandidaat
        </Heading>
        <Paragraph>
          Gegevens over de kandidaat halen we alleen op met diens toestemming.
          In dit prototype is dat {kandidaat.voornaam} {kandidaat.achternaam};
          de toestemming is gegeven op {datumNL(kandidaat.toestemmingOp)}.
        </Paragraph>
        <DataSummary appearance="column">
          <DataSummaryItem
            itemKey="Naam"
            itemValue={`${kandidaat.voornaam} ${kandidaat.achternaam}`}
          />
          <DataSummaryItem
            itemKey="Geboortedatum"
            itemValue={datumNL(kandidaat.geboortedatum)}
          />
          <DataSummaryItem
            itemKey="BSN"
            itemValue={`${kandidaat.bsnMasker} (gaat mee, staat niet op het scherm)`}
          />
        </DataSummary>
      </section>

      <Heading level={2}>Wat de overheid al weet</Heading>
      <Paragraph>
        Per gegeven ziet u de bron, de datum en de vraag van de wet waarvoor het
        nodig is. Vink per bron aan dat de gegevens kloppen en gebruikt mogen
        worden; pas dan vullen we de aanvraag in.
      </Paragraph>
      {bronnen.map((bron) => (
        <section
          key={bron.id}
          className="mox-card rhc-row-gap"
          aria-labelledby={`bron-${bron.id}`}
        >
          <Heading level={3} id={`bron-${bron.id}`}>
            {bron.organisatie}
          </Heading>
          <Paragraph className="mox-hiring-note">
            {bron.register} · opgehaald op {datumNL(bron.opgehaald)}
          </Paragraph>
          <DataSummary appearance="column">
            {bron.gegevens.map((g) => (
              <DataSummaryItem
                key={g.parameter}
                itemKey={g.vraag}
                itemValue={g.waarde}
              />
            ))}
          </DataSummary>
          <details className="mox-hiring-legal-question">
            <summary>Zo vraagt de wet het</summary>
            <UnorderedList>
              {bron.gegevens.map((g) => (
                <UnorderedListItem key={g.parameter}>
                  “{g.wetsvraag}” ({g.grond})
                </UnorderedListItem>
              ))}
            </UnorderedList>
          </details>
          <FormFieldCheckboxOption
            label={
              bron.id === "eigen"
                ? "Klopt, gebruik mijn eigen opgave"
                : `Klopt, gebruik deze gegevens van ${bron.organisatie}`
            }
            name={`vinkje-${bron.id}`}
            checked={!!bevestigd[bron.id]}
            onChange={(event) => vink(bron.id, event.target.checked)}
          />
        </section>
      ))}

      <section className="mox-card rhc-row-gap">
        <Paragraph role="status">
          {klaar
            ? "Alle bronnen bevestigd. We kunnen de aanvraag voor u invullen."
            : aantal === 0
              ? "Nog geen bron bevestigd."
              : `${aantal} van ${BRONNEN.length} bronnen bevestigd.`}
        </Paragraph>
        <ActionGroup>
          <Button
            appearance="primary-action-button"
            aria-disabled={!klaar}
            onClick={() => {
              if (klaar)
                router.push("/personeel/iemand-aannemen/concept-aanvraag");
            }}
          >
            Vul de aanvraag in
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

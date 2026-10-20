"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ActionGroup,
  Button,
  DataSummary,
  DataSummaryItem,
  FormFieldCheckboxOption,
  Heading,
  Paragraph,
  UnorderedList,
  UnorderedListItem,
} from "@/components/rhc";
import type { DemoAannemenBron } from "@/demo";
import {
  BRONNEN,
  alleBronnenBevestigd,
  useAannemen,
  type BronId,
} from "../_useAannemen";
import { datumNL } from "../_werkgever";

/** Het omgekeerde formulier, stap 1: per bron bevestigen. */
const Bronnen = ({ bronnen }: { bronnen: DemoAannemenBron[] }) => {
  const router = useRouter();
  const { staat, werkBij } = useAannemen();
  const bevestigd = staat?.bronnen ?? {};
  const aantal = BRONNEN.filter((id) => bevestigd[id]).length;
  const klaar = !!staat && alleBronnenBevestigd(staat);

  const vink = (id: BronId, aan: boolean) =>
    werkBij({ bronnen: { ...bevestigd, [id]: aan } });

  return (
    <>
      {bronnen.map((bron) => (
        <section
          key={bron.id}
          className="mox-card rhc-row-gap"
          aria-labelledby={`bron-${bron.id}`}
        >
          <Heading level={2} id={`bron-${bron.id}`}>
            {bron.organisatie}
          </Heading>
          <Paragraph>
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
            ? "Alle bronnen bevestigd. U kunt laten berekenen wat het oplevert."
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
                router.push("/personeel/iemand-aannemen/wat-het-oplevert");
            }}
          >
            Bereken wat het oplevert
          </Button>
          <Link
            href="/personeel/iemand-aannemen"
            className="utrecht-link utrecht-link--html-a"
          >
            Terug naar de kandidaat
          </Link>
        </ActionGroup>
      </section>
    </>
  );
};

export default Bronnen;

"use client";

import Link from "next/link";
import {
  ActionGroup,
  Alert,
  Heading,
  Paragraph,
  UnorderedList,
  UnorderedListItem,
} from "@/components/rhc";
import type { DemoAannemen } from "@/demo";
import { situatieVan } from "../_route";
import { useAannemen, zaakVan } from "../_useAannemen";
import { datumNL } from "../_werkgever";

const BESLUIT = {
  gemeente:
    "Bij het besluit ziet u dezelfde berekening als vooraf, met de loonwaarde die de gemeente heeft vastgesteld.",
  wajong:
    "Bij het besluit ziet u dezelfde berekening als vooraf, met het percentage dat UWV heeft vastgesteld.",
} as const;

/** Organisatie en datum komen uit de zaak van de situatie. */
const Verstuurd = ({
  perSituatie,
}: {
  perSituatie: Record<"gemeente" | "wajong", DemoAannemen>;
}) => {
  const { staat } = useAannemen();
  if (!staat) return null;
  const situatie =
    situatieVan(staat.antwoorden.doelgroepen) === "wajong"
      ? "wajong"
      : "gemeente";
  const { kandidaat, zaak } = perSituatie[situatie];
  const stand = zaakVan(staat, situatie);
  const organisatie =
    situatie === "wajong" ? "UWV" : `de gemeente ${kandidaat.gemeente}`;

  if (!stand.ingediend)
    return (
      <>
        <Heading level={1}>Nog niets verstuurd</Heading>
        <Paragraph>
          Er is nog geen aanvraag verstuurd. Controleer de aanvraag en dien hem
          in.
        </Paragraph>
        <Paragraph>
          <Link
            href="/personeel/iemand-aannemen/concept-aanvraag"
            className="utrecht-link utrecht-link--html-a"
          >
            Naar de aanvraag
          </Link>
        </Paragraph>
      </>
    );

  const onderwerp = zaak.onderwerp[0].toLowerCase() + zaak.onderwerp.slice(1);
  return (
    <>
      <Heading level={1}>Uw aanvraag is verstuurd</Heading>
      <Alert type="ok">
        <Paragraph>
          De aanvraag {onderwerp} is verstuurd naar {organisatie}
          {stand.verstuurdOp && ` op ${datumNL(stand.verstuurdOp)}`}.
        </Paragraph>
      </Alert>
      <section
        className="rhc-mox-card rhc-mox-row-gap"
        aria-labelledby="wat-u-nu-ziet"
      >
        <Heading level={2} id="wat-u-nu-ziet">
          Wat u nu ziet
        </Heading>
        <UnorderedList>
          <UnorderedListItem>
            <Link href={zaak.url} className="utrecht-link utrecht-link--html-a">
              De zaak bij Lopende zaken
            </Link>
            : elke stap van {situatie === "wajong" ? "UWV" : "de gemeente"}, met
            datum en afzender, tot en met het besluit.
          </UnorderedListItem>
          <UnorderedListItem>
            De ontvangstbevestiging met het zaaknummer komt in uw{" "}
            <Link
              href="/berichtenbox"
              className="utrecht-link utrecht-link--html-a"
            >
              Berichtenbox
            </Link>
            .
          </UnorderedListItem>
          <UnorderedListItem>{BESLUIT[situatie]}</UnorderedListItem>
        </UnorderedList>
        <ActionGroup>
          <Link
            href={zaak.url}
            className="utrecht-button-link utrecht-button-link--html-a utrecht-button-link--primary-action"
          >
            Bekijk de zaak
          </Link>
          <Link href="/personeel" className="utrecht-link utrecht-link--html-a">
            Terug naar Personeel
          </Link>
        </ActionGroup>
      </section>
    </>
  );
};

export default Verstuurd;

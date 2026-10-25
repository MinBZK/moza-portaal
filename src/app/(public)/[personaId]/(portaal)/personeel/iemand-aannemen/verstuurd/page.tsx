import Link from "next/link";
import {
  ActionGroup,
  Alert,
  Heading,
  Paragraph,
  UnorderedList,
  UnorderedListItem,
} from "@/components/rhc";
import { getDemoIemandAannemen } from "@/demo";

/** Bevestiging na het versturen van de concept-aanvraag. */
const VerstuurdPage = async () => {
  const { kandidaat, zaak } = await getDemoIemandAannemen();
  return (
    <>
      <Heading level={1}>Uw aanvraag is verstuurd</Heading>
      <Alert type="ok">
        <Paragraph>
          De aanvraag loonkostensubsidie voor {kandidaat.voornaam}{" "}
          {kandidaat.achternaam} is verstuurd naar de gemeente Lansingerland op
          5 oktober 2026.
        </Paragraph>
      </Alert>
      <section className="rhc-mox-card rhc-mox-row-gap" aria-labelledby="wat-u-nu-ziet">
        <Heading level={2} id="wat-u-nu-ziet">
          Wat u nu ziet
        </Heading>
        <UnorderedList>
          <UnorderedListItem>
            <Link href={zaak.url} className="utrecht-link utrecht-link--html-a">
              De zaak bij Lopende zaken
            </Link>
            : elke stap van de gemeente, met datum en afzender, tot en met het
            besluit en de betaling.
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
          <UnorderedListItem>
            Bij het besluit ziet u dezelfde berekening als vooraf, met de
            loonwaarde die de gemeente heeft vastgesteld.
          </UnorderedListItem>
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

export default VerstuurdPage;

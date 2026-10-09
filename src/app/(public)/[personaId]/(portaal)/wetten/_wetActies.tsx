import Link from "next/link";
import { ActionGroup, Button, Icon } from "@/components/rhc";
import type { DemoWet } from "@/demo";
import { BewaarKnop, NietRelevantKnop } from "../bewaard/_bewaarActies";
import type { BewaarItem } from "../bewaard/_useBewaard";

/** Het item zoals Bewaard en "niet relevant" het opslaan. */
export const bewaarItemVan = (wet: DemoWet): BewaarItem => ({
  sleutel: `wet:${wet.id}`,
  categorie: "Wetten en regelgeving",
  titel: wet.titel,
  samenvatting: wet.samenvatting,
  href: `/wetten/${wet.id}`,
});

/** Zelfde vraag als in moza-poc (assets/javascript/assistent-vraag.js). */
export const assistentLink = (wet: DemoWet) =>
  `/digitale-assistent?vraag=${encodeURIComponent(
    wet.assistentVraag ?? `Geldt “${wet.titel.trim()}” voor mijn bedrijf?`,
  )}`;

const WetActies = ({
  wet,
  delen,
}: {
  wet: DemoWet;
  /** Flag "Delen" uit het Flags-paneel. */
  delen: boolean;
}) => {
  const item = bewaarItemVan(wet);
  return (
    // role vast: ActionGroup telt de children anders op server en client.
    <ActionGroup role="group" direction="row" className="mox-action-group">
      <BewaarKnop item={item} />
      {delen && (
        <Button appearance="secondary-action-button">
          <Icon icon="delen" />
          Deel
        </Button>
      )}
      <Link
        href={assistentLink(wet)}
        className="utrecht-button-link utrecht-button-link--html-a utrecht-button-link--secondary-action"
      >
        <Icon icon="communicatie" />
        Vraag aan de digitale assistent
      </Link>
      <NietRelevantKnop item={item} />
    </ActionGroup>
  );
};

export default WetActies;

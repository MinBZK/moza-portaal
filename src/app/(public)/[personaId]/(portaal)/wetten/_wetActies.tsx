import Link from "next/link";
import { ActionGroup, Icon, LinkButton } from "@/components/rhc";
import { DigitaleAssistentIcon } from "@/components/icons/digitaleAssistentIcon";
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
    <ActionGroup
      role="group"
      direction="row"
      className="mox-action-group rhc-action-group-dense"
    >
      <BewaarKnop item={item} alsLink />
      {delen && (
        <LinkButton>
          <Icon icon="delen" />
          Delen
        </LinkButton>
      )}
      {/* Een echte link (naar de assistent), met dezelfde opmaak. */}
      <Link href={assistentLink(wet)} className="utrecht-link-button">
        <DigitaleAssistentIcon />
        Aan digitale assistent vragen
      </Link>
      <NietRelevantKnop item={item} alsLink />
    </ActionGroup>
  );
};

export default WetActies;

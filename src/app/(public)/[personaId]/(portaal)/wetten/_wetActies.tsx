import Link from "next/link";
import { ActionGroup } from "@/components/rhc";
import ShareButton from "@/components/ShareButton";
import { DigitalAssistantIcon } from "@/components/icons/digitalAssistantIcon";
import type { DemoWet } from "@/demo";
import { BewaarKnop, NietRelevantKnop } from "@/components/save/saveActions";
import type { BewaarItem } from "@/components/save/useSaved";

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
      className="mox-action-group rhc-mox-action-group-dense"
    >
      <BewaarKnop item={item} alsLink />
      {delen && (
        <ShareButton
          title={wet.titel}
          text={wet.samenvatting}
          url={item.href}
        />
      )}
      {/* Een echte link (naar de assistent), met dezelfde opmaak. */}
      <Link href={assistentLink(wet)} className="utrecht-link-button">
        <DigitalAssistantIcon />
        Vraag aan de digitale assistent
      </Link>
      <NietRelevantKnop item={item} alsLink />
    </ActionGroup>
  );
};

export default WetActies;

import Link from "next/link";
import { ActionGroup, Icon, LinkButton } from "@/components/rhc";
import type { DemoSubsidie } from "@/demo";
import { BewaarKnop, NietRelevantKnop } from "../bewaard/_bewaarActies";
import type { BewaarItem } from "../bewaard/_useBewaard";

/** Het item zoals Bewaard en "niet relevant" het opslaan. */
export const bewaarItemVan = (subsidie: DemoSubsidie): BewaarItem => ({
  sleutel: `subsidie:${subsidie.id}`,
  categorie: "Subsidies en financiering",
  titel: subsidie.titel,
  samenvatting: subsidie.samenvatting,
  href: `/subsidies/${subsidie.id}`,
});

/** Zelfde vraag als in moza-poc (assets/javascript/assistent-vraag.js). */
export const assistentLink = (subsidie: DemoSubsidie) =>
  `/digitale-assistent?vraag=${encodeURIComponent(
    `Kom ik in aanmerking voor “${subsidie.titel.trim()}”?`,
  )}`;

const SubsidieActies = ({
  subsidie,
  delen,
}: {
  subsidie: DemoSubsidie;
  /** Flag "Delen" uit het Flags-paneel. */
  delen: boolean;
}) => {
  const item = bewaarItemVan(subsidie);
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
      <Link href={assistentLink(subsidie)} className="utrecht-link-button">
        <Icon icon="communicatie" />
        Aan digitale assistent vragen
      </Link>
      <NietRelevantKnop item={item} alsLink />
    </ActionGroup>
  );
};

export default SubsidieActies;

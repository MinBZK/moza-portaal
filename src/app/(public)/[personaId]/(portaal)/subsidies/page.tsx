import {
  Heading,
  Paragraph,
  Alert,
  DataSummary,
  DataSummaryItem,
  Link,
  ActionGroup,
  Button,
} from "@/components/rhc";
import { Icon } from "@rijkshuisstijl-community/icon-react";
import {
  BewaarKnop,
  NietRelevantKnop,
  RelevantItem,
} from "../bewaard/_bewaarActies";
import PageNumberNavigation from "@/components/pageNumberNavigation";
import { getDemoSubsidies } from "@/demo";
import { getFlagsFromServerCookie } from "@/app/actions";
import { getActievePersona } from "@/app/(public)/_persona";

const SubsidiesPage = async () => {
  const flags = await getFlagsFromServerCookie();
  const persona = await getActievePersona();
  const subsidies = await getDemoSubsidies(persona?.subsidies);

  return (
    <>
      <Heading level={1}>Subsidies en financiering</Heading>

      <Alert type="info">
        <Paragraph>
          Subsidies en financiering waar u mogelijk voor in aanmerking komt,
          geselecteerd op basis van uw bedrijfsprofiel. Door items te bewaren of
          als niet relevant te markeren helpt u ons de aanbevelingen te
          verbeteren.
        </Paragraph>
      </Alert>

      {subsidies.map((subsidie) => {
        const item = {
          sleutel: `subsidie:${subsidie.id}`,
          categorie: "Subsidies en financiering",
          titel: subsidie.titel,
          samenvatting: subsidie.samenvatting,
          href: `/subsidies#${subsidie.id}`,
        };
        return (
          <RelevantItem key={subsidie.id} item={item}>
            <div className="mox-card" id={subsidie.id}>
              <Heading level={2}>{subsidie.titel}</Heading>
              <Paragraph>{subsidie.samenvatting}</Paragraph>

              <DataSummary appearance="column">
                <DataSummaryItem
                  itemKey="Verstrekker"
                  itemValue={subsidie.verstrekker}
                />
                <DataSummaryItem itemKey="Type" itemValue={subsidie.type} />
                <DataSummaryItem
                  itemKey="Aanvraagperiode"
                  itemValue={subsidie.aanvraagperiode}
                />
                {subsidie.maximaalBedrag && (
                  <DataSummaryItem
                    itemKey="Maximaal bedrag"
                    itemValue={subsidie.maximaalBedrag}
                  />
                )}
              </DataSummary>

              {subsidie.alinea.map((tekst) => (
                <Paragraph key={tekst}>{tekst}</Paragraph>
              ))}

              <Heading level={3}>Vragen over deze regeling?</Heading>
              <Paragraph>
                <Link inline href="#">
                  De digitale assistent zoekt voor u uit
                </Link>
                . Bijvoorbeeld: komt u in aanmerking voor deze subsidie, en wat
                moet u doen vóór de aanvraagperiode sluit?
              </Paragraph>

              <ActionGroup direction="row" className="mox-action-group">
                <BewaarKnop item={item} />
                {flags.mox_delen && (
                  <Button appearance="secondary-action-button">
                    <Icon icon="delen" />
                    Deel
                  </Button>
                )}
                <Button appearance="secondary-action-button">
                  <Icon icon="communicatie" />
                  Vraag aan de digitale assistent
                </Button>
                <NietRelevantKnop item={item} />
              </ActionGroup>

              <Button appearance="primary-action-button">
                {subsidie.websiteLabel}
              </Button>
            </div>
          </RelevantItem>
        );
      })}

      <PageNumberNavigation maxVisiblePages={5} page={1} totalPages={10} />
    </>
  );
};

export default SubsidiesPage;

import {
  Heading,
  Paragraph,
  Alert,
  DataSummary,
  DataSummaryItem,
  OrderedList,
  OrderedListItem,
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
import { getDemoWetten } from "@/demo";
import { getFlagsFromServerCookie } from "@/app/actions";
import { getActievePersona } from "@/app/(public)/_persona";

const WettenPage = async () => {
  const flags = await getFlagsFromServerCookie();
  const persona = await getActievePersona();
  const wetten = await getDemoWetten(persona?.regelgeving);

  return (
    <>
      <Heading level={1}>Wetten en regelgeving</Heading>

      <Alert type="info">
        <Paragraph>
          Wetten en regelgeving die mogelijk betrekking hebben op uw bedrijf of
          branche, geselecteerd op basis van uw bedrijfsprofiel. Door items te
          bewaren of als niet relevant te markeren helpt u ons de aanbevelingen
          te verbeteren.
        </Paragraph>
      </Alert>

      {wetten.map((wet) => {
        const item = {
          sleutel: `wet:${wet.id}`,
          categorie: "Wetten en regelgeving",
          titel: wet.titel,
          samenvatting: wet.samenvatting,
          href: `/wetten#${wet.id}`,
        };
        return (
          <RelevantItem key={wet.id} item={item}>
            <div className="mox-card" id={wet.id}>
              <Heading level={2}>{wet.titel}</Heading>
              <Paragraph>{wet.samenvatting}</Paragraph>

              <DataSummary appearance="column">
                {wet.status && (
                  <DataSummaryItem itemKey="Status" itemValue={wet.status} />
                )}
                <DataSummaryItem itemKey="Bron" itemValue={wet.bron} />
                <DataSummaryItem
                  itemKey="Gaat in op"
                  itemValue={wet.ingangsdatum}
                />
                <DataSummaryItem itemKey="Voor wie" itemValue={wet.voorWie} />
              </DataSummary>

              {wet.alinea.map((tekst) => (
                <Paragraph key={tekst}>{tekst}</Paragraph>
              ))}

              {wet.stappen.length > 0 && (
                <>
                  <Heading level={3}>Wat moet u doen?</Heading>
                  <OrderedList>
                    {wet.stappen.map((stap) => (
                      <OrderedListItem key={stap}>{stap}</OrderedListItem>
                    ))}
                  </OrderedList>
                </>
              )}

              {/* role vast: ActionGroup telt de children anders op server en client */}
              <ActionGroup
                role="group"
                direction="row"
                className="mox-action-group"
              >
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
                {wet.websiteLabel}
              </Button>
            </div>
          </RelevantItem>
        );
      })}

      <PageNumberNavigation maxVisiblePages={5} page={1} totalPages={10} />
    </>
  );
};

export default WettenPage;

import {
  Heading,
  Paragraph,
  DataSummary,
  DataSummaryItem,
  ActionGroup,
  Button,
  Separator,
} from "@rijkshuisstijl-community/components-react";
import { Icon } from "@rijkshuisstijl-community/icon-react";
import {
  BewaarKnop,
  NietRelevantKnop,
  RelevantItem,
} from "../bewaard/_bewaarActies";
import PageNumberNavigation from "@/components/pageNumberNavigation";
import { getDemoBuurtberichten } from "@/demo";

const OmgevingsberichtenPage = async () => {
  const berichten = await getDemoBuurtberichten();

  return (
    <>
      <Heading level={1}>Berichten over uw buurt</Heading>
      <Paragraph>
        Berichten over de omgeving van uw bedrijfsadres. Denk aan werkzaamheden,
        vergunningen en verkeersmaatregelen.
      </Paragraph>

      {berichten.map((bericht) => {
        const item = {
          sleutel: `bericht:${bericht.id}`,
          categorie: "Berichten over uw buurt",
          titel: bericht.titel,
          samenvatting: bericht.samenvatting,
          href: `/omgevingsberichten#${bericht.id}`,
        };
        return (
          <RelevantItem key={bericht.id} item={item}>
            <div className="mox-card" id={bericht.id}>
              <Heading level={2}>{bericht.titel}</Heading>
              <Paragraph>{bericht.samenvatting}</Paragraph>

              <DataSummary appearance="column">
                <DataSummaryItem itemKey="Bron" itemValue={bericht.bron} />
                <DataSummaryItem itemKey="Datum" itemValue={bericht.datum} />
                <DataSummaryItem
                  itemKey="Locatie"
                  itemValue={bericht.locatie}
                />
              </DataSummary>

              <ActionGroup direction="row">
                <BewaarKnop item={item} />
                <Button appearance="secondary-action-button">
                  <Icon icon="delen" />
                  Deel
                </Button>
                <NietRelevantKnop item={item} />
              </ActionGroup>
            </div>
          </RelevantItem>
        );
      })}

      <PageNumberNavigation maxVisiblePages={5} page={1} totalPages={5} />
    </>
  );
};

export default OmgevingsberichtenPage;

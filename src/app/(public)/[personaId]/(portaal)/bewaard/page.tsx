import {
  Heading,
  Paragraph,
  Alert,
  Separator,
  Link,
} from "@rijkshuisstijl-community/components-react";
import BewaardeItems from "./_bewaardeItems";

const BewaardPage = async () => {
  return (
    <>
      <Heading level={1}>Bewaarde items</Heading>
      <BewaardeItems
        soort="bewaard"
        zonderCategorie="Digitale assistent"
        leeg={
          <Alert type="info">
            <Paragraph>
              U heeft nog niets bewaard. Gebruik de knop <strong>Bewaar</strong>{" "}
              bij{" "}
              <Link inline href="/subsidies">
                Subsidies en financiering
              </Link>
              ,{" "}
              <Link inline href="/wetten">
                Wetten en regelgeving
              </Link>{" "}
              of{" "}
              <Link inline href="/buurtberichten">
                Berichten over uw buurt
              </Link>
              .
            </Paragraph>
          </Alert>
        }
      />

      <Heading level={2}>Gesprekken met de digitale assistent</Heading>
      <BewaardeItems
        soort="bewaard"
        alleenCategorie="Digitale assistent"
        leeg={
          <Alert type="info">
            <Paragraph>
              U heeft nog geen gesprekken bewaard. Start een gesprek bij{" "}
              <Link inline href="/digitale-assistent">
                Digitale assistent
              </Link>
              .
            </Paragraph>
          </Alert>
        }
      />

      <Heading level={2}>Niet relevant gemarkeerd</Heading>
      <Paragraph>
        Items die u wegklikt komen hier te staan. Wij gebruiken ze niet om uw
        profiel te verfijnen. U kunt ze hier weer zichtbaar maken.
      </Paragraph>
      <BewaardeItems
        soort="nietRelevant"
        leeg={
          <Alert type="info">
            <Paragraph>
              U heeft nog niets als niet relevant gemarkeerd. Gebruik daarvoor
              de knop <strong>Niet relevant voor mij</strong> bij een item.
            </Paragraph>
          </Alert>
        }
      />
    </>
  );
};

export default BewaardPage;

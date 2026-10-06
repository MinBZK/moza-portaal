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
        leeg={
          <Alert type="info">
            <Paragraph>
              U heeft nog niets bewaard. Gebruik de knop &quot;Bewaar&quot; bij{" "}
              <Link inline href="/subsidies">
                Subsidies en financiering
              </Link>
              ,{" "}
              <Link inline href="/wetten">
                Wetten en regelgeving
              </Link>{" "}
              of{" "}
              <Link inline href="/omgevingsberichten">
                Berichten over uw buurt
              </Link>
              .
            </Paragraph>
          </Alert>
        }
      />

      <Separator />

      <Heading level={2}>Gesprekken met de digitale assistent</Heading>
      <Alert type="info">
        <Paragraph>
          U heeft nog geen gesprekken bewaard. Start een gesprek bij{" "}
          <Link inline href="/digitale-assistent">
            Digitale assistent
          </Link>
          .
        </Paragraph>
      </Alert>

      <Separator />

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
              de knop &quot;Niet relevant voor mij&quot; bij een item.
            </Paragraph>
          </Alert>
        }
      />
    </>
  );
};

export default BewaardPage;

import { Heading, Paragraph, Alert } from "@/components/rhc";
import BewaardeItems from "../_bewaardeItems";
import SavedTabs from "../_savedTabs";

const NotRelevantPage = async () => {
  return (
    <>
      <Heading level={1}>Bewaarde items</Heading>
      <SavedTabs active="notRelevant" />
      <Alert type="info" closable>
        <Paragraph>
          Items die u wegklikt komen hier te staan. Wij gebruiken ze niet om uw
          profiel te verfijnen. U kunt ze hier weer zichtbaar maken.
        </Paragraph>
      </Alert>
      <BewaardeItems
        soort="nietRelevant"
        leeg={
          <Alert type="info">
            <Paragraph>
              U hebt nog niets als niet relevant gemarkeerd. Gebruik daarvoor de
              knop <strong>Niet relevant voor mij</strong> bij een item.
            </Paragraph>
          </Alert>
        }
      />
    </>
  );
};

export default NotRelevantPage;

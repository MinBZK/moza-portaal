import type { Metadata } from "next";
import { Heading, Paragraph, Alert } from "@/components/rhc";
import BewaardeItems from "../_bewaardeItems";
import SavedTabs from "../_savedTabs";

export const metadata: Metadata = { title: "Niet relevant - Bewaarde items" };

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
              Hier staat nog niets. Items waarbij u{" "}
              <strong>Niet relevant voor mij</strong> kiest, worden hier
              bewaard.
            </Paragraph>
          </Alert>
        }
      />
    </>
  );
};

export default NotRelevantPage;

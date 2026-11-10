import type { Metadata } from "next";
import { Heading, Paragraph, Alert } from "@/components/rhc";
import BewaardeItems from "../_bewaardeItems";
import SavedTabs from "../_savedTabs";

export const metadata: Metadata = {
  title: "Niet relevant voor mij - Bewaarde items",
};

const NotRelevantPage = async () => {
  return (
    <>
      <Heading level={1}>Bewaarde items</Heading>
      <div className="rhc-mox-card">
        <SavedTabs active="notRelevant" />
        <Alert type="info" closable>
          <Paragraph>
            Hier staan de items waarbij u{" "}
            <strong>Niet relevant voor mij</strong> koos. Wij gebruiken die
            keuze niet om te bepalen wat u te zien krijgt. Kies{" "}
            <strong>Terugzetten</strong> om een item weer te tonen.
          </Paragraph>
        </Alert>
        <BewaardeItems
          soort="nietRelevant"
          leeg={
            <Alert type="info">
              <Paragraph>
                Hier staat nog niets. Items waarbij u{" "}
                <strong>Niet relevant voor mij</strong> kiest, komen hier te
                staan.
              </Paragraph>
            </Alert>
          }
        />
      </div>
    </>
  );
};

export default NotRelevantPage;

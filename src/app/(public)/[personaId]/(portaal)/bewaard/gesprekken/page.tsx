import type { Metadata } from "next";
import { Heading, Paragraph, Alert, Link } from "@/components/rhc";
import BewaardeItems from "../_bewaardeItems";
import SavedTabs from "../_savedTabs";

export const metadata: Metadata = {
  title: "Gesprekken met de digitale assistent - Bewaarde items",
};

const ConversationsPage = async () => {
  return (
    <>
      <Heading level={1}>Bewaarde items</Heading>
      <div className="rhc-mox-card">
        <SavedTabs active="conversations" />
        <BewaardeItems
          soort="bewaard"
          alleenCategorie="Digitale assistent"
          leeg={
            <Alert type="info" closable>
              <Paragraph>
                U heeft nog geen gesprekken bewaard. Start een gesprek met de{" "}
                <Link inline href="/digitale-assistent">
                  digitale assistent
                </Link>{" "}
                en kies <strong>Gesprek bewaren</strong>.
              </Paragraph>
            </Alert>
          }
        />
      </div>
    </>
  );
};

export default ConversationsPage;

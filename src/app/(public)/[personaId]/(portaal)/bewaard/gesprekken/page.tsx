import { Heading, Paragraph, Alert, Link } from "@/components/rhc";
import BewaardeItems from "../_bewaardeItems";
import SavedTabs from "../_savedTabs";

const ConversationsPage = async () => {
  return (
    <>
      <Heading level={1}>Bewaarde items</Heading>
      <SavedTabs active="conversations" />
      <BewaardeItems
        soort="bewaard"
        alleenCategorie="Digitale assistent"
        leeg={
          <Alert type="info" closable>
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
    </>
  );
};

export default ConversationsPage;

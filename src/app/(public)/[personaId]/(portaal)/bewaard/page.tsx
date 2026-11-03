import type { Metadata } from "next";
import { Heading, Paragraph, Alert, Link } from "@/components/rhc";
import BewaardeItems from "./_bewaardeItems";
import SavedTabs from "./_savedTabs";

export const metadata: Metadata = { title: "Bewaarde items" };

const BewaardPage = async () => {
  return (
    <>
      <Heading level={1}>Bewaarde items</Heading>
      <div className="rhc-mox-card">
        <SavedTabs active="saved" />
        <BewaardeItems
          soort="bewaard"
          zonderCategorie="Digitale assistent"
          leeg={
            <Alert type="info" closable>
              <Paragraph>
                U hebt nog niets bewaard. Gebruik de knop{" "}
                <strong>Bewaren</strong> bij{" "}
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
      </div>
    </>
  );
};

export default BewaardPage;

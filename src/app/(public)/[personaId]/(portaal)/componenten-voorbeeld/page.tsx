import type { Metadata } from "next";
// Example page for the new components. Temporary: delete this folder
// (componenten-voorbeeld) when it is no longer needed; nothing else uses it.
import { Alert, Heading, Paragraph } from "@/components/rhc";
import BarGraph from "@/components/BarGraph";
import StepIndicator from "@/components/StepIndicator";
import StickyInfoBox from "@/components/StickyInfoBox";
import Switch from "@/components/Switch";
import TextBadge from "@/components/TextBadge";

export const metadata: Metadata = { title: "Voorbeeld componenten" };

const ComponentsExamplePage = async () => (
  <>
    <Heading level={1}>Voorbeeld componenten</Heading>
    <Alert type="info">
      <Paragraph>
        Testpagina voor de nieuwe componenten van digitale assistent 2.0.
      </Paragraph>
    </Alert>

    <div className="rhc-grid">
      <div className="rhc-grid__cell rhc-grid__cell-t-8">
        {/* Container: space between the cards. */}
        <div className="rhc-mox-main-container">
          <section className="rhc-mox-card">
            <Heading level={2}>Text badge</Heading>
            <Paragraph>
              <TextBadge>Neutraal</TextBadge>{" "}
              <TextBadge variant="info">Informatie</TextBadge>{" "}
              <TextBadge variant="ok">Gelukt</TextBadge>{" "}
              <TextBadge variant="warning">Waarschuwing</TextBadge>{" "}
              <TextBadge variant="error">Fout</TextBadge>
            </Paragraph>
          </section>

          <section className="rhc-mox-card">
            <Heading level={2}>Step indicator</Heading>
            <StepIndicator
              steps={["Stap 1", "Stap 2", "Stap 3", "Stap 4"]}
              current={1}
            />
          </section>

          <section className="rhc-mox-card">
            <Heading level={2}>Switch</Heading>
            <Switch label="defaultChecked" defaultChecked />
            <Switch label="Default" />
            <Switch label="Disabled" disabled />
          </section>

          <section className="rhc-mox-card">
            <Heading level={2}>Bar graph</Heading>
            <BarGraph
              title="Neutraal"
              items={[
                { label: "Datapunt 1", value: 10 },
                { label: "Datapunt 2", value: 20 },
                { label: "Datapunt 3", value: 50 },
                { label: "Datapunt 4", value: 99 },
              ]}
              formatValue={(value) => value.toLocaleString("nl-NL")}
            />
            <BarGraph
              title="Positief"
              variant="positive"
              items={[
                { label: "Lorem ipsum", value: 12000 },
                { label: "Dolor sit amet", value: 18000 },
                { label: "Consectetur adipiscing elit", value: 38000 },
              ]}
              formatValue={(value) => `${value}%`}
            />
            <BarGraph
              title="Negatief"
              variant="negative"
              items={[
                { label: "Nulla commodo massa eu mi dictum", value: 1 },
                {
                  label:
                    "Class aptent taciti sociosqu ad litora torquent per conubia nostra",
                  value: 2,
                },
                { label: "Pellentesque lobortis", value: 3 },
              ]}
              formatValue={(value) => `${value}`}
            />
            <BarGraph
              title="Alle varianten"
              items={[
                { label: "Neutraal", value: 100 },
                { label: "Positief", value: 82, variant: "positive" },
                { label: "Negatief", value: 14, variant: "negative" },
              ]}
            />
            <BarGraph
              track
              title="Met baan (track)"
              items={[
                { label: "Negatief", value: 10, variant: "negative" },
                { label: "Neutraal 1", value: 20 },
                { label: "Neutraal 2", value: 50 },
                { label: "Positief", value: 99, variant: "positive" },
              ]}
              formatValue={(value) => value.toLocaleString("nl-NL")}
            />
          </section>
        </div>
      </div>

      <div className="rhc-grid__cell rhc-grid__cell-t-4">
        <StickyInfoBox title="Sticky infobox">
          <Paragraph>
            Deze infobox blijft staan wanneer naar beneden gescrolled wordt.
          </Paragraph>
        </StickyInfoBox>
      </div>
    </div>
  </>
);

export default ComponentsExamplePage;

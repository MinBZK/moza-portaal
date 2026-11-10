import type { Metadata } from "next";
import { DataSummary, Heading, Paragraph } from "@/components/rhc";
import DataSummaryLinkItem from "@/components/DataSummaryLinkItem";
import { PATTERNS, TextLink } from "./_parts";

export const metadata: Metadata = { title: "Ontwerppatronen" };

/** Overview of the design patterns from the Storybook of moza-poc. */
const PatternsPage = () => (
  <>
    <Heading level={1}>Ontwerppatronen</Heading>
    <div className="rhc-mox-card">
      <Paragraph>
        Een ontwerppatroon beschrijft een oplossing voor een taak van de
        gebruiker, een niveau boven een component. Deze patronen komen uit de
        Storybook van moza-poc. De componenten zelf staan op{" "}
        <TextLink href="/demo">Componenten</TextLink>.
      </Paragraph>
      <DataSummary className="rhc-mox-summary-rows">
        {PATTERNS.map(({ slug, title, description }) => (
          <DataSummaryLinkItem
            key={slug}
            itemKey={title}
            itemValue={description}
            href={`/demo/ontwerppatronen/${slug}`}
          />
        ))}
      </DataSummary>
    </div>
  </>
);

export default PatternsPage;

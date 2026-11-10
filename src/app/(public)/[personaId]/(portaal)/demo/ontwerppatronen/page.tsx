import type { Metadata } from "next";
import {
  DataSummary,
  DataSummaryItem,
  Heading,
  Paragraph,
} from "@/components/rhc";
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
          <DataSummaryItem
            key={slug}
            itemKey={title}
            itemValue={description}
            keyHref={`/demo/ontwerppatronen/${slug}`}
          />
        ))}
      </DataSummary>
    </div>
  </>
);

export default PatternsPage;

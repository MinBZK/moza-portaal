import type { Metadata } from "next";
import { AccordionProvider, Heading, Paragraph } from "@/components/rhc";
import { getDemoZaken, getDemoZakenVragen } from "@/demo";
import ZakenTabel from "./_zakenTabel";
import ZakenTabs from "./_zakenTabs";
import PageSearch from "@/layouts/search";

export const metadata: Metadata = { title: "Lopende zaken" };

const LopendeZakenPage = async () => {
  const [zaken, vragen] = await Promise.all([
    getDemoZaken("lopend"),
    getDemoZakenVragen(),
  ]);

  return (
    <>
      <Heading level={1}>Lopende zaken</Heading>
      <PageSearch />
      <div className="rhc-mox-card">
        <ZakenTabs actief="lopend" />
        <ZakenTabel zaken={zaken} soort="lopend" />
      </div>

      <Heading level={2}>Veelgestelde vragen</Heading>
      <div className="mox-faq-card">
        <AccordionProvider
          headingLevel={3}
          sections={vragen.map(({ vraag, antwoord }) => ({
            label: vraag,
            body: <Paragraph>{antwoord}</Paragraph>,
          }))}
        />
      </div>
    </>
  );
};

export default LopendeZakenPage;

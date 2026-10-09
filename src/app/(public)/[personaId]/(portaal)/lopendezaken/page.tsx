import { AccordionProvider, Heading, Paragraph } from "@/components/rhc";
import { getDemoZaken, getDemoZakenVragen } from "@/demo";
import ZakenTabel from "./_zakenTabel";
import ZakenTabs from "./_zakenTabs";

const LopendeZakenPage = async () => {
  const [zaken, vragen] = await Promise.all([
    getDemoZaken("lopend"),
    getDemoZakenVragen(),
  ]);

  return (
    <>
      <Heading level={1}>Lopende zaken</Heading>
      <div className="mox-card">
        <ZakenTabs actief="lopend" />
        <ZakenTabel zaken={zaken} soort="lopend" />
      </div>

      <Heading level={2}>Veelgestelde vragen</Heading>
      <div className="mox-faq-card">
        <AccordionProvider
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

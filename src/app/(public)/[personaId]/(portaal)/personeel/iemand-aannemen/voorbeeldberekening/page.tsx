import type { Metadata } from "next";
import { AccordionProvider, Heading, Paragraph } from "@/components/rhc";
import Regelingen from "../_regelingen";
import Stappen from "../_stappen";
import { TAAK_TITEL } from "../_taakTitel";
import Vragen from "../_vragen";

export const metadata: Metadata = {
  title: "Voorbeeldberekening - Iemand aannemen - Personeel en rollen",
};

/** Stap 1: wat er kan, vier vragen en de voorbeeldberekening. */
const VoorbeeldberekeningPage = () => (
  <>
    <Heading level={1}>{TAAK_TITEL}</Heading>
    <div className="rhc-mox-card rhc-mox-row-gap">
      <Stappen huidige={1} />
      <Paragraph>
        Neemt u iemand aan die moeilijk aan werk komt, bijvoorbeeld door een
        arbeidsbeperking? Dan kunt u een deel van de loonkosten terugkrijgen en
        loopt u minder risico als uw werknemer ziek wordt. Welke regelingen
        gelden, hangt af van de kandidaat, bijvoorbeeld of die in het
        doelgroepregister staat.
      </Paragraph>
      <AccordionProvider
        headingLevel={2}
        sections={[
          { label: "Regelingen die kunnen gelden", body: <Regelingen /> },
        ]}
      />
      <Paragraph>
        Beantwoord de vragen. In de voorbeeldberekening ziet u meteen uw
        geschatte loonkosten.
      </Paragraph>
      <Vragen />
    </div>
  </>
);

export default VoorbeeldberekeningPage;

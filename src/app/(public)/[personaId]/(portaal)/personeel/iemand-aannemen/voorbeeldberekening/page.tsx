import type { Metadata } from "next";
import { Heading, Paragraph } from "@/components/rhc";
import { TAAK_TITEL } from "../_taakTitel";
import Vragen from "../_vragen";

export const metadata: Metadata = {
  title: "Voorbeeldberekening - Iemand aannemen - Personeel en rollen",
};

/** De voorbeeldberekening: de inleiding, de vragen en de berekening. Begrippen hebben een (i). */
const VoorbeeldberekeningPage = () => (
  <>
    <Heading level={1}>{TAAK_TITEL}</Heading>
    <div className="rhc-mox-card rhc-mox-row-gap">
      <Paragraph>
        Bereken wat regelingen u opleveren als u iemand met afstand tot de
        arbeidsmarkt aanneemt. Dit is een schatting. Nadat u de regelingen hebt
        aangevraagd, berekenen gemeente, UWV en Belastingdienst het echte
        bedrag.
      </Paragraph>
      <Vragen />
    </div>
  </>
);

export default VoorbeeldberekeningPage;

import type { Metadata } from "next";
import { Heading, Paragraph } from "@/components/rhc";
import Stappen from "../_stappen";
import { TAAK_TITEL } from "../_taakTitel";
import Vragen from "../_vragen";

export const metadata: Metadata = {
  title: "Voorbeeldberekening - Iemand aannemen - Personeel en rollen",
};

/** Stap 2: vier vragen en de voorbeeldberekening. */
const VoorbeeldberekeningPage = () => (
  <>
    <Heading level={1}>{TAAK_TITEL}</Heading>
    <div className="rhc-mox-card rhc-mox-row-gap">
      <Stappen huidige={2} />
      <Paragraph>
        Deze voorbeeldberekening is een vereenvoudigde weergave van de
        werkelijkheid. Het echte bedrag stellen de gemeente, UWV en de
        Belastingdienst vast na uw aanvraag. De voorbeeldberekening laat niet
        alle mogelijkheden zien. Er kunnen meer regelingen gelden dan hier
        staan.
      </Paragraph>
      <Vragen />
    </div>
  </>
);

export default VoorbeeldberekeningPage;

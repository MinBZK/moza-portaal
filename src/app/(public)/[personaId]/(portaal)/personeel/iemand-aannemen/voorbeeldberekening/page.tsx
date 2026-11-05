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
        Beantwoord vier vragen. In de voorbeeldberekening ziet u meteen wat het
        u kan opleveren. Daarna vullen wij de aanvraag voor u in.
      </Paragraph>
      <Vragen />
    </div>
  </>
);

export default VoorbeeldberekeningPage;

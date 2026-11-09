import type { Metadata } from "next";
import { Heading, Paragraph } from "@/components/rhc";
import { TAAK_TITEL } from "../_taakTitel";
import Vragen from "../_vragen";

export const metadata: Metadata = {
  title: "Voorbeeldberekening - Iemand aannemen - Personeel en rollen",
};

/** De voorbeeldberekening: de disclaimer, de vragen en de berekening. Begrippen hebben een (i). */
const VoorbeeldberekeningPage = () => (
  <>
    <Heading level={1}>{TAAK_TITEL}</Heading>
    <div className="rhc-mox-card rhc-mox-row-gap">
      <Paragraph>
        Deze berekening is een voorbeeld. Na uw aanvraag berekenen gemeente, UWV
        en Belastingdienst het echte bedrag. Er kunnen ook regelingen voor u
        gelden die hier niet staan.
      </Paragraph>
      <Vragen />
    </div>
  </>
);

export default VoorbeeldberekeningPage;

import type { Metadata } from "next";
import { Heading, Paragraph } from "@/components/rhc";
import { TAAK_TITEL } from "../_taakTitel";
import Vragen from "../_vragen";

export const metadata: Metadata = {
  title:
    "Voorbeeldberekening - Regelingen bij het aannemen van personeel - Personeel en rollen",
};

/** De voorbeeldberekening: de inleiding, de vragen en de berekening. Begrippen hebben een (i). */
const VoorbeeldberekeningPage = () => (
  <>
    <Heading level={1}>{TAAK_TITEL}</Heading>
    <div className="rhc-mox-card rhc-mox-row-gap">
      <Paragraph>
        Neemt u iemand aan met een arbeidsbeperking of een afstand tot de
        arbeidsmarkt? Bereken wat regelingen u kunnen opleveren. Dit is een
        schatting. Het echte bedrag stellen de gemeente, UWV en de
        Belastingdienst vast. Er kunnen ook regelingen voor u gelden die hier
        niet staan.
      </Paragraph>
      <Vragen />
    </div>
  </>
);

export default VoorbeeldberekeningPage;

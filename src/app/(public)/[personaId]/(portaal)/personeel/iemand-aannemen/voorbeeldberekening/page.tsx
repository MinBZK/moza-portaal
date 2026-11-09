import type { Metadata } from "next";
import { Heading, Paragraph } from "@/components/rhc";
import Stappen from "../_stappen";
import { TAAK_TITEL } from "../_taakTitel";
import Vragen from "../_vragen";

export const metadata: Metadata = {
  title: "Voorbeeldberekening - Iemand aannemen - Personeel en rollen",
};

/** Stap 1: wat er kan, vier vragen en de voorbeeldberekening. Begrippen hebben een (i). */
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
      <Paragraph>
        Het doelgroepregister is een lijst van UWV met mensen die onder de
        banenafspraak vallen. Beschut werk is werk in een beschutte omgeving,
        voor iemand die alleen zo kan werken. De gemeente stelt vast wie op
        beschut werk is aangewezen.
      </Paragraph>
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

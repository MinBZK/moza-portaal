import type { Metadata } from "next";
import Link from "next/link";
import { Heading, Icon, Paragraph } from "@/components/rhc";
import Overzicht from "./_overzicht";
import Stappen from "../_stappen";

export const metadata: Metadata = {
  title: "Wat voor u geldt - Personeel en rollen",
};

/** Eindpagina voor routes zonder aanvraag: wat geldt, wat de werknemer doet en wat vanzelf gaat. */
const OverzichtPage = () => (
  <>
    <Heading level={1}>Wat voor u geldt</Heading>
    <Paragraph>
      <Link
        href="/personeel/iemand-aannemen/gegevens"
        className="utrecht-link utrecht-link--html-a"
      >
        <Icon icon="chevron-left" />
        Terug naar de ingevulde aanvraag
      </Link>
    </Paragraph>
    <div className="rhc-mox-card">
      <Stappen huidige={3} />
      <Overzicht />
    </div>
  </>
);

export default OverzichtPage;

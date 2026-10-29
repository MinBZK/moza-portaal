import type { Metadata } from "next";
import { Heading } from "@/components/rhc";
import Overzicht from "./_overzicht";

export const metadata: Metadata = {
  title: "Wat voor u geldt - Personeel en rollen",
};

/** Eindpagina voor routes zonder aanvraag: wat geldt, wat de werknemer doet en wat vanzelf gaat. */
const OverzichtPage = () => (
  <>
    <Heading level={1}>Wat voor u geldt</Heading>
    <Overzicht />
  </>
);

export default OverzichtPage;

import type { Metadata } from "next";
import { getDemoIemandAannemenSituaties } from "@/demo";
import Verstuurd from "./_verstuurd";

export const metadata: Metadata = {
  title: "Aanvraag verstuurd - Personeel en rollen",
};

/** Bevestiging na het versturen van de concept-aanvraag. */
const VerstuurdPage = async () => {
  const situaties = await getDemoIemandAannemenSituaties();
  return (
    <Verstuurd
      perSituatie={{ gemeente: situaties.gemeente, wajong: situaties.wajong }}
    />
  );
};

export default VerstuurdPage;

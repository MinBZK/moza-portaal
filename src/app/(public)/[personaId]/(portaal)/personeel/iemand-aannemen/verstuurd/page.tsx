import type { Metadata } from "next";
import { getDemoIemandAannemenSituaties } from "@/demo";
import Verstuurd from "./_verstuurd";

export const metadata: Metadata = {
  title:
    "Bevestiging - Regelingen bij het aannemen van iemand met afstand tot de arbeidsmarkt - Personeel en rollen",
};

/** Bevestiging na Aanvraag versturen of Afronden, met of zonder iets te versturen. */
const VerstuurdPage = async () => {
  const situaties = await getDemoIemandAannemenSituaties();
  return (
    <Verstuurd
      perSituatie={{
        gemeente: situaties.gemeente,
        wajong: situaties.wajong,
        wia: situaties.wia,
      }}
    />
  );
};

export default VerstuurdPage;

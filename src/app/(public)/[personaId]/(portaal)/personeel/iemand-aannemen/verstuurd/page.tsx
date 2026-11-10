import type { Metadata } from "next";
import { getDemoIemandAannemenSituaties } from "@/demo";
import Verstuurd from "./_verstuurd";

export const metadata: Metadata = {
  title:
    "Bevestiging - Regelingen bij het aannemen van personeel - Personeel en rollen",
};

/** Bevestiging na Dossier indienen of Afronden, met of zonder iets te versturen. */
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

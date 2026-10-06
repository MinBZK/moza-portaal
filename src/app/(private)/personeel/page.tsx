import { notFound } from "next/navigation";
import BinnenkortBeschikbaar from "@/components/binnenkortBeschikbaar";
import { getDemoBinnenkort } from "@/demo";

const MedewerkersPage = async () => {
  const onderdeel = await getDemoBinnenkort("medewerkers");
  if (!onderdeel) notFound();

  return (
    <BinnenkortBeschikbaar
      titel={onderdeel.titel}
      samenvatting={onderdeel.samenvatting}
      beschikbaarVanaf={onderdeel.beschikbaarVanaf}
      verwachtingen={onderdeel.verwachtingen}
      vragen={onderdeel.vragen}
    />
  );
};

export default MedewerkersPage;

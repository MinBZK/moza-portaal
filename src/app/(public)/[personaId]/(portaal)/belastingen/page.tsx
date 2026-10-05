import { notFound } from "next/navigation";
import BinnenkortBeschikbaar from "@/components/binnenkortBeschikbaar";
import { getDemoBinnenkort } from "@/demo";

const BelastingenPage = async () => {
  const onderdeel = await getDemoBinnenkort("belastingen");
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

export default BelastingenPage;

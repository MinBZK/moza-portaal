import { notFound } from "next/navigation";
import BinnenkortBeschikbaar from "@/components/binnenkortBeschikbaar";
import { getDemoBinnenkort } from "@/demo";

const VerzuimEnVerlofPage = async () => {
  const onderdeel = await getDemoBinnenkort("verzuim-en-verlof");
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

export default VerzuimEnVerlofPage;

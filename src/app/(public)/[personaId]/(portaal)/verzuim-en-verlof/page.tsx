import { notFound } from "next/navigation";
import ComingSoon from "@/components/ComingSoon";
import { getDemoBinnenkort } from "@/demo";

const VerzuimEnVerlofPage = async () => {
  const onderdeel = await getDemoBinnenkort("verzuim-en-verlof");
  if (!onderdeel) notFound();

  return (
    <ComingSoon
      title={onderdeel.titel}
      summary={onderdeel.samenvatting}
      availableFrom={onderdeel.beschikbaarVanaf}
      expectations={onderdeel.verwachtingen}
      questions={onderdeel.vragen.map(({ vraag, antwoord }) => ({
        question: vraag,
        answer: antwoord,
      }))}
    />
  );
};

export default VerzuimEnVerlofPage;

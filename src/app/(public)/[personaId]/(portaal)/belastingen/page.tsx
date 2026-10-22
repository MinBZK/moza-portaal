import { notFound } from "next/navigation";
import ComingSoon from "@/components/ComingSoon";
import { getDemoBinnenkort } from "@/demo";

const BelastingenPage = async () => {
  const onderdeel = await getDemoBinnenkort("belastingen");
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

export default BelastingenPage;

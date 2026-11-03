import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ComingSoon from "@/components/ComingSoon";
import { getDemoBinnenkort } from "@/demo";

export const metadata: Metadata = { title: "Ziekte en verlof" };

const VerzuimEnVerlofPage = async () => {
  const onderdeel = await getDemoBinnenkort("verzuim-en-verlof");
  if (!onderdeel) notFound();

  return (
    <ComingSoon
      title={onderdeel.titel}
      summary={onderdeel.samenvatting}
      expectations={onderdeel.verwachtingen}
      questions={onderdeel.vragen.map(({ vraag, antwoord }) => ({
        question: vraag,
        answer: antwoord,
      }))}
    />
  );
};

export default VerzuimEnVerlofPage;

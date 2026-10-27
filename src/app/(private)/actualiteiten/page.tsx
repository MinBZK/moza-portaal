import { redirect } from "next/navigation";
import { Heading } from "@/components/rhc";
import { getKvkFromCookie } from "@/utils/kvknummer";
import ActualiteitenContent from "./_actualiteitenContent";

const ActualiteitenPage = async () => {
  const kvk = await getKvkFromCookie();

  if (!kvk) {
    redirect("/");
  }

  return (
    <>
      <Heading level={1}>Actualiteiten</Heading>

      <ActualiteitenContent />
    </>
  );
};

export default ActualiteitenPage;

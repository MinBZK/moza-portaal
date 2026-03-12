import { redirect } from "next/navigation";
import { getKvkFromCookie } from "@/utils/kvknummer";
import ActualiteitenContent from "./_actualiteitenContent";

const ActualiteitenPage = async () => {
  const kvk = await getKvkFromCookie();

  if (!kvk) {
    redirect("/");
  }

  return (
    <>
      <h1 className="text-4xl">Actualiteiten</h1>

      <ActualiteitenContent kvkNummer={kvk} />
    </>
  );
};

export default ActualiteitenPage;

import { redirect } from "next/navigation";
import { Heading } from "@/components/rhc";
import { getKvkFromCookie } from "@/utils/kvknummer";
import ActualiteitenContent from "./_actualiteitenContent";
import PageSearch from "@/layouts/search";

const ActualiteitenPage = async () => {
  const kvk = await getKvkFromCookie();

  if (!kvk) {
    redirect("/");
  }

  return (
    <>
      <Heading level={1}>Actualiteiten</Heading>
      <PageSearch />

      <ActualiteitenContent />
    </>
  );
};

export default ActualiteitenPage;

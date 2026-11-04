import type { Metadata } from "next";
import { getActieveOrganisatie } from "@/app/(public)/_persona";
import { getDemoIemandAannemenSituaties } from "@/demo";
import { werkgeverVan } from "../../iemand-aannemen/_werkgever";
import { KandidaatPagina } from "../_kandidaten";

export const metadata: Metadata = {
  title: "Kandidaat - Personeel en rollen",
};

const KandidaatPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const [{ id }, situaties, organisatie] = await Promise.all([
    params,
    getDemoIemandAannemenSituaties(),
    getActieveOrganisatie(),
  ]);
  return (
    <KandidaatPagina
      id={id}
      situaties={situaties}
      onderneming={werkgeverVan(organisatie).onderneming}
    />
  );
};

export default KandidaatPage;

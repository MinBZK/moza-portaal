import type { Metadata } from "next";
import { getActieveOrganisatie } from "@/app/(public)/_persona";
import { getDemoIemandAannemenSituaties } from "@/demo";
import { werkgeverVan } from "../iemand-aannemen/_werkgever";
import { KandidatenLijst } from "./_kandidaten";

export const metadata: Metadata = {
  title: "Kandidaten - Personeel en rollen",
};

const KandidatenPage = async () => {
  const [situaties, organisatie] = await Promise.all([
    getDemoIemandAannemenSituaties(),
    getActieveOrganisatie(),
  ]);
  return (
    <KandidatenLijst
      situaties={situaties}
      onderneming={werkgeverVan(organisatie).onderneming}
    />
  );
};

export default KandidatenPage;

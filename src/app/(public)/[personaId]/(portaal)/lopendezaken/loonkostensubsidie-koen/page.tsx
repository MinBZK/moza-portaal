import { getDemoIemandAannemen } from "@/demo";
import { getActieveOrganisatie } from "@/app/(public)/_persona";
import ZaakKoen from "./_zaakKoen";
import { vul, werkgeverVan } from "../../personeel/iemand-aannemen/_werkgever";

/** De zaak van Koen: voortgang, alles wat is vastgelegd, komt hierna. */
const ZaakKoenPage = async () => {
  const [aannemen, organisatie] = await Promise.all([
    getDemoIemandAannemen(),
    getActieveOrganisatie(),
  ]);
  const w = werkgeverVan(organisatie);
  const gebeurtenissen = aannemen.gebeurtenissen.map((g) => ({
    ...g,
    tekst: vul(g.tekst, w),
  }));
  return (
    <ZaakKoen
      zaak={aannemen.zaak}
      kandidaat={aannemen.kandidaat}
      fasen={aannemen.fasen}
      gebeurtenissen={gebeurtenissen}
      komtHierna={aannemen.komtHierna}
    />
  );
};

export default ZaakKoenPage;

import { notFound } from "next/navigation";
import { getDemoIemandAannemen, getDemoIemandAannemenTraces } from "@/demo";
import { getActieveOrganisatie } from "@/app/(public)/_persona";
import Besluit from "./_besluit";
import {
  vul,
  werkgeverVan,
} from "../../../personeel/iemand-aannemen/_werkgever";

/** Het besluit van het college, met dezelfde berekening als vooraf en "Klopt dit niet?". */
const BesluitPage = async () => {
  const [aannemen, traces, organisatie] = await Promise.all([
    getDemoIemandAannemen(),
    getDemoIemandAannemenTraces(),
    getActieveOrganisatie(),
  ]);
  if (!aannemen.berekeningLks) notFound();
  const w = werkgeverVan(organisatie);
  const bronnen = aannemen.bronnen.map((bron) => ({
    ...bron,
    gegevens: bron.gegevens.map((g) => ({ ...g, waarde: vul(g.waarde, w) })),
  }));
  return (
    <Besluit
      zaak={aannemen.zaak}
      kandidaat={aannemen.kandidaat}
      berekening={aannemen.berekeningLks}
      bronnen={bronnen}
      trace={traces["participatiewet:heeft_recht_op_lks"]}
      labels={aannemen.labels}
    />
  );
};

export default BesluitPage;

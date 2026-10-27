import Zaak from "./_zaak";
import { situatieUitRoute } from "../_situatie";

/** De zaak van een situatie: voortgang, alles wat is vastgelegd, komt hierna. */
const ZaakPage = async ({
  params,
}: {
  params: Promise<{ situatie: string }>;
}) => {
  const { situatie, demo } = await situatieUitRoute(params);
  return <Zaak situatie={situatie} demo={demo} />;
};

export default ZaakPage;

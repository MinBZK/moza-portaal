import type { Metadata } from "next";
import Zaak from "./_zaak";
import { situatieUitRoute } from "../_situatie";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ situatie: string }>;
}): Promise<Metadata> => {
  const { demo } = await situatieUitRoute(params);
  return { title: `${demo.zaak.onderwerp} - Lopende zaken` };
};

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

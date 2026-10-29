import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Besluit from "./_besluit";
import { situatieUitRoute } from "../../_situatie";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ situatie: string }>;
}): Promise<Metadata> => {
  const { demo } = await situatieUitRoute(params);
  return { title: `Besluit ${demo.zaak.onderwerp} - Lopende zaken` };
};

/** Het besluit van de uitvoerder, met "Waarom deze uitkomst?" en "Klopt dit niet?". */
const BesluitPage = async ({
  params,
}: {
  params: Promise<{ situatie: string }>;
}) => {
  const { situatie, demo, kvk } = await situatieUitRoute(params);
  // De doelgroepverklaring (WIA) heeft geen besluit voor de werkgever.
  if (!demo.besluit || situatie === "wia") notFound();
  return <Besluit situatie={situatie} demo={demo} kvk={kvk} />;
};

export default BesluitPage;

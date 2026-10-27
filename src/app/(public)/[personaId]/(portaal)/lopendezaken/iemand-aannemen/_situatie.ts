import { notFound } from "next/navigation";
import {
  getDemoIemandAannemenSituaties,
  type DemoAannemen,
  type DemoAannemenSituatie,
} from "@/demo";
import { getActieveOrganisatie } from "@/app/(public)/_persona";
import { vul, werkgeverVan } from "../../personeel/iemand-aannemen/_werkgever";

const SITUATIES: DemoAannemenSituatie[] = ["gemeente", "wajong", "wia"];

/**
 * De situatie uit de route met het demo-bestand van die situatie. De gegevens
 * van de werkgever (onderneming, IBAN) zijn al ingevuld; de plaatshouders voor
 * bedragen en percentages vult de pagina met de uitkomsten van de engine.
 */
export const situatieUitRoute = async (
  params: Promise<{ situatie: string }>,
) => {
  const { situatie } = await params;
  if (!SITUATIES.includes(situatie as DemoAannemenSituatie)) notFound();
  const [situaties, organisatie] = await Promise.all([
    getDemoIemandAannemenSituaties(),
    getActieveOrganisatie(),
  ]);
  const werkgever = werkgeverVan(organisatie);
  const demo = situaties[situatie as DemoAannemenSituatie];
  const gevuld: DemoAannemen = {
    ...demo,
    gebeurtenissen: demo.gebeurtenissen.map((g) => ({
      ...g,
      titel: vul(g.titel, werkgever),
      tekst: vul(g.tekst, werkgever),
    })),
    komtHierna: demo.komtHierna.map((k) => ({
      ...k,
      titel: vul(k.titel, werkgever),
      tekst: vul(k.tekst, werkgever),
    })),
  };
  return {
    situatie: situatie as DemoAannemenSituatie,
    demo: gevuld,
    kvk: werkgever.kvkNummer,
  };
};

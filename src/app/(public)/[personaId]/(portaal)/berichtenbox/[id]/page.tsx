import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Alert, Paragraph } from "@/components/rhc";
import { getBerichtenboxVariant } from "@/app/actions";
import { getDemoBerichtById, getDemoBerichten } from "@/demo";
import { getActievePersona, getKetenAccount } from "@/app/(public)/_persona";
import { getKetenStatus } from "@/network/keten";
import { HuidigeKruimel } from "@/layouts/breadcrumb/huidigeKruimel";
import BerichtDetail from "../_berichtDetail";
import DemoBerichtInhoud from "../_demoBerichtInhoud";
import { stelselTekst } from "../_lijstPagina";
import NieuwBericht from "../_nieuwBericht";
import StelselBericht from "../_stelselBericht";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> => {
  const [{ id: ruw }, persona] = await Promise.all([
    params,
    getActievePersona(),
  ]);
  const id = leesId(ruw);
  const bericht = await getDemoBerichtById(id, persona?.id);
  return { title: `${bericht?.onderwerp ?? "Bericht"} - Berichtenbox` };
};

/**
 * De sleutel uit de URL. Een bericht uit het stelsel heeft er een dubbele punt
 * in (organisatie en nummer); decoderen is veilig, want een sleutel heeft geen %.
 */
const leesId = (ruw: string) => {
  try {
    return decodeURIComponent(ruw);
  } catch {
    return ruw;
  }
};

/** Ids van binnengedruppelde demo-berichten; die staan alleen in de browser. */
const NIEUW_BERICHT = /^live-/;

const BerichtPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const id = leesId((await params).id);
  const [persona, variant] = await Promise.all([
    getActievePersona(),
    getBerichtenboxVariant(),
  ]);
  const keten = await getKetenStatus(await getKetenAccount());
  if (keten.soort === "keten")
    return (
      <StelselBericht
        ontvanger={keten.ontvanger}
        berichtId={id}
        variant={variant}
      />
    );
  if (keten.soort !== "demo") {
    return (
      <Alert type="error">
        <Paragraph>{stelselTekst[keten.soort]}</Paragraph>
      </Alert>
    );
  }

  const [bericht, berichten] = await Promise.all([
    getDemoBerichtById(id, persona?.id),
    getDemoBerichten(persona?.id),
  ]);

  if (!bericht) {
    if (NIEUW_BERICHT.test(id))
      return (
        <NieuwBericht berichtId={id} berichten={berichten} variant={variant} />
      );
    notFound();
  }

  return (
    <>
      <HuidigeKruimel
        pad={`/berichtenbox/${encodeURIComponent(bericht.id)}`}
        label={bericht.onderwerp}
      />
      <BerichtDetail berichten={berichten} berichtId={bericht.id}>
        <DemoBerichtInhoud bericht={bericht} variant={variant} />
      </BerichtDetail>
    </>
  );
};

export default BerichtPage;

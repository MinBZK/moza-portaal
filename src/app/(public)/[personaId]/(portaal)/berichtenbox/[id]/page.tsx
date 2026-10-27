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

/** Ids van binnengedruppelde demo-berichten; die staan alleen in de browser. */
const NIEUW_BERICHT = /^live-/;

const BerichtPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
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
        pad={`/berichtenbox/${bericht.id}`}
        label={bericht.onderwerp}
      />
      <BerichtDetail berichten={berichten} berichtId={bericht.id}>
        <DemoBerichtInhoud bericht={bericht} variant={variant} />
      </BerichtDetail>
    </>
  );
};

export default BerichtPage;

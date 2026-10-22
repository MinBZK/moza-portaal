import { Alert, Heading, Paragraph } from "@/components/rhc";
import { getDemoBerichten } from "@/demo";
import { getActievePersona, getKetenAccount } from "@/app/(public)/_persona";
import { getKetenStatus } from "@/network/keten";
import BerichtenboxNav from "./_berichtenboxNav";
import BerichtenLijst from "./_berichtenLijst";
import StelselLijst from "./_stelselLijst";
import type { Weergave } from "./_useBerichtenboxState";

export type LijstPaginaProps = {
  searchParams: Promise<{ pagina?: string }>;
};

/** Geen storing maar een antwoord: hier valt niets op te halen. */
export const stelselTekst = {
  nietBekend:
    "Dit testaccount is niet bekend bij het Federatief Berichtenstelsel. Daarom zijn er geen berichten op te halen. Kies een ander testaccount om de Berichtenbox met voorbeeldberichten te bekijken.",
  onbereikbaar:
    "Dit testaccount haalt zijn berichten uit het Federatief Berichtenstelsel. Dat stelsel is nu niet bereikbaar. Ververs de pagina om het opnieuw te proberen, of kies een ander testaccount.",
};

/** Gedeelde opbouw van inbox, archief en prullenbak. */
const LijstPagina = async ({
  weergave,
  searchParams,
}: LijstPaginaProps & { weergave: Weergave }) => {
  const persona = await getActievePersona();
  const [keten, { pagina }] = await Promise.all([
    getKetenStatus(await getKetenAccount()),
    searchParams,
  ]);
  const paginaNummer = Number(pagina) || 1;

  if (keten.soort === "keten") {
    return (
      <>
        <Heading level={1}>Berichtenbox</Heading>
        <div className="mox-card">
          <StelselLijst
            ontvanger={keten.ontvanger}
            weergave={weergave}
            pagina={paginaNummer}
          />
        </div>
      </>
    );
  }

  if (keten.soort !== "demo") {
    return (
      <>
        <Heading level={1}>Berichtenbox</Heading>
        <Alert type="error">
          <Paragraph>{stelselTekst[keten.soort]}</Paragraph>
        </Alert>
      </>
    );
  }

  const berichten = await getDemoBerichten(persona?.id);
  return (
    <>
      <Heading level={1}>Berichtenbox</Heading>
      <div className="mox-card">
        <BerichtenboxNav berichten={berichten} actief={weergave} />
        <BerichtenLijst
          berichten={berichten}
          weergave={weergave}
          pagina={paginaNummer}
        />
      </div>
    </>
  );
};

export default LijstPagina;

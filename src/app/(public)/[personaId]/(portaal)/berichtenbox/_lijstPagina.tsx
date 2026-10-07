import { Heading } from "@rijkshuisstijl-community/components-react";
import { getDemoBerichten } from "@/demo";
import { getActievePersona } from "@/app/(public)/_persona";
import BerichtenboxNav from "./_berichtenboxNav";
import BerichtenLijst from "./_berichtenLijst";
import type { Weergave } from "./_useBerichtenboxState";

export type LijstPaginaProps = {
  searchParams: Promise<{ pagina?: string }>;
};

/** Gedeelde opbouw van inbox, archief en prullenbak. */
const LijstPagina = async ({
  weergave,
  searchParams,
}: LijstPaginaProps & { weergave: Weergave }) => {
  const persona = await getActievePersona();
  const berichten = await getDemoBerichten(persona?.id);
  const { pagina } = await searchParams;

  return (
    <>
      <Heading level={1}>Berichtenbox</Heading>
      <div className="mox-card space-y-4">
        <BerichtenboxNav berichten={berichten} actief={weergave} />
        <BerichtenLijst
          berichten={berichten}
          weergave={weergave}
          pagina={Number(pagina) || 1}
        />
      </div>
    </>
  );
};

export default LijstPagina;

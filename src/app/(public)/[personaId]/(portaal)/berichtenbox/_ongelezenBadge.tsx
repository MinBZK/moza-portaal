import { getDemoBerichten } from "@/demo";
import { getActievePersona } from "@/app/(public)/_persona";
import OngelezenTeller from "./_ongelezenTeller";

/** Aantal ongelezen berichten voor de zijnavigatie. */
const OngelezenBadge = async () => {
  const persona = await getActievePersona();
  const berichten = await getDemoBerichten(persona?.id);
  // Alleen wat de teller nodig heeft; deze badge staat op elke pagina.
  return (
    <OngelezenTeller
      berichten={berichten.map(({ id, isOngelezen }) => ({ id, isOngelezen }))}
    />
  );
};

export default OngelezenBadge;

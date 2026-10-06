import { getDemoBerichten } from "@/demo";
import OngelezenTeller from "./_ongelezenTeller";

/** Aantal ongelezen berichten voor de zijnavigatie. */
const OngelezenBadge = async () => {
  const berichten = await getDemoBerichten();
  // Alleen wat de teller nodig heeft; deze badge staat op elke pagina.
  return (
    <OngelezenTeller
      berichten={berichten.map(({ id, isOngelezen }) => ({ id, isOngelezen }))}
    />
  );
};

export default OngelezenBadge;

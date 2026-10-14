import { getDemoBerichten } from "@/demo";
import { getActievePersona, getKetenAccount } from "@/app/(public)/_persona";
import { getKetenStatus } from "@/network/keten";
import OngelezenTeller from "./_ongelezenTeller";
import StelselTeller from "./_stelselTeller";

/** Aantal ongelezen berichten voor de zijnavigatie. */
const OngelezenBadge = async () => {
  const persona = await getActievePersona();
  const keten = await getKetenStatus(await getKetenAccount());
  if (keten.soort === "keten")
    return <StelselTeller ontvanger={keten.ontvanger} />;
  if (keten.soort !== "demo") return null;

  const berichten = await getDemoBerichten(persona?.id);
  // Alleen wat de teller nodig heeft; deze badge staat op elke pagina.
  return (
    <OngelezenTeller
      berichten={berichten.map(({ id, isOngelezen }) => ({ id, isOngelezen }))}
    />
  );
};

export default OngelezenBadge;

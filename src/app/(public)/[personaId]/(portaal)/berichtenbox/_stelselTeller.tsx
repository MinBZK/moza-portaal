"use client";

import OngelezenTeller from "./_ongelezenTeller";
import { useKeten } from "./_useKeten";

/**
 * Ongelezen berichten uit het stelsel, voor het menu. Start geen ophaalronde:
 * dat doet de berichtenbox. Tot dan staat er geen teller.
 */
const StelselTeller = ({ ontvanger }: { ontvanger: string }) => {
  const { berichten } = useKeten(ontvanger, false);
  return <OngelezenTeller berichten={berichten} />;
};

export default StelselTeller;

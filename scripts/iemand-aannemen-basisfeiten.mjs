// Schrijft de neutrale basisfeiten voor de oriëntatie van "Iemand aannemen":
// elke parameter die een van de DOELEN (transitief) vraagt, met een waarde
// waarbij alle routes dicht staan. De feiten per vinkje komen daar bovenop
// (_uitkomsten.ts). Opnieuw draaien na een nieuwe bundel in public/regelrecht.
// Gebruik: node scripts/iemand-aannemen-basisfeiten.mjs
import { writeFileSync } from "node:fs";
import { DOELEN, gegevens } from "./regelrecht-node.mjs";

const PEILDATUM = "2026-07-01";
const UIT =
  "src/app/(public)/[personaId]/(portaal)/personeel/iemand-aannemen/_basisfeiten.json";

/** Een nul zou hier een route openen of een datum ontbreken; dit zijn de neutrale waarden. */
const NEUTRAAL = {
  bsn: "999990101",
  geboortedatum: "1984-03-15",
  datum_aanvang_dienstbetrekking: "2026-01-01",
  datum_aanvang_eerste_dienstbetrekking_2_6: "2026-01-01",
  verdiencapaciteit_percentage_maatmaninkomen: 100,
  verdiencapaciteit_wajong_percentage_maatmaninkomen: 100,
  is_verzekerde_wia: true,
  datum_einde_deelname_onderwijs_lid_2_a: null,
};

// 1900-01-01 staat voor "geen datum", zoals in de traces: elke termijn blijft dan dicht.
const standaard = {
  boolean: false,
  number: 0,
  amount: 0,
  date: "1900-01-01",
  string: "",
};

const parameters = new Map();
const gezien = new Set();
const verzamel = (wet, output) => {
  const sleutel = `${wet}#${output}`;
  if (gezien.has(sleutel)) return;
  gezien.add(sleutel);
  for (const g of gegevens(wet, output, PEILDATUM).gegevens) {
    if (g.soort === "parameter") parameters.set(g.naam, g.type);
    else if (g.respondent?.soort === "andere_regeling")
      verzamel(g.respondent.regeling, g.respondent.output);
  }
};
for (const { wet, output, uitleggen = [] } of DOELEN)
  for (const o of [output, ...uitleggen]) verzamel(wet, o);

const basis = Object.fromEntries(
  [...parameters]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([naam, type]) => [
      naam,
      naam in NEUTRAAL ? NEUTRAAL[naam] : (standaard[type] ?? null),
    ]),
);
writeFileSync(UIT, JSON.stringify(basis, null, 2) + "\n");
console.log(`${Object.keys(basis).length} parameters naar ${UIT}`);

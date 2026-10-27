// De regelrecht-kern (WASM uit public/regelrecht) in Node, voor tests en
// scripts. Zelfde bestanden en dezelfde functies als worker.js in de browser.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const MAP = fileURLToPath(new URL("../public/regelrecht/", import.meta.url));
const kern = await import(MAP + "pkg/regelrecht_uitleg_wasm.js");
kern.initSync({
  module: readFileSync(MAP + "pkg/regelrecht_uitleg_wasm_bg.wasm"),
});
const wetten = readFileSync(MAP + "wetten.json", "utf8");
const presentaties = readFileSync(MAP + "presentaties.json", "utf8");
const sjablonen = readFileSync(MAP + "sjablonen.json", "utf8");

/** Rekent één invoer ({ wet, output, peildatum, parameters, uitleggen }). */
export const bereken = (invoer) =>
  JSON.parse(
    kern.bereken(JSON.stringify(invoer), presentaties, sjablonen, wetten),
  );

/** De gegevens die een uitkomst vraagt, met hun soort en type. */
export const gegevens = (wet, output, peildatum) =>
  JSON.parse(kern.gegevens(wet, output, peildatum, wetten));

/** De uitkomsten die de oriëntatie rekent, met de extra outputs per doel. */
export const DOELEN = [
  {
    wet: "participatiewet",
    output: "heeft_recht_op_lks",
    uitleggen: ["hoogte_lks_eurocent_per_maand"],
  },
  { wet: "participatiewet", output: "mag_proefplaatsing_aangaan" },
  {
    wet: "participatiewet",
    output: "heeft_aanspraak_op_begeleiding_op_de_werkplek",
  },
  {
    wet: "wet_arbeidsongeschiktheidsvoorziening_jonggehandicapten",
    output: "heeft_recht_op_loondispensatie",
    uitleggen: ["aanspraak_beloning_per_uur_eurocent"],
  },
  {
    wet: "wet_tegemoetkomingen_loondomein",
    output: "heeft_recht_op_lkv",
    uitleggen: ["hoogte_lkv_per_jaar_eurocent", "categorie_lkv"],
  },
  {
    wet: "ziektewet",
    output: "heeft_recht_op_no_risk_polis",
    uitleggen: ["duur_no_risk_polis_jaren"],
  },
  { wet: "werkloosheidswet", output: "uwv_mag_toestemming_verlenen" },
  {
    wet: "wet_werk_en_inkomen_naar_arbeidsvermogen",
    output: "mag_jobcoaching_toekennen",
    uitleggen: ["mag_werkplekaanpassing_toekennen"],
  },
];

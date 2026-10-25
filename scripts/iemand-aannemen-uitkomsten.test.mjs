// Testtabel voor de oriëntatie van "Iemand aannemen": rekent elk geval met de
// echte regelrecht-kern (WASM) en vergelijkt met de Uitkomstenkaart.
// Gebruik: node --test scripts/iemand-aannemen-uitkomsten.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { bereken, DOELEN } from "./regelrecht-node.mjs";

const MAP = "src/app/(public)/[personaId]/(portaal)/personeel/iemand-aannemen/";
const basis = JSON.parse(readFileSync(MAP + "_basisfeiten.json", "utf8"));

test("basis: elk doel rekent en alle routes staan dicht", () => {
  for (const { wet, output, uitleggen } of DOELEN) {
    const { outputs } = bereken({
      wet,
      output,
      peildatum: "2026-07-01",
      parameters: basis,
      uitleggen,
    });
    for (const [naam, waarde] of Object.entries(outputs)) {
      if (/^(heeft_recht|mag_|uwv_mag)/.test(naam))
        assert.equal(waarde, false, `${wet}#${naam}`);
      if (/^hoogte_.*eurocent/.test(naam) && typeof waarde === "number")
        assert.equal(waarde, 0, `${wet}#${naam}`);
    }
  }
});

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

const U = await import("../" + MAP + "_uitkomsten.ts");

test("vraag 1: Wajong vinkt het register aan", () => {
  assert.deepEqual(U.kiesDoelgroep([], "wajong", true), ["register", "wajong"]);
});

test("vraag 1: beschut werk haalt register en Wajong weg", () => {
  assert.deepEqual(U.kiesDoelgroep(["register", "wajong"], "beschut", true), [
    "beschut",
  ]);
});

test("vraag 1: register haalt beschut werk weg", () => {
  assert.deepEqual(U.kiesDoelgroep(["beschut", "bijstand"], "register", true), [
    "register",
    "bijstand",
  ]);
});

test("vraag 1: geen van deze sluit de rest uit", () => {
  assert.deepEqual(U.kiesDoelgroep(["register", "wia"], "geen", true), [
    "geen",
  ]);
});

test("vraag 1: acht opties, WIA zonder WAO", () => {
  const ids = U.DOELGROEPEN.map(([id]) => id);
  assert.deepEqual(ids, [
    "register",
    "wajong",
    "wia",
    "bijstand",
    "wsw",
    "beschut",
    "geen",
    "weetniet",
  ]);
  assert.equal(
    U.DOELGROEPEN.find(([id]) => id === "wia")[1],
    "Iemand met een WIA-uitkering",
  );
});

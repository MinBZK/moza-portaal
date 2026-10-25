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

/** Rekent een geval zoals de browser: invoer per doel, engine, schermmodel. */
const reken = (doelgroepen, loonwaarde, uren = 32, uurloon = 1499) => {
  const a = { doelgroepen, uren, loonwaarde, uurloon };
  const uit = {};
  for (const invoer of U.invoerVoor(a, basis))
    uit[`${invoer.wet}:${invoer.output}`] = bereken(invoer).outputs;
  return U.uitkomstenUit(a, uit);
};
// De engine rekent per maand onafgerond: € 897,408 (kaart: 89740.8 eurocent).
const LKS_KOEN_JAAR = Math.round(89740.8 * 12);
const regel = (u, id) => u.regels.find((r) => r.id === id);
const overig = (u, id) => u.overige.find((o) => o.id === id);

test("Koen: bijstand, loonwaarde 60", () => {
  const u = reken(["bijstand"], 60);
  assert.equal(regel(u, "lks").bedragPerJaar, LKS_KOEN_JAAR);
  assert.equal(regel(u, "lks").aanname, "lks_lid4");
  assert.equal(regel(u, "lkv").bedragPerJaar, 168064);
  assert.equal(regel(u, "lkv").categorie, "banenafspraak");
  assert.equal(regel(u, "ld"), undefined);
  assert.equal(overig(u, "nrp").geldt, true);
  assert.equal(overig(u, "nrp").duurJaren, -1);
  assert.equal(overig(u, "pp_pwet").geldt, true);
  assert.equal(overig(u, "begeleiding").geldt, true);
});

test("register op 100 procent: loonkostenvoordeel blijft", () => {
  const u = reken(["register"], 100);
  assert.equal(regel(u, "lks"), undefined);
  assert.equal(regel(u, "lkv").bedragPerJaar, 168064);
  assert.equal(overig(u, "nrp").geldt, true);
});

test("register op 60 procent: geen loonkostensubsidie zonder gemeente", () => {
  const u = reken(["register"], 60);
  assert.equal(regel(u, "lks"), undefined);
  assert.equal(regel(u, "lkv").bedragPerJaar, 168064);
});

test("Sadee: Wajong, 70 procent", () => {
  const u = reken(["register", "wajong"], 70);
  const ld = regel(u, "ld");
  assert.equal(ld.aanspraakPerUur, 1049.3);
  assert.equal(
    ld.bedragPerJaar,
    Math.round((1499 - 1049.3) * 32 * 52 * 1.08 * 1.2),
  );
  assert.equal(regel(u, "lkv").bedragPerJaar, 168064);
  assert.equal(regel(u, "lks"), undefined);
  assert.equal(overig(u, "nrp").geldt, true);
  assert.equal(overig(u, "nrp").duurJaren, -1);
  assert.equal(overig(u, "vz_wajong").geldt, true);
  assert.equal(overig(u, "vz_wia").geldt, false);
});

test("Wajong 80 procent: geen loondispensatie", () => {
  const u = reken(["register", "wajong"], 80);
  assert.equal(regel(u, "ld"), undefined);
});

test("WIA: loonkostenvoordeel arbeidsgehandicapte, no-riskpolis vijf jaar", () => {
  const u = reken(["wia"], 100);
  assert.equal(regel(u, "lkv").bedragPerJaar, 507520);
  assert.equal(regel(u, "lkv").categorie, "arbeidsgehandicapte_werknemer");
  assert.equal(regel(u, "lkv").aanname, "wia_nieuw");
  assert.equal(overig(u, "nrp").geldt, true);
  assert.equal(overig(u, "nrp").duurJaren, 5);
  assert.equal(overig(u, "vz_wia").geldt, true);
  assert.equal(regel(u, "lks"), undefined);
});

test("Wsw: zuinig, niets", () => {
  const u = reken(["wsw"], 60);
  assert.equal(regel(u, "lks"), undefined);
  assert.equal(regel(u, "lkv"), undefined);
  assert.equal(overig(u, "nrp").geldt, false);
  assert.ok(u.aannames.includes("wsw_zuinig"));
});

test("beschut werk: geen loonkostenvoordeel, wel no-riskpolis", () => {
  const u = reken(["beschut"], 60);
  assert.equal(regel(u, "lks"), undefined);
  assert.equal(regel(u, "lkv"), undefined);
  assert.equal(overig(u, "nrp").geldt, true);
  assert.equal(overig(u, "nrp").duurJaren, -1);
  assert.ok(u.aannames.includes("beschut_lks"));
});

test("beschut werk + bijstand: loonkostensubsidie, geen loonkostenvoordeel", () => {
  const u = reken(["bijstand", "beschut"], 60);
  assert.equal(regel(u, "lks").bedragPerJaar, LKS_KOEN_JAAR);
  assert.equal(regel(u, "lkv"), undefined);
});

test("register + bijstand: als Koen", () => {
  const u = reken(["register", "bijstand"], 60);
  assert.equal(regel(u, "lks").bedragPerJaar, LKS_KOEN_JAAR);
  assert.equal(regel(u, "lkv").bedragPerJaar, 168064);
});

test("WIA + register: het hoogste loonkostenvoordeel", () => {
  const u = reken(["register", "wia"], 100);
  assert.equal(regel(u, "lkv").bedragPerJaar, 507520);
  assert.equal(regel(u, "lkv").categorie, "arbeidsgehandicapte_werknemer");
});

test("Wajong + bijstand: geen loonkostensubsidie", () => {
  const u = reken(["register", "wajong", "bijstand"], 60);
  assert.equal(regel(u, "lks"), undefined);
});

test("geen van deze: niets, wel de toelichting", () => {
  const u = reken(["geen"], 60);
  assert.deepEqual(u.regels, []);
  assert.ok(u.overige.every((o) => !o.geldt));
  assert.ok(u.aannames.includes("geen"));
});

test("weet ik nog niet: register via de blijfgrond", () => {
  const u = reken(["weetniet"], 60);
  assert.equal(regel(u, "lks"), undefined);
  assert.equal(regel(u, "lkv").bedragPerJaar, 168064);
  assert.equal(overig(u, "nrp").geldt, true);
  assert.ok(u.aannames.includes("weetniet"));
});

test("alleen aanroepen die iets kunnen opleveren, bedragen eerst", () => {
  const doelen = (d) =>
    U.invoerVoor(
      { doelgroepen: d, uren: 32, loonwaarde: 60, uurloon: 1499 },
      basis,
    ).map((i) => i.output);
  assert.deepEqual(doelen(["bijstand"]), [
    "heeft_recht_op_lks",
    "heeft_recht_op_lkv",
    "heeft_recht_op_no_risk_polis",
    "mag_proefplaatsing_aangaan",
    "heeft_aanspraak_op_begeleiding_op_de_werkplek",
  ]);
  assert.deepEqual(doelen(["register", "wajong"]), [
    "heeft_recht_op_loondispensatie",
    "heeft_recht_op_lkv",
    "heeft_recht_op_no_risk_polis",
  ]);
  assert.deepEqual(doelen(["wia"]), [
    "heeft_recht_op_lkv",
    "heeft_recht_op_no_risk_polis",
    "mag_jobcoaching_toekennen",
  ]);
  assert.deepEqual(doelen(["geen"]), []);
});

test("fix: tijdens het rekenen geldt een oude uitkomst niet als bekend", () => {
  const ids = ["participatiewet:heeft_recht_op_lks"];
  const oud = {
    "participatiewet:heeft_recht_op_lks": { heeft_recht_op_lks: true },
  };
  const r = U.samenvoegen(ids, {}, oud);
  assert.equal(r.bekend, false);
  assert.equal(r.bezig, true);
  assert.deepEqual(r.uit, oud);
  assert.equal(U.samenvoegen(ids, oud, {}).bekend, true);
});

test("fix: (i) bij de aanvraag zodra de keuze niet Koens situatie is", () => {
  assert.equal(U.aanvraagWijktAf(["bijstand"]), false);
  assert.equal(U.aanvraagWijktAf(["register", "bijstand"]), false);
  assert.equal(U.aanvraagWijktAf(["register"]), true);
  assert.equal(U.aanvraagWijktAf([]), true);
  assert.equal(U.aanvraagWijktAf(["wia", "bijstand"]), true);
});

test("fix: loondispensatie telt niet mee bij een uurloon boven het minimumloon", () => {
  const u = reken(["register", "wajong"], 70, 32, 2000);
  assert.equal(regel(u, "ld"), undefined);
  assert.ok(u.aannames.includes("ld_cao"));
  assert.equal(
    regel(reken(["register", "wajong"], 70), "ld").bedragPerJaar > 0,
    true,
  );
});

const R = await import("../" + MAP + "_route.ts");
const ids = (route) => route.panelen.map((p) => [p.organisatie, p.ids]);

test("route: situatie volgt de volgorde wajong, wia, bijstand, register, uitleg", () => {
  const s = R.situatieVan;
  assert.equal(s(["bijstand"]), "gemeente");
  assert.equal(s(["register", "wajong"]), "wajong");
  assert.equal(s(["register", "wajong", "wia"]), "wajong");
  assert.equal(s(["register", "wia"]), "wia");
  assert.equal(s(["register"]), "register");
  for (const d of ["beschut", "wsw", "geen"]) assert.equal(s([d]), "uitleg");
  assert.equal(s(["weetniet"]), "weetniet");
  assert.equal(s([]), "weetniet");
});

test("route: gemeente bij loonwaarde 60", () => {
  const r = R.routeVoor(["bijstand"], reken(["bijstand"], 60));
  assert.deepEqual(ids(r), [["gemeente", ["lks", "jc", "wpa", "pp"]]]);
  assert.deepEqual(r.taken, []);
  assert.deepEqual(r.vanzelf, ["lkv", "nrp"]);
  assert.equal(r.zaak, "gemeente");
  assert.equal(r.overzicht, false);
});

test("route: gemeente bij loonwaarde 100 heeft geen lks", () => {
  const r = R.routeVoor(["bijstand"], reken(["bijstand"], 100));
  assert.equal(r.panelen[0].ids.includes("lks"), false);
  assert.equal(r.panelen[0].ids.includes("wpa"), true);
  assert.equal(r.zaak, "gemeente");
});

test("route: wajong bij loonwaarde 70", () => {
  const d = ["register", "wajong"];
  const r = R.routeVoor(d, reken(d, 70));
  assert.deepEqual(ids(r), [["uwv", ["ld"]]]);
  assert.deepEqual(r.taken, ["vz_wajong"]);
  assert.deepEqual(r.vanzelf, ["lkv", "nrp"]);
  assert.equal(r.zaak, "wajong");
});

test("route: wajong bij loonwaarde 100 geeft alleen een overzicht", () => {
  const d = ["register", "wajong"];
  const r = R.routeVoor(d, reken(d, 100));
  assert.deepEqual(r.panelen, []);
  assert.deepEqual(r.taken, ["vz_wajong"]);
  assert.equal(r.overzicht, true);
  assert.equal(r.zaak, null);
});

test("route: wajong met uurloon 2000 geeft geen paneel", () => {
  const d = ["register", "wajong"];
  const r = R.routeVoor(d, reken(d, 70, 32, 2000));
  assert.deepEqual(r.panelen, []);
  assert.equal(r.overzicht, true);
});

test("route: wia bij loonwaarde 100", () => {
  const d = ["register", "wia"];
  const r = R.routeVoor(d, reken(d, 100));
  assert.deepEqual(r.panelen, []);
  assert.deepEqual(r.taken, ["doelgroepverklaring", "vz_wia"]);
  assert.deepEqual(r.vanzelf, ["lkv", "nrp"]);
  assert.equal(r.zaak, "wia");
  assert.equal(r.overzicht, false);
});

test("route: register heeft alleen vanzelf en een overzicht", () => {
  const r = R.routeVoor(["register"], reken(["register"], 100));
  assert.deepEqual(r.panelen, []);
  assert.deepEqual(r.taken, []);
  assert.deepEqual(r.vanzelf, ["lkv", "nrp"]);
  assert.equal(r.zaak, null);
  assert.equal(r.overzicht, true);
});

test("route: uitleg en weetniet geven een overzicht zonder zaak", () => {
  for (const d of [["beschut"], ["wsw"], ["geen"], ["weetniet"], []]) {
    const r = R.routeVoor(d, reken(d, 100));
    assert.equal(r.overzicht, true, d.join());
    assert.equal(r.zaak, null, d.join());
  }
});

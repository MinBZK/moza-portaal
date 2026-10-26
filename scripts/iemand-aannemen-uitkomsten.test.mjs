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

test("vraag 1: zeven opties, WIA zonder WAO, geen weet ik nog niet", () => {
  const ids = U.DOELGROEPEN.map(([id]) => id);
  assert.deepEqual(ids, [
    "register",
    "wajong",
    "wia",
    "bijstand",
    "wsw",
    "beschut",
    "geen",
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
const LKS_GEMEENTE_60_JAAR = Math.round(89740.8 * 12);
const regel = (u, id) => u.regels.find((r) => r.id === id);
const overig = (u, id) => u.overige.find((o) => o.id === id);

test("gemeente (bijstand, 60)", () => {
  const u = reken(["bijstand"], 60);
  assert.equal(regel(u, "lks").bedragPerJaar, LKS_GEMEENTE_60_JAAR);
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

test("Wajong 70 procent", () => {
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
  assert.equal(regel(u, "lks").bedragPerJaar, LKS_GEMEENTE_60_JAAR);
  assert.equal(regel(u, "lkv"), undefined);
});

test("register + bijstand: als gemeente (bijstand, 60)", () => {
  const u = reken(["register", "bijstand"], 60);
  assert.equal(regel(u, "lks").bedragPerJaar, LKS_GEMEENTE_60_JAAR);
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

test("niets aangevinkt: geen bedragen en geen no-riskpolis", () => {
  const u = reken([], 60);
  assert.deepEqual(u.regels, []);
  assert.equal(overig(u, "nrp").geldt, false);
  assert.deepEqual(u.aannames, []);
});

test("lkv-voorbehoud: zes maanden alleen bij arbeidsgehandicapte, samenloop altijd", () => {
  assert.deepEqual(U.lkvVoorbehoud("banenafspraak"), ["samenloop"]);
  assert.deepEqual(U.lkvVoorbehoud("arbeidsgehandicapte_werknemer"), [
    "zes_maanden",
    "samenloop",
  ]);
  assert.deepEqual(U.lkvVoorbehoud(undefined), []);
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
  assert.equal(s([]), "uitleg");
});

test("route: gemeente bij loonwaarde 60", () => {
  const r = R.routeVoor(["bijstand"], reken(["bijstand"], 60));
  assert.deepEqual(ids(r), [["gemeente", ["lks", "jc", "wpa", "pp"]]]);
  assert.deepEqual(r.taken, []);
  assert.deepEqual(r.vanzelf, ["lkv", "nrp"]);
  assert.equal(r.zaak, "gemeente");
  assert.equal(r.overzicht, false);
});

test("route: gemeente bij loonwaarde 100 heeft geen lks, wel proefplaatsing", () => {
  const r = R.routeVoor(["bijstand"], reken(["bijstand"], 100));
  // Zonder lks blijft de zaak alleen omdat de engine proefplaatsing geeft.
  assert.deepEqual(ids(r), [["gemeente", ["wpa", "pp"]]]);
  assert.equal(r.zaak, "gemeente");
  assert.equal(r.overzicht, false);
});

test("fix: gemeente met alleen werkplekaanpassing volgt het overzicht", () => {
  // Wat de engine bij bijstand 100 geeft, zonder proefplaatsing.
  const u = reken(["bijstand"], 100);
  const zonderPp = {
    ...u,
    overige: u.overige.map((o) =>
      o.id === "pp_pwet" ? { ...o, geldt: false } : o,
    ),
  };
  const r = R.routeVoor(["bijstand"], zonderPp);
  assert.deepEqual(r.panelen, []);
  assert.equal(r.zaak, null);
  assert.equal(r.overzicht, true);
});

test("fix: Wajong + WIA krijgt de taak doelgroepverklaring", () => {
  const d = ["register", "wajong", "wia"];
  const r = R.routeVoor(d, reken(d, 70));
  assert.ok(r.taken.includes("doelgroepverklaring"));
  assert.equal(r.zaak, "wajong");
  // Zonder loondispensatie is er geen zaak: de taak alleen maakt geen Wajong-zaak.
  const r100 = R.routeVoor(d, reken(d, 100));
  assert.ok(r100.taken.includes("doelgroepverklaring"));
  assert.equal(r100.zaak, null);
  assert.equal(r100.overzicht, true);
});

test("fix: onderwerp van de gemeente-zaak zonder loonkostensubsidie", () => {
  const o = (lw) =>
    R.onderwerpVoor(
      "gemeente",
      "Loonkostensubsidie voor Kim Jansen",
      "Kim Jansen",
      reken(["bijstand"], lw),
    );
  assert.equal(o(60), "Loonkostensubsidie voor Kim Jansen");
  assert.equal(o(100), "Aanvraag bij de gemeente voor Kim Jansen");
  assert.equal(
    R.onderwerpVoor(
      "wajong",
      "Loondispensatie voor Kim Jansen",
      "Kim Jansen",
      reken(["register", "wajong"], 70),
    ),
    "Loondispensatie voor Kim Jansen",
  );
});

test("fix: een oude zaak rekent met de antwoorden van het indienen", () => {
  const toen = {
    doelgroepen: ["bijstand"],
    uren: 32,
    loonwaarde: 60,
    uurloon: 1499,
  };
  const nu = { ...toen, doelgroepen: ["register", "wajong"], loonwaarde: 70 };
  const zaak = { ingediend: true, fase: "besluit", antwoorden: toen };
  assert.equal(R.antwoordenVoorZaak(zaak, nu), toen);
  // Oude opslag zonder kopie: de antwoorden van nu.
  assert.equal(
    R.antwoordenVoorZaak({ ingediend: true, fase: "besluit" }, nu),
    nu,
  );
  assert.equal(R.antwoordenVoorZaak(undefined, nu), nu);
  const k = R.antwoordenVoorZaak(zaak, nu);
  assert.equal(
    R.besluitGeldt("gemeente", reken(k.doelgroepen, k.loonwaarde)),
    true,
  );
  assert.equal(
    R.besluitGeldt("gemeente", reken(nu.doelgroepen, nu.loonwaarde)),
    false,
  );
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

test("fix: overzicht met een taak voor de werknemer zegt niet 'niets aan te vragen'", () => {
  const taak = R.routeVoor(
    ["register", "wajong", "wia"],
    reken(["register", "wajong", "wia"], 100),
  );
  assert.match(R.overzichtTekst(taak), /werknemer aanvraagt/);
  const niets = R.routeVoor(
    ["register", "bijstand"],
    reken(["register", "bijstand"], 100),
  );
  assert.deepEqual(niets.taken, []);
  assert.equal(
    R.overzichtTekst(niets),
    "Bij deze antwoorden is er niets aan te vragen.",
  );
  const register = R.routeVoor(["register"], reken(["register"], 100));
  assert.equal(
    R.overzichtTekst(register),
    "Voor deze situatie dient u niets in. Dit is wat er wel geldt.",
  );
});

test("route: uitleg en niets aangevinkt geven een overzicht zonder zaak", () => {
  for (const d of [["beschut"], ["wsw"], ["geen"], []]) {
    const r = R.routeVoor(d, reken(d, 100));
    assert.equal(r.overzicht, true, d.join());
    assert.equal(r.zaak, null, d.join());
  }
});

test("sjabloon: onbekende plaatshouder blijft staan, bekende wordt gevuld", () => {
  assert.equal(
    R.vulSjabloon("{uren} uur, {onderneming}, {x}", { uren: "32" }),
    "32 uur, {onderneming}, {x}",
  );
});

test("sjabloon: waarden uit de engine", () => {
  const w = (d, lw, uren = 32) =>
    R.waardenVoor(
      { doelgroepen: d, uren, loonwaarde: lw, uurloon: 1499 },
      reken(d, lw, uren),
    );
  const g = w(["register", "bijstand"], 60);
  assert.equal(g.lksPerMaand, "€ 897,41");
  assert.equal(g.lksTweeMaanden, "€ 1.794,82");
  assert.equal(g.uren, "32");
  assert.equal(g.loonwaarde, "60 procent");
  assert.equal(w(["register", "wajong"], 70).aanspraakPerUur, "€ 10,49");
  assert.equal(w(["register", "wia"], 100).lkvPerJaar, "€ 5.075,20");
  // Geen regel: leeg, geen oud bedrag.
  assert.equal(w(["register", "bijstand"], 100).lksPerMaand, "—");
});

test("besluit: geldt alleen als de engine de regel van de situatie geeft", () => {
  const g = (d, lw, s) => R.besluitGeldt(s, reken(d, lw));
  assert.equal(g(["register", "bijstand"], 60, "gemeente"), true);
  assert.equal(g(["register", "bijstand"], 100, "gemeente"), false);
  assert.equal(g(["register", "wajong"], 70, "wajong"), true);
  assert.equal(g(["register", "wajong"], 100, "wajong"), false);
});

// Demo-gegevens per situatie (src/demo/iemand-aannemen-*.json)
const SITUATIES = {
  gemeente: "iemand-aannemen-koen.json",
  wajong: "iemand-aannemen-wajong.json",
  wia: "iemand-aannemen-wia.json",
};
const PLAATSHOUDERS = new Set([
  "onderneming",
  "kvkNummer",
  "vestiging",
  "iban",
  "fulltime",
  "parttime",
  "uren",
  "loonwaarde",
  "lksPerMaand",
  "lksTweeMaanden",
  "aanspraakPerUur",
  "lkvPerJaar",
]);
const BRON_IDS = ["uwv", "gemeente", "kvk", "belastingdienst", "eigen"];

for (const [situatie, bestand] of Object.entries(SITUATIES)) {
  const demo = JSON.parse(readFileSync("src/demo/" + bestand, "utf8"));

  test(`demo ${situatie}: fasen en gebeurtenissen kloppen`, () => {
    const ids = demo.fasen.map((f) => f.id);
    assert.equal(new Set(ids).size, ids.length, "fase-ids uniek");
    for (const g of demo.gebeurtenissen)
      assert.ok(
        g.stap === "vooraf" || ids.includes(g.stap),
        `${g.id}: stap ${g.stap}`,
      );
    assert.ok(demo.zaak.url.endsWith("/" + situatie), demo.zaak.url);
  });

  test(`demo ${situatie}: plaatshouders en bronnen`, () => {
    const teksten = [
      demo.zaak.onderwerp,
      ...demo.fasen.map((f) => f.label),
      ...demo.gebeurtenissen.flatMap((g) => [g.titel, g.tekst]),
      ...demo.komtHierna.flatMap((k) => [k.titel, k.tekst]),
      ...demo.bronnen.flatMap((b) => b.gegevens.map((x) => x.waarde)),
    ];
    for (const t of teksten)
      for (const [, naam] of t.matchAll(/\{([^}]*)\}/g))
        assert.ok(PLAATSHOUDERS.has(naam), `{${naam}} in "${t}"`);
    const bronIds = demo.bronnen.map((b) => b.id);
    for (const id of bronIds) assert.ok(BRON_IDS.includes(id), id);
    if (situatie !== "gemeente") assert.ok(!bronIds.includes("gemeente"));
  });
}

test("demo: gemeente heeft geen vaste uitkomsten in gebeurtenissen", () => {
  const demo = JSON.parse(
    readFileSync("src/demo/" + SITUATIES.gemeente, "utf8"),
  );
  const tekst = JSON.stringify([demo.gebeurtenissen, demo.komtHierna]);
  assert.doesNotMatch(tekst, /897,41|1\.794,82|420,16|60 procent/);
});

test("demo: WIA heeft geen besluit voor de werkgever, de andere wel", () => {
  const lees = (s) =>
    JSON.parse(readFileSync("src/demo/" + SITUATIES[s], "utf8"));
  assert.equal(lees("wia").besluit, undefined);
  assert.equal(lees("wajong").besluit.organisatie, "UWV");
  assert.equal(lees("gemeente").besluit.datum, "2026-11-03");
});

// Parameters in de bronnen zijn feiten uit _basisfeiten.json, uitkomsten van
// de engine (labels) of weergavegegevens die de gemeente-situatie ook heeft.
const WEERGAVE_PARAMETERS = [
  "kvk_nummer",
  "aantal_werknemers_loonaangifte",
  "uurloon",
];
for (const situatie of ["wajong", "wia"]) {
  test(`demo ${situatie}: parameters in de bronnen bestaan in het corpus`, () => {
    const demo = JSON.parse(
      readFileSync("src/demo/" + SITUATIES[situatie], "utf8"),
    );
    for (const bron of demo.bronnen)
      for (const { parameter } of bron.gegevens)
        assert.ok(
          parameter in basis ||
            parameter in demo.labels ||
            WEERGAVE_PARAMETERS.includes(parameter),
          `${situatie}/${bron.id}: ${parameter}`,
        );
  });
}

test("opslag: oude losse velden gaan naar zaken.gemeente", () => {
  assert.deepEqual(
    R.migreerZaken({
      ingediend: true,
      fase: "besluit",
      verstuurdOp: "2026-10-05",
    }),
    {
      gemeente: {
        ingediend: true,
        fase: "besluit",
        verstuurdOp: "2026-10-05",
      },
    },
  );
  assert.deepEqual(
    R.migreerZaken({ ingediend: true, fase: "besluit", vraag: "Waarom?" })
      .gemeente.vraag,
    "Waarom?",
  );
  assert.deepEqual(R.migreerZaken({}), {});
});

test("opslag: nieuwe zaken blijven ongewijzigd", () => {
  const zaken = { wajong: { ingediend: true, fase: "meting" } };
  assert.equal(R.migreerZaken({ zaken, ingediend: true }), zaken);
});

test("opslag: faseIndex met onbekende fase is 0", () => {
  const fasen = [{ id: "a" }, { id: "b" }];
  assert.equal(R.faseIndex("b", fasen), 1);
  assert.equal(R.faseIndex("x", fasen), 0);
});

const Z =
  await import("../src/app/(public)/[personaId]/(portaal)/lopendezaken/_assistentZaken.ts");
const chatZaak = (velden) => ({ id: "x", aangemaaktOp: 1, ...velden });

test("fix: een chat-zaak zonder flow-veld linkt niet naar de demozaak", () => {
  assert.equal(Z.zaakRoute(chatZaak({ onderwerp: "Loondispensatie" })), "");
  assert.equal(
    Z.zaakRoute(chatZaak({ onderwerp: "Loonkostensubsidie aanvragen" })),
    "",
  );
  assert.equal(Z.zaakRoute(chatZaak({ regeling: "doelgroepverklaring" })), "");
  assert.equal(
    Z.zaakRoute(
      chatZaak({ onderwerp: "Rapportage informatieplicht energiebesparing" }),
    ),
    "/lopendezaken/informatieplicht-energiebesparing",
  );
});

test("fix: zaken van de flow linken naar hun situatie", () => {
  for (const s of ["gemeente", "wajong", "wia"])
    assert.equal(
      Z.zaakRoute(chatZaak({ flow: "iemand-aannemen", situatie: s })),
      `/lopendezaken/iemand-aannemen/${s}`,
    );
  // Zaken van vóór het flow-veld: herkend aan het nummer uit het demo-bestand.
  for (const [s, bestand] of Object.entries(SITUATIES)) {
    const demo = JSON.parse(readFileSync("src/demo/" + bestand, "utf8"));
    assert.equal(
      Z.zaakRoute(chatZaak({ referentienummer: demo.zaak.nummer })),
      `/lopendezaken/iemand-aannemen/${s}`,
    );
  }
});

test("balans: altijd loonkostensubsidie, loondispensatie en loonkostenvoordeel, in die volgorde", () => {
  const u = reken(["register", "bijstand"], 60);
  const rijen = U.balansRegels(u, 10_000_000);
  assert.deepEqual(
    rijen.map((r) => [r.id, r.status]),
    [
      ["lks", "bedrag"],
      ["ld", "geldt_niet"],
      ["lkv", "bedrag"],
    ],
  );
  assert.equal(rijen[0].bedrag, LKS_GEMEENTE_60_JAAR);
  assert.equal(rijen[1].bedrag, 0);
  assert.equal(rijen[2].bedrag, regel(u, "lkv").bedragPerJaar);
});

test("balans: nooit meer terug dan de loonkosten", () => {
  const u = reken(["register", "bijstand"], 60);
  const rijen = U.balansRegels(u, LKS_GEMEENTE_60_JAAR + 100);
  assert.equal(rijen[0].bedrag, LKS_GEMEENTE_60_JAAR);
  assert.equal(rijen[2].bedrag, 100);
  assert.equal(
    U.balansRegels(u, 0).reduce((s, r) => s + r.bedrag, 0),
    0,
  );
});

test("balans: loondispensatie boven het minimumloon is niet meegeteld", () => {
  const u = reken(["register", "wajong"], 70, 32, 2000);
  assert.equal(U.balansRegels(u, 10_000_000)[1].status, "niet_meegeteld");
  const wml = reken(["register", "wajong"], 70);
  assert.equal(U.balansRegels(wml, 10_000_000)[1].status, "bedrag");
});

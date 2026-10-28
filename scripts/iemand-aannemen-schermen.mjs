// Schermafdrukken en controles van "Iemand aannemen" in headless Chromium.
// Gebruik: node scripts/iemand-aannemen-schermen.mjs <basis-url> <uitvoermap> [personaId]
// Per pagina: 1280 en 390 breed, consolefouten, horizontale scroll, h1 aanwezig.
// Per situatie (gemeente, Wajong, WIA, register, uitleg) de stand via localStorage.
import { chromium } from "/home/claude/projects/regelrecht/node_modules/playwright/index.mjs";
import { mkdir } from "node:fs/promises";

const [basis, uit, personaId = "karin"] = process.argv.slice(2);
await mkdir(uit, { recursive: true });
const alle = {
  uwv: true,
  gemeente: true,
  kvk: true,
  belastingdienst: true,
  eigen: true,
};

// Antwoorden per situatie; zaak- en besluitpagina's krijgen een ingediende zaak
// met een kopie van de antwoorden, zoals Indienen die aanmaakt.
const ANTWOORDEN = {
  gemeente: {
    doelgroepen: ["register", "bijstand"],
    uren: 32,
    loonwaarde: 60,
    uurloon: 1499,
  },
  wajong: {
    doelgroepen: ["register", "wajong"],
    uren: 32,
    loonwaarde: 70,
    uurloon: 1499,
  },
  wia: {
    doelgroepen: ["register", "wia"],
    uren: 32,
    loonwaarde: 100,
    uurloon: 1499,
  },
  register: {
    doelgroepen: ["register"],
    uren: 32,
    loonwaarde: 100,
    uurloon: 1499,
  },
  uitleg: { doelgroepen: ["beschut"], uren: 32, loonwaarde: 60, uurloon: 1499 },
};
const zaak = (situatie, fase, extra = {}) => ({
  antwoorden: ANTWOORDEN[situatie],
  bronnen: alle,
  zaken: {
    [situatie]: {
      ingediend: true,
      verstuurdOp: "2026-10-05",
      fase,
      antwoorden: ANTWOORDEN[situatie],
      ...extra,
    },
  },
});

const PAGINAS = [
  ["01-personeel", "/personeel", null],
  ["02-vragen", "/personeel/iemand-aannemen", null],
  [
    "03-gegevens",
    "/personeel/iemand-aannemen/gegevens",
    { bronnen: { uwv: true, gemeente: true, kvk: true } },
  ],
  [
    "04-aanvraag",
    "/personeel/iemand-aannemen/concept-aanvraag",
    {
      antwoorden: ANTWOORDEN.gemeente,
      bronnen: alle,
      gecontroleerd: { lks: true, lkv: true },
      keuzes: { jc: "ja" },
    },
  ],
  [
    "05-versturen",
    "/personeel/iemand-aannemen/versturen",
    {
      antwoorden: ANTWOORDEN.gemeente,
      bronnen: alle,
      gecontroleerd: { lks: true, jc: true, wpa: true, pp: true },
      keuzes: { jc: "ja", wpa: "later", pp: "nee" },
    },
  ],
  [
    "06-verstuurd",
    "/personeel/iemand-aannemen/verstuurd",
    zaak("gemeente", "ontvangst"),
  ],
  ["07-zaken", "/lopendezaken", zaak("gemeente", "ontvangst")],
  [
    "08-zaak-ontvangst",
    "/lopendezaken/iemand-aannemen/gemeente",
    zaak("gemeente", "ontvangst"),
  ],
  [
    "09-zaak-antwoord",
    "/lopendezaken/iemand-aannemen/gemeente",
    zaak("gemeente", "antwoord", {
      vraag: "Telt de vergoeding voor werkgeverslasten niet mee in het bedrag?",
    }),
  ],
  [
    "10-besluit",
    "/lopendezaken/iemand-aannemen/gemeente/besluit",
    zaak("gemeente", "besluit"),
  ],
  ["11-personeel-met-zaak", "/personeel", zaak("gemeente", "besluit")],
  [
    "12-wajong-aanvraag",
    "/personeel/iemand-aannemen/concept-aanvraag",
    { antwoorden: ANTWOORDEN.wajong, bronnen: alle },
  ],
  [
    "13-wajong-zaak",
    "/lopendezaken/iemand-aannemen/wajong",
    zaak("wajong", "besluit"),
  ],
  [
    "14-wajong-besluit",
    "/lopendezaken/iemand-aannemen/wajong/besluit",
    zaak("wajong", "besluit"),
  ],
  [
    "15-wia-aanvraag",
    "/personeel/iemand-aannemen/concept-aanvraag",
    { antwoorden: ANTWOORDEN.wia, bronnen: alle },
  ],
  [
    "16-wia-zaak",
    "/lopendezaken/iemand-aannemen/wia",
    zaak("wia", "aangevraagd"),
  ],
  [
    "17-register-overzicht",
    "/personeel/iemand-aannemen/overzicht",
    { antwoorden: ANTWOORDEN.register },
  ],
  [
    "18-uitleg-overzicht",
    "/personeel/iemand-aannemen/overzicht",
    { antwoorden: ANTWOORDEN.uitleg },
  ],
];

const browser = await chromium.launch({
  executablePath: `${process.env.HOME}/.cache/ms-playwright/chromium_headless_shell-1234/chrome-linux/headless_shell`,
  args: ["--no-sandbox"],
});
let fouten = 0;
for (const breed of [1280, 390]) {
  const context = await browser.newContext({
    viewport: { width: breed, height: 900 },
  });
  await context.addCookies([
    { name: "personaId", value: personaId, url: basis },
  ]);
  for (const [naam, pad, staat] of PAGINAS) {
    const page = await context.newPage();
    const meldingen = [];
    page.on("console", (m) => {
      if (m.type() === "error") meldingen.push(m.text());
    });
    page.on("pageerror", (e) => meldingen.push("pageerror: " + e.message));
    await page.goto(basis + pad, { waitUntil: "load" });
    await page.evaluate((s) => {
      localStorage.removeItem("moza-iemand-aannemen");
      if (s) localStorage.setItem("moza-iemand-aannemen", JSON.stringify(s));
    }, staat);
    await page.reload({ waitUntil: "load" });
    await page.waitForTimeout(1200);
    // Geen schermafdruk van een pagina die nog rekent.
    await page
      .waitForFunction(
        () => !/berekend…|rekent…|rekent uit/.test(document.body.innerText),
        null,
        { timeout: 60000 },
      )
      .catch(() => {});
    if (naam === "02-vragen" || naam === "04-aanvraag") {
      // Vragen: de noot onder de balans; aanvraag: de zin met het aantal regelingen.
      const live = await page
        .waitForFunction(
          (vragen) => {
            const tekst = vragen
              ? [...document.querySelectorAll(".mox-hiring-note")]
                  .map((p) => p.textContent)
                  .join(" ")
              : (document.querySelector("main")?.textContent ?? "");
            return vragen
              ? /berekend in uw browser/i.test(tekst) &&
                  !tekst.includes("rekent…")
              : /gelden? voor deze situatie/.test(tekst);
          },
          naam === "02-vragen",
          { timeout: 40000 },
        )
        .then(() =>
          page.evaluate(() =>
            [
              ...document.querySelectorAll(
                ".mox-hiring-amount, dl.mox-hiring-balance dd:not(.mox-hiring-bar)",
              ),
            ]
              .map((e) => e.textContent.trim())
              .join(" | "),
          ),
        )
        .catch(() => "");
      console.log(`  engine: ${live || "!! geen live berekening"}`);
      if (!live) fouten++;
    }
    const info = await page.evaluate(() => ({
      h1: document.querySelector("h1")?.textContent.trim().slice(0, 70),
      scroll:
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
      naam:
        document.querySelector("header")?.textContent.includes("Karin") ?? null,
    }));
    await page.screenshot({
      path: `${uit}/${naam}-${breed}.png`,
      fullPage: true,
    });
    const problemen = [];
    if (!info.h1) problemen.push("geen h1");
    if (info.scroll) problemen.push("horizontale scroll");
    if (meldingen.length)
      problemen.push(
        "console: " + meldingen.slice(0, 2).join(" | ").slice(0, 200),
      );
    if (problemen.length) fouten++;
    console.log(
      `${naam} ${breed}: ${info.h1 ?? "-"}${problemen.length ? "  !! " + problemen.join("; ") : ""}`,
    );
    await page.close();
  }
  await context.close();
}
await browser.close();
console.log(
  fouten ? `${fouten} pagina's met problemen` : "alle pagina's in orde",
);
process.exit(fouten ? 1 : 0);

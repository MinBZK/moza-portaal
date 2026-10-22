// Schermafdrukken en controles van "Iemand aannemen" in headless Chromium.
// Gebruik: node scripts/iemand-aannemen-schermen.mjs <basis-url> <uitvoermap> [personaId]
// Per pagina: 1280 en 390 breed, consolefouten, horizontale scroll, h1 aanwezig.
// De zaak- en besluitpagina's krijgen de toestand "verstuurd, besluit genomen" via localStorage.
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
      bronnen: alle,
      gecontroleerd: { lks: true, lkv: true },
      keuzes: { jc: "ja" },
    },
  ],
  [
    "05-indienen",
    "/personeel/iemand-aannemen/indienen",
    {
      bronnen: alle,
      gecontroleerd: {
        lks: true,
        lkv: true,
        nrp: true,
        jc: true,
        wpa: true,
        pp: true,
      },
      keuzes: { jc: "ja", wpa: "later", pp: "nee" },
    },
  ],
  [
    "06-verstuurd",
    "/personeel/iemand-aannemen/verstuurd",
    { bronnen: alle, ingediend: true, fase: "ontvangst" },
  ],
  ["07-zaken", "/lopendezaken", { ingediend: true, fase: "ontvangst" }],
  [
    "08-zaak-ontvangst",
    "/lopendezaken/loonkostensubsidie-koen",
    { ingediend: true, fase: "ontvangst" },
  ],
  [
    "09-zaak-antwoord",
    "/lopendezaken/loonkostensubsidie-koen",
    {
      ingediend: true,
      fase: "antwoord",
      vraag: "Telt de vergoeding voor werkgeverslasten niet mee in het bedrag?",
    },
  ],
  [
    "10-besluit",
    "/lopendezaken/loonkostensubsidie-koen/besluit",
    { ingediend: true, fase: "besluit" },
  ],
  ["11-personeel-met-zaak", "/personeel", { ingediend: true, fase: "besluit" }],
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
    if (naam === "02-vragen" || naam === "04-aanvraag") {
      const live = await page
        .waitForFunction(
          () => {
            const noot = [...document.querySelectorAll(".mox-hiring-note")]
              .map((p) => p.textContent)
              .join(" ");
            return (
              noot.includes("berekend in uw browser") &&
              !noot.includes("rekent…")
            );
          },
          null,
          { timeout: 40000 },
        )
        .then(() =>
          page.evaluate(() =>
            [
              ...document.querySelectorAll(
                ".mox-hiring-amount, dl.mox-hiring-balance dd",
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

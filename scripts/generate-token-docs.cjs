const fs = require("fs");
const SRC =
  "node_modules/@rijkshuisstijl-community/design-tokens/dist/index.css";
const css = fs.readFileSync(SRC, "utf8");
const pkg = JSON.parse(
  fs.readFileSync(
    "node_modules/@rijkshuisstijl-community/design-tokens/package.json",
    "utf8",
  ),
);

const s = css.indexOf(".rhc-theme {"),
  e = css.indexOf("}", s);
const map = {};
const order = [];
for (const m of css.slice(s, e).matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)) {
  map[m[1]] = m[2].trim().replace(/\s+/g, " ");
  order.push(m[1]);
}
const rhc = order.filter((n) => n.startsWith("--rhc-"));

// dark-mode herdefinities
const dm = css.indexOf("@media (prefers-color-scheme: dark)");
const dmEnd = css.indexOf("}\n}", dm);
const darkSet = new Set(
  [...css.slice(dm, dmEnd).matchAll(/(--rhc-[a-z0-9-]+)\s*:/g)].map(
    (x) => x[1],
  ),
);

function resolve(name, depth = 0) {
  if (depth > 10) return "…";
  const v = map[name];
  if (v === undefined) return null;
  const only = v.match(/^var\((--[a-z0-9-]+)\)$/);
  if (only) return resolve(only[1], depth + 1) ?? only[1];
  return v;
}

const group = (n) => n.slice(6).split("-")[0];
const colorSub = (n) => n.slice(12).split("-")[0];

const SEMANTIC_COLOR = [
  "core",
  "primary",
  "foreground",
  "border",
  "positive",
  "negative",
  "info",
  "warning",
  "bg",
  "wit",
  "zwart",
  "transparent",
];
const SCALE = [
  "cool",
  "lintblauw",
  "hemelblauw",
  "lichtblauw",
  "donkerblauw",
  "groen",
  "donkergroen",
  "mintgroen",
  "mosgroen",
  "geel",
  "donkergeel",
  "oranje",
  "bruin",
  "donkerbruin",
  "rood",
  "robijnrood",
  "roze",
  "violet",
  "paars",
];

const esc = (v) => String(v).replace(/\|/g, "\\|");
const out = [];
const row = (n) => {
  const raw = map[n];
  const res = resolve(n);
  const same = res === raw;
  return `| \`${n}\` | \`${esc(raw)}\` | ${same ? "—" : "`" + esc(res) + "`"} |${darkSet.has(n) ? " 🌙 |" : "  |"}`;
};
const table = (names) => {
  out.push("| Token | Waarde | Resolveert naar | Dark |");
  out.push("| --- | --- | --- | --- |");
  names.forEach((n) => out.push(row(n)));
  out.push("");
};

out.push("# RHC design tokens");
out.push("");
out.push(
  `Alle \`--rhc-*\` tokens uit \`@rijkshuisstijl-community/design-tokens\` **${pkg.version}**.`,
);
out.push("");
out.push(
  `Gegenereerd uit \`${SRC}\`. Niet met de hand bijwerken: draai \`npm run docs:tokens\` na een pakket-update.`,
);
out.push("");
out.push("## Hoe je ze gebruikt");
out.push("");
out.push(
  "Alle tokens staan op de class `.rhc-theme`, niet op `:root`. Ze werken dus alleen binnen een element met die class — in dit project staat die op `<body>` in `src/app/layout.tsx`.",
);
out.push("");
out.push(
  "Er zijn drie lagen. Overschrijf altijd zo hoog mogelijk in de keten, dan volgt de rest vanzelf:",
);
out.push("");
out.push(
  "1. **Bronkleuren** — `--rhc-color-light-*` en `--rhc-color-dark-*`. De echte hex/oklch-waarden.",
);
out.push(
  "2. **Schalen en merk-aliassen** — `--rhc-color-lintblauw-500`, `--rhc-color-core-500`. Verwijzen naar laag 1 en wisselen mee met dark mode.",
);
out.push(
  "3. **Componenttokens** — `--rhc-card-*`, `--rhc-nav-*`, maar ook de niet-`rhc` tokens `--nl-*` en `--utrecht-*`. Verwijzen naar laag 2.",
);
out.push("");
out.push(
  `Van de ${order.length} tokens op \`.rhc-theme\` zijn er **${rhc.length}** \`--rhc-*\`. De overige ${order.length - rhc.length} zijn \`--nl-*\`, \`--utrecht-*\` en \`--todo-*\` componenttokens die hieruit gevoed worden.`,
);
out.push("");
out.push(
  "Een 🌙 betekent dat het token zelf een andere waarde krijgt in `@media (prefers-color-scheme: dark)` op `.rhc-theme--dark-mode`. Tokens zonder 🌙 die naar zo'n token verwijzen, wisselen gewoon mee. Zet je er een vaste hex overheen, dan stopt dat meelopen en breekt dark mode.",
);
out.push("");
out.push(
  '**Kolom "Resolveert naar"** toont de eindwaarde na het volgen van de `var()`-keten. Een `—` betekent dat de waarde al letterlijk is.',
);
out.push("");

// --- Kleur
const colors = rhc.filter((n) => n.startsWith("--rhc-color-"));
out.push("## Kleur");
out.push("");
out.push(`${colors.length} tokens.`);
out.push("");

out.push("### Semantisch");
out.push("");
out.push(
  "Dit is de laag die je bijna altijd wilt hebben. `--rhc-color-core-*` is de merk-hook: ongeveer 166 componenttokens verwijzen ernaar, dus één wijziging hier kleurt knoppen, links, focus en selected-states tegelijk.",
);
out.push("");
table(colors.filter((n) => SEMANTIC_COLOR.includes(colorSub(n))));

out.push("### Kleurschalen");
out.push("");
out.push("Aliassen die per modus naar de licht- of donkervariant wijzen.");
out.push("");
table(colors.filter((n) => SCALE.includes(colorSub(n))));

out.push("### Bronwaarden licht");
out.push("");
table(colors.filter((n) => colorSub(n) === "light"));

out.push("### Bronwaarden donker");
out.push("");
table(colors.filter((n) => colorSub(n) === "dark"));

// --- Foundations
const FOUND = [
  ["Typografie", ["text"]],
  ["Ruimte", ["space"]],
  ["Maten", ["size", "icon"]],
  ["Rand en vorm", ["border", "rounded"]],
  ["Focus", ["focus"]],
  ["Grid", ["grid"]],
];
out.push("## Fundamenten");
out.push("");
for (const [title, groups] of FOUND) {
  const names = rhc.filter((n) => groups.includes(group(n)));
  if (!names.length) continue;
  out.push(`### ${title}`);
  out.push("");
  table(names);
}

// --- Componenten
const used = new Set(["color", ...FOUND.flatMap(([, g]) => g)]);
const compGroups = [...new Set(rhc.map(group))]
  .filter((g) => !used.has(g))
  .sort();
out.push("## Componenten");
out.push("");
out.push(
  "Deze tokens horen bij één component. Raak ze alleen aan voor een echte uitzondering — een merkwijziging hoort in de semantische laag.",
);
out.push("");
for (const g of compGroups) {
  const names = rhc.filter((n) => group(n) === g);
  out.push(`### \`--rhc-${g}-*\` (${names.length})`);
  out.push("");
  table(names);
}

fs.mkdirSync("docs", { recursive: true });
fs.writeFileSync("docs/rhc-design-tokens.md", out.join("\n"));
console.log("geschreven: docs/rhc-design-tokens.md");
console.log("regels:", out.length, "| rhc-tokens:", rhc.length);
console.log("secties:", out.filter((l) => l.startsWith("#")).length);

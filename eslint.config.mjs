import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import pluginQuery from "@tanstack/eslint-plugin-query";
import moxRegels from "./eslint-rules/geen-tailwind.mjs";

const eslintConfig = [
  {
    ignores: ["src/network/generated/**", ".next/**"],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
  ...pluginQuery.configs["flat/recommended"],
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  {
    // Geen Tailwind: alleen RHC/NLDS-classes en eigen mox-classes.
    files: ["src/**/*.tsx"],
    plugins: { mox: moxRegels },
    rules: {
      "mox/geen-tailwind": "error",
    },
  },
  {
    // CommonJS-scripts (Node) gebruiken require() by design.
    files: ["**/*.cjs"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  {
    // Demo-data blijft afgezonderd: alleen pagina's mogen eruit importeren,
    // en alleen via de ingang @/demo. Zie src/demo/README.md.
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/app/**", "src/demo/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/demo", "@/demo/*", "**/demo/*"],
              message:
                "Demo-data hoort alleen in pagina's onder src/app/. Geef de data als prop mee.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/app/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/demo/*"],
              message: "Importeer uit @/demo, niet uit een los bestand.",
            },
          ],
        },
      ],
    },
  },
];

export default eslintConfig;

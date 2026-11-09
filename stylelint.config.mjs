/** @type {import("stylelint").Config} */
const config = {
  plugins: ["stylelint-use-logical", "stylelint-order"],
  rules: {
    // Logical properties (zoals margin-block-start i.p.v. margin-top) werken
    // ook bij andere schrijfrichtingen. `npm run lint:css:fix` corrigeert ze.
    "csstools/use-logical": "always",
    // Declaraties op alfabet. Custom properties (--*) blijven waar ze staan.
    "order/properties-alphabetical-order": true,
    // Onbekende waarden, zoals een classnaam die per ongeluk in een waarde staat.
    "declaration-property-value-no-unknown": true,
  },
};

export default config;

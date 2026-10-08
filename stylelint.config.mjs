/** @type {import("stylelint").Config} */
const config = {
  plugins: ["stylelint-use-logical", "stylelint-order"],
  rules: {
    // Logical properties (zoals margin-block-start i.p.v. margin-top) werken
    // ook bij andere schrijfrichtingen. `npm run lint:css:fix` corrigeert ze.
    "csstools/use-logical": "always",
    // Declaraties op alfabet. Custom properties (--*) blijven waar ze staan.
    "order/properties-alphabetical-order": true,
  },
};

export default config;

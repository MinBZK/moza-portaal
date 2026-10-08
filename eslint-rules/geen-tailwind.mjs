/**
 * Staat in className alleen classes toe van RHC/NL Design System en eigen
 * mox-classes. Tailwind (en andere losse utility-classes) gebruiken we niet
 * meer. Zie het kopje "Styling" in readme.md.
 */

const TOEGESTAAN = /^(mox|rhc|utrecht|nl|ams)-/;

/** Classes zonder voorvoegsel die al bestonden en wel mogen. */
const UITZONDERINGEN = new Set(["main-navigation", "header-landing"]);

const tokens = (tekst) => tekst.split(/\s+/).filter(Boolean);

/** Alle letterlijke tekst in een className-expressie, ook in ?: en `${}`. */
const teksten = (node, uit = []) => {
  if (!node) return uit;
  switch (node.type) {
    case "Literal":
      if (typeof node.value === "string") uit.push([node, node.value]);
      break;
    case "TemplateLiteral":
      node.quasis.forEach((q) => uit.push([q, q.value.cooked ?? ""]));
      node.expressions.forEach((e) => teksten(e, uit));
      break;
    case "JSXExpressionContainer":
      teksten(node.expression, uit);
      break;
    case "ConditionalExpression":
      teksten(node.consequent, uit);
      teksten(node.alternate, uit);
      break;
    case "LogicalExpression":
    case "BinaryExpression":
      teksten(node.left, uit);
      teksten(node.right, uit);
      break;
    case "ArrayExpression":
      node.elements.forEach((e) => teksten(e, uit));
      break;
    case "CallExpression":
      node.arguments.forEach((a) => teksten(a, uit));
      break;
    default:
      break;
  }
  return uit;
};

const geenTailwind = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Alleen RHC/NLDS-classes en eigen mox-classes in className, geen Tailwind",
    },
    messages: {
      verboden:
        'Class "{{naam}}" is niet toegestaan. Gebruik een RHC-component, of schrijf een mox-class in src/styles/mox.css.',
    },
    schema: [],
  },
  create(context) {
    return {
      JSXAttribute(attribuut) {
        const naam = attribuut.name?.name;
        if (naam !== "className" && !/ClassName$/.test(naam ?? "")) return;
        for (const [node, tekst] of teksten(attribuut.value)) {
          for (const token of tokens(tekst)) {
            if (TOEGESTAAN.test(token) || UITZONDERINGEN.has(token)) continue;
            context.report({
              node,
              messageId: "verboden",
              data: { naam: token },
            });
          }
        }
      },
    };
  },
};

const moxRegels = {
  rules: { "geen-tailwind": geenTailwind },
};

export default moxRegels;

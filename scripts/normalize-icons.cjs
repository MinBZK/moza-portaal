const fs = require("node:fs");
const path = require("node:path");
const { optimize } = require("svgo");

const iconsDirectory = path.resolve(__dirname, "../src/styles/icons");

function removeDimensions(attributes) {
  return attributes
    .replace(/\s+width="[^"]*"/g, "")
    .replace(/\s+height="[^"]*"/g, "");
}

function normalizeSvg(source, fileName) {
  if (fileName === "icon-plus.svg") {
      return source.replace(
        /<svg[^>]*>[\s\S]*<\/svg>/,
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M19.6 10H14V4.4c0-1.1-.9-1.4-2-1.4s-2-.3-2 1.4V10H4.4c-1.1 0-1.4.9-1.4 2s.3 2 1.4 2H10v5.6c0 1.1.9 1.4 2 1.4s2-.3 2-1.4V14h5.6c1.1 0 1.4.9 1.4 2s-.3 2-1.4 2z" /></svg>',
    );
  }

  const rootOpenEnd = source.indexOf(">") + 1;
  const rootOpen = source.slice(0, rootOpenEnd);
  const rootViewBox = rootOpen.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);

  if (!rootViewBox) {
    throw new Error(`${fileName}: root SVG has no numeric viewBox`);
  }

  const nestedStart = source.indexOf("<svg", rootOpenEnd);
  let normalized = source;

  if (nestedStart !== -1) {
    const nestedOpenEnd = source.indexOf(">", nestedStart) + 1;
    const nestedOpen = source.slice(nestedStart, nestedOpenEnd);
    const nestedViewBox = nestedOpen.match(
      /viewBox="0 0 ([\d.]+) ([\d.]+)"/,
    );

    if (!nestedViewBox) {
      throw new Error(`${fileName}: nested SVG has no numeric viewBox`);
    }

    const nestedClose = source.indexOf("</svg>", nestedOpenEnd);
    const scale = 24 / Number(nestedViewBox[1]);
    const replacement = `<g transform="scale(${scale})">`;

    normalized =
      source.slice(0, nestedStart) +
      replacement +
      source.slice(nestedOpenEnd, nestedClose) +
      "</g>" +
      source.slice(nestedClose + "</svg>".length);
  }

  const normalizedRootEnd = normalized.indexOf(">") + 1;
  const normalizedRoot = normalized.slice(0, normalizedRootEnd);
  const rootAttributes = removeDimensions(normalizedRoot).replace(
    /viewBox="[^"]*"/,
    'viewBox="0 0 24 24"',
  );

  normalized = rootAttributes + normalized.slice(normalizedRootEnd);

  if (["icon-document-pdf.svg", "icon-minus.svg", "icon-vink.svg"].includes(fileName)) {
    normalized = normalized.replace(
      /<path(?![^>]*\bfill=)([^>]*)\/>/g,
      '<path fill="currentColor"$1/>',
    );

    const paths = [...normalized.matchAll(/<path\b[^>]*\/\s*>/g)];
    const lastPathByData = new Map();
    paths.forEach((match, index) => {
      const data = match[0].match(/d="([^"]*)"/)?.[1];
      if (data) lastPathByData.set(data, index);
    });

    let pathIndex = 0;
    normalized = normalized.replace(/<path\b[^>]*\/\s*>/g, (pathElement) => {
      const data = pathElement.match(/d="([^"]*)"/)?.[1];
      const keep = !data || lastPathByData.get(data) === pathIndex;
      pathIndex += 1;
      return keep ? pathElement : "";
    });

    if (fileName === "icon-document-pdf.svg") {
      let pdfPathIndex = 0;
      normalized = normalized.replace(/<path\b[^>]*\/\s*>/g, (pathElement) => {
        pdfPathIndex += 1;
        return pdfPathIndex === 2 ? "" : pathElement;
      });
    }
  }

  return normalized;
}

for (const fileName of fs.readdirSync(iconsDirectory)) {
  if (!fileName.endsWith(".svg")) continue;

  const filePath = path.join(iconsDirectory, fileName);
  const source = fs.readFileSync(filePath, "utf8");
  const normalized = normalizeSvg(source, fileName);
  const result = optimize(normalized, {
    path: filePath,
    plugins: [
      {
        name: "preset-default",
      },
      "removeDimensions",
    ],
  });

  fs.writeFileSync(filePath, `${result.data}\n`);
}

console.log(`Normalized ${fs.readdirSync(iconsDirectory).filter((file) => file.endsWith(".svg")).length} SVG icons.`);
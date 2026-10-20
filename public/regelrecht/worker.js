// Web Worker met de kern van regelrecht-uitleg (WASM). Laadt één keer de
// gepinde wetversies, de presentatielaag en de sjablonen uit deze map, en
// rekent daarna op verzoek: { soort: "bereken", invoer } of
// { soort: "gegevens", wet, output, peildatum }. Antwoord: { id, ok, json } of
// { id, ok: false, fout }. Alle logica zit in de WASM; dit bestand geeft door.
import init, { bereken, gegevens } from "./pkg/regelrecht_uitleg_wasm.js";

const BASIS = new URL("./", import.meta.url);
const tekst = async (naam) => {
  const antwoord = await fetch(new URL(naam, BASIS));
  if (!antwoord.ok) throw new Error(`${naam}: HTTP ${antwoord.status}`);
  return antwoord.text();
};

const klaar = (async () => {
  const [, wetten, presentaties, sjablonen, manifest] = await Promise.all([
    init({ module_or_path: new URL("./pkg/regelrecht_uitleg_wasm_bg.wasm", BASIS) }),
    tekst("wetten.json"),
    tekst("presentaties.json"),
    tekst("sjablonen.json"),
    tekst("manifest.json"),
  ]);
  return { wetten, presentaties, sjablonen, manifest: JSON.parse(manifest) };
})();

self.onmessage = async (bericht) => {
  const { id, soort } = bericht.data;
  try {
    const bron = await klaar;
    if (soort === "manifest") {
      self.postMessage({ id, ok: true, json: JSON.stringify(bron.manifest) });
      return;
    }
    const begin = performance.now();
    const json =
      soort === "gegevens"
        ? gegevens(bericht.data.wet, bericht.data.output, bericht.data.peildatum, bron.wetten)
        : bereken(JSON.stringify(bericht.data.invoer), bron.presentaties, bron.sjablonen, bron.wetten);
    self.postMessage({ id, ok: true, json, ms: Math.round(performance.now() - begin) });
  } catch (fout) {
    self.postMessage({ id, ok: false, fout: String((fout && fout.message) || fout) });
  }
};

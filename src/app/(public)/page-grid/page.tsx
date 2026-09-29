import {
  Heading,
  Paragraph,
  Alert,
} from "@rijkshuisstijl-community/components-react";

/** Maakt een cel zichtbaar, alleen voor deze testpagina. */
const cellStyle = {
  backgroundColor: "var(--rhc-color-cool-grey-200)",
  padding: "var(--rhc-space-md)",
};

const PageGridPage = async () => {
  return (
    <>
      <Heading level={1}>Pagina-grid</Heading>

      <Alert type="info">
        <Paragraph>
          Testpagina om het Tailwind-raster te vergelijken met `.rhc-grid`. Maak
          uw venster smaller en breder. De breekpunten liggen op 768 en 1024
          pixels.
        </Paragraph>
      </Alert>

      <Heading level={2}>1. Nu: Tailwind</Heading>
      <Paragraph>
        Zoals het nu in de pagina&apos;s staat:{" "}
        <code>grid grid-cols-12 gap-4</code> met{" "}
        <code>col-span-12 lg:col-span-9</code>.
      </Paragraph>
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 w-full lg:col-span-9" style={cellStyle}>
          Hoofdkolom: vol tot 1024 px, daarna driekwart
        </div>
        <div className="col-span-12 w-full lg:col-span-3" style={cellStyle}>
          Zijkolom
        </div>
      </div>

      <Heading level={2}>2. Straks: RHC-grid</Heading>
      <Paragraph>
        Hetzelfde met <code>rhc-grid</code> en <code>rhc-grid__cell-d-9</code>.
        Gedrag is gelijk, de kolomafstand komt uit de design tokens.
      </Paragraph>
      <div className="rhc-grid">
        <div className="rhc-grid__cell rhc-grid__cell-d-9" style={cellStyle}>
          Hoofdkolom: vol tot 1024 px, daarna driekwart
        </div>
        <div className="rhc-grid__cell rhc-grid__cell-d-3" style={cellStyle}>
          Zijkolom
        </div>
      </div>

      <Heading level={2}>3. Drie breekpunten</Heading>
      <Paragraph>
        Elke cel is vol op smal, de helft vanaf 768 px en een derde vanaf 1024
        px.
      </Paragraph>
      <div className="rhc-grid">
        {["Kaart 1", "Kaart 2", "Kaart 3"].map((label) => (
          <div
            key={label}
            className="rhc-grid__cell rhc-grid__cell-t-6 rhc-grid__cell-d-4"
            style={cellStyle}
          >
            {label}
          </div>
        ))}
      </div>

      <Heading level={2}>4. Alle twaalf kolommen</Heading>
      <Paragraph>
        Twaalf cellen van één kolom breed. Zo ziet u waar de kolommen liggen en
        hoe breed de tussenruimte is.
      </Paragraph>
      <div className="rhc-grid">
        {Array.from({ length: 12 }, (_, index) => index + 1).map((kolom) => (
          <div
            key={kolom}
            className="rhc-grid__cell rhc-grid__cell-1"
            style={cellStyle}
          >
            {kolom}
          </div>
        ))}
      </div>

      <Heading level={2}>5. Genest raster</Heading>
      <Paragraph>
        Een <code>rhc-grid</code> binnen een cel begint weer met twaalf eigen
        kolommen.
      </Paragraph>
      <div className="rhc-grid">
        <div className="rhc-grid__cell rhc-grid__cell-d-8" style={cellStyle}>
          <Paragraph>Buitenste cel: acht van de twaalf kolommen</Paragraph>
          <div className="rhc-grid">
            <div className="rhc-grid__cell rhc-grid__cell-6" style={cellStyle}>
              Binnenste cel: helft
            </div>
            <div className="rhc-grid__cell rhc-grid__cell-6" style={cellStyle}>
              Binnenste cel: helft
            </div>
          </div>
        </div>
        <div className="rhc-grid__cell rhc-grid__cell-d-4" style={cellStyle}>
          Zijkolom
        </div>
      </div>
    </>
  );
};

export default PageGridPage;

import {
  Alert,
  DataSummary,
  DataSummaryItem,
  Heading,
  Paragraph,
} from "@/components/rhc";
import OnderdeelPagina, {
  type OnderdeelPaginaProps,
} from "../_onderdeelPagina";

const UboRegisterPage = (props: OnderdeelPaginaProps) => (
  <OnderdeelPagina
    {...props}
    id="ubo-register"
    inhoud={({ ubo, uboPlichtig }) =>
      ubo.length === 0 ? (
        <Alert type="info">
          <Paragraph>
            {uboPlichtig
              ? "Er staan geen uiteindelijk belanghebbenden (UBO's) van uw organisatie in het UBO-register. Klopt dat niet? Geef het door aan de KVK."
              : "Voor uw rechtsvorm is geen UBO-registratie verplicht. De UBO-registratie geldt voor besloten vennootschappen, naamloze vennootschappen, stichtingen, verenigingen en personenvennootschappen, niet voor eenmanszaken."}
          </Paragraph>
        </Alert>
      ) : (
        ubo.map(({ naam, aardVanBelang, grootteVanBelang }) => (
          <div key={naam}>
            <Heading level={3}>{naam}</Heading>
            <DataSummary appearance="column">
              <DataSummaryItem
                itemKey="Aard van belang"
                itemValue={aardVanBelang}
              />
              <DataSummaryItem
                itemKey="Grootte van belang"
                itemValue={grootteVanBelang}
              />
            </DataSummary>
          </div>
        ))
      )
    }
  />
);

export default UboRegisterPage;

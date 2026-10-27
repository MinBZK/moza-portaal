import {
  Alert,
  DataSummary,
  Link,
  Paragraph,
  VisuallyHidden,
} from "@/components/rhc";
import OnderdeelPagina, {
  type OnderdeelPaginaProps,
} from "../_onderdeelPagina";

const JaarrekeningenPage = (props: OnderdeelPaginaProps) => (
  <OnderdeelPagina
    {...props}
    id="jaarrekeningen"
    inhoud={({
      jaarrekeningen,
      deponeerPlichtig,
      kvkNummer,
      gegevensCompleet,
    }) =>
      jaarrekeningen.length === 0 ? (
        <Alert type="info">
          <Paragraph>
            {!gegevensCompleet
              ? "We hebben nog geen gegevens over jaarrekeningen van deze organisatie."
              : deponeerPlichtig
                ? "Er zijn nog geen jaarrekeningen van uw onderneming gedeponeerd bij de KVK."
                : "Voor uw rechtsvorm hoeft geen jaarrekening te worden gedeponeerd bij de Kamer van Koophandel. De deponeerplicht geldt voor besloten vennootschappen, naamloze vennootschappen en bepaalde stichtingen en verenigingen."}
          </Paragraph>
        </Alert>
      ) : (
        <DataSummary appearance="column">
          {jaarrekeningen.map(({ jaar, gedeponeerd }) => (
            // Eigen opbouw: DataSummaryItem kan geen datum én link tonen.
            <div key={jaar} className="rhc-data-summary__item">
              <dt className="rhc-data-summary__item-key">
                Jaarrekening {jaar}
              </dt>
              <dd className="rhc-data-summary__item-value">
                <Paragraph>Gedeponeerd op {gedeponeerd}</Paragraph>
                <Link
                  href={`https://www.kvk.nl/orderstraat/product-kiezen/?kvknummer=${encodeURIComponent(kvkNummer)}`}
                  rel="external noopener"
                  target="_blank"
                >
                  <VisuallyHidden>Jaarrekening {jaar}: </VisuallyHidden>
                  Bij KVK inzien
                  <VisuallyHidden> (opent in een nieuw tabblad)</VisuallyHidden>
                </Link>
              </dd>
            </div>
          ))}
        </DataSummary>
      )
    }
  />
);

export default JaarrekeningenPage;

import Link from "next/link";
import { Alert, Paragraph } from "@/components/rhc";
import type { DemoConceptAanvraag } from "@/demo";

/**
 * Melding voor aanvragen waarvan de antwoorden elders zijn ingevuld, zoals op
 * Ondernemersplein, en hier bewaard. Boven Lopende zaken en de homepage.
 */
const BewaardeAanvragen = ({
  aanvragen,
}: {
  aanvragen: DemoConceptAanvraag[];
}) =>
  aanvragen
    .filter((aanvraag) => aanvraag.bewaardVan)
    .map((aanvraag) => (
      <Alert key={aanvraag.id} type="info">
        <Paragraph>
          Uw antwoorden van {aanvraag.bewaardVan} voor de aanvraag{" "}
          <strong>{aanvraag.titel}</strong> zijn opgeslagen.{" "}
          <Link
            href={`/lopendezaken/aanvragen/${aanvraag.id}`}
            className="utrecht-link utrecht-link--html-a"
          >
            Ga verder met uw aanvraag
          </Link>
          .
        </Paragraph>
      </Alert>
    ));

export default BewaardeAanvragen;

"use client";

import Link from "next/link";
import { Alert, Paragraph } from "@/components/rhc";
import type { DemoConceptAanvraag } from "@/demo";
import { useAfgerondeAanvragen } from "./_afgerondeAanvragen";

/** Waar een afgeronde aanvraag laat zien wat voor de gebruiker geldt. */
const OVERZICHT: Record<string, string> = {
  "iemand-aannemen-met-afstand-tot-de-arbeidsmarkt":
    "/personeel/iemand-aannemen/overzicht",
};

/**
 * Melding voor aanvragen waarvan de antwoorden elders zijn ingevuld, zoals op
 * Ondernemersplein, en hier bewaard. Boven Lopende zaken en de homepage. Na
 * afronden een melding dat de aanvraag klaar is.
 */
const BewaardeAanvragen = ({
  aanvragen,
}: {
  aanvragen: DemoConceptAanvraag[];
}) => {
  const afgerond = useAfgerondeAanvragen();
  return aanvragen
    .filter((aanvraag) => aanvraag.bewaardVan)
    .map((aanvraag) =>
      afgerond.includes(aanvraag.id) ? (
        <Alert key={aanvraag.id} type="ok" closable>
          <Paragraph>
            U hebt de aanvraag <strong>{aanvraag.titel}</strong> afgerond. U
            hoeft niets te versturen. De zaak staat bij Lopende zaken.
            {OVERZICHT[aanvraag.id] && (
              <>
                {" "}
                <Link
                  href={OVERZICHT[aanvraag.id]}
                  className="utrecht-link utrecht-link--html-a"
                >
                  Bekijk wat voor u geldt
                </Link>
                .
              </>
            )}
          </Paragraph>
        </Alert>
      ) : (
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
      ),
    );
};

export default BewaardeAanvragen;

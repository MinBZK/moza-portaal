"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Alert,
  DataSummary,
  DataSummaryItem,
  Heading,
  Paragraph,
  UnorderedList,
  UnorderedListItem,
} from "@rijkshuisstijl-community/components-react";
import {
  bijlageAdres,
  haalInhoud,
  KetenFout,
  type KetenInhoud,
} from "@/network/keten/client";
import type { BerichtenboxVariant } from "@/app/(private)/instellingen/_featureFlags";
import { HuidigeKruimel } from "@/layouts/breadcrumb/huidigeKruimel";
import BerichtDetail from "./_berichtDetail";
import { formatDatum } from "./_formatDatum";
import PdfVoorbeeld from "./_pdfVoorbeeld";
import {
  ketenFoutTekst,
  useKeten,
  verplaatsKetenBericht,
  verwijderKetenBerichtVoorgoed,
  zetKetenMap,
} from "./_useKeten";

/**
 * Eén bericht uit het stelsel. De lijst geeft afzender, onderwerp en datum;
 * de inhoud en bijlagen komen pas bij openen, bij de organisatie zelf.
 */
const StelselBericht = ({
  ontvanger,
  berichtId,
  variant = "a",
}: {
  ontvanger: string;
  berichtId: string;
  /** Berichtenbox A/B/C-test; B toont de eerste pdf-bijlage in de pagina. */
  variant?: BerichtenboxVariant;
}) => {
  const { fase, berichten, fout } = useKeten(ontvanger);
  const bericht = berichten.find((b) => b.id === berichtId);
  const [inhoud, setInhoud] = useState<KetenInhoud | null>(null);
  const [inhoudFout, setInhoudFout] = useState<string | null>(null);

  const klaar = fase === "klaar";
  const magazijnId = bericht?.magazijnId;
  useEffect(() => {
    if (!klaar || !magazijnId) return;
    let actueel = true;
    haalInhoud(berichtId, magazijnId)
      .then((resultaat) => actueel && setInhoud(resultaat))
      .catch((fout: unknown) => {
        if (!actueel) return;
        setInhoudFout(
          fout instanceof KetenFout && fout.reden === "weg"
            ? "Wij konden dit bericht niet ophalen bij de organisatie die het stuurde. Ververs de pagina om het opnieuw te proberen, of ga terug naar uw Berichtenbox."
            : "Het ophalen van dit bericht is niet gelukt. Ververs de pagina om het opnieuw te proberen.",
        );
      });
    return () => {
      actueel = false;
    };
  }, [klaar, berichtId, magazijnId]);

  if (fout) return <Alert type="error">{ketenFoutTekst[fout]}</Alert>;
  if (!klaar)
    return <Paragraph role="status">Uw bericht wordt geladen.</Paragraph>;
  if (!bericht) {
    return (
      <>
        <Heading level={1}>Bericht niet gevonden</Heading>
        <Paragraph>Dit bericht staat niet (meer) in uw Berichtenbox.</Paragraph>
        <Paragraph>
          <Link
            href="/berichtenbox"
            className="utrecht-link utrecht-link--html-a"
          >
            Ga naar uw inbox
          </Link>
        </Paragraph>
      </>
    );
  }

  // Variant B: de eerste pdf-bijlage in de pagina, zoals bij demo-berichten.
  const pdfBijlage =
    variant === "b"
      ? inhoud?.bijlagen.find((bijlage) =>
          bijlage.naam.toLowerCase().endsWith(".pdf"),
        )
      : undefined;

  return (
    <>
      <HuidigeKruimel
        pad={`/berichtenbox/${bericht.id}`}
        label={bericht.onderwerp}
      />
      <BerichtDetail
        berichten={berichten}
        berichtId={bericht.id}
        stelsel={{
          plek: bericht.plek,
          verplaats: (plek) => verplaatsKetenBericht(bericht.id, plek),
          verwijderVoorgoed: () => verwijderKetenBerichtVoorgoed(bericht.id),
          zetMap: (map) => zetKetenMap(bericht.id, map),
        }}
      >
        <Heading level={1}>{bericht.onderwerp}</Heading>

        <DataSummary appearance="column">
          <DataSummaryItem itemKey="Afzender" itemValue={bericht.afzender} />
          <DataSummaryItem
            itemKey="Ontvangen"
            itemValue={formatDatum(bericht.datum)}
          />
        </DataSummary>

        {inhoudFout ? (
          <Alert type="error">{inhoudFout}</Alert>
        ) : !inhoud ? (
          <Paragraph role="status">De inhoud wordt opgehaald.</Paragraph>
        ) : (
          <>
            {inhoud.inhoud
              .split(/\n\s*\n/)
              .filter((alinea) => alinea.trim())
              .map((alinea, index) => (
                <Paragraph key={index}>{alinea.trim()}</Paragraph>
              ))}

            {pdfBijlage && bericht && (
              <PdfVoorbeeld
                pdf={bijlageAdres(
                  bericht.id,
                  pdfBijlage.bijlageId,
                  bericht.magazijnId,
                )}
              />
            )}

            {inhoud.bijlagen.length > 0 && (
              <section aria-labelledby="bijlagen">
                <Heading level={2} id="bijlagen">
                  {inhoud.bijlagen.length === 1 ? "Bijlage" : "Bijlagen"}
                </Heading>
                <UnorderedList>
                  {inhoud.bijlagen.map((bijlage) => (
                    <UnorderedListItem key={bijlage.bijlageId}>
                      <a
                        href={bijlageAdres(
                          bericht.id,
                          bijlage.bijlageId,
                          bericht.magazijnId,
                        )}
                        target="_blank"
                        rel="noopener"
                        className="utrecht-link utrecht-link--html-a"
                      >
                        {bijlage.naam}
                        <span className="rhc-visually-hidden">
                          {" "}
                          (opent in een nieuw tabblad)
                        </span>
                      </a>
                    </UnorderedListItem>
                  ))}
                </UnorderedList>
              </section>
            )}
          </>
        )}
      </BerichtDetail>
    </>
  );
};

export default StelselBericht;

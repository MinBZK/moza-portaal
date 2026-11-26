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
} from "@/components/rhc";
import { KetenFout, type KetenInhoud } from "@/network/keten/client";
import type { BerichtenboxVariant } from "@/app/(private)/instellingen/_featureFlags";
import { HuidigeKruimel } from "@/layouts/breadcrumb/huidigeKruimel";
import BerichtDetail from "./_berichtDetail";
import { formatDatum } from "./_formatDatum";
import { SessieVerlopen } from "./_ketenMeldingen";
import PdfVoorbeeld from "./_pdfVoorbeeld";
import {
  haalKetenInhoud,
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
  /** De sleutel uit de URL: organisatie en nummer samen. */
  berichtId: string;
  /** Berichtenbox A/B/C-test; B toont de eerste pdf-bijlage in de pagina. */
  variant?: BerichtenboxVariant;
}) => {
  const { fase, berichten, fout, verlopen } = useKeten(ontvanger);
  const bericht = berichten.find((b) => b.id === berichtId);
  const [inhoud, setInhoud] = useState<KetenInhoud | null>(null);
  const [inhoudFout, setInhoudFout] = useState<string | null>(null);

  const klaar = fase === "klaar";
  const gevonden = klaar && !!bericht;
  useEffect(() => {
    if (!gevonden) return;
    const huidig = berichten.find((b) => b.id === berichtId);
    if (!huidig) return;
    let actueel = true;
    haalKetenInhoud(huidig)
      .then((resultaat) => actueel && setInhoud(resultaat))
      .catch((fout: unknown) => {
        if (!actueel) return;
        const reden = fout instanceof KetenFout ? fout.reden : null;
        setInhoudFout(
          reden === "weg"
            ? "Wij konden dit bericht niet ophalen bij de organisatie die het stuurde. Ververs de pagina om het opnieuw te proberen, of ga terug naar uw berichtenbox."
            : reden === "tijdelijk"
              ? "Wij kunnen dit bericht nu even niet ophalen. Ververs de pagina over een minuut om het opnieuw te proberen."
              : "Het ophalen van dit bericht is niet gelukt. Ververs de pagina om het opnieuw te proberen.",
        );
      });
    return () => {
      actueel = false;
    };
    // Alleen opnieuw bij een ander bericht, niet bij elke wijziging in de lijst.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gevonden, berichtId]);

  if (fout) return <Alert type="error">{ketenFoutTekst[fout]}</Alert>;
  if (!klaar)
    return <Paragraph role="status">Wij halen uw bericht op.</Paragraph>;
  if (!bericht) {
    return (
      <>
        <Heading level={1}>Bericht niet gevonden</Heading>
        <Paragraph>Dit bericht staat niet (meer) in uw berichtenbox.</Paragraph>
        <Paragraph>
          <Link
            href="/berichtenbox"
            className="utrecht-link utrecht-link--html-a"
          >
            Naar uw berichtenbox
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
        pad={`/berichtenbox/${encodeURIComponent(bericht.id)}`}
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
        {verlopen && <SessieVerlopen />}

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
          <Paragraph role="status">Wij halen de inhoud op.</Paragraph>
        ) : (
          <>
            {inhoud.inhoud
              .split(/\n\s*\n/)
              .filter((alinea) => alinea.trim())
              .map((alinea, index) => (
                <Paragraph key={index}>{alinea.trim()}</Paragraph>
              ))}

            {pdfBijlage?.adres && <PdfVoorbeeld pdf={pdfBijlage.adres} />}

            {inhoud.bijlagen.length > 0 && (
              <section className="rhc-mox-stack" aria-labelledby="bijlagen">
                <Heading level={2} id="bijlagen">
                  {inhoud.bijlagen.length === 1 ? "Bijlage" : "Bijlagen"}
                </Heading>
                <UnorderedList>
                  {inhoud.bijlagen.map((bijlage) => (
                    <UnorderedListItem key={bijlage.bijlageId}>
                      {bijlage.adres ? (
                        <a
                          href={bijlage.adres}
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
                      ) : (
                        // Het stelsel gaf geen adres dat wij kunnen volgen.
                        <>{bijlage.naam} (nu niet te openen)</>
                      )}
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

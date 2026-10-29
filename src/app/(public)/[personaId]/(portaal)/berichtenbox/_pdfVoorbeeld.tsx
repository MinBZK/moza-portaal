"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Paragraph,
  LinkList,
  LinkListLink,
  VisuallyHidden,
} from "@/components/rhc";
import { PdfIcon } from "@/components/icons/pdfIcon";
import { TextDocumentIcon } from "@/components/icons/textDocumentIcon";
import ProgressBar from "@/components/ProgressBar";

/** Hoe lang het laden duurt; anders flitst de melding alleen even. */
const LAADTIJD = 1500;

/**
 * Berichtenbox A/B/C-test, variant B: het bericht als pdf in de pagina, met
 * links om het te downloaden of als tekst te lezen. Uit moza-poc.
 */
const PdfVoorbeeld = ({
  pdf,
  tekst,
}: {
  pdf: string;
  /** Tekstversie; een bijlage uit het stelsel heeft die niet. */
  tekst?: string;
}) => {
  const [geladen, setGeladen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setGeladen(true), LAADTIJD);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="rhc-mox-pdf-preview">
      <div role="status">
        {!geladen && (
          <Alert type="info">
            <Paragraph>Wij halen de pdf op.</Paragraph>
            {/* Hoe lang het duurt is niet bekend: zonder value. */}
            <ProgressBar label="De pdf laden" />
          </Alert>
        )}
      </div>
      {geladen && (
        <object
          data={`${pdf}#navpanes=0&view=FitH`}
          type="application/pdf"
          aria-label="Voorbeeld van de pdf"
          className="rhc-mox-pdf-preview__viewer"
        >
          <Paragraph>
            Uw browser kan de pdf niet tonen. Download de pdf hieronder.
          </Paragraph>
        </object>
      )}
      <LinkList>
        <LinkListLink href={pdf} download icon={<PdfIcon />}>
          Pdf downloaden
        </LinkListLink>
        {tekst && (
          <LinkListLink
            href={tekst}
            target="_blank"
            rel="external noopener noreferrer"
            icon={<TextDocumentIcon />}
          >
            Tekstversie lezen
            <VisuallyHidden> (opent in een nieuw tabblad)</VisuallyHidden>
          </LinkListLink>
        )}
      </LinkList>
    </div>
  );
};

export default PdfVoorbeeld;

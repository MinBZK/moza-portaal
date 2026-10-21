"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Paragraph,
  UnorderedList,
  UnorderedListItem,
  VisuallyHidden,
} from "@/components/rhc";

/** Hoe lang het laden duurt; anders flitst de melding alleen even. */
const LAADTIJD = 1500;

/**
 * Berichtenbox A/B/C-test, variant B: het bericht als pdf in de pagina, met
 * links om het te downloaden of als tekst te lezen. Uit moza-poc.
 */
const PdfVoorbeeld = ({ pdf, tekst }: { pdf: string; tekst: string }) => {
  const [geladen, setGeladen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setGeladen(true), LAADTIJD);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="rhc-pdf-preview">
      <div role="status">
        {!geladen && (
          <Alert type="info">
            <Paragraph>De pdf wordt geladen.</Paragraph>
          </Alert>
        )}
      </div>
      {geladen && (
        <object
          data={`${pdf}#navpanes=0&view=FitH`}
          type="application/pdf"
          aria-label="Voorbeeld van de pdf"
          className="rhc-pdf-preview__viewer"
        >
          <Paragraph>
            Uw browser kan de pdf niet tonen. Download de pdf hieronder.
          </Paragraph>
        </object>
      )}
      <UnorderedList>
        <UnorderedListItem>
          <a href={pdf} download className="utrecht-link utrecht-link--html-a">
            Download pdf
          </a>
        </UnorderedListItem>
        <UnorderedListItem>
          <a
            href={tekst}
            target="_blank"
            rel="noopener noreferrer"
            className="utrecht-link utrecht-link--html-a"
          >
            Lees tekst-versie
            <VisuallyHidden> (opent in een nieuw tabblad)</VisuallyHidden>
          </a>
        </UnorderedListItem>
      </UnorderedList>
    </div>
  );
};

export default PdfVoorbeeld;

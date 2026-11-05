"use client";

import DOMPurify from "dompurify";
import { useState } from "react";
import { Icon, Paragraph } from "@/components/rhc";
import SidePanel from "@/components/SidePanel";

/** Een artikel van Ondernemersplein, klaar om in het zijpaneel te tonen. */
export type PaneelArtikel = {
  titel: string;
  html: string;
  url: string;
  bijgewerkt?: string;
};

export type Regeling = {
  naam: string;
  uitvoerder: string;
  tekst: string;
  icoon: string;
  artikel: PaneelArtikel | null;
};

const Tekst = ({ r }: { r: Regeling }) => (
  <span className="rhc-mox-icon-list__text">
    <span className="rhc-mox-small-text">{r.uitvoerder}</span>
    <span className="rhc-mox-icon-list__title">{r.naam}</span>
    <span className="rhc-mox-small-text">{r.tekst}</span>
  </span>
);

/**
 * De regelingen die kunnen gelden. Met een artikel van Ondernemersplein opent
 * een regeling een zijpaneel met de uitleg; zonder artikel is het gewone tekst.
 */
const Regelingen = ({ regelingen }: { regelingen: Regeling[] }) => {
  const [open, setOpen] = useState<Regeling | null>(null);
  // Blijft staan tijdens het uitschuiven, zodat het paneel niet leeg wordt.
  const [getoond, setGetoond] = useState<Regeling | null>(null);
  if (open && open !== getoond) setGetoond(open);
  const artikel = getoond?.artikel;
  // Alleen in de browser: het paneel rendert pas na een klik.
  const html = artikel
    ? DOMPurify.sanitize(artikel.html, {
        ALLOWED_TAGS: ["p", "a", "ul", "ol", "li", "h3", "h4", "strong", "em"],
        ALLOWED_ATTR: ["href"],
      })
    : "";

  return (
    <>
      <ul className="rhc-mox-icon-list">
        {regelingen.map((r) => (
          <li key={r.naam}>
            {r.artikel ? (
              <button
                type="button"
                className="rhc-mox-icon-list__item"
                aria-haspopup="dialog"
                onClick={() => setOpen(r)}
              >
                <Icon icon={r.icoon} />
                <Tekst r={r} />
                <Icon icon="chevron-right" />
              </button>
            ) : (
              <span className="rhc-mox-icon-list__item">
                <Icon icon={r.icoon} />
                <Tekst r={r} />
              </span>
            )}
          </li>
        ))}
      </ul>
      <SidePanel
        open={open !== null}
        onClose={() => setOpen(null)}
        title={getoond?.naam ?? ""}
      >
        {artikel && (
          <>
            <div
              className="mox-rich-text"
              // Tekst van Ondernemersplein, gefilterd met DOMPurify.
              dangerouslySetInnerHTML={{ __html: html }}
            />
            <Paragraph className="rhc-mox-small-text">
              Bron: Ondernemersplein
              {artikel.bijgewerkt && `, bijgewerkt op ${artikel.bijgewerkt}`}
            </Paragraph>
            <Paragraph>
              <a
                href={artikel.url}
                className="utrecht-link utrecht-link--html-a"
                target="_blank"
                rel="external noopener noreferrer"
              >
                {artikel.titel} op Ondernemersplein (opent in een nieuw tabblad)
              </a>
            </Paragraph>
          </>
        )}
      </SidePanel>
    </>
  );
};

export default Regelingen;

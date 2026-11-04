"use client";

import { Heading } from "@/components/rhc";
import type { PaneelId, TaakId, VanzelfId } from "./_route";
import { euro } from "./_werkgever";

/** Eén regeling als tegel in het overzicht. */
export type Tegel = {
  id: string;
  naam: string;
  wie: string;
  wet: string;
  wat: string;
  bedrag?: number;
  status?: string;
  /** Het anker van het onderdeel op de pagina. */
  doel: string;
  paneel?: PaneelId;
};

const TAAK_TEGEL: Record<
  TaakId,
  { wie: (gemeente: string) => string; wet: string }
> = {
  doelgroepverklaring: {
    wie: () => "UWV",
    wet: "Wet tegemoetkomingen loondomein, artikel 2.7",
  },
  vz_wajong: { wie: () => "UWV", wet: "Wajong, artikel 2:22" },
  vz_wia: { wie: () => "UWV", wet: "Wet WIA, artikel 35" },
  pp: { wie: (gemeente) => gemeente, wet: "Participatiewet, artikel 8a" },
};

/** Een taak voor de werknemer als tegel. */
export const taakTegel = (
  id: TaakId,
  naam: string,
  gemeente: string,
): Tegel => ({
  id,
  naam,
  wie: TAAK_TEGEL[id].wie(gemeente),
  wet: TAAK_TEGEL[id].wet,
  wat: "Taak voor de werknemer",
  doel: `taak-${id}`,
});

/** Wat vanzelf of via de loonaangifte gaat, als tegel. */
export const vanzelfTegel = (
  id: VanzelfId,
  lkv: { categorie?: string; bedrag?: number },
): Tegel =>
  id === "lkv"
    ? {
        id,
        naam: "Loonkostenvoordeel",
        wie: "Belastingdienst",
        wet:
          lkv.categorie === "arbeidsgehandicapte_werknemer"
            ? "Wet tegemoetkomingen loondomein, artikel 2.9"
            : "Wet tegemoetkomingen loondomein, artikel 2.13",
        wat: "Via de loonaangifte",
        bedrag: lkv.bedrag,
        doel: "vanzelf-lkv",
      }
    : {
        id,
        naam: "No-riskpolis",
        wie: "UWV",
        wet: "Ziektewet, artikel 29b",
        wat: "Gaat vanzelf",
        doel: "vanzelf-nrp",
      };

/**
 * Alle regelingen als raster van tegels: naam, organisatie, wetsartikel, het
 * bedrag per jaar als dat er is, en wat de ondernemer ermee doet. Een tegel
 * is een link naar het onderdeel op de pagina.
 */
export const Tegels = ({
  tegels,
  onKlik,
  voorbeeld = false,
}: {
  tegels: Tegel[];
  onKlik?: (tegel: Tegel) => void;
  /** Bedragen zijn een voorbeeldberekening. */
  voorbeeld?: boolean;
}) => (
  <section className="rhc-mox-row-gap" aria-labelledby="overzicht-tegels">
    <Heading level={2} id="overzicht-tegels">
      Alle regelingen in één overzicht
    </Heading>
    <ul className="rhc-mox-tile-grid">
      {tegels.map((t) => (
        <li key={t.id}>
          <a
            href={`#${t.doel}`}
            className="rhc-mox-tile"
            onClick={() => onKlik?.(t)}
          >
            <span className="rhc-mox-tile__title">{t.naam}</span>
            <span className="rhc-mox-small-text">
              {t.wie}, {t.wet}
            </span>
            {t.bedrag !== undefined && (
              <span className="rhc-mox-tile__amount">
                {euro(t.bedrag)} per jaar{voorbeeld && ", voorbeeld"}
              </span>
            )}
            <span className="rhc-mox-tile__status rhc-mox-small-text">
              {t.wat}
              {t.status && `, ${t.status}`}
            </span>
          </a>
        </li>
      ))}
    </ul>
  </section>
);

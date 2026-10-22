"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  TableCell,
  TableRow,
  VisuallyHidden,
} from "@rijkshuisstijl-community/components-react";
import { Icon } from "@rijkshuisstijl-community/icon-react";
import { FlagIcon } from "@/components/icons/flagIcon";
import type { DemoBericht } from "@/demo";
import { formatDatum } from "./_formatDatum";

/** Een bericht als tabelrij: markeren, afzender, onderwerp, datum en bijlage. */
const BerichtRij = ({
  bericht,
  ongelezen,
  gemarkeerd,
  nieuw = false,
  onMarkeer,
  children,
}: {
  bericht: DemoBericht;
  ongelezen: boolean;
  gemarkeerd: boolean;
  /** Net binnengekomen: licht kort op. */
  nieuw?: boolean;
  onMarkeer: () => void;
  /** Extra cellen achteraan, zoals acties. */
  children?: ReactNode;
}) => (
  // De link van het onderwerp beslaat de hele rij (rhc-row-linked): klikken op
  // afzender of datum opent ook het bericht, met maar één link per bericht.
  <TableRow className={`rhc-row-linked${nieuw ? " rhc-row-new" : ""}`}>
    <TableCell>
      <button
        type="button"
        aria-pressed={gemarkeerd}
        onClick={onMarkeer}
        className={`rhc-button-mark`}
      >
        <FlagIcon filled={gemarkeerd} />
        <VisuallyHidden>Markeren</VisuallyHidden>
      </button>
    </TableCell>
    <TableCell>
      <span className={ongelezen ? "rhc-sender rhc-unread" : "rhc-sender"}>
        {ongelezen && (
          <>
            <span aria-hidden="true" className="rhc-status-unread" />
            <VisuallyHidden>Ongelezen.</VisuallyHidden>
          </>
        )}
        {bericht.afzender}
      </span>
    </TableCell>
    <TableCell>
      <Link
        href={`/berichtenbox/${bericht.id}`}
        className={`utrecht-link utrecht-link--html-a rhc-row-linked__link ${ongelezen ? "rhc-unread" : ""}`}
      >
        {bericht.onderwerp}
      </Link>
    </TableCell>
    <TableCell>{formatDatum(bericht.datum)}</TableCell>
    <TableCell>
      {bericht.heeftBijlage && (
        <>
          <Icon icon="paperclip" className="rhc-attachment-icon" />
          <VisuallyHidden>Heeft bijlage</VisuallyHidden>
        </>
      )}
    </TableCell>
    {children}
  </TableRow>
);

export default BerichtRij;

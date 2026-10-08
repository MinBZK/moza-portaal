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
  onMarkeer,
  children,
}: {
  bericht: DemoBericht;
  ongelezen: boolean;
  gemarkeerd: boolean;
  onMarkeer: () => void;
  /** Extra cellen achteraan, zoals acties. */
  children?: ReactNode;
}) => (
  <TableRow>
    <TableCell>
      <button
        type="button"
        aria-pressed={gemarkeerd}
        onClick={onMarkeer}
        className={`mox-button-mark`}
      >
        <FlagIcon filled={gemarkeerd} />
        <VisuallyHidden>Markeren</VisuallyHidden>
      </button>
    </TableCell>
    <TableCell>
      <span
        className={ongelezen ? "mox-afzender mox-ongelezen" : "mox-afzender"}
      >
        {ongelezen && (
          <>
            <span aria-hidden="true" className="mox-status-unread" />
            <VisuallyHidden>Ongelezen.</VisuallyHidden>
          </>
        )}
        {bericht.afzender}
      </span>
    </TableCell>
    <TableCell>
      <Link
        href={`/berichtenbox/${bericht.id}`}
        className={`utrecht-link utrecht-link--html-a ${ongelezen ? "mox-ongelezen" : ""}`}
      >
        {bericht.onderwerp}
      </Link>
    </TableCell>
    <TableCell>{formatDatum(bericht.datum)}</TableCell>
    <TableCell>
      {bericht.heeftBijlage && (
        <>
          <Icon icon="paperclip" />
          <VisuallyHidden>Heeft bijlage</VisuallyHidden>
        </>
      )}
    </TableCell>
    {children}
  </TableRow>
);

export default BerichtRij;

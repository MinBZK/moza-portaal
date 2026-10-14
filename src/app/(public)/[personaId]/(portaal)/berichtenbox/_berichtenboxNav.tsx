"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  NumberBadge,
  VisuallyHidden,
} from "@rijkshuisstijl-community/components-react";
import { Icon } from "@rijkshuisstijl-community/icon-react";
import { FolderIcon } from "@/components/icons/folderIcon";
import { ArchiveIcon } from "@/components/icons/archiveIcon";
import type { DemoBericht } from "@/demo";
import { useNieuweBerichten, useUitval } from "./_demoSimulatie";
import {
  mapVanBericht,
  statusVanBericht,
  telOngelezen,
  useBerichtenboxState,
  type Weergave,
} from "./_useBerichtenboxState";

const tabs: {
  weergave: Weergave;
  label: string;
  href: string;
  icon: ReactNode;
}[] = [
  {
    weergave: "inbox",
    label: "Inbox",
    href: "/berichtenbox",
    icon: <Icon icon="inbox" />,
  },
  {
    weergave: "archief",
    label: "Archief",
    href: "/berichtenbox/archief",
    icon: <ArchiveIcon />,
  },
  {
    weergave: "prullenbak",
    label: "Prullenbak",
    href: "/berichtenbox/prullenbak",
    icon: <Icon icon="verwijderen" />,
  },
];

const BerichtenboxNav = ({
  berichten,
  actief,
  opLijst = true,
  metNieuwe = true,
}: {
  berichten: (DemoBericht & { plek?: Weergave })[];
  /** Het tabblad waar de gebruiker nu is. Null als dat nog niet bekend is. */
  actief: Weergave | null;
  /** Op een detailpagina is het tabblad de plek, niet de pagina zelf. */
  opLijst?: boolean;
  /** Binnengedruppelde demo-berichten meetellen. Niet bij het stelsel. */
  metNieuwe?: boolean;
}) => {
  const { staat } = useBerichtenboxState();
  const zoekParams = useSearchParams();
  const nieuwe = useNieuweBerichten();
  // Bij demo-berichten: wat een onbereikbare organisatie niet levert, telt niet mee.
  const uitval = useUitval();
  const alle: (DemoBericht & { plek?: Weergave })[] = metNieuwe
    ? [...(nieuwe ?? []), ...berichten].filter(
        (bericht) =>
          !bericht.afzenderId || !uitval.scenario || !uitval.blokkeert(bericht),
      )
    : berichten;
  const ongelezen = staat ? telOngelezen(staat, alle) : 0;

  // Een map is een filter op de inbox. Tabblad Inbox is dan niet actief.
  const actieveMap =
    actief === "inbox" && opLijst ? zoekParams.get("map") : null;
  const mappen = staat
    ? [
        ...new Set([
          ...alle
            .filter((bericht) => statusVanBericht(staat, bericht) === "inbox")
            .map((bericht) => mapVanBericht(staat, bericht))
            .filter((naam): naam is string => !!naam),
          ...(metNieuwe ? staat.eigenMappen : []),
        ]),
      ].sort((a, b) => a.localeCompare(b, "nl"))
    : [];

  return (
    <nav aria-label="Berichtenbox">
      <ul className="mox-tabs">
        {tabs.map((tab) => {
          const isActief = tab.weergave === actief && !actieveMap;
          return (
            <li key={tab.weergave}>
              <Link
                href={tab.href}
                aria-current={
                  isActief ? (opLijst ? "page" : "true") : undefined
                }
                className={`mox-tab utrecht-link utrecht-link--html-a`}
              >
                {tab.icon}
                {tab.label}
                {tab.weergave === "inbox" && ongelezen > 0 && (
                  <span className="mox-badge-holder">
                    <NumberBadge>{ongelezen}</NumberBadge>
                    <VisuallyHidden>ongelezen</VisuallyHidden>
                  </span>
                )}
              </Link>
            </li>
          );
        })}
        {mappen.length > 0 && (
          <li className="mox-tabs-separator">
            <VisuallyHidden>Mappen:</VisuallyHidden>
          </li>
        )}
        {mappen.map((map) => (
          <li key={map}>
            <Link
              href={`/berichtenbox?${new URLSearchParams({ map })}`}
              aria-current={map === actieveMap ? "page" : undefined}
              className="mox-tab utrecht-link utrecht-link--html-a"
            >
              <FolderIcon />
              {map}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default BerichtenboxNav;

"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  NumberBadge,
  VisuallyHidden,
} from "@rijkshuisstijl-community/components-react";
import { Icon } from "@rijkshuisstijl-community/icon-react";
import { ArchiveIcon } from "@/components/icons/archiveIcon";
import type { DemoBericht } from "@/demo";
import { useNieuweBerichten, useUitval } from "./_demoSimulatie";
import {
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
  const nieuwe = useNieuweBerichten();
  // Bij demo-berichten: wat een onbereikbare organisatie niet levert, telt niet mee.
  const uitval = useUitval();
  const alle = metNieuwe
    ? [...(nieuwe ?? []), ...berichten].filter(
        (bericht) =>
          !bericht.afzenderId || !uitval.scenario || !uitval.blokkeert(bericht),
      )
    : berichten;
  const ongelezen = staat ? telOngelezen(staat, alle) : 0;

  return (
    <nav aria-label="Berichtenbox">
      <ul className="mox-tabs">
        {tabs.map((tab) => {
          const isActief = tab.weergave === actief;
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
                  <>
                    <NumberBadge>{ongelezen}</NumberBadge>
                    <VisuallyHidden>ongelezen</VisuallyHidden>
                  </>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default BerichtenboxNav;

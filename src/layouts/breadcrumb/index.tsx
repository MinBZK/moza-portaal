"use client";

import { Fragment, type ComponentProps } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  BreadcrumbNav,
  BreadcrumbNavLink,
} from "@rijkshuisstijl-community/components-react";
import { useHuidigeKruimel } from "./huidigeKruimel";

const breadcrumbLabels: Record<string, string> = {
  bedrijfsgegevens: "Bedrijfsgegevens",
  bedrijfsactiviteiten: "Bedrijfsactiviteiten",
  adresgegevens: "Adresgegevens",
  vestigingen: "Vestigingen",
  "ubo-register": "UBO-register",
  jaarrekeningen: "Jaarrekeningen",
  "lopende-zaken": "Lopende zaken",
  lopendezaken: "Lopende zaken",
  afgehandeld: "Afgehandeld",
  aanvragen: "Aanvragen die u nog moet versturen",
  berichtenbox: "Berichtenbox",
  inbox: "Berichtenbox",
  buurtberichten: "Berichten over uw buurt",
  "verzuim-en-verlof": "Ziekte en verlof",
  subsidies: "Subsidies en financiering",
  wetten: "Wetten en regelgeving",
  berichten: "Berichten over uw buurt",
  bewaard: "Bewaarde items",
  demo: "Componenten",
  gesprekken: "Gesprekken met de digitale assistent",
  "niet-relevant": "Niet relevant voor mij",
  "digitale-assistent": "Digitale assistent (AI)",
  belastingen: "Belastingen",
  "zakelijk-vervoer": "Zakelijk vervoer",
  personeel: "Personeel en rollen",
  "iemand-aannemen": "Iemand aannemen",
  gegevens: "Aanvraag laten invullen",
  versturen: "Controleren en versturen",
  overzicht: "Overzicht",
  "concept-aanvraag": "Aanvraag",
  verstuurd: "Aanvraag verstuurd",
  gemeente: "Loonkostensubsidie",
  wajong: "Loondispensatie",
  wia: "Doelgroepverklaring",
  besluit: "Besluit",
  "ziekte-verlof": "Ziekte en verlof",
  dataverwerking: "Gegevensdeling en dataverwerking",
  contactvoorkeuren: "Contactvoorkeuren",
  prive: "Privé",
};

// next/link mist de classes die Utrecht's eigen Link-component zet, waardoor
// de link-styling wegvalt. Hier zetten we ze er weer bij.
const NldsNextLink = ({ className, ...props }: ComponentProps<typeof Link>) => (
  <Link
    {...props}
    className={`utrecht-link utrecht-link--html-a ${className ?? ""}`}
  />
);

const Breadcrumb = () => {
  const paths = usePathname();
  const huidigeKruimel = useHuidigeKruimel();
  const pathNames = paths.split("/").filter((path) => path);

  // Geen breadcrumbs op home page
  if (pathNames.length == 0) {
    return;
  }
  const crumbs = pathNames.map((segment, index) => ({
    href: `/${pathNames.slice(0, index + 1).join("/")}`,
    label:
      huidigeKruimel?.pad === `/${pathNames.slice(0, index + 1).join("/")}`
        ? huidigeKruimel.label
        : (breadcrumbLabels[segment] ??
          segment[0].toUpperCase() + segment.slice(1)),
  }));

  return (
    <>
      <BreadcrumbNav aria-label="Kruimelpad">
        <BreadcrumbNavLink Link={NldsNextLink} href="/" index={0} rel="home">
          Home
        </BreadcrumbNavLink>
        {crumbs.map((crumb, index) => {
          const isCurrent = crumb.href === paths;
          return (
            <Fragment key={crumb.href}>
              {isCurrent ? (
                // The current page is not a link: plain text with
                // aria-current, instead of an <a> without href.
                <li className="utrecht-breadcrumb-nav__item">
                  <span
                    className="utrecht-breadcrumb-nav__text rhc-mox-breadcrumb-current"
                    aria-current="page"
                  >
                    {crumb.label}
                  </span>
                </li>
              ) : (
                <BreadcrumbNavLink
                  Link={NldsNextLink}
                  href={crumb.href}
                  index={index + 1}
                >
                  {crumb.label}
                </BreadcrumbNavLink>
              )}
            </Fragment>
          );
        })}
      </BreadcrumbNav>
    </>
  );
};

export default Breadcrumb;

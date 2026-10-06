"use client";

import { Fragment, type ComponentProps } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  BreadcrumbNav,
  BreadcrumbNavLink,
  BreadcrumbNavSeparator,
  Icon,
} from "@rijkshuisstijl-community/components-react";
import { useHuidigeKruimel } from "./huidigeKruimel";

const breadcrumbLabels: Record<string, string> = {
  bedrijfsgegevens: "Bedrijfsgegevens",
  ondernemingsgegevens: "Bedrijfsgegevens",
  "lopende-zaken": "Lopende zaken",
  aanvragen: "Lopende zaken",
  berichtenbox: "Berichtenbox",
  inbox: "Berichtenbox",
  omgevingsberichten: "Berichten over uw buurt",
  buurtberichten: "Berichten over uw buurt",
  medewerkers: "Personeel en rollen",
  "verzuim-en-verlof": "Ziekte en verlof",
  subsidies: "Subsidies en financiering",
  wetten: "Wetten en regelgeving",
  berichten: "Berichten over uw buurt",
  bewaard: "Bewaarde items",
  "digitale-assistent": "Digitale assistent (AI)",
  belastingen: "Belastingen",
  "zakelijk-vervoer": "Zakelijk vervoer",
  personeel: "Personeel en rollen",
  "ziekte-verlof": "Ziekte en verlof",
  dataverwerking: "Gegevensdeling en dataverwerking",
  contactvoorkeuren: "Contactvoorkeuren",
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
      <BreadcrumbNav>
        <BreadcrumbNavLink Link={NldsNextLink} href="/" index={0} rel="home">
          Home
        </BreadcrumbNavLink>
        {crumbs.map((crumb, index) => {
          const isCurrent = crumb.href === paths;
          return (
            <Fragment key={crumb.href}>
              <BreadcrumbNavSeparator>
                <Icon icon="chevron-right" />
              </BreadcrumbNavSeparator>
              <BreadcrumbNavLink
                // De huidige pagina krijgt geen href, dus geen next/link
                Link={isCurrent ? undefined : NldsNextLink}
                href={crumb.href}
                index={index + 1}
                current={isCurrent}
                disabled={isCurrent}
              >
                {crumb.label}
              </BreadcrumbNavLink>
            </Fragment>
          );
        })}
      </BreadcrumbNav>
    </>
  );
};

export default Breadcrumb;

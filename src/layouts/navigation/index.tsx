"use client";
import { useCallback } from "react";
import { usePathname } from "next/navigation";
import {
  SideNav,
  SideNavList,
  SideNavItem,
  Separator,
  NumberBadge,
} from "@/components/nl-design-system";
import { SideNavNextLink } from "@/components/nl-design-system/nextIntegration/SideNavNextLink";

const Navigation = () => {
  const pathname = usePathname();

  const isCurrent = useCallback(
    (route: string) => {
      return pathname?.split("/")[1] === route.split("/")[1];
    },
    [pathname],
  );

  return (
    <SideNav>
      <SideNavList>
        <SideNavItem>
          <SideNavNextLink href="/" current={isCurrent("/")} icon="home">
            Home
          </SideNavNextLink>
        </SideNavItem>
      </SideNavList>
      <Separator invisible />
      <SideNavList>
        <SideNavItem>
          <SideNavNextLink
            href="/berichtenbox"
            current={isCurrent("/berichtenbox")}
            icon="briefcase"
          >
            Berichtenbox
            <NumberBadge>1</NumberBadge>
          </SideNavNextLink>
        </SideNavItem>
        <SideNavItem>
          <SideNavNextLink
            href="/bedrijfsprofiel"
            current={isCurrent("/bedrijfsprofiel")}
            icon="briefcase"
          >
            Bedrijfsprofiel
          </SideNavNextLink>
        </SideNavItem>
        <SideNavItem>
          <SideNavNextLink
            href="/contactmomenten"
            current={isCurrent("/contactmomenten")}
            icon="mail"
          >
            Contact momenten
          </SideNavNextLink>
        </SideNavItem>
        <SideNavItem>
          <SideNavNextLink
            href="/zaken"
            current={isCurrent("/zaken")}
            icon="bewerken"
          >
            Lopende zaken
          </SideNavNextLink>
        </SideNavItem>
      </SideNavList>
      <Separator invisible />
      <SideNavList>
        <SideNavItem>
          <SideNavNextLink href="/#" disabled icon="briefcase">
            Financiën
          </SideNavNextLink>
        </SideNavItem>
        <SideNavItem>
          <SideNavNextLink
            href="/personeel"
            current={isCurrent("/personeel")}
            icon="user"
          >
            Personeel
          </SideNavNextLink>
        </SideNavItem>
        <SideNavItem>
          <SideNavNextLink href="/#" disabled icon="user">
            Ziek meldingen
          </SideNavNextLink>
        </SideNavItem>
      </SideNavList>
      <Separator invisible />
      <SideNavList>
        <SideNavItem>
          <SideNavNextLink
            href="/instellingen"
            current={isCurrent("/instellingen")}
            icon="instellingen"
          >
            Instellingen
          </SideNavNextLink>
        </SideNavItem>
      </SideNavList>
    </SideNav>
  );
};

export default Navigation;

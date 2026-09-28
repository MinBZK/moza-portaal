"use client";
import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  defaultFlags,
  FeatureFlags,
} from "@/app/(private)/instellingen/_featureFlags";
import {
  SideNav,
  SideNavList,
  SideNavItem,
  SideNavLink,
  Separator,
  NumberBadge,
} from "@rijkshuisstijl-community/components-react";

const Navigation = ({ flags = defaultFlags }: { flags?: FeatureFlags }) => {
  const pathname = usePathname();

  const hasAnyTrueFlag = Object.values(flags).some((flag) => flag === true);

  return (
    <SideNav>
      <SideNavList>
        <SideNavItem>
          <SideNavLink current href="/home" icon="home">
            Home
          </SideNavLink>
        </SideNavItem>
      </SideNavList>
      <Separator />
      <SideNavList>
        <SideNavItem>
          <SideNavLink href="/ondernemingsgegevens" icon="briefcase">
            Bedrijfsgegevens
          </SideNavLink>
        </SideNavItem>
        <SideNavItem>
          <SideNavLink href="/inbox" icon="inbox">
            Berichtenbox
            <NumberBadge>2</NumberBadge>
          </SideNavLink>
        </SideNavItem>
        <SideNavItem>
          <SideNavLink href="/aanvragen" icon="activiteit">
            Lopende zaken
          </SideNavLink>
        </SideNavItem>
      </SideNavList>
      <Separator />
      <SideNavList>
        <SideNavItem>
          <SideNavLink href="/subsidies" icon="nieuws">
            Subsidies en financiering
          </SideNavLink>
        </SideNavItem>
      </SideNavList>
      <SideNavList>
        <SideNavItem>
          <SideNavLink href="/wetten" icon="publicatie">
            Wetten en regelgeving
          </SideNavLink>
        </SideNavItem>
      </SideNavList>
      <SideNavList>
        <SideNavItem>
          <SideNavLink href="/omgevingsberichten" icon="locatiemarker">
            Berichten over uw buurt
          </SideNavLink>
        </SideNavItem>
      </SideNavList>
      <SideNavList>
        <SideNavItem>
          <SideNavLink href="/bewaard" icon="favoriet">
            Bewaarde items
          </SideNavLink>
        </SideNavItem>
      </SideNavList>
      <SideNavList>
        <SideNavItem>
          <SideNavLink href="/digitale-assistent" icon="comment">
            Digitale assistent (AI)
          </SideNavLink>
        </SideNavItem>
      </SideNavList>
      <Separator />
      <SideNavList>
        <SideNavItem>
          <SideNavLink href="/belastingen" icon="currency-euro">
            Belastingen
          </SideNavLink>
        </SideNavItem>
      </SideNavList>
      <SideNavList>
        <SideNavItem>
          <SideNavLink href="/zakelijk-vervoer" icon="car">
            Zakelijk vervoer
          </SideNavLink>
        </SideNavItem>
      </SideNavList>
      <SideNavList>
        <SideNavItem>
          <SideNavLink href="/medewerkers" icon="user">
            Personeel en rollen
          </SideNavLink>
        </SideNavItem>
      </SideNavList>
      <SideNavList>
        <SideNavItem>
          <SideNavLink href="/verzuim-en-verlof" icon="user">
            Ziekte en verlof
          </SideNavLink>
        </SideNavItem>
      </SideNavList>
      <Separator />
      <SideNavList>
        <SideNavItem>
          <SideNavLink href="/dataverwerking" icon="gegevensuitwisseling">
            Gegevensdeling en dataverwerking
          </SideNavLink>
        </SideNavItem>
      </SideNavList>
      <SideNavList>
        <SideNavItem>
          <SideNavLink href="/contactvoorkeuren" icon="instellingen">
            Contactvoorkeuren
          </SideNavLink>
        </SideNavItem>
      </SideNavList>
    </SideNav>
  );
};

function SidebarMenuItem({
  children,
  disabled = false,
  currentPage,
  text,
  route,
  notification = 0,
}: {
  children: ReactNode;
  disabled?: boolean;
  currentPage: string | null;
  text: string;
  route: string;
  notification?: number;
}) {
  const isActive = currentPage?.split("/")[1] === route.split("/")[1];
  return (
    <li
      className="main-navigation__item"
      aria-current={isActive ? "page" : undefined}
    >
      <Link href={route}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          {children}
        </svg>
        {text}

        {notification > 0 && (
          <span className="mt-1 ml-auto inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
            {notification}
          </span>
        )}
      </Link>
    </li>
  );
}

export default Navigation;

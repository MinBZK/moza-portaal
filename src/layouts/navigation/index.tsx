"use client";
import { FeatureFlags } from "@/app/(private)/instellingen/_featureFlags";
import {
  SideNav,
  SideNavList,
  SideNavItem,
  SideNavLink,
  Separator,
  NumberBadge,
} from "@rijkshuisstijl-community/components-react";

// flags wordt nog meegegeven door de private layout, maar is (nog) niet in gebruik.
const Navigation = (_props: { flags?: FeatureFlags }) => {
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

export default Navigation;

"use client";
import type { ReactNode } from "react";
import type {
  FeatureFlagKey,
  FeatureFlags,
} from "@/app/(private)/instellingen/_featureFlags";
import {
  SideNav,
  SideNavList,
  SideNavItem,
  SideNavLink,
  Separator,
} from "@rijkshuisstijl-community/components-react";

const Navigation = ({
  flags,
  berichtenboxBadge,
}: {
  /** Pagina-flags uit het Flags-paneel. Zonder flags staat alles aan. */
  flags?: FeatureFlags;
  /** Aantal ongelezen berichten. Komt van de layout, want die kent de berichten. */
  berichtenboxBadge?: ReactNode;
}) => {
  const toon = (key: FeatureFlagKey) => flags?.[key] !== false;

  return (
    <SideNav>
      <SideNavList>
        <SideNavItem>
          <SideNavLink current href="/" icon="home">
            Home
          </SideNavLink>
        </SideNavItem>
      </SideNavList>
      <Separator />
      <SideNavList>
        <SideNavItem>
          <SideNavLink href="/bedrijfsgegevens" icon="briefcase">
            Bedrijfsgegevens
          </SideNavLink>
        </SideNavItem>
        {toon("mox_pagina_berichtenbox") && (
          <SideNavItem>
            <SideNavLink href="/berichtenbox" icon="inbox">
              Berichtenbox
              {berichtenboxBadge}
            </SideNavLink>
          </SideNavItem>
        )}
        {toon("mox_pagina_lopendeZaken") && (
          <SideNavItem>
            <SideNavLink href="/lopendezaken" icon="activiteit">
              Lopende zaken
            </SideNavLink>
          </SideNavItem>
        )}
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
          <SideNavLink href="/buurtberichten" icon="locatiemarker">
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
      {toon("mox_pagina_digitaleAssistent") && (
        <SideNavList>
          <SideNavItem>
            <SideNavLink href="/digitale-assistent" icon="comment">
              Digitale assistent (AI)
            </SideNavLink>
          </SideNavItem>
        </SideNavList>
      )}
      <Separator />
      {toon("mox_pagina_belastingen") && (
        <SideNavList>
          <SideNavItem>
            <SideNavLink href="/belastingen" icon="currency-euro">
              Belastingen
            </SideNavLink>
          </SideNavItem>
        </SideNavList>
      )}
      {toon("mox_pagina_zakelijkVervoer") && (
        <SideNavList>
          <SideNavItem>
            <SideNavLink href="/zakelijk-vervoer" icon="car">
              Zakelijk vervoer
            </SideNavLink>
          </SideNavItem>
        </SideNavList>
      )}
      {toon("mox_pagina_personeel") && (
        <SideNavList>
          <SideNavItem>
            <SideNavLink href="/personeel" icon="user">
              Personeel en rollen
            </SideNavLink>
          </SideNavItem>
        </SideNavList>
      )}
      {toon("mox_pagina_ziekteVerlof") && (
        <SideNavList>
          <SideNavItem>
            <SideNavLink href="/verzuim-en-verlof" icon="user">
              Ziekte en verlof
            </SideNavLink>
          </SideNavItem>
        </SideNavList>
      )}
      <Separator />
      {toon("mox_pagina_dataverwerking") && (
        <SideNavList>
          <SideNavItem>
            <SideNavLink href="/dataverwerking" icon="gegevensuitwisseling">
              Gegevensdeling en dataverwerking
            </SideNavLink>
          </SideNavItem>
        </SideNavList>
      )}
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

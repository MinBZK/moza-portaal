"use client";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
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
  Icon,
} from "@rijkshuisstijl-community/components-react";
import { MENU_ID, useMenuOpen } from "./menuKnop";
import { useKiesOrganisatie } from "@/layouts/header/useKiesOrganisatie";
import LanguageSelect, { LANGUAGES } from "@/components/languageSelect";
import { AbsenceIcon } from "@/components/icons/absenceIcon";
import { DigitalAssistantIcon } from "@/components/icons/digitalAssistantIcon";
import { StaffIcon } from "@/components/icons/staffIcon";
import { RegulationIcon } from "@/components/icons/regulationIcon";
import { SubsidyIcon } from "@/components/icons/subsidyIcon";
import LogoutButton from "@/components/LogoutButton";

const Navigation = ({
  flags,
  berichtenboxBadge,
  lopendeZakenBadge,
  naam = "Robin Vogel",
  organisaties = [],
  actieveOrganisatieId,
  actieveOrganisatieNaam,
}: {
  /** Pagina-flags uit het Flags-paneel. Zonder flags staat alles aan. */
  flags?: FeatureFlags;
  /** Aantal ongelezen berichten. Komt van de layout, want die kent de berichten. */
  berichtenboxBadge?: ReactNode;
  /** Zaken die de Digitale assistent aanmaakte. */
  lopendeZakenBadge?: ReactNode;
  /** Naam in het menu op een smal scherm, net als in de header. */
  naam?: string;
  /** Organisaties om tussen te wisselen, net als in de header. */
  organisaties?: { id: string; handelsnaam: string }[];
  actieveOrganisatieId?: string;
  actieveOrganisatieNaam?: string;
}) => {
  const toon = (key: FeatureFlagKey) => flags?.[key] !== false;
  const pathname = usePathname();
  // Actief op de pagina zelf en op onderliggende pagina's. "/" alleen exact.
  const isActief = (...hrefs: string[]) =>
    hrefs.some((href) =>
      href === "/"
        ? pathname === "/"
        : pathname === href || pathname.startsWith(`${href}/`),
    );

  const open = useMenuOpen();
  const kiesOrganisatie = useKiesOrganisatie(actieveOrganisatieId);

  return (
    <SideNav>
      <div
        id={MENU_ID}
        className={
          open ? "rhc-menu-lists rhc-menu-lists--open" : "rhc-menu-lists"
        }
      >
        <SideNavList>
          <SideNavItem>
            <SideNavLink current={isActief("/")} href="/" icon="home">
              Home
            </SideNavLink>
          </SideNavItem>
        </SideNavList>
        <Separator />
        <SideNavList>
          <SideNavItem>
            <SideNavLink
              current={isActief("/bedrijfsgegevens")}
              href="/bedrijfsgegevens"
              icon="briefcase"
            >
              Bedrijfsgegevens
            </SideNavLink>
          </SideNavItem>
          {toon("mox_pagina_berichtenbox") && (
            <SideNavItem>
              <SideNavLink
                current={isActief("/berichtenbox")}
                href="/berichtenbox"
                icon="inbox"
              >
                Berichtenbox
                {berichtenboxBadge}
              </SideNavLink>
            </SideNavItem>
          )}
          {toon("mox_pagina_lopendeZaken") && (
            <SideNavItem>
              <SideNavLink
                current={isActief("/lopendezaken")}
                href="/lopendezaken"
                icon="activiteit"
              >
                Lopende zaken
                {lopendeZakenBadge}
              </SideNavLink>
            </SideNavItem>
          )}
        </SideNavList>
        <Separator />
        <SideNavList>
          <SideNavItem>
            <SideNavLink current={isActief("/subsidies")} href="/subsidies">
              <SubsidyIcon />
              Subsidies en financiering
            </SideNavLink>
          </SideNavItem>
        </SideNavList>
        <SideNavList>
          <SideNavItem>
            <SideNavLink current={isActief("/wetten")} href="/wetten">
              <RegulationIcon />
              Wetten en regelgeving
            </SideNavLink>
          </SideNavItem>
        </SideNavList>
        <SideNavList>
          <SideNavItem>
            <SideNavLink
              current={isActief("/buurtberichten")}
              href="/buurtberichten"
              icon="locatiemarker"
            >
              Berichten over uw buurt
            </SideNavLink>
          </SideNavItem>
        </SideNavList>
        <SideNavList>
          <SideNavItem>
            <SideNavLink
              current={isActief("/bewaard")}
              href="/bewaard"
              icon="favoriet"
            >
              Bewaarde items
            </SideNavLink>
          </SideNavItem>
        </SideNavList>
        {toon("mox_pagina_digitaleAssistent") && (
          <SideNavList>
            <SideNavItem>
              <SideNavLink
                current={isActief("/digitale-assistent")}
                href="/digitale-assistent"
              >
                <DigitalAssistantIcon />
                Digitale assistent (AI)
              </SideNavLink>
            </SideNavItem>
          </SideNavList>
        )}
        <Separator />
        {toon("mox_pagina_belastingen") && (
          <SideNavList>
            <SideNavItem>
              <SideNavLink
                current={isActief("/belastingen")}
                href="/belastingen"
                icon="currency-euro"
              >
                Belastingen
              </SideNavLink>
            </SideNavItem>
          </SideNavList>
        )}
        {toon("mox_pagina_zakelijkVervoer") && (
          <SideNavList>
            <SideNavItem>
              <SideNavLink
                current={isActief("/zakelijk-vervoer")}
                href="/zakelijk-vervoer"
                icon="car"
              >
                Zakelijk vervoer
              </SideNavLink>
            </SideNavItem>
          </SideNavList>
        )}
        {toon("mox_pagina_personeel") && (
          <SideNavList>
            <SideNavItem>
              <SideNavLink current={isActief("/personeel")} href="/personeel">
                <StaffIcon />
                Personeel en rollen
              </SideNavLink>
            </SideNavItem>
          </SideNavList>
        )}
        {toon("mox_pagina_ziekteVerlof") && (
          <SideNavList>
            <SideNavItem>
              <SideNavLink
                current={isActief("/verzuim-en-verlof")}
                href="/verzuim-en-verlof"
              >
                <AbsenceIcon />
                Ziekte en verlof
              </SideNavLink>
            </SideNavItem>
          </SideNavList>
        )}
        <Separator />
        {toon("mox_pagina_dataverwerking") && (
          <SideNavList>
            <SideNavItem>
              <SideNavLink
                current={isActief("/dataverwerking")}
                href="/dataverwerking"
                icon="gegevensuitwisseling"
              >
                Gegevensdeling en dataverwerking
              </SideNavLink>
            </SideNavItem>
          </SideNavList>
        )}
        <SideNavList>
          <SideNavItem>
            <SideNavLink
              current={isActief("/contactvoorkeuren")}
              href="/contactvoorkeuren"
              icon="instellingen"
            >
              Contactvoorkeuren
            </SideNavLink>
          </SideNavItem>
        </SideNavList>
        {/* Alleen op een smal scherm; op breed staan deze in de header. */}
        <div className="rhc-menu-account">
          <Separator />
          <SideNavList>
            <SideNavItem>
              <SideNavLink href="/" icon="user">
                <span className="mox-menu-identity">
                  <span>{naam}</span>
                  {actieveOrganisatieNaam && (
                    <span className="mox-header-organization">
                      {actieveOrganisatieNaam}
                    </span>
                  )}
                </span>
              </SideNavLink>
            </SideNavItem>
          </SideNavList>
          {/* De contextwisselaar uit de header: kies de organisatie. */}
          {organisaties.length > 1 && (
            <>
              <p id="menu-organisaties" className="rhc-menu-heading">
                Organisatie kiezen
              </p>
              <SideNavList aria-labelledby="menu-organisaties">
                {organisaties.map((organisatie) => {
                  const actief = organisatie.id === actieveOrganisatieId;
                  return (
                    <SideNavItem key={organisatie.id}>
                      <button
                        type="button"
                        className="rhc-side-nav__link"
                        aria-current={actief ? "true" : undefined}
                        onClick={() => kiesOrganisatie(organisatie.id)}
                      >
                        <Icon icon="briefcase" />
                        {organisatie.handelsnaam}
                      </button>
                    </SideNavItem>
                  );
                })}
              </SideNavList>
            </>
          )}
          <SideNavList>
            <SideNavItem>
              <LogoutButton className="rhc-side-nav__link mox-logout-button">
                <Icon icon="uitloggen" />
                Uitloggen
              </LogoutButton>
            </SideNavItem>
          </SideNavList>
          <LanguageSelect
            selectedLanguage="Nederlands"
            languages={LANGUAGES}
            withIcon
          />
        </div>
      </div>
    </SideNav>
  );
};

export default Navigation;

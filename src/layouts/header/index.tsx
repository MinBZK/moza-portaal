"use client";

import { components } from "@/network/kvk/organisatieregister/generated";
import Image from "next/image";
import Link from "next/link";
import { Logo, NavBar, Icon, VisuallyHidden } from "@/components/rhc";
import MenuKnop from "@/layouts/navigation/menuKnop";
import LanguageSelect, { LANGUAGES } from "@/components/languageSelect";
import LogoutButton from "@/components/LogoutButton";
import {
  useKiesOrganisatie,
  type KeuzeOrganisatie,
} from "./useKiesOrganisatie";
import { Dropdown, DropdownItem } from "@/components/Dropdown";

// kvk, kvkOpties en isPublic worden nog meegegeven door de layouts, maar zijn
// (nog) niet in gebruik in deze header.
const Header = ({
  signedIn = true,
  naam = "Robin Vogel",
  metMenu = false,
  organisaties = [],
  actieveOrganisatieId,
  actieveOrganisatieNaam,
}: {
  kvk?: string;
  kvkOpties?: components["schemas"]["MijnOverheidOrganisatiesResponse"];
  isPublic?: boolean;
  signedIn?: boolean;
  /** Toon de knop Menu (alleen als er een hoofdmenu is). */
  metMenu?: boolean;
  /** Naam van de ingelogde persoon. Komt van de actieve persona. */
  naam?: string;
  organisaties?: KeuzeOrganisatie[];
  actieveOrganisatieId?: string;
  actieveOrganisatieNaam?: string;
}) => {
  const kies = useKiesOrganisatie(actieveOrganisatieId);
  const accountLabel = actieveOrganisatieNaam ? (
    <>
      <span>{naam}</span>{" "}
      <span className="mox-header-organization">{actieveOrganisatieNaam}</span>
    </>
  ) : (
    naam
  );

  return (
    <>
      {/* Eigen markup in plaats van RHC PageHeader: die zet alles in
          __content, en de menuknop hoort direct in de header. */}
      <header
        className={
          signedIn
            ? "utrecht-page-header"
            : "utrecht-page-header header-landing"
        }
      >
        {metMenu && <MenuKnop />}
        <div className="utrecht-page-header__content">
          <Logo organisation="MijnOverheid Zakelijk" subtitle="">
            <Image
              src="/beeldmerk-rijksoverheid.svg"
              alt=""
              width={50}
              height={100}
              unoptimized
            />
          </Logo>
          <NavBar
            aria-label="Account"
            headingItem={{
              href: "/",
              id: "heading",
              label: "MijnOverheid Zakelijk",
            }}
            items={[]} // Pagina rendert niet zonder lege items
          >
            {/* Op een smal scherm staan taal, naam en uitloggen in het menu. */}
            <div className={metMenu ? "rhc-mox-header-account" : undefined}>
              <LanguageSelect
                selectedLanguage="Nederlands"
                languages={LANGUAGES}
              />
            </div>
            {signedIn && (
              <ul className="rhc-nav-bar__list">
                <li
                  className={
                    metMenu
                      ? "rhc-nav-bar__item rhc-mox-header-account"
                      : "rhc-nav-bar__item"
                  }
                >
                  {/* Meerdere organisaties: knop met keuzelijst. Eén
                        organisatie: dezelfde weergave, zonder keuzelijst en
                        niet klikbaar (een knop die niets doet, verwart). De
                        link is alleen voor iemand zonder organisatie. */}
                  {organisaties.length === 1 ? (
                    <span className="rhc-nav-bar__link rhc-mox-header-organizations__trigger rhc-mox-header-organizations__trigger--static">
                      <Icon icon="user" />
                      <span className="rhc-nav-bar__label rhc-mox-header-organizations__identity">
                        {accountLabel}
                      </span>
                    </span>
                  ) : organisaties.length > 1 ? (
                    <Dropdown
                      align="end"
                      triggerClassName="rhc-nav-bar__link rhc-mox-header-organizations__trigger"
                      trigger={
                        <>
                          <Icon icon="user" />
                          <span className="rhc-nav-bar__label rhc-mox-header-organizations__identity">
                            {accountLabel}
                          </span>
                          {/* Accessible name starts with the visible text (WCAG 2.5.3). */}
                          <VisuallyHidden>, organisatie kiezen</VisuallyHidden>
                          <Icon icon="chevron-down" />
                        </>
                      }
                    >
                      {organisaties.map((organisatie) => (
                        <DropdownItem
                          key={organisatie.id}
                          selected={organisatie.id === actieveOrganisatieId}
                          onSelect={() => kies(organisatie)}
                        >
                          {organisatie.handelsnaam}
                          {organisatie.ingelogd === false && " (inloggen)"}
                        </DropdownItem>
                      ))}
                    </Dropdown>
                  ) : (
                    <Link
                      className="rhc-nav-bar__link rhc-mox-header-organizations__single"
                      href="/"
                    >
                      <Icon icon="user" />
                      <span className="rhc-nav-bar__label rhc-mox-header-organizations__identity">
                        {accountLabel}
                      </span>
                    </Link>
                  )}
                </li>
                <li
                  className={
                    metMenu
                      ? "rhc-nav-bar__item rhc-mox-header-account"
                      : "rhc-nav-bar__item"
                  }
                >
                  <LogoutButton className="rhc-nav-bar__link mox-logout-button">
                    <Icon icon="uitloggen" />
                    <span className="rhc-nav-bar__label">Uitloggen</span>
                  </LogoutButton>
                </li>
              </ul>
            )}
          </NavBar>
        </div>
        <a
          className="prototype-temp-poc-banner"
          href="https://www.mijnoverheidzakelijk.nl/"
        >
          Proof of Concept
        </a>
      </header>
    </>
  );
};

export default Header;

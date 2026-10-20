"use client";

import { signIn } from "next-auth/react";
import { components } from "@/network/kvk/organisatieregister/generated";
import Image from "next/image";
import Link from "next/link";
import { Logo, NavBar, Icon } from "@/components/rhc";
import MenuKnop from "@/layouts/navigation/menuKnop";
import LanguageSelect, { TALEN } from "@/components/languageSelect";
import LogoutButton from "@/components/LogoutButton";
import { useCookie } from "@/utils/useCookie";
import { useKiesOrganisatie } from "./useKiesOrganisatie";
import { useState, useRef, useEffect } from "react";

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
  organisaties?: { id: string; handelsnaam: string }[];
  actieveOrganisatieId?: string;
  actieveOrganisatieNaam?: string;
}) => {
  const { set } = useCookie("loginMethod");
  const kies = useKiesOrganisatie(actieveOrganisatieId);
  const [openKeycloakLogin, setOpenKeycloakLogin] = useState(false);
  const [openOrganisaties, setOpenOrganisaties] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const organisatiesRef = useRef<HTMLDivElement | null>(null);
  const organisatieKnopRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    // Outside click handler for Keycloak login dropdown
    function handleClick(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpenKeycloakLogin(false);
      }
    }

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape" || e.key === "Esc") {
        setOpenKeycloakLogin(false);
      }
    }

    document.addEventListener("click", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  useEffect(() => {
    if (!openOrganisaties) return;

    const sluitBijKlikBuiten = (event: MouseEvent) => {
      if (
        organisatiesRef.current &&
        !organisatiesRef.current.contains(event.target as Node)
      ) {
        setOpenOrganisaties(false);
      }
    };
    const sluitBijEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpenOrganisaties(false);
      organisatieKnopRef.current?.focus();
    };

    document.addEventListener("click", sluitBijKlikBuiten);
    document.addEventListener("keydown", sluitBijEscape);
    return () => {
      document.removeEventListener("click", sluitBijKlikBuiten);
      document.removeEventListener("keydown", sluitBijEscape);
    };
  }, [openOrganisaties]);

  const kiesOrganisatie = (id: string) => {
    if (!kies(id)) setOpenOrganisaties(false);
  };

  const accountLabel = actieveOrganisatieNaam ? (
    <>
      <span>{naam}</span>
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
            headingItem={{
              href: "/",
              id: "heading",
              label: "MijnOverheid Zakelijk",
            }}
            items={[]} // Pagina rendert niet zonder lege items
          >
            {/* Op een smal scherm staan taal, naam en uitloggen in het menu. */}
            <div className={metMenu ? "rhc-header-account" : undefined}>
              <LanguageSelect selectedLanguage="Nederlands" languages={TALEN} />
            </div>
            <ul className="rhc-nav-bar__list">
              <li className="rhc-nav-bar__item"></li>
              {signedIn ? (
                <>
                  <li
                    className={
                      metMenu
                        ? "rhc-nav-bar__item rhc-header-account"
                        : "rhc-nav-bar__item"
                    }
                  >
                    {/* Meerdere organisaties: knop met keuzelijst. Eén
                        organisatie: dezelfde weergave, zonder keuzelijst en
                        niet klikbaar (een knop die niets doet, verwart). De
                        link is alleen voor iemand zonder organisatie. */}
                    {organisaties.length === 1 ? (
                      <span className="rhc-nav-bar__link rhc-header-organizations__trigger rhc-header-organizations__trigger--static">
                        <Icon icon="user" />
                        <span className="rhc-nav-bar__label rhc-header-organizations__identity">
                          {accountLabel}
                        </span>
                      </span>
                    ) : organisaties.length > 1 ? (
                      <div
                        ref={organisatiesRef}
                        className="rhc-header-organizations"
                      >
                        <button
                          ref={organisatieKnopRef}
                          type="button"
                          id="header-organisaties-knop"
                          className="rhc-nav-bar__link rhc-header-organizations__trigger"
                          aria-expanded={openOrganisaties}
                          aria-controls="header-organisaties"
                          aria-label={`${actieveOrganisatieNaam ?? naam}, organisatie kiezen`}
                          onClick={() => setOpenOrganisaties((open) => !open)}
                        >
                          <Icon icon="user" />
                          <span className="rhc-nav-bar__label rhc-header-organizations__identity">
                            {accountLabel}
                          </span>
                          <Icon icon="chevron-down" />
                        </button>
                        {openOrganisaties && (
                          <ul
                            id="header-organisaties"
                            className="rhc-menu"
                            aria-labelledby="header-organisaties-knop"
                          >
                            {organisaties.map((organisatie) => (
                              <li key={organisatie.id}>
                                <button
                                  type="button"
                                  className="rhc-header-organizations__choice"
                                  aria-pressed={
                                    organisatie.id === actieveOrganisatieId
                                  }
                                  onClick={() =>
                                    kiesOrganisatie(organisatie.id)
                                  }
                                >
                                  {organisatie.handelsnaam}
                                  {organisatie.id === actieveOrganisatieId &&
                                    " (actief)"}
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ) : (
                      <Link
                        className="rhc-nav-bar__link rhc-header-organizations__single"
                        href="/"
                      >
                        <Icon icon="user" />
                        <span className="rhc-nav-bar__label rhc-header-organizations__identity">
                          {accountLabel}
                        </span>
                      </Link>
                    )}
                  </li>
                  <li
                    className={
                      metMenu
                        ? "rhc-nav-bar__item rhc-header-account"
                        : "rhc-nav-bar__item"
                    }
                  >
                    <LogoutButton className="rhc-nav-bar__link mox-logout-button">
                      <Icon icon="uitloggen" />
                      <span className="rhc-nav-bar__label">Uitloggen</span>
                    </LogoutButton>
                  </li>
                </>
              ) : (
                <li className="rhc-nav-bar__item">
                  {/* Dropdown trigger + menu for Keycloak login with two options */}
                  <div ref={wrapperRef}>
                    <button
                      onClick={() => setOpenKeycloakLogin((v) => !v)}
                      className="utrecht-button utrecht-button--secondary-action rhc-button"
                      aria-expanded={openKeycloakLogin}
                      aria-haspopup="menu"
                    >
                      Keycloak login
                    </button>

                    {openKeycloakLogin && (
                      <div className="prototype-login-keycloak mox-card">
                        <div role="menu" aria-orientation="vertical">
                          <button
                            onClick={() => {
                              set("digid");
                              signIn(undefined, { callbackUrl: "/" });
                              setOpenKeycloakLogin(false);
                            }}
                            className="utrecht-button utrecht-button--secondary-action rhc-button"
                            role="menuitem"
                          >
                            DigiD
                          </button>

                          <button
                            onClick={() => {
                              set("eherkenning");
                              signIn(undefined, { callbackUrl: "/" });
                              setOpenKeycloakLogin(false);
                            }}
                            className="utrecht-button utrecht-button--secondary-action rhc-button"
                            role="menuitem"
                          >
                            E-Herkenning
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </li>
              )}
            </ul>
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

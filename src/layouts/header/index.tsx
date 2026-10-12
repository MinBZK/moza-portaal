"use client";

import { signIn } from "next-auth/react";
import { components } from "@/network/kvk/organisatieregister/generated";
import Image from "next/image";
import Link from "next/link";
import { Logo, NavBar, Icon } from "@/components/rhc";
import MenuKnop from "@/layouts/navigation/menuKnop";
import LanguageSelect, { TALEN } from "@/components/languageSelect";
import { useCookie } from "@/utils/useCookie";
import { useState, useRef, useEffect } from "react";

// kvk, kvkOpties en isPublic worden nog meegegeven door de layouts, maar zijn
// (nog) niet in gebruik in deze header.
const Header = ({
  signedIn = true,
  naam = "Robin Vogel",
  metMenu = false,
}: {
  kvk?: string;
  kvkOpties?: components["schemas"]["MijnOverheidOrganisatiesResponse"];
  isPublic?: boolean;
  signedIn?: boolean;
  /** Toon de knop Menu (alleen als er een hoofdmenu is). */
  metMenu?: boolean;
  /** Naam van de ingelogde persoon. Komt van de actieve persona. */
  naam?: string;
}) => {
  const { set } = useCookie("loginMethod");
  const [openKeycloakLogin, setOpenKeycloakLogin] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

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
            <div className={metMenu ? "mox-header-account" : undefined}>
              <LanguageSelect selectedLanguage="Nederlands" languages={TALEN} />
            </div>
            <ul className="rhc-nav-bar__list">
              <li className="rhc-nav-bar__item"></li>
              {signedIn ? (
                <>
                  <li
                    className={
                      metMenu
                        ? "rhc-nav-bar__item mox-header-account"
                        : "rhc-nav-bar__item"
                    }
                  >
                    <Link className="rhc-nav-bar__link" href="/">
                      <Icon icon="user" />
                      <span className="rhc-nav-bar__label">{naam}</span>
                    </Link>
                  </li>
                  <li
                    className={
                      metMenu
                        ? "rhc-nav-bar__item mox-header-account"
                        : "rhc-nav-bar__item"
                    }
                  >
                    <Link
                      href="/api/persona-logout"
                      className="rhc-nav-bar__link"
                    >
                      <Icon icon="uitloggen" />
                      <span className="rhc-nav-bar__label">Uitloggen</span>
                    </Link>
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
                      <div className="mox-login-keycloak mox-card">
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
          className="mox-temp-poc-banner"
          href="https://www.mijnoverheidzakelijk.nl/"
        >
          Proof of Concept
        </a>
      </header>
    </>
  );
};

export default Header;

"use client";

import { signIn } from "next-auth/react";
import { components } from "@/network/kvk/organisatieregister/generated";
import Image from "next/image";
import Link from "next/link";
import { PageHeader, Logo, NavBar } from "@/components/rhc";
import LanguageSelect from "@/components/languageSelect";
import { useCookie } from "@/utils/useCookie";
import { useState, useRef, useEffect } from "react";

// kvk, kvkOpties en isPublic worden nog meegegeven door de layouts, maar zijn
// (nog) niet in gebruik in deze header.
const Header = ({
  signedIn = true,
}: {
  kvk?: string;
  kvkOpties?: components["schemas"]["MijnOverheidOrganisatiesResponse"];
  isPublic?: boolean;
  signedIn?: boolean;
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
      <PageHeader className={signedIn ? undefined : "header-landing"}>
        <Logo organisation="" subtitle="">
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
          <LanguageSelect
            selectedLanguage="Nederlands"
            languages={[
              { lang: "nl", languageName: "Nederlands", href: "#" },
              {
                lang: "en",
                languageName: "English",
                localLanguageName: "Engels",
                href: "#",
              },
            ]}
          />
          <ul className="rhc-nav-bar__list">
            <li className="rhc-nav-bar__item"></li>
            {signedIn ? (
              <>
                <li className="rhc-nav-bar__item">
                  <Link className="rhc-nav-bar__link" href="/">
                    <span className="rhc-nav-bar__label">Robin Vogel</span>
                  </Link>
                </li>
                <li className="rhc-nav-bar__item">
                  <Link
                    href="/api/persona-logout"
                    className="rhc-nav-bar__link"
                  >
                    <span className="rhc-nav-bar__label">Uitloggen</span>
                  </Link>
                </li>
              </>
            ) : (
              <li className="rhc-nav-bar__item">
                {/* Dropdown trigger + menu for Keycloak login with two options */}
                <div ref={wrapperRef} className="relative inline-block">
                  <button
                    onClick={() => setOpenKeycloakLogin((v) => !v)}
                    className="mox-login-keycloak rounded border px-3 py-1"
                    aria-expanded={openKeycloakLogin}
                    aria-haspopup="menu"
                  >
                    Keycloak login
                  </button>

                  {openKeycloakLogin && (
                    <div className="ring-opacity-5 absolute right-0 z-20 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black">
                      <div
                        className="py-1"
                        role="menu"
                        aria-orientation="vertical"
                      >
                        <button
                          onClick={() => {
                            set("digid");
                            signIn(undefined, { callbackUrl: "/" });
                            setOpenKeycloakLogin(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-neutral-100"
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
                          className="w-full px-4 py-2 text-left text-sm hover:bg-neutral-100"
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
      </PageHeader>
    </>
  );
};

export default Header;

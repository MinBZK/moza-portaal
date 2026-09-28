"use client";

import ProfileSelect from "@/components/profileSelect";
import { SignOutAction } from "@/utils/auth/signOutAction";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Navigation from "../navigation";
import ChevronIcon from "@/components/icons/chevronIcon";
import { components } from "@/network/kvk/organisatieregister/generated";
import Link from "next/link";
import { signIn } from "next-auth/react";
import {
  PageHeader,
  Logo,
  NavBar,
} from "@rijkshuisstijl-community/components-react";
import LanguageSelect from "@/components/languageSelect";

const Header = ({
  kvk,
  kvkOpties,
  isPublic = false,
  signedIn = true,
}: {
  kvk?: string;
  kvkOpties?: components["schemas"]["MijnOverheidOrganisatiesResponse"];
  isPublic?: boolean;
  signedIn?: boolean;
}) => {
  const [menuOpened, setMenuOpened] = useState(false);
  const mobileMenuRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (menuOpened && mobileMenuRef.current) mobileMenuRef.current.showModal();
    if (menuOpened === false && mobileMenuRef.current)
      mobileMenuRef.current.close();
    if (menuOpened === true && closeButtonRef.current)
      closeButtonRef.current.focus();
  }, [menuOpened]);

  return (
    <>
      <PageHeader className={signedIn ? undefined : "header-landing"}>
        <Logo organisation="" subtitle="">
          <img src="/beeldmerk-rijksoverheid.svg" alt="" />
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
                  <Link className="rhc-nav-bar__link" href="/">
                    <span className="rhc-nav-bar__label">Uitloggen</span>
                  </Link>
                </li>
              </>
            ) : (
              <li className="rhc-nav-bar__item">
                <Link
                  className="rhc-nav-bar__link"
                  href="/home"
                  prefetch={false}
                >
                  <span className="rhc-nav-bar__label">Inloggen</span>
                </Link>
              </li>
            )}
          </ul>
        </NavBar>
      </PageHeader>
    </>
  );
};

export default Header;

"use client";

import { components } from "@/network/kvk/organisatieregister/generated";
import Image from "next/image";
import Link from "next/link";
import {
  PageHeader,
  Logo,
  NavBar,
} from "@rijkshuisstijl-community/components-react";
import LanguageSelect from "@/components/languageSelect";

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

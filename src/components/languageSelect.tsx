"use client";

import { LanguageNavigation } from "@/components/rhc";
import { TaalIcon } from "@/components/icons/taalIcon";

export type Language = {
  /** Taalcode, bijvoorbeeld "nl" */
  lang: string;
  /** Naam in de eigen taal, bijvoorbeeld "Nederlands" */
  languageName: string;
  /** Naam in de huidige taal, bijvoorbeeld "Engels" */
  localLanguageName?: string;
  href: string;
};

/** De talen van het portaal. */
export const TALEN: Language[] = [
  { lang: "nl", languageName: "Nederlands", href: "#" },
  {
    lang: "en",
    languageName: "English",
    localLanguageName: "Engels",
    href: "#",
  },
];

const LanguageSelect = ({
  languages,
  selectedLanguage,
  label = "Taalkeuze",
  metIcoon = false,
}: {
  languages: Language[];
  selectedLanguage: string;
  label?: string;
  /** Icoon voor de taal, zoals in het menu op een smal scherm. */
  metIcoon?: boolean;
}) => (
  <LanguageNavigation
    aria-label={label}
    defaultSelectedLanguage={selectedLanguage}
  >
    {/* Eigen inhoud: icoon voor de taal. Zonder children toont de trigger
        alleen de naam van de taal. */}
    <LanguageNavigation.Trigger>
      {metIcoon && <TaalIcon />}
      {selectedLanguage}
    </LanguageNavigation.Trigger>
    <LanguageNavigation.Content>
      {languages.map(({ lang, languageName, localLanguageName, href }) => (
        <LanguageNavigation.Item
          key={lang}
          href={href}
          lang={lang}
          languageName={languageName}
          localLanguageName={localLanguageName}
        />
      ))}
    </LanguageNavigation.Content>
  </LanguageNavigation>
);

export default LanguageSelect;

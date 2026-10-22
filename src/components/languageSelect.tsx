"use client";

import { LanguageNavigation } from "@/components/rhc";
import { LanguageIcon } from "@/components/icons/languageIcon";

export type Language = {
  /** Language code, for example "nl" */
  lang: string;
  /** Name in its own language, for example "Nederlands" */
  languageName: string;
  /** Name in the current language, for example "Engels" */
  localLanguageName?: string;
  href: string;
};

/** The languages of the portal. */
export const LANGUAGES: Language[] = [
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
  withIcon = false,
}: {
  languages: Language[];
  selectedLanguage: string;
  label?: string;
  /** Icon for the language, as in the menu on a narrow screen. */
  withIcon?: boolean;
}) => (
  <LanguageNavigation
    aria-label={label}
    defaultSelectedLanguage={selectedLanguage}
  >
    {/* Custom content: an icon for the language. Without children the
        trigger only shows the name of the language. */}
    <LanguageNavigation.Trigger>
      {withIcon && <LanguageIcon />}
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

"use client";

import { LanguageNavigation } from "@rijkshuisstijl-community/components-react";

export type Language = {
  /** Taalcode, bijvoorbeeld "nl" */
  lang: string;
  /** Naam in de eigen taal, bijvoorbeeld "Nederlands" */
  languageName: string;
  /** Naam in de huidige taal, bijvoorbeeld "Engels" */
  localLanguageName?: string;
  href: string;
};

const LanguageSelect = ({
  languages,
  selectedLanguage,
  label = "Taalkeuze",
}: {
  languages: Language[];
  selectedLanguage: string;
  label?: string;
}) => (
  <LanguageNavigation
    aria-label={label}
    defaultSelectedLanguage={selectedLanguage}
  >
    <LanguageNavigation.Trigger />
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

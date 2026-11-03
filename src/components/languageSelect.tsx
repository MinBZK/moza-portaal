"use client";

import { useState } from "react";
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
  {
    lang: "fy",
    languageName: "Frysk",
    localLanguageName: "Fries",
    href: "#",
  },
  {
    // Papiamento as written on Aruba.
    lang: "pap-AW",
    languageName: "Papiamento",
    href: "#",
  },
  {
    // Papiamentu as written on Bonaire and Curaçao.
    lang: "pap-CW",
    languageName: "Papiamentu",
    href: "#",
  },
];

/** Name as shown in the language menu, for example "English (Engels)". */
export const languageLabel = ({ languageName, localLanguageName }: Language) =>
  localLanguageName ? `${languageName} (${localLanguageName})` : languageName;

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
}) => {
  const [open, setOpen] = useState(false);
  return (
    <LanguageNavigation
      aria-label={label}
      defaultSelectedLanguage={selectedLanguage}
      open={open}
      onOpenChange={setOpen}
    >
      {/* Custom content: an icon for the language. Without children the
          trigger only shows the name of the language. */}
      {/* RHC sets aria-controls also while the list is closed, and then the
          list is not in the DOM: an id that points nowhere. Only while it is
          open do we keep the aria-controls of RHC. */}
      <LanguageNavigation.Trigger
        {...(!open && { "aria-controls": undefined })}
      >
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
};

export default LanguageSelect;

"use client";

import SiteSearch from "@/components/SiteSearch";
import { useFlag } from "@/app/(public)/_flags/flagsContext";

/** Search suggestions for the whole portal, until there is a search API. */
const SUGGESTIONS = [
  "btw-aangifte doen",
  "btw-nummer",
  "bedrijfsgegevens wijzigen",
  "berichtenbox",
  "contactvoorkeuren",
  "KVK-nummer",
  "loonaangifte",
  "loondispensatie",
  "loonkostensubsidie",
  "lopende zaken",
  "personeel aannemen",
  "subsidie aanvragen",
  "subsidie energiebesparing",
  "UBO-register",
  "vestigingen",
  "wetten en regelgeving",
];

/** Prototype: the same recent search for everyone. */
const RECENT_SEARCHES = ["Iemand aannemen met afstand tot de arbeidsmarkt"];

/**
 * Search and help below the h1 of every portal page (pattern Zoeken en hulp
 * op elke pagina). Not on the footer pages. With the digital assistant
 * switched off (flag mox_digitaleAssistent), every outcome leads to the
 * search results.
 */
const PageSearch = ({
  pageSuggestions,
  defaultValue,
}: {
  pageSuggestions?: string[];
  defaultValue?: string;
}) => {
  const assistent = useFlag("mox_digitaleAssistent");
  return (
    <SiteSearch
      assistant={assistent}
      suggestions={SUGGESTIONS}
      pageSuggestions={pageSuggestions}
      recentSearches={RECENT_SEARCHES}
      defaultValue={defaultValue}
    />
  );
};

export default PageSearch;

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

/**
 * Search and help on the home page and the search results page, without a
 * visible label. With the digital assistant
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
      hideLabel
      suggestions={SUGGESTIONS}
      pageSuggestions={pageSuggestions}
      defaultValue={defaultValue}
    />
  );
};

export default PageSearch;

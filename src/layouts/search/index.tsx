import SiteSearch from "@/components/SiteSearch";

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
 * Search and help below the h1 of every portal page (pattern Zoeken en hulp
 * op elke pagina). Not on the footer pages.
 */
const PageSearch = ({ pageSuggestions }: { pageSuggestions?: string[] }) => (
  <SiteSearch suggestions={SUGGESTIONS} pageSuggestions={pageSuggestions} />
);

export default PageSearch;

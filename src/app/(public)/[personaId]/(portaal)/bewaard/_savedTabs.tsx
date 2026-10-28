import Link from "next/link";
import { Icon } from "@/components/rhc";
import { DigitalAssistantIcon } from "@/components/icons/digitalAssistantIcon";

type SavedTab = "saved" | "conversations" | "notRelevant";

const TABS: { tab: SavedTab; href: string; label: string }[] = [
  { tab: "saved", href: "/bewaard", label: "Bewaarde items" },
  {
    tab: "conversations",
    href: "/bewaard/gesprekken",
    label: "Gesprekken met de digitale assistent",
  },
  {
    tab: "notRelevant",
    href: "/bewaard/niet-relevant",
    label: "Niet relevant voor mij",
  },
];

const tabIcon = (tab: SavedTab) => {
  if (tab === "saved") return <Icon icon="favoriet" />;
  if (tab === "conversations") return <DigitalAssistantIcon />;
  return <Icon icon="kruis" />;
};

/** Tabs of Bewaarde items, like the tabs of Lopende zaken. */
const SavedTabs = ({ active }: { active: SavedTab }) => (
  <nav aria-label="Bewaarde items">
    <ul className="rhc-mox-tabs">
      {TABS.map(({ tab, href, label }) => (
        <li key={tab}>
          <Link
            href={href}
            className="rhc-mox-tab utrecht-link utrecht-link--html-a"
            aria-current={active === tab ? "page" : undefined}
          >
            {tabIcon(tab)}
            {label}
          </Link>
        </li>
      ))}
    </ul>
  </nav>
);

export default SavedTabs;

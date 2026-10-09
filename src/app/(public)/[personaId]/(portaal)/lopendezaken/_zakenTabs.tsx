import Link from "next/link";
import { ArchiveIcon } from "@/components/icons/archiveIcon";
import { Icon } from "@/components/rhc";

/** Tabs Overzicht en Afgehandeld, zoals de tabs van de Berichtenbox. */
const ZakenTabs = ({ actief }: { actief: "lopend" | "afgehandeld" }) => (
  <nav aria-label="Lopende zaken">
    <ul className="mox-tabs">
      <li>
        <Link
          href="/lopendezaken"
          className="mox-tab utrecht-link utrecht-link--html-a"
          aria-current={actief === "lopend" ? "page" : undefined}
        >
          <Icon icon="activiteit" />
          Overzicht
        </Link>
      </li>
      <li>
        <Link
          href="/lopendezaken/afgehandeld"
          className="mox-tab utrecht-link utrecht-link--html-a"
          aria-current={actief === "afgehandeld" ? "page" : undefined}
        >
          <ArchiveIcon />
          Afgehandeld
        </Link>
      </li>
    </ul>
  </nav>
);

export default ZakenTabs;

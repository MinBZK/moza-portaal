import Link from "next/link";
import { Heading } from "@/components/rhc";
import Prive from "@/app/(private)/contactgegevens/[type]/prive";
import Zakelijk from "@/app/(private)/contactgegevens/[type]/zakelijk";

const tabs = [
  { type: "prive", label: "Privé", href: "/contactgegevens/prive" },
  { type: "zakelijk", label: "Zakelijk", href: "/contactgegevens/zakelijk" },
] as const;

const ContactgegevensPage = async ({
  params,
}: {
  params: Promise<{ type: "zakelijk" | "prive" }>;
}) => {
  const { type } = await params;

  return (
    <>
      <Heading level={1}>Contactgegevens</Heading>
      <div className="mox-card mox-row-gap">
        <nav aria-label="Soort contactgegevens">
          <ul className="mox-tabs">
            {tabs.map((tab) => (
              <li key={tab.type}>
                <Link
                  href={tab.href}
                  aria-current={tab.type === type ? "page" : undefined}
                  className="mox-tab utrecht-link utrecht-link--html-a"
                >
                  {tab.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {type === "prive" ? <Prive /> : <Zakelijk />}
      </div>
    </>
  );
};

export default ContactgegevensPage;

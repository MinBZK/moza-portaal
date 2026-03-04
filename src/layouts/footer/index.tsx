import ChevronIcon from "@/components/icons/chevronIcon";
import { ExternalLinkIcon } from "@/components/icons/externalLinkIcon";
import { IconText } from "@/components/iconText";
import Link from "next/link";
import { ReactNode } from "react";

const FooterLinkItem = ({
  href = "#",
  children,
}: {
  href?: string;
  children: ReactNode;
}) => {
  return (
    <li className="hover-up">
      <Link href={href}>
        <IconText IconBefore={ChevronIcon}>{children}</IconText>
      </Link>
    </li>
  );
};

export const Footer = () => {
  return (
    <footer className="border-t border-t-[#282828] bg-[#535353] px-2 py-8 text-white shadow-[0_50vh_0_50vh_#535353]">
      <div className="mx-auto grid max-w-[1260px] grid-cols-1 justify-between gap-x-4 gap-y-8 px-2 sm:grid-cols-2 md:grid-cols-4">
        <nav aria-labelledby="over-deze-site" className="flex flex-col gap-5">
          <h3 id="over-deze-site" className="text-h3">
            Over deze site
          </h3>
          <ul className="flex flex-col gap-4">
            <FooterLinkItem href="/wat-is-mijnoverheid-zakelijk">
              Wat is MijnOverheid Zakelijk
            </FooterLinkItem>
            <FooterLinkItem href="/toegankelijkheid">
              Toegankelijkheid
            </FooterLinkItem>
            <FooterLinkItem href="/sitemap">Sitemap</FooterLinkItem>
            <FooterLinkItem href="/english">English</FooterLinkItem>
          </ul>
        </nav>
        <nav
          aria-labelledby="gegevensverwerking"
          className="flex flex-col gap-3"
        >
          <h3 id="gegevensverwerking" className="text-h3">
            Gegevensverwerking
          </h3>
          <ul className="flex flex-col gap-4">
            <FooterLinkItem href="/veiligheid">Veiligheid</FooterLinkItem>
            <FooterLinkItem href="/privacyverklaring">
              Privacyverklaring
            </FooterLinkItem>
            <FooterLinkItem href="/wet-en-regelgeving">
              Wet- en regelgeving
            </FooterLinkItem>
          </ul>
        </nav>
        <nav aria-labelledby="service" className="flex flex-col gap-3">
          <h3 id="service" className="text-h3">
            Service
          </h3>
          <ul className="flex flex-col gap-4">
            <FooterLinkItem href="/mededelingen">Mededelingen</FooterLinkItem>
            <FooterLinkItem href="/herken-oplichting">
              Herken oplichting
            </FooterLinkItem>
            <FooterLinkItem href="/veelgestelde-vragen">
              Veelgestelde vragen
            </FooterLinkItem>
            <FooterLinkItem href="/contact">Contact</FooterLinkItem>
            <FooterLinkItem href="/klachtafhandeling">
              Klachtafhandeling
            </FooterLinkItem>
          </ul>
        </nav>
        <nav aria-labelledby="partners" className="flex flex-col gap-3">
          <h3 id="partners" className="text-h3">
            Partners
          </h3>
          <ul className="flex flex-col gap-4">
            <FooterLinkItem href="/aangesloten-organisaties">
              Aangesloten organisaties
            </FooterLinkItem>
            <li className="hover-up">
              <a
                href={"https://www.overheid.nl/"}
                target="_blank"
                rel="noopener noreferrer"
              >
                <IconText
                  IconBefore={ExternalLinkIcon}
                  iconProps={{ className: "w-4" }}
                >
                  {"Overheid.nl"}
                </IconText>
              </a>
            </li>
            <li className="hover-up">
              <a
                href={"https://www.rijksoverheid.nl/"}
                target="_blank"
                rel="noopener noreferrer"
              >
                <IconText
                  IconBefore={ExternalLinkIcon}
                  iconProps={{ className: "w-4" }}
                >
                  {"Rijksoverheid.nl"}
                </IconText>
              </a>
            </li>
            <li className="hover-up">
              <a
                href={"https://www.rvig.nl/mfo-burgers"}
                target="_blank"
                rel="noopener noreferrer"
              >
                <IconText
                  IconBefore={ExternalLinkIcon}
                  iconProps={{ className: "w-4" }}
                >
                  {"Meldpunt Fouten in Overheidsregistraties"}
                </IconText>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
};

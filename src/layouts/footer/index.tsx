import ChevronIcon from "@/components/icons/chevronIcon";
import { ExternalLinkIcon } from "@/components/icons/externalLinkIcon";
import { IconText } from "@/components/iconText";
import Link from "next/link";
import { ReactNode } from "react";
import { Footer as NldsFooter } from "@rijkshuisstijl-community/components-react";

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

const gridCell =
  "rhc-grid__cell rhc-grid__cell-12 rhc-grid__cell-t-6 rhc-grid__cell-d-3";

const FooterLinks = () => (
  <div className="rhc-grid">
    <nav className={gridCell} aria-labelledby="over-deze-site">
      <h2 id="over-deze-site">Over deze site</h2>
      <ul>
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
    <nav className={gridCell} aria-labelledby="gegevensverwerking">
      <h2 id="gegevensverwerking">Gegevensverwerking</h2>
      <ul>
        <FooterLinkItem href="/veiligheid">Veiligheid</FooterLinkItem>
        <FooterLinkItem href="/privacyverklaring">
          Privacyverklaring
        </FooterLinkItem>
        <FooterLinkItem href="/wet-en-regelgeving">
          Wet- en regelgeving
        </FooterLinkItem>
      </ul>
    </nav>
    <nav className={gridCell} aria-labelledby="service">
      <h2 id="service">Service</h2>
      <ul>
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
    <nav aria-labelledby="partners">
      <h2 id="partners">Partners</h2>
      <ul>
        <FooterLinkItem href="/aangesloten-organisaties">
          Aangesloten organisaties
        </FooterLinkItem>
        <li>
          <a href="https://www.overheid.nl/" target="_blank" rel="noreferrer">
            <IconText IconBefore={ExternalLinkIcon}>Overheid.nl</IconText>
          </a>
        </li>
        <li>
          <a
            href="https://www.rijksoverheid.nl/"
            target="_blank"
            rel="noreferrer"
          >
            <IconText IconBefore={ExternalLinkIcon}>Rijksoverheid.nl</IconText>
          </a>
        </li>
        <li>
          <a
            href="https://www.rvig.nl/mfo-burgers"
            target="_blank"
            rel="noreferrer"
          >
            <IconText IconBefore={ExternalLinkIcon}>
              Meldpunt Fouten in Overheidsregistraties
            </IconText>
          </a>
        </li>
      </ul>
    </nav>
  </div>
);

// slot2 is verplicht in de NLDS-typing, maar een lege waarde laat de hele
// onderbalk en de separator weg.
export const Footer = () => <NldsFooter slot1={<FooterLinks />} slot2={null} />;

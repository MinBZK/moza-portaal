import {
  Icon,
  LinkList,
  LinkListLink,
  Footer as NldsFooter,
  VisuallyHidden,
} from "@/components/rhc";

type FooterLink = { href: string; label: string; extern?: boolean };

const groepen: { id: string; kop: string; links: FooterLink[] }[] = [
  {
    id: "over-deze-site",
    kop: "Over deze site",
    links: [
      {
        href: "/wat-is-mijnoverheid-zakelijk",
        label: "Wat is MijnOverheid Zakelijk",
      },
      { href: "/toegankelijkheid", label: "Toegankelijkheid" },
      { href: "/sitemap", label: "Sitemap" },
      { href: "/english", label: "English" },
    ],
  },
  {
    id: "gegevensverwerking",
    kop: "Gegevensverwerking",
    links: [
      { href: "/veiligheid", label: "Veiligheid" },
      { href: "/privacyverklaring", label: "Privacyverklaring" },
      { href: "/wet-en-regelgeving", label: "Wet- en regelgeving" },
    ],
  },
  {
    id: "service",
    kop: "Service",
    links: [
      { href: "/mededelingen", label: "Mededelingen" },
      { href: "/herken-oplichting", label: "Herken oplichting" },
      { href: "/veelgestelde-vragen", label: "Veelgestelde vragen" },
      { href: "/contact", label: "Contact" },
      { href: "/klachtafhandeling", label: "Klachtafhandeling" },
    ],
  },
  {
    id: "partners",
    kop: "Partners",
    links: [
      { href: "/aangesloten-organisaties", label: "Aangesloten organisaties" },
      { href: "https://www.overheid.nl/", label: "Overheid.nl", extern: true },
      {
        href: "https://www.rijksoverheid.nl/",
        label: "Rijksoverheid.nl",
        extern: true,
      },
      {
        href: "https://www.rvig.nl/mfo-burgers",
        label: "Meldpunt Fouten in Overheidsregistraties",
        extern: true,
      },
    ],
  },
];

const gridCell =
  "rhc-grid__cell rhc-grid__cell-12 rhc-grid__cell-t-6 rhc-grid__cell-d-3";

const FooterLinks = () => (
  <div className="rhc-grid">
    {groepen.map(({ id, kop, links }) => (
      <nav key={id} className={gridCell} aria-labelledby={id}>
        <h2 id={id}>{kop}</h2>
        <LinkList>
          {links.map(({ href, label, extern }) => (
            <LinkListLink
              key={href}
              href={href}
              // key: Utrecht zet het icoon in een array met de linktekst.
              icon={
                <Icon
                  key="icoon"
                  icon={extern ? "externe-link" : "chevron-right"}
                />
              }
              {...(extern && { target: "_blank", rel: "noreferrer" })}
            >
              {label}
              {extern && (
                <VisuallyHidden> (opent in nieuw tabblad)</VisuallyHidden>
              )}
            </LinkListLink>
          ))}
        </LinkList>
      </nav>
    ))}
  </div>
);

// slot2 is verplicht in de NLDS-typing, maar een lege waarde laat de hele
// onderbalk en de separator weg.
export const Footer = () => <NldsFooter slot1={<FooterLinks />} slot2={null} />;

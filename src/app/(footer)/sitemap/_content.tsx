import { Paragraph, UnorderedList, UnorderedListItem } from "@/components/rhc";
import { footerGroups } from "@/layouts/footer";
import { FooterArticle, Section, TextLink } from "../_article";

type SitemapLink = { href: string; label: string; children?: SitemapLink[] };

/**
 * The main menu with its fixed sub pages, with the same names as in the
 * menu, tabs and breadcrumb. Not in it: single items (a message, a case),
 * steps of a form and the pages of the prototype.
 */
const PORTAL: SitemapLink[] = [
  { href: "/", label: "Home" },
  {
    href: "/bedrijfsgegevens",
    label: "Bedrijfsgegevens",
    children: [
      {
        href: "/bedrijfsgegevens/bedrijfsactiviteiten",
        label: "Bedrijfsactiviteiten",
      },
      { href: "/bedrijfsgegevens/adresgegevens", label: "Adresgegevens" },
      { href: "/bedrijfsgegevens/vestigingen", label: "Vestigingen" },
      { href: "/bedrijfsgegevens/ubo-register", label: "UBO-register" },
      { href: "/bedrijfsgegevens/jaarrekeningen", label: "Jaarrekeningen" },
    ],
  },
  {
    href: "/berichtenbox",
    label: "Berichtenbox",
    children: [
      { href: "/berichtenbox/archief", label: "Archief" },
      { href: "/berichtenbox/prullenbak", label: "Prullenbak" },
    ],
  },
  {
    href: "/lopendezaken",
    label: "Lopende zaken",
    children: [{ href: "/lopendezaken/afgehandeld", label: "Afgehandeld" }],
  },
  { href: "/subsidies", label: "Subsidies en financiering" },
  { href: "/wetten", label: "Wetten en regelgeving" },
  { href: "/buurtberichten", label: "Berichten over uw buurt" },
  {
    href: "/bewaard",
    label: "Bewaarde items",
    children: [
      {
        href: "/bewaard/gesprekken",
        label: "Gesprekken met de digitale assistent",
      },
      { href: "/bewaard/niet-relevant", label: "Niet relevant voor mij" },
    ],
  },
  { href: "/digitale-assistent", label: "Digitale assistent (AI)" },
  { href: "/belastingen", label: "Belastingen" },
  { href: "/zakelijk-vervoer", label: "Zakelijk vervoer" },
  { href: "/personeel", label: "Personeel en rollen" },
  { href: "/verzuim-en-verlof", label: "Ziekte en verlof" },
  { href: "/dataverwerking", label: "Gegevensdeling en dataverwerking" },
  {
    href: "/contactvoorkeuren",
    label: "Contactvoorkeuren",
    children: [{ href: "/contactvoorkeuren/prive", label: "Privé" }],
  },
];

const Links = ({ links }: { links: SitemapLink[] }) => (
  <UnorderedList>
    {links.map(({ href, label, children }) => (
      <UnorderedListItem key={href}>
        <TextLink href={href}>{label}</TextLink>
        {children && <Links links={children} />}
      </UnorderedListItem>
    ))}
  </UnorderedList>
);

const Content = () => (
  <FooterArticle title="Sitemap">
    <Paragraph>Alle pagina’s van MijnOverheid Zakelijk op een rij.</Paragraph>

    <Section id="portaal" title="Na het inloggen">
      <Links links={PORTAL} />
    </Section>

    {footerGroups.map(({ id, kop, links }) => (
      <Section key={id} id={`sitemap-${id}`} title={kop}>
        <Links links={links.filter(({ extern }) => !extern)} />
      </Section>
    ))}
  </FooterArticle>
);

export default Content;

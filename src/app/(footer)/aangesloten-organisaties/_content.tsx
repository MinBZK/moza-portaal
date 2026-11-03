import { Paragraph, UnorderedList, UnorderedListItem } from "@/components/rhc";
import { ExternalLink, FooterArticle, Section } from "../_article";

/** The organisations, with the full name and abbreviation on first use. */
const ORGANISATIONS = [
  { name: "Belastingdienst", href: "https://www.belastingdienst.nl/" },
  { name: "Kamer van Koophandel (KVK)", href: "https://www.kvk.nl/" },
  { name: "Ondernemersplein", href: "https://ondernemersplein.overheid.nl/" },
  {
    name: "Rijksdienst voor Ondernemend Nederland (RVO)",
    href: "https://www.rvo.nl/",
  },
  {
    name: "Uitvoeringsinstituut Werknemersverzekeringen (UWV)",
    href: "https://www.uwv.nl/",
  },
  { name: "Dienst Wegverkeer (RDW)", href: "https://www.rdw.nl/" },
  { name: "Douane", href: "https://www.douane.nl/" },
  { name: "Logius", href: "https://www.logius.nl/" },
  {
    name: "Vereniging van Nederlandse Gemeenten (VNG)",
    href: "https://vng.nl/",
  },
  { name: "Gemeente Amsterdam", href: "https://www.amsterdam.nl/" },
  { name: "Gemeente Rotterdam", href: "https://www.rotterdam.nl/" },
  { name: "Rijksorganisatie ODI", href: "https://www.rijksorganisatieodi.nl/" },
  {
    name: "Ministerie van Binnenlandse Zaken en Koninkrijksrelaties",
    href: "https://www.rijksoverheid.nl/ministeries/ministerie-van-binnenlandse-zaken-en-koninkrijksrelaties",
  },
  {
    name: "Ministerie van Economische Zaken en Klimaat",
    href: "https://www.rijksoverheid.nl/ministeries/ministerie-van-economische-zaken-en-klimaat",
  },
];

const Content = () => (
  <FooterArticle title="Aangesloten organisaties">
    <Paragraph>
      In mei 2026 tekenden veertien overheidsorganisaties een
      intentieverklaring. Daarin spraken zij af om samen te werken aan
      MijnOverheid Zakelijk.
    </Paragraph>

    <Section
      id="overzicht"
      title="Overzicht van huidige aangesloten organisaties"
    >
      <UnorderedList>
        {ORGANISATIONS.map(({ name, href }) => (
          <UnorderedListItem key={href}>
            <ExternalLink href={href}>{name}</ExternalLink>
          </UnorderedListItem>
        ))}
      </UnorderedList>
    </Section>

    <Section id="wat-u-ziet" title="Wat houdt onze samenwerking in">
      <Paragraph>
        MOZa is van en voor de hele overheid. We bouwen één keer, samen, en elke
        organisatie kan het gebruiken.
      </Paragraph>
      <Paragraph>
        <a href="https://www.mijnoverheidzakelijk.nl/over-moza/samenwerking/">
          Lees op onze informatiesite meer over deze samenwerking
        </a>
        .
      </Paragraph>
    </Section>
  </FooterArticle>
);

export default Content;

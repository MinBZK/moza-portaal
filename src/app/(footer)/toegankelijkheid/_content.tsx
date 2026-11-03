import { Paragraph, UnorderedList, UnorderedListItem } from "@/components/rhc";
import { FooterArticle, Section, TextLink } from "../_article";

const Content = () => (
  <FooterArticle title="Toegankelijkheid">
    <Paragraph>
      Iedereen moet MijnOverheid Zakelijk kunnen gebruiken. Ook als u slecht
      ziet, slecht hoort of geen muis gebruikt.
    </Paragraph>

    <Section id="eisen" title="Waar wij ons aan houden">
      <Paragraph>
        Wij bouwen deze website volgens de eisen voor overheidswebsites. Dat
        zijn de Web Content Accessibility Guidelines (WCAG) 2.2, niveau AA, en
        de Europese norm EN 301 549.
      </Paragraph>
    </Section>

    <Section id="zelf-doen" title="Wat u zelf kunt doen">
      <UnorderedList>
        <UnorderedListItem>
          Maak de tekst groter met Ctrl en + (op een Mac: Cmd en +)
        </UnorderedListItem>
        <UnorderedListItem>
          Gebruik de website met alleen een toetsenbord
        </UnorderedListItem>
        <UnorderedListItem>
          Laat de tekst voorlezen met een schermlezer
        </UnorderedListItem>
      </UnorderedList>
    </Section>

    <Section id="verklaring" title="Toegankelijkheidsverklaring">
      <Paragraph>
        Deze website is een proef. Een onafhankelijk bureau heeft de website nog
        niet onderzocht. Daarom is er nog geen toegankelijkheidsverklaring. Die
        volgt na het onderzoek.
      </Paragraph>
    </Section>

    <Section id="probleem" title="Werkt er iets niet?">
      <Paragraph>
        Laat het ons weten via <TextLink href="/contact">Contact</TextLink>.
        Vertel op welke pagina het is en wat er misgaat.
      </Paragraph>
    </Section>
  </FooterArticle>
);

export default Content;

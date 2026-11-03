import { Paragraph } from "@/components/rhc";
import { ExternalLink, FooterArticle, Section, TextLink } from "../_article";

const Content = () => (
  <FooterArticle title="Klachtafhandeling">
    <Paragraph>
      Bent u niet tevreden over hoe de overheid u heeft behandeld? Dan kunt u
      een klacht indienen.
    </Paragraph>

    <Section id="organisatie" title="Een klacht over een organisatie">
      <Paragraph>
        Dien uw klacht in bij de organisatie zelf. Elke organisatie heeft een
        eigen klachtenregeling. Die vindt u op de website van de organisatie.
      </Paragraph>
    </Section>

    <Section id="website" title="Een klacht over MijnOverheid Zakelijk">
      <Paragraph>
        Laat het ons weten via <TextLink href="/contact">Contact</TextLink>.
      </Paragraph>
    </Section>

    <Section id="ombudsman" title="Niet tevreden over de afhandeling?">
      <Paragraph>
        Dan kunt u naar de{" "}
        <ExternalLink href="https://www.nationaleombudsman.nl/">
          Nationale ombudsman
        </ExternalLink>
        . Gaat het om een gemeente? Dan kan dat ook een ombudsman van de
        gemeente zijn.
      </Paragraph>
    </Section>
  </FooterArticle>
);

export default Content;

import { Paragraph } from "@/components/rhc";
import { ExternalLink, FooterArticle, Section } from "../_article";

const Content = () => (
  <FooterArticle title="English" lang="en">
    <Paragraph>
      MijnOverheid Zakelijk is the online portal of the Dutch government for
      businesses. It brings messages, ongoing applications and company details
      from government organisations together in one place.
    </Paragraph>

    <Section id="log-in" title="Logging in">
      <Paragraph>
        You log in with eHerkenning or DigiD. Once logged in, you see the
        information that applies to your business.
      </Paragraph>
    </Section>

    <Section id="language" title="Language">
      <Paragraph>
        At the moment, this website is only available in Dutch. For information
        in English about doing business in the Netherlands, visit{" "}
        <ExternalLink href="https://business.gov.nl/">
          Business.gov.nl
        </ExternalLink>
        .
      </Paragraph>
    </Section>
  </FooterArticle>
);

export default Content;

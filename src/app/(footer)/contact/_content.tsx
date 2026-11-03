import { Paragraph } from "@/components/rhc";
import { FooterArticle, Section, TextLink } from "../_article";

const Content = () => (
  <FooterArticle title="Contact">
    <Paragraph>Hebt u een vraag? Hier leest u waar u terechtkunt.</Paragraph>

    <Section id="zelf-zoeken" title="Zoek eerst zelf het antwoord">
      <Paragraph>
        Bekijk de{" "}
        <TextLink href="/veelgestelde-vragen">veelgestelde vragen</TextLink>. Na
        het inloggen kunt u uw vraag ook stellen aan de{" "}
        <TextLink href="/digitale-assistent">digitale assistent</TextLink>.
      </Paragraph>
    </Section>

    <Section id="organisatie" title="Een vraag over een bericht of aanvraag">
      <Paragraph>
        Neem contact op met de organisatie die het bericht stuurde of uw
        aanvraag behandelt. Hun contactgegevens staan in het bericht.
      </Paragraph>
    </Section>

    <Section id="website" title="Een vraag over deze website">
      <Paragraph>
        Deze website is een proef. Mocht u onverhoopt contact met ons op willen
        nemen, dan kan dit{" "}
        <a href="https://www.mijnoverheidzakelijk.nl/contact/" rel="external">
          via onze informatiesite.
        </a>
        .
      </Paragraph>
    </Section>
  </FooterArticle>
);

export default Content;

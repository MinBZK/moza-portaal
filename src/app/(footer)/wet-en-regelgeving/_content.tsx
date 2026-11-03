import { Paragraph, UnorderedList, UnorderedListItem } from "@/components/rhc";
import { FooterArticle, Section, TextLink } from "../_article";

const Content = () => (
  <FooterArticle title="Wet- en regelgeving">
    <Paragraph>
      MijnOverheid Zakelijk werkt volgens de wetten en regels voor de digitale
      overheid. Dit zijn de belangrijkste.
    </Paragraph>

    <Section id="wetten" title="Wetten voor deze website">
      <UnorderedList>
        <UnorderedListItem>
          <strong>Wet digitale overheid (Wdo)</strong>: regels voor veilig
          inloggen bij de overheid, bijvoorbeeld met eHerkenning
        </UnorderedListItem>
        <UnorderedListItem>
          <strong>Algemene verordening gegevensbescherming (AVG)</strong>:
          regels voor het gebruik van persoonsgegevens
        </UnorderedListItem>
        <UnorderedListItem>
          <strong>Besluit digitale toegankelijkheid overheid</strong>: regels
          zodat iedereen overheidswebsites kan gebruiken
        </UnorderedListItem>
      </UnorderedList>
    </Section>

    <Section id="voor-uw-bedrijf" title="Wetten voor uw bedrijf">
      <Paragraph>
        Zoekt u wetten en regels die voor uw bedrijf gelden? Kijk na het
        inloggen bij <TextLink href="/wetten">Wetten en regelgeving</TextLink>.
      </Paragraph>
    </Section>
  </FooterArticle>
);

export default Content;

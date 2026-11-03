import { Paragraph, UnorderedList, UnorderedListItem } from "@/components/rhc";
import { ExternalLink, FooterArticle, Section, TextLink } from "../_article";

const Content = () => (
  <FooterArticle title="Privacyverklaring">
    <Paragraph>
      In deze privacyverklaring leest u welke gegevens wij gebruiken en waarom.
      Ook leest u welke rechten u hebt.
    </Paragraph>

    <Section id="waarvoor" title="Waarvoor wij uw gegevens gebruiken">
      <Paragraph>
        Wij gebruiken uw gegevens om u op één plek te laten zien wat de overheid
        over uw bedrijf weet. Bijvoorbeeld uw berichten, lopende zaken en
        bedrijfsgegevens. En om u op tijd te informeren over wat voor uw bedrijf
        belangrijk is.
      </Paragraph>
    </Section>

    <Section id="delen" title="Met wie wij uw gegevens delen">
      <Paragraph>
        Wij delen uw gegevens alleen met overheidsorganisaties, en alleen als
        dat nodig is. Bij{" "}
        <TextLink href="/dataverwerking">
          Gegevensdeling en dataverwerking
        </TextLink>{" "}
        ziet u welke organisatie welke gegevens gebruikt.
      </Paragraph>
    </Section>

    <Section id="rechten" title="Uw rechten">
      <Paragraph>
        Volgens de Algemene verordening gegevensbescherming (AVG) mag u:
      </Paragraph>
      <UnorderedList>
        <UnorderedListItem>uw gegevens inzien</UnorderedListItem>
        <UnorderedListItem>
          onjuiste gegevens laten verbeteren
        </UnorderedListItem>
        <UnorderedListItem>uw gegevens laten verwijderen</UnorderedListItem>
        <UnorderedListItem>
          bezwaar maken tegen het gebruik van uw gegevens
        </UnorderedListItem>
      </UnorderedList>
      <Paragraph>
        Wilt u een van deze rechten gebruiken? Neem dan contact op via{" "}
        <TextLink href="/contact">Contact</TextLink>.
      </Paragraph>
    </Section>

    <Section id="klacht" title="Een klacht over uw privacy">
      <Paragraph>
        Bent u het niet eens met hoe wij uw gegevens gebruiken? Dan kunt u een
        klacht indienen bij de{" "}
        <ExternalLink href="https://www.autoriteitpersoonsgegevens.nl/">
          Autoriteit Persoonsgegevens
        </ExternalLink>
        .
      </Paragraph>
    </Section>
  </FooterArticle>
);

export default Content;

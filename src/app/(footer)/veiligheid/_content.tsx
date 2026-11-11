import { Paragraph, UnorderedList, UnorderedListItem } from "@/components/rhc";
import { FooterArticle, Section, TextLink } from "../_article";

const Content = () => (
  <FooterArticle title="Veiligheid">
    <Section id="inloggen" title="Veilig inloggen">
      <Paragraph>
        U logt in met eHerkenning of DigiD. Wij vragen nooit om uw wachtwoord of
        inlogcodes. Niet in een e-mail, niet in een sms en niet aan de telefoon.
      </Paragraph>
    </Section>

    <Section id="verbinding" title="Veilige verbinding">
      <Paragraph>
        Het adres van deze website begint met https. Uw browser toont dan een
        slotje naast het adres. Zo weet u dat de verbinding beveiligd is.
      </Paragraph>
    </Section>

    <Section id="tips" title="Tips">
      <UnorderedList>
        <UnorderedListItem>
          Log uit als u klaar bent, zeker op een computer die u deelt
        </UnorderedListItem>
        <UnorderedListItem>
          Houd uw browser en computer bijgewerkt
        </UnorderedListItem>
        <UnorderedListItem>
          Deel uw inloggegevens met niemand, ook niet met collega’s
        </UnorderedListItem>
        <UnorderedListItem>
          Wilt u een collega toegang geven? Regel dat met een machtiging in
          eHerkenning
        </UnorderedListItem>
      </UnorderedList>
    </Section>

    <Section id="twijfel" title="Twijfelt u aan een bericht?">
      <Paragraph>
        Lees hoe u{" "}
        <TextLink href="/herken-oplichting">oplichting herkent</TextLink>.
      </Paragraph>
    </Section>
  </FooterArticle>
);

export default Content;

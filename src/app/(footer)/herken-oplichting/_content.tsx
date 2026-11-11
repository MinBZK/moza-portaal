import { Paragraph, UnorderedList, UnorderedListItem } from "@/components/rhc";
import { ExternalLink, FooterArticle, Section } from "../_article";

const Content = () => (
  <FooterArticle title="Herken oplichting">
    <Paragraph>
      Oplichters doen zich soms voor als de overheid. Ze sturen een e-mail of
      sms die echt lijkt. Zo herkent u een nepbericht.
    </Paragraph>

    <Section id="let-op" title="Hier let u op">
      <UnorderedList>
        <UnorderedListItem>
          De overheid vraagt nooit om uw wachtwoord of inlogcodes
        </UnorderedListItem>
        <UnorderedListItem>
          De overheid vraagt nooit om te betalen via een link in een e-mail of
          sms
        </UnorderedListItem>
        <UnorderedListItem>
          Een bericht dat haast maakt of dreigt, is vaak nep. Bijvoorbeeld “U
          moet binnen 24 uur betalen”
        </UnorderedListItem>
        <UnorderedListItem>
          Kijk goed naar het adres van de afzender en van de website
        </UnorderedListItem>
      </UnorderedList>
    </Section>

    <Section id="twijfel" title="Twijfelt u?">
      <Paragraph>
        Open de link dan niet. Ga zelf naar MijnOverheid Zakelijk en log in.
        Echte berichten van de overheid staan in uw berichtenbox.
      </Paragraph>
    </Section>

    <Section id="opgelicht" title="Bent u opgelicht?">
      <UnorderedList>
        <UnorderedListItem>
          Heeft u betaald? Neem dan meteen contact op met uw bank
        </UnorderedListItem>
        <UnorderedListItem>Doe aangifte bij de politie</UnorderedListItem>
        <UnorderedListItem>
          Meld het bij de{" "}
          <ExternalLink href="https://www.fraudehelpdesk.nl/">
            Fraudehelpdesk
          </ExternalLink>
        </UnorderedListItem>
      </UnorderedList>
    </Section>
  </FooterArticle>
);

export default Content;

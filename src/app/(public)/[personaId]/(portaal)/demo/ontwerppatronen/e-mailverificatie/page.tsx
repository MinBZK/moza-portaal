import type { Metadata } from "next";
import {
  Alert,
  Paragraph,
  UnorderedList,
  UnorderedListItem,
} from "@/components/rhc";
import {
  ExternalLink,
  PatternPage,
  PatternSection,
  PatternTable,
  Source,
} from "../_parts";

export const metadata: Metadata = {
  title: "E-mailverificatie - Ontwerppatronen",
};

/** A link in an example alert; it does not go anywhere. */
const ExampleLink = ({ children }: { children: string }) => (
  <a href="#" className="utrecht-link">
    {children}
  </a>
);

const Page = () => (
  <PatternPage title="E-mailverificatie">
    <Paragraph>
      Voegt een gebruiker een e-mailadres toe of wijzigt die het, dan moet het
      adres eerst bevestigd worden. Pas daarna is het actief. Dit patroon
      beschrijft wat er gebeurt als alles goed gaat (<i lang="en">happy flow</i>
      ) en als het misgaat (<i lang="en">unhappy flows</i>).
    </Paragraph>

    <PatternSection id="waarom" title="Waarom verificatie?">
      <Paragraph>
        Via het e-mailadres stuurt de overheid meldingen. Een fout of
        onbereikbaar adres kan betekenen dat de gebruiker belangrijke berichten
        mist. Verificatie beschermt de gebruiker en de organisatie.
      </Paragraph>
    </PatternSection>

    <PatternSection id="happy-flow" title="Als alles goed gaat">
      <Paragraph>
        De gebruiker wijzigt het e-mailadres en bevestigt het.
      </Paragraph>

      <PatternSection id="invoer" title="1. Invoer" level={3}>
        <Paragraph>
          De gebruiker vult een nieuw e-mailadres in via{" "}
          <strong>Contactgegevens wijzigen</strong> op de pagina{" "}
          <strong>Contactvoorkeuren</strong> en kiest <strong>Opslaan</strong>.
        </Paragraph>

        <PatternSection id="validatie" title="Controle bij invoer" level={4}>
          <UnorderedList>
            <UnorderedListItem>
              Formaat: bevat een <code>@</code> en een geldig domein met een{" "}
              <code>.</code>
            </UnorderedListItem>
            <UnorderedListItem>Anders dan het huidige adres</UnorderedListItem>
          </UnorderedList>
          <Paragraph>
            Toegestane tekens vóór de <code>@</code>:
          </Paragraph>
          <UnorderedList>
            <UnorderedListItem>
              Letters (<code>a</code> tot en met <code>z</code>) en cijfers (
              <code>0</code> tot en met <code>9</code>)
            </UnorderedListItem>
            <UnorderedListItem>
              Punt (<code>.</code>), koppelteken (<code>-</code>) en underscore
              (<code>_</code>)
            </UnorderedListItem>
            <UnorderedListItem>
              Plusteken (<code>+</code>), vaak gebruikt om te filteren,
              bijvoorbeeld <i>email+boekhouding@voorbeeld.nl</i>
            </UnorderedListItem>
          </UnorderedList>
          <Paragraph>
            Toegestane tekens in de domeinnaam, na de <code>@</code>:
          </Paragraph>
          <UnorderedList>
            <UnorderedListItem>
              Letters (<code>a</code> tot en met <code>z</code>) en cijfers (
              <code>0</code> tot en met <code>9</code>)
            </UnorderedListItem>
            <UnorderedListItem>
              Koppelteken (<code>-</code>), maar niet aan het begin of einde
            </UnorderedListItem>
            <UnorderedListItem>
              Punt (<code>.</code>) tussen delen van het domein, bijvoorbeeld{" "}
              <i>email@boekhouding.voorbeeld.nl</i>
            </UnorderedListItem>
          </UnorderedList>
        </PatternSection>

        <PatternSection
          id="wanneer-valideren"
          title="Wanneer controleren (reward early, punish late)"
          level={4}
        >
          <UnorderedList>
            <UnorderedListItem>
              Leeg veld: pas markeren bij opslaan, niet bij het verlaten van het
              veld
            </UnorderedListItem>
            <UnorderedListItem>
              Ongeldig formaat: controleren als de gebruiker het veld verlaat (
              <i lang="en">on blur</i>)
            </UnorderedListItem>
            <UnorderedListItem>
              Verbetert de gebruiker een fout, haal dan meteen de foutmelding en{" "}
              <code>aria-invalid</code> weg
            </UnorderedListItem>
            <UnorderedListItem>
              Nooit controleren terwijl de gebruiker nog typt
            </UnorderedListItem>
          </UnorderedList>
        </PatternSection>

        <PatternSection id="techniek" title="Technische uitwerking" level={4}>
          <UnorderedList>
            <UnorderedListItem>
              Het veld heeft <code>type=&quot;email&quot;</code>. Dat geeft
              onder meer het juiste toetsenbord op mobiel.
            </UnorderedListItem>
            <UnorderedListItem>
              <code>novalidate</code> op het formulier onderdrukt de meldingen
              van de browser.
            </UnorderedListItem>
            <UnorderedListItem>
              <code>autocomplete=&quot;email&quot;</code> en{" "}
              <code>spellcheck=&quot;false&quot;</code> op het veld, volgens{" "}
              <ExternalLink href="https://www.w3.org/WAI/WCAG22/Understanding/identify-input-purpose.html">
                WCAG 1.3.5 Identify Input Purpose
              </ExternalLink>
              .
            </UnorderedListItem>
            <UnorderedListItem>
              Verplichte velden krijgen{" "}
              <code>aria-required=&quot;true&quot;</code> in plaats van{" "}
              <code>required</code>.
            </UnorderedListItem>
            <UnorderedListItem>
              Foutmeldingen hangen met <code>aria-describedby</code> aan het
              veld.
            </UnorderedListItem>
            <UnorderedListItem>
              Bij een fout krijgt het veld{" "}
              <code>aria-invalid=&quot;true&quot;</code>. Dat verdwijnt zodra de
              gebruiker het adres aanpast.
            </UnorderedListItem>
          </UnorderedList>
        </PatternSection>
      </PatternSection>

      <PatternSection
        id="verstuurd"
        title="2. Bevestigingsmail verstuurd"
        level={3}
      >
        <Paragraph>
          Na <strong>Opslaan</strong> toont de pagina deze melding:
        </Paragraph>
        <Alert type="info">
          <Paragraph>
            Vul de verificatiecode in die wij hebben gestuurd naar{" "}
            <strong>email@voorbeeld.nl</strong>. Geen e-mail gekregen? Kijk in
            uw map met spam of{" "}
            <ExampleLink>vraag een nieuwe code aan</ExampleLink>.
          </Paragraph>
        </Alert>
        <UnorderedList>
          <UnorderedListItem>
            Het oude e-mailadres blijft actief tot het nieuwe is bevestigd
          </UnorderedListItem>
          <UnorderedListItem>
            Het veld E-mailadres wordt <code>readonly</code>
          </UnorderedListItem>
          <UnorderedListItem>De melding is van het type info</UnorderedListItem>
          <UnorderedListItem>
            “Verificatiemail opnieuw versturen” staat er als link-knop bij
          </UnorderedListItem>
        </UnorderedList>
      </PatternSection>

      <PatternSection id="voltooid" title="3. Verificatie voltooid" level={3}>
        <Paragraph>
          De gebruiker vult de code uit de e-mail in. Daarna komt die vanzelf
          terug op <strong>Contactvoorkeuren</strong>, met deze melding:
        </Paragraph>
        <Alert type="ok">
          <Paragraph>
            Uw e-mailadres is gewijzigd in <strong>nieuw@voorbeeld.nl</strong>.
            Wij sturen alle berichten voortaan naar dit adres.
          </Paragraph>
        </Alert>
        <UnorderedList>
          <UnorderedListItem>
            De melding is van het type succes
          </UnorderedListItem>
          <UnorderedListItem>
            Het nieuwe adres vervangt het oude meteen
          </UnorderedListItem>
          <UnorderedListItem>
            Contactvoorkeuren toont het nieuwe adres
          </UnorderedListItem>
        </UnorderedList>
      </PatternSection>
    </PatternSection>

    <PatternSection id="unhappy-flows" title="Als het misgaat">
      <PatternSection id="ongeldig" title="Ongeldig formaat" level={3}>
        <Paragraph>
          Het ingevulde adres heeft niet het verwachte formaat:
        </Paragraph>
        <Alert type="error">
          <Paragraph>
            Vul een geldig e-mailadres in, bijvoorbeeld email@voorbeeld.nl.
          </Paragraph>
        </Alert>
        <UnorderedList>
          <UnorderedListItem>
            Foutmelding direct onder het veld
          </UnorderedListItem>
          <UnorderedListItem>
            Het veld krijgt <code>aria-invalid=&quot;true&quot;</code> en
            daarmee de stijl voor een fout
          </UnorderedListItem>
          <UnorderedListItem>
            De melding verdwijnt zodra de gebruiker het adres verbetert (
            <i lang="en">reward early</i>)
          </UnorderedListItem>
          <UnorderedListItem>Het veld krijgt de focus</UnorderedListItem>
        </UnorderedList>
      </PatternSection>

      <PatternSection id="verlopen" title="Code verlopen" level={3}>
        <Paragraph>
          De code is 20 minuten geldig. Vult de gebruiker die later in, dan
          verschijnt deze melding:
        </Paragraph>
        <Alert type="warning">
          <Paragraph>
            Deze verificatiecode is verlopen.{" "}
            <ExampleLink>Vraag een nieuwe verificatiemail aan</ExampleLink>.
          </Paragraph>
        </Alert>
        <UnorderedList>
          <UnorderedListItem>
            De melding is van het type waarschuwing
          </UnorderedListItem>
          <UnorderedListItem>
            Met een link om meteen een nieuwe e-mail aan te vragen
          </UnorderedListItem>
          <UnorderedListItem>
            Het oude e-mailadres blijft actief
          </UnorderedListItem>
        </UnorderedList>
      </PatternSection>

      <PatternSection id="al-gebruikt" title="Code al gebruikt" level={3}>
        <Paragraph>De gebruiker vult dezelfde code nog een keer in:</Paragraph>
        <Alert type="info">
          <Paragraph>
            Dit e-mailadres is al bevestigd. U hoeft niets meer te doen.
          </Paragraph>
        </Alert>
        <UnorderedList>
          <UnorderedListItem>
            De melding is van het type info: geen fout, maar informatie
          </UnorderedListItem>
        </UnorderedList>
      </PatternSection>

      <PatternSection
        id="bounce"
        title="Ongeldig of onbereikbaar adres"
        level={3}
      >
        <Paragraph>
          De e-mail kan niet worden afgeleverd (<i lang="en">hard bounce</i>):
        </Paragraph>
        <Alert type="error">
          <Paragraph>
            Wij konden de verificatiemail niet afleveren bij nieuw@voorbeeld.nl.
            Controleer het e-mailadres en probeer het opnieuw.
          </Paragraph>
        </Alert>
        <UnorderedList>
          <UnorderedListItem>De melding is van het type fout</UnorderedListItem>
          <UnorderedListItem>
            Het formulier staat er weer, met het ingevulde adres
          </UnorderedListItem>
          <UnorderedListItem>
            Het veld krijgt <code>aria-invalid</code> en daarmee de stijl voor
            een fout
          </UnorderedListItem>
          <UnorderedListItem>
            <code>aria-invalid</code> verdwijnt zodra de gebruiker het adres
            aanpast: het nieuwe adres kan wel geldig zijn
          </UnorderedListItem>
          <UnorderedListItem>
            Het oude e-mailadres blijft actief
          </UnorderedListItem>
        </UnorderedList>
      </PatternSection>
    </PatternSection>

    <PatternSection id="staten" title="Overzicht van de staten">
      <PatternTable
        head={["Staat", "Soort melding", "Oud adres", "Actie"]}
        rows={[
          [
            "Verificatiemail verstuurd",
            "Info",
            "Actief",
            "Opnieuw versturen, Annuleren",
          ],
          [
            "Verificatie voltooid",
            "Succes",
            "Vervangen",
            <>
              Geen, de gebruiker gaat terug naar{" "}
              <strong>Contactvoorkeuren</strong>
            </>,
          ],
          [
            "Code verlopen",
            "Waarschuwing",
            "Actief",
            "Nieuwe e-mail aanvragen, de flow begint opnieuw",
          ],
          ["Code al gebruikt", "Info", "Vervangen", "Geen"],
          ["Onbereikbaar adres", "Fout", "Actief", "Opnieuw invullen"],
        ]}
      />
    </PatternSection>

    <PatternSection id="toegankelijkheid" title="Toegankelijkheid">
      <UnorderedList>
        <UnorderedListItem>
          Meldingen staan in een <code>aria-live=&quot;polite&quot;</code>
          -regio, zodat een schermlezer de nieuwe staat voorleest
        </UnorderedListItem>
        <UnorderedListItem>
          De e-mail zegt duidelijk wat er gebeurt: “
          <i>
            Bevestig uw e-mailadres voor MijnOverheid Zakelijk. Vul deze code in
            bij <strong>Verificatiecode</strong>.
          </i>
          ”
        </UnorderedListItem>
        <UnorderedListItem>
          Foutmeldingen hangen met <code>aria-describedby</code> aan het veld
        </UnorderedListItem>
        <UnorderedListItem>
          De knop <strong>Opnieuw versturen</strong> maakt na een klik de nieuwe
          staat bekend, niet alleen zichtbaar
        </UnorderedListItem>
      </UnorderedList>
    </PatternSection>

    <PatternSection id="open-vragen" title="Openstaande vragen">
      <UnorderedList>
        <UnorderedListItem>
          <strong>Geldigheid</strong>: hoe lang is de code geldig? In het
          prototype is dat nu 20 minuten.
        </UnorderedListItem>
        <UnorderedListItem>
          <strong>Gedeelde mailbox</strong>: wie bevestigt bij een gedeelde
          mailbox van het bedrijf? Dat hoeft niet dezelfde persoon te zijn die
          het adres wijzigde.
        </UnorderedListItem>
        <UnorderedListItem>
          <strong>Alternatief</strong>: is er een andere manier om te bevestigen
          als e-mail niet werkt, bijvoorbeeld een sms-code?
        </UnorderedListItem>
      </UnorderedList>
    </PatternSection>

    <PatternSection id="bronnen" title="Bronnen">
      <Source
        href="https://design-system.service.gov.uk/patterns/confirm-an-email-address/"
        title="GOV.UK: Confirm an email address"
      >
        <Paragraph>
          Het Britse patroon voor e-mailverificatie, met dezelfde stappen:
          invoer, e-mail, verificatie. Houd het oude adres actief tot de
          verificatie klaar is. Een link verloopt na gebruik, bij een nieuwe
          aanvraag of als het adres verandert.
        </Paragraph>
      </Source>
      <Source
        href="https://design-system.service.gov.uk/patterns/email-addresses/"
        title="GOV.UK: Email addresses"
      >
        <Paragraph>
          Richtlijnen voor het veld: <code>type=&quot;email&quot;</code>,{" "}
          <code>autocomplete=&quot;email&quot;</code> (WCAG 1.3.5) en{" "}
          <code>spellcheck=&quot;false&quot;</code>. Maak ruimte voor minstens
          30 tekens. Sta plakken altijd toe. Waarschuw eventueel bij
          veelvoorkomende typfouten in domeinnamen, zoals “homtail.com”.
        </Paragraph>
      </Source>
      <Source
        href="https://www.nngroup.com/articles/errors-forms-design-guidelines/"
        title="How to Report Errors in Forms"
        by="Nielsen Norman Group"
      >
        <Paragraph>
          Toon een foutmelding bij het veld, niet alleen bovenaan het formulier.
          Gebruik kleur én een icoon. Laat de melding staan terwijl de gebruiker
          verbetert. Controleer na het verlaten van het veld, nooit tijdens het
          typen.
        </Paragraph>
      </Source>
      <Source
        href="https://www.smashingmagazine.com/2023/02/guide-accessible-form-validation/"
        title="A Guide To Accessible Form Validation"
        by="Smashing Magazine"
      >
        <Paragraph>
          Koppel foutmeldingen met <code>aria-describedby</code>, niet met{" "}
          <code>aria-errormessage</code>: schermlezers ondersteunen dat te
          slecht. Zet <code>aria-invalid=&quot;true&quot;</code> op foute
          velden. Onderdruk de controle van de browser met{" "}
          <code>novalidate</code> en gebruik{" "}
          <code>aria-required=&quot;true&quot;</code> in plaats van{" "}
          <code>required</code>. Schakel de verstuurknop nooit uit.
        </Paragraph>
      </Source>
      <Source
        href="https://www.smashingmagazine.com/2022/09/inline-validation-web-forms-ux/"
        title="Inline Validation in Web Forms"
        by="Smashing Magazine"
      >
        <Paragraph>
          “Reward early, punish late”: bevestig een verbetering meteen, maar
          toon een nieuwe fout pas als de gebruiker het veld verlaat. Haal een
          foutmelding weg zodra de invoer klopt; wacht daarvoor niet tot het
          veld wordt verlaten.
        </Paragraph>
      </Source>
      <Source
        href="https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html"
        title="WCAG 3.3.1 Error Identification"
      >
        <Paragraph>
          Een foutmelding noemt het veld en beschrijft de fout in tekst.
        </Paragraph>
      </Source>
      <Source
        href="https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html"
        title="WCAG 4.1.3 Status Messages"
      >
        <Paragraph>
          Een statusmelding, zoals “Verificatiemail verstuurd”, moet via een
          live region bij hulpsoftware aankomen, zonder dat de focus verspringt.
        </Paragraph>
      </Source>
    </PatternSection>
  </PatternPage>
);

export default Page;

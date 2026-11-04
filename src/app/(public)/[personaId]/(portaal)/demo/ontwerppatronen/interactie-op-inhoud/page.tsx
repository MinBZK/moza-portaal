import type { Metadata } from "next";
import { Paragraph, UnorderedList, UnorderedListItem } from "@/components/rhc";
import { PatternPage, PatternSection, PatternTable, Source } from "../_parts";

export const metadata: Metadata = {
  title: "Interactie op inhoud - Ontwerppatronen",
};

const Page = () => (
  <PatternPage title="Interactie op inhoud">
    <Paragraph>
      Dit patroon voedt een aanbevelingssysteem voor gepersonaliseerde inhoud (
      <i lang="en">recommendation engine</i>).
    </Paragraph>
    <Paragraph>
      Gebruikers reageren op inhoud, zoals bij Actualiteiten. Zo ontstaat stap
      voor stap een eigen profiel van de persoon en de onderneming.
    </Paragraph>
    <Paragraph>
      Elke interactie is een signaal dat positief of negatief meeweegt in dat
      profiel. Positieve signalen zijn <strong>Bewaren</strong>,{" "}
      <strong>Herinner mij</strong>, <strong>Al geregeld</strong>,{" "}
      <strong>Delen</strong>, <strong>Relevant</strong> en{" "}
      <strong>Meer zoals dit</strong>. <strong>Niet relevant voor mij</strong>{" "}
      is een negatief signaal.
    </Paragraph>

    <PatternSection id="signalen" title="Signalen">
      <PatternTable
        head={["Signaal", "Type", "Beschrijving"]}
        rows={[
          [
            "Bewaren",
            "Positief",
            "De gebruiker bewaart een item voor later. Sterk signaal van relevantie.",
          ],
          [
            "Herinner mij",
            "Positief",
            "De gebruiker wil later iets doen. Signaleert een voornemen.",
          ],
          [
            "Al geregeld",
            "Positief",
            "De gebruiker heeft het geregeld. Laat zien waar iemand echt mee bezig is.",
          ],
          [
            "Delen",
            "Positief",
            "De gebruiker deelt het item met anderen. Wat iemand deelt, vindt die belangrijk genoeg voor anderen.",
          ],
          [
            "Relevant",
            "Positief",
            <>
              Sterk signaal: “<i>dit soort inhoud is relevant voor mij</i>”.
            </>,
          ],
          [
            "Meer zoals dit",
            "Positief",
            "Verfijnt het profiel, zonder dat de gebruiker een lange lijst bewaarde items opbouwt.",
          ],
          [
            "Niet relevant voor mij",
            "Negatief",
            "Het item is niet van toepassing. Weegt negatief mee in het profiel.",
          ],
        ]}
      />
    </PatternSection>

    <PatternSection id="hoe-het-werkt" title="Hoe het werkt">
      <Paragraph>
        Elk signaal heeft een <strong>gewicht</strong> dat positief of negatief
        meeweegt in het profiel. Door interactie met inhoud ontstaat na verloop
        van tijd een steeds beter beeld van wat relevant is voor de gebruiker of
        de onderneming.
      </Paragraph>
      <Paragraph>
        De signalen zijn in te zien en te beheren op de pagina{" "}
        <strong>Bewaarde items</strong>. Daar kan de gebruiker bewaarde items
        verwijderen en niet-relevante items weer zichtbaar maken. Ook dat telt
        mee: een verwijderd item corrigeert het profiel, net als een
        niet-relevant item dat terug wordt gezet.
      </Paragraph>
    </PatternSection>

    <PatternSection id="transparantie" title="Transparantie">
      <Paragraph>
        De gebruiker ziet altijd welke signalen zijn vastgelegd en kan ze
        aanpassen of verwijderen. Overheidsorganisaties krijgen de signalen
        niet. Ze dienen alleen om de gebruiker relevantere inhoud te tonen.
      </Paragraph>
    </PatternSection>

    <PatternSection id="bronnen" title="Bronnen">
      <PatternSection
        id="bronnen-personalisatie"
        title="Personalisatie en aanbevelingen"
        level={3}
      >
        <Source
          href="https://www.nngroup.com/articles/recommendation-guidelines/"
          title="UX Guidelines for Recommended Content"
          by="Nielsen Norman Group"
        >
          <UnorderedList>
            <UnorderedListItem>
              Toon gepersonaliseerde actualiteiten prominent, boven algemene
              inhoud. In MOZa krijgen Actualiteiten op de homepage voorrang
              naarmate het profiel rijker wordt.
            </UnorderedListItem>
            <UnorderedListItem>
              Leg uit <i>waarom</i> iets wordt getoond: “Op basis van uw
              branche” of “Relevant voor uw vestigingsadres”. Actualiteiten zijn
              nu al opgedeeld in berichten, subsidies en regelgeving.
            </UnorderedListItem>
            <UnorderedListItem>
              Bied bij elk item directe feedback aan (bewaren, relevant, niet
              relevant).
            </UnorderedListItem>
            <UnorderedListItem>
              Werk aanbevelingen snel bij: kiest een gebruiker “Niet relevant
              voor mij”, dan moet dat direct effect hebben.
            </UnorderedListItem>
          </UnorderedList>
        </Source>
        <Source
          href="https://www.nngroup.com/articles/customization-personalization/"
          title="Customization vs. Personalization"
          by="Nielsen Norman Group"
        >
          <UnorderedList>
            <UnorderedListItem>
              MOZa combineert <strong>personalisatie</strong> (het systeem
              filtert op KVK-gegevens, SBI-code en vestigingsadres) en{" "}
              <strong>customisatie</strong> (de gebruiker stuurt bij door te
              bewaren, iets als relevant of niet relevant aan te merken, of te
              delen).
            </UnorderedListItem>
            <UnorderedListItem>
              Personalisatie werkt het best als gebruikers niet precies weten
              wat ze nodig hebben. Dat geldt voor ondernemers die niet alle
              subsidies of regels kennen die voor hen gelden.
            </UnorderedListItem>
          </UnorderedList>
        </Source>
        <Source
          href="https://www.nngroup.com/articles/recommendation-expectations/"
          title="Users’ Expectations for Recommendations"
          by="Nielsen Norman Group"
        >
          <UnorderedList>
            <UnorderedListItem>
              Gebruikers vinden het goed dat hun gedrag wordt bijgehouden als de
              aanbevelingen duidelijke waarde hebben. Bij MOZa is die waarde
              concreet: relevante subsidies, regels en berichten over de buurt
              van vestigingen of werkgebieden.
            </UnorderedListItem>
            <UnorderedListItem>
              Bij diensten met grotere gevolgen (subsidies, regelgeving) geven
              gebruikers eerder feedback.
            </UnorderedListItem>
            <UnorderedListItem>
              Nieuwe gebruikers vergeven onnauwkeurige aanbevelingen, omdat er
              nog weinig gegevens zijn. Het profiel hoeft niet meteen perfect te
              zijn.
            </UnorderedListItem>
            <UnorderedListItem>
              Slechte suggesties zijn makkelijk te negeren als reageren weinig
              moeite kost. De knop “Niet relevant voor mij” moet dus
              laagdrempelig blijven.
            </UnorderedListItem>
          </UnorderedList>
        </Source>
        <Source
          href="https://www.nngroup.com/articles/machine-learning-ux/"
          title="Can Users Control a UI Driven by ML?"
          by="Nielsen Norman Group"
        >
          <UnorderedList>
            <UnorderedListItem>
              Gebruikers begrijpen slecht welke acties het systeem beïnvloeden.
              MOZa moet duidelijk maken dat Bewaren, Relevant en Niet relevant
              voor mij het profiel vormen.
            </UnorderedListItem>
            <UnorderedListItem>
              Onduidelijkheid leidt tot wantrouwen: gebruikers denken dan dat er
              meer gegevens worden verzameld dan echt zo is. Voor een
              overheidsportaal is dat extra riskant.
            </UnorderedListItem>
            <UnorderedListItem>
              Maak feedbackknoppen goed zichtbaar, in verhouding tot de
              hoeveelheid inhoud. Bij MOZa staan de acties direct onder elk
              item.
            </UnorderedListItem>
          </UnorderedList>
        </Source>
      </PatternSection>

      <PatternSection id="bronnen-patronen" title="Ontwerppatronen" level={3}>
        <Source
          href="https://ui-patterns.com/patterns/favorites"
          title="Favorites"
          by="ui-patterns.com"
        >
          <UnorderedList>
            <UnorderedListItem>
              Favorieten zijn voor <strong>persoonlijke organisatie</strong>,
              niet om iets aan anderen aan te raden. In MOZa is Bewaren privé en
              helpt het om steeds relevantere inhoud te tonen.
            </UnorderedListItem>
            <UnorderedListItem>
              Bied een aparte lijst met bewaarde items aan. De pagina Bewaarde
              items heeft die rol.
            </UnorderedListItem>
          </UnorderedList>
        </Source>
        <Source
          href="https://dorve.com/blog/like-vs-bookmarks-vs-favorites/"
          title="Bookmarks vs. Favorites vs. Social Validation"
        >
          <UnorderedList>
            <UnorderedListItem>
              <strong>Bewaren</strong> is in MOZa een bladwijzer: privé, voor
              later, “<i>voor het geval dat</i>”.
            </UnorderedListItem>
            <UnorderedListItem>
              <strong>Relevant</strong> en <strong>Niet relevant</strong> zijn
              een oordeel: een signaal over bruikbaarheid, niet over bewaren.
            </UnorderedListItem>
            <UnorderedListItem>
              <strong>Delen</strong> is een sociaal patroon: iets doorgeven aan
              een collega, werknemer of andere betrokkene.
            </UnorderedListItem>
            <UnorderedListItem>
              Elk patroon draagt anders bij aan het profiel. Bewaren laat
              interesses zien, een oordeel stuurt aanbevelingen bij, delen laat
              zien wat iemand belangrijk genoeg vindt voor anderen.
            </UnorderedListItem>
            <UnorderedListItem>
              Combineer deze patronen niet in één knop. MOZa houdt ze terecht
              apart.
            </UnorderedListItem>
          </UnorderedList>
        </Source>
      </PatternSection>

      <PatternSection
        id="bronnen-feedback"
        title="Impliciete en expliciete feedback"
        level={3}
      >
        <Source
          href="https://arxiv.org/abs/2502.09869"
          title="Beyond Explicit and Implicit"
          by="CHI 2025"
        >
          <UnorderedList>
            <UnorderedListItem>
              Naast expliciete feedback (Bewaren, Relevant, Niet relevant voor
              mij) en impliciete feedback (klikgedrag, leestijd) bestaat een
              derde soort: <strong>bewuste impliciete feedback</strong>. Dat
              zijn bewuste acties zonder feedbackknop, zoals doelbewust voorbij
              een item scrollen.
            </UnorderedListItem>
            <UnorderedListItem>
              Gebruikers geven vooral expliciete feedback om de lijst aan te
              passen. Dat doen de knoppen Relevant en Niet relevant in MOZa.
            </UnorderedListItem>
            <UnorderedListItem>
              Aanbeveling: opent een gebruiker bewust een soort subsidie die
              niet bij het profiel past, dan kan dat een signaal zijn om het
              profiel te verbreden.
            </UnorderedListItem>
          </UnorderedList>
        </Source>
      </PatternSection>

      <PatternSection id="bronnen-overheid" title="Overheid" level={3}>
        <Source
          href="https://design-system.service.gov.uk/patterns/"
          title="GOV.UK Design System: Patterns"
        >
          <UnorderedList>
            <UnorderedListItem>
              Patronen zijn “
              <i lang="en">
                best practice design solutions for specific user-focused tasks
              </i>
              ”, een niveau boven componenten.
            </UnorderedListItem>
            <UnorderedListItem>
              GOV.UK ordent patronen naar taken van gebruikers: “Help users to…”
              en “Ask users for…”. Dit patroon past bij “Help users to discover
              relevant content”.
            </UnorderedListItem>
          </UnorderedList>
        </Source>
      </PatternSection>
    </PatternSection>
  </PatternPage>
);

export default Page;

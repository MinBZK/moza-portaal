import { AccordionProvider, Paragraph } from "@/components/rhc";
import { FooterArticle } from "../_article";

const QUESTIONS = [
  {
    question: "Wat is MijnOverheid Zakelijk?",
    answer:
      "MijnOverheid Zakelijk is de website waar u als ondernemer zaken doet met de overheid. U ziet op één plek uw berichten, lopende zaken en bedrijfsgegevens.",
  },
  {
    question: "Hoe log ik in?",
    answer:
      "U logt in met eHerkenning of DigiD. Kies op de startpagina hoe u wilt inloggen.",
  },
  {
    question: "Welke berichten staan in mijn berichtenbox?",
    answer:
      "In uw berichtenbox staan berichten van overheidsorganisaties die zijn aangesloten op MijnOverheid Zakelijk.",
  },
  {
    question: "Ik heb een vraag over een bericht. Wat moet ik doen?",
    answer:
      "Neem contact op met de organisatie die het bericht stuurde. Hun contactgegevens staan in het bericht.",
  },
  {
    question: "Mijn bedrijfsgegevens kloppen niet. Wat moet ik doen?",
    answer:
      "Geef wijzigingen in uw bedrijfsgegevens door aan de KVK. Daarna ziet u de nieuwe gegevens ook in MijnOverheid Zakelijk.",
  },
  {
    question: "Wie ziet mijn gegevens?",
    answer:
      "Alleen u en de mensen die u toegang geeft. Overheidsorganisaties gebruiken uw gegevens alleen als dat nodig is. Meer leest u in de privacyverklaring.",
  },
];

const Content = () => (
  <FooterArticle title="Veelgestelde vragen">
    <div className="mox-faq-card">
      <AccordionProvider
        headingLevel={2}
        sections={QUESTIONS.map(({ question, answer }) => ({
          label: question,
          body: <Paragraph>{answer}</Paragraph>,
        }))}
      />
    </div>
  </FooterArticle>
);

export default Content;

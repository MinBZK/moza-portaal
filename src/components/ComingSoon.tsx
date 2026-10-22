import {
  Heading,
  Paragraph,
  Alert,
  UnorderedList,
  UnorderedListItem,
  AccordionProvider,
} from "@/components/rhc";

export type Question = { question: string; answer: string };

/**
 * Page content for a section that does not work yet: what it will be, when
 * it arrives and answers to frequently asked questions.
 */
const ComingSoon = ({
  title,
  summary,
  availableFrom,
  expectations,
  questions,
}: {
  title: string;
  summary: string;
  availableFrom: string;
  expectations: string[];
  questions: Question[];
}) => (
  <>
    <Heading level={1}>{title}</Heading>

    <Alert type="info">
      <Heading level={2}>Binnenkort beschikbaar: {availableFrom}</Heading>
      <Paragraph>{summary}</Paragraph>
    </Alert>

    <div className="mox-card">
      <Heading level={2}>Wat kunt u straks doen?</Heading>
      <UnorderedList>
        {expectations.map((expectation) => (
          <UnorderedListItem key={expectation}>{expectation}</UnorderedListItem>
        ))}
      </UnorderedList>
    </div>

    <Heading level={2}>Veelgestelde vragen</Heading>
    <div className="mox-faq-card">
      <AccordionProvider
        sections={questions.map(({ question, answer }) => ({
          label: question,
          body: <Paragraph>{answer}</Paragraph>,
        }))}
      />
    </div>
  </>
);

export default ComingSoon;

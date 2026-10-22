import { Heading, Paragraph, AccordionProvider } from "@/components/rhc";
import Link from "next/link";
import {
  getDemoContactorganisaties,
  getDemoContactvragen,
  getDemoProfielIdentiteit,
} from "@/demo";
import Contactgegevens from "./_contactgegevens";
import Organisaties from "./_organisaties";
import Kanalen from "./_kanalen";

const tabs = [
  { soort: "zakelijk", label: "Zakelijk", href: "/contactvoorkeuren" },
  { soort: "prive", label: "Privé", href: "/contactvoorkeuren/prive" },
] as const;

/** Contactvoorkeuren, met de contactgegevens zakelijk of privé. */
const ContactvoorkeurenPagina = async ({
  soort,
}: {
  soort: "zakelijk" | "prive";
}) => {
  const [identiteit, zakelijk, organisaties, vragen] = await Promise.all([
    getDemoProfielIdentiteit(soort),
    // Communicatiekanalen horen bij de onderneming.
    getDemoProfielIdentiteit("zakelijk"),
    getDemoContactorganisaties(),
    getDemoContactvragen(),
  ]);

  return (
    <>
      <Heading level={1}>Contactvoorkeuren</Heading>
      <Paragraph>
        Uw contactgegevens en de organisaties die deze mogen gebruiken.
      </Paragraph>
      <section
        className="mox-card rhc-row-gap"
        aria-labelledby="contactgegevens"
      >
        <Heading level={2} id="contactgegevens">
          Contactgegevens
        </Heading>
        <Paragraph>
          Uw contactgegevens bij organisaties waarmee u uw gegevens centraal
          deelt. U kunt ze hier direct aanpassen.
        </Paragraph>
        <nav aria-label="Soort contactgegevens">
          <ul className="rhc-tabs">
            {tabs.map((tab) => (
              <li key={tab.soort}>
                <Link
                  href={tab.href}
                  aria-current={tab.soort === soort ? "page" : undefined}
                  className="mox-tab utrecht-link utrecht-link--html-a"
                >
                  {tab.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <Contactgegevens {...identiteit} />
      </section>

      <div className="mox-card">
        <Heading level={2}>Aangesloten organisaties</Heading>
        <Organisaties organisaties={organisaties} />
      </div>

      <div className="mox-card">
        <Heading level={2}>Hoe nemen organisaties contact op?</Heading>
        <Paragraph>
          Hoe wilt u dat overheidsorganisaties standaard contact met u opnemen
          als dat nodig is?
        </Paragraph>
        <Kanalen {...zakelijk} />
      </div>

      <Heading level={2}>Veelgestelde vragen</Heading>
      <div className="mox-faq-card">
        <AccordionProvider
          headingLevel={3}
          sections={vragen.map(({ vraag, antwoord }) => ({
            label: vraag,
            body: <Paragraph>{antwoord}</Paragraph>,
          }))}
        />
      </div>
    </>
  );
};

export default ContactvoorkeurenPagina;

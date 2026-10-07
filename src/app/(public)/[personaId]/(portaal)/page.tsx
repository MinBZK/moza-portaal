import Link from "next/link";
import {
  AccordionProvider,
  ActionGroup,
  Heading,
  Paragraph,
} from "@/components/rhc";
import {
  getDemoBerichten,
  getDemoPersona,
  getDemoSubsidies,
  getDemoWetten,
} from "@/demo";
import RecenteBerichten from "./_recenteBerichten";

const knopLink =
  "utrecht-button-link utrecht-button-link--html-a utrecht-button-link--primary-action";

const vragen = [
  {
    vraag: "Hoe vraag ik een subsidie aan via MijnOverheid Zakelijk?",
    antwoord:
      "Via MijnOverheid Zakelijk vindt u een overzicht van subsidies. De aanvraag doet u bij de organisatie die de subsidie geeft, zoals RVO of uw gemeente. Bij elke subsidie staat een link naar de aanvraagpagina.",
  },
  {
    vraag: "Welk betrouwbaarheidsniveau van DigiD heb ik nodig?",
    antwoord:
      "Voor de meeste diensten op MijnOverheid Zakelijk heeft u minimaal DigiD Midden nodig. Kijk bij de dienst of een hoger niveau nodig is.",
  },
  {
    vraag: "Waar vind ik berichten van mijn gemeente?",
    antwoord:
      "Officiële bekendmakingen en besluiten over de buurt van uw vestigingsadres vindt u bij Berichten over uw buurt in het menu.",
  },
];

const HomePage = async ({
  params,
}: {
  params: Promise<{ personaId: string }>;
}) => {
  const persona = await getDemoPersona((await params).personaId);
  const [berichten, subsidies, wetten] = await Promise.all([
    getDemoBerichten(persona?.id),
    getDemoSubsidies(persona?.homepageSubsidies),
    getDemoWetten(persona?.homepageRegelgeving),
  ]);

  return (
    <>
      <Heading level={1}>
        Welkom {persona?.persoon.voornaam} {persona?.persoon.achternaam}
      </Heading>

      <section className="mox-card" aria-labelledby="recente-berichten">
        <Heading level={2} id="recente-berichten">
          Recente berichten
        </Heading>
        <RecenteBerichten berichten={berichten} />
        <ActionGroup>
          <Link href="/berichtenbox" className={knopLink}>
            Ga naar uw zakelijke berichtenbox
          </Link>
        </ActionGroup>
      </section>

      <div className="rhc-grid">
        <section
          className="mox-card rhc-grid__cell rhc-grid__cell-t-6"
          aria-labelledby="home-subsidies"
        >
          <Heading level={2} id="home-subsidies">
            Subsidies en financiering
          </Heading>
          <Paragraph>
            {subsidies.length === 1
              ? "Er is 1 nieuwe subsidie of financiering die interessant kan zijn voor uw bedrijf."
              : `Er zijn ${subsidies.length} nieuwe subsidies en financieringen die interessant kunnen zijn voor uw bedrijf.`}
          </Paragraph>
          <ActionGroup>
            <Link href="/subsidies" className={knopLink}>
              Ga naar Subsidies en financiering
            </Link>
          </ActionGroup>
        </section>

        <section
          className="mox-card rhc-grid__cell rhc-grid__cell-t-6"
          aria-labelledby="home-wetten"
        >
          <Heading level={2} id="home-wetten">
            Wetten en regelgeving
          </Heading>
          <Paragraph>
            {wetten.length === 1
              ? "Er is 1 nieuwe of gewijzigde regel die misschien voor uw bedrijf geldt."
              : `Er zijn ${wetten.length} nieuwe of gewijzigde regels die misschien voor uw bedrijf gelden.`}
          </Paragraph>
          <ActionGroup>
            <Link href="/wetten" className={knopLink}>
              Ga naar Wetten en regelgeving
            </Link>
          </ActionGroup>
        </section>
      </div>

      <Heading level={2}>Veelgestelde vragen</Heading>
      <AccordionProvider
        sections={vragen.map(({ vraag, antwoord }) => ({
          label: vraag,
          body: <Paragraph>{antwoord}</Paragraph>,
        }))}
      />
    </>
  );
};

export default HomePage;

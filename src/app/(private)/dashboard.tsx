import {
  AccordionProvider,
  ActionGroup,
  Alert,
  Heading,
  Icon,
  Paragraph,
  Table,
  TableBody,
} from "@/components/rhc";
import profielClient from "@/network/profiel";
import { getKvkFromCookie } from "@/utils/kvknummer";
import { BerichtenboxTableRow } from "@/app/(private)/berichtenbox/[status]/page";
import Link from "next/link";

const accordionSections = [
  {
    label: "Wat is MijnOverheid Zakelijk?",
    body: (
      <Paragraph>
        MijnOverheid Zakelijk is uw centrale platform voor het veilig en
        efficiënt beheren van zakelijke overheidszaken. Alles op één plek,
        speciaal afgestemd op de behoeften van de zakelijke gebruiker.
      </Paragraph>
    ),
  },
  {
    label: "Wat kan ik doen via MijnOverheid Zakelijk?",
    body: (
      <Paragraph>
        Van het ontvangen van berichten van overheidsinstanties tot het
        raadplegen van digitale post en het regelen van lopende zaken:
        MijnOverheid Zakelijk biedt overzicht, gemak en betrouwbaarheid.
      </Paragraph>
    ),
  },
  {
    label: "Voor wie is MijnOverheid Zakelijk bedoeld?",
    body: (
      <>
        <Paragraph>
          Of u nu ondernemer bent, een organisatie vertegenwoordigt of als
          intermediair optreedt — via dit portaal heeft u altijd en overal
          inzicht in belangrijke overheidscommunicatie.
        </Paragraph>
        <AccordionProvider
          headingLevel={3}
          sections={[
            {
              label: "Child accordion",
              body: (
                <AccordionProvider
                  headingLevel={4}
                  sections={[
                    {
                      label: "Deeper child accordion",
                      body: <Paragraph>Some child content</Paragraph>,
                    },
                  ]}
                />
              ),
            },
          ]}
        />
      </>
    ),
  },
] satisfies Array<{ label: string; body: React.ReactNode }>;

const Dashboard = async () => {
  const kvk = await getKvkFromCookie();

  const { data, response } = await profielClient.POST(
    "/api/profielservice/v1/partij",
    {
      body: { identificatieType: "KVK", identificatieNummer: kvk! },
    },
  );

  return (
    <>
      {(response.status === 404 ||
        (response.status === 200 &&
          data?.contactgegevens?.filter((x) => x.type === "Email").length ===
            0)) && (
        <Alert type="warning">
          <Heading level={2}>E-mailadres nog niet gekoppeld</Heading>
          <Paragraph>
            U heeft nog geen zakelijk e-mailadres opgenomen in uw
            contactgegevens. Ga naar het tabblad contactgegevens en vul hier uw
            zakelijke e-mailadres in, zo weten wij hoe we uw organisatie kunnen
            bereiken met belangrijke berichten en updates.
          </Paragraph>
        </Alert>
      )}

      <Heading level={1}>Welkom gemachtigde voor KVK-nummer {kvk}</Heading>
      <div className="mox-card">
        <Heading level={2}>Recente berichten in uw Berichtenbox</Heading>
        <div className="mox-table-container">
          <Table>
            <TableBody>
              <BerichtenboxTableRow index={0} />
              <BerichtenboxTableRow index={1} />
            </TableBody>
          </Table>
        </div>
        <ActionGroup>
          <Link
            href="/berichtenbox/inbox"
            className="utrecht-button-link utrecht-button-link--html-a utrecht-button-link--primary-action"
          >
            Naar uw berichtenbox
            <Icon icon="chevron-right" />
          </Link>
        </ActionGroup>
      </div>
      <div className="mox-card">
        <Heading level={2}>Wat is MijnOverheid Zakelijk?</Heading>
        <Paragraph>
          MijnOverheid Zakelijk is uw centrale platform voor het veilig en
          efficiënt beheren van zakelijke overheidszaken. Of u nu ondernemer
          bent, een organisatie vertegenwoordigt of als intermediair optreedt —
          via dit portaal heeft u altijd en overal inzicht in belangrijke
          overheidscommunicatie. <br />
          Van het ontvangen van berichten van overheidsinstanties tot het
          raadplegen van digitale post en het regelen van lopende zaken:
          MijnOverheid Zakelijk biedt overzicht, gemak en betrouwbaarheid. Alles
          op één plek, speciaal afgestemd op de behoeften van de zakelijke
          gebruiker. <br />
          Maak uw administratie eenvoudiger, werk efficiënter samen met de
          overheid en houd grip op uw verplichtingen.
        </Paragraph>
        <AccordionProvider headingLevel={2} sections={accordionSections} />
      </div>
    </>
  );
};

export default Dashboard;

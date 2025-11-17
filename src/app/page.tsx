import {
  Alert,
  Button,
  Card,
  Heading,
  Paragraph,
} from "@/components/nl-design-system";
import { IconText } from "@/components/iconText";
import ChevronIcon from "@/components/icons/chevronIcon";
import profielClient from "@/network/profiel";
import { getKvkFromCookie } from "@/utils/kvknummer";
import { BerichtenboxTableRow } from "@/components/BerichtenboxTableRow";
import {
  AccordionProvider,
  AccordionProps,
} from "@/components/nl-design-system/clientComponents/AccordionProvider.client";
import { InlineLink } from "@/components/nl-design-system/nextIntegration/InlineLink";

const accordionSections: AccordionProps["sections"] = [
  {
    label: "Wat is MijnOverheidZakelijk?",
    body: (
      <p>
        MijnOverheidZakelijk is uw centrale platform voor het veilig en
        efficiënt beheren van zakelijke overheidszaken. Alles op één plek,
        speciaal afgestemd op de behoeften van de zakelijke gebruiker.
      </p>
    ),
  },
  {
    label: "Wat kan ik doen via MijnOverheidZakelijk?",
    body: (
      <p>
        Van het ontvangen van berichten van overheidsinstanties tot het
        raadplegen van digitale post en het regelen van lopende zaken:
        MijnOverheidZakelijk biedt overzicht, gemak en betrouwbaarheid.
      </p>
    ),
  },
  {
    label: "Voor wie is MijnOverheidZakelijk bedoeld?",
    body: (
      <div className="fle-col flex gap-4">
        <p>
          Of u nu ondernemer bent, een organisatie vertegenwoordigt of als
          intermediair optreedt — via dit portaal heeft u altijd en overal
          inzicht in belangrijke overheidscommunicatie.
        </p>
        <AccordionProvider
          sections={[
            {
              label: "Child accordion",
              body: (
                <AccordionProvider
                  sections={[
                    {
                      label: "Deeper child accordion",
                      body: <p>Some child content </p>,
                    },
                  ]}
                  headingLevel={4}
                />
              ),
            },
          ]}
          headingLevel={3}
        />
      </div>
    ),
  },
] as const satisfies Array<{ label: string; body: React.ReactNode }>;

const Home = async () => {
  const kvk = await getKvkFromCookie();
  const { data, response } = await profielClient.GET(
    "/ondernemingen/EmailBekend/{kvkNummer}",
    {
      params: { path: { kvkNummer: kvk! } },
    },
  );

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-12 w-full space-y-6 md:col-span-9">
        {response.status != 200 ? (
          <Alert type="error">
            <Heading level={2} appearanceLevel={3}>
              Er ging iets fout
            </Heading>
            <Paragraph>
              Er is een probleem met een achter liggend system
            </Paragraph>
          </Alert>
        ) : (
          !data && (
            <Alert type="warning">
              <Heading level={2} appearanceLevel={3}>
                E-mailadres nog niet gekoppeld
              </Heading>
              <Paragraph>
                {
                  "Uw bedrijf heeft nog geen e-mailadres gekoppeld aan het bedrijfsprofiel. \nGa naar het tabblad Bedrijfsprofiel en vul hier het e-mailadres in.\n Zo weten wij hoe we uw organisatie kunnen bereiken met belangrijke berichten en updates."
                }
              </Paragraph>
            </Alert>
          )
        )}

        <h1 className="text-h1">
          <span>{"Welkom gemachtigde voor KVK nummer: "}</span>
          <span className="font-bold">{kvk}</span>
        </h1>
        <Card
          heading={"Recente berichten in uw Berichtenbox"}
          className="flex flex-col gap-4"
        >
          <div className="w-full overflow-x-auto">
            <table className="w-[100%] table-auto text-left">
              <tbody className="w-full border-t border-neutral-200">
                <BerichtenboxTableRow index={0} />
                <BerichtenboxTableRow index={1} />
              </tbody>
            </table>
          </div>
          <InlineLink href={"/berichtenbox/inbox"}>
            <Button>
              <IconText IconAfter={ChevronIcon}>
                {"Naar uw berichtenbox"}
              </IconText>
            </Button>
          </InlineLink>
        </Card>
        <Card heading={"Wat is MijnOverheidZakelijk?"}>
          <p className="py-4">
            MijnOverheidZakelijk is uw centrale platform voor het veilig en
            efficiënt beheren van zakelijke overheidszaken. Of u nu ondernemer
            bent, een organisatie vertegenwoordigt of als intermediair optreedt
            — via dit portaal heeft u altijd en overal inzicht in belangrijke
            overheidscommunicatie. <br />
            Van het ontvangen van berichten van overheidsinstanties tot het
            raadplegen van digitale post en het regelen van lopende zaken:
            MijnOverheidZakelijk biedt overzicht, gemak en betrouwbaarheid.
            Alles op één plek, speciaal afgestemd op de behoeften van de
            zakelijke gebruiker. <br />
            Maak uw administratie eenvoudiger, werk efficiënter samen met de
            overheid en houd grip op uw verplichtingen.
          </p>

          <AccordionProvider sections={accordionSections} />
        </Card>
      </div>
    </div>
  );
};

export default Home;

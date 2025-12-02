import { auth } from "@/auth";
import PublicPage from "./(public)/landing";
import Dashboard from "./(private)/dashboard";
import PrivateLayout from "./(private)/_layout";
import PublicLayout from "./(public)/_layout";

export default async function Page() {
  const session = await auth();

  if (!session) {
    return (
      <PublicLayout>
        <PublicPage />
      </PublicLayout>
    );
  }

  return (
<<<<<<< HEAD
    <PrivateLayout>
      <Dashboard />
    </PrivateLayout>
=======
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-12 w-full space-y-6 md:col-span-9">
        {(response.status === 404 ||
          (response.status === 200 &&
            data?.contactgegevens?.filter((x) => x.type === "Email").length ===
              0)) && (
          <Notification variant={"warning"}>
            <h2 className="text-xl">{`Uw heeft nog geen zakelijke e-mailadres omgenomen in uw contactgegevens.`}</h2>
            <p>
              Ga naar{" "}
              <Link className="underline" href="/contactgegevens">
                uw contactgegevens
              </Link>{" "}
              en vul hier uw zakelijke e-mailadres in, zo weten wij hoe we uw
              organisatie kunnen bereiken met belangrijke berichten en updates.
            </p>
          </Notification>
        )}

        <h1 className="text-h1">
          <span>{"Welkom gemachtigde voor KVK nummer: "}</span>
          <span className="font-bold">{kvk}</span>
        </h1>
        <Card className="flex flex-col gap-4">
          <h2 className="text-h2">Recente berichten in uw Berichtenbox</h2>
          <div className="w-full overflow-x-auto">
            <table className="w-[100%] table-auto text-left">
              <tbody className="w-full border-t border-neutral-200">
                <BerichtenboxTableRow index={0} />
                <BerichtenboxTableRow index={1} />
              </tbody>
            </table>
          </div>
          <Link href={"/berichtenbox/inbox"}>
            <Button>
              <IconText IconAfter={ChevronIcon}>
                {"Naar uw berichtenbox"}
              </IconText>
            </Button>
          </Link>
        </Card>
        <Card>
          <h2 className="text-h2">Wat is MijnOverheid Zakelijk?</h2>
          <p className="py-4">
            MijnOverheid Zakelijk is uw centrale platform voor het veilig en
            efficiënt beheren van zakelijke overheidszaken. Of u nu ondernemer
            bent, een organisatie vertegenwoordigt of als intermediair optreedt
            — via dit portaal heeft u altijd en overal inzicht in belangrijke
            overheidscommunicatie. <br />
            Van het ontvangen van berichten van overheidsinstanties tot het
            raadplegen van digitale post en het regelen van lopende zaken:
            MijnOverheid Zakelijk biedt overzicht, gemak en betrouwbaarheid.
            Alles op één plek, speciaal afgestemd op de behoeften van de
            zakelijke gebruiker. <br />
            Maak uw administratie eenvoudiger, werk efficiënter samen met de
            overheid en houd grip op uw verplichtingen.
          </p>
          <Accordion items={accordionItems} />
        </Card>
      </div>
    </div>
>>>>>>> 6bfdf7f (setup verification flow for contact-gegevens)
  );
}

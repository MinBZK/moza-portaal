import { Heading, Paragraph } from "@/components/rhc";
import { getDemoIemandAannemen, getDemoIemandAannemenTraces } from "@/demo";
import { getActieveOrganisatie } from "@/app/(public)/_persona";
import Stappen from "./_stappen";
import Vragen from "./_vragen";
import { werkgeverVan } from "./_werkgever";

/** Scherm 1: drie korte vragen, en wat het kost en oplevert. */
const IemandAannemenPage = async () => {
  const [aannemen, traces, organisatie] = await Promise.all([
    getDemoIemandAannemen(),
    getDemoIemandAannemenTraces(),
    getActieveOrganisatie(),
  ]);
  const werkgever = werkgeverVan(organisatie);
  return (
    <>
      <Heading level={1}>
        Iemand aannemen met afstand tot de arbeidsmarkt
      </Heading>
      <Stappen huidige={1} />
      <Paragraph>
        U kunt een deel van de loonkosten terugkrijgen en u loopt minder risico
        als uw werknemer ziek wordt. Welke regelingen gelden, hangt af van de
        kandidaat. Bijvoorbeeld of die in het doelgroepregister staat.
      </Paragraph>
      <Paragraph>
        Zeven regelingen zijn nagelopen; zes kunnen gelden. Ze worden uitgevoerd
        door UWV, de Belastingdienst en de gemeente. U hoeft niet te weten welke
        organisatie waarover gaat.
      </Paragraph>
      <Vragen
        onderneming={werkgever.onderneming}
        traces={traces}
        regelingen={aannemen.regelingen}
      />
    </>
  );
};

export default IemandAannemenPage;

import { Heading } from "@/components/rhc";
import { getDemoIemandAannemen } from "@/demo";
import { getActieveOrganisatie } from "@/app/(public)/_persona";
import KandidaatForm from "./_kandidaatForm";
import Stappen from "./_stappen";
import { werkgeverVan } from "./_werkgever";

/** Stap 1: de kandidaat en het dienstverband; de rest haalt het portaal op. */
const IemandAannemenPage = async () => {
  const [aannemen, organisatie] = await Promise.all([
    getDemoIemandAannemen(),
    getActieveOrganisatie(),
  ]);
  return (
    <>
      <Heading level={1}>Iemand aannemen</Heading>
      <Stappen huidige={1} />
      <div className="mox-card">
        <KandidaatForm
          kandidaat={aannemen.kandidaat}
          dienstverband={aannemen.dienstverband}
          werkgever={werkgeverVan(organisatie)}
        />
      </div>
    </>
  );
};

export default IemandAannemenPage;

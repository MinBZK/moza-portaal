import { Heading } from "@/components/rhc";
import { getDemoZaken } from "@/demo";
import ZakenTabel from "../_zakenTabel";
import ZakenTabs from "../_zakenTabs";

const AfgehandeldPage = async () => {
  const zaken = await getDemoZaken("afgehandeld");

  return (
    <>
      <Heading level={1}>Lopende zaken</Heading>
      <div className="mox-card">
        <ZakenTabs actief="afgehandeld" />
        <ZakenTabel zaken={zaken} soort="afgehandeld" />
      </div>
    </>
  );
};

export default AfgehandeldPage;

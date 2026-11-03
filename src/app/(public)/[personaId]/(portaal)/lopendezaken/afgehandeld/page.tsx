import type { Metadata } from "next";
import { Heading } from "@/components/rhc";
import { getDemoZaken } from "@/demo";
import ZakenTabel from "../_zakenTabel";
import ZakenTabs from "../_zakenTabs";

export const metadata: Metadata = { title: "Afgehandeld - Lopende zaken" };

const AfgehandeldPage = async () => {
  const zaken = await getDemoZaken("afgehandeld");

  return (
    <>
      <Heading level={1}>Lopende zaken</Heading>
      <div className="rhc-mox-card">
        <ZakenTabs actief="afgehandeld" />
        <ZakenTabel zaken={zaken} soort="afgehandeld" />
      </div>
    </>
  );
};

export default AfgehandeldPage;

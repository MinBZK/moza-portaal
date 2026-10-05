import { Heading } from "@/components/rhc";

const BerichtenboxPage = async ({
  params,
}: {
  params: { personaId: string };
}) => {
  const { personaId } = params;

  return (
    <>
      <Heading level={1}>Berichtenbox...</Heading>
      <p className="mt-4">Geselecteerde personaId: {personaId}</p>
    </>
  );
};

export default BerichtenboxPage;

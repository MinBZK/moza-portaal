import Card from "@/components/card";

const Actueleonderwerpen = async () => {
  return (
    <>
      <h1 className="text-3xl">Actuele onderwerpen</h1>
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 w-full space-y-5 md:col-span-8">
          <Card className="space-y-5">
            <h2 className="text-2xl">We zijn hier mee bezig</h2>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Actueleonderwerpen;

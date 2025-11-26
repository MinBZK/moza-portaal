import Card from "@/components/card";
import { Tab, Tabs } from "@/components/Tabs";
import Prive from "@/app/contactgegevens/prive";
import Zakelijk from "@/app/contactgegevens/zakelijk";

const ContactgegevensPage = async ({
  params,
}: {
  params: Promise<{ type: "zakelijk" | "prive" }>;
}) => {
  const { type } = await params;

  return (
    <>
      <h1 className="text-h1">Contactgegevens</h1>
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 w-full space-y-5 md:col-span-8">
          <Card>
            <div className="space-y-5">
              <Tabs>
                <Tab
                  href={`/contactgegevens/prive`}
                  label={"Privé"}
                  isActive={type === "prive"}
                />
                <Tab
                  href={`/contactgegevens/zakelijk`}
                  label={"Zakelijk"}
                  isActive={type === "zakelijk"}
                />
              </Tabs>

              {type === "prive" ? <Prive /> : <Zakelijk />}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

export default ContactgegevensPage;

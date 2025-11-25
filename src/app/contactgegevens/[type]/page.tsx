import Card from "@/components/Card";
import { Tab, Tabs } from "@/components/Tabs";
import { ContactEditBox } from "./_contactEditBox";
import { Notification } from "@/components/notifications";
import Button from "@/components/button";

const ContactgegevensPage = async ({
  params,
}: {
  params: Promise<{ type: "zakelijk" | "prive" }>;
}) => {
  const { type } = await params;

  const initialData = {
    prive: {
      email: {
        name: "private_email",
        value: "linda.strijps@gmail.com",
        label: "Privé e-mailadres",
        initialStatus: "available",
      },
      phonenumber: {
        name: "private_phonenumber",
        value: "06 - 12 345 678",
        label: "Privé telefoonnummer",
        initialStatus: "available",
      },
    },
    zakelijk: {
      email: {
        name: "business_email",
        value: "linda.strijps@gmail.com",
        label: "Zakelijk e-mailadres",
        initialStatus: "empty",
      },
      phonenumber: {
        name: "business_phonenumber",
        value: "06 - 12 345 678",
        label: "Zakelijk telefoonnummer",
        initialStatus: "empty",
      },
    },
  } as const;

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
              <div className="flex w-full flex-col gap-4 overflow-x-auto">
                <div className="flex flex-col gap-0 bg-neutral-100 p-4">
                  <ContactEditBox {...initialData[type].email} />
                  <hr className="my-3 border-neutral-300" />
                  <ContactEditBox {...initialData[type].phonenumber} />
                </div>
                {type === "zakelijk" && (
                  <Notification
                    header={
                      "Wilt u uw privecontactgegevens niet gebruiken voor zakelijke contactgegevens?"
                    }
                    text={
                      <div className="mt-4 flex flex-row gap-3">
                        <Button>Privégegevens gebruiken</Button>
                        <Button>Zakelijke gegevens apart toevoegen</Button>
                      </div>
                    }
                    variant={"information"}
                  />
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

export default ContactgegevensPage;

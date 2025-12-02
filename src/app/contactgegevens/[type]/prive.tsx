import React from "react";
import { getProfielInformation } from "@/network/profiel/hooks/getProfielInformation/action";
import { auth } from "@/auth";
import { ContactEditBox } from "@/app/contactgegevens/[type]/_contactEditBox";

const Prive = async () => {
  const session = await auth();
  const bsn = session?.user.bsn;

  if (!bsn) {
    throw new Error("BSN not found in session");
  }

  const { data, status } = await getProfielInformation({
    identificatieType: "BSN",
    identificatieNummer: bsn,
  });
  if (status != 200 && status != 404) {
    throw new Error("Server-side error occurred");
  }

  const email = data?.contactgegevens?.filter((x) => x.type == "Email")[0];
  const telefoonnummer = data?.contactgegevens?.filter(
    (x) => x.type == "Telefoonnummer",
  )[0];

  return (
    <div className="flex w-full flex-col gap-4 overflow-x-auto">
      <div className="flex flex-col gap-0 bg-neutral-100 p-4">
        <ContactEditBox
          name={"Email"}
          label={"E-mailadres"}
          contactGegeven={email}
          idenType={"BSN"}
          idenValue={bsn}
        />

        <hr className="my-3 border-neutral-300" />

        <ContactEditBox
          name={"Telefoonnummer"}
          label={"Telefoonnummer"}
          contactGegeven={telefoonnummer}
          idenType={"BSN"}
          idenValue={bsn}
        />
      </div>
    </div>
  );
};

export default Prive;

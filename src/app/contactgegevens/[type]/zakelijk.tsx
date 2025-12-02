import React from "react";
import { getKvkFromCookie } from "@/utils/kvknummer";
import { ContactEditBox } from "@/app/contactgegevens/[type]/_contactEditBox";
import { getProfielInformation } from "@/network/profiel/hooks/getProfielInformation/action";
import CopyNotificatie from "@/app/contactgegevens/[type]/copyNotificatie";

const Zakelijk = async () => {
  const kvk = await getKvkFromCookie();

  const { data, status } = await getProfielInformation({
    identificatieType: "KVK",
    identificatieNummer: kvk!,
  });
  if (status != 200 && status != 404) {
    throw new Error("Server-side error occurred");
  }

  const email = data?.contactgegevens?.filter((x) => x.type == "Email")[0];
  const telefoonnummer = data?.contactgegevens?.filter(
    (x) => x.type == "Telefoonnummer",
  )[0];

  console.log(email, telefoonnummer);
  return (
    <div className="flex w-full flex-col gap-4 overflow-x-auto">
      <div className="flex flex-col gap-0 bg-neutral-100 p-4">
        <ContactEditBox
          name={"Email"}
          label={"E-mailadres"}
          contactGegeven={email}
          idenType={"KVK"}
          idenValue={kvk!}
        />
        <hr className="my-3 border-neutral-300" />

        <ContactEditBox
          name={"Telefoonnummer"}
          label={"Telefoonnummer"}
          contactGegeven={telefoonnummer}
          idenType={"KVK"}
          idenValue={kvk!}
        />
      </div>

      {status === 404 && <CopyNotificatie kvkNummer={kvk!} />}
    </div>
  );
};

export default Zakelijk;

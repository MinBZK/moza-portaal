import React from "react";
import { getKvkFromCookie } from "@/utils/kvknummer";
import { ContactEditBox } from "@/app/contactgegevens/_contactEditBox";
import { getProfielInformation } from "@/network/profiel/hooks/getProfielInformation/action";
import CopyNotificatie from "@/app/contactgegevens/copyNotificatie";

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

  return (
    <div className="flex w-full flex-col gap-4 overflow-x-auto">
      <div className="flex flex-col gap-0 bg-neutral-100 p-4">
        <ContactEditBox
          id={email?.id ?? undefined}
          name={"Email"}
          label={"E-mailadres"}
          value={email?.waarde ?? ""}
          idenType={"KVK"}
          idenValue={kvk!}
        />
        <hr className="my-3 border-neutral-300" />

        <ContactEditBox
          id={telefoonnummer?.id ?? undefined}
          name={"Telefoonnummer"}
          label={"Telefoonnummer"}
          value={telefoonnummer?.waarde ?? ""}
          idenType={"KVK"}
          idenValue={kvk!}
        />
      </div>

      {status == 404 && <CopyNotificatie kvkNummer={kvk!} />}
    </div>
  );
};

export default Zakelijk;

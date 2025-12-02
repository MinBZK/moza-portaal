"use client";

import { getKvkFromCookie } from "@/utils/kvknummer";
import { ContactEditBox } from "@/app/contactgegevens/[type]/_contactEditBox";
import CopyNotificatie from "@/app/contactgegevens/[type]/copyNotificatie";
import { useEffect, useState } from "react";
import { useGetProfielInformation } from "@/network/profiel/hooks/getProfielInformation/useGetProfielInformation";

const Zakelijk = () => {
  const [kvk, setKvk] = useState<string | undefined | null>(null);
  useEffect(() => {
    getKvkFromCookie().then(setKvk);
  }, []);

  const { data, status } = useGetProfielInformation("KVK", kvk ?? "");

  const email = data?.data?.contactgegevens?.find(
    ({ type }) => type === "Email",
  );
  const telefoonnummer = data?.data?.contactgegevens?.find(
    ({ type }) => type === "Telefoonnummer",
  );

  if (status === "pending" || kvk == null) return null;

  if (status === "error") {
    return <div>Server-side error occurred</div>;
  }

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

      {data?.status === 404 && <CopyNotificatie kvkNummer={kvk!} />}
    </div>
  );
};

export default Zakelijk;

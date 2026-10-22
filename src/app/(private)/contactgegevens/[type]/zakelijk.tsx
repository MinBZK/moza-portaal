"use client";

import { getKvkFromCookie } from "@/utils/kvknummer";
import { ContactDetails } from "@/app/(private)/contactgegevens/[type]/_contactDetails";
import CopyNotificatie from "@/app/(private)/contactgegevens/[type]/copyNotificatie";
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
  const aanhef = data?.data?.voorkeuren?.find(
    ({ voorkeurType }) => voorkeurType === "Aanhef",
  );
  const taal = data?.data?.voorkeuren?.find(
    ({ voorkeurType }) => voorkeurType === "WebsiteTaal",
  );

  if (status === "pending" || kvk == null) return null;

  if (status === "error") {
    return <div>Server-side error occurred</div>;
  }

  return (
    <div className="rhc-mox-row-gap">
      <ContactDetails
        idenType={"KVK"}
        idenValue={kvk}
        salutation={aanhef}
        language={taal}
        email={email}
        phone={telefoonnummer}
      />

      {data?.status === 404 && <CopyNotificatie kvkNummer={kvk} />}
    </div>
  );
};

export default Zakelijk;

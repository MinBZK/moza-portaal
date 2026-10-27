"use client";

import { ContactDetails } from "@/app/(private)/contactgegevens/[type]/_contactDetails";
import { useGetProfielInformation } from "@/network/profiel/hooks/getProfielInformation/useGetProfielInformation";
import { useSession } from "next-auth/react";

const Prive = () => {
  const { data: session, status: sessionStatus } = useSession();
  const bsn = session?.user?.bsn;

  const { data, status } = useGetProfielInformation("BSN", bsn ?? "");

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

  if (sessionStatus === "loading" || status === "pending" || !bsn) return null;

  if (status === "error") {
    return <div>Server-side error occurred</div>;
  }

  return (
    <div className="rhc-mox-row-gap">
      <ContactDetails
        idenType={"BSN"}
        idenValue={bsn}
        salutation={aanhef}
        language={taal}
        email={email}
        phone={telefoonnummer}
      />
    </div>
  );
};

export default Prive;

"use client";

import { AanhefEditBox } from "@/app/(private)/contactgegevens/[type]/_aanhefEditBox";
import { ContactEditBox } from "@/app/(private)/contactgegevens/[type]/_contactEditBox";
import { TaalEditBox } from "@/app/(private)/contactgegevens/[type]/_taalEditBox";
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
    <div className="flex w-full flex-col gap-4 overflow-x-auto">
      <div className="flex flex-col gap-0 bg-neutral-100 p-4">
        <AanhefEditBox
          voorkeur={aanhef}
          idenType={"BSN"}
          idenValue={bsn}
        />

        <hr className="my-3 border-neutral-300" />

        <TaalEditBox
          voorkeur={taal}
          idenType={"BSN"}
          idenValue={bsn}
        />

        <hr className="my-3 border-neutral-300" />

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

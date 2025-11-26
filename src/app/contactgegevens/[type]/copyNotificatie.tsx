"use client";

import { getProfielInformation } from "@/network/profiel/hooks/getProfielInformation/action";
import { useUpdateOndernemengContactvoorkeur } from "@/network/profiel/hooks/updateOndernemingEmail/useUpdateOndernemenEmail";
import { Notification } from "@/components/notifications";
import Button from "@/components/button";
import React from "react";
import { useSession } from "next-auth/react";

const CopyNotificatie = ({ kvkNummer }: { kvkNummer: string }) => {
  const { mutateAsync } = useUpdateOndernemengContactvoorkeur();
  const session = useSession();
  const updateZakelijkFromPrive = async () => {
    console.log("update zakelijk from prive");
    const bsn = session.data?.user.bsn;

    console.log(bsn);
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

    const priveEmail = data?.contactgegevens?.filter(
      (x) => x.type == "Email",
    )[0];
    const priveTelefoonnummer = data?.contactgegevens?.filter(
      (x) => x.type == "Telefoonnummer",
    )[0];

    await mutateAsync({
      identificatieNummer: kvkNummer,
      identificatieType: "KVK",
      body: {
        type: "Email",
        waarde: priveEmail!.waarde ?? "",
      },
    });

    await mutateAsync({
      identificatieNummer: kvkNummer,
      identificatieType: "KVK",
      body: {
        type: "Telefoonnummer",
        waarde: priveTelefoonnummer!.waarde ?? "",
      },
    });

    window.location.reload();
    // router.refresh();
  };

  return (
    <Notification
      header={
        "Wilt u uw privecontactgegevens niet gebruiken voor zakelijke contactgegevens?"
      }
      text={
        <div className="mt-4 flex flex-row gap-3">
          <Button onClick={updateZakelijkFromPrive}>
            Privégegevens gebruiken
          </Button>
        </div>
      }
      variant={"information"}
    />
  );
};

export default CopyNotificatie;

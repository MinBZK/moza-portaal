"use client";

import { getProfielInformation } from "@/network/profiel/hooks/getProfielInformation/action";
import { useUpdateOndernemengContactvoorkeur } from "@/network/profiel/hooks/updateOndernemingEmail/useUpdateOndernemenEmail";
import { Alert, Button, Heading } from "@/components/rhc";
import React, { useEffect } from "react";
import { useSession } from "next-auth/react";

const CopyNotificatie = ({ kvkNummer }: { kvkNummer: string }) => {
  const { mutateAsync } = useUpdateOndernemengContactvoorkeur();
  const session = useSession();
  const [priveEmail, setPriveEmail] = React.useState<string>("");
  const [priveTelefoonnummer, setPriveTelefoonnummer] =
    React.useState<string>("");

  const bsn = session.data?.user.bsn;

  useEffect(() => {
    const getContactInfo = async () => {
      if (bsn != null) {
        const { data, status } = await getProfielInformation({
          identificatieType: "BSN",
          identificatieNummer: bsn,
        });
        if (status != 200 && status != 404) {
          throw new Error("Server-side error occurred");
        }

        const availablePriveEmail = data?.contactgegevens?.filter(
          (x) => x.type == "Email",
        )[0];
        const availablePriveTelefoonnummer = data?.contactgegevens?.filter(
          (x) => x.type == "Telefoonnummer",
        )[0];

        setPriveEmail(availablePriveEmail?.waarde ?? "");
        setPriveTelefoonnummer(availablePriveTelefoonnummer?.waarde ?? "");
      }
    };
    getContactInfo();
  }, [bsn]);

  const updateZakelijkFromPrive = async () => {
    if (!bsn) {
      throw new Error("BSN not found in session");
    }

    await mutateAsync({
      identificatieNummer: kvkNummer,
      identificatieType: "KVK",
      body: {
        type: "Email",
        waarde: priveEmail,
      },
    });

    await mutateAsync({
      identificatieNummer: kvkNummer,
      identificatieType: "KVK",
      body: {
        type: "Telefoonnummer",
        waarde: priveTelefoonnummer,
      },
    });

    window.location.reload();
    // router.refresh();
  };

  // Only show notification if there are private contact details available
  if (priveEmail === "" && priveTelefoonnummer === "") {
    return null;
  }

  return (
    <Alert type="info">
      <Heading level={2}>
        Wilt u uw privécontactgegevens gebruiken als zakelijke contactgegevens?
      </Heading>
      <Button
        appearance="secondary-action-button"
        onClick={updateZakelijkFromPrive}
      >
        Privégegevens gebruiken
      </Button>
    </Alert>
  );
};

export default CopyNotificatie;

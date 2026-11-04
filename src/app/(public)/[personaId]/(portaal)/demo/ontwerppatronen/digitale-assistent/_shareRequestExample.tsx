"use client";

import { useState } from "react";
import { Button } from "@/components/rhc";
import { Deelverzoek } from "../../../digitale-assistent/_onderdelen";

type State = "open" | "gedeeld" | "geweigerd";

/** The share request from the chat, with working buttons. */
const ShareRequestExample = () => {
  const [state, setState] = useState<State>("open");
  return (
    <div className="rhc-mox-chat">
      <Deelverzoek
        item={{
          id: "voorbeeld-deelverzoek",
          soort: "deelverzoek",
          bron: "Business Wallet",
          omschrijving:
            "De assistent wil uw energieverbruik gebruiken, afgegeven door uw netbeheerder. Er wordt niets opgehaald voordat u hier akkoord geeft.",
          vanBackend: false,
          staat: state,
        }}
        drempel={null}
        onDelen={() => setState("gedeeld")}
        onNietDelen={() => setState("geweigerd")}
      />
      {state !== "open" && (
        <div>
          <Button
            appearance="secondary-action-button"
            onClick={() => setState("open")}
          >
            Voorbeeld opnieuw tonen
          </Button>
        </div>
      )}
    </div>
  );
};

export default ShareRequestExample;

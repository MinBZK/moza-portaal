"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ActionGroup, Alert, Button, Paragraph } from "@/components/rhc";
import type { DemoAannemen } from "@/demo";
import { voegZaakToe } from "../../../lopendezaken/_assistentZaken";
import { useAannemen } from "../_useAannemen";

/**
 * Zonder `knop`: de melding dat de aanvraag al verstuurd is. Met `knop`: de
 * knop Verstuur. Versturen zet de zaak in Lopende zaken (dezelfde opslag als
 * zaken uit de Digitale assistent) en opent de bevestiging.
 */
const Verstuur = ({
  zaak,
  knop,
}: {
  zaak: DemoAannemen["zaak"];
  knop?: boolean;
}) => {
  const router = useRouter();
  const { staat, werkBij } = useAannemen();

  const verstuur = () => {
    werkBij({ ingediend: true, verstuurdOp: "2026-10-05", fase: "ontvangst" });
    voegZaakToe({
      referentienummer: zaak.nummer,
      onderwerp: zaak.onderwerp,
      organisatie: zaak.organisatie,
      status: "In behandeling",
      ingediend_op: "2026-10-05",
      regeling: "loonkostensubsidie",
    });
    router.push("/personeel/iemand-aannemen/verstuurd");
  };

  if (!knop) {
    if (!staat?.ingediend) return null;
    return (
      <Alert type="ok">
        <Paragraph>
          Deze aanvraag is al verstuurd.{" "}
          <Link href={zaak.url} className="utrecht-link utrecht-link--html-a">
            Bekijk de zaak bij Lopende zaken
          </Link>
          .
        </Paragraph>
      </Alert>
    );
  }
  return (
    <ActionGroup>
      <Button appearance="primary-action-button" onClick={verstuur}>
        Verstuur naar gemeente Lansingerland
      </Button>
      <Link
        href="/personeel/iemand-aannemen/wat-het-oplevert"
        className="utrecht-link utrecht-link--html-a"
      >
        Annuleer
      </Link>
    </ActionGroup>
  );
};

export default Verstuur;

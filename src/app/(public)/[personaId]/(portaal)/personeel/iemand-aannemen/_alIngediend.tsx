"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ActionGroup, Alert, Button, Paragraph } from "@/components/rhc";
import { nieuweAanvraag, useAannemen } from "./_useAannemen";

/**
 * Instead of a step when the request has already been submitted, or finished
 * without sending anything: it can no longer change. A new request starts
 * again at the first step, empty. The cases in Lopende zaken stay.
 */
const AlIngediend = ({ knop = true }: { knop?: boolean }) => {
  const router = useRouter();
  const { staat } = useAannemen();
  // Afgerond zonder versturen: er is niets ingediend.
  const verstuurd = !staat?.afgerond || !!staat?.aanvraagIngediend;
  return (
    <Alert type="info">
      <Paragraph>
        {verstuurd
          ? "U heeft deze aanvraag al ingediend. U kunt die niet meer wijzigen."
          : "U heeft deze taak al afgerond. Er is niets verstuurd."}
      </Paragraph>
      <Paragraph>
        Wilt u iemand anders aannemen of iets anders aanvragen? Start dan een
        nieuwe aanvraag.
      </Paragraph>
      <ActionGroup>
        {knop && (
          <Button
            appearance="secondary-action-button"
            onClick={() => {
              nieuweAanvraag();
              router.push("/personeel/iemand-aannemen/voorbeeldberekening");
            }}
          >
            Nieuwe aanvraag starten
          </Button>
        )}
        <Link
          href="/lopendezaken"
          className="utrecht-link utrecht-link--html-a"
        >
          Naar Lopende zaken
        </Link>
      </ActionGroup>
    </Alert>
  );
};

export default AlIngediend;

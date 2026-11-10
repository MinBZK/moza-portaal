"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ActionGroup, Alert, Button, Paragraph } from "@/components/rhc";
import { wisAannemen } from "./_useAannemen";

/**
 * Instead of a step when the request has already been submitted: it can no
 * longer change. A new request starts again at the first step, empty.
 */
const AlIngediend = () => {
  const router = useRouter();
  return (
    <Alert type="info">
      <Paragraph>
        U hebt deze aanvraag al ingediend. U kunt die niet meer wijzigen.
      </Paragraph>
      <Paragraph>
        Wilt u iemand anders aannemen of iets anders aanvragen? Start dan een
        nieuwe aanvraag.
      </Paragraph>
      <ActionGroup>
        <Button
          appearance="secondary-action-button"
          onClick={() => {
            wisAannemen();
            router.push("/personeel/iemand-aannemen/voorbeeldberekening");
          }}
        >
          Nieuwe aanvraag starten
        </Button>
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

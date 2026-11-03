"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useRequestVerificationCode,
  useVerifyEmail,
} from "@/network/profiel/hooks/updateOndernemingEmail/useUpdateOndernemenEmail";
import {
  ActionGroup,
  Alert,
  Button,
  FormFieldTextInput,
} from "@/components/rhc";

const RESEND_COUNTDOWN_SECONDS = 10;

/**
 * Verify a changed e-mail address with the code that was sent to it, or
 * request a new code. Shown after the address was changed and saved.
 */
export const EmailVerification = ({
  idenType,
  idenValue,
  email,
  onVerified,
}: {
  idenType: "KVK" | "BSN";
  idenValue: string;
  email: string;
  onVerified: () => void;
}) => {
  const queryClient = useQueryClient();
  const { mutate: verify } = useVerifyEmail();
  const { mutate: requestCode } = useRequestVerificationCode();

  const [code, setCode] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [countdown, setCountdown] = useState(RESEND_COUNTDOWN_SECONDS);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState<string | undefined>();

  useEffect(() => {
    if (countdown === 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    verify(
      {
        body: {
          identificatieNummer: idenValue,
          identificatieType: idenType,
          email,
          verificatieCode: code,
        },
      },
      {
        onSuccess: () => {
          setCode("");
          setError(undefined);
          queryClient.invalidateQueries({
            queryKey: ["profiel", idenType, idenValue],
          });
          onVerified();
        },
        onError: () =>
          setError("De verificatiecode is onjuist. Probeer het opnieuw."),
      },
    );
  };

  const resend = () => {
    if (countdown > 0) return;
    setResendError(undefined);
    setResendSuccess(false);
    setCountdown(RESEND_COUNTDOWN_SECONDS);
    requestCode(
      {
        body: {
          email,
          identificatieNummer: idenValue,
          identificatieType: idenType,
        },
      },
      {
        onSuccess: () => setResendSuccess(true),
        onError: (resendFailure: Error) =>
          setResendError(
            resendFailure.message === "SERVICE_UNAVAILABLE"
              ? "Wij kunnen nu geen code sturen. Probeer het later opnieuw."
              : "Wij kunnen nu geen nieuwe code sturen. Probeer het later opnieuw.",
          ),
      },
    );
  };

  return (
    <form
      className="rhc-mox-stack rhc-mox-stack--2xl"
      noValidate
      onSubmit={submit}
    >
      {resendSuccess && (
        <Alert type="ok">
          {`Wij hebben een nieuwe code gestuurd naar ${email}.`}
        </Alert>
      )}
      {resendError && <Alert type="error">{resendError}</Alert>}
      <Alert type="warning">
        {`Uw e-mailadres is nog niet bevestigd. U ontvangt nog geen meldingen. Er is een verificatiecode gestuurd naar ${email}.\nBekijk uw Ongewenste e-mail wanneer u niets binnen heeft gekregen.`}
      </Alert>
      <FormFieldTextInput
        label="Verificatiecode"
        autoComplete="one-time-code"
        placeholder="bv: 123456"
        maxLength={6}
        value={code}
        invalid={!!error}
        errorMessage={error}
        onChange={(event) => setCode((event.target as HTMLInputElement).value)}
      >
        <ActionGroup direction="row">
          <Button appearance="primary-action-button" type="submit">
            Code bevestigen
          </Button>
          <Button
            appearance="secondary-action-button"
            onClick={countdown === 0 ? resend : undefined}
          >
            {countdown > 0
              ? `Opnieuw verificatiecode aanvragen in ${countdown} seconden`
              : "Opnieuw verificatiecode aanvragen"}
          </Button>
        </ActionGroup>
      </FormFieldTextInput>
    </form>
  );
};

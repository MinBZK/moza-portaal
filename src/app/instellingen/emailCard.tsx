"use client";
import Button from "@/components/button";
import Card from "@/components/card";
import FormField from "@/components/form/formField";
import { Icon } from "@/components/icons/infoIcon";
import { Notification } from "@/components/notifications";
import { usePostVerifyEmail } from "@/network/profiel/hooks/postVerifyEmail/usePostVerifyEmail";
import { useUpdateOndernemenEmail } from "@/network/profiel/hooks/updateOndernemingEmail/useUpdateOndernemenEmail";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { z } from "zod";

const emailSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Vul een email in" })
    .email("Dit is geen valide email"),
});

const verificatieSchema = z.object({
  code: z.string().min(1, { message: "Vul een code in" }),
});

const EmailNotifications = ({
  isSuccesful,
  newEmail,
  showVerification,
}: {
  isSuccesful: boolean;
  newEmail: string;
  showVerification: boolean;
}) => (
  <>
    {isSuccesful && (
      <>
        <Notification variant="success" header="Instellingen zijn opgeslagen" />
        {showVerification && (
          <Notification
            variant="information"
            header="Persoonlijke code verzonden"
            text={`U ontvangt nu en e-mail op ${newEmail} met een code om te controleren of het e-mailadres werkt en van u is. Deze code is 15 minuten geldig.`}
          />
        )}
      </>
    )}
    {showVerification && (
      <Notification
        variant="warning"
        header="E-mailadres niet geverifeerd"
        text="Uw e-mailadres is nog niet geverifeerd. U moet uw e-mailadres eerst verifiëren. Daarna kunt u meldingen van MijnOverheidZakelijk ontvangen"
      />
    )}
  </>
);

const VerificationForm = ({
  showVerificatieError,
  kvkNummer,
  setIsEditing,
  setShowVerification,
  setShowVerificatieError,
}: {
  showVerificatieError: boolean;
  kvkNummer: string;
  setIsEditing: (args0: boolean) => void;
  setShowVerification: (args0: boolean) => void;
  setShowVerificatieError: (args0: boolean) => void;
}) => {
  const { mutate: mutateVerify } = usePostVerifyEmail();
  const form = useForm({
    defaultValues: { code: "" },
    validators: { onSubmit: verificatieSchema },
    onSubmit: ({ value: values }) => {
      mutateVerify(
        { kvkNummer, code: values.code },
        {
          onSuccess: (response) => {
            if (response == 200) {
              setIsEditing(false);
              setShowVerification(false);
            } else {
              setShowVerificatieError(true);
            }
          },
        },
      );
    },
  });

  return (
    <div>
      <p className="font-bold">Persoonlijke code</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <div className="flex items-center gap-5">
          <div>
            <form.Field name="code">
              {(field) => <FormField field={field} />}
            </form.Field>
          </div>
          <div>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
            >
              <Button type="submit">Verifiëren</Button>
            </form.Subscribe>
          </div>
        </div>
        {showVerificatieError && (
          <p className="text-red-600">
            Code was niet correct, probeer het opnieuw
          </p>
        )}
        <p
          className="text-blue-900 underline"
          onClick={() => alert("nog te implementeren")}
        >
          Nieuwe persoonlijke code sturen
        </p>
      </form>
    </div>
  );
};

export const EmailCard = ({
  currentEmail,
  emailVerified,
  kvkNummer,
}: {
  currentEmail: string;
  emailVerified: boolean;
  kvkNummer: string;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSuccesful, setIsSuccessful] = useState(false);
  const [showVerification, setShowVerification] = useState(
    !!currentEmail && !emailVerified,
  );
  const [showVerificatieError, setShowVerificatieError] = useState(false);
  const [newEmail, setNewEmail] = useState("");

  const [showExtraInfo, setShowExtraInfo] = useState(false);
  const { mutate } = useUpdateOndernemenEmail();

  const emailForm = useForm({
    defaultValues: { email: currentEmail },
    validators: { onSubmit: emailSchema },
    onSubmit: ({ value: values }) => {
      mutate(
        { kvkNummer, email: values.email },
        {
          onSuccess: (response) => {
            setIsSuccessful(true);
            setNewEmail(response?.Onderneming.email ?? "");
            setShowVerification(!response?.Onderneming.emailVerified);
          },
        },
      );
    },
  });

  return (
    <>
      <EmailNotifications
        isSuccesful={isSuccesful}
        newEmail={newEmail}
        showVerification={showVerification}
      />
      <Card className="flex flex-col gap-4">
        <h2 className="text-h2">E-mailadres</h2>
        <div className="border-b-1 border-gray-200 pb-2">
          <form
            className="grid grid-cols-2 gap-4 *:py-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (isEditing) emailForm.handleSubmit();
            }}
          >
            <div>
              <emailForm.Field name="email">
                {(field) => (
                  <FormField
                    label={"E-mailadres"}
                    field={field}
                    readOnly={!isEditing}
                  />
                )}
              </emailForm.Field>
            </div>
            <div className="grid grid-cols-1">
              <div className="text-right">
                <Icon
                  variant="information"
                  handleClick={() => setShowExtraInfo(!showExtraInfo)}
                />
                {showExtraInfo && (
                  <div className="bg-blue-200 px-4 py-2">
                    <Icon
                      variant="information"
                      handleClick={() => setShowExtraInfo(false)}
                    />
                    <span className="ml-1">
                      Het e-mailadres waarop uw bedrijf meldingen van de
                      aangesloten overheid organisaties wilt ontvangen
                    </span>
                  </div>
                )}
              </div>
              <div className="text-right">
                {isEditing ? (
                  <p
                    className="text-primary clear-right underline"
                    onClick={() => {
                      emailForm.reset();
                      setIsEditing(false);
                    }}
                  >
                    Annuleren
                  </p>
                ) : (
                  <p
                    className="text-primary clear-right underline"
                    onClick={() => {
                      setIsSuccessful(false);
                      // setShowVerification(false);
                      setIsEditing(true);
                    }}
                  >
                    E-mailadres invullen of aanpassen
                  </p>
                )}
              </div>
            </div>
          </form>
          {showVerification && (
            <VerificationForm
              showVerificatieError={showVerificatieError}
              kvkNummer={kvkNummer}
              setIsEditing={setIsEditing}
              setShowVerification={setShowVerification}
              setShowVerificatieError={setShowVerificatieError}
            />
          )}
        </div>
        <div className="pt-4">
          <Button
            onClick={() => {
              if (!isEditing) return;
              emailForm.handleSubmit();
            }}
          >
            Opslaan
          </Button>
        </div>
      </Card>
    </>
  );
};

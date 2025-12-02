"use client";

import { useRef, useState } from "react";
import { z } from "zod";
import { components } from "@/network/profiel/generated";
import {
  useUpdateOndernemengContactvoorkeur,
  useVerifyEmail,
} from "@/network/profiel/hooks/updateOndernemingEmail/useUpdateOndernemenEmail";
import { Icon } from "@/components/icons/infoIcon";
import { Notification } from "@/components/notifications";
import { EditIcon } from "@/components/icons/editIcon";
import { CheckCircleIcon } from "@/components/icons/checkCircleIcon";
import { useQueryClient } from "@tanstack/react-query";

const ButtonBase = ({
  className,
  onClick,
  children,
  type = "button",
  icon,
}: {
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
  icon?: React.ReactNode;
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`text-primary ml-auto flex cursor-pointer items-center gap-2 hover:underline ${className}`}
    >
      {icon}
      {children}
    </button>
  );
};

const contactSchemas = {
  Email: z.string().email("Voer een geldig e-mailadres in"),
  Telefoonnummer: z
    .string() // kan nog stricter met regex voor NL nummers
    .min(8, "Voer een geldig Nederlands telefoonnummer in")
    .max(18, "Voer een geldig Nederlands telefoonnummer in"),
  Adres: z.string(), // komt niet voor als veld
} as const satisfies Record<components["schemas"]["ContactType"], z.ZodTypeAny>;

export const ContactEditBox = ({
  label,
  name,
  idenType,
  idenValue,
  contactGegeven,
}: {
  name: components["schemas"]["ContactType"];
  label: string;
  idenType: "KVK" | "BSN";
  idenValue: string;
  contactGegeven?: components["schemas"]["ContactgegevenResponse"];
}) => {
  const [fieldState, setFieldState] = useState<"view" | "edit">("view");
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [verificationSubmitted, setVerificationSubmitted] =
    useState<boolean>(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { mutate: updateEmailMutate } = useUpdateOndernemengContactvoorkeur();
  const { mutate: emailVerifyMutate } = useVerifyEmail();

  const [newValue, setNewValue] = useState(contactGegeven?.waarde || "");
  const [verificationCode, setVerificationCode] = useState("");

  const id = contactGegeven?.id;
  const isVerified = contactGegeven?.isGeverifieerd || false;
  const queryClient = useQueryClient();

  return (
    <form
      className="flex flex-col gap-3"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        setHasSubmitted(true);

        if (fieldState === "edit") {
          if (newValue == null) return;

          // Validate email if the field type is Email
          const result = contactSchemas[name].safeParse(newValue);

          if (!result.success) {
            setErrorMessage(result.error.issues[0].message);
            inputRef.current?.focus();
            return;
          }

          // Clear any previous error messages
          setErrorMessage(undefined);
          updateEmailMutate(
            {
              identificatieNummer: idenValue,
              identificatieType: idenType,
              body: {
                id,
                type: name,
                waarde: newValue,
              },
            },
            {
              onSuccess: () => {
                setFieldState("view");
                queryClient.invalidateQueries({
                  queryKey: ["profiel", idenType, idenValue],
                });
              },
              onError: (_error: Error) => {
                setErrorMessage(
                  "Er is een fout opgetreden bij het opslaan. Probeer het opnieuw.",
                );
              },
            },
          );
        } else if (fieldState === "view") {
          emailVerifyMutate(
            {
              body: {
                identificatieNummer: idenValue,
                identificatieType: idenType,
                email: newValue,
                verificatieCode: verificationCode,
              },
            },
            {
              onSuccess: () => {
                setVerificationCode("");
                queryClient.invalidateQueries({
                  queryKey: ["profiel", idenType, idenValue],
                });
              },
              onError: (_error: Error) => {
                setErrorMessage(
                  "De verificatiecode is onjuist. Probeer het opnieuw.",
                );
              },
            },
          );
        }
      }}
    >
      {verificationSubmitted && isVerified && (
        <Notification
          variant="success"
          onClose={() => setVerificationSubmitted(false)}
        >
          {`Uw ${label.toLocaleLowerCase()} is succesvol geverifieerd.`}
        </Notification>
      )}
      <div className="grid grid-cols-[2fr_3fr_100px] items-start gap-4">
        <label htmlFor={`field-${name}-${id}`} className="font-bold">
          {label}
        </label>
        <div>
          {fieldState === "edit" ? (
            <div className="flex flex-col gap-2">
              <input
                ref={inputRef}
                className="w-full border border-gray-300 bg-white p-1"
                id={`field-${name}-${id}`}
                type={name === "Email" ? "email" : "text"}
                name={name}
                value={newValue}
                onChange={(e) => {
                  setNewValue(e.target.value);

                  // Only validate email in real-time if form has been submitted
                  if (hasSubmitted) {
                    const result = contactSchemas[name].safeParse(
                      e.target.value,
                    );

                    if (!result.success) {
                      setErrorMessage(result.error.issues[0].message);
                    } else {
                      setErrorMessage(undefined);
                    }
                  } else if (hasSubmitted && name !== "Email") {
                    // Clear error message for non-email fields after submission
                    setErrorMessage(undefined);
                  }
                }}
              />
              <div role="alert">
                {errorMessage && (
                  <div className="flex flex-row gap-2">
                    <Icon variant="error" />
                    <span className="text-sm text-red-500">{errorMessage}</span>
                  </div>
                )}
              </div>
            </div>
          ) : newValue ? (
            <div className="flex flex-col gap-6">
              <span>{newValue}</span>
              {!isVerified && (
                <div className="flex flex-col gap-2">
                  <Notification variant="warning">
                    {`Uw ${label.toLocaleLowerCase()} is nog niet geverifieerd. U ontvangt nog geen notificaties. Er is een verificatiecode gestuurd naar ${newValue}.`}
                  </Notification>

                  <div className="flex flex-row items-center gap-3">
                    <label
                      htmlFor={`verificationCode-field-${name}-${id}`}
                      className="font-bold"
                    >
                      {"Verificatiecode:"}
                    </label>
                    <input
                      ref={inputRef}
                      id={`verificationCode-field-${name}-${id}`}
                      className="w-1/4 border border-gray-300 bg-white px-1"
                      placeholder="bv: 12345"
                      maxLength={5}
                      type="text"
                      value={verificationCode}
                      onChange={(e) => {
                        setVerificationCode(e.target.value);
                      }}
                    />
                    <ButtonBase
                      icon={<CheckCircleIcon />}
                      type="submit"
                      onClick={() => {
                        setVerificationSubmitted(true);
                      }}
                    >
                      Verifieer
                    </ButtonBase>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <span className="text-neutral-500 italic">Niet opgegeven</span>
          )}
        </div>
        <div>
          {fieldState !== "edit" ? (
            <ButtonBase
              icon={<EditIcon />}
              onClick={() => {
                setFieldState("edit");
                requestAnimationFrame(() => {
                  inputRef.current?.focus();
                });
              }}
            >
              Aanpassen
            </ButtonBase>
          ) : (
            <div className="flex flex-col gap-0">
              <ButtonBase type="submit">
                <span className="hover:underline">Opslaan</span>
              </ButtonBase>
              <ButtonBase
                type="button"
                onClick={() => {
                  setFieldState("view");
                  setHasSubmitted(false);
                  setErrorMessage(undefined);
                  // Fall back to the database-value on cancel
                  setNewValue(contactGegeven?.waarde || "");
                }}
              >
                <span className="hover:underline">Annuleren</span>
              </ButtonBase>
            </div>
          )}
        </div>
      </div>
    </form>
  );
};

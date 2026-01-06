"use client";
import { useRef, useState } from "react";
import { z } from "zod";
import { components } from "@/network/profiel/generated";
import {
  useUpdateOndernemengContactvoorkeur,
  useVerifyEmail,
} from "@/network/profiel/hooks/updateOndernemingEmail/useUpdateOndernemenEmail";
import { Icon } from "@/components/icons/infoIcon";
import Button from "@/components/button";
import { Notification } from "@/components/notifications";

const ButtonBase = ({
  className,
  onClick,
  children,
  type = "button",
}: {
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`ml-auto flex cursor-pointer items-center gap-2 hover:underline ${className}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        className="fill-current"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M9.6358 4.92524L7.07416 2.36279L0.813363 8.6244C0.740909 8.69685 0.684557 8.78299 0.64833 8.87557L0.0147632 11.7536C-0.0456148 11.909 0.0888269 12.0442 0.243395 11.9838L3.12624 11.3487C3.21802 11.3124 3.30416 11.2561 3.37581 11.1844L9.6358 4.92524Z"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M11.7639 2.79711L10.6465 3.91451L8.08569 1.35287L9.20228 0.235474C9.51705 -0.0784914 10.0266 -0.0784914 10.3406 0.235474L11.7639 1.65879C12.0787 1.97356 12.0787 2.48234 11.7639 2.79711Z"
        />
      </svg>
      {children}
    </button>
  );
};

const VerifyButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <ButtonBase type="submit" className={"text-neutral-500"} onClick={onClick}>
      <span>Verifieer</span>
    </ButtonBase>
  );
};

const EditButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <ButtonBase className={"text-primary"} onClick={onClick}>
      <span>Aanpassen</span>
    </ButtonBase>
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
  const [isEditing, setIsEditing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { mutate } = useUpdateOndernemengContactvoorkeur();
  const { mutate: verifyMutate } = useVerifyEmail();

  const [newValue, setNewValue] = useState(contactGegeven?.waarde || "");
  const [verificationCode, setVerificationCode] = useState("");

  const [mockVerified, setMockVerified] = useState(
    contactGegeven?.isGeverifieerd || false,
  );

  const id = contactGegeven?.id;

  return (
    <form
      className="flex flex-col gap-3"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        setHasSubmitted(true);

        if (isEditing) {
          if (newValue == null) return;

          // Validate email if the field type is Email
          const result = contactSchemas[name].safeParse(newValue);

          if (!result.success) {
            setErrorMessage(result.error.errors[0].message);
            inputRef.current?.focus();
            return;
          }

          // Clear any previous error messages
          setErrorMessage(undefined);

          mutate(
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
                setIsEditing(false);
              },
              onError: (error: Error) => {
                console.log(error);
              },
            },
          );
        } else if (isVerifying) {
          // This mutation succeeds, but does not actually do something on the server, so fake it with a state:
          setMockVerified(true);

          verifyMutate(
            {
              email: newValue,
              verificatiecode: verificationCode,
            },
            {
              onSuccess: () => {
                setIsVerifying(false);
              },
              onError: (error: Error) => {
                console.log(error);
              },
            },
          );
        }
      }}
    >
      {mockVerified && (
        <Notification
          variant="success"
          onClose={() => setMockVerified(false)}
        >{`Uw ${label.toLocaleLowerCase()} is succesvol geverifieerd.`}</Notification>
      )}
      <div className="grid grid-cols-[2fr_3fr_100px] items-start gap-4">
        <label htmlFor={`field-${name}-${id}`} className="font-bold">
          {label}
        </label>
        <div>
          {isEditing ? (
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
                      setErrorMessage(result.error.errors[0].message);
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
            <div className="flex flex-col gap-2">
              <span>{newValue}</span>
              {!isVerifying && !mockVerified && (
                <div className="flex flex-col gap-2">
                  <div className="flex flex-row gap-2">
                    <Icon variant="warning" />
                    <span className="text-sm text-orange-500">
                      {`Dit ${label.toLocaleLowerCase()} is nog niet geverifieerd.`}
                    </span>
                  </div>
                  <Button
                    onClick={() => setIsVerifying(true)}
                  >{`Stuur een verificatie-code`}</Button>
                </div>
              )}
            </div>
          ) : (
            <span className="text-neutral-500 italic">Niet opgegeven</span>
          )}
        </div>
        <div>
          {!isEditing ? (
            isVerifying ? (
              <div />
            ) : (
              <EditButton
                onClick={() => {
                  setIsEditing(true);
                  requestAnimationFrame(() => {
                    inputRef.current?.focus();
                  });
                }}
              />
            )
          ) : (
            <div className="flex flex-col gap-0">
              <button
                type="submit"
                className="ml-auto flex cursor-pointer flex-row gap-1 text-neutral-500"
              >
                <span className="hover:underline">Opslaan</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setHasSubmitted(false);
                  setErrorMessage(undefined);
                  // Fall back to the database-value on cancel
                  setNewValue(contactGegeven?.waarde || "");
                }}
                className="ml-auto flex cursor-pointer flex-row gap-1 text-neutral-500"
              >
                <span className="hover:underline">Annuleren</span>
              </button>
            </div>
          )}
        </div>

        {isVerifying && newValue ? (
          <>
            <label
              htmlFor={`verificationCode-field-${name}-${id}`}
              className="font-bold"
            >
              {"Verificatiecode"}
            </label>
            <div className="flex flex-col gap-2">
              <input
                ref={inputRef}
                id={`verificationCode-field-${name}-${id}`}
                className="w-1/2 border border-gray-300 bg-white p-1"
                placeholder="bv: 123456"
                type="text"
                value={verificationCode}
                onChange={(e) => {
                  setVerificationCode(e.target.value);
                }}
              />
              <div className="flex flex-row gap-2">
                <Icon variant="information" />
                <span className="text-primary text-sm">
                  {`Er is een verificatiecode gestuurd naar het ${label.toLocaleLowerCase()}.`}
                </span>
              </div>
            </div>
            <VerifyButton
              onClick={() => {
                setIsVerifying(true);
              }}
            />
          </>
        ) : null}
      </div>
    </form>
  );
};

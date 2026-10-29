"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { components } from "@/network/profiel/generated";
import { useUpdateVoorkeur } from "@/network/profiel/hooks/updateVoorkeur/useUpdateVoorkeur";
import { useUpdateOndernemengContactvoorkeur } from "@/network/profiel/hooks/updateOndernemingEmail/useUpdateOndernemenEmail";
import {
  ActionGroup,
  Alert,
  Button,
  DataSummary,
  DataSummaryItem,
  FormFieldTextInput,
  Icon,
  LinkButton,
  VisuallyHidden,
} from "@/components/rhc";
import {
  FormFieldSelect,
  SelectOption,
} from "@rijkshuisstijl-community/components-react";
import { LANGUAGES, languageLabel } from "@/components/languageSelect";
import { EmailVerification } from "@/app/(private)/contactgegevens/[type]/_emailVerification";

type Preference = components["schemas"]["VoorkeurResponse"];
type ContactDetail = components["schemas"]["ContactgegevenResponse"];

type Field = "salutation" | "language" | "email" | "phone";
type Values = Record<Field, string>;

const schemas = {
  email: z.string().email("Voer een geldig e-mailadres in"),
  phone: z
    .string() // could be stricter with a regex for Dutch numbers
    .min(8, "Voer een geldig Nederlands telefoonnummer in")
    .max(18, "Voer een geldig Nederlands telefoonnummer in"),
};

/**
 * The values the profile service stores for the website language, with the
 * language from the language menu whose name is shown.
 */
const LANGUAGE_VALUES: { value: string; lang: string }[] = [
  { value: "Nederlands", lang: "nl" },
  { value: "Engels", lang: "en" },
  { value: "Fries", lang: "fy" },
  { value: "Papiamento", lang: "pap-AW" },
  { value: "Papiamentu", lang: "pap-CW" },
];

/** Name from the language menu for a stored value; otherwise the value. */
const languageName = (value: string) => {
  const lang = LANGUAGE_VALUES.find((option) => option.value === value)?.lang;
  const language = LANGUAGES.find((option) => option.lang === lang);
  return language ? languageLabel(language) : value;
};

const NOT_SAVED = "Wij kunnen dit nu niet opslaan. Probeer het opnieuw.";

/**
 * Salutation, website language, e-mail address and phone number as one set:
 * one "Aanpassen" button at the top, and "Opslaan" and "Annuleren" below the
 * fields while editing. Saving only sends the fields that changed. A changed
 * e-mail address then has to be verified.
 */
export const ContactDetails = ({
  idenType,
  idenValue,
  salutation,
  language,
  email,
  phone,
}: {
  idenType: "KVK" | "BSN";
  idenValue: string;
  salutation?: Preference;
  language?: Preference;
  email?: ContactDetail;
  phone?: ContactDetail;
}) => {
  const queryClient = useQueryClient();
  const { mutateAsync: updatePreference } = useUpdateVoorkeur();
  const { mutateAsync: updateContact } = useUpdateOndernemengContactvoorkeur();

  const stored: Values = {
    salutation: salutation?.waarde ?? "",
    language: language?.waarde ?? "",
    email: email?.waarde ?? "",
    phone: phone?.waarde ?? "",
  };

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [values, setValues] = useState<Values>(stored);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [notice, setNotice] = useState<"saved" | "verified" | null>(null);
  // Only ask for verification after the address was actually changed.
  const [emailChanged, setEmailChanged] = useState(false);

  const editButtonRef = useRef<HTMLDivElement>(null);
  const salutationRef = useRef<HTMLInputElement>(null);
  const languageRef = useRef<HTMLSelectElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  // FormFieldSelect does not pass autoComplete on: set the purpose of the
  // language field on the select itself (WCAG 1.3.5).
  useEffect(() => {
    languageRef.current?.setAttribute("autocomplete", "language");
  }, [editing]);
  const focusField = (field: Field) =>
    ({
      salutation: salutationRef,
      language: languageRef,
      email: emailRef,
      phone: phoneRef,
    })[field].current?.focus();

  const focusEditButton = () =>
    requestAnimationFrame(() =>
      editButtonRef.current?.querySelector("button")?.focus(),
    );

  const startEditing = () => {
    setValues(stored);
    setErrors({});
    setNotice(null);
    setEditing(true);
    requestAnimationFrame(() => focusField("salutation"));
  };

  const cancel = () => {
    setEditing(false);
    setErrors({});
    focusEditButton();
  };

  const setValue = (field: Field, value: string) =>
    setValues((current) => ({ ...current, [field]: value }));

  const save = async (event: FormEvent) => {
    event.preventDefault();
    const changed = (Object.keys(values) as Field[]).filter(
      (field) => values[field] !== stored[field],
    );

    const invalid: Partial<Record<Field, string>> = {};
    for (const field of ["email", "phone"] as const) {
      if (!changed.includes(field)) continue;
      const result = schemas[field].safeParse(values[field]);
      if (!result.success) invalid[field] = result.error.issues[0].message;
    }
    if (Object.keys(invalid).length > 0) {
      setErrors(invalid);
      const first = (["email", "phone"] as const).find((f) => invalid[f]);
      if (first) focusField(first);
      return;
    }

    const identity = {
      identificatieNummer: idenValue,
      identificatieType: idenType,
    };
    const request = (field: Field) => {
      if (field === "salutation" || field === "language") {
        return updatePreference({
          ...identity,
          voorkeurType: field === "salutation" ? "Aanhef" : "WebsiteTaal",
          waarde: values[field],
          id: (field === "salutation" ? salutation : language)?.id,
        });
      }
      return updateContact({
        ...identity,
        body: {
          id: (field === "email" ? email : phone)?.id,
          type: field === "email" ? "Email" : "Telefoonnummer",
          waarde: values[field],
        },
      });
    };

    setSaving(true);
    const results = await Promise.allSettled(changed.map(request));
    const failed = changed.filter((_, i) => results[i].status === "rejected");
    if (changed.length > 0) {
      await queryClient.invalidateQueries({
        queryKey: ["profiel", idenType, idenValue],
      });
    }
    setSaving(false);

    if (changed.includes("email") && !failed.includes("email")) {
      setEmailChanged(true);
    }
    if (failed.length > 0) {
      setErrors(Object.fromEntries(failed.map((f) => [f, NOT_SAVED])));
      focusField(failed[0]);
      return;
    }
    setEditing(false);
    if (changed.length > 0) setNotice("saved");
    focusEditButton();
  };

  const showVerification =
    emailChanged && !email?.isGeverifieerd && !!email?.waarde && !editing;

  return (
    <div className="rhc-mox-row-gap">
      <div role="status">
        {notice && (
          <Alert type="ok" closable onClose={() => setNotice(null)}>
            {notice === "saved"
              ? "Uw gegevens zijn opgeslagen."
              : "Uw e-mailadres is bevestigd."}
          </Alert>
        )}
      </div>

      {editing ? (
        <form className="rhc-mox-row-gap" noValidate onSubmit={save}>
          <FormFieldTextInput
            label="Aanhef"
            inputRef={salutationRef}
            placeholder="bv: Geachte R. Vogel"
            value={values.salutation}
            invalid={!!errors.salutation}
            errorMessage={errors.salutation}
            onChange={(e) =>
              // The event comes from the input, but is typed on the wrapper.
              setValue("salutation", (e.target as HTMLInputElement).value)
            }
          />
          <FormFieldSelect
            label="Taalvoorkeur"
            selectRef={languageRef}
            value={values.language}
            invalid={!!errors.language}
            errorMessage={errors.language}
            onChange={(e) => setValue("language", e.target.value)}
          >
            <SelectOption value="">Selecteer een taal</SelectOption>
            {LANGUAGE_VALUES.map(({ value }) => (
              <SelectOption key={value} value={value}>
                {languageName(value)}
              </SelectOption>
            ))}
          </FormFieldSelect>
          <FormFieldTextInput
            label="E-mailadres"
            inputRef={emailRef}
            type="email"
            name="Email"
            autoComplete="email"
            value={values.email}
            invalid={!!errors.email}
            errorMessage={errors.email}
            onChange={(e) =>
              setValue("email", (e.target as HTMLInputElement).value)
            }
          />
          <FormFieldTextInput
            label="Telefoonnummer"
            inputRef={phoneRef}
            type="tel"
            name="Telefoonnummer"
            autoComplete="tel"
            value={values.phone}
            invalid={!!errors.phone}
            errorMessage={errors.phone}
            onChange={(e) =>
              setValue("phone", (e.target as HTMLInputElement).value)
            }
          />
          <ActionGroup direction="row">
            <Button
              appearance="primary-action-button"
              type="submit"
              disabled={saving}
            >
              Opslaan
            </Button>
            <Button appearance="secondary-action-button" onClick={cancel}>
              Annuleren
            </Button>
          </ActionGroup>
        </form>
      ) : (
        <>
          <div ref={editButtonRef}>
            <LinkButton inline onClick={startEditing}>
              <Icon icon="bewerken" />
              Aanpassen <VisuallyHidden>contactgegevens</VisuallyHidden>
            </LinkButton>
          </div>
          <DataSummary appearance="row">
            <DataSummaryItem
              itemKey="Aanhef"
              itemValue={stored.salutation || "Niet opgegeven"}
            />
            <DataSummaryItem
              itemKey="Taalvoorkeur"
              itemValue={
                stored.language
                  ? languageName(stored.language)
                  : "Niet opgegeven"
              }
            />
            <DataSummaryItem
              itemKey="E-mailadres"
              itemValue={stored.email || "Niet opgegeven"}
            />
            <DataSummaryItem
              itemKey="Telefoonnummer"
              itemValue={stored.phone || "Niet opgegeven"}
            />
          </DataSummary>
        </>
      )}

      {showVerification && email?.waarde && (
        <EmailVerification
          idenType={idenType}
          idenValue={idenValue}
          email={email.waarde}
          onVerified={() => {
            setEmailChanged(false);
            setNotice("verified");
          }}
        />
      )}
    </div>
  );
};

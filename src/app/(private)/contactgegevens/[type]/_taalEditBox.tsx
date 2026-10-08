"use client";

import { useRef, useState } from "react";
import { components } from "@/network/profiel/generated";
import { useUpdateVoorkeur } from "@/network/profiel/hooks/updateVoorkeur/useUpdateVoorkeur";
import {
  ActionGroup,
  Button,
  DataSummary,
  Icon,
  VisuallyHidden,
} from "@/components/rhc";
import {
  FormFieldSelect,
  SelectOption,
} from "@rijkshuisstijl-community/components-react";
import { useQueryClient } from "@tanstack/react-query";
import { EditBoxButton } from "@/app/(private)/contactgegevens/[type]/_editBoxButton";

const taalValues = [
  "Nederlands",
  "Engels",
  "Fries",
  "Papiamento",
  "Papiamentu",
] as const;

export const TaalEditBox = ({
  idenType,
  idenValue,
  voorkeur,
}: {
  idenType: "KVK" | "BSN";
  idenValue: string;
  voorkeur?: components["schemas"]["VoorkeurResponse"];
}) => {
  const [fieldState, setFieldState] = useState<"view" | "edit">("view");
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const selectRef = useRef<HTMLSelectElement>(null);
  const { mutate } = useUpdateVoorkeur();
  const queryClient = useQueryClient();

  const [newValue, setNewValue] = useState(voorkeur?.waarde || "");
  const [prevWaarde, setPrevWaarde] = useState(voorkeur?.waarde);
  if (voorkeur?.waarde !== prevWaarde) {
    setPrevWaarde(voorkeur?.waarde);
    setNewValue(voorkeur?.waarde || "");
  }

  return (
    <form
      className="mox-row-gap"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();

        if (fieldState !== "edit") return;

        setErrorMessage(undefined);
        mutate(
          {
            identificatieNummer: idenValue,
            identificatieType: idenType,
            voorkeurType: "WebsiteTaal",
            waarde: newValue,
            id: voorkeur?.id,
          },
          {
            onSuccess: () => {
              setFieldState("view");
              queryClient.invalidateQueries({
                queryKey: ["profiel", idenType, idenValue],
              });
            },
            onError: () => {
              setErrorMessage(
                "Er is een fout opgetreden bij het opslaan. Probeer het opnieuw.",
              );
              selectRef.current?.focus();
            },
          },
        );
      }}
    >
      {fieldState === "edit" ? (
        <>
          <FormFieldSelect
            label="Taalvoorkeur"
            selectRef={selectRef}
            value={newValue}
            invalid={!!errorMessage}
            errorMessage={errorMessage}
            onChange={(event) => setNewValue(event.target.value)}
          >
            <SelectOption value="">Selecteer een taal</SelectOption>
            {taalValues.map((taal) => (
              <SelectOption key={taal} value={taal}>
                {taal}
              </SelectOption>
            ))}
          </FormFieldSelect>
          <ActionGroup direction="row">
            <Button appearance="primary-action-button" type="submit">
              Opslaan
            </Button>
            <Button
              appearance="secondary-action-button"
              onClick={() => {
                setFieldState("view");
                setErrorMessage(undefined);
                setNewValue(voorkeur?.waarde || "");
              }}
            >
              Annuleren
            </Button>
          </ActionGroup>
        </>
      ) : (
        <DataSummary appearance="row">
          <div className="rhc-data-summary__item">
            <dt className="rhc-data-summary__item-key">Taalvoorkeur</dt>
            <dd className="rhc-data-summary__item-value">
              {newValue || "Niet opgegeven"}
            </dd>
            <dd className="rhc-data-summary__item-action">
              <EditBoxButton
                icon={<Icon icon="bewerken" />}
                onClick={() => {
                  setFieldState("edit");
                  requestAnimationFrame(() => selectRef.current?.focus());
                }}
              >
                Aanpassen
                <VisuallyHidden> taalvoorkeur</VisuallyHidden>
              </EditBoxButton>
            </dd>
          </div>
        </DataSummary>
      )}
    </form>
  );
};

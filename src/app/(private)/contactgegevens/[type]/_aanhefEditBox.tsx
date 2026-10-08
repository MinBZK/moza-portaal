"use client";

import { useRef, useState } from "react";
import { components } from "@/network/profiel/generated";
import { useUpdateVoorkeur } from "@/network/profiel/hooks/updateVoorkeur/useUpdateVoorkeur";
import {
  ActionGroup,
  Button,
  DataSummary,
  FormFieldTextInput,
  Icon,
  VisuallyHidden,
} from "@/components/rhc";
import { useQueryClient } from "@tanstack/react-query";
import { EditBoxButton } from "@/app/(private)/contactgegevens/[type]/_editBoxButton";

export const AanhefEditBox = ({
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
  const inputRef = useRef<HTMLInputElement>(null);
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
            voorkeurType: "Aanhef",
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
              inputRef.current?.focus();
            },
          },
        );
      }}
    >
      {fieldState === "edit" ? (
        <>
          <FormFieldTextInput
            label="Aanhef"
            inputRef={inputRef}
            placeholder="bv: Dhr. Jansen"
            value={newValue}
            invalid={!!errorMessage}
            errorMessage={errorMessage}
            onChange={(event) =>
              // Het event komt van het tekstveld, maar is getypt als dat van de wrapper.
              setNewValue((event.target as HTMLInputElement).value)
            }
          />
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
            <dt className="rhc-data-summary__item-key">Aanhef</dt>
            <dd className="rhc-data-summary__item-value">
              {newValue || "Niet opgegeven"}
            </dd>
            <dd className="rhc-data-summary__item-action">
              <EditBoxButton
                icon={<Icon icon="bewerken" />}
                onClick={() => {
                  setFieldState("edit");
                  requestAnimationFrame(() => inputRef.current?.focus());
                }}
              >
                Aanpassen
                <VisuallyHidden> aanhef</VisuallyHidden>
              </EditBoxButton>
            </dd>
          </div>
        </DataSummary>
      )}
    </form>
  );
};

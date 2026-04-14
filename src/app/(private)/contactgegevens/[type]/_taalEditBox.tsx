"use client";

import { useRef, useState } from "react";
import { components } from "@/network/profiel/generated";
import { useUpdateVoorkeur } from "@/network/profiel/hooks/updateVoorkeur/useUpdateVoorkeur";
import { EditIcon } from "@/components/icons/editIcon";
import { useQueryClient } from "@tanstack/react-query";
import { EditBoxButton } from "@/app/(private)/contactgegevens/[type]/_editBoxButton";

const taalOpties: components["schemas"]["Taal"][] = [
  "Nederlands",
  "Engels",
  "Fries",
  "Papiaments",
  "Nedersaksisch",
  "Limburgs",
];

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
      className="flex flex-col gap-3"
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
            },
          },
        );
      }}
    >
      <div className="grid grid-cols-[2fr_3fr_100px] items-start gap-4">
        <label htmlFor="field-taal" className="font-bold">
          Taalvoorkeur
        </label>
        <div>
          {fieldState === "edit" ? (
            <div className="flex flex-col gap-2">
              <select
                ref={selectRef}
                className="w-full border border-gray-300 bg-white p-1"
                id="field-taal"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
              >
                <option value="">Selecteer een taal</option>
                {taalOpties.map((taal) => (
                  <option key={taal} value={taal}>
                    {taal}
                  </option>
                ))}
              </select>
              {errorMessage && (
                <span className="text-sm text-red-500">{errorMessage}</span>
              )}
            </div>
          ) : newValue ? (
            <span>{newValue}</span>
          ) : (
            <span className="text-neutral-500 italic">Niet opgegeven</span>
          )}
        </div>
        <div>
          {fieldState !== "edit" ? (
            <EditBoxButton
              icon={<EditIcon />}
              onClick={() => {
                setFieldState("edit");
                requestAnimationFrame(() => selectRef.current?.focus());
              }}
            >
              Aanpassen
            </EditBoxButton>
          ) : (
            <div className="flex flex-col">
              <EditBoxButton type="submit">Opslaan</EditBoxButton>
              <EditBoxButton
                onClick={() => {
                  setFieldState("view");
                  setErrorMessage(undefined);
                  setNewValue(voorkeur?.waarde || "");
                }}
              >
                Annuleren
              </EditBoxButton>
            </div>
          )}
        </div>
      </div>
    </form>
  );
};

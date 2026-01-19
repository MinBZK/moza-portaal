"use client";
import { useState } from "react";
import { components } from "@/network/profiel/generated";
import { useUpdateOndernemengContactvoorkeur } from "@/network/profiel/hooks/updateOndernemingEmail/useUpdateOndernemenEmail";

const EditButton = ({
  onClick,
}: {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-primary flex cursor-pointer items-center gap-2"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        className="fill-primary"
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
      <span>Aanpassen</span>
    </button>
  );
};

export const ContactEditBox = ({
  id,
  label,
  name,
  value,
  idenType,
  idenValue,
}: {
  id?: number;
  name: components["schemas"]["ContactType"];
  label: string;
  value: string;
  idenType: "KVK" | "BSN";
  idenValue: string;
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const { mutate } = useUpdateOndernemengContactvoorkeur();

  const [newValue, setNewValue] = useState(value);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
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
              // setStatus("available");
            },
            onError: (error: Error) => {
              console.log(error);
            },
          },
        );
      }}
    >
      <div className="grid grid-cols-[2fr_3fr_100px] items-center gap-2">
        <span className="font-bold">{label}</span>
        <div>
          {isEditing ? (
            <input
              type="text"
              name={name}
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              className="w-full border border-gray-300 bg-white p-1"
            />
          ) : (
            newValue
          )}
        </div>
        <div>
          {!isEditing ? (
            <EditButton
              onClick={() => {
                setIsEditing(true);
              }}
            />
          ) : (
            <div className="flex flex-col gap-0">
              <button
                type="submit"
                className="ml-auto flex flex-row gap-1 text-neutral-500"
              >
                <span className="hover:underline">Opslaan</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                }}
                className="ml-auto flex flex-row gap-1 text-neutral-500"
              >
                <span className="hover:underline">Annuleren</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </form>
  );
};

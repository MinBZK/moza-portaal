"use client";
import { useState } from "react";

const AddButton = ({
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
        <path d="M11.0663 4.66667H7.33333V0.933667C7.33333 0.200667 6.733 0 6 0C5.267 0 4.66667 0.200667 4.66667 0.933667V4.66667H0.933667C0.200667 4.66667 0 5.267 0 6C0 6.733 0.200667 7.33333 0.933667 7.33333H4.66667V11.0663C4.66667 11.7993 5.267 12 6 12C6.733 12 7.33333 11.7993 7.33333 11.0663V7.33333H11.0663C11.7993 7.33333 12 6.733 12 6C12 5.267 11.7993 4.66667 11.0663 4.66667Z" />
      </svg>
      <span>Toevoegen</span>
    </button>
  );
};

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
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M9.6358 4.92524L7.07416 2.36279L0.813363 8.6244C0.740909 8.69685 0.684557 8.78299 0.64833 8.87557L0.0147632 11.7536C-0.0456148 11.909 0.0888269 12.0442 0.243395 11.9838L3.12624 11.3487C3.21802 11.3124 3.30416 11.2561 3.37581 11.1844L9.6358 4.92524Z"
        />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M11.7639 2.79711L10.6465 3.91451L8.08569 1.35287L9.20228 0.235474C9.51705 -0.0784914 10.0266 -0.0784914 10.3406 0.235474L11.7639 1.65879C12.0787 1.97356 12.0787 2.48234 11.7639 2.79711Z"
        />
      </svg>
      <span>Aanpassen</span>
    </button>
  );
};

export const ContactEditBox = ({
  label,
  name,
  value,
  initialStatus,
}: {
  name: string;
  label: string;
  value: string;
  initialStatus: "empty" | "available" | "editable";
}) => {
  const [status, setStatus] = useState(initialStatus);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setStatus("available");
      }}
    >
      <div className="grid grid-cols-[2fr_3fr_100px] items-center gap-2">
        <span className="font-bold">{label}</span>
        <div>
          {status === "editable" ? (
            <input
              type="text"
              name={name}
              value={value}
              className="w-full border border-gray-300 bg-white p-1"
            />
          ) : (
            status === "available" && value
          )}
        </div>
        <div>
          {status === "empty" && (
            <AddButton
              onClick={() => {
                setStatus("editable");
              }}
            />
          )}
          {status === "available" && (
            <EditButton
              onClick={() => {
                setStatus("editable");
              }}
            />
          )}
          {status === "editable" && (
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
                  setStatus("available");
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

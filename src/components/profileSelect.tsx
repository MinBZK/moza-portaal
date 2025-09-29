import { updateKvkCookie } from "@/utils/kvknummer";
import { profiles } from "@/utils/profiles";
import { useCookie } from "@/utils/useCookie";
import React, { useEffect, useRef, useState } from "react";
import { AvatarIcon } from "./icons/avatarIcon";
import ChevronIcon from "./icons/chevronIcon";

const ProfileSelect = ({ selectedKvK }: { selectedKvK: string }) => {
  const [selectedProfile, setSelectedProfile] = useState(
    profiles.find((p) => p.kvk == selectedKvK),
  );
  const [open, setOpen] = useState(false);
  const { get } = useCookie("loginMethod");

  const loginMethod = get();

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutSideClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node) && open) {
        setOpen(false);
      }
    };

    window.addEventListener("mousedown", handleOutSideClick);

    return () => {
      window.removeEventListener("mousedown", handleOutSideClick);
    };
  }, [ref, open]);

  if (loginMethod === "eherkenning") {
    // In eHernning mode, you can only have one active company-profile
    return (
      <div className="flex flex-row gap-2">
        <AvatarIcon className="stroke-primary" />
        <span className="font-semibold">{selectedProfile?.name}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-row items-center gap-2">
      <div className="w-100" ref={ref}>
        <button
          type="button"
          className="border-primary flex cursor-pointer items-center gap-2 justify-self-end rounded-lg border p-2"
          onClick={() => setOpen(!open)}
        >
          <AvatarIcon className="stroke-primary" />
          <span className="font-semibold">{selectedProfile?.name}</span>
          <ChevronIcon
            className={`h-4 transition-transform`}
            style={{ rotate: open ? "270deg" : "90deg" }}
          />
        </button>

        {open && (
          <div className="absolute z-10 w-100 rounded-b-lg border border-gray-600 bg-white shadow-lg">
            {profiles.map((profile) => (
              <div
                key={profile.kvk}
                onClick={() => {
                  setSelectedProfile(profile);
                  setOpen(false);
                  updateKvkCookie(profile.kvk);
                }}
                className={`cursor-pointer p-4 hover:bg-blue-50 ${
                  selectedProfile?.kvk === profile.kvk
                    ? "border-l-4 border-blue-500 bg-blue-100"
                    : ""
                }`}
              >
                <div className="mb-1 flex flex-row items-baseline justify-between gap-2">
                  <span className="font-semibold">{profile.name}</span>
                  <span className="text-sm text-gray-600">
                    {`KVK: ${profile.kvk}`}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{profile.description}</p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  {profile.flags.map((flag, i) => (
                    <span
                      key={i}
                      className="rounded-full bg-blue-100 px-2 py-0.5 text-blue-800"
                    >
                      {flag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSelect;

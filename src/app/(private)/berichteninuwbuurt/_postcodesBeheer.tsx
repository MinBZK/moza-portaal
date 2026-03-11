"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import { useGetProfielInformation } from "@/network/profiel/hooks/getProfielInformation/useGetProfielInformation";
import { useAddPostcodeVoorkeur } from "@/network/profiel/hooks/addPostcodeVoorkeur/useAddPostcodeVoorkeur";
import { useDeletePostcodeVoorkeur } from "@/network/profiel/hooks/deletePostcodeVoorkeur/useDeletePostcodeVoorkeur";

const POSTCODE_REGEX = /^[1-9][0-9]{3}(\s?[A-Za-z]{2})?$/;
const MAX_POSTCODES = 10;

const normalizePostcode = (pc: string) =>
  pc.toUpperCase().replace(/\s/g, "");

const PostcodesBeheer = () => {
  const { data: session, status: sessionStatus } = useSession();
  const kvkNummer = session?.user?.bsn;
  const queryClient = useQueryClient();

  const { data: profielData, status: profielStatus } =
    useGetProfielInformation("KVK", kvkNummer ?? "");

  const addMutation = useAddPostcodeVoorkeur();
  const deleteMutation = useDeletePostcodeVoorkeur();

  const [newPostcode, setNewPostcode] = useState("");
  const [error, setError] = useState("");

  const voorkeuren = profielData?.data?.voorkeuren ?? [];
  const postcodeVoorkeuren = voorkeuren.filter(
    (v) => v.voorkeurType === "PostcodeInUwBuurt",
  );

  if (sessionStatus === "loading" || profielStatus === "pending") return null;

  const handleAdd = () => {
    setError("");
    const normalized = normalizePostcode(newPostcode);

    if (!POSTCODE_REGEX.test(newPostcode)) {
      setError("Voer een geldige postcode in (bijv. 1234 of 1234AB).");
      return;
    }

    if (postcodeVoorkeuren.some((v) => v.waarde === normalized)) {
      setError("Deze postcode is al toegevoegd.");
      return;
    }

    if (postcodeVoorkeuren.length >= MAX_POSTCODES) {
      setError(`U kunt maximaal ${MAX_POSTCODES} postcodes toevoegen.`);
      return;
    }

    addMutation.mutate(
      {
        identificatieNummer: kvkNummer!,
        identificatieType: "KVK",
        postcode: normalized,
      },
      {
        onSuccess: () => {
          setNewPostcode("");
          queryClient.invalidateQueries({ queryKey: ["profiel"] });
        },
      },
    );
  };

  const handleDelete = (voorkeurId: number) => {
    deleteMutation.mutate(
      {
        identificatieNummer: kvkNummer!,
        identificatieType: "KVK",
        voorkeurId,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["profiel"] });
        },
      },
    );
  };

  return (
    <div>
      <h2 className="text-2xl font-bold">Uw postcodes</h2>
      <p className="mt-1 text-sm text-neutral-600">
        Voeg postcodes toe om berichten in die omgeving te zien.
      </p>
      {postcodeVoorkeuren.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {postcodeVoorkeuren.map((v) => (
            <span
              key={v.id}
              className="inline-flex items-center gap-1 rounded bg-neutral-100 px-3 py-1 font-mono text-sm"
            >
              {v.waarde}
              <button
                onClick={() => handleDelete(v.id!)}
                disabled={deleteMutation.isPending}
                className="ml-1 text-neutral-400 hover:text-red-600 disabled:opacity-50"
                title="Verwijderen"
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="mt-3 flex gap-2">
        <input
          type="text"
          value={newPostcode}
          onChange={(e) => setNewPostcode(e.target.value)}
          placeholder="1234AB"
          maxLength={7}
          className="w-32 rounded border border-neutral-300 px-3 py-1.5 text-sm"
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <button
          onClick={handleAdd}
          disabled={addMutation.isPending}
          className="rounded bg-[#007bc7] px-3 py-1.5 text-sm text-white hover:bg-[#005e9e] disabled:opacity-50"
        >
          Toevoegen
        </button>
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default PostcodesBeheer;

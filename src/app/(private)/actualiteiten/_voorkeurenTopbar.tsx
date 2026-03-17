"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useGetProfielInformation } from "@/network/profiel/hooks/getProfielInformation/useGetProfielInformation";
import { useAddOnderwerpVoorkeur } from "@/network/profiel/hooks/addOnderwerpVoorkeur/useAddOnderwerpVoorkeur";
import { useDeleteOnderwerpVoorkeur } from "@/network/profiel/hooks/deleteOnderwerpVoorkeur/useDeleteOnderwerpVoorkeur";
import { SUBJECT_GROUPS, VOORKEUR_TYPE_ONDERWERP } from "./_voorkeurenBeheer";

const ALL_SUBJECTS = SUBJECT_GROUPS.flatMap((g) => g.subjects);

const VoorkeurenTopbar = ({ kvkNummer }: { kvkNummer: string }) => {
  const queryClient = useQueryClient();

  const { data: profielData, status: profielStatus } =
    useGetProfielInformation("KVK", kvkNummer);

  const addMutation = useAddOnderwerpVoorkeur();
  const deleteMutation = useDeleteOnderwerpVoorkeur();

  const voorkeuren = profielData?.data?.voorkeuren ?? [];
  const onderwerpVoorkeuren = voorkeuren.filter(
    (v) => v.voorkeurType === VOORKEUR_TYPE_ONDERWERP,
  );
  const selectedSubjects = onderwerpVoorkeuren
    .map((v) => v.waarde!)
    .filter(Boolean);

  const isMutating = addMutation.isPending || deleteMutation.isPending;

  const handleAdd = (subject: string) => {
    addMutation.mutate(
      {
        identificatieNummer: kvkNummer,
        identificatieType: "KVK",
        onderwerp: subject,
      },
      {
        onSuccess: () =>
          queryClient.invalidateQueries({ queryKey: ["profiel"] }),
      },
    );
  };

  const handleDelete = (voorkeurId: number) => {
    deleteMutation.mutate(
      {
        identificatieNummer: kvkNummer,
        identificatieType: "KVK",
        voorkeurId,
      },
      {
        onSuccess: () =>
          queryClient.invalidateQueries({ queryKey: ["profiel"] }),
      },
    );
  };

  if (!kvkNummer || profielStatus === "pending") return null;

  const availableSubjects = ALL_SUBJECTS.filter(
    (s) => !selectedSubjects.includes(s),
  );

  return (
    <div className="space-y-3">
      {onderwerpVoorkeuren.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {onderwerpVoorkeuren.map((v) =>
            v.id != null ? (
              <span
                key={v.id}
                className="inline-flex items-center gap-1 rounded-full bg-[#d9ebf7] px-3 py-1 text-sm text-[#154273]"
              >
                {v.waarde}
                <button
                  onClick={() => handleDelete(v.id!)}
                  disabled={isMutating}
                  className="ml-1 text-[#154273]/50 hover:text-red-600 disabled:opacity-50"
                  title="Verwijderen"
                >
                  &times;
                </button>
              </span>
            ) : null,
          )}
        </div>
      )}

      {availableSubjects.length > 0 && (
        <div>
          <label className="mb-1 block text-sm font-semibold text-neutral-500">
            Onderwerp toevoegen
          </label>
          <select
            className="rounded border border-neutral-300 px-3 py-1.5 text-sm"
            value=""
            onChange={(e) => {
              if (e.target.value) handleAdd(e.target.value);
            }}
          >
            <option value="">Kies een onderwerp...</option>
            {SUBJECT_GROUPS.map((group) => {
              const available = group.subjects.filter((s) =>
                availableSubjects.includes(s),
              );
              if (available.length === 0) return null;
              return (
                <optgroup key={group.label} label={group.label}>
                  {available.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </optgroup>
              );
            })}
          </select>
        </div>
      )}
    </div>
  );
};

export default VoorkeurenTopbar;

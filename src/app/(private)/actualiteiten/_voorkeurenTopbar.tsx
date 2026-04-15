"use client";

import { useGetVoorkeuren } from "@/network/actualiteiten/hooks/getVoorkeuren/useGetVoorkeuren";
import { useAddOnderwerpVoorkeur } from "@/network/actualiteiten/hooks/addOnderwerpVoorkeur/useAddOnderwerpVoorkeur";
import { useDeleteOnderwerpVoorkeur } from "@/network/actualiteiten/hooks/deleteOnderwerpVoorkeur/useDeleteOnderwerpVoorkeur";
import { SUBJECT_GROUPS, ALL_SUBJECTS } from "./_subjectGroups";

const VoorkeurenTopbar = ({ kvkNummer }: { kvkNummer: string }) => {
  const { data: voorkeuren, status: voorkeurenStatus } = useGetVoorkeuren(
    "KVK",
    kvkNummer,
  );

  const addMutation = useAddOnderwerpVoorkeur();
  const deleteMutation = useDeleteOnderwerpVoorkeur();

  const onderwerpVoorkeuren = voorkeuren?.onderwerpen ?? [];
  const selectedSubjects = onderwerpVoorkeuren
    .map((v) => v.onderwerp!)
    .filter(Boolean);

  const isMutating = addMutation.isPending || deleteMutation.isPending;

  const handleAdd = (subject: string) =>
    addMutation.mutate({
      identificatieType: "KVK",
      identificatieNummer: kvkNummer,
      onderwerp: subject,
    });

  const handleDelete = (id: number) =>
    deleteMutation.mutate({
      identificatieType: "KVK",
      identificatieNummer: kvkNummer,
      id,
    });

  if (!kvkNummer || voorkeurenStatus === "pending") return null;

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
                {v.onderwerp}
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

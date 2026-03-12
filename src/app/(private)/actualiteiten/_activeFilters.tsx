"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useGetProfielInformation } from "@/network/profiel/hooks/getProfielInformation/useGetProfielInformation";
import { useDeleteOnderwerpVoorkeur } from "@/network/profiel/hooks/deleteOnderwerpVoorkeur/useDeleteOnderwerpVoorkeur";
import { VOORKEUR_TYPE_ONDERWERP } from "./_voorkeurenBeheer";

const ActiveFilters = ({ kvkNummer }: { kvkNummer: string }) => {
  const queryClient = useQueryClient();

  const { data: profielData, status: profielStatus } =
    useGetProfielInformation("KVK", kvkNummer);

  const deleteMutation = useDeleteOnderwerpVoorkeur();

  const voorkeuren = profielData?.data?.voorkeuren ?? [];
  const onderwerpVoorkeuren = voorkeuren.filter(
    (v) => v.voorkeurType === VOORKEUR_TYPE_ONDERWERP && v.id != null,
  );

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

  const handleDeleteAll = async () => {
    for (const v of onderwerpVoorkeuren) {
      await deleteMutation.mutateAsync({
        identificatieNummer: kvkNummer,
        identificatieType: "KVK",
        voorkeurId: v.id!,
      });
    }
    queryClient.invalidateQueries({ queryKey: ["profiel"] });
  };

  if (
    !kvkNummer ||
    profielStatus === "pending" ||
    onderwerpVoorkeuren.length === 0
  )
    return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {onderwerpVoorkeuren.map((v) => (
        <button
          key={v.id}
          onClick={() => handleDelete(v.id!)}
          disabled={deleteMutation.isPending}
          className="inline-flex items-center gap-1 rounded bg-[#d9ebf7] px-2.5 py-1 text-xs font-medium text-[#154273] hover:bg-[#b8d4ec] disabled:opacity-50"
        >
          {v.waarde}
          <span aria-hidden="true">&times;</span>
        </button>
      ))}
      <button
        onClick={handleDeleteAll}
        disabled={deleteMutation.isPending}
        className="text-xs font-medium text-neutral-500 underline underline-offset-2 hover:text-red-600 disabled:opacity-50"
      >
        Alles wissen
      </button>
    </div>
  );
};

export default ActiveFilters;

"use client";

import { useGetVoorkeuren } from "@/network/actualiteiten/hooks/getVoorkeuren/useGetVoorkeuren";
import { useDeleteOnderwerpVoorkeur } from "@/network/actualiteiten/hooks/deleteOnderwerpVoorkeur/useDeleteOnderwerpVoorkeur";

const ActiveFilters = () => {
  const { data: voorkeuren, status: voorkeurenStatus } = useGetVoorkeuren();

  const deleteMutation = useDeleteOnderwerpVoorkeur();

  const onderwerpVoorkeuren = voorkeuren?.onderwerpen ?? [];

  const handleDelete = (id: number) => deleteMutation.mutate({ id });

  const handleDeleteAll = async () => {
    for (const v of onderwerpVoorkeuren) {
      await deleteMutation.mutateAsync({ id: v.id });
    }
  };

  if (voorkeurenStatus === "pending" || onderwerpVoorkeuren.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {onderwerpVoorkeuren.map((v) => (
        <button
          key={v.id}
          onClick={() => handleDelete(v.id)}
          disabled={deleteMutation.isPending}
          className="inline-flex items-center gap-1 rounded bg-[#d9ebf7] px-2.5 py-1 text-xs font-medium text-[#154273] hover:bg-[#b8d4ec] disabled:opacity-50"
        >
          {v.onderwerp}
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

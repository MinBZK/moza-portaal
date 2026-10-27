"use client";

import { ActionGroup, Button, Icon, VisuallyHidden } from "@/components/rhc";
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
    <ActionGroup role="group" aria-label="Gekozen onderwerpen" direction="row">
      {onderwerpVoorkeuren.map((v) => (
        <Button
          key={v.id}
          appearance="secondary-action-button"
          onClick={() => handleDelete(v.id)}
          disabled={deleteMutation.isPending}
        >
          {v.onderwerp}
          <VisuallyHidden>verwijderen</VisuallyHidden>
          <Icon icon="kruis" />
        </Button>
      ))}
      <Button
        appearance="subtle-button"
        onClick={handleDeleteAll}
        disabled={deleteMutation.isPending}
      >
        Alles wissen
      </Button>
    </ActionGroup>
  );
};

export default ActiveFilters;

"use client";

import { ActionGroup, Button, Icon, VisuallyHidden } from "@/components/rhc";
import {
  FormFieldSelect,
  SelectOption,
} from "@rijkshuisstijl-community/components-react";
import { useGetVoorkeuren } from "@/network/actualiteiten/hooks/getVoorkeuren/useGetVoorkeuren";
import { useAddOnderwerpVoorkeur } from "@/network/actualiteiten/hooks/addOnderwerpVoorkeur/useAddOnderwerpVoorkeur";
import { useDeleteOnderwerpVoorkeur } from "@/network/actualiteiten/hooks/deleteOnderwerpVoorkeur/useDeleteOnderwerpVoorkeur";
import { SUBJECT_GROUPS, ALL_SUBJECTS } from "./_subjectGroups";

const VoorkeurenTopbar = () => {
  const { data: voorkeuren, status: voorkeurenStatus } = useGetVoorkeuren();

  const addMutation = useAddOnderwerpVoorkeur();
  const deleteMutation = useDeleteOnderwerpVoorkeur();

  const onderwerpVoorkeuren = voorkeuren?.onderwerpen ?? [];
  const selectedSubjects = onderwerpVoorkeuren.map((v) => v.onderwerp);

  const isMutating = addMutation.isPending || deleteMutation.isPending;

  const handleAdd = (subject: string) =>
    addMutation.mutate({ onderwerp: subject });

  const handleDelete = (id: number) => deleteMutation.mutate({ id });

  if (voorkeurenStatus === "pending") return null;

  const availableSubjects = ALL_SUBJECTS.filter(
    (s) => !selectedSubjects.includes(s),
  );

  return (
    <>
      {onderwerpVoorkeuren.length > 0 && (
        <ActionGroup
          role="group"
          aria-label="Gekozen onderwerpen"
          direction="row"
        >
          {onderwerpVoorkeuren.map((v) => (
            <Button
              key={v.id}
              appearance="secondary-action-button"
              onClick={() => handleDelete(v.id)}
              disabled={isMutating}
            >
              {v.onderwerp}
              <VisuallyHidden>verwijderen</VisuallyHidden>
              <Icon icon="kruis" />
            </Button>
          ))}
        </ActionGroup>
      )}

      {availableSubjects.length > 0 && (
        <FormFieldSelect
          label="Onderwerp toevoegen"
          value=""
          onChange={(e) => {
            if (e.target.value) handleAdd(e.target.value);
          }}
        >
          <SelectOption value="">Kies een onderwerp...</SelectOption>
          {SUBJECT_GROUPS.map((group) => {
            const available = group.subjects.filter((s) =>
              availableSubjects.includes(s),
            );
            if (available.length === 0) return null;
            return (
              <optgroup key={group.label} label={group.label}>
                {available.map((subject) => (
                  <SelectOption key={subject} value={subject}>
                    {subject}
                  </SelectOption>
                ))}
              </optgroup>
            );
          })}
        </FormFieldSelect>
      )}
    </>
  );
};

export default VoorkeurenTopbar;

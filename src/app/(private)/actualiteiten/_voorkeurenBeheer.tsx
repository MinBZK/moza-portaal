"use client";

import { useState } from "react";
import {
  Fieldset,
  FormFieldCheckboxOption,
  NumberBadge,
  VisuallyHidden,
} from "@/components/rhc";
import { useGetVoorkeuren } from "@/network/actualiteiten/hooks/getVoorkeuren/useGetVoorkeuren";
import { useAddOnderwerpVoorkeur } from "@/network/actualiteiten/hooks/addOnderwerpVoorkeur/useAddOnderwerpVoorkeur";
import { useDeleteOnderwerpVoorkeur } from "@/network/actualiteiten/hooks/deleteOnderwerpVoorkeur/useDeleteOnderwerpVoorkeur";
import {
  SUBJECT_GROUPS,
  SECTION_LABELS,
  type SectionKey,
} from "./_subjectGroups";

const VoorkeurenSidebar = ({
  visibleSections,
  onToggleSection,
  sectionCounts,
  subjectCounts,
}: {
  visibleSections: Record<SectionKey, boolean>;
  onToggleSection: (key: SectionKey) => void;
  sectionCounts: Record<SectionKey, number | null>;
  subjectCounts: Record<string, number | null>;
}) => {
  const { data: voorkeuren, status: voorkeurenStatus } = useGetVoorkeuren();

  const addMutation = useAddOnderwerpVoorkeur();
  const deleteMutation = useDeleteOnderwerpVoorkeur();

  const onderwerpVoorkeuren = voorkeuren?.onderwerpen ?? [];
  const selectedSubjects = onderwerpVoorkeuren.map((v) => v.onderwerp);

  const isMutating = addMutation.isPending || deleteMutation.isPending;

  const handleToggle = (subject: string) => {
    const existing = onderwerpVoorkeuren.find((v) => v.onderwerp === subject);
    if (existing) {
      deleteMutation.mutate({ id: existing.id });
    } else {
      addMutation.mutate({ onderwerp: subject });
    }
  };

  if (voorkeurenStatus === "pending") return null;

  return (
    <nav aria-label="Filters">
      <Fieldset legend="Secties">
        {(Object.keys(SECTION_LABELS) as SectionKey[]).map((key) => {
          const count = sectionCounts[key];
          return (
            <FormFieldCheckboxOption
              key={key}
              label={
                count !== null
                  ? `${SECTION_LABELS[key]} (${count})`
                  : SECTION_LABELS[key]
              }
              checked={visibleSections[key]}
              onChange={() => onToggleSection(key)}
            />
          );
        })}
      </Fieldset>

      <Fieldset legend="Onderwerpen">
        {SUBJECT_GROUPS.map((group) => (
          <FilterGroup
            key={group.label}
            label={group.label}
            subjects={group.subjects}
            selectedSubjects={selectedSubjects}
            onToggle={handleToggle}
            disabled={isMutating}
            subjectCounts={subjectCounts}
          />
        ))}
      </Fieldset>
    </nav>
  );
};

function FilterGroup({
  label,
  subjects,
  selectedSubjects,
  onToggle,
  disabled,
  subjectCounts,
}: {
  label: string;
  subjects: string[];
  selectedSubjects: string[];
  onToggle: (subject: string) => void;
  disabled: boolean;
  subjectCounts: Record<string, number | null>;
}) {
  const activeCount = subjects.filter((s) =>
    selectedSubjects.includes(s),
  ).length;
  const [open, setOpen] = useState(activeCount > 0);

  return (
    <details open={open} onToggle={(e) => setOpen(e.currentTarget.open)}>
      <summary>
        {label}
        {activeCount > 0 && (
          <>
            {" "}
            <NumberBadge>{activeCount}</NumberBadge>
            <VisuallyHidden>gekozen</VisuallyHidden>
          </>
        )}
      </summary>
      {subjects.map((subject) => {
        const count = subjectCounts[subject];
        return (
          <FormFieldCheckboxOption
            key={subject}
            label={count != null ? `${subject} (${count})` : subject}
            checked={selectedSubjects.includes(subject)}
            onChange={() => onToggle(subject)}
            disabled={disabled}
          />
        );
      })}
    </details>
  );
}

export default VoorkeurenSidebar;

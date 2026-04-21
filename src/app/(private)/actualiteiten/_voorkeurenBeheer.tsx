"use client";

import { useState } from "react";
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
    <nav className="space-y-1" aria-label="Filters">
      <h2 className="mb-2 text-lg font-bold text-[#154273]">Secties</h2>
      <div className="mb-4 space-y-1 border-b border-neutral-200 pb-4">
        {(Object.keys(SECTION_LABELS) as SectionKey[]).map((key) => {
          const count = sectionCounts[key];
          return (
            <label
              key={key}
              className="relative flex cursor-pointer items-center gap-2 rounded py-1 pl-1 pr-9 text-sm text-neutral-700 hover:bg-neutral-50"
            >
              <input
                type="checkbox"
                checked={visibleSections[key]}
                onChange={() => onToggleSection(key)}
                className="h-4 w-4 shrink-0 rounded border-neutral-300 text-[#007bc7] accent-[#007bc7]"
              />
              <span className={visibleSections[key] ? "font-medium text-[#154273]" : ""}>
                {SECTION_LABELS[key]}
              </span>
              <span className="absolute right-0 w-8 text-right text-xs text-neutral-600">{count ?? ""}</span>
            </label>
          );
        })}
      </div>

      <h2 className="mb-3 text-lg font-bold text-[#154273]">Onderwerpen</h2>

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
    <div className="border-b border-neutral-200">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-2.5 text-left text-sm font-semibold text-neutral-800 hover:text-[#154273]"
      >
        <span>
          {label}
          {activeCount > 0 && (
            <span className="ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#007bc7] text-xs font-bold text-white">
              {activeCount}
            </span>
          )}
        </span>
        <svg
          className={`h-4 w-4 shrink-0 text-neutral-400 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="space-y-1 pb-3">
          {subjects.map((subject) => {
            const checked = selectedSubjects.includes(subject);
            const count = subjectCounts[subject];
            return (
              <label
                key={subject}
                className="relative flex cursor-pointer items-center gap-2 rounded py-1 pl-1 pr-9 text-sm text-neutral-700 hover:bg-neutral-50"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(subject)}
                  disabled={disabled}
                  className="h-4 w-4 shrink-0 rounded border-neutral-300 text-[#007bc7] accent-[#007bc7] disabled:opacity-50"
                />
                <span className={checked ? "font-medium text-[#154273]" : ""}>
                  {subject}
                </span>
                <span className="absolute right-0 w-8 text-right text-xs text-neutral-600">{count ?? ""}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default VoorkeurenSidebar;

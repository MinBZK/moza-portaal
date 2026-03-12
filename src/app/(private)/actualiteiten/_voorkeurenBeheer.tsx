"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useGetProfielInformation } from "@/network/profiel/hooks/getProfielInformation/useGetProfielInformation";
import { useAddOnderwerpVoorkeur } from "@/network/profiel/hooks/addOnderwerpVoorkeur/useAddOnderwerpVoorkeur";
import { useDeleteOnderwerpVoorkeur } from "@/network/profiel/hooks/deleteOnderwerpVoorkeur/useDeleteOnderwerpVoorkeur";

export const SUBJECT_GROUPS: { label: string; subjects: string[] }[] = [
  {
    label: "Personeel",
    subjects: [
      "Personeel",
      "Personeel aannemen en inhuren",
      "Personeel ontslaan",
      "Arbeidsvoorwaarden",
      "Arbeidsomstandigheden en ziekte",
      "Loon en vergoedingen",
      "Buitenlands personeel",
      "Identiteit van uw personeel",
    ],
  },
  {
    label: "Bedrijfsvoering",
    subjects: [
      "Bedrijfsvoering",
      "Administratie",
      "Juridische zaken",
      "Verzekeringen en uitkeringen",
      "Beveiliging en preventie",
    ],
  },
  {
    label: "Belastingen en financiën",
    subjects: ["Belastingen en heffingen"],
  },
  {
    label: "Internationaal ondernemen",
    subjects: [
      "Internationaal ondernemen",
      "Exporteren",
      "Importeren",
      "Zakelijk vervoer en logistiek",
    ],
  },
  {
    label: "Duurzaamheid en omgeving",
    subjects: [
      "Klimaat, energie en natuur",
      "Energie",
      "Omgevingswet",
      "Bedrijfshuisvesting",
    ],
  },
  {
    label: "Product, dienst en innovatie",
    subjects: [
      "Product, dienst en innovatie",
      "Productveiligheid en verpakking",
      "Verkoopvoorwaarden en reclame",
    ],
  },
  {
    label: "Bedrijf starten of stoppen",
    subjects: [
      "Bedrijf starten of overnemen",
      "Bedrijf stoppen of overdragen",
      "Bedrijf stoppen of failliet gaan",
    ],
  },
];

export const VOORKEUR_TYPE_ONDERWERP = "ActueleOnderwerpVoorkeur" as const;

export type SectionKey = "berichten" | "informatie" | "regelgeving" | "subsidies";

export const SECTION_LABELS: Record<SectionKey, string> = {
  berichten: "Berichten over uw buurt",
  informatie: "Informatie",
  regelgeving: "Wetten en regelgeving",
  subsidies: "Subsidies en financiering",
};

const VoorkeurenSidebar = ({
  kvkNummer,
  visibleSections,
  onToggleSection,
  sectionCounts,
  subjectCounts,
}: {
  kvkNummer: string;
  visibleSections: Record<SectionKey, boolean>;
  onToggleSection: (key: SectionKey) => void;
  sectionCounts: Record<SectionKey, number | null>;
  subjectCounts: Record<string, number | null>;
}) => {
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

  const handleToggle = (subject: string) => {
    const existing = onderwerpVoorkeuren.find((v) => v.waarde === subject);
    if (existing && existing.id != null) {
      deleteMutation.mutate(
        {
          identificatieNummer: kvkNummer,
          identificatieType: "KVK",
          voorkeurId: existing.id,
        },
        {
          onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ["profiel"] }),
        },
      );
    } else {
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
    }
  };

  if (!kvkNummer || profielStatus === "pending") return null;

  return (
    <nav className="space-y-1" aria-label="Filters">
      {/* Section visibility toggles */}
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

      {/* Collapsible filter groups */}
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
